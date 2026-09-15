import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Store,sha} from '../server/store.mjs';
import {createJobs} from '../server/jobs.mjs';
import {createListeningSessions} from '../server/listening-sessions.mjs';
import {createInitialCreation} from '../server/initial-creation.mjs';

// Actual SQLite admission/job worker/session service, with explicit transport
// and verified-ingest metadata fixtures. No network, media, or paid generation.
const caps=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json',import.meta.url),'utf8'));
const candidate=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/parameter-gap-audit.json',import.meta.url),'utf8')).dry_run_candidate.payload;
const copy=value=>JSON.parse(JSON.stringify(value)),owner='guest:listening-fixture',clientId='client-fixture-one';
const request={prompt:'A calm song with piano.',vocal:{mode:'instrumental'},duration:{target_seconds:120},async:false,prompt_enhance:{enabled:false},normalize_output:false};
const config={dailyAdmissionLimit:100,guestDailyLimit:100,ipDailyLimit:100};
function publish(store,jobId,count=1,status='ready'){
  const result={success:true,tracks:Array.from({length:count},(_,index)=>({take:index+1,kind:'delivered master'}))};
  store.updateJob(jobId,{status:'ingesting',result});
  const asset=(kind,take)=>({id:sha(jobId+take+kind),kind,measured:true,durationSeconds:120,codec:kind==='master'?'pcm_s24le':'aac',sampleRate:48000,channels:2});
  const manifest={jobId,status,takes:Array.from({length:count},(_,index)=>{const take=index+1;return{id:sha(jobId+':track:'+take),take,kind:'delivered-master',status:'ready',master:asset('master',take),listening:asset('listening',take)};})};
  store.publish(store.job(jobId),manifest);store.updateJob(jobId,{status,error:status==='ready'?null:{code:'INGEST_PARTIAL',message:'Explicit partial fixture.'}});
  return store.publicJob(store.job(jobId)).tracks;
}
async function idle(worker){for(let n=0;n<100&&worker.running;n++)await new Promise(resolve=>setImmediate(resolve));assert.equal(worker.running,false,'Local worker fixture should settle.');}
function fixture(t,{payload=request,capabilities=async()=>caps,seedOwner='catalogue-fixture',seedPayload={prompt:'Catalogue fixture.'},seedCount=1,seedStatus='ready',deliveryReady=async()=>{}}={}){
  const store=new Store(':memory:'),submissions=[];
  const seed=store.admit({owner:seedOwner,ipKey:'catalogue-ip',idem:'catalogue-seed-one',payload:seedPayload,limits:{daily:100,owner:100,ip:100}}).job;
  const seedTracks=publish(store,seed.id,seedCount);if(seedStatus!=='ready')store.updateJob(seed.id,{status:seedStatus});
  const track=seedTracks[0];
  const jobs=createJobs({store,engine:{async submit(body){submissions.push(copy(body));return{success:true,status:'queued',job_id:'upstream-fixture-'+submissions.length};},async job(){return{success:true,status:'processing'};}},media:{async ingest(){assert.fail('This test explicitly publishes fixture metadata instead.');}}});
  const make=()=>createListeningSessions({store,jobs,capabilities,deliveryReady,config:{...config,webhookUrl:payload.webhook_url}});
  const sessions=make();let eventNumber=0;
  t.after(async()=>{jobs.stop();await idle(jobs);store.close();});
  return{store,jobs,sessions,submissions,track,seed,seedTracks,make,async start(extra={}){const result=await sessions.start({owner,ipKey:'session-ip',idem:'session-fixture-one',body:{clientId,trackId:track.id,request:copy(payload)},...extra});await idle(jobs);return result;},
    async event(id,type,extra={}){const result=await sessions.event({id,owner,ipKey:'session-ip',body:{eventId:'event-fixture-'+(++eventNumber),clientId,type,trackId:track.id,position:0,playedSeconds:0,playing:true,...extra}});await idle(jobs);return result;},
    async view(id){return await sessions.get(id,owner);},publish:(id,count,status)=>publish(store,id,count,status)};
}

test('a short buffer admits one worker request with all100 selected fields unchanged',async t=>{
  const payload={...copy(candidate),dry_run:false,capabilities:false,async:false},f=fixture(t,{payload});
  const s=await f.start();assert.equal(f.submissions.length,1);assert.equal(s.status,'preparing');assert.equal(s.queue.length,0);assert.ok(['queued','submitting','pending'].includes(s.activeJob.status));
  assert.deepEqual(f.submissions[0],payload);assert.equal(Object.keys(f.submissions[0]).length,100);
  assert.equal(f.submissions[0].async,false);assert.equal(f.submissions[0].prompt_enhance.enabled,false);
  const durable=JSON.parse(f.store.db.prepare('SELECT data FROM listening_sessions WHERE id=?').get(s.id).data);
  assert.deepEqual(durable.request,payload);assert.equal(durable.counter,1);assert.equal(durable.activeJobId,s.activeJob.id);
});

