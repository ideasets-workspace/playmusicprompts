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

// Real loopback HTTP, security/session boundary, SQLite and music worker. The
// upstream transport and media measurements are explicit fixtures, not songs
// created or measured for a user; these tests never contact the music service.
const caps=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json',import.meta.url),'utf8'));
const marker='SYNTHETIC_PRIVATE_LISTENING_HTTP';
const request={prompt:'A calm piano melody. 星空',genres:['classical'],vocal:{mode:'instrumental'},duration:{target_seconds:120},async:false,prompt_enhance:{enabled:false},normalize_output:false};
const clientId='listening-http-client';
const copy=value=>JSON.parse(JSON.stringify(value));
const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function idle(worker){const deadline=Date.now()+2000;while(worker.running&&Date.now()<deadline)await tick();assert.equal(worker.running,false,'The isolated worker must settle.');}

function publish(store,id,count=1,status='ready'){
  const result={success:true,auth:{token:marker},prompt_sent:marker,tracks:Array.from({length:count},(_,i)=>({take:i+1,gcs_uri:'gs://private-fixture/'+marker+i}))};
  store.updateJob(id,{status:'ingesting',result});
  const asset=(kind,take)=>({id:sha(id+take+kind),kind,path:'C:/private-fixture/'+marker,sha256:sha(id+kind),size:1200,measured:true,durationSeconds:120,codec:kind==='master'?'pcm_s24le':'aac',sampleRate:48000,channels:2});
  const manifest={jobId:id,status,takes:Array.from({length:count},(_,i)=>({id:sha(id+':track:'+i),take:i+1,kind:'delivered-master',status:'ready',master:asset('master',i),listening:asset('listening',i)}))};
  store.publish(store.job(id),manifest);store.updateJob(id,{status,error:status==='ready'?null:{code:'INGEST_PARTIAL',message:'Explicit partial fixture.'}});
  return store.publicJob(store.job(id)).tracks;
}

async function fixture(t){
  const folder=await mkdtemp(join(tmpdir(),'pmp-listening-http-')),publicRoot=join(folder,'public'),stateRoot=join(folder,'private');
  await mkdir(publicRoot);await mkdir(stateRoot);
  const store=new Store(':memory:'),calls=[],submissions=[];
  const seed=store.admit({owner:'catalogue-fixture',ipKey:'catalogue-ip',idem:'catalogue-seed',payload:{prompt:'Catalogue fixture.'},limits:{daily:100,owner:100,ip:100}}).job;
  const track=publish(store,seed.id)[0];
  const engine=createEngine({baseUrl:'https://engine.fixture.invalid',credentials:async()=>({identityToken:marker,apiKey:marker}),fetchImpl:async(url,options)=>{
    const path=new URL(url).pathname;calls.push({path,method:options.method});
    if(path==='/v1/music/capabilities')return response(caps);
    if(path==='/v1/music'){submissions.push(JSON.parse(options.body));return response({success:true,status:'queued',job_id:'upstream-fixture-'+submissions.length,auth:{token:marker}},202);}
    if(path.startsWith('/v1/music/jobs/'))return response({success:true,status:'processing',auth:{token:marker}});
    assert.fail('Unexpected upstream fixture path: '+path);
  }});
  const media={async ingest(){assert.fail('Only explicit fixture metadata may be published in this test.');}};
  const jobs=createJobs({store,engine,media});
  const config={origin:'http://127.0.0.1:1',publicRoot,stateRoot,production:false,oidc:null,ads:{enabled:false},consent:{enabled:false},dailyAdmissionLimit:100,guestDailyLimit:100,ipDailyLimit:100,webhookUrl:null};
  const app=createApplication({config,store,engine,media,jobs});
  app.server.listen(0,'127.0.0.1');await once(app.server,'listening');config.origin='http://127.0.0.1:'+app.server.address().port;
  t.after(async()=>{
    jobs.stop();app.enhancements.stop();await idle(jobs);assert.equal(app.running,false);
    app.server.closeAllConnections();await new Promise(resolve=>app.server.close(resolve));store.close();
    const target=resolve(folder);assert.ok(target.startsWith(resolve(tmpdir())+sep)&&basename(target).startsWith('pmp-listening-http-'));
    await rm(target,{recursive:true,force:true});
  });
  const fetchLocal=(path,options)=>fetch(config.origin+path,options);
  async function owner(){const r=await fetchLocal('/api/session'),body=await r.json();assert.equal(r.status,200);return {cookie:r.headers.get('set-cookie').split(';')[0],origin:config.origin,'x-csrf-token':body.csrf,'content-type':'application/json','idempotency-key':'listening-http-start'};}
  const headers=await owner();let eventNumber=0;
  async function get(path,who=headers){const r=await fetchLocal(path,{headers:{cookie:who.cookie}});return {status:r.status,body:await r.json(),headers:r.headers};}
  async function post(path,body,who=headers){const r=await fetchLocal(path,{method:'POST',headers:who,body:JSON.stringify(body)});const out={status:r.status,body:await r.json(),headers:r.headers};await idle(jobs);return out;}
  const start=(body={clientId,trackId:track.id,request:copy(request)},who=headers)=>post('/api/listening-sessions',body,who);
  const event=(id,type,extra={},who=headers)=>post('/api/listening-sessions/'+id+'/events',{eventId:'listening-http-event-'+(++eventNumber),clientId,type,trackId:track.id,position:0,playedSeconds:0,playing:true,...extra},who);
  return {app,store,jobs,calls,submissions,track,headers,owner,get,post,start,event,fetchLocal,publish:(id,count,status)=>publish(store,id,count,status)};
}

