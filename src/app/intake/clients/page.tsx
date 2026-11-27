"use client";
import Link from "next/link";
import StaffHeader from "@/components/staff-header";
import IntakeDateInput from "@/components/intake-date-input";
import { useCallback, useEffect, useState } from "react";
import { CARRIERS, CONDITIONS, DEFAULT_CHECKLIST, storageThrough } from "@/lib/managed-returns";
import { PHOTO_CATEGORIES } from "@/lib/client-workflows";

type Company={id:string; name:string; checklist:string[]; included_storage_days:number; portal_enabled:boolean; active:boolean};
type ClientInstruction={instruction:"warehouse_hold"|"disposal_authorized";submitted_at:string};
function instructionFor(entry:Entry){ const value=entry.returnlab_client_instructions; return Array.isArray(value)?value[0]:value; }
type Entry={id:number; merchant_return_id:string; item_sku:string|null; tracking_number:string|null; date_received:string; storage_until:string|null; status:string; observed_condition:string|null; inspection_outcome:string|null; client_summary:string|null; inspection_notes:string|null; time_spent_minutes:number|null; inspected_at:string|null; returnlab_client_instructions?:ClientInstruction|ClientInstruction[]|null};
type Member={email:string;active:boolean};
type Payload={error?:string;companies?:Company[];company?:Company;returns?:Entry[];members?:Member[]};
const input="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2.5 text-sm";
const button="rounded-lg bg-emerald-300 px-4 py-2 font-semibold text-zinc-950 disabled:opacity-50";
const card="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5";
const endpoint="/api/managed-returns";

async function request(search="", body?: Record<string,unknown>):Promise<Payload> {
  const res=await fetch(endpoint+search,body?{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}:{cache:"no-store"});
  const data:Payload=await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}