test('starting from an exact owned three-take job adopts its two ready siblings with zero new POSTs',async t=>{
  const payload={...copy(request),output_package:'variations',variation_count:3};
  const f=fixture(t,{payload,seedOwner:owner,seedPayload:copy(payload),seedCount:3}),s=await f.start();
  assert.deepEqual(s.queue.map(track=>track.id),f.seedTracks.slice(1).map(track=>track.id));
  assert.equal(s.currentTrackId,f.track.id);assert.equal(s.activeJob,null);assert.equal(s.status,'listening');
  assert.equal(s.policy.adoptedPrepared,2);assert.equal(s.policy.initialTakes,undefined);assert.equal(f.submissions.length,0);
  await f.start();await f.view(s.id);await f.sessions.list(owner);
  await f.event(s.id,'start',{trackId:f.track.id});await f.event(s.id,'progress',{position:35,playedSeconds:1});
  assert.equal(f.submissions.length,0);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs WHERE owner=?').get(owner).n,1);
  const durable=JSON.parse(f.store.db.prepare('SELECT data FROM listening_sessions WHERE id=?').get(s.id).data);
  assert.equal(durable.counter,0);assert.deepEqual(durable.request,payload);
});

test('legacy native default-three jobs keep their original omitted-output intent and prepared peers',async t=>{
  const f=fixture(t),original={...request,async:true},legacy=f.store.admit({owner,ipKey:'session-ip',idem:'legacy-default-create',payload:{...original,output_package:'variations',variation_count:3},limits:{daily:100,owner:100,ip:100},generationIntent:{request:original,policy:{version:1,mode:'default-three',defaultApplied:true,requestedTakes:3}}});
  const tracks=f.publish(legacy.job.id,3),s=await f.start({body:{clientId,trackId:tracks[0].id,request:original}});assert.deepEqual(s.queue.map(track=>track.id),tracks.slice(1).map(track=>track.id));assert.equal(s.activeJob,null);assert.equal(f.submissions.length,0);
});

test('real directed creation adopts its two sibling jobs and later refills the original unset package',async t=>{
  const original=copy(request);delete original.async;const f=fixture(t,{payload:original});
  const initial=await createInitialCreation({store:f.store,capabilities:async()=>caps,config}).admit({owner,ipKey:'session-ip',idem:'initial-create-fixture',payload:original});
  assert.deepEqual(f.store.generationIntent(initial.job.id).request,{...original,async:true});
  assert.deepEqual(JSON.parse(initial.job.payload),{...original,async:true});
  f.jobs.wake();await idle(f.jobs);assert.equal(f.submissions.length,3);
  for(const child of f.store.creationGroup(initial.job.id).children)f.publish(child.id,1);
  const tracks=f.store.publicJob(f.store.job(initial.job.id)).tracks,s=await f.start({body:{clientId,trackId:tracks[0].id,request:copy(original)}});
  assert.deepEqual(s.queue.map(track=>track.id),tracks.slice(1).map(track=>track.id));assert.equal(s.activeJob,null);assert.equal(f.submissions.length,3,'Only the original three directions have been submitted.');
  const restored=f.make();assert.equal((await restored.get(s.id,owner)).queue.length,2);
  const next=await f.event(s.id,'skip',{trackId:tracks[0].id,position:2,playedSeconds:2});assert.ok(next.activeJob);assert.equal(f.submissions.length,4);
  const {prompt,...sent}=f.submissions[3],{prompt:originalPrompt,...selected}=original;
  assert.deepEqual(sent,{...selected,async:true});assert.ok(prompt.startsWith(originalPrompt));
  assert.equal(f.submissions[3].output_package,undefined);assert.equal(f.submissions[3].variation_count,undefined);
  assert.deepEqual(JSON.parse(f.store.db.prepare('SELECT data FROM listening_sessions WHERE id=?').get(s.id).data).request,original);
});

test('an explicitly selected output cannot adopt sibling jobs from the earlier omitted-output intent',async t=>{
  const original=copy(request),f=fixture(t,{payload:original});
  const initial=await createInitialCreation({store:f.store,capabilities:async()=>caps,config}).admit({owner,ipKey:'session-ip',idem:'initial-create-fixture',payload:original});
  for(const child of f.store.creationGroup(initial.job.id).children)f.publish(child.id,1);
  const tracks=f.store.publicJob(f.store.job(initial.job.id)).tracks,changed={...original,output_package:'variations',variation_count:3};
  // Same wire body, but now the user explicitly requests three on every refill.
  // It is a different intent, so the previous implicit-default siblings cannot
  // silently stand in for outputs of the newly selected request.
  const s=await f.start({body:{clientId,trackId:tracks[0].id,request:changed}});
  assert.equal(s.queue.length,0);assert.equal(s.policy.adoptedPrepared,0);assert.equal(f.submissions.length,1);assert.deepEqual(f.submissions[0],changed);
});

test('a directed creation delivers late peers into its existing listening session without buying replacement seeds',async t=>{
  const f=fixture(t),initial=await createInitialCreation({store:f.store,capabilities:async()=>caps,config}).admit({owner,ipKey:'session-ip',idem:'initial-create-fixture',payload:request});
  const group=f.store.creationGroup(initial.job.id),first=f.publish(group.children[0].id,1)[0];
  const s=await f.start({body:{clientId,trackId:first.id,request:copy(request)}});assert.equal(s.activeJob.id,initial.job.id);assert.equal(s.queue.length,0);assert.equal(f.submissions.length,0);
  const neighbour=f.publish(group.children[1].id,1)[0],middle=await f.view(s.id);assert.equal(middle.activeJob.id,initial.job.id);assert.deepEqual(middle.queue.map(track=>track.id),[neighbour.id]);assert.equal(middle.status,'preparing');
  const explore=f.publish(group.children[2].id,1)[0],ready=await f.make().get(s.id,owner);assert.equal(ready.activeJob,null);assert.deepEqual(ready.queue.map(track=>track.id),[neighbour.id,explore.id]);assert.equal(f.submissions.length,0);
  await f.event(s.id,'progress',{trackId:first.id,position:35,playedSeconds:1});assert.equal(f.submissions.length,0);
});

