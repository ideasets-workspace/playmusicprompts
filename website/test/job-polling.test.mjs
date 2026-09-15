import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,basename,sep} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {Store} from '../server/store.mjs';
import {EngineError} from '../server/engine.mjs';
import {createJobs} from '../server/jobs.mjs';

// All upstream statuses and media below are explicit isolated fixtures. Real
// SQLite and worker code are exercised; there are no HTTP or generation calls.
const marker='PRIVATE_POLL_FIXTURE';
const accepted={success:true,status:'queued',job_id:'job-fixture',request_id:'ce50eae7-9c6e-4cde-904c-9333d7fa7b2a'};
const limits={daily:100,owner:100,ip:100};
function admit(store){const row=store.admit({owner:'poll-owner',ipKey:'poll-ip',idem:'poll-request-fixture',payload:{prompt:'Explicit test fixture',async:true},limits}).job;
  store.updateJob(row.id,{status:'pending',upstreamId:'job-fixture',result:accepted});return store.job(row.id);}
function failure(status,body={success:false,error:marker}){return new EngineError('ENGINE_UPSTREAM_ERROR',marker,{upstreamStatus:status,upstreamBody:body});}
async function drain(worker){worker.wake();const end=Date.now()+2000;while(worker.running){assert.ok(Date.now()<end,'Test worker must settle.');await new Promise(resolve=>setImmediate(resolve));}}
function fixture(t,get){
  const store=new Store(':memory:'),job=admit(store);let clock=Date.UTC(2026,8,12,12),calls=0;
  const worker=createJobs({store,engine:{submit(){assert.fail('A status check must not create music.');},async job(id){calls++;assert.equal(id,'job-fixture');return get(calls);}},media:{},now:()=>clock});
  t.after(()=>{worker.stop();store.close();});
  return{store,job,worker,advance(ms){clock+=ms;},get clock(){return clock;},get calls(){return calls;},saved(){return store.job(job.id);},poll(){return store.db.prepare('SELECT * FROM generation_job_polls WHERE job_id=?').get(job.id);}};
}

test('poll: transient failure is visible, durable, backed off and clears on a confirmed unchanged state',async t=>{
  const raw={success:false,error:marker,auth:{key:marker}},f=fixture(t,async n=>{if(n===1)throw failure(503,raw);return accepted;});
  await drain(f.worker);assert.equal(f.saved().status,'pending');assert.equal(f.saved().error&&JSON.parse(f.saved().error).code,'JOB_STATUS_UNAVAILABLE');
  assert.deepEqual(JSON.parse(f.saved().result),accepted);assert.deepEqual(JSON.parse(f.poll().error).body,raw);
  assert.equal(f.poll().next_poll_at,f.clock+5000);assert.equal(f.poll().failures,1);
  for(let n=0;n<3;n++)await drain(f.worker);assert.equal(f.calls,1);
  assert.ok(!JSON.stringify(f.store.publicJob(f.saved())).includes(marker));
  f.advance(5000);await drain(f.worker);assert.equal(f.calls,2);assert.equal(f.store.publicJob(f.saved()).error,null);
  assert.equal(f.poll().failures,0);assert.deepEqual(JSON.parse(f.poll().error).body,raw,'Last private failure remains available after recovery.');assert.deepEqual(JSON.parse(f.poll().response),accepted);
});

test('poll: 401/403/404 pause as uncertainty, preserve the receipt and never loop or report failed generation',async t=>{
  for(const status of [401,403,404]){
    const f=fixture(t,async()=>{throw failure(status);});await drain(f.worker);
    assert.equal(f.saved().status,'uncertain');assert.equal(f.poll().state,'paused');assert.equal(f.poll().next_poll_at,null);
    assert.equal(JSON.parse(f.saved().error).code,status===404?'JOB_STATUS_NOT_FOUND':'JOB_STATUS_ACCESS_UNAVAILABLE');
    assert.deepEqual(JSON.parse(f.saved().result),accepted);assert.equal(f.poll().http_status,status);
    f.advance(86400000);await drain(f.worker);assert.equal(f.calls,1);
    assert.ok(!JSON.stringify(f.store.publicJob(f.saved())).includes(marker));
  }
});

