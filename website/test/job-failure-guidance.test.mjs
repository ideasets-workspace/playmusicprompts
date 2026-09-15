import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {publicFailure,createJobs} from '../server/jobs.mjs';
import {EngineError} from '../server/engine.mjs';
import {Store} from '../server/store.mjs';
import {projectControlsSchema} from '../server/validation.mjs';

// Sanitized copies of documented error structures, plus hostile boundary data.
// No external service or paid generation is used by these tests.
const failure=(body,status=400)=>new EngineError(body.error_code||'ENGINE_UPSTREAM_ERROR','PRIVATE_ENGINE_MESSAGE',{upstreamStatus:status,upstreamBody:body});
test('docs400 refused-string shapes identify settings and useful correction types',()=>{
  const raw={success:false,error_code:'INVALID_REQUEST',error:'PRIVATE_INPUT',caller_action:'PRIVATE_ACTION',refused:[
    'prompt: required',"route: value 'PRIVATE_ROUTE' not in allowed set",'seed: value -1 < min 0',
    'variation_count: not active for output_package=<default>',"references[0].kind: value 'PRIVATE_REFERENCE' not in allowed set"]};
  const e=publicFailure(failure(raw));
  assert.equal(e.code,'INVALID_REQUEST');assert.deepEqual(e.fields.map(f=>[f.path,f.code]),[
    ['prompt','REQUIRED'],['route','ENUM'],['seed','RANGE'],['variation_count','INACTIVE_FIELD'],['references[0].kind','ENUM']]);
  assert.match(e.message,/prompt, route, seed/);assert.match(e.fields[3].message,/Choose Variations/);
  assert.ok(!JSON.stringify(e).includes('PRIVATE_'));assert.equal(e.omittedDetails,0);
});

test('docs422 language rejection names language and policy without claiming current universal language support',()=>{
  const raw={success:false,error_code:'LANGUAGE_NOT_PROVEN',refused:["vocal.language: 'tr' not SINGING_PROVEN; PRIVATE_CORPUS_DETAIL"]};
  const e=publicFailure(failure(raw,422));
  assert.deepEqual(e.fields.map(f=>f.path),['vocal.language','vocal.language_policy']);
  assert.match(e.message,/recorded fallback/);assert.ok(!JSON.stringify(e).includes('PRIVATE_'));
  assert.ok(!e.message.includes('English is the only'));
});

test('unknown-field prose, fake typed entries, private URLs and arbitrary codes cannot escape',()=>{
  const raw={error_code:'PRIVATE_CODE',refused:["unknown field(s) ['PRIVATE_NAME'] refused; this endpoint accepts exactly: ['prompt']",
    'https://private.invalid/token: required','labels.PRIVATE_KEY: required','prompt<script>: required',
    {path:'prompt',message:'PRIVATE_MESSAGE'},'seed: <img src=PRIVATE_PAYLOAD>'],error:'PRIVATE_ERROR',auth:{token:'PRIVATE_TOKEN'}};
  const e=publicFailure({code:'PRIVATE_CODE',upstreamBody:raw,message:'PRIVATE_OUTER'});
  assert.equal(e.code,'SERVICE_UNAVAILABLE');assert.deepEqual(e.fields.map(f=>f.path),['seed']);assert.equal(e.omittedDetails,5);
  assert.ok(!JSON.stringify(e).includes('PRIVATE_'));assert.ok(!JSON.stringify(e).includes('https:'));assert.ok(!JSON.stringify(e).includes('<'));
  assert.equal(publicFailure({upstreamBody:Object.create({error_code:'INVALID_REQUEST',refused:['prompt: required']})}).fields.length,0);
});

test('every current safe schema path can be identified without copying a refused value',()=>{
  const snapshot=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json',import.meta.url),'utf8'));
  const paths=new Set();function walk(node){paths.add(node.path);for(const child of node.fields||[])walk(child);if(node.items)walk(node.items);}
  for(const field of projectControlsSchema(snapshot).parameters)walk(field);
  for(const path of paths){
    const sample=path.replaceAll('[]','[0]');
    const e=publicFailure(failure({error_code:'INVALID_REQUEST',refused:[`${sample}: value 'PRIVATE_VALUE' not in allowed set`]}));
    assert.equal(e.fields[0]?.path,sample,path);assert.ok(!JSON.stringify(e).includes('PRIVATE_VALUE'));
  }
  assert.ok(paths.size>=100);
});

