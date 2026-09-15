import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Store,sha} from '../server/store.mjs';
import {createListeningSessions} from '../server/listening-sessions.mjs';

// Actual SQLite account claim and listening services. Published file metadata
// and capabilities are explicit fixtures; no network or music generation.
const caps=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json',import.meta.url),'utf8'));
const request={prompt:'A calm piano song.',vocal:{mode:'instrumental'},output_package:'variations',variation_count:3,async:true};
const limits={daily:100,owner:100,ip:100},config={dailyAdmissionLimit:100,guestDailyLimit:100,ipDailyLimit:100};
const copy=value=>JSON.parse(JSON.stringify(value));
function fixture(t){
  const store=new Store(':memory:');t.after(()=>store.close());
  const guest=store.newSession(),user=store.identity('https://identity.fixture.invalid','claim-owner','Fixture');
  let wakes=0,capabilities=async()=>caps;
  const make=()=>createListeningSessions({store,config,jobs:{wake(){wakes++;}},capabilities:()=>capabilities()});
  const listening=make();let seq=0;
  function seed(owner=guest.row.owner){
    const job=store.admit({owner,ipKey:'seed-'+(++seq),idem:'seed-'+seq,payload:request,limits}).job;
    store.updateJob(job.id,{status:'ready',result:{success:true,tracks:[]}});
    const asset=(kind,take)=>({id:sha(job.id+take+kind),kind,measured:true,durationSeconds:120,codec:'aac',sampleRate:48000,channels:2});
    store.publish(store.job(job.id),{jobId:job.id,status:'ready',takes:[1,2,3].map(take=>({id:sha(job.id+':track:'+take),take,kind:'delivered-master',status:'ready',master:asset('master',take),listening:asset('listening',take)}))});
    return {job,tracks:store.publicJob(store.job(job.id)).tracks};
  }
  const source=seed();
  const body={clientId:'guest-client-fixture',trackId:source.tracks[0].id,request:copy(request)};
  const start=(extra={})=>listening.start({owner:guest.row.owner,ipKey:'listening-fixture',idem:'session-key-fixture',body,...extra});
  const raw=id=>JSON.parse(store.db.prepare('SELECT data FROM listening_sessions WHERE id=?').get(id).data);
  const write=s=>store.db.prepare('UPDATE listening_sessions SET data=? WHERE id=?').run(JSON.stringify(s),s.id);
  return {store,guest,user,listening,make,seed,source,body,start,raw,write,get wakes(){return wakes;},gate(fn){capabilities=fn;}};
}

test('login atomically claims listening ownership, history, prepared queue and event receipts without buying music',async t=>{
  const f=fixture(t),s=await f.start();
  const event={eventId:'dismiss-before-login',clientId:f.body.clientId,type:'dismiss',trackIds:[s.queue[0].id]};
  await f.listening.event({id:s.id,owner:f.guest.row.owner,ipKey:'fixture',body:event});
  const before=f.raw(s.id),jobs=f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n;
  const claimed=f.store.newSession(f.user,f.guest.row),after=f.raw(s.id);
  assert.equal(after.owner,f.user.id);assert.equal(after.enabled,false);assert.equal(after.playing,false);assert.equal(after.status,'paused');
  for(const key of ['queue','served','history','dismissedQueueIds','request','counter','clientId','idempotencyKey'])assert.deepEqual(after[key],before[key],key);
  assert.equal(f.store.db.prepare('SELECT owner FROM listening_sessions WHERE id=?').get(s.id).owner,f.user.id);
  assert.equal(f.store.ownJob(f.source.job.id,f.user.id).id,f.source.job.id);assert.equal(f.store.session(f.guest.token),undefined);assert.ok(f.store.session(claimed.token));
  assert.equal((await f.listening.get(s.id,f.user.id)).enabled,false);
  await assert.rejects(f.listening.get(s.id,f.guest.row.owner),{status:404});
  const replay=await f.listening.event({id:s.id,owner:f.user.id,ipKey:'fixture',body:event});assert.deepEqual(replay.queue.map(track=>track.id),before.queue);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,jobs);assert.equal(f.wakes,0);
});

