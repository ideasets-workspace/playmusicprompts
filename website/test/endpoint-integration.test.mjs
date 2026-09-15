import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,basename,sep} from 'node:path';
import {once} from 'node:events';
import {createEngine} from '../server/engine.mjs';
import {createApplication} from '../server/http.mjs';
import {Store} from '../server/store.mjs';

// Actual engine adapter + HTTP application + SQLite, using an injected upstream
// transport and ephemeral loopback server. No Google/cloud calls, credentials,
// music generation, identity accounts or stored user media are accessed.
const captured=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json',import.meta.url),'utf8'));
const baseUrl='https://music.endpoint-fixture.invalid';
const fixtureAuth={identityToken:'SYNTHETIC_IDENTITY_NOT_REAL',apiKey:'SYNTHETIC_KEY_NOT_REAL'};
const marker='SYNTHETIC_PRIVATE_NEVER_REAL';
const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function adapter(handler){
  const calls=[];let credentialsCalls=0;
  const engine=createEngine({baseUrl,credentials:async()=>{credentialsCalls++;return fixtureAuth;},fetchImpl:async(url,options)=>{calls.push({url,options});return handler(new URL(url).pathname,options);}});
  return{engine,calls,get credentialsCalls(){return credentialsCalls;}};
}
async function application(t,{health=async()=>({ok:true,auth:{key:marker},params:103,version:'fixture'}),submit=async()=>({success:true,dry_run:true,prompt_sent:'Local plan'})}={}){
  const folder=await mkdtemp(join(tmpdir(),'pmp-endpoint-integration-')),publicRoot=join(folder,'public'),stateRoot=join(folder,'private-state');
  await mkdir(publicRoot);await mkdir(stateRoot);await writeFile(join(publicRoot,'index.html'),'<!doctype html><title>Local endpoint fixture</title>');
  const store=new Store(':memory:'),wire=adapter(async(path,options)=>{
    if(path==='/health')return response(await health());
    if(path==='/v1/music/capabilities')return response(captured);
    if(path==='/v1/music'){const result=await submit(JSON.parse(options.body));return result instanceof Response?result:response(result);}
    assert.fail('Unexpected upstream fixture endpoint: '+path);
  });
  let wakes=0;
  const config={origin:'http://127.0.0.1:1',publicRoot,stateRoot,production:false,oidc:null,ads:{enabled:false},consent:{enabled:false},dailyAdmissionLimit:100,guestDailyLimit:100,ipDailyLimit:100,webhookUrl:null};
  const app=createApplication({config,store,engine:wire.engine,media:{},jobs:{wake(){wakes++;}}});
  app.server.listen(0,'127.0.0.1');await once(app.server,'listening');config.origin='http://127.0.0.1:'+app.server.address().port;
  t.after(async()=>{
    app.server.closeAllConnections();await new Promise(resolve=>app.server.close(resolve));store.close();
    const target=resolve(folder),parent=resolve(tmpdir());assert.ok(target.startsWith(parent+sep)&&basename(target).startsWith('pmp-endpoint-integration-'));
    await rm(target,{recursive:true,force:true});
  });
  const request=(path,options)=>fetch(config.origin+path,options);
  const sessionResponse=await request('/api/session'),session=await sessionResponse.json(),cookie=sessionResponse.headers.get('set-cookie').split(';')[0];
  const headers={cookie,origin:config.origin,'x-csrf-token':session.csrf,'content-type':'application/json','idempotency-key':'endpoint-fixture-request'};
  return{store,wire,request,headers,config,get wakes(){return wakes;}};
}
test('all six documented client endpoint adapters use the exact method/path and both authentication headers; no worker runner',async()=>{
  const f=adapter(async path=>response(path==='/health'?{ok:true}:path.endsWith('/jobs/job-fixture')?{success:true,status:'queued'}:{success:true}));
  await f.engine.health();await f.engine.capabilities();await f.engine.submit({prompt:'Boundary fixture',async:false});
  await f.engine.job('job-fixture');await f.engine.originality('request-fixture');await f.engine.delivery('gs://fixture-bucket/music.wav');
  assert.deepEqual(f.calls.map(({url,options})=>[new URL(url).pathname,options.method]),[
    ['/health','GET'],['/v1/music/capabilities','GET'],['/v1/music','POST'],['/v1/music/jobs/job-fixture','GET'],
    ['/v1/music/originality/request-fixture','GET'],['/v1/music/delivery-url','POST']]);
  for(const call of f.calls){assert.equal(call.options.headers.Authorization,'Bearer '+fixtureAuth.identityToken);assert.equal(call.options.headers['x-api-key'],fixtureAuth.apiKey);assert.equal(call.options.redirect,'error');}
  assert.equal(f.calls[0].options.body,undefined);assert.deepEqual(JSON.parse(f.calls[2].options.body),{prompt:'Boundary fixture',async:false});
  assert.deepEqual(JSON.parse(f.calls[5].options.body),{gcs_uri:'gs://fixture-bucket/music.wav'});assert.equal(f.credentialsCalls,6);
  assert.equal(f.engine.run,undefined);assert.throws(()=>f.engine.job('job-fixture/run'),/Invalid music job identifier/);assert.equal(f.calls.length,6);
});
test('owner rule 2026-09-15: /api/connection never calls the engine; it is derived from the schema cache and history and coalesces trivially',async t=>{
  let healthCalls=0;
  const h=await application(t,{health:async()=>{healthCalls++;return{ok:true,auth:{key:marker},version:marker,params:103,debug:{token:marker}};}});
  const replies=await Promise.all(Array.from({length:8},()=>h.request('/api/connection',{headers:{cookie:h.headers.cookie}}))),bodies=await Promise.all(replies.map(r=>r.json()));
  for(const [i,body]of bodies.entries()){
    assert.equal(replies[i].status,200);assert.equal(replies[i].headers.get('cache-control'),'no-store');
    assert.deepEqual(Object.keys(body).sort(),['available','checkedAt','delivery','generationAvailable','lastGeneration','schema']);
    assert.equal(body.available,false,'no schema has ever been fetched in this fixture');assert.equal(body.generationAvailable,false);assert.deepEqual(body.delivery,{available:true});
    assert.equal(body.lastGeneration,null);assert.deepEqual(body.schema,{fetchedAt:null,revision:null});assert.ok(Number.isFinite(body.checkedAt));assert.ok(!JSON.stringify(body).includes(marker));
  }
  assert.equal(healthCalls,0);assert.equal(h.wire.calls.filter(x=>new URL(x.url).pathname==='/health').length,0);
  assert.equal(h.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,0);
});
test('owner rule 2026-09-15: the schema is fetched once and then served from the on-disk cache; connection turns available without any health call',async t=>{
  let count=0;const h=await application(t,{health:async()=>({ok:++count===1})});
  const schema=await h.request('/api/controls-schema');assert.equal(schema.status,200);
  const first=await(await h.request('/api/connection')).json();assert.equal(first.available,true);assert.equal(first.generationAvailable,true);assert.ok(Number.isFinite(first.schema.fetchedAt));
  for(let i=0;i<5;i++)assert.equal((await h.request('/api/controls-schema')).status,200);
  assert.equal(h.wire.calls.filter(x=>new URL(x.url).pathname==='/v1/music/capabilities').length,1,'one engine call for the schema, ever');
  assert.equal(count,0,'health is never asked');
  const {readFileSync}=await import('node:fs');const {resolve}=await import('node:path');
  const persisted=JSON.parse(readFileSync(resolve(h.config.stateRoot,'capabilities.cache.json'),'utf8'));assert.ok(persisted.document?.parameters,'the document is on disk for the next process');
});
test('owner rule 2026-09-15: a malformed or failing engine health can no longer reach a visitor; local healthz is separate',async t=>{
  let count=0;const errors=[];t.mock.method(console,'error',value=>errors.push(String(value)));
  const h=await application(t,{health:async()=>{count++;return {ok:'true',auth:marker};}});
  const local=await h.request('/healthz');assert.equal(local.status,200);assert.equal((await local.json()).ok,true);
  const connection=await h.request('/api/connection'),body=await connection.json();assert.equal(connection.status,200);assert.equal(body.available,false);
  assert.ok(!JSON.stringify(body).includes(marker));assert.ok(errors.every(line=>!line.includes(marker)));assert.equal(count,0);
});
test('real HTTP admission preserves explicit async:false in durable SQLite and only defaults an omitted choice',async t=>{
  const h=await application(t),chosen={prompt:'Exact local fixture',async:false,duration:{target_seconds:30}};
  const submitted=await h.request('/api/jobs',{method:'POST',headers:h.headers,body:JSON.stringify(chosen)});
  assert.equal(submitted.status,202);const first=await submitted.json();assert.equal(first.existing,false);
  assert.deepEqual(JSON.parse(h.store.job(first.job.id).payload),chosen);assert.equal(h.wakes,1);
  const replay=await h.request('/api/jobs',{method:'POST',headers:h.headers,body:JSON.stringify(chosen)});const duplicate=await replay.json();
  assert.equal(replay.status,202);assert.equal(duplicate.existing,true);assert.equal(duplicate.job.id,first.job.id);
  h.store.updateJob(first.job.id,{status:'failed'});
  const omitted=await h.request('/api/jobs',{method:'POST',headers:{...h.headers,'idempotency-key':'endpoint-omitted-async'},body:JSON.stringify({prompt:'Second local fixture'})});
  assert.equal(omitted.status,202);const second=await omitted.json();assert.equal(JSON.parse(h.store.job(second.job.id).payload).async,true);
  assert.equal(h.wire.calls.filter(x=>new URL(x.url).pathname==='/v1/music').length,0,'Admission is durable; this test does not execute a generation worker.');
});
test('owner rule 2026-09-15: /api/previews is refused before any engine call, whatever the engine would have answered',async t=>{
  for(const status of [400,422])await t.test('upstream '+status,async t=>{
    const upstream={success:false,error_code:'INVALID_REQUEST',error:marker,refused:['prompt: '+marker],auth:{api_key:marker},traceback:marker};
    const h=await application(t,{submit:async()=>response(upstream,status)});
    const payload={prompt:'Local valid preview',dry_run:true,capabilities:false,async:false};
    const reply=await h.request('/api/previews',{method:'POST',headers:h.headers,body:JSON.stringify(payload)}),body=await reply.json();
    assert.equal(reply.status,409);assert.equal(body.error.code,'PREVIEW_UNAVAILABLE');assert.ok(!JSON.stringify(body).includes(marker));
    assert.equal(h.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,0);assert.equal(h.wakes,0);
    assert.equal(h.store.db.prepare('SELECT count(*) AS n FROM request_previews').get().n,0,'nothing is recorded for a refused preview');
    assert.equal(h.wire.calls.filter(x=>new URL(x.url).pathname==='/v1/music').length,0,'the engine is never contacted for a preview');
  });
});
test('owner rule 2026-09-15: the preview-mode fields stay described in the controls contract while the preview route itself is refused',async t=>{
  const h=await application(t,{submit:async()=>response({success:false,error_code:'LANGUAGE_NOT_PROVEN',error:marker},422)});
  const schema=await(await h.request('/api/controls-schema')).json();
  for(const name of ['dry_run','capabilities'])assert.ok(schema.parameters.find(x=>x.key===name),name+' remains an ordinary request field (its false value is part of every generation request)');
  const r=await h.request('/api/previews',{method:'POST',headers:h.headers,body:JSON.stringify({prompt:'Local preview',dry_run:true})});
  assert.equal(r.status,409);assert.equal((await r.json()).error.code,'PREVIEW_UNAVAILABLE');assert.equal(h.wire.calls.filter(x=>new URL(x.url).pathname==='/v1/music').length,0);
});
test('the website exposes no internal Cloud Tasks runner or arbitrary upstream forwarding POST route',async t=>{
  const h=await application(t);
  for(const path of ['/v1/music/jobs/job-fixture/run','/api/v1/music/jobs/job-fixture/run','/api/jobs/job-fixture/run','/api/internal/run','/api/connection']){
    const r=await h.request(path,{method:'POST',headers:h.headers,body:'{}'});assert.ok([404,405].includes(r.status),path);
    assert.ok(!JSON.stringify(await r.json()).includes(marker));
  }
  assert.equal(h.wire.calls.length,0);assert.equal(h.wakes,0);assert.equal(h.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,0);
});