function returnLabel(row:Entry, cth:boolean) {
  return cth ? row.tracking_number || "CTH return #" + row.id : row.merchant_return_id;
}
function localDate() {
  return new Intl.DateTimeFormat("sv-SE",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
}
export default function ClientWorkspaces(){
  const [received,setReceived]=useState(localDate);
  const [companies,setCompanies]=useState<Company[]>([]);
  const [clientId,setClientId]=useState("");
  const [data,setData]=useState<{forId:string;entries:Entry[];members:Member[]}>({forId:"",entries:[],members:[]});
  const [selected,setSelected]=useState<Entry|null>(null);
  const [completion,setCompletion]=useState<Entry|null>(null);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [loaded,setLoaded]=useState(false);
  const [photoRetry,setPhotoRetry]=useState(false);
  const company=companies.find(x=>x.id===clientId);
  const isCth=company?.name==="CTH";
  const entries=data.forId===clientId?data.entries:[];
  const members=data.forId===clientId?data.members:[];
  const load=useCallback(async(id:string, signal?:AbortSignal)=>{
    if (!id) return;
    const result=await request("?client="+encodeURIComponent(id));
    if (!signal?.aborted) setData({forId:id,entries:result.returns??[],members:result.members??[]});
  },[]);
  useEffect(()=>{
    let done=false;
    request().then(r=>{if(!done){const rows=r.companies??[];setCompanies(rows);setClientId(rows.find(x=>x.active)?.id??"");}}).catch(e=>{if(!done)setMessage(e.message);}).finally(()=>{if(!done)setLoaded(true);});
    return ()=>{done=true;};
  },[]);
  useEffect(()=>{
    const controller=new AbortController();
    if (clientId) request("?client="+encodeURIComponent(clientId))
      .then(result=>{if(!controller.signal.aborted)setData({forId:clientId,entries:result.returns??[],members:result.members??[]});})
      .catch(e=>{if(!controller.signal.aborted)setMessage(e.message);});
    return ()=>controller.abort();
  },[clientId]);
  async function perform(fn:()=>Promise<void>){
    setBusy(true);setMessage("");
    try {await fn();} catch(e){setMessage(e instanceof Error?e.message:"Something went wrong.");} finally{setBusy(false);}
  }
  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 bg-black px-4 py-8 text-white sm:px-8">
    <StaffHeader title="Return Intake" subtitle="Log arrivals, inspect returns, and manage client access.">
      <nav aria-label="Staff navigation" className="flex flex-wrap gap-4">
        <Link href="/reports" className="text-sm text-emerald-300">Staff reports</Link>
      </nav>
    </StaffHeader>
    {message&&<p role="status" className="rounded-xl border border-zinc-700 bg-zinc-900 p-3">{message}</p>}
    <details className={card} open={loaded&&!companies.length?true:undefined}>
      <summary className="cursor-pointer text-lg font-semibold">Add a company</summary>
      <form className="space-y-4" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);void perform(async()=>{const result=await request("",{action:"createCompany",name:f.get("name"),checklist:f.get("checklist"),monthlyFee:Number(f.get("monthlyFee")),includedReturns:Number(f.get("includedReturns")),overageFee:Number(f.get("overageFee")),includedStorageDays:Number(f.get("includedStorageDays"))});if(result.company){const created=result.company;setCompanies(p=>[...p,created]);setSelected(null);setClientId(created.id);setMessage(created.name+" is ready for intake. No client email was sent.");}});}}>
        <label className="block">Company name<input name="name" className={input} required maxLength={100}/></label>
        <label className="block">Inspection checks (one per line)<textarea name="checklist" rows={4} className={input} defaultValue={DEFAULT_CHECKLIST.join("\n")} maxLength={1800}/></label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label>Monthly fee ($)<input name="monthlyFee" type="number" min="0" max="999999" step="0.01" required defaultValue={300} className={input}/></label>
          <label>Included returns<input name="includedReturns" type="number" min="0" max="100000" required defaultValue={50} className={input}/></label>
          <label>Additional return ($)<input name="overageFee" type="number" min="0" max="999999" step="0.01" required defaultValue={6} className={input}/></label>
        </div>
        <label>Included storage (calendar days)<input name="includedStorageDays" type="number" min="0" max="365" required defaultValue={30} className={input}/></label>
        <button className={button} disabled={busy||!loaded}>Create company</button>
      </form>
    </details>
    {companies.length>0&&<label className="block">Company<select className={input} value={clientId} disabled={busy} onChange={e=>{setSelected(null);setCompletion(null);setPhotoRetry(false);setClientId(e.target.value);setMessage("");}}><option value="" disabled>Choose a company</option>{companies.filter(c=>c.active).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
    {company&&<div className="space-y-6" key={company.id}>
      <div className="grid gap-5 md:grid-cols-2">
      <form className={card} onSubmit={e=>{e.preventDefault();const el=e.currentTarget,f=new FormData(el);void perform(async()=>{await request("",{...Object.fromEntries(f),qty:Number(f.get("qty")),action:"arrival",clientId});el.reset();setReceived(localDate());await load(clientId);setMessage(isCth?"Arrival logged. Record disposal once it’s done.":"Arrival logged. Pending inspection.");});}}>
        <h2 className="text-xl font-semibold">Log an arrival</h2>
        {isCth ? <p className="text-sm text-zinc-400">Staff only. Log the package, then record disposal after it happens. No inspection or client approval is needed.</p> :
          <label className="block">Merchant return ID<input name="merchantReturnId" className={input} required maxLength={100}/></label>}
        <label className="block">Product / SKU{isCth?" (optional)":""}<input name="sku" className={input} required={!isCth} maxLength={120}/></label>
        <label className="block">Date received<IntakeDateInput name="received" className={input} value={received} onChange={e=>setReceived(e.target.value)} required/></label>
        <div className="grid grid-cols-2 gap-3"><label>Carrier<select name="carrier" className={input} defaultValue="Other">{CARRIERS.map(x=><option key={x}>{x}</option>)}</select></label><label>Quantity<input name="qty" className={input} type="number" min={1} max={10000} defaultValue={1} required/></label></div>
        {!isCth&&<label className="block">Included storage through<input type="date" className={input} value={storageThrough(received,company.included_storage_days)} readOnly/><span className="text-xs text-zinc-400">Calculated from receipt. This does not schedule a shipment.</span></label>}
        <label className="block">Tracking number (staff only)<input name="tracking" className={input} maxLength={150}/></label>
        {isCth&&<label className="block">Return reason (optional)<input name="returnReason" className={input} maxLength={1000}/></label>}
        <button className={button} disabled={busy}>Log arrival</button>
      </form>
      {!isCth && company.portal_enabled && <section className={card}>
        <h2 className="text-xl font-semibold">Portal access</h2>
        <p className="text-sm text-zinc-400">Granting access does not send an invitation. The client requests a sign-in code at <Link href="/portal" className="text-emerald-300">the portal</Link>.</p>
        <form className="space-y-3" onSubmit={e=>{e.preventDefault();const el=e.currentTarget,f=new FormData(el);void perform(async()=>{await request("",{action:"grantAccess",clientId,email:f.get("email")});el.reset();await load(clientId);setMessage("Portal access granted. No client email was sent.");});}}>
          <label className="block">Client email<input name="email" type="email" required maxLength={254} className={input}/></label>
          <button className={button} disabled={busy}>Grant access</button>
        </form>
        <ul className="space-y-2">{members.filter(m=>m.active).map(m=><li key={m.email} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 p-2"><span className="break-all text-sm">{m.email}</span><button type="button" disabled={busy} className="text-sm text-amber-200" onClick={()=>void perform(async()=>{await request("",{action:"revokeAccess",clientId,email:m.email});await load(clientId);setMessage("Portal access revoked.");})}>Revoke</button></li>)}</ul>
      </section>}
      </div>
      <section className={card}>
        <h2 className="text-xl font-semibold">Recent returns</h2>
        {!entries.length?<p className="text-zinc-400">{isCth?"No returns logged in the new intake yet. Earlier CTH returns are in Staff reports.":"No returns logged yet."}</p>:<ul className="divide-y divide-zinc-800">{entries.map(row=>{
          const instruction=instructionFor(row)?.instruction;
          const inspectable=(isCth?["Received","Processing"]:["Received","Processing","Completed","On Hold"]).includes(row.status);
          const canComplete=isCth?inspectable:row.status==="On Hold"&&Boolean(instruction);
          const status=row.status==="Disposed"?"Disposed":row.status==="Returned"?"Shipped to warehouse":isCth?(canComplete?"Ready for disposal":row.status):!row.inspected_at?"Pending inspection":instruction==="warehouse_hold"?"Hold for warehouse shipment":instruction==="disposal_authorized"?"Disposal authorized (not completed)":"Findings posted · Awaiting client decision";
          return <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
            <div className="min-w-0"><strong className="break-all">{returnLabel(row,isCth)}</strong>{row.item_sku&&" · "+row.item_sku}<p className="text-sm text-zinc-400">{row.date_received}{row.storage_until? " · Storage included through "+row.storage_until:""} · {status}</p></div>
            <div className="flex flex-wrap gap-2">
              {canComplete&&<button disabled={busy} type="button" className="rounded-lg border border-zinc-700 px-3 py-2 text-sm" onClick={()=>{setSelected(null);setCompletion(row);}}>{isCth?"Record disposal":"Record completed action"}</button>}
              {inspectable&&<button disabled={busy} type="button" className="rounded-lg border border-zinc-700 px-3 py-2 text-sm" onClick={()=>{setPhotoRetry(false);setCompletion(null);setSelected(row);}}>{isCth?"Inspection (optional)":"Inspect"}</button>}
            </div>
          </li>;
        })}</ul>}
      </section>
      {completion && <form key={completion.id} className={card} onSubmit={e=>{e.preventDefault();const row=completion;void perform(async()=>{
        await request("",{action:isCth?"completeCthDisposal":"completeInstruction",clientId,id:row.id,instruction:instructionFor(row)?.instruction,confirmCompleted:true});
        setCompletion(null);await load(clientId);setMessage(isCth?"Disposal recorded.":"Completed action recorded. Nothing was shipped or disposed by this app.");
      });}}>
        <h2 className="text-xl font-semibold">{isCth?"Record disposal":"Record completion"} for {returnLabel(completion,isCth)}</h2>
        <label className="flex items-start gap-2"><input className="mt-1" type="checkbox" required/> {instructionFor(completion)?.instruction==="warehouse_hold"?"This return was handed off for shipment to the agreed U.S. warehouse.":"This return was physically disposed of."}</label>
        <button className={button} disabled={busy}>Confirm completion</button><button type="button" disabled={busy} className="ml-3" onClick={()=>setCompletion(null)}>Cancel</button>
      </form>}
      {selected&&<form key={selected.id} className={card} onSubmit={e=>{e.preventDefault();const el=e.currentTarget,f=new FormData(el),row=selected;void perform(async()=>{
        const findings=Object.fromEntries(company.checklist.map((_,i)=>[`check_${i}`,f.get(`check_${i}`)==="yes"]));
        if (!photoRetry) await request("",{action:"inspection",clientId,id:row.id,condition:f.get("condition"),summary:f.get("summary"),findings,...(isCth&&f.get("minutes")!==""?{minutes:Number(f.get("minutes"))}:{})});
        const photos=f.get("photo"); if(photos instanceof File&&photos.size){
          const payload=new FormData();payload.set("file",photos);payload.set("returnId",String(row.id));payload.set("category",String(f.get("category")));payload.set("clientVisible",String(!isCth));
          const upload=await fetch("/api/returns/photos",{method:"POST",body:payload}).catch(()=>null);
          if (!upload?.ok){setPhotoRetry(true);await load(clientId);setMessage("Inspection saved, but the photo did not upload. Retry the photo here.");return;}
        }
        setSelected(null);setPhotoRetry(false);await load(clientId);setMessage(isCth?"Inspection saved. Record disposal once the return has been physically disposed of.":"Inspection published to the portal. Send the two-business-day email separately.");
      });}}>
        <h2 className="text-xl font-semibold">Inspect {returnLabel(selected,isCth)}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label>Condition<select name="condition" className={input} defaultValue={CONDITIONS.find(x=>x===selected.observed_condition)??""} required><option value="" disabled>Choose an observation</option>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></label>
          <p className="self-end text-sm text-zinc-400">{isCth?"Notes and photos stay staff-only. Saving does not record disposal.":"Publishing shares the findings and leaves the item on hold for the client’s decision."}</p>
        </div>
        {company.checklist.length>0&&<fieldset className="space-y-2"><legend>Checklist</legend>{company.checklist.map((check,i)=><label key={check} className="flex flex-wrap items-center justify-between gap-2">{check}<select name={`check_${i}`} required defaultValue="" className="rounded border border-zinc-700 bg-zinc-900 p-1"><option value="" disabled>Choose</option><option value="yes">Verified / no issue</option><option value="no">Issue / unverified</option></select></label>)}</fieldset>}
        <label className="block">{isCth?"Staff notes (optional)":"Client-visible findings"}<textarea name="summary" className={input} required={!isCth} rows={3} maxLength={3000} defaultValue={(isCth?selected.inspection_notes:selected.client_summary)??""} placeholder={isCth?"Record what you found.":"What the client needs to decide the refund. Do not include internal notes or personal information."}/></label>
        {isCth&&<label className="block">Time spent (minutes, optional)<input name="minutes" type="number" min={0} max={100000} className={input} defaultValue={selected.time_spent_minutes??""}/></label>}
        <div className="grid gap-3 md:grid-cols-2"><label>{isCth?"Optional staff-only photo":"Optional client-visible photo"}<input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className={input}/></label><label>Photo category<select name="category" className={input} defaultValue="Issue close-up">{PHOTO_CATEGORIES.filter(x=>isCth||x!=="Product label").map(x=><option key={x}>{x}</option>)}</select></label></div>
        <button className={button} disabled={busy}>{photoRetry?"Retry photo":isCth?"Save inspection":"Publish inspection"}</button>
        <button type="button" disabled={busy} className="ml-4 text-sm text-zinc-300" onClick={()=>{setPhotoRetry(false);setSelected(null);}}>Close</button>
      </form>}
    </div>}
  </main>;
}