test('an already active account session remains exclusive; migrated listening needs explicit resume',async t=>{
  const f=fixture(t),guestSession=await f.start(),accountSource=f.seed(f.user.id);
  const account=await f.start({owner:f.user.id,idem:'account-session-key',body:{...f.body,clientId:'account-client-fixture',trackId:accountSource.tracks[0].id}});
  f.store.newSession(f.user,f.guest.row);
  assert.equal(f.raw(account.id).enabled,true);assert.equal(f.raw(guestSession.id).enabled,false);
  const event={eventId:'resume-after-login',clientId:f.body.clientId,type:'resume',trackId:f.body.trackId,playing:true};
  await assert.rejects(f.listening.event({id:guestSession.id,owner:f.user.id,ipKey:'fixture',body:event}),{status:409,code:'SESSION_IN_PROGRESS'});
  assert.equal(f.wakes,0);
  await f.listening.event({id:account.id,owner:f.user.id,ipKey:'fixture',body:{eventId:'disable-account-session',clientId:'account-client-fixture',type:'disable'}});
  assert.equal((await f.listening.event({id:guestSession.id,owner:f.user.id,ipKey:'fixture',body:event})).enabled,true);assert.equal(f.wakes,0);
});

test('a collided session admission key retains its original receipt across service reconstruction',async t=>{
  const f=fixture(t),original=await f.start(),accountSource=f.seed(f.user.id);
  const account=await f.start({owner:f.user.id,body:{...f.body,clientId:'account-client-fixture',trackId:accountSource.tracks[0].id}});
  f.store.newSession(f.user,f.guest.row);
  const row=f.store.db.prepare('SELECT idem FROM listening_sessions WHERE id=?').get(original.id);assert.notEqual(row.idem,'session-key-fixture');
  const reconstructed=f.make(),replayed=await reconstructed.start({owner:f.user.id,ipKey:'fixture',idem:'session-key-fixture',body:f.body});
  assert.equal(replayed.id,original.id);assert.equal(replayed.idempotencyKey,'session-key-fixture');assert.equal(replayed.enabled,false);
  assert.equal(f.raw(account.id).enabled,true);assert.equal(f.wakes,0);
  await assert.rejects(reconstructed.start({owner:f.user.id,ipKey:'fixture',idem:'session-key-fixture',body:{...f.body,request:{...request,prompt:'A changed brief.'}}}),{status:409,code:'IDEMPOTENCY_CONFLICT'});
});

test('a missed pending admission reconnects to the exact moved job when account job keys collide',async t=>{
  const f=fixture(t),s=await f.start(),payload={prompt:'Pending adaptive piano.',async:true};
  const unrelated=f.store.admit({owner:f.user.id,ipKey:'other-ip',idem:'shared-pending-key',payload:{prompt:'Another account request.'},limits}).job;
  const admitted=f.store.admit({owner:f.guest.row.owner,ipKey:'guest-ip',idem:'shared-pending-key',payload,limits}).job;
  const raw=f.raw(s.id);raw.admission={id:'shared-pending-key',payload};raw.counter=7;f.write(raw);
  f.store.newSession(f.user,f.guest.row);
  assert.equal(f.raw(s.id).admission.id,f.store.job(admitted.id).idem);assert.notEqual(f.raw(s.id).admission.id,unrelated.idem);
  const recovered=await f.listening.get(s.id,f.user.id);assert.equal(recovered.activeJob.id,admitted.id);assert.equal(f.raw(s.id).counter,7);assert.equal(f.raw(s.id).admission,null);assert.equal(recovered.enabled,false);assert.equal(f.wakes,0);
});

test('an unadmitted pending intent isolates a colliding account key without changing or submitting its body',async t=>{
  const f=fixture(t),s=await f.start(),pending={id:'shared-unadmitted-key',payload:{prompt:'A preserved pending brief.',async:true},generationIntent:{request,policy:{version:2,mode:'adaptive',role:'explore'}}};
  f.store.admit({owner:f.user.id,ipKey:'other-ip',idem:pending.id,payload:{prompt:'Unrelated.'},limits});
  const raw=f.raw(s.id);raw.admission=copy(pending);f.write(raw);const count=f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n;
  f.store.newSession(f.user,f.guest.row);const actual=f.raw(s.id).admission;
  assert.notEqual(actual.id,pending.id);assert.deepEqual(actual.payload,pending.payload);assert.deepEqual(actual.generationIntent,pending.generationIntent);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,count);assert.equal(f.wakes,0);
});