test('content-check instrument failure is not described as rejection of the owner text',()=>{
  const e=publicFailure(failure({error_code:'CONTENT_REFUSED',content_safety:{instrument_failure:true,fields_checked:['prompt','lyrics.text'],reason:'PRIVATE_REASON'}}));
  assert.match(e.message,/has not been judged/);assert.deepEqual(e.fields,[]);
});

test('refusal extraction is bounded and does not turn an unknown failed assertion into a success',()=>{
  const e=publicFailure(failure({error_code:'INVALID_REQUEST',refused:Array.from({length:100},()=>('prompt: '+ 'x'.repeat(5000)))}));
  assert.equal(e.fields.length,0);assert.equal(e.omittedDetails,100);assert.equal(e.code,'INVALID_REQUEST');
  assert.ok(e.message.length<150);
});

let serial=0;
function admit(store){const n=++serial;return store.admit({owner:'guidance-'+n,ipKey:'guidance-ip-'+n,idem:'guidance-idem-'+n,payload:{prompt:'Explicit test fixture'},limits:{daily:100,owner:100,ip:100}}).job;}
async function drain(worker){worker.wake();while(worker.running)await new Promise(resolve=>setImmediate(resolve));}

test('a confirmed generation with blocked audio tools preserves the result and reports delivery failure without replay',async t=>{
  const store=new Store(':memory:');t.after(()=>store.close());const job=admit(store);let posts=0,ingests=0;
  const generated={success:true,request_id:'delivery-fixture',tracks:[],auth:{token:'PRIVATE_GENERATION_RECEIPT'}};
  const manifest={status:'failed',takes:[{take:1,status:'failed',master:null,listening:null,errors:[{code:'MISSING_TOOLS'}]}]};
  const worker=createJobs({store,engine:{async submit(){posts++;return generated;}},media:{async ingest(){ingests++;return manifest;}}});t.after(()=>worker.stop());
  await drain(worker);await drain(worker);
  assert.equal(posts,1);assert.equal(ingests,1);assert.deepEqual(JSON.parse(store.job(job.id).result),generated);
  const visible=store.publicJob(store.job(job.id));assert.equal(visible.status,'ingest_failed');assert.equal(visible.error.code,'DELIVERY_UNAVAILABLE');
  assert.match(visible.error.message,/generation record is saved/);assert.equal(visible.tracks.length,0);
  assert.ok(!JSON.stringify(visible).includes('PRIVATE_GENERATION_RECEIPT'));
});
test('sync engine refusal preserves the exact private body and never replays a failed POST',async t=>{
  const store=new Store(':memory:');t.after(()=>store.close());const job=admit(store);let posts=0;
  const raw={success:false,error_code:'INVALID_REQUEST',refused:['duration.target_seconds: value 999 > max 240'],auth:{private:'PRIVATE_AUTH'}};
  const worker=createJobs({store,engine:{async submit(){posts++;throw failure(raw);}},media:{}});t.after(()=>worker.stop());
  await drain(worker);await drain(worker);
  assert.equal(posts,1);assert.deepEqual(JSON.parse(store.job(job.id).result),raw);
  const visible=store.publicJob(store.job(job.id));assert.equal(visible.error.fields[0].path,'duration.target_seconds');assert.ok(!JSON.stringify(visible).includes('PRIVATE_AUTH'));
});

test('async failed envelope retains existing playable takes and reports safe guidance',async t=>{
  const store=new Store(':memory:');t.after(()=>store.close());const job=admit(store);
  const trackId='9'.repeat(64);
  store.publish(job,{status:'ready',takes:[{id:trackId,take:1,status:'ready',master:{id:'a'.repeat(64)},listening:{id:'b'.repeat(64)}}]});
  store.updateJob(job.id,{status:'pending',upstreamId:'existing-test-job'});
  const raw={success:true,status:'failed',http_status:422,error:{success:false,error_code:'LANGUAGE_NOT_PROVEN',refused:['vocal.language: PRIVATE_LANGUAGE_DETAIL']}};
  let polls=0;
  const worker=createJobs({store,engine:{submit(){assert.fail('No automatic POST');},async job(){polls++;return raw;}},media:{}});t.after(()=>worker.stop());
  await drain(worker);await drain(worker);
  assert.equal(polls,1);assert.deepEqual(JSON.parse(store.job(job.id).result),raw);
  const visible=store.publicJob(store.job(job.id));assert.equal(visible.status,'failed');assert.equal(visible.tracks[0].id,trackId);
  assert.equal(visible.error.fields[0].path,'vocal.language');assert.ok(!JSON.stringify(visible).includes('PRIVATE_LANGUAGE_DETAIL'));
});
