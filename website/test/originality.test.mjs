import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,basename,sep} from 'node:path';
import {Store} from '../server/store.mjs';
import {createJobs} from '../server/jobs.mjs';
import {createOriginality} from '../server/originality.mjs';
import {EngineError} from '../server/engine.mjs';

// Explicit local boundary fixtures: real SQLite and worker code; fake upstream
// replies only. No HTTP, generation, analysis algorithm, or media claim is made.
const REQUEST='35eb1dc6-4cc4-4cf1-8ae8-d316642b92c8';
let serial=0;
const initial=()=>({success:true,request_id:REQUEST,tracks:[{take:1,kind:'delivered master'}],
  originality_gate:{status:'pending',measured:false,poll:'https://NEVER-FOLLOW.invalid/private?token=SECRET'}});
const completed=()=>({success:true,status:'complete',verdict:{measured:true,bars_status:'CALIBRATED',
  bars_status_per_axis:{axis1_monotony:'CALIBRATED',axis2_similarity:'NOT_RUN'},
  axis1_monotony:{take:'take_1',verdict:'PASS',lag_scan:{max_block_repeat_fraction:0.01,best_lag_seconds:2,ran:true},verdict_basis:{lag_scan_bar:0.14}},
  axis2_similarity:{verdict:'NOT_APPLICABLE',take_count:1}}});
function seed(store,{result=initial(),requested=true,status='ready'}={}){
  const id=++serial;
  const job=store.admit({owner:'originality-owner-'+id,ipKey:'originality-ip-'+id,idem:'originality-idem-'+id,
    payload:{prompt:'Explicit local test fixture',run_originality_gate:requested},limits:{daily:1000,owner:100,ip:100}}).job;
  return store.updateJob(job.id,{status,result});
}
function worker(t,store,originality,clock={value:10000}){
  const notices=[];
  const engine={originality,submit(){assert.fail('Analysis must never POST music');},job(){assert.fail('Wrong endpoint');}};
  const value=createOriginality({store,engine,onError:n=>notices.push(n),now:()=>clock.value,tickIntervalMs:60000});
  t.after(()=>value.stop());
  return {value,notices,clock};
}

test('only true opt-in and actual pending delivery creates a schedule; poll URL is ignored',async t=>{
  const store=new Store(':memory:');t.after(()=>store.close());
  seed(store,{requested:false});seed(store,{requested:'true'});
  seed(store,{result:{success:true,request_id:REQUEST,originality_gate:{measured:false,opt_in:true}}});
  seed(store,{result:{success:true,request_id:REQUEST,originality_gate:{status:'unavailable',measured:false}}});
  seed(store,{result:{success:false,request_id:REQUEST,originality_gate:{status:'pending'}}});
  const job=seed(store);let calls=0;
  const {value,clock}=worker(t,store,async id=>{calls++;assert.equal(id,REQUEST);return completed();});
  await value.start();assert.equal(calls,0);
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM analysis_records').get().n,1);
  assert.equal(store.originality(job.id).next_poll_at,15000);
  clock.value=14999;await value.wake();assert.equal(calls,0);
  clock.value=15000;await value.wake();assert.equal(calls,1);
  assert.equal(store.originality(job.id).status,'complete');
  clock.value=999999;await value.wake();assert.equal(calls,1);
});

test('complete per-axis result is separate from the immutable initial envelope and playback job state',async t=>{
  const store=new Store(':memory:');t.after(()=>store.close());
  const job=seed(store),envelope=store.job(job.id).result,poll=completed();
  poll.verdict.private_url='PRIVATE_RESULT_SENTINEL';
  const {value,clock}=worker(t,store,async()=>poll);
  await value.start();clock.value+=5000;await value.wake();
  assert.equal(store.job(job.id).result,envelope);assert.equal(store.job(job.id).status,'ready');
  assert.deepEqual(JSON.parse(store.originality(job.id).result),poll);
  const visible=store.publicJob(store.job(job.id));
  assert.equal(visible.summary.originality.state,'complete');
  assert.equal(visible.summary.originality.axes.monotony.verdict,'PASS');
  assert.equal(visible.summary.originality.axes.similarity.verdict,'NOT_APPLICABLE');
  assert.equal(visible.summary.originality.polling.attempts,1);
  assert.ok(!JSON.stringify(visible).includes('PRIVATE_RESULT_SENTINEL'));
  assert.ok(!JSON.stringify(visible).includes('NEVER-FOLLOW'));
});