test('listening from a directed sibling resolves the common group and original brief',async t=>{
  const f=fixture(t),initial=await createInitialCreation({store:f.store,capabilities:async()=>caps,config}).admit({owner,ipKey:'session-ip',idem:'initial-create-fixture',payload:request});
  const group=f.store.creationGroup(initial.job.id);for(const child of group.children)f.publish(child.id,1);
  const tracks=f.store.publicJob(f.store.job(initial.job.id)).tracks,s=await f.start({body:{clientId,trackId:tracks[1].id,request:copy(request)}});
  assert.deepEqual(s.queue.map(track=>track.id),[tracks[0].id,tracks[2].id]);assert.equal(s.policy.adoptedPrepared,2);assert.equal(f.submissions.length,0);
});

test('an uncertain sibling cannot be bypassed by resuming an otherwise delivered primary group',async t=>{
  const f=fixture(t),initial=await createInitialCreation({store:f.store,capabilities:async()=>caps,config}).admit({owner,ipKey:'session-ip',idem:'initial-create-fixture',payload:request});
  const group=f.store.creationGroup(initial.job.id),first=f.publish(group.children[0].id,1)[0];f.publish(group.children[1].id,1);
  f.store.updateJob(group.children[2].id,{status:'uncertain',error:{code:'ADMISSION_UNCERTAIN',message:'Explicit unknown admission fixture.'}});
  const s=await f.start({body:{clientId,trackId:first.id,request:copy(request)}});assert.equal(s.status,'needs-attention');assert.equal(s.activeJob.id,initial.job.id);
  await assert.rejects(f.event(s.id,'resume',{trackId:first.id}),{code:'OUTCOME_UNCONFIRMED'});await f.event(s.id,'progress',{trackId:first.id,position:35,playedSeconds:1});assert.equal(f.submissions.length,0);
});

for(const manualQueue of [false,true])test('T-minus-90 compares actual directed candidates and '+(manualQueue?'protects the manual order':'reorders automatic candidates from real skip history'),async t=>{
  const realNow=Date.now;let clock=Date.UTC(2026,8,14,12);Date.now=()=>clock;t.after(()=>{Date.now=realNow;});
  const f=fixture(t),initial=await createInitialCreation({store:f.store,capabilities:async()=>caps,config}).admit({owner,ipKey:'session-ip',idem:'initial-create-fixture',payload:request});
  const group=f.store.creationGroup(initial.job.id);for(const child of group.children)f.publish(child.id,1);
  const tracks=f.store.publicJob(f.store.job(initial.job.id)).tracks,s=await f.start({body:{clientId,trackId:tracks[0].id,request:copy(request)}});
  clock+=2000;const skipped=await f.event(s.id,'skip',{trackId:tracks[0].id,position:2,playedSeconds:2});assert.equal(f.submissions.length,1);assert.equal(skipped.history[0].role,'faithful');
  const started=await f.event(s.id,'start',{trackId:tracks[1].id,position:0,playedSeconds:0,manualQueue});assert.equal(started.activeJob.id,skipped.activeJob.id);
  const replacement=f.publish(skipped.activeJob.id,1)[0];assert.equal(replacement.seedRole,'neighbour');await f.view(s.id);
  clock+=10000;await f.event(s.id,'progress',{trackId:tracks[1].id,position:10,playedSeconds:10,manualQueue});
  clock+=10000;await f.event(s.id,'progress',{trackId:tracks[1].id,position:20,playedSeconds:20,manualQueue});
  clock+=10000;const recalibrated=await f.event(s.id,'progress',{trackId:tracks[1].id,position:30,playedSeconds:30,manualQueue});
  const decision=recalibrated.policy.recalibration;assert.equal(decision.trackId,tracks[1].id);assert.equal(decision.remainingSeconds,90);assert.equal(decision.evidence.kind,'early-skip');assert.equal(decision.evidence.listenedSeconds,2);assert.equal(decision.preferredRole,'neighbour');assert.equal(decision.protectedManualOrder,manualQueue);assert.equal(decision.changed,!manualQueue);
  assert.deepEqual(decision.beforeIds,[tracks[2].id,replacement.id]);assert.deepEqual(decision.afterIds,manualQueue?[tracks[2].id,replacement.id]:[replacement.id,tracks[2].id]);assert.deepEqual(recalibrated.queue.map(track=>track.id),decision.afterIds);
  assert.equal(f.submissions.length,1,'Recalibrating a full ready queue does not generate another track.');
  clock+=5000;const repeated=await f.event(s.id,'progress',{trackId:tracks[1].id,position:35,playedSeconds:35,manualQueue});assert.deepEqual(repeated.policy.recalibration,decision);assert.deepEqual((await f.make().get(s.id,owner)).policy.recalibration,decision);
});

