import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,basename,sep} from 'node:path';
import {once} from 'node:events';
import {Store,sha} from '../server/store.mjs';
import {createEngine} from '../server/engine.mjs';
import {createJobs} from '../server/jobs.mjs';
import {createApplication} from '../server/http.mjs';

// Real local HTTP route, sessions/CSRF, SQLite, engine client and job worker.
// The upstream transport is an explicit fixture: no real generation, credentials
// or delivered-song claims. Temporary state never enters the user's catalogue.
const caps=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json',import.meta.url),'utf8'));
const allFields=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/parameter-gap-audit.json',import.meta.url),'utf8')).dry_run_candidate.payload;
const marker='PRIVATE_INITIAL_HTTP_FIXTURE';
const payload={prompt:'A hopeful piano melody. 星空',vocal:{mode:'instrumental'},duration:{target_seconds:30},prompt_enhance:{enabled:false},normalize_output:false};
const copy=value=>JSON.parse(JSON.stringify(value));
const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
async function idle(worker){const until=Date.now()+2000;while(worker.running&&Date.now()<until)await new Promise(resolve=>setImmediate(resolve));assert.equal(worker.running,false,'The isolated worker must finish before assertions and cleanup.');}

async function fixture(t,{webhookUrl=null,deliveryReady=async()=>{}}={}){
  const folder=await mkdtemp(join(tmpdir(),'pmp-initial-http-')),publicRoot=join(folder,'public'),stateRoot=join(folder,'private');
  await mkdir(publicRoot);await mkdir(stateRoot);const store=new Store(':memory:'),calls=[],submissions=[];let wakes=0;
  const engine=createEngine({baseUrl:'https://engine.fixture.invalid',credentials:async()=>({identityToken:marker,apiKey:marker}),fetchImpl:async(url,options)=>{
    const path=new URL(url).pathname;calls.push({path,method:options.method});
    if(path==='/v1/music/capabilities')return response(caps);
    if(path==='/v1/music'){submissions.push(JSON.parse(options.body));return response({success:true,status:'queued',job_id:'initial-http-upstream-'+submissions.length,auth:{token:marker},prompt_sent:marker},202);}
    if(path.startsWith('/v1/music/jobs/'))return response({success:true,status:'processing',auth:{token:marker}});
    assert.fail('Unexpected upstream fixture path: '+path);
  }});
  const media={async ingest(){assert.fail('No fixture music or delivery was produced.');}};
  const worker=createJobs({store,engine,media}),jobs={wake(){wakes++;worker.wake();},retryStatus:worker.retryStatus};
  const config={origin:'http://127.0.0.1:1',publicRoot,stateRoot,production:false,oidc:null,ads:{enabled:false},consent:{enabled:false},dailyAdmissionLimit:100,guestDailyLimit:100,ipDailyLimit:100,webhookUrl};
  const app=createApplication({config,store,engine,media,jobs,deliveryReady});app.server.listen(0,'127.0.0.1');await once(app.server,'listening');config.origin='http://127.0.0.1:'+app.server.address().port;
  t.after(async()=>{
    worker.stop();app.enhancements.stop();await idle(worker);assert.equal(app.running,false);
    app.server.closeAllConnections();await new Promise(resolve=>app.server.close(resolve));await engine.close();store.close();
    const target=resolve(folder);assert.ok(target.startsWith(resolve(tmpdir())+sep)&&basename(target).startsWith('pmp-initial-http-'));await rm(target,{recursive:true,force:true});
  });
  const raw=(path,options)=>fetch(config.origin+path,options);
  async function owner(){const r=await raw('/api/session'),body=await r.json();assert.equal(r.status,200);return{cookie:r.headers.get('set-cookie').split(';')[0],origin:config.origin,'x-csrf-token':body.csrf,'content-type':'application/json','idempotency-key':'initial-http-request'};}
  const headers=await owner();
  async function get(path,who=headers){const r=await raw(path,{headers:{cookie:who.cookie}});return{status:r.status,body:await r.json()};}
  async function post(body=copy(payload),who=headers,path='/api/creations'){
    const r=await raw(path,{method:'POST',headers:who,body:JSON.stringify(body)}),out={status:r.status,headers:r.headers,body:await r.json()};await idle(worker);return out;
  }
  const generationQuota=()=>store.db.prepare("SELECT coalesce(sum(count),0) AS n FROM counters WHERE key LIKE 'generation:global:%'").get().n;
  return {store,engine,worker,submissions,calls,headers,owner,get,post,raw,generationQuota,get wakes(){return wakes;}};
}