test('documented success:true failed is terminal; no-record requires an actual HTTP404',async t=>{
  const store=new Store(':memory:');t.after(()=>store.close());
  const jobs=[seed(store),seed(store)];let calls=0;
  const raw404={success:false,request_id:REQUEST,error:'PRIVATE_NO_RECORD'};
  const failure={success:true,status:'failed',reason:'PRIVATE_ANALYSIS_FAILURE'};
  const {value,clock,notices}=worker(t,store,async()=>{
    if(calls++===0)return failure;
    throw new EngineError('ENGINE_UPSTREAM_ERROR','Safe engine message',{upstreamStatus:404,upstreamBody:raw404});
  });
  await value.start();clock.value+=5000;await value.wake();
  assert.equal(store.originality(jobs[0].id).status,'failed');
  assert.equal(store.originality(jobs[1].id).status,'no-record');
  assert.deepEqual(JSON.parse(store.originality(jobs[0].id).result),failure);
  assert.deepEqual(JSON.parse(store.originality(jobs[1].id).result),raw404);
  assert.equal(store.publicJob(store.job(jobs[1].id)).summary.originality.state,'no-record');
  for(const job of jobs){assert.equal(store.job(job.id).status,'ready');assert.ok(!JSON.stringify(store.publicJob(store.job(job.id))).includes('PRIVATE_'));}
  assert.ok(!JSON.stringify(notices).includes('PRIVATE_'));
  clock.value+=100000;await value.wake();assert.equal(calls,2);
});

test('429/connection/malformed replies preserve raw error evidence and retry with no playback failure',async t=>{
  const store=new Store(':memory:');t.after(()=>store.close());
  const job=seed(store);let calls=0;
  const raw={success:false,error:'PRIVATE_RATE_LIMIT'};
  const malformed={success:true,status:'complete',verdict:'INCORRECT_FLAT_PASS',private:'PRIVATE_MALFORMED'};
  const {value,clock,notices}=worker(t,store,async()=>{
    calls++;
    if(calls===1)throw new EngineError('RATE_LIMITED','Safe engine message',{upstreamStatus:429,upstreamBody:raw});
    if(calls===2)throw Error('PRIVATE_NETWORK_MESSAGE');
    if(calls===3)return malformed;
    return completed();
  });
  await value.start();clock.value+=5000;await value.wake();
  let row=store.originality(job.id);assert.equal(row.status,'pending');assert.equal(row.http_status,429);
  assert.deepEqual(JSON.parse(row.error_response),raw);
  clock.value=row.next_poll_at;await value.wake();row=store.originality(job.id);
  assert.equal(row.status,'pending');assert.equal(row.http_status,null);
  clock.value=row.next_poll_at;await value.wake();row=store.originality(job.id);
  assert.equal(row.status,'pending');assert.deepEqual(JSON.parse(row.error_response),malformed);
  assert.equal(store.publicJob(store.job(job.id)).summary.originality.state,'pending');
  clock.value=row.next_poll_at;await value.wake();assert.equal(store.originality(job.id).status,'complete');
  assert.equal(store.job(job.id).status,'ready');assert.ok(!JSON.stringify(notices).includes('PRIVATE_'));
});

test('invalid or missing request_id never falls back to the response URL, and auth failure stops retries',async t=>{
  const store=new Store(':memory:');t.after(()=>store.close());
  const bad=initial();bad.request_id='../unsafe';const missing=initial();delete missing.request_id;
  const nonUuid=initial();nonUuid.request_id='safe-token-but-not-the-documented-UUIDv4';
  const invalidJobs=[seed(store,{result:bad}),seed(store,{result:missing}),seed(store,{result:nonUuid})],valid=seed(store);let calls=0;
  const {value,clock}=worker(t,store,async()=>{calls++;throw new EngineError('CONFIG_ERROR','Private configuration message',{upstreamStatus:403,upstreamBody:'PRIVATE_AUTH_BODY'});});
  await value.start();
  for(const job of invalidJobs){assert.equal(store.originality(job.id).status,'unavailable');assert.equal(store.originality(job.id).request_id,null);}
  clock.value+=5000;await value.wake();assert.equal(calls,1);assert.equal(store.originality(valid.id).status,'unavailable');
  assert.equal(JSON.parse(store.originality(valid.id).error_response),'PRIVATE_AUTH_BODY');
  assert.ok(!JSON.stringify(store.publicJob(store.job(valid.id))).includes('PRIVATE_AUTH_BODY'));
  clock.value+=100000;await value.wake();assert.equal(calls,1);
});

