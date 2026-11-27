import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {createServer} from "node:http";
import {once} from "node:events";
import {randomUUID} from "node:crypto";
const instructions=[];
const companies=[{id:randomUUID(),name:"CTH",active:true,portal_enabled:false,included_storage_days:0,checklist:[]}], members=[], entries=[], users=new Map();
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
    if(req.method==="POST"){const row={id:entries.length+1,...input};entries.push(row);return reply([row],201);}
    const status=qs("status");
    const matched=entries.filter(r=>r.client_id===qs("client_id")&&(!qs("id")||r.id===Number(qs("id")))&&(!status||(status.startsWith("in.(")?status.slice(4,-1).split(",").includes(r.status):r.status===status)));
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
 assert.equal((await fetch(origin+"/intake/clients")).status,401);
 const html=await fetch(origin+"/intake",{headers:{authorization}});
 assert.equal(html.status,200);assert.match(await html.text(),/Client workspaces/);
 await json(await rest({action:"createCompany",name:"No"}, ""),401);
 await json(await rest({action:"createCompany",name:"Cross origin"},authorization,"","https://other.example"),403);
 const a=(await json(await rest({action:"createCompany",name:"Fixture A",checklist:"Condition\nAccessories",monthlyFee:320,includedReturns:45,overageFee:5}),201)).company;
 const b=(await json(await rest({action:"createCompany",name:"Fixture B"}),201)).company;
 assert.equal(a.monthly_fee,320);
 await json(await rest({action:"grantAccess",clientId:a.id,email:" CLIENT@example.test  "}),200);
 await json(await rest({action:"grantAccess",clientId:b.id,email:"client@example.test"}),409);
 assert.equal(postToOtp,0);
 await json(await rest({action:"grantAccess",clientId:companies[0].id,email:"staff-only@example.test"}),400);
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
 assert.equal(inspected.condition,"No visible issues");
 assert.equal(inspected.inspection_outcome,"Client review required");
 assert.equal(entries[0].action_taken,"Hold for review");
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