for(const packageChoice of [
  {output_package:'single_track'},
  {output_package:'stems_bundle',stems:['master']},
  {output_package:'variations',variation_count:2},
  {output_package:'variations',variation_count:4}
])test('a shortage preserves the explicit output choice '+JSON.stringify(packageChoice),async t=>{
  const payload={...copy(request),...packageChoice},f=fixture(t,{payload}),s=await f.start();
  assert.equal(f.submissions.length,1);assert.deepEqual(f.submissions[0],payload);assert.equal(s.policy.reason,'prepared-buffer-short');
  assert.equal(s.policy.adoptedPrepared,0);assert.equal(s.policy.initialTakes,undefined);
  // The selected package controls the number of tracks in each request. The
  // coordinator's one-in-flight limit means one request, never forced one take.
  for(let n=0;n<4;n++)await f.event(s.id,'progress',{position:35+n,playedSeconds:n});
  assert.equal(f.submissions.length,1);
});

test('an explicit four-take job retains all three prepared siblings instead of hiding or discarding the fourth',async t=>{
  const payload={...copy(request),output_package:'variations',variation_count:4},f=fixture(t,{payload,seedOwner:owner,seedPayload:copy(payload),seedCount:4}),s=await f.start();
  assert.equal(s.queue.length,3);assert.deepEqual(s.queue.map(track=>track.id),f.seedTracks.slice(1).map(track=>track.id));assert.equal(f.submissions.length,0);
});

test('one available sibling triggers only a normal refill using the chosen two-take request',async t=>{
  const payload={...copy(request),output_package:'variations',variation_count:2},f=fixture(t,{payload,seedOwner:owner,seedPayload:copy(payload),seedCount:2}),s=await f.start();
  assert.deepEqual(s.queue.map(track=>track.id),[f.seedTracks[1].id]);assert.equal(s.policy.adoptedPrepared,1);
  assert.equal(f.submissions.length,1);assert.deepEqual(f.submissions[0],payload);assert.notEqual(s.activeJob.id,f.seed.id);
});

test('later adaptive requests preserve selected package/count and false fields after adopting initial siblings',async t=>{
  const payload={...copy(request),output_package:'variations',variation_count:3},f=fixture(t,{payload,seedOwner:owner,seedPayload:copy(payload),seedCount:3}),s=await f.start();
  assert.equal(f.submissions.length,0);const next=await f.event(s.id,'skip',{position:2,playedSeconds:2});
  assert.equal(f.submissions.length,1);assert.equal(next.policy.reason,'replace-skipped-track');assert.ok(next.policy.guidance);
  const {prompt,...selected}=f.submissions[0],{prompt:original,...expected}=payload;
  assert.deepEqual(selected,expected);assert.ok(prompt.startsWith(original));assert.ok(prompt.includes(next.policy.guidance));
  assert.deepEqual(JSON.parse(f.store.db.prepare('SELECT data FROM listening_sessions WHERE id=?').get(s.id).data).request,payload);
});

test('a published track from another owner cannot lend that owner\'s sibling tracks or private job context',async t=>{
  const payload={...copy(request),output_package:'variations',variation_count:3},f=fixture(t,{payload,seedOwner:'another-private-owner',seedPayload:copy(payload),seedCount:3}),s=await f.start();
  assert.equal(s.queue.length,0);assert.equal(s.policy.adoptedPrepared,0);assert.equal(f.submissions.length,1);assert.notEqual(s.activeJob.id,f.seed.id);
  const response=JSON.stringify(s);assert.ok(!response.includes(f.seed.id));assert.ok(!response.includes('another-private-owner'));
  for(const sibling of f.seedTracks.slice(1))assert.ok(!response.includes(sibling.id));
});

test('same-owner siblings require the exact validated request, including selected false values',async t=>{
  const original={...copy(request),output_package:'variations',variation_count:3},payload={...original,normalize_output:true};
  const f=fixture(t,{payload,seedOwner:owner,seedPayload:original,seedCount:3}),s=await f.start();
  assert.equal(s.queue.length,0);assert.equal(s.policy.adoptedPrepared,0);assert.equal(f.submissions.length,1);assert.deepEqual(f.submissions[0],payload);
});

test('an exact owning job still transferring stays linked and contributes late siblings without another submission',async t=>{
  const payload={...copy(request),output_package:'variations',variation_count:3},f=fixture(t,{payload,seedOwner:owner,seedPayload:copy(payload),seedCount:2,seedStatus:'ingesting'}),s=await f.start();
  assert.equal(s.activeJob.id,f.seed.id);assert.equal(s.queue.length,1);assert.equal(s.status,'preparing');assert.equal(f.submissions.length,0);
  const all=f.publish(f.seed.id,3),restored=f.make(),complete=await restored.get(s.id,owner);
  assert.equal(complete.activeJob,null);assert.equal(complete.status,'listening');assert.deepEqual(complete.queue.map(track=>track.id),all.slice(1).map(track=>track.id));
  await f.event(s.id,'progress',{position:35,playedSeconds:1});assert.equal(f.submissions.length,0);
});

test('a partial original seed stays honest and does not automatically purchase missing takes',async t=>{
  const payload={...copy(request),output_package:'variations',variation_count:3},f=fixture(t,{payload,seedOwner:owner,seedPayload:copy(payload),seedCount:2,seedStatus:'partial'}),s=await f.start();
  assert.equal(s.status,'needs-attention');assert.equal(s.queue.length,1);assert.equal(s.policy.adoptedPrepared,1);assert.equal(f.submissions.length,0);
  await f.event(s.id,'progress',{position:35,playedSeconds:1});assert.equal(f.submissions.length,0);
  assert.equal(s.activeJob.id,f.seed.id);
  const recovered=f.publish(f.seed.id,3),resumed=await f.event(s.id,'resume');
  assert.deepEqual(resumed.queue.map(track=>track.id),recovered.slice(1).map(track=>track.id));assert.equal(f.submissions.length,0);
});