test('poll: explicit retry is owner-scoped and changes only the saved status-check schedule',async t=>{
  const f=fixture(t,async n=>{if(n===1)throw failure(404);return {...accepted,status:'processing'};});await drain(f.worker);
  assert.throws(()=>f.worker.retryStatus({id:f.job.id,owner:'different-owner'}),{status:404});
  const resumed=f.worker.retryStatus({id:f.job.id,owner:'poll-owner'});assert.equal(resumed.status,'pending');assert.equal(f.store.publicJob(resumed).error,null);
  assert.deepEqual(JSON.parse(resumed.payload),{prompt:'Explicit test fixture',async:true});assert.equal(resumed.upstream_id,'job-fixture');
  assert.equal(f.calls,1,'Retry admission itself does not dispatch an engine call.');
  await drain(f.worker);assert.equal(f.calls,2);assert.equal(JSON.parse(f.saved().result).status,'processing');
  assert.throws(()=>f.worker.retryStatus({id:f.job.id,owner:'poll-owner'}),{status:409});
  assert.equal(f.store.db.prepare("SELECT count FROM counters WHERE key LIKE 'generation:global:%'").get().count,1);
});

test('poll: increasing backoff persists through a SQLite close/reopen and does not reset on a wake',async()=>{
  const folder=await mkdtemp(join(tmpdir(),'pmp-job-poll-')),file=join(folder,'jobs.sqlite');let store,worker,clock=Date.UTC(2026,8,12),calls=0;
  const engine={submit(){assert.fail('No generation replay');},async job(){calls++;throw failure(502);}};
  try{
    store=new Store(file);const job=admit(store);worker=createJobs({store,engine,media:{},now:()=>clock});
    for(const delay of [5000,8000,12000]){
      await drain(worker);const row=store.db.prepare('SELECT * FROM generation_job_polls').get();assert.equal(row.next_poll_at-clock,delay);
      worker.stop();store.close();store=new Store(file);worker=createJobs({store,engine,media:{},now:()=>clock});
      const before=calls;await drain(worker);assert.equal(calls,before);clock+=delay;
    }
    for(const delay of [20000,30000,30000]){await drain(worker);const row=store.db.prepare('SELECT * FROM generation_job_polls').get();assert.equal(row.next_poll_at-clock,delay);clock+=delay;}
    assert.equal(calls,6);assert.equal(store.job(job.id).status,'pending');
    store.db.prepare("UPDATE generation_job_polls SET state='running' WHERE job_id=?").run(job.id);
    worker.stop();store.close();store=new Store(file);worker=createJobs({store,engine,media:{},now:()=>clock});
    await drain(worker);assert.equal(calls,7,'Only the interrupted read is resumable.');
  }finally{worker?.stop();store?.close();const target=resolve(folder);assert.ok(target.startsWith(resolve(tmpdir())+sep)&&basename(target).startsWith('pmp-job-poll-'));await rm(target,{recursive:true,force:true});}
});

test('poll: reported429 reset seconds and UTC day are respected without exposing the upstream quota identity',async t=>{
  const f=fixture(t,async n=>{throw failure(429,n===1?{auth:{limit:{reset_seconds:70},account:marker}}:{limit:{resets:'next UTC day'}});});
  await drain(f.worker);assert.equal(f.poll().next_poll_at-f.clock,70000);f.advance(69999);await drain(f.worker);assert.equal(f.calls,1);
  f.advance(1);await drain(f.worker);assert.equal(f.calls,2);assert.equal(f.poll().next_poll_at,Date.UTC(2026,8,13));
  assert.ok(!JSON.stringify(f.store.publicJob(f.saved())).includes(marker));
});

test('poll: malformed success does not erase the last observed state and a failed envelope retains existing takes',async t=>{
  const failed={success:true,status:'failed',http_status:422,error:{success:false,error_code:'INVALID_REQUEST',refused:['seed: < min 0'],auth:{token:marker}}};
  const f=fixture(t,async n=>n===1?{success:true,status:'complete',response:null,auth:marker}:failed);
  const trackId='b'.repeat(64);f.store.publish(f.saved(),{status:'ready',takes:[{id:trackId,take:1,status:'ready',master:{id:'c'.repeat(64)},listening:{id:'d'.repeat(64)}}]});
  await drain(f.worker);assert.equal(f.saved().status,'pending');assert.deepEqual(JSON.parse(f.saved().result),accepted);assert.equal(f.poll().state,'active');
  f.advance(5000);await drain(f.worker);assert.equal(f.saved().status,'failed');assert.deepEqual(JSON.parse(f.saved().result),failed);
  const visible=f.store.publicJob(f.saved());assert.equal(visible.tracks[0].id,trackId);assert.equal(visible.error.fields[0].path,'seed');assert.ok(!JSON.stringify(visible).includes(marker));
  assert.equal(f.poll().state,'complete');await drain(f.worker);assert.equal(f.calls,2);
});