test('a foreign job binding rolls back the whole account claim and leaves the guest session usable',async t=>{
  const f=fixture(t),s=await f.start(),foreign=f.seed('foreign-owner-fixture');
  const raw=f.raw(s.id);raw.activeJobId=foreign.job.id;f.write(raw);
  assert.throws(()=>f.store.newSession(f.user,f.guest.row),{status:409,code:'ACCOUNT_CLAIM_CONFLICT'});
  assert.ok(f.store.session(f.guest.token));assert.equal(f.store.job(f.source.job.id).owner,f.guest.row.owner);assert.equal(f.raw(s.id).owner,f.guest.row.owner);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM owner_claims').get().n,0);assert.equal(f.wakes,0);
});

test('a mismatched pending job body also rolls back without associating another request',async t=>{
  const f=fixture(t),s=await f.start();f.store.admit({owner:f.guest.row.owner,ipKey:'guest-ip',idem:'pending-key-fixture',payload:{prompt:'Admitted original.'},limits});
  const raw=f.raw(s.id);raw.admission={id:'pending-key-fixture',payload:{prompt:'A different request.'}};f.write(raw);
  assert.throws(()=>f.store.newSession(f.user,f.guest.row),{status:409,code:'ACCOUNT_CLAIM_CONFLICT'});assert.ok(f.store.session(f.guest.token));assert.equal(f.wakes,0);
});

test('login during an awaited session start cannot insert a new orphaned guest session',async t=>{
  const f=fixture(t);let entered,release;const arrived=new Promise(resolve=>entered=resolve),gate=new Promise(resolve=>release=resolve);
  f.gate(async()=>{entered();await gate;return caps;});
  const starting=f.start();await arrived;f.store.newSession(f.user,f.guest.row);release();
  await assert.rejects(starting,{status:409,code:'SESSION_CHANGED'});assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM listening_sessions').get().n,0);assert.equal(f.wakes,0);
});

test('login during an awaited refill cannot overwrite migrated ownership or submit its stale intent',async t=>{
  const f=fixture(t),s=await f.start();let entered,release;const arrived=new Promise(resolve=>entered=resolve),gate=new Promise(resolve=>release=resolve);
  f.gate(async()=>{entered();await gate;return caps;});
  const body={eventId:'skip-crossing-login',clientId:f.body.clientId,type:'skip',trackId:f.body.trackId,position:4,playedSeconds:4,playing:true};
  const update=f.listening.event({id:s.id,owner:f.guest.row.owner,ipKey:'fixture',body});await arrived;
  f.store.newSession(f.user,f.guest.row);const before=copy(f.raw(s.id)),jobs=f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n;release();
  await assert.rejects(update,{status:409,code:'SESSION_CHANGED'});assert.deepEqual(f.raw(s.id),before);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,jobs);assert.equal(f.wakes,0);
  const replay=await f.listening.event({id:s.id,owner:f.user.id,ipKey:'fixture',body});assert.equal(replay.enabled,false);assert.equal(replay.history.length,1);assert.equal(f.wakes,0);
});

test('stale guest direct and directed generation admissions are refused after the account claim',async t=>{
  const f=fixture(t);f.store.newSession(f.user,f.guest.row);
  assert.throws(()=>f.store.admit({owner:f.guest.row.owner,ipKey:'fixture',idem:'stale-direct-admission',payload:request,limits}),{status:409,code:'SESSION_CHANGED'});
  assert.throws(()=>f.store.admitCreationGroup({owner:f.guest.row.owner,ipKey:'fixture',idem:'stale-directed-admission',request,plans:['faithful','neighbour','explore'].map(role=>({role,payload:request})),limits}),{status:409,code:'SESSION_CHANGED'});
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,1);
});