test('listening HTTP: 202 and same-key concurrent start produce one durable admission; GET restoration never submits',async t=>{
  const f=await fixture(t);assert.deepEqual((await f.get('/api/listening-sessions')).body,{sessions:[]});assert.equal(f.calls.length,0);
  const [a,b]=await Promise.all([f.start(),f.start()]);assert.equal(a.status,202);assert.equal(b.status,202);assert.equal(a.headers.get('cache-control'),'no-store');
  const s=a.body.session;assert.equal(s.id,b.body.session.id);assert.equal(s.clientId,clientId);assert.equal(s.idempotencyKey,f.headers['idempotency-key']);
  assert.equal(s.status,'preparing');assert.deepEqual(s.queue,[]);assert.ok(s.activeJob.id);
  assert.equal(f.submissions.length,1);assert.deepEqual(f.submissions[0],request,'Continuation preserves the selected output package instead of imposing another initial burst.');
  const privateSession=JSON.parse(f.store.db.prepare('SELECT data FROM listening_sessions WHERE id=?').get(s.id).data);
  assert.deepEqual(privateSession.request,request);assert.equal(privateSession.activeJobId,s.activeJob.id);
  const before=f.calls.length;
  for(let n=0;n<3;n++){assert.equal((await f.get('/api/listening-sessions/'+s.id)).status,200);assert.equal((await f.get('/api/listening-sessions')).body.sessions[0].id,s.id);}
  assert.equal(f.calls.length,before,'GET status must not call any upstream endpoint.');assert.equal(f.submissions.length,1);
  const conflict=await f.start({clientId,trackId:f.track.id,request:{...request,prompt:'Changed brief'}});assert.equal(conflict.status,409);assert.equal(conflict.body.error.code,'IDEMPOTENCY_CONFLICT');
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM listening_sessions').get().n,1);
});

test('listening HTTP: guest ownership and CSRF apply to list, get, start and event routes',async t=>{
  const f=await fixture(t),s=(await f.start()).body.session,bob=await f.owner();
  assert.deepEqual((await f.get('/api/listening-sessions',bob)).body,{sessions:[]});assert.equal((await f.get('/api/listening-sessions/'+s.id,bob)).status,404);
  assert.equal((await f.event(s.id,'pause',{},bob)).status,404);
  for(const overrides of [{'x-csrf-token':''},{'x-csrf-token':'wrong-fixture'},{origin:'https://other.fixture.invalid'}]){
    const who={...f.headers,...overrides};
    for(const r of [await f.start(undefined,who),await f.event(s.id,'pause',{},who)]){assert.equal(r.status,403);assert.equal(r.body.error.code,'CSRF_REJECTED');}
  }
  for(const path of ['/api/listening-sessions','/api/listening-sessions/'+s.id])assert.equal((await f.fetchLocal(path)).status,401);
  assert.equal((await f.fetchLocal('/api/listening-sessions/'+s.id+'/events',{method:'POST',headers:{origin:f.headers.origin,'content-type':'application/json'},body:'{}'})).status,401);
  assert.equal(f.submissions.length,1);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM listening_events').get().n,0);
});

test('listening HTTP: event receipts replay once, reject changed bodies and prevent another tab from consuming the queue',async t=>{
  const f=await fixture(t),s=(await f.start()).body.session;f.publish(s.activeJob.id,3);await f.get('/api/listening-sessions/'+s.id);
  const body={eventId:'durable-skip-event',clientId,type:'skip',trackId:f.track.id,position:2,playedSeconds:2,playing:true};
  const a=await f.post('/api/listening-sessions/'+s.id+'/events',body);assert.equal(a.status,200);assert.equal(a.body.session.history.length,1);assert.equal(f.submissions.length,2);
  const b=await f.post('/api/listening-sessions/'+s.id+'/events',body);assert.equal(b.status,200);assert.equal(b.body.session.history.length,1);assert.equal(f.submissions.length,2);
  const conflict=await f.post('/api/listening-sessions/'+s.id+'/events',{...body,position:3});assert.equal(conflict.status,409);assert.equal(conflict.body.error.code,'IDEMPOTENCY_CONFLICT');
  const other=await f.event(s.id,'start',{clientId:'other-client-tab',trackId:a.body.session.queue[0].id});assert.equal(other.status,409);assert.equal(other.body.error.code,'LISTENING_IN_ANOTHER_TAB');
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM listening_events').get().n,1);assert.equal(f.submissions.length,2);
});

