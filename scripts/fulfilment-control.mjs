// Administrative migration/control only. Never calls supplier APIs or sends notifications.
import nextEnv from '@next/env';
import { ClientSecretCredential } from '@azure/identity';
import fs from 'node:fs/promises';
nextEnv.loadEnvConfig(process.cwd());
const credential = new ClientSecretCredential(process.env.ADMIN_GRAPH_TENANT_ID, process.env.ADMIN_GRAPH_CLIENT_ID, process.env.ADMIN_GRAPH_CLIENT_SECRET);
const token = await credential.getToken('https://graph.microsoft.com/.default');
const site = process.env.ADMIN_GRAPH_SITE_ID;
const list = process.env.ADMIN_GRAPH_OPERATIONS_LIST_ID;
const base = `/sites/${site}/lists/${list}/items`;
async function graph(path, method='GET', body, etag) {
  const response=await fetch(`https://graph.microsoft.com/v1.0${path}`,{method,headers:{Authorization:`Bearer ${token.token}`,'Content-Type':'application/json',...(etag?{'If-Match':etag}:{})},body:body?JSON.stringify(body):undefined});
  if(response.status===204)return null;
  const json=await response.json(); if(!response.ok)throw Object.assign(new Error(`${method} ${response.status}: ${json.error?.message}`),{status:response.status});return json;
}
async function all(path){const rows=[];while(path){const page=await graph(path.replace('https://graph.microsoft.com/v1.0',''));rows.push(...page.value);path=page['@odata.nextLink'];}return rows;}
async function find(key){const page=await graph(`${base}?$expand=fields&$filter=${encodeURIComponent(`fields/RecordKey eq '${key.replaceAll("'","''")}'`)}`);return page.value[0];}
async function put(key,state,reference,data){if(await find(key))return false;await graph(base,'POST',{fields:{Title:key,RecordKey:key,RecordState:state,RecordPending:state==='Review'&&data.kind==='pay'&&!!data.supplierId,OrderReference:reference,RecordData:JSON.stringify(data)}});return true;}
const action=process.argv[2]??'inspect';
if(action==='inspect'||action==='seed'){
  const orders=await all(`/sites/${site}/lists/${process.env.ADMIN_GRAPH_ORDERS_LIST_ID}/items?$expand=fields`);
  const audit=[];let created=0;
  for(const item of orders){
    const f=item.fields;const reference=f.OrderReference;if(!reference)continue;
    const historical=!!(f.HiobuyOrderId||f.PayNowConfirmed||f.PayNowRequestedAt||f.ProcuredAt||f.InternalStatus!=='Awaiting Payment');
    if(!historical)continue;
    const stamp=new Date().toISOString();const common={actor:'migration',requestedAt:stamp,updatedAt:stamp,legacy:true,synced:true,notification:'Skipped'};
    const state=f.HiobuyOrderId?'Succeeded':'Review';
    if(action==='seed'){
      created+=Number(await put(`create:${reference}`,state,reference,{...common,kind:'create',supplierId:f.HiobuyOrderId,message:state==='Review'?'Historical order. Reconcile existing supplier activity before recording a verified result.':'Imported existing supplier order. No supplier request made.'}));
      if(f.HiobuyOrderId){
        const owner=await find(`supplier-owner:${f.HiobuyOrderId}`);
        if(owner&&owner.fields.OrderReference!==reference)throw new Error(`Supplier ID shared by ${reference} and another order. Resolve before activation.`);
        await put(`supplier-owner:${f.HiobuyOrderId}`,'SupplierOwner',reference,{reference});
        // Any historical supplier order may have had an unrecorded charge. Never assume unpaid.
        created+=Number(await put(`pay:${f.HiobuyOrderId}`,f.HiobuyPurchaseStatus==='Paid'?'Succeeded':'Review',reference,{...common,kind:'pay',supplierId:f.HiobuyOrderId,message:f.HiobuyPurchaseStatus==='Paid'?'Imported recorded payment. No supplier request made.':'Historical payment requires verification against supplier records. Do not repeat payment.'}));
      }
    }
    audit.push({reference,status:f.InternalStatus,supplierId:f.HiobuyOrderId??null,paymentStatus:f.HiobuyPurchaseStatus??null,paymentRequested:!!(f.PayNowConfirmed||f.PayNowRequestedAt),customerMatch:/mustafe/i.test(f.CustomerFullName??'')});
  }
  await fs.mkdir('.next/cache',{recursive:true});await fs.writeFile('.next/cache/fulfilment-audit.json',JSON.stringify(audit,null,2));
  console.log(JSON.stringify({orders:orders.length,historical:audit.length,recordsCreated:created,customerReferences:audit.filter(x=>x.customerMatch).map(x=>({reference:x.reference,status:x.status,paymentStatus:x.paymentStatus}))}));
}else if(action==='enable'||action==='disable'){
  const control=await find('control');const data=JSON.parse(control.fields.RecordData);
  if(action==='enable'){
    if(!process.argv.includes('--flows-disabled'))throw new Error('Confirm old flows are disabled with --flows-disabled.');
    if(!data.heartbeat||Date.now()-Date.parse(data.heartbeat)>120000)throw new Error('No fresh server worker heartbeat. Deploy the server first.');
    if(!process.argv.includes('--migration-reviewed'))throw new Error('Review historical migration before enabling.');
  }
  await graph(`${base}/${control.id}/fields`,'PATCH',{RecordData:JSON.stringify({...data,enabled:action==='enable',updatedAt:new Date().toISOString()})},control['@odata.etag']);
  console.log(`Worker ${action}d`);
}else if(action==='verify'){
  const key=`verification:${crypto.randomUUID()}`;await put(key,'Verification','', {test:true});
  const record=await find(key);
  let duplicateRejected=false, staleRejected=false;
  try{await graph(base,'POST',{fields:{Title:key,RecordKey:key,RecordState:'Verification',RecordData:'{}'}});}catch(e){duplicateRejected=e.status===400||e.status===409;}
  await graph(`${base}/${record.id}/fields`,'PATCH',{RecordState:'VerificationUpdated',RecordPending:true,RecordData:'{"test":true}'},record['@odata.etag']);
  try{await graph(`${base}/${record.id}/fields`,'PATCH',{RecordState:'Unsafe',RecordData:'{}'},record['@odata.etag']);}catch(e){staleRejected=e.status===412;}
  const pending=await graph(`${base}?$expand=fields&$filter=fields/RecordPending eq 1`);
  const pendingCorrect=pending.value.some(item=>item.id===record.id&&item.fields.RecordPending===true);
  await graph(`${base}/${record.id}`,'DELETE');
  if(!duplicateRejected||!staleRejected||!pendingCorrect)throw new Error('SharePoint atomicity checks failed.');
  console.log('Verified unique keys and ETag compare-and-swap on a disposable test record. No orders modified.');
}else throw new Error('Use inspect, seed, verify, enable or disable.');