test('delivery retry refuses unhealthy processing before consuming retry quota or changing the saved generation',async t=>{
  let available=true;
  const f=await fixture(t,{deliveryReady:async()=>{if(!available)throw Object.assign(Error('Delivery unavailable'),{status:503,code:'DELIVERY_UNAVAILABLE'});}});
  const accepted=await f.post({...payload,output_package:'single_track'},f.headers,'/api/jobs');
  assert.equal(accepted.status,202);
  const id=accepted.body.job.id;
  f.store.updateJob(id,{status:'ingest_failed',result:{success:true,request_id:'saved-fixture-result'},error:{code:'INGEST_PARTIAL',message:'Saved delivery needs recovery.'}});
  const before=f.store.job(id),submitted=f.submissions.length,wakes=f.wakes,quota=f.generationQuota();
  available=false;
  const retry=await f.post({},f.headers,`/api/jobs/${id}/retry-ingest`);
  assert.equal(retry.status,503);assert.equal(retry.body.error.code,'DELIVERY_UNAVAILABLE');
  assert.deepEqual(f.store.job(id),before);assert.equal(f.submissions.length,submitted);assert.equal(f.wakes,wakes);assert.equal(f.generationQuota(),quota);
  assert.equal(f.store.db.prepare("SELECT count(*) AS n FROM counters WHERE key LIKE 'retry:%'").get().n,0);
  const stranger=await f.owner();
  assert.equal((await f.post({},stranger,`/api/jobs/${id}/retry-ingest`)).status,404);
  const invalidCsrf={...f.headers,'x-csrf-token':'invalid'};
  assert.equal((await f.post({},invalidCsrf,`/api/jobs/${id}/retry-ingest`)).status,403);
  assert.equal((await f.get(`/api/jobs/${id}`)).status,200);
});

test('initial HTTP: /api/creations admits three directed children as one visible group, while /api/jobs preserves the exact body',async t=>{
  const f=await fixture(t),created=await f.post();assert.equal(created.status,202);assert.equal(created.headers.get('cache-control'),'no-store');
  assert.equal(created.body.existing,false);assert.equal(created.body.job.status,'queued');assert.equal(created.body.job.tracks.length,0);
  const intent={...payload,async:true},group=f.store.creationGroup(created.body.job.id);
  assert.deepEqual(f.submissions,group.children.map(child=>JSON.parse(child.payload)));assert.deepEqual(created.body.job.workflow.request,intent);assert.deepEqual(created.body.job.workflow.intentRequest,intent);
  assert.deepEqual(created.body.job.workflow.initialPolicy,{version:2,mode:'directed-three',defaultApplied:true,requestedTakes:3,role:'faithful'});
  assert.equal(created.body.job.creation.children.length,3);assert.equal(created.body.job.creation.primaryTrackId,null);assert.equal(new Set(f.submissions.map(body=>body.prompt)).size,3);
  assert.equal(f.store.generationIntent(created.body.job.id).policy.requestedTakes,3);assert.equal(f.wakes,1);
  const bob=await f.owner(),exact=await f.post(payload,bob,'/api/jobs');assert.equal(exact.status,202);
  assert.deepEqual(f.submissions[3],intent);assert.deepEqual(exact.body.job.workflow.request,intent);
  assert.ok(!Object.hasOwn(exact.body.job.workflow,'initialPolicy'));assert.ok(!Object.hasOwn(exact.body.job.workflow,'intentRequest'));
  assert.equal(f.store.generationIntent(exact.body.job.id),null);assert.equal(f.submissions.length,4);assert.equal(f.generationQuota(),4);assert.equal(f.wakes,2);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,4);
});

test('initial HTTP: CSRF and origin checks reject unauthenticated or cross-origin creation before quota and worker wake',async t=>{
  const f=await fixture(t);
  const absent=await f.raw('/api/creations',{method:'POST',headers:{origin:f.headers.origin,'content-type':'application/json'},body:JSON.stringify(payload)});assert.equal(absent.status,401);
  for(const extra of [{'x-csrf-token':''},{'x-csrf-token':'wrong-fixture'},{origin:'https://other.fixture.invalid'}]){
    const denied=await f.post(payload,{...f.headers,...extra});assert.equal(denied.status,403);assert.equal(denied.body.error.code,'CSRF_REJECTED');
  }
  assert.equal(f.submissions.length,0);assert.equal(f.generationQuota(),0);assert.equal(f.wakes,0);assert.equal(f.calls.length,0);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM generation_intents').get().n,0);
});