test('listening HTTP: pause and disable suppress refill despite stale playing telemetry; explicit resume can refill once',async t=>{
  const f=await fixture(t),s=(await f.start()).body.session,tracks=f.publish(s.activeJob.id,3);await f.get('/api/listening-sessions/'+s.id);
  const paused=await f.event(s.id,'pause',{playing:false});assert.equal(paused.body.session.playing,false);assert.equal(paused.body.session.enabled,true);
  for(const track of tracks.slice(0,2))assert.equal((await f.event(s.id,'start',{trackId:track.id})).status,200);
  await f.event(s.id,'progress',{trackId:tracks[1].id,position:119,playedSeconds:119,playing:true});
  await f.get('/api/listening-sessions/'+s.id);assert.equal(f.submissions.length,1);
  const resumed=await f.event(s.id,'resume',{trackId:tracks[1].id});assert.equal(resumed.status,200);assert.equal(resumed.body.session.playing,true);assert.equal(f.submissions.length,2);
  f.publish(resumed.body.session.activeJob.id,1);
  const disabled=await f.event(s.id,'disable',{trackId:tracks[1].id,playing:false});assert.equal(disabled.body.session.enabled,false);
  await f.event(s.id,'skip',{trackId:tracks[1].id,position:1,playedSeconds:1,playing:true});await f.get('/api/listening-sessions');assert.equal(f.submissions.length,2);
});

test('listening HTTP: uncertain generation blocks a replacement and explicit recovered same-job resume keeps owned takes',async t=>{
  const f=await fixture(t),s=(await f.start()).body.session,id=s.activeJob.id;
  f.store.updateJob(id,{status:'uncertain',error:{code:'JOB_STATUS_UNAVAILABLE',message:'Fixture outcome unconfirmed.'}});
  const pending=(await f.get('/api/listening-sessions/'+s.id)).body.session;assert.equal(pending.status,'needs-attention');assert.equal(pending.activeJob.id,id);
  const refused=await f.event(s.id,'resume');assert.equal(refused.status,409);assert.equal(refused.body.error.code,'OUTCOME_UNCONFIRMED');assert.equal(f.submissions.length,1);
  const recovered=f.publish(id,3),resumed=await f.event(s.id,'resume');assert.equal(resumed.status,200);assert.deepEqual(resumed.body.session.queue.map(x=>x.id),recovered.map(x=>x.id));
  assert.equal(resumed.body.session.activeJob,null);assert.equal(f.submissions.length,1);
});

test('listening HTTP: only published owned outputs reach the queue and private result, auth and media paths stay private',async t=>{
  const f=await fixture(t),s=(await f.start()).body.session;assert.ok(!JSON.stringify(s).includes(marker));
  const tracks=f.publish(s.activeJob.id,1,'partial'),out=await f.get('/api/listening-sessions/'+s.id),view=out.body.session;
  assert.equal(view.status,'needs-attention');assert.equal(view.error.code,'INGEST_PARTIAL');assert.equal(view.queue.length,1);
  assert.equal(view.queue[0].id,tracks[0].id);assert.equal(view.queue[0].owned,true);assert.equal(view.queue[0].url,'/api/listen/'+tracks[0].id);
  assert.equal(view.queue[0].duration,120);assert.equal(view.queue[0].listening.codec,'aac');assert.equal(view.queue[0].master.codec,'pcm_s24le');
  const text=JSON.stringify(out.body);for(const hidden of [marker,'gs://','https://engine.fixture.invalid','fingerprint','upstream-fixture-'])assert.ok(!text.includes(hidden),hidden);
  assert.ok(JSON.parse(f.store.job(s.activeJob.id).result).auth.token===marker,'Exact fixture upstream envelope remains in private SQLite.');
  assert.equal(f.submissions.length,1);
});

test('listening HTTP: invalid or preview-only session requests fail before admission and invalid telemetry creates no event receipt',async t=>{
  const f=await fixture(t),base={clientId,trackId:f.track.id,request};
  for(const body of [{...base,request:{prompt:''}},{...base,request:{...request,dry_run:true}},{...base,request:{...request,capabilities:true}},
    {...base,trackId:'missing-track'},{...base,clientId:'bad'},{...base,unknown:true}])assert.equal((await f.start(body)).status,400);
  assert.equal((await f.start(base,{...f.headers,'idempotency-key':''})).status,400);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM listening_sessions').get().n,0);assert.equal(f.submissions.length,0);
  const s=(await f.start()).body.session;
  for(const extra of [{position:-1},{playedSeconds:3601},{eventId:'bad'},{unknown:true}])assert.equal((await f.event(s.id,'progress',extra)).status,400);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM listening_events').get().n,0);assert.equal(f.submissions.length,1);
});
