import { NextRequest, NextResponse } from "next/server";
import { hasValidBasicAuth } from "@/lib/basic-auth";
import { CARRIERS, CONDITIONS, DEFAULT_CHECKLIST, OUTCOMES, field, isUuid, isoDate, portalEmail } from "@/lib/managed-returns";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const companyFields = "id,name,checklist,monthly_fee,included_returns,overage_fee,active";
const returnFields = "id,client_id,merchant_return_id,item_sku,date_received,status,condition,inspection_outcome,client_summary,inspected_at";
function response(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
const deny = () => response({error:"Staff authentication required."}, 401);
const bad = (error: string) => response({error}, 400);

export async function GET(req: NextRequest) {
  if (!hasValidBasicAuth(req)) return deny();
  try {
    const db = getSupabaseAdmin();
    const client = req.nextUrl.searchParams.get("client");
    if (client !== null) {
      if (!isUuid(client)) return bad("Choose a company.");
      const [entries, memberships] = await Promise.all([
        db.from("returnlab_returns").select(returnFields).eq("client_id", client).order("date_received",{ascending:false}).order("id",{ascending:false}).limit(100),
        db.from("returnlab_client_members").select("email,active").eq("client_id",client).order("email"),
      ]);
      if (entries.error || memberships.error) throw entries.error ?? memberships.error;
      return response({returns:entries.data, members:memberships.data});
    }
    const result = await db.from("returnlab_clients").select(companyFields).order("name");
    if (result.error) throw result.error;
    return response({companies:result.data});
  } catch {
    return response({error:"Unable to load the workspace. Verify the client-workspace migration has been applied."},503);
  }
}

export async function POST(req: NextRequest) {
  if (!hasValidBasicAuth(req)) return deny();
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (req.headers.get("sec-fetch-site") === "cross-site" ||
      (origin && (!host || ![`https://${host}`, ...(process.env.NODE_ENV !== "production" ? [`http://${host}`] : [])].includes(origin)))) {
    return response({error:"Invalid request origin."},403);
  }
  if (!req.headers.get("content-type")?.startsWith("application/json")) return bad("JSON required.");
  let input: Record<string, unknown>;
  try {
    input = await req.json();
    if (!input || typeof input !== "object" || Array.isArray(input)) return bad("Invalid request.");
  } catch { return bad("Invalid request."); }
  try {
    const db = getSupabaseAdmin();
    const action = input.action;
    if (action === "createCompany") {
      const name = field(input.name,100);
      if (!name || ["cth","dgm group"].includes(name.toLowerCase())) return bad("Enter a new company name.");
      const checklist = (field(input.checklist,1800) || DEFAULT_CHECKLIST.join("\n")).split("\n").map(x=>x.trim()).filter(Boolean);
      if (!checklist.length || checklist.length>15 || checklist.some(x=>x.length>100) || new Set(checklist).size!==checklist.length) return bad("Use 1 to 15 distinct checklist lines, up to 100 characters each.");
      const monthlyFee = input.monthlyFee ?? 300;
      const included = input.includedReturns ?? 50;
      const overage = input.overageFee ?? 6;
      const validPrice = (x: unknown) => typeof x==="number" && Number.isFinite(x) && x>=0 && x<=999999 && Math.abs(x*100-Math.round(x*100))<0.000001;
      if (!validPrice(monthlyFee) || !validPrice(overage) || typeof included!=="number" || !Number.isSafeInteger(included) || included<0 || included>100000) return bad("Enter a valid pricing plan.");
      const {data,error} = await db.from("returnlab_clients").insert({name,checklist,monthly_fee:monthlyFee,included_returns:included,overage_fee:overage}).select(companyFields).single();
      if (error?.code === "23505") return response({error:"That company already exists."},409);
      if (error) throw error;
      return response({company:data},201);
    }
    const clientId = field(input.clientId,36);
    if (!isUuid(clientId)) return bad("Choose a company.");
    const result = await db.from("returnlab_clients").select(companyFields).eq("id",clientId).eq("active",true).maybeSingle();
    if (result.error) throw result.error;
    const company = result.data;
    if (!company) return response({error:"Active company not found."},404);
    if (action === "grantAccess" || action === "revokeAccess") {
      const email = portalEmail(input.email);
      if (!email) return bad("Enter a valid email.");
      let result;
      if (action === "grantAccess") {
        const existing = await db.from("returnlab_client_members").select("client_id,auth_user_id").eq("email",email).eq("active",true).maybeSingle();
        if (existing.error) throw existing.error;
        if (existing.data && existing.data.client_id!==clientId) return response({error:"That email already has access to another company."},409);
        if (existing.data) return response({ok:true});
        const previous = await db.from("returnlab_client_members").select("auth_user_id").eq("email",email).eq("client_id",clientId).maybeSingle();
        if (previous.error) throw previous.error;
        let authUserId = previous.data?.auth_user_id;
        if (!authUserId) {
          // A fresh account has no user-provided password. Its identity is still
          // proven on every sign-in by the OTP sent to this address.
          const auth = await db.auth.admin.createUser({email,email_confirm:true});
          if (["email_exists","user_already_exists"].includes(auth.error?.code ?? "")) return response({error:"This address already has an Auth account. Use a new address or have an administrator verify and provision the existing account."},409);
          if (auth.error || !auth.data.user) throw auth.error ?? new Error("Auth user missing");
          authUserId = auth.data.user.id;
        }
        result = await db.from("returnlab_client_members").upsert({client_id:clientId,email,auth_user_id:authUserId,active:true},{onConflict:"client_id,email"});
        // Preserve recoverability if Auth creation succeeded but membership did not.
        if (result.error && !previous.data) {
          const membership = await db.from("returnlab_client_members").select("auth_user_id").eq("auth_user_id",authUserId).limit(1);
          if (!membership.error && !membership.data.length) await db.auth.admin.deleteUser(authUserId);
        }
      } else {
        result = await db.from("returnlab_client_members").update({active:false}).eq("client_id",clientId).eq("email",email);
      }
      const {error} = result;
      if (error?.code === "23505") return response({error:"That email already has access to another company."},409);
      if (error) throw error;
      return response({ok:true});
    }
    if (action === "arrival") {
      const merchantId = field(input.merchantReturnId,100);
      const sku = field(input.sku,120);
      const date = field(input.received,10);
      const carrier = CARRIERS.find(x=>x===input.carrier);
      const qty = input.qty;
      if (!merchantId || !sku || !isoDate(date) || !carrier || typeof qty !== "number" || !Number.isSafeInteger(qty) || qty<1 || qty>10000) return bad("Enter a return ID, SKU, valid received date, carrier and quantity.");
      const {data,error} = await db.from("returnlab_returns").insert({
        client_id:clientId, client_name:company.name, merchant_return_id:merchantId, item_sku:sku, date_received:date,
        tracking_number:field(input.tracking,150)||null, carrier, qty, condition:"Unknown", status:"Received", action_taken:"Hold for review",
      }).select(returnFields).single();
      if (error?.code === "23505") return response({error:"This return ID, SKU and tracking combination has already been logged."},409);
      if (error) throw error;
      return response({entry:data},201);
    }
    if (action === "inspection") {
      const id = input.id;
      const condition = CONDITIONS.find(x=>x===input.condition);
      const outcome = OUTCOMES.find(x=>x===input.outcome);
      const summary = field(input.summary,3000);
      const findings = input.findings as Record<string, unknown>;
      const checklist: string[] = Array.isArray(company.checklist) ? company.checklist : [];
      if (typeof id!=="number" || !Number.isSafeInteger(id) || id<1 || !condition || !outcome || !summary ||
        !findings || typeof findings!=="object" || Array.isArray(findings) ||
        Object.keys(findings).length!==checklist.length || !checklist.every((_,i)=>typeof findings[`check_${i}`]==="boolean")) return bad("Complete every checklist item, select an outcome, and enter a customer-visible summary.");
      if (outcome==="Approved for resale" && (["Damaged","Defective","Unknown"].includes(condition) || Object.values(findings).includes(false))) return bad("An incomplete, damaged or unverified return cannot be marked ready for resale.");
      const approved=outcome==="Approved for resale";
      const {data,error} = await db.from("returnlab_returns").update({
        condition, inspection_outcome:outcome, inspection_findings:findings, client_summary:summary, inspected_at:new Date().toISOString(),
        status:approved?"Completed":"On Hold", action_taken:approved?"Keep (resale)":"Hold for review",
      }).eq("client_id",clientId).eq("id",id).in("status",["Received","Processing","Completed","On Hold"]).select(returnFields).maybeSingle();
      if (error) throw error;
      if (!data) return response({error:"Editable return not found in this company."},404);
      return response({entry:data});
    }
    return bad("Unknown action.");
  } catch {
    return response({error:"Could not save the workspace change."},500);
  }
}