test('only omitted async receives the existing server default, without adding package or variation fields',async t=>{
  const payload=copy(request);delete payload.async;const f=fixture(t,{payload});await f.start();
  assert.deepEqual(f.submissions[0],{...payload,async:true});assert.equal(f.submissions[0].output_package,undefined);assert.equal(f.submissions[0].variation_count,undefined);
});

test('session start, get/list/reopen and event receipts are owner-scoped and idempotent',async t=>{
  const f=fixture(t),s=await f.start(),same=await f.start();assert.equal(same.id,s.id);assert.equal(f.submissions.length,1);
  assert.equal((await f.sessions.list('someone-else')).length,0);await assert.rejects(async()=>f.sessions.get(s.id,'someone-else'),{status:404});
  await assert.rejects(f.start({body:{clientId,trackId:f.track.id,request:{...request,prompt:'Changed intent'}}}),{code:'IDEMPOTENCY_CONFLICT'});
  const body={eventId:'stable-event-one',clientId,type:'progress',trackId:f.track.id,position:2,playedSeconds:2,playing:true};
  await f.sessions.event({id:s.id,owner,ipKey:'session-ip',body});await f.sessions.event({id:s.id,owner,ipKey:'session-ip',body});
  await assert.rejects(f.sessions.event({id:s.id,owner,ipKey:'session-ip',body:{...body,position:3}}),{code:'IDEMPOTENCY_CONFLICT'});
  await assert.rejects(f.sessions.event({id:s.id,owner,ipKey:'session-ip',body:{...body,eventId:'different-client-event',clientId:'another-client'}}),{code:'LISTENING_IN_ANOTHER_TAB'});
  await f.view(s.id);await f.sessions.list(owner);await idle(f.jobs);assert.equal(f.submissions.length,1);
});

test('concurrent same-owner starts cannot create duplicate sessions or duplicate music requests',async t=>{
  const f=fixture(t);const [a,b]=await Promise.all([f.start(),f.start()]);assert.equal(a.id,b.id);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM listening_sessions').get().n,1);assert.equal(f.submissions.length,1);
});

test('only completed owned tracks enter the prepared queue; refill is one take and one request at a time',async t=>{
  const f=fixture(t),s=await f.start();const first=s.activeJob.id;
  const waiting=await f.view(s.id);assert.equal(waiting.queue.length,0);assert.equal(waiting.activeJob.id,first);
  const tracks=f.publish(first,3);let current=await f.view(s.id);assert.equal(current.queue.length,3);assert.ok(current.queue.every(track=>track.owned&&track.url==='/api/listen/'+track.id));
  current=await f.event(s.id,'start',{trackId:tracks[0].id});assert.equal(current.queue.length,2);assert.equal(f.submissions.length,1);
  current=await f.event(s.id,'start',{trackId:tracks[1].id});assert.equal(current.queue.length,1);assert.equal(f.submissions.length,2);assert.ok(current.activeJob);
  assert.equal(f.submissions[1].output_package??caps.parameters.find(p=>p.name==='output_package').default.value,'single_track');assert.equal(f.submissions[1].variation_count,undefined);
  for(let n=0;n<3;n++)await f.event(s.id,'progress',{trackId:tracks[1].id,position:40+n,playedSeconds:n});
  assert.equal(f.submissions.length,2);assert.equal(f.submissions[1].async,false);assert.equal(f.submissions[1].normalize_output,false);
});

test('partial delivery remains honest and raw metadata or private request routing never crosses the session response',async t=>{
  const f=fixture(t),s=await f.start();f.publish(s.activeJob.id,1,'partial');const view=await f.view(s.id);
  assert.equal(view.status,'needs-attention');assert.equal(view.queue.length,1);assert.equal(view.error.code,'INGEST_PARTIAL');
  const raw=JSON.stringify(view);assert.ok(!raw.includes('upstream-fixture-'));assert.ok(!raw.includes('fingerprint'));assert.ok(!raw.includes('guest:listening-fixture'));
  assert.equal(view.queue[0].owned,true);
});

test('pause and disable prevent queued telemetry from scheduling another music request',async t=>{
  const f=fixture(t),s=await f.start();f.publish(s.activeJob.id,3);await f.view(s.id);
  await f.event(s.id,'pause',{playing:false});
  try{await f.event(s.id,'skip',{playedSeconds:3,position:3,playing:true});}catch(error){assert.equal(error.status,409);}
  assert.equal(f.submissions.length,1,'A stale skip after pause must not cause a replacement request.');
  await f.event(s.id,'disable',{playing:false});const paused=await f.view(s.id);assert.equal(paused.enabled,false);
  await f.event(s.id,'progress',{position:119,playedSeconds:119,playing:true});assert.equal(f.submissions.length,1);
});

test('an uncertain upstream outcome cannot be automatically replaced by normal listening resume',async t=>{
  const f=fixture(t),s=await f.start();f.store.updateJob(s.activeJob.id,{status:'uncertain',error:{code:'JOB_STATUS_UNAVAILABLE',message:'Explicit unconfirmed outcome fixture.'}});
  assert.equal((await f.view(s.id)).status,'needs-attention');
  try{await f.event(s.id,'resume',{position:110,playedSeconds:2,playing:true});}catch(error){assert.equal(error.status,409);}
  assert.equal(f.submissions.length,1,'Unknown generation outcome requires reconciliation, not a replacement POST.');
});