test('SQLite restart preserves the 5→8→12→20→30 second schedule and attempts',async t=>{
  const folder=await mkdtemp(join(tmpdir(),'pmp-originality-')),file=join(folder,'analysis.sqlite');
  const clock={value:10000};let store=new Store(file),active,calls=0;
  t.after(async()=>{active?.stop();store?.close();const target=resolve(folder);assert.ok(target.startsWith(resolve(tmpdir())+sep)&&basename(target).startsWith('pmp-originality-'));await rm(target,{recursive:true,force:true});});
  const job=seed(store),initialText=store.job(job.id).result;
  const make=()=>createOriginality({store,engine:{async originality(){calls++;return {success:true,status:'pending',measured:false};}},now:()=>clock.value,tickIntervalMs:60000});
  active=make();await active.start();let expected=15000;
  for(const delay of [8000,12000,20000,30000,30000]){
    assert.equal(store.originality(job.id).next_poll_at,expected);
    clock.value=expected-1;await active.wake();const previous=calls;
    active.stop();store.close();store=new Store(file);active=make();await active.start();assert.equal(calls,previous);
    clock.value=expected;await active.wake();assert.equal(calls,previous+1);
    expected+=delay;
    assert.equal(store.originality(job.id).next_poll_at,expected);
    assert.equal(store.originality(job.id).poll_count,calls);
    assert.equal(store.job(job.id).result,initialText);
  }
});

test('snapshot claims and stale completions use an atomic version, while stop settles the in-flight GET',async t=>{
  const store=new Store(':memory:');t.after(()=>store.close());
  const job=seed(store);store.registerOriginality(job.id,10000);
  const snapshot=store.dueOriginality(15000)[0],claim=store.claimOriginality(snapshot,15000);
  assert.ok(claim);assert.equal(store.claimOriginality(snapshot,15000),null);
  const newer=store.claimOriginality(store.dueOriginality(23000)[0],23000);assert.ok(newer);
  assert.equal(store.finishOriginality(claim,{status:'complete',result:completed()},23000),false);
  assert.equal(store.finishOriginality(newer,{status:'pending',result:{success:true,status:'pending'}},23000),true);
  let release,calls=0;const clock={value:store.originality(job.id).next_poll_at};
  const {value}=worker(t,store,async()=>{calls++;return await new Promise(resolve=>{release=resolve;});},clock);
  const pendingTick=value.start();assert.equal(value.running,true);value.stop();
  release(completed());await pendingTick;assert.equal(value.running,false);assert.equal(calls,1);
  assert.equal(store.originality(job.id).status,'complete');
  clock.value+=100000;await value.wake();assert.equal(calls,1);
});

test('generation worker registers analysis before ingest; unavailable analysis never prevents ready media',async t=>{
  const store=new Store(':memory:');t.after(()=>store.close());
  const job=seed(store,{status:'ingesting'});let ingested=false;
  const jobs=createJobs({store,engine:{submit(){assert.fail('No paid generation');}},media:{async ingest(id){
    assert.equal(id,job.id);assert.equal(store.originality(job.id).status,'pending');ingested=true;return {status:'ready',takes:[]};
  }}});
  t.after(()=>jobs.stop());jobs.wake();while(jobs.running)await new Promise(resolve=>setImmediate(resolve));
  assert.equal(ingested,true);assert.equal(store.job(job.id).status,'ready');
  assert.equal(store.originality(job.id).status,'pending');
});

test('failed generation preserves the complete raw upstream reply, never only its public error',async t=>{
  const store=new Store(':memory:');t.after(()=>store.close());
  const raw={success:false,error_code:'RENDER_FAILED',error:'PRIVATE_SOURCE_LOCATION',vendor_refusal:{detail:'PRIVATE_VENDOR_DETAIL'}};
  const job=seed(store,{status:'queued',result:null});let posts=0;
  const jobs=createJobs({store,engine:{async submit(){posts++;throw new EngineError('RENDER_FAILED','The generated music could not be prepared for delivery.',{upstreamStatus:500,upstreamBody:raw});}},media:{}});
  t.after(()=>jobs.stop());jobs.wake();while(jobs.running)await new Promise(resolve=>setImmediate(resolve));
  assert.equal(posts,1);assert.deepEqual(JSON.parse(store.job(job.id).result),raw);
  assert.equal(store.job(job.id).status,'failed');assert.ok(!JSON.stringify(store.publicJob(store.job(job.id))).includes('PRIVATE_'));
  assert.equal(store.originality(job.id),undefined);
});
