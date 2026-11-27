// Run: node src/app/portal/testing/portal-smoke.mjs (uses only synthetic data).
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";

const companyA = "cfa2b820-ca94-400e-a5ef-691c743bf950";
const companyB = "d57dccb1-0a53-4a32-a517-f0fe69f39494";
const accounts = {
  "fixture-alpha": { id: "user-alpha", email: "alpha@example.test", company: companyA },
  "fixture-bravo": { id: "user-bravo", email: "bravo@example.test", company: companyB },
  "fixture-unapproved": { id: "user-charlie", email: "charlie@example.test" },
  "fixture-mismatch": { id: "user-other", email: "alpha@example.test", company: companyA },
};
let alphaActive = true;
let databaseReads = 0;
const errors = [];
const row = (returnId, inspected, photoId) => ({
  merchant_return_id: returnId, date_received: "2026-11-27", storage_until:"2026-12-27", status: inspected ? "Completed" : "Received",
  item_sku: "SAMPLE", qty: 1, condition: "Like New", inspection_outcome: inspected ? "Approved for resale" : null,
  inspected_at: inspected ? "2026-11-28T00:00:00.000Z" : null,
  client_summary: inspected ? "Original packaging intact." : null,
  returnlab_return_photos: [{ id: photoId, photo_category: "Packaging" }],
});
const data = {
  [companyA]: [row("ALPHA-100", true, 101), row("ALPHA-200", false, 102)],
  [companyB]: [row("BRAVO-100", true, 201)],
};
const stub = createServer((request, response) => {
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
        const id = param("id")?.slice(3);
        return json(id === companyA ? [{ id, name: "Alpha Fixtures" }] : id === companyB ? [{ id, name: "Bravo Fixtures" }] : []);
      }
      case "/rest/v1/returnlab_returns": {
        const id = param("client_id")?.slice(3);
        assert.ok(data[id], "company scope must be explicit");
        assert.equal(param("select"), "merchant_return_id,date_received,storage_until,status,item_sku,qty,condition,inspection_outcome,inspected_at,client_summary,returnlab_return_photos(id,photo_category)");
        const filter = url.searchParams.getAll("merchant_return_id").find((value) => value.startsWith("eq."));
        return json(data[id].filter((entry) => !filter || filter === `eq.${entry.merchant_return_id}`));
      }
      case "/rest/v1/returnlab_return_photos": {
        const id = param("returnlab_returns.client_id")?.slice(3);
        assert.ok(data[id], "parent company scope must be explicit");
        assert.equal(param("returnlab_returns.inspected_at"), "not.is.null");
        assert.equal(param("returnlab_returns.merchant_return_id"), "not.is.null");
        assert.match(param("select"), /returnlab_returns!inner/);
        const match = data[id].find((entry) => entry.inspected_at &&
          `eq.${entry.returnlab_return_photos[0].id}` === param("id"));
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

  const alpha = await page("/portal", "fixture-alpha");
  assert.equal(alpha.status, 200);
  assert.match(alpha.headers.get("cache-control") ?? "", /no-store|no-cache/);
  const alphaHtml = await alpha.text();
  assert.match(alphaHtml, /ALPHA-100/);
  assert.match(alphaHtml, /2026-12-27/);
  assert.match(alphaHtml, /ALPHA-200/);
  assert.match(alphaHtml, /\/portal\/photos\/101/);
  assert.doesNotMatch(alphaHtml, /BRAVO-100|\/portal\/photos\/102|storage_path/);
  const bravo = await (await page("/portal", "fixture-bravo")).text();
  assert.match(bravo, /BRAVO-100/);
  assert.doesNotMatch(bravo, /ALPHA-100/);
  assert.match(await (await page("/portal?returnId=BRAVO-100", "fixture-alpha")).text(), /No parcels found/);
  assert.equal((await page("/portal/photos/201", "fixture-alpha")).status, 404);
  assert.equal((await page("/portal/photos/102", "fixture-alpha")).status, 404);

  const allowedPhoto = await page("/portal/photos/101", "fixture-alpha");
  assert.equal(allowedPhoto.status, 200);
  assert.match(allowedPhoto.headers.get("cache-control") ?? "", /no-store/);
  assert.equal(allowedPhoto.headers.get("content-type"), "image/png");
  assert.deepEqual([...new Uint8Array(await allowedPhoto.arrayBuffer())], [137, 80, 78, 71]);
  alphaActive = false;
  assert.equal((await page("/portal", "fixture-alpha")).headers.get("location"), "/portal/sign-in");
  assert.equal((await page("/portal/photos/101", "fixture-alpha")).status, 404);
  assert.deepEqual(errors, []);
  console.log("Portal smoke test passed: account scoping, active membership, safe fields, lookup and private photos.");
} finally {
  next.kill("SIGTERM");
  stub.close();
}