test('initial HTTP: explicit one, stems, two and four preserve selections and false flags through the actual route and worker',async t=>{
  for(const fields of [{output_package:'single_track'},{output_package:'stems_bundle'},{output_package:'variations',variation_count:2},{output_package:'variations',variation_count:4}]){
    const f=await fixture(t),selected={...copy(payload),...fields,async:false,dry_run:false,capabilities:false},r=await f.post(selected);
    assert.equal(r.status,202);assert.deepEqual(f.submissions,[selected]);assert.deepEqual(r.body.job.workflow.request,selected);
    assert.deepEqual(r.body.job.workflow.intentRequest,selected);assert.equal(r.body.job.workflow.initialPolicy.defaultApplied,false);assert.equal(f.wakes,1);
    assert.equal(r.body.job.workflow.initialPolicy.requestedTakes,fields.output_package==='variations'?fields.variation_count:1);
  }
});

test('initial HTTP: all100 selected parameters survive route validation, persistence and actual worker dispatch',async t=>{
  const selected={...copy(allFields),dry_run:false,capabilities:false,async:false},f=await fixture(t,{webhookUrl:selected.webhook_url});
  const r=await f.post(selected);assert.equal(r.status,202);assert.equal(Object.keys(selected).length,100);
  assert.deepEqual(f.submissions,[selected]);assert.deepEqual(r.body.job.workflow.intentRequest,selected);assert.deepEqual(r.body.job.workflow.request,selected);
  assert.equal(f.wakes,1);assert.equal(f.generationQuota(),1);
});

test('initial HTTP: lost-response same-key replay reuses the group, but changed intent and cross-route collisions are rejected',async t=>{
  const f=await fixture(t),a=await f.post(),b=await f.post();assert.equal(b.status,202);assert.equal(b.body.existing,true);assert.equal(b.body.job.id,a.body.job.id);
  assert.equal(f.submissions.length,3);assert.equal(f.generationQuota(),3);assert.equal(f.wakes,2,'A reused receipt can wake status processing without submitting its music again.');
  const explicit={...payload,output_package:'variations',variation_count:3};
  const changed=await f.post(explicit);assert.equal(changed.status,409);assert.equal(changed.body.error.code,'IDEMPOTENCY_CONFLICT');
  const otherRoute=await f.post(explicit,f.headers,'/api/jobs');assert.equal(otherRoute.status,409);assert.equal(otherRoute.body.error.code,'IDEMPOTENCY_CONFLICT');
  assert.equal(f.wakes,2);assert.equal(f.submissions.length,3);assert.equal(f.generationQuota(),3);
  assert.deepEqual(f.store.generationIntent(a.body.job.id).request,{...payload,async:true});
  const reverse=await fixture(t);assert.equal((await reverse.post(explicit,reverse.headers,'/api/jobs')).status,202);
  const collision=await reverse.post();assert.equal(collision.status,409);assert.equal(collision.body.error.code,'IDEMPOTENCY_CONFLICT');assert.equal(reverse.wakes,1);assert.equal(reverse.submissions.length,1);
});

test('initial HTTP: preview, invalid schema, inactive count, missing identity and malformed JSON do not admit or wake',async t=>{
  const f=await fixture(t);
  for(const flag of [{dry_run:true},{capabilities:true}]){const r=await f.post({...payload,...flag});assert.equal(r.status,400);assert.equal(r.body.error.code,'CONTROL_MODE_UNSUPPORTED');}
  for(const selected of [{prompt:''},{...payload,unknown:true},{...payload,variation_count:4}])assert.equal((await f.post(selected)).status,400);
  const noId=await f.post(payload,{...f.headers,'idempotency-key':''});assert.equal(noId.status,400);assert.equal(noId.body.error.code,'IDEMPOTENCY_REQUIRED');
  const broken=await f.raw('/api/creations',{method:'POST',headers:f.headers,body:'{"prompt":'});assert.equal(broken.status,400);assert.equal((await broken.json()).error.code,'INVALID_JSON');
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,0);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM generation_intents').get().n,0);
  assert.equal(f.generationQuota(),0);assert.equal(f.wakes,0);assert.equal(f.submissions.length,0);
});

test('initial HTTP: owner-only job retrieval exposes original intent and actual wire but no raw upstream/auth data; GET never wakes',async t=>{
  const f=await fixture(t),created=(await f.post()).body.job,bob=await f.owner(),before=f.calls.length,wakes=f.wakes;
  const own=await f.get('/api/jobs/'+created.id);assert.equal(own.status,200);assert.equal(own.body.job.status,'pending');
  assert.deepEqual(own.body.job.workflow.intentRequest,{...payload,async:true});assert.equal(own.body.job.workflow.request.variation_count,undefined);assert.deepEqual(own.body.job.creation.children.map(child=>child.role),['faithful','neighbour','explore']);
  assert.equal(own.body.job.workflow.initialPolicy.requestedTakes,3);assert.deepEqual(own.body.job.tracks,[]);
  assert.equal((await f.get('/api/jobs/'+created.id,bob)).status,404);assert.deepEqual((await f.get('/api/jobs',bob)).body,{jobs:[]});
  assert.equal((await f.raw('/api/jobs/'+created.id)).status,401);
  const text=JSON.stringify(own.body);for(const hidden of [marker,'initial-http-upstream-','fingerprint','engine.fixture.invalid'])assert.ok(!text.includes(hidden),hidden);
  assert.ok(f.store.job(created.id).result.includes(marker),'Only the private stored result retains the upstream fixture marker.');
  assert.equal(f.calls.length,before);assert.equal(f.wakes,wakes);assert.equal(f.submissions.length,3);
});