test('poll: unsafe stored identifier is quarantined before a request and cannot be explicitly retried',async t=>{
  const f=fixture(t,async()=>assert.fail('No arbitrary URL forwarding'));
  f.store.updateJob(f.job.id,{upstreamId:'https://private.fixture.invalid/job'});await drain(f.worker);
  assert.equal(f.calls,0);assert.equal(f.saved().status,'uncertain');assert.equal(JSON.parse(f.saved().error).code,'JOB_STATUS_ID_INVALID');
  assert.throws(()=>f.worker.retryStatus({id:f.job.id,owner:'poll-owner'}),{status:409});
});

test('poll: two workers atomically claim one status request while its physical read is outstanding',async t=>{
  const store=new Store(':memory:'),job=admit(store);let release,calls=0;
  const gate=new Promise(resolve=>release=resolve),engine={submit(){assert.fail('No POST');},async job(){calls++;await gate;return accepted;}};
  const one=createJobs({store,engine,media:{}}),two=createJobs({store,engine,media:{}});
  try{one.wake();await Promise.resolve();await drain(two);assert.equal(calls,1);assert.equal(store.db.prepare('SELECT state FROM generation_job_polls WHERE job_id=?').get(job.id).state,'running');}
  finally{release();while(one.running)await new Promise(resolve=>setImmediate(resolve));one.stop();two.stop();store.close();}
});

test('poll: process exit directly after a terminal poll commit leaves a restartable ingestion or durable failure',async()=>{
  const folder=await mkdtemp(join(tmpdir(),'pmp-job-poll-crash-'));
  try{
    for(const terminal of ['complete','failed']){
      const file=join(folder,terminal+'.sqlite');
      // Exit after the transaction COMMIT but before control returns to poll().
      // This is a real process interruption with a real on-disk SQLite reopen.
      const child=spawnSync(process.execPath,['--input-type=module','-e',`
        import {Store} from './server/store.mjs';
        import {createJobs} from './server/jobs.mjs';
        const store=new Store(process.argv[1]);
        const job=store.admit({owner:'crash-owner',ipKey:'crash-ip',idem:'crash-receipt',payload:{prompt:'Explicit crash fixture',async:true},limits:{daily:100,owner:100,ip:100}}).job;
        store.updateJob(job.id,{status:'pending',upstreamId:'job-crash-fixture',result:{success:true,status:'processing'}});
        const body=process.argv[2]==='complete'?{success:true,status:'complete',response:{success:true,tracks:[{take:1,kind:'delivered master',gcs_uri:'gs://explicit-fixture/master.wav'}],request_id:'ce50eae7-9c6e-4cde-904c-9333d7fa7b2a'}}:
          {success:true,status:'failed',http_status:422,error:{success:false,error_code:'INVALID_REQUEST',refused:['seed: < min 0']}};
        const worker=createJobs({store,engine:{submit(){throw Error('No POST');},async job(){return body;}},media:{ingest(){throw Error('Must exit before ingest');}}});
        const transaction=store.transaction.bind(store);
        store.transaction=fn=>{const value=transaction(fn);if(store.db.prepare("SELECT 1 FROM generation_job_polls WHERE state='complete'").get())process.exit(0);return value;};
        worker.wake();
      `,file,terminal],{cwd:fileURLToPath(new URL('..',import.meta.url)),encoding:'utf8',timeout:5000,windowsHide:true});
      assert.equal(child.status,0,child.stderr);
      const store=new Store(file);let ingests=0;const worker=createJobs({store,engine:{submit(){assert.fail('No generation replay');},job(){assert.fail('Saved terminal response needs no GET');}},
        media:{async ingest(){ingests++;return {status:'ready',takes:[{id:'a'.repeat(64),take:1,status:'ready',master:{id:'b'.repeat(64)},listening:{id:'c'.repeat(64),durationSeconds:15}}]};}}});
      try{
        const row=store.db.prepare('SELECT * FROM jobs').get();assert.equal(row.status,terminal==='complete'?'ingesting':'failed');
        assert.equal(store.db.prepare('SELECT state FROM generation_job_polls').get().state,'complete');
        await drain(worker);assert.equal(ingests,terminal==='complete'?1:0);
        assert.equal(store.job(row.id).status,terminal==='complete'?'ready':'failed');
        assert.equal(store.publicJob(store.job(row.id)).tracks.length,terminal==='complete'?1:0);
        if(terminal==='failed')assert.equal(store.publicJob(store.job(row.id)).error.fields[0].path,'seed');
      }finally{worker.stop();store.close();}
    }
  }finally{const target=resolve(folder);assert.ok(target.startsWith(resolve(tmpdir())+sep)&&basename(target).startsWith('pmp-job-poll-crash-'));await rm(target,{recursive:true,force:true});}
});