test('resuming an old disabled session cannot coexist with another enabled session of the same owner',async t=>{
  const f=fixture(t),first=await f.start();f.publish(first.activeJob.id,3);await f.view(first.id);await f.event(first.id,'disable',{playing:false});
  const second=await f.start({idem:'session-fixture-two',body:{clientId,trackId:f.track.id,request:copy(request)}});
  assert.notEqual(first.id,second.id);
  try{await f.event(first.id,'resume');}catch(error){assert.equal(error.status,409);}
  const enabled=(await f.sessions.list(owner)).filter(s=>s.enabled);assert.equal(enabled.length,1);assert.equal(enabled[0].id,second.id);
});

test('duplicate completion/skip events cannot record the same playback repeatedly under new event IDs',async t=>{
  const f=fixture(t),s=await f.start();await f.event(s.id,'skip',{position:2,playedSeconds:2});
  try{await f.event(s.id,'skip',{position:2,playedSeconds:2});}catch(error){assert.equal(error.status,409);}
  assert.equal((await f.view(s.id)).history.length,1);
});

test('seek position and repeated instantaneous cumulative telemetry cannot manufacture a full listen',async t=>{
  const realNow=Date.now;let clock=Date.UTC(2026,8,12,21);Date.now=()=>clock;t.after(()=>{Date.now=realNow;});
  const f=fixture(t),s=await f.start();
  for(let n=0;n<20;n++)await f.event(s.id,'progress',{position:119,playedSeconds:119,playing:true});
  await f.event(s.id,'ended',{position:120,playedSeconds:120,playing:false});
  const history=(await f.view(s.id)).history;assert.equal(history.length,1);assert.ok(history[0].listenedSeconds<=1,'Repeated reports do not each earn a free second of listening.');
  assert.equal(history[0].durationSeconds,120);assert.equal(f.submissions.length,1);
});

test('restarting the session coordinator retains one pending job and never submits a new initial burst',async t=>{
  const f=fixture(t),s=await f.start(),restored=f.make();const out=await restored.get(s.id,owner);
  assert.equal(out.activeJob.id,s.activeJob.id);assert.equal(out.queue.length,0);await idle(f.jobs);assert.equal(f.submissions.length,1);
  await assert.rejects(restored.event({id:s.id,owner,ipKey:'session-ip',body:{clientId,eventId:'stale-track-event',type:'progress',trackId:'different-track',position:1,playedSeconds:1,playing:true}}),{code:'TRACK_CHANGED'});
});

test('recovered uncertain generation enters the same owned queue before normal listening resumes',async t=>{
  const f=fixture(t),s=await f.start(),id=s.activeJob.id;
  f.store.updateJob(id,{status:'uncertain',error:{code:'JOB_STATUS_UNAVAILABLE',message:'Explicit lost status fixture.'}});await f.view(s.id);
  const recovered=f.publish(id,3);const resumed=await f.event(s.id,'resume',{position:110,playedSeconds:2,playing:true});
  assert.deepEqual(resumed.queue.map(track=>track.id),recovered.map(track=>track.id));assert.equal(f.submissions.length,1);
});

test('repeated skip of the same finalized play cannot create extra replacement requests after the first replacement finishes',async t=>{
  const realNow=Date.now;let clock=Date.UTC(2026,8,12,21);Date.now=()=>clock;t.after(()=>{Date.now=realNow;});
  const f=fixture(t),s=await f.start();f.publish(s.activeJob.id,3);await f.view(s.id);
  const skipped=await f.event(s.id,'skip',{position:2,playedSeconds:2});assert.equal(f.submissions.length,2);assert.ok(skipped.activeJob);
  f.publish(skipped.activeJob.id,1);await f.view(s.id);clock+=61000;
  try{await f.event(s.id,'skip',{position:2,playedSeconds:2});}catch(error){assert.equal(error.status,409);}
  assert.equal(f.submissions.length,2,'Only the first settled skip can request its replacement.');
});

test('a delivered buffer refill remains observable after get/list so the queue can reach its two-ahead target',async t=>{
  const realNow=Date.now;let clock=Date.UTC(2026,8,12,21);Date.now=()=>clock;t.after(()=>{Date.now=realNow;});
  const f=fixture(t),s=await f.start(),tracks=f.publish(s.activeJob.id,3);await f.view(s.id);
  await f.event(s.id,'start',{trackId:tracks[0].id});const second=await f.event(s.id,'start',{trackId:tracks[1].id});
  await f.event(s.id,'start',{trackId:tracks[2].id});await f.event(s.id,'progress',{trackId:tracks[2].id,position:40,playedSeconds:1});
  assert.equal(f.submissions.length,2);f.publish(second.activeJob.id,1);assert.equal((await f.view(s.id)).queue.length,1);await f.sessions.list(owner);
  clock+=61000;const next=await f.event(s.id,'progress',{trackId:tracks[2].id,position:41,playedSeconds:2});
  assert.equal(f.submissions.length,3,'Reading completion must not swallow the buffer-ready scheduling signal.');assert.equal(next.queue.length,1);assert.ok(next.activeJob);
});

