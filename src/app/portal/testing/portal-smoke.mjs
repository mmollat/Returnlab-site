// Run: node src/app/portal/testing/portal-smoke.mjs (uses only synthetic data).
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";

const companyA = "cfa2b820-ca94-400e-a5ef-691c743bf950";
const companyB = "d57dccb1-0a53-4a32-a517-f0fe69f39494";
const companyCth = "dcd16e78-3ac5-4ade-99d5-72298dcaeaf9";
const accounts = {
  "fixture-cth": { id: "user-cth", email: "private@example.test", company: companyCth },
  "fixture-alpha": { id: "user-alpha", email: "alpha@example.test", company: companyA },
  "fixture-bravo": { id: "user-bravo", email: "bravo@example.test", company: companyB },
  "fixture-unapproved": { id: "user-charlie", email: "charlie@example.test" },
  "fixture-mismatch": { id: "user-other", email: "alpha@example.test", company: companyA },
};
let alphaActive = true;
let databaseReads = 0;
let instructionAttempts = 0;
const errors = [];
const row = (returnId, inspected, photoId, qty = 1, extra = {}) => ({
  id: String(photoId),
  merchant_return_id: returnId, date_received: "2026-11-27", storage_until:"2026-12-27", status: inspected ? "On Hold" : "Received",
  outbound_status: null, returnlab_client_instructions: null,
  item_sku: "SAMPLE", qty, condition: "Like New", inspection_outcome: inspected ? "Approved for resale" : null,
  inspected_at: inspected ? "2026-11-28T00:00:00.000Z" : null,
  client_summary: inspected ? "Original packaging intact." : null,
  returnlab_return_photos: [{ id: photoId, photo_category: "Packaging" }],
  ...extra,
});
const data = {
  [companyA]: [
    row("ALPHA-100", true, 101, 3), row("ALPHA-200", false, 102, 2),
    row("ALPHA-CLOSED", true, 103, 4, {
      status: "Disposed", returnlab_client_instructions: { instruction: "disposal_authorized", submitted_at: "2026-11-28T00:00:00Z" },
    }),
    row("ALPHA-HIDDEN", true, 104, 5, { status: "Completed", returnlab_return_photos: [] }),
  ],
  [companyB]: [row("BRAVO-100", true, 201)],
};
const active = (entry) => !["Returned", "Disposed"].includes(entry.status) && entry.outbound_status !== "Tendered to carrier";
const pendingDecision = (entry) => active(entry) && entry.inspected_at && entry.status === "On Hold" && !entry.returnlab_client_instructions;
const baseFields = "id::text,merchant_return_id,date_received,status,item_sku,qty,condition,inspection_outcome,inspected_at,client_summary,returnlab_return_photos(id,photo_category)";
const stub = createServer(async (request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const auth = request.headers.authorization?.replace(/^Bearer /, "");
  const param = (name) => url.searchParams.get(name);
  const json = (value, status = 200) => {
    response.writeHead(status, { "Content-Type": "application/json" });
    response.end(JSON.stringify(value));
  };
  try {
    if (url.pathname === "/auth/v1/user") {
      const account = accounts[auth];
      return account ? json({ id: account.id, email: account.email, email_confirmed_at: "2026-11-27T00:00:00Z" })
        : json({ code: "bad_jwt", msg: "Invalid session" }, 401);
    }
    assert.equal(auth, "fake-service-key");
    databaseReads++;
    switch (url.pathname) {
      case "/rest/v1/returnlab_client_members": {
        const account = Object.values(accounts).find((entry) => `eq.${entry.email}` === param("email"));
        assert.equal(param("active"), "eq.true");
        return json(account?.company && `eq.${account.id}` === param("auth_user_id") &&
          (account.company !== companyA || alphaActive) ? [{ client_id: account.company }] : []);
      }
      case "/rest/v1/returnlab_clients": {
        assert.equal(param("active"), "eq.true");
        assert.equal(param("portal_enabled"), "eq.true");
        const id = param("id")?.slice(3);
        return json(id === companyA ? [{ id, name: "Alpha Fixtures", client_instructions_enabled: true }]
          : id === companyB ? [{ id, name: "Bravo Fixtures", client_instructions_enabled: false }] : []);
      }
      case "/rest/v1/returnlab_returns": {
        const id = param("client_id")?.slice(3);
        assert.ok(data[id], "company scope must be explicit");
        assert.equal(param("select"), id === companyA
          ? baseFields + ",storage_until,outbound_status,returnlab_client_instructions(instruction,submitted_at)"
          : baseFields);
        assert.equal(param("returnlab_return_photos.client_visible"), "eq.true");
        const filter = url.searchParams.getAll("merchant_return_id").find((value) => value.startsWith("eq."));
        const statuses = url.searchParams.getAll("status");
        const instruction = param("returnlab_client_instructions.instruction");
        return json(data[id].filter((entry) =>
          (!filter || filter === `eq.${entry.merchant_return_id}`) &&
          (!statuses.includes("not.in.(Returned,Disposed)") || active(entry)) &&
          (!statuses.includes("eq.On Hold") || entry.status === "On Hold") &&
          (param("inspected_at") !== "is.null" || entry.inspected_at === null) &&
          (param("inspected_at") !== "not.is.null" || entry.inspected_at !== null) &&
          (param("returnlab_client_instructions") !== "is.null" || entry.returnlab_client_instructions === null) &&
          (!instruction || instruction === `eq.${entry.returnlab_client_instructions?.instruction}`)));
      }
      case "/rest/v1/rpc/get_returnlab_client_dashboard": {
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        const { p_client_id: id } = JSON.parse(Buffer.concat(chunks));
        assert.ok(data[id]);
        const sum = (predicate) => data[id].filter(predicate).reduce((total, entry) => total + entry.qty, 0);
        return json({
          warehouse_hold: sum((entry) => active(entry) && entry.returnlab_client_instructions?.instruction === "warehouse_hold"),
          disposal_authorized: sum((entry) => active(entry) && entry.returnlab_client_instructions?.instruction === "disposal_authorized"),
          awaiting_decision: sum(pendingDecision),
          pending_inspection: sum((entry) => active(entry) && entry.inspected_at === null),
          findings_posted: sum((entry) => entry.inspected_at !== null),
        });
      }
      case "/rest/v1/rpc/submit_returnlab_client_instruction": {
        instructionAttempts++;
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        const args = JSON.parse(Buffer.concat(chunks));
        assert.equal(args.p_client_id, companyA);
        assert.equal(args.p_user_id, "user-alpha");
        assert.ok(["warehouse_hold", "disposal_authorized"].includes(args.p_instruction));
        const item = data[args.p_client_id].find((entry) => String(args.p_return_id) === entry.id && pendingDecision(entry));
        if (!item) return json(false);
        item.returnlab_client_instructions = { instruction: args.p_instruction, submitted_at: "2026-11-28T00:00:00Z" };
        return json(true);
      }
      case "/rest/v1/returnlab_return_photos": {
        const id = param("returnlab_returns.client_id")?.slice(3);
        assert.ok(data[id], "parent company scope must be explicit");
        assert.equal(param("client_visible"), "eq.true");
        assert.equal(param("returnlab_returns.inspected_at"), "not.is.null");
        assert.equal(param("returnlab_returns.merchant_return_id"), "not.is.null");
        assert.match(param("select"), /returnlab_returns!inner/);
        const match = data[id].find((entry) => entry.inspected_at &&
          `eq.${entry.returnlab_return_photos[0]?.id}` === param("id"));
        return json(match ? [{ storage_path: `synthetic/${match.returnlab_return_photos[0].id}.png`, content_type: "image/png" }] : []);
      }
      default:
        if (url.pathname === "/storage/v1/object/return-inspections/synthetic/101.png") {
          response.writeHead(200, { "Content-Type": "image/png" });
          return response.end(Buffer.from([137, 80, 78, 71]));
        }
        return json({ error: "No fixture" }, 404);
    }
  } catch (error) {
    errors.push(error);
    return json({ error: "Invalid fixture request" }, 500);
  }
});
const listen = async (server) => {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
};
const authPort = await listen(stub);
const probe = createServer();
const nextPort = await listen(probe);
await new Promise((resolve) => probe.close(resolve));
const next = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(nextPort)], {
  env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${authPort}`, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fake-publishable-key", SUPABASE_SERVICE_ROLE_KEY: "fake-service-key" },
  stdio: ["ignore", "inherit", "inherit"],
});
const page = (path, token) => fetch(`http://127.0.0.1:${nextPort}${path}`, {
  redirect: "manual", headers: token ? { Cookie: `returnlab-client-session=${token}` } : {},
});
try {
  let signIn;
  for (let attempt = 0; attempt < 60 && !signIn; attempt++) {
    try { signIn = await page("/portal/sign-in"); }
    catch { await new Promise((resolve) => setTimeout(resolve, 500)); }
  }
  assert.equal(signIn?.status, 200);
  assert.match(await signIn.text(), /Email me a sign-in code/);
  assert.equal((await page("/portal")).headers.get("location"), "/portal/sign-in");
  assert.equal((await page("/portal/photos/101")).status, 404);
  assert.equal(databaseReads, 0);
  assert.equal((await page("/portal", "fixture-unapproved")).headers.get("location"), "/portal/sign-in");
  assert.equal((await page("/portal", "fixture-mismatch")).headers.get("location"), "/portal/sign-in");

  assert.equal((await page("/portal", "fixture-cth")).headers.get("location"), "/portal/sign-in");
  const alpha = await page("/portal", "fixture-alpha");
  assert.equal(alpha.status, 200);
  assert.match(alpha.headers.get("cache-control") ?? "", /no-store|no-cache/);
  const alphaHtml = await alpha.text();
  assert.match(alphaHtml, /ALPHA-100/);
  assert.match(alphaHtml, /2026-12-27/);
  assert.match(alphaHtml, /ALPHA-200/);
  assert.match(alphaHtml, /Held for warehouse shipment/);
  assert.match(alphaHtml, />3<\/span><span[^>]*>Awaiting your decision/);
  assert.match(alphaHtml, /name="returnId" value="101"/);
  assert.doesNotMatch(alphaHtml, /name="returnId" value="102"/);
  const pending = await (await page("/portal?queue=pending_inspection", "fixture-alpha")).text();
  assert.match(pending, /ALPHA-200/);
  assert.doesNotMatch(pending, /ALPHA-100/);
  const awaiting = await (await page("/portal?queue=awaiting_decision", "fixture-alpha")).text();
  assert.match(awaiting, /ALPHA-100/);
  assert.doesNotMatch(awaiting, /ALPHA-200|ALPHA-CLOSED|ALPHA-HIDDEN/);
  const disposal = await (await page("/portal?queue=disposal_authorized", "fixture-alpha")).text();
  assert.doesNotMatch(disposal, /ALPHA-CLOSED/);
  assert.match(alphaHtml, /\/portal\/photos\/101/);
  assert.doesNotMatch(alphaHtml, /BRAVO-100|\/portal\/photos\/102|storage_path/);
  const bravo = await (await page("/portal", "fixture-bravo")).text();
  assert.match(bravo, /BRAVO-100/);
  assert.doesNotMatch(bravo, /ALPHA-100|Storage included through|Held for warehouse shipment|Give ReturnLab instructions/);
  assert.match(bravo, /Findings posted/);
  assert.match(await (await page("/portal?returnId=BRAVO-100", "fixture-alpha")).text(), /No parcels found/);
  assert.equal((await page("/portal/photos/201", "fixture-alpha")).status, 404);
  assert.equal((await page("/portal/photos/102", "fixture-alpha")).status, 404);
  assert.equal((await page("/portal/photos/104", "fixture-alpha")).status, 404);

  const allowedPhoto = await page("/portal/photos/101", "fixture-alpha");
  assert.equal(allowedPhoto.status, 200);
  assert.match(allowedPhoto.headers.get("cache-control") ?? "", /no-store/);
  assert.equal(allowedPhoto.headers.get("content-type"), "image/png");
  assert.deepEqual([...new Uint8Array(await allowedPhoto.arrayBuffer())], [137, 80, 78, 71]);

  const instructionForm = [...alphaHtml.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)]
    .map(([form]) => form).find((form) => form.includes('name="returnId" value="101"'));
  assert.ok(instructionForm);
  const decode = (value) => value.replaceAll("&quot;", '"').replaceAll("&#x27;", "'").replaceAll("&amp;", "&");
  const postInstruction = async (token, returnId, instruction, confirmation) => {
    const body = new FormData();
    for (const [field] of instructionForm.matchAll(/<input\b[^>]+>/g)) {
      const name = field.match(/\bname="([^"]+)"/)?.[1];
      if (name?.startsWith("$ACTION_")) body.append(name, decode(field.match(/\bvalue="([^"]*)"/)?.[1] ?? ""));
    }
    assert.ok([...body.keys()].length);
    body.append("returnId", returnId);
    body.append("instruction", instruction);
    if (confirmation) body.append("confirmation", confirmation);
    const response = await fetch(`http://127.0.0.1:${nextPort}/portal`, {
      method: "POST", redirect: "manual", body, headers: {
        Origin: `http://127.0.0.1:${nextPort}`, Cookie: `returnlab-client-session=${token}`,
      },
    });
    assert.ok(response.status < 400, `native form submission status ${response.status}`);
    await response.text();
  };
  await postInstruction("fixture-alpha", "101", "disposal_authorized", null);
  await postInstruction("fixture-alpha", "101", "disposal_authorized", "warehouse_hold");
  await postInstruction("fixture-bravo", "101", "disposal_authorized", "disposal_authorized");
  assert.equal(instructionAttempts, 0);
  await postInstruction("fixture-alpha", "201", "disposal_authorized", "disposal_authorized");
  await postInstruction("fixture-alpha", "102", "disposal_authorized", "disposal_authorized");
  assert.equal(instructionAttempts, 2);
  assert.equal(data[companyB][0].returnlab_client_instructions, null);
  assert.equal(data[companyA][1].returnlab_client_instructions, null);
  await postInstruction("fixture-alpha", "101", "warehouse_hold", "warehouse_hold");
  await postInstruction("fixture-alpha", "101", "disposal_authorized", "disposal_authorized");
  assert.equal(instructionAttempts, 4);
  assert.equal(data[companyA][0].returnlab_client_instructions.instruction, "warehouse_hold");
  assert.equal(data[companyA][0].status, "On Hold");
  const held = await (await page("/portal?queue=warehouse_hold", "fixture-alpha")).text();
  assert.match(held, /ALPHA-100/);
  assert.match(held, />3<\/span><span[^>]*>Held for warehouse shipment/);
  assert.doesNotMatch(held, /name="returnId" value="101"/);

  alphaActive = false;
  assert.equal((await page("/portal", "fixture-alpha")).headers.get("location"), "/portal/sign-in");
  assert.equal((await page("/portal/photos/101", "fixture-alpha")).status, 404);
  assert.deepEqual(errors, []);
  console.log("Portal smoke test passed: account scoping, CTH exclusion, quantity queues, private photos, and immutable confirmed instructions.");
} finally {
  next.kill("SIGTERM");
  stub.close();
}