test('initial HTTP: GET exposes progressive per-child states and faithful identity without making another request',async t=>{
  const f=await fixture(t),created=(await f.post()).body.job,group=f.store.creationGroup(created.id),wakes=f.wakes,calls=f.calls.length;
  function publish(id){const asset=kind=>({id:sha(id+kind),kind,measured:true,durationSeconds:30,codec:kind==='master'?'pcm_s24le':'aac',sampleRate:48000,channels:2});f.store.updateJob(id,{status:'ingesting',result:{success:true,tracks:[{take:1}]}});f.store.publish(f.store.job(id),{jobId:id,status:'ready',takes:[{id:sha(id+'fixture'),take:1,status:'ready',master:asset('master'),listening:asset('listening')}]});f.store.updateJob(id,{status:'ready'});return sha(id+'fixture');}
  const explore=publish(group.children[2].id);let got=(await f.get('/api/jobs/'+created.id)).body.job;
  assert.equal(got.status,'pending');assert.equal(got.creation.primaryTrackId,null);assert.equal(got.creation.deliveredTakes,1);assert.deepEqual(got.tracks.map(track=>track.id),[explore]);
  assert.notEqual(got.workflow.steps.find(step=>step.id==='music').state,'complete','One finished child cannot mark all music workers complete.');
  const primary=publish(group.children[0].id);got=(await f.get('/api/jobs/'+created.id)).body.job;assert.equal(got.creation.primaryTrackId,primary);assert.equal(got.creation.primaryStatus,'ready');assert.equal(got.status,'pending');assert.deepEqual(got.tracks.map(track=>track.id),[primary,explore]);
  const peer=(await f.get('/api/jobs/'+group.children[2].id)).body.job;assert.equal(peer.creationId,created.id);assert.equal(peer.creation,undefined);assert.deepEqual(peer.tracks.map(track=>track.id),[explore]);
  const list=(await f.get('/api/jobs')).body.jobs;assert.equal(list.length,1);assert.equal(list[0].id,created.id);assert.equal(list[0].creation.deliveredTakes,2);
  const bob=await f.owner();for(const child of group.children)assert.equal((await f.get('/api/jobs/'+child.id,bob)).status,404);
  assert.equal(f.submissions.length,3);assert.equal(f.wakes,wakes);assert.equal(f.calls.length,calls);
});

test('initial HTTP: overlapping browser retries atomically share one three-child group',async t=>{
  const f=await fixture(t),results=await Promise.all([f.post(),f.post(),f.post()]);for(const result of results)assert.equal(result.status,202);
  assert.equal(new Set(results.map(result=>result.body.job.id)).size,1);assert.equal(results.filter(result=>!result.body.existing).length,1);
  assert.equal(f.submissions.length,3);assert.equal(f.generationQuota(),3);assert.equal((await f.get('/api/jobs')).body.jobs.length,1);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM creation_groups').get().n,1);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM creation_children').get().n,3);
});

test('session scope is opaque, stable for the same owner, and distinct for a new guest',async t=>{
 const f=await fixture(t),one=await f.get('/api/session'),again=await f.get('/api/session'),other=await f.get('/api/session',await f.owner());
 assert.match(one.body.authScope,/^[a-f0-9]{64}$/);assert.equal(one.body.authScope,again.body.authScope);assert.notEqual(one.body.authScope,other.body.authScope);assert.equal(one.body.owner,undefined);
});

test('both creation admission endpoints refuse before any quota or job when actual delivery is unavailable',async t=>{
 const f=await fixture(t,{deliveryReady:async()=>{throw Object.assign(Error('Delivery unavailable'),{status:503,code:'DELIVERY_UNAVAILABLE'});}});
 for(const path of ['/api/creations','/api/jobs']){const result=await f.post(copy(payload),f.headers,path);assert.equal(result.status,503);assert.equal(result.body.error.code,'DELIVERY_UNAVAILABLE');}
 assert.equal(f.generationQuota(),0);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,0);assert.equal(f.submissions.length,0);
});