test('a durable admission receipt relinks its existing owned job after a stop before the session job-link was saved',async t=>{
  let capabilityCalls=0;const f=fixture(t,{capabilities:async()=>{capabilityCalls++;return caps;}}),s=await f.start(),job=f.store.job(s.activeJob.id);
  const row=f.store.db.prepare('SELECT data FROM listening_sessions WHERE id=?').get(s.id),saved=JSON.parse(row.data);
  // Exact persisted crash-window shape: job admission committed, its receipt
  // remains recorded, but writing activeJobId and clearing admission did not.
  saved.activeJobId=null;saved.admission={id:job.idem,payload:JSON.parse(job.payload)};
  f.store.db.prepare('UPDATE listening_sessions SET data=? WHERE id=?').run(JSON.stringify(saved),s.id);
  const callsBefore=capabilityCalls,restored=f.make(),view=await restored.get(s.id,owner);
  assert.equal(view.activeJob?.id,job.id);assert.equal(f.submissions.length,1);assert.equal(capabilityCalls,callsBefore);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs WHERE owner=?').get(owner).n,1);
});

const dismiss=(f,id,trackIds,extra={})=>f.sessions.event({id,owner,ipKey:'session-ip',body:{eventId:'dismiss-event-fixture',clientId,type:'dismiss',trackIds,...extra}});
const durableSession=(f,id)=>JSON.parse(f.store.db.prepare('SELECT data FROM listening_sessions WHERE id=?').get(id).data);

test('dismiss durably removes only prepared tracks without playback feedback or a generation request',async t=>{
  const payload={...copy(request),output_package:'variations',variation_count:3};
  const f=fixture(t,{payload,seedOwner:owner,seedPayload:copy(payload),seedCount:3}),s=await f.start(),before=durableSession(f,s.id);
  const removed=s.queue[0].id,out=await dismiss(f,s.id,[removed]);
  assert.deepEqual(out.queue.map(track=>track.id),[s.queue[1].id]);assert.equal(out.currentTrackId,s.currentTrackId);assert.equal(out.activeJob,null);
  const after=durableSession(f,s.id);
  for(const key of ['request','history','served','policy','playedSeconds','activeWallSeconds','lastPosition','lastEventAt','counter','playing','enabled','status'])assert.deepEqual(after[key],before[key],key+' must not change on manual queue editing.');
  assert.deepEqual(after.dismissedQueueIds,[removed]);assert.equal(f.submissions.length,0);
  assert.deepEqual((await f.make().get(s.id,owner)).queue.map(track=>track.id),[s.queue[1].id]);
  assert.deepEqual((await f.sessions.list(owner))[0].queue.map(track=>track.id),[s.queue[1].id]);assert.equal(f.submissions.length,0);
});

test('clearing prepared tracks consumes no music request and cancels a prior buffer-ready refill signal',async t=>{
  const f=fixture(t),s=await f.start(),tracks=f.publish(s.activeJob.id,3);await f.view(s.id);
  assert.equal(durableSession(f,s.id).bufferRecheck,true);
  const out=await dismiss(f,s.id,tracks.map(track=>track.id));assert.deepEqual(out.queue,[]);assert.equal(out.activeJob,null);
  assert.equal(durableSession(f,s.id).bufferRecheck,false);
  await f.sessions.list(owner);await f.view(s.id);
  await f.event(s.id,'progress',{position:1,playedSeconds:1});
  assert.equal(f.submissions.length,1,'Manual clear and subsequent reads/early telemetry must not replace removed tracks.');
  assert.equal((await f.view(s.id)).history.length,0);assert.deepEqual(durableSession(f,s.id).served,[]);
});

test('concurrent duplicate dismiss receipts and reopening remain idempotent after the IDs leave the queue',async t=>{
  const payload={...copy(request),output_package:'variations',variation_count:3};
  const f=fixture(t,{payload,seedOwner:owner,seedPayload:copy(payload),seedCount:3}),s=await f.start(),ids=[s.queue[0].id];
  const [a,b]=await Promise.all([dismiss(f,s.id,ids),dismiss(f,s.id,ids)]);assert.deepEqual(a.queue,b.queue);
  const restored=f.make(),again=await restored.event({id:s.id,owner,ipKey:'session-ip',body:{eventId:'dismiss-event-fixture',clientId,type:'dismiss',trackIds:ids}});
  assert.deepEqual(again.queue,a.queue);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM listening_events WHERE session_id=?').get(s.id).n,1);
  await assert.rejects(dismiss(f,s.id,[s.queue[1].id]),{code:'IDEMPOTENCY_CONFLICT'});
  await assert.rejects(dismiss(f,s.id,ids,{eventId:'dismiss-new-key-fixture'}),{code:'QUEUE_CHANGED'});
  assert.equal(f.submissions.length,0);
});

test('dismiss enforces owner and controller isolation before changing the queue',async t=>{
  const payload={...copy(request),output_package:'variations',variation_count:3};
  const f=fixture(t,{payload,seedOwner:owner,seedPayload:copy(payload),seedCount:3}),s=await f.start(),body={eventId:'dismiss-event-fixture',clientId,type:'dismiss',trackIds:[s.queue[0].id]};
  await assert.rejects(f.sessions.event({id:s.id,owner:'another-owner',ipKey:'other-ip',body}),{status:404,code:'NOT_FOUND'});
  await assert.rejects(dismiss(f,s.id,body.trackIds,{clientId:'another-tab-fixture'}),{status:409,code:'LISTENING_IN_ANOTHER_TAB'});
  assert.deepEqual((await f.view(s.id)).queue,s.queue);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM listening_events').get().n,0);assert.equal(f.submissions.length,0);
});

