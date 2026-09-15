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
test('real HTTP connection response strips raw auth and metadata, coalesces concurrent calls and reuses the server cache',async t=>{
  let release,entered;const arrived=new Promise(r=>entered=r),gate=new Promise(r=>release=r);let healthCalls=0;
  const h=await application(t,{health:async()=>{healthCalls++;entered();await gate;return{ok:true,auth:{key:marker},version:marker,params:103,debug:{token:marker}};}});
  const pending=Array.from({length:8},()=>h.request('/api/connection',{headers:{cookie:h.headers.cookie}}));
  await arrived;await tick();assert.equal(healthCalls,1);release();
  const replies=await Promise.all(pending),bodies=await Promise.all(replies.map(r=>r.json()));
  for(const [i,body]of bodies.entries()){
    assert.equal(replies[i].status,200);assert.equal(replies[i].headers.get('cache-control'),'no-store');
    assert.deepEqual(Object.keys(body).sort(),['available','checkedAt','delivery','generationAvailable']);assert.equal(body.available,true);assert.deepEqual(body.delivery,{available:true});assert.equal(body.generationAvailable,true);assert.ok(Number.isFinite(body.checkedAt));assert.ok(!JSON.stringify(body).includes(marker));
  }
  assert.ok(bodies.every(x=>x.checkedAt===bodies[0].checkedAt));assert.equal(healthCalls,1);
  const repeat=await(await h.request('/api/connection')).json();assert.deepEqual(repeat,bodies[0]);assert.equal(healthCalls,1);
  assert.equal(h.wire.calls.filter(x=>new URL(x.url).pathname==='/health').length,1);
  assert.equal(h.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,0);
});
test('health false is unavailable; cache expires after its configured interval without carrying a stale healthy result',async t=>{
  let count=0;const h=await application(t,{health:async()=>({ok:++count===1})});
  const first=await(await h.request('/api/connection')).json();assert.equal(first.available,true);
  const realNow=Date.now;const later=realNow()+31000;t.mock.method(Date,'now',()=>later);
  const next=await(await h.request('/api/connection')).json();assert.equal(next.available,false);assert.equal(count,2);assert.equal(next.checkedAt,later);
  const cached=await(await h.request('/api/connection')).json();assert.deepEqual(cached,next);assert.equal(count,2);
});
test('malformed health cannot be reported healthy or poison later recovery; local healthz is separate',async t=>{
  let count=0;const errors=[];t.mock.method(console,'error',value=>errors.push(String(value)));
  const h=await application(t,{health:async()=>++count===1?{ok:'true',auth:marker}:{ok:true}});
  const local=await h.request('/healthz');assert.equal(local.status,200);assert.equal((await local.json()).ok,true);assert.equal(count,0);
  const bad=await h.request('/api/connection'),body=await bad.json();assert.equal(bad.status,502);assert.equal(body.error.code,'HEALTH_INVALID');
  assert.ok(!JSON.stringify(body).includes(marker));assert.ok(errors.every(line=>!line.includes(marker)));
  const recovered=await h.request('/api/connection');assert.equal(recovered.status,200);assert.equal((await recovered.json()).available,true);assert.equal(count,2);
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
test('actual preview EngineError 400/422 field refusals reach HTTP clients as safe named issues while raw evidence stays private',async t=>{
  for(const status of [400,422])await t.test('upstream '+status,async t=>{
    const upstream={success:false,error_code:'INVALID_REQUEST',error:marker,refused:[
      'duration.target_seconds: > max 180 '+marker,
      'lyrics.text: required '+marker,
      'structure[1].bars: not in allowed set '+marker,
      'auth.api_key: '+marker,
      'prompt: '+marker
    ],auth:{api_key:marker},traceback:marker};
    const h=await application(t,{submit:async()=>response(upstream,status)});
    const payload={prompt:'Local valid preview',dry_run:true,capabilities:false,async:false};
    const reply=await h.request('/api/previews',{method:'POST',headers:h.headers,body:JSON.stringify(payload)}),body=await reply.json();
    assert.equal(reply.status,status);assert.equal(body.error.code,'INVALID_REQUEST');
    assert.deepEqual(body.error.issues.map(x=>[x.path,x.code]),[['duration.target_seconds','RANGE'],['lyrics.text','REQUIRED'],['structure[1].bars','ENUM'],['prompt','REVIEW_SETTING']]);
    assert.ok(body.error.issues.every(x=>typeof x.message==='string'&&!x.message.includes(marker)));assert.ok(!JSON.stringify(body).includes(marker));
    assert.equal(h.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,0);assert.equal(h.wakes,0);
    const saved=h.store.db.prepare('SELECT * FROM request_previews').get();assert.equal(saved.state,'failed');assert.deepEqual(JSON.parse(saved.payload),payload);
    assert.equal(JSON.parse(saved.response).auth.api_key,marker);
    const count=h.wire.calls.filter(x=>new URL(x.url).pathname==='/v1/music').length;
    const again=await h.request('/api/previews',{method:'POST',headers:h.headers,body:JSON.stringify(payload)});assert.equal(again.status,409);
    assert.equal((await again.json()).error.code,'PREVIEW_NEEDS_ATTENTION');assert.equal(h.wire.calls.filter(x=>new URL(x.url).pathname==='/v1/music').length,count);
  });
});
test('documented language refusal exposes reviewed corrective fields without leaking arbitrary upstream reasons',async t=>{
  const h=await application(t,{submit:async()=>response({success:false,error_code:'LANGUAGE_NOT_PROVEN',error:marker,language_details:{private:marker}},422)});
  const r=await h.request('/api/previews',{method:'POST',headers:h.headers,body:JSON.stringify({prompt:'Local preview',dry_run:true})}),b=await r.json();
  assert.equal(r.status,422);assert.deepEqual(b.error.issues.map(x=>x.path),['vocal.language','vocal.language_policy']);assert.ok(!JSON.stringify(b).includes(marker));
});
test('the website exposes no internal Cloud Tasks runner or arbitrary upstream forwarding POST route',async t=>{
  const h=await application(t);
  for(const path of ['/v1/music/jobs/job-fixture/run','/api/v1/music/jobs/job-fixture/run','/api/jobs/job-fixture/run','/api/internal/run','/api/connection']){
    const r=await h.request(path,{method:'POST',headers:h.headers,body:'{}'});assert.ok([404,405].includes(r.status),path);
    assert.ok(!JSON.stringify(await r.json()).includes(marker));
  }
  assert.equal(h.wire.calls.length,0);assert.equal(h.wakes,0);assert.equal(h.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,0);
});
