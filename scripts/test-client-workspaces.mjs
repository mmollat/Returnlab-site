import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {createServer} from "node:http";
import {once} from "node:events";
import {randomUUID} from "node:crypto";
const instructions=[];
const companies=[{id:randomUUID(),name:"CTH",active:true,portal_enabled:false,included_storage_days:0,checklist:[]},{id:randomUUID(),name:"MB Heritage",active:true,portal_enabled:true,included_storage_days:30,checklist:[],monthly_fee:300,included_returns:50,overage_fee:6}], members=[], entries=[], users=new Map();
let postToOtp=0;
const server=createServer(async(req,res)=>{
 const url=new URL(req.url,"http://localhost");
 const qs=(k)=>url.searchParams.get(k)?.replace(/^eq\./,"");
 const json=(data,code=200)=>{res.writeHead(code,{"content-type":"application/json"});res.end(JSON.stringify(data));};
 try{
  assert.equal(req.headers.authorization,"Bearer fixture-server");
  let b="";for await(const block of req)b+=block;
  const input=b?JSON.parse(b):null;
  const {pathname}=url;
  const object=req.headers.accept?.includes("object+json");
  const reply=(items,code=200)=>json(object?items[0]??null:items,code);
  if(pathname==="/auth/v1/admin/users"&&req.method==="POST"){
    assert.equal(input.email_confirm,true);
    assert.equal(input.password,undefined);
    if(users.has(input.email))return json({code:"email_exists",message:"Exists"},422);
    const user={id:randomUUID(),email:input.email};users.set(input.email,user);return json(user,201);
  }
  if(pathname==="/auth/v1/otp"){postToOtp++;return json({},200);}
  if(pathname.endsWith("/returnlab_clients")){
    if(req.method==="POST"){const row={id:randomUUID(),active:true,portal_enabled:true,...input};companies.push(row);return reply([row],201);}
    return reply(companies.filter(r=>!qs("id")||r.id===qs("id")));
  }
  if(pathname.endsWith("/returnlab_client_members")){
    if(req.method==="POST"){const idx=members.findIndex(m=>m.email===input.email&&m.client_id===input.client_id);if(idx<0) members.push(input);else members[idx]=input;return json([],201);}
    const matched=members.filter(r=>(!qs("email")||r.email===qs("email"))&&(!qs("client_id")||r.client_id===qs("client_id"))&&(!qs("active")||r.active===(qs("active")==="true")));
    if(req.method==="PATCH"){matched.forEach(row=>Object.assign(row,input));return json([]);}
    return reply(matched);
  }
  if(pathname.endsWith("/returnlab_client_instructions"))return reply(instructions.filter(r=>r.client_id===qs("client_id")&&r.return_id===Number(qs("return_id"))));
  if(pathname.endsWith("/returnlab_returns")){
    if(req.method==="POST"){if(input.tracking_number&&entries.some(row=>row.client_name===input.client_name&&row.tracking_number?.toLowerCase()===input.tracking_number.toLowerCase()))return json({code:"23505",message:"Duplicate tracking"},409);const row={id:entries.length+1,...input};entries.push(row);return reply([row],201);}
    const status=qs("status");
    const matched=entries.filter(r=>(!qs("client_id")||r.client_id===qs("client_id"))&&(!qs("id")||r.id===Number(qs("id")))&&(!url.searchParams.has("inspected_at")||Boolean(r.inspected_at))&&(!status||(status.startsWith("in.(")?status.slice(4,-1).split(",").includes(r.status):r.status===status)));
    if(req.method==="PATCH")matched.forEach(x=>Object.assign(x,input));
    return reply(matched);
  }
  return json({message:"No fixture"},404);
 }catch(err){console.error(err);return json({message:"Unexpected fixture input"},500);}
});
const listen=async s=>{s.listen(0,"127.0.0.1");await once(s,"listening");return s.address().port;};
const api=await listen(server);
const tmp=createServer(),port=await listen(tmp);await new Promise(done=>tmp.close(done));
const child=spawn(process.execPath,["node_modules/next/dist/bin/next","dev","--hostname","127.0.0.1","--port",String(port)],{env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:`http://127.0.0.1:${api}`,SUPABASE_SERVICE_ROLE_KEY:"fixture-server",REPORTS_USERNAME:"staff",REPORTS_PASSWORD:"test-only"},stdio:"inherit"});
const origin=`http://127.0.0.1:${port}`;
const authorization="Basic "+Buffer.from("staff:test-only").toString("base64");
const rest=(data,auth=authorization,search="",otherOrigin=origin)=>fetch(origin+"/api/managed-returns"+search,{method:data?"POST":"GET",headers:{...(auth?{authorization:auth}:{}),...(data?{"Content-Type":"application/json",Origin:otherOrigin}:{})},body:data?JSON.stringify(data):undefined});
const json=async(r,status)=>{assert.equal(r.status,status,await r.clone().text());return r.json();};
try{
 let ready=false;
 for(let attempt=0;attempt<45;attempt++){try{const r=await rest(null,"");if(r.status===401){ready=true;break;}}catch{};await new Promise(r=>setTimeout(r,750));}
 assert.ok(ready);
 const initial=await json(await fetch(origin+"/api/reports?format=dashboard",{headers:{authorization}}),200);
 assert.equal(initial.reports.length,0);
 assert.equal(initial.clientPlans.find(x=>x.name==="MB Heritage").baseFee,300);
 assert.equal(initial.clientPlans.find(x=>x.name==="MB Heritage").includedReturns,50);
 assert.equal(initial.clientPlans.find(x=>x.name==="CTH").baseFee,800);
 assert.ok(!initial.clientPlans.some(x=>x.name==="DGM Group"));
 const retired=await fetch(origin+"/api/returns",{method:"POST",headers:{authorization,"content-type":"application/json"},body:JSON.stringify({clientName:"DGM Group",dateReceived:"2026-11-27",carrier:"UPS",condition:"Unknown",status:"On Hold",actionTaken:"Hold for review"})});
 assert.match((await json(retired,410)).error,/no longer accepting returns/);
 assert.equal((await fetch(origin+"/intake/clients")).status,401);
 const html=await fetch(origin+"/intake",{headers:{authorization}});
 assert.equal(html.status,200);assert.match(await html.text(),/returnlab-staff-logo\.png/);
 assert.equal((await fetch(origin+"/returnlab-staff-logo.png")).status,200);
 for(const path of ["/reports","/intake/legacy"]){
   const page=await fetch(origin+path,{headers:{authorization}});
   assert.equal(page.status,200);
   const markup=await page.text();
   assert.match(markup,/returnlab-staff-logo\.png/);
   assert.doesNotMatch(markup,/<option[^>]*>DGM Group<\/option>/);
 }
 await json(await rest({action:"createCompany",name:"No"}, ""),401);
 await json(await rest({action:"createCompany",name:"Cross origin"},authorization,"","https://other.example"),403);
 const a=(await json(await rest({action:"createCompany",name:"Fixture A",checklist:"Condition\nAccessories",monthlyFee:320,includedReturns:45,overageFee:5}),201)).company;
 const b=(await json(await rest({action:"createCompany",name:"Fixture B"}),201)).company;
 assert.equal(a.monthly_fee,320);
 await json(await rest({action:"grantAccess",clientId:a.id,email:" CLIENT@example.test  "}),200);
 await json(await rest({action:"grantAccess",clientId:b.id,email:"client@example.test"}),409);
 assert.equal(postToOtp,0);
 await json(await rest({action:"grantAccess",clientId:companies[0].id,email:"staff-only@example.test"}),400);
 const cth=companies[0].id;
 const cthForm={action:"arrival",clientId:cth,received:"2026-11-27",carrier:"UPS",qty:1,tracking:"FIXTURE-CTH-1",returnReason:"Test reason"};
 const cthRow=(await json(await rest(cthForm),201)).entry;
 assert.equal(cthRow.status,"Received");
 assert.equal(cthRow.storage_until,null);
 assert.equal(cthRow.tracking_number,"FIXTURE-CTH-1");
 assert.match(cthRow.merchant_return_id,/^CTH-/);
 await json(await rest({...cthForm,tracking:"fixture-cth-1"}),409);
 const dispose={action:"completeCthDisposal",clientId:cth,id:cthRow.id,confirmCompleted:true};
 await json(await rest({...dispose,clientId:a.id}),400);
 const skipRow=(await json(await rest({...cthForm,tracking:"FIXTURE-CTH-SKIP"}),201)).entry;
 assert.equal(skipRow.action_taken,"Hold for review");
 const skipDisposal={...dispose,id:skipRow.id};
 await json(await rest({...skipDisposal,confirmCompleted:false}),400);
 const skipCompleted=(await json(await rest(skipDisposal),200)).entry;
 assert.equal(skipCompleted.status,"Disposed");
 assert.equal(skipCompleted.action_taken,"Dispose");
 assert.equal(skipCompleted.inspected_at??null,null);
 await json(await rest(skipDisposal),409);
 const cthInspection={action:"inspection",clientId:cth,id:cthRow.id,condition:"No visible issues",summary:"Staff only",findings:{},minutes:2};
 await json(await rest({...cthInspection,minutes:-1}),400);
 const cthInspected=(await json(await rest(cthInspection),200)).entry;
 assert.equal(cthInspected.status,"Processing");
 assert.equal(cthInspected.inspection_notes,"Staff only");
 assert.equal(cthInspected.client_summary,undefined);
 assert.equal(cthInspected.time_spent_minutes,2);
 const photo=new FormData();photo.set("returnId",String(cthRow.id));photo.set("category","Issue close-up");photo.set("clientVisible","true");photo.set("file",new Blob(["fixture"],{type:"image/png"}),"test.png");
 await json(await fetch(origin+"/api/returns/photos",{method:"POST",headers:{authorization},body:photo}),400);
 await json(await rest({...dispose,confirmCompleted:false}),400);
 const cthDisposed=(await json(await rest(dispose),200)).entry;
 assert.equal(cthDisposed.status,"Disposed");
 assert.equal(cthDisposed.action_taken,"Dispose");
 await json(await rest(dispose),409);
 await json(await rest(cthInspection),404);
 const form={action:"arrival",clientId:a.id,merchantReturnId:"MB-100",sku:"BACKGAMMON",received:"2026-11-27",carrier:"UPS",qty:1};
 const row=(await json(await rest(form),201)).entry;
 assert.equal(row.storage_until,"2026-12-27");assert.equal(row.status,"Received");assert.equal(row.action_taken,"Hold for review");
 const inspection={action:"inspection",clientId:a.id,id:row.id,condition:"No visible issues",summary:"Complete set.",findings:{check_0:true,check_1:true}};
 await json(await rest({...inspection,clientId:b.id,findings:{check_0:true,check_1:true}}),404);
 await json(await rest({...inspection,outcome:"Approved for resale"}),400);
 inspection.findings.check_1=false;
 const inspected=(await json(await rest(inspection),200)).entry;
 assert.ok(inspected.inspected_at);
 assert.equal(inspected.status,"On Hold");
 assert.equal(inspected.observed_condition,"No visible issues");
 assert.equal(inspected.inspection_outcome,"Client review required");
 assert.equal(entries.find(e=>e.id===row.id).action_taken,"Hold for review");
 assert.equal(inspected.client_summary,"Complete set.");
 const fulfill={action:"completeInstruction",clientId:a.id,id:row.id,instruction:"disposal_authorized",confirmCompleted:true};
 await json(await rest(fulfill),409);
 instructions.push({client_id:a.id,return_id:row.id,instruction:"disposal_authorized"});
 await json(await rest({...fulfill,confirmCompleted:false}),400);
 await json(await rest({...fulfill,instruction:"warehouse_hold"}),409);
 const completed=(await json(await rest(fulfill),200)).entry;
 assert.equal(completed.status,"Disposed");
 await json(await rest(fulfill),409);
 const bResult=await json(await rest(undefined,authorization,"?client="+b.id),200);
 assert.equal(bResult.returns.length,0);
 await json(await rest({action:"revokeAccess",clientId:a.id,email:"client@example.test"}),200);
 assert.equal(members[0].active,false);
 console.log("Staff smoke passed: page/authentication, company provisioning, access grant/revoke, arrival and inspection, company scoping.");
} finally {child.kill("SIGINT");server.close();}