test('dismiss rejects malformed or duplicate IDs and mixed telemetry with no event receipt or partial removal',async t=>{
  const payload={...copy(request),output_package:'variations',variation_count:3};
  const f=fixture(t,{payload,seedOwner:owner,seedPayload:copy(payload),seedCount:3}),s=await f.start(),id=s.queue[0].id;
  const bad=[undefined,null,{},id,[id,id],[id.toUpperCase()],['/api/listen/'+id],['../private'],[null],[7],[new String(id)],new Array(1),Array.from({length:101},(_,n)=>sha('fixture-'+n))];
  for(const trackIds of bad)await assert.rejects(dismiss(f,s.id,trackIds),{status:400,code:'INVALID_REQUEST'});
  await assert.rejects(dismiss(f,s.id,[id],{trackId:s.currentTrackId}),{status:400,code:'INVALID_REQUEST'});
  await assert.rejects(dismiss(f,s.id,[id],{playing:true}),{status:400,code:'INVALID_REQUEST'});
  await assert.rejects(f.event(s.id,'progress',{trackIds:[id]}),{status:400,code:'INVALID_REQUEST'});
  assert.deepEqual((await f.view(s.id)).queue,s.queue);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM listening_events').get().n,0);assert.equal(f.submissions.length,0);
});

test('dismiss rejects the current track, unavailable IDs, and unrelated catalogue tracks atomically',async t=>{
  const payload={...copy(request),output_package:'variations',variation_count:3};
  const f=fixture(t,{payload,seedOwner:owner,seedPayload:copy(payload),seedCount:3}),s=await f.start();
  const unrelated=f.store.admit({owner:'unrelated-owner',ipKey:'other-ip',idem:'unrelated-job-fixture',payload:{prompt:'Unrelated catalogue fixture.'},limits:{daily:100,owner:100,ip:100}}).job;
  const otherTrack=f.publish(unrelated.id,1)[0];
  for(const id of [s.currentTrackId,sha('unavailable-fixture'),otherTrack.id])await assert.rejects(dismiss(f,s.id,[s.queue[0].id,id]),{status:409,code:'QUEUE_CHANGED'});
  assert.deepEqual((await f.view(s.id)).queue,s.queue);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM listening_events').get().n,0);assert.equal(f.submissions.length,0);
});

test('an empty dismiss is an idempotent no-op even on a paused session',async t=>{
  const f=fixture(t),s=await f.start();await f.event(s.id,'pause',{playing:false});const before=durableSession(f,s.id);
  await dismiss(f,s.id,[]);await dismiss(f,s.id,[]);const after=durableSession(f,s.id);
  for(const key of ['queue','currentTrackId','history','served','request','counter','activeJobId','bufferRecheck','playing','enabled','status'])assert.deepEqual(after[key],before[key]);
  assert.equal(f.submissions.length,1);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM listening_events WHERE event_id=?').get('dismiss-event-fixture').n,1);
});

test('recovery of the same partial source cannot resurrect a dismissed prepared track or record it as heard',async t=>{
  const payload={...copy(request),output_package:'variations',variation_count:4};
  const f=fixture(t,{payload,seedOwner:owner,seedPayload:copy(payload),seedCount:3,seedStatus:'partial'}),s=await f.start(),removed=s.queue[0].id;
  await dismiss(f,s.id,[removed]);const recovered=f.publish(f.seed.id,4),out=await f.event(s.id,'resume');
  assert.deepEqual(out.queue.map(track=>track.id),recovered.slice(2).map(track=>track.id));assert.ok(!out.queue.some(track=>track.id===removed));
  assert.equal(out.history.length,0);assert.deepEqual(durableSession(f,s.id).served,[]);assert.equal(f.submissions.length,0);
  assert.ok(!Object.hasOwn(out,'dismissedQueueIds'),'Internal reconciliation tombstones are not client telemetry.');
});

test('dismiss and its receipt commit together; a failed receipt insert leaves the prepared queue intact',async t=>{
  const payload={...copy(request),output_package:'variations',variation_count:3};
  const f=fixture(t,{payload,seedOwner:owner,seedPayload:copy(payload),seedCount:3}),s=await f.start(),before=durableSession(f,s.id);
  f.store.db.exec("CREATE TRIGGER fail_dismiss_receipt BEFORE INSERT ON listening_events BEGIN SELECT RAISE(ABORT, 'Explicit receipt failure fixture'); END;");
  await assert.rejects(dismiss(f,s.id,[s.queue[0].id]),/Explicit receipt failure fixture/);
  assert.deepEqual(durableSession(f,s.id),before);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM listening_events').get().n,0);assert.equal(f.submissions.length,0);
  f.store.db.exec('DROP TRIGGER fail_dismiss_receipt');await dismiss(f,s.id,[s.queue[0].id]);assert.equal((await f.view(s.id)).queue.length,1);
});

test('unavailable media preparation blocks adaptive admission before it consumes a generation',async t=>{
 let available=false;const f=fixture(t,{deliveryReady:async()=>{if(!available)throw Object.assign(Error('Media unavailable'),{status:503,code:'DELIVERY_UNAVAILABLE'});}});
 const started=await f.start();assert.equal(started.status,'needs-attention');assert.equal(f.submissions.length,0);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,1);
 available=true;await f.event(started.id,'resume');assert.equal(f.submissions.length,1);
});
