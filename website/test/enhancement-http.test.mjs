import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,basename,sep} from 'node:path';
import {once} from 'node:events';
import {Store} from '../server/store.mjs';
import {createEngine} from '../server/engine.mjs';
import {createApplication} from '../server/http.mjs';

// Real HTTP routes, engine adapter, SQLite and enhancement worker. Only the
// upstream transport is an explicit fixture; no cloud, real credentials, or
// music generation is used. Files belong to an isolated temporary test folder.
const capabilities=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json',import.meta.url),'utf8'));
const privateMarker='SYNTHETIC_PRIVATE_ENHANCE_FIXTURE';
const payload={prompt:'Türkçe müzik — 星空\nA hopeful new morning.',genres:['electronic'],moods:['peaceful'],instruments:['synthesizer'],eras:['era_1980s'],
  vocal:{mode:'female',language:'en'},duration:{target_seconds:30,tolerance_seconds:2,on_miss:'trim'},async:true,prompt_enhance:{enabled:false,style:'cinematic'}};
const enhanced='A hopeful melody rises gently, carried by warm strings and a luminous piano theme. 🎵';
const rewrite=()=>({success:true,dry_run:true,prompt_sent:privateMarker,auth:{token:privateMarker},
  debug:{url:'https://private.fixture.invalid/'+privateMarker},prompt_enhance:{state:'REWRITTEN',binding:'compiled_from_rewrite',
    style:'cinematic',model:privateMarker,rewritten_prompt:enhanced,reason:privateMarker,
    checks:{non_empty:true,within_cap:true,controlled_terms_preserved:true}}});
const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
const tick=()=>new Promise(resolve=>setImmediate(resolve));

async function fixture(t,submit=async()=>response(rewrite())){
  const folder=await mkdtemp(join(tmpdir(),'pmp-enhance-http-'));
  const publicRoot=join(folder,'public'),stateRoot=join(folder,'private');await mkdir(publicRoot);await mkdir(stateRoot);
  const store=new Store(':memory:'),calls=[];let musicWakes=0;
  const engine=createEngine({baseUrl:'https://engine.fixture.invalid',credentials:async()=>({identityToken:privateMarker,apiKey:privateMarker}),
    fetchImpl:async(url,options)=>{
      const path=new URL(url).pathname;calls.push({path,options});
      if(path==='/v1/music/capabilities')return response(capabilities);
      if(path==='/v1/music')return submit(JSON.parse(options.body));
      assert.fail('Unexpected upstream fixture endpoint: '+path);
    }});
  const config={origin:'http://127.0.0.1:1',publicRoot,stateRoot,production:false,oidc:null,ads:{enabled:false},
    consent:{enabled:false},dailyAdmissionLimit:100,guestDailyLimit:100,ipDailyLimit:100,webhookUrl:null};
  const app=createApplication({config,store,engine,media:{},jobs:{wake(){musicWakes++;}}});
  app.server.listen(0,'127.0.0.1');await once(app.server,'listening');config.origin='http://127.0.0.1:'+app.server.address().port;
  t.after(async()=>{
    app.enhancements.stop();
    const deadline=Date.now()+2000;while(app.running&&Date.now()<deadline)await tick();
    assert.equal(app.running,false,'Fixture must drain its actual worker before closing SQLite.');
    app.server.closeAllConnections();await new Promise(resolve=>app.server.close(resolve));store.close();
    const target=resolve(folder);assert.ok(target.startsWith(resolve(tmpdir())+sep)&&basename(target).startsWith('pmp-enhance-http-'));
    await rm(target,{recursive:true,force:true});
  });
  const request=(path,options)=>fetch(config.origin+path,options);
  async function session(){
    const reply=await request('/api/session'),body=await reply.json();assert.equal(reply.status,200);
    return {cookie:reply.headers.get('set-cookie').split(';')[0],origin:config.origin,'x-csrf-token':body.csrf,
      'content-type':'application/json','idempotency-key':'enhance-http-request'};
  }
  const headers=await session();
  const post=(body=payload,extra={})=>request('/api/enhancements',{method:'POST',headers:{...headers,...extra},body:JSON.stringify(body)});
  async function terminal(id){
    const deadline=Date.now()+2000;
    while(Date.now()<deadline){
      const r=await request('/api/enhancements/'+id,{headers:{cookie:headers.cookie}});assert.equal(r.status,200);
      const {operation}=await r.json();if(['complete','failed','uncertain'].includes(operation.status))return operation;
      await tick();
    }
    assert.fail('Fixture enhancement did not reach an observed terminal state.');
  }
  return {app,store,calls,request,session,headers,post,terminal,get musicWakes(){return musicWakes;}};
}

test('enhancement HTTP: 202 is a durable queued receipt; explicit lifecycle produces the real projected async result',async t=>{
  let release,entered;const arrived=new Promise(resolve=>entered=resolve),gate=new Promise(resolve=>release=resolve);
  const f=await fixture(t,async body=>{entered(body);await gate;return response(rewrite());});
  const admitted=await f.post(),body=await admitted.json();assert.equal(admitted.status,202);assert.equal(admitted.headers.get('cache-control'),'no-store');
  assert.deepEqual(Object.keys(body),['operation']);assert.equal(body.operation.status,'queued');assert.equal(body.operation.kind,'enhance');
  assert.equal(body.operation.idempotencyKey,f.headers['idempotency-key']);assert.deepEqual(body.operation.request,payload);
  assert.equal(f.store.db.prepare('SELECT status FROM enhancement_jobs WHERE id=?').get(body.operation.id).status,'queued');
  assert.equal(f.calls.filter(x=>x.path==='/v1/music').length,0,'HTTP wake must not dispatch a stopped worker.');
  const running=f.app.enhancements.start();
  try{
    const sent=await arrived;assert.equal(sent.dry_run,true);assert.equal(sent.capabilities,false);assert.equal(sent.prompt_enhance.enabled,true);
    assert.equal(sent.prompt_enhance.style,'cinematic');assert.ok(sent.prompt.startsWith(payload.prompt+'\n'));assert.equal(f.app.running,true);
    for(const term of ['electronic','peaceful','synthesizer','1980s','female','english','30 seconds'])assert.ok(sent.prompt.toLowerCase().includes(term),term);
    assert.deepEqual(body.operation.dispatchRequest,sent,'The HTTP popup receives the exact saved body that actually reached the engine.');
    const status=await f.request('/api/enhancements/'+body.operation.id,{headers:{cookie:f.headers.cookie}});
    assert.equal((await status.json()).operation.status,'running');
  }finally{release();await running;}
  const out=await f.terminal(body.operation.id);assert.deepEqual(out.result,{original:payload.prompt,enhanced,changed:true,state:'REWRITTEN'});
  assert.ok(!JSON.stringify(out).includes(privateMarker));assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,0);
  assert.equal(f.musicWakes,0);assert.equal(f.calls.filter(x=>x.path==='/v1/music').length,1);
});

test('enhancement HTTP: owner list/get remain isolated and missing sessions cannot retrieve another draft',async t=>{
  const f=await fixture(t),alice=(await(await f.post()).json()).operation,bob=await f.session();
  const bobPost=await f.request('/api/enhancements',{method:'POST',headers:bob,body:JSON.stringify({...payload,prompt:'Bob draft'})});
  assert.equal(bobPost.status,202);const own=(await bobPost.json()).operation;assert.notEqual(own.id,alice.id);
  const other=await f.request('/api/enhancements/'+alice.id,{headers:{cookie:bob.cookie}});assert.equal(other.status,404);
  const listed=await f.request('/api/enhancements',{headers:{cookie:bob.cookie}});assert.equal(listed.status,200);
  const list=await listed.json();assert.deepEqual(list.operations.map(x=>x.id),[own.id]);assert.equal(list.operations[0].request.prompt,'Bob draft');
  for(const path of ['/api/enhancements','/api/enhancements/'+alice.id])assert.equal((await f.request(path)).status,401);
  assert.equal(f.calls.filter(x=>x.path==='/v1/music').length,0);
});

test('enhancement HTTP: absent or mismatched CSRF/origin is rejected before admission and quota',async t=>{
  const f=await fixture(t);
  for(const overrides of [{'x-csrf-token':''},{'x-csrf-token':'wrong-fixture-token'},{origin:'https://other.fixture.invalid'}]){
    const reply=await f.post(payload,overrides),body=await reply.json();assert.equal(reply.status,403);assert.equal(body.error.code,'CSRF_REJECTED');
  }
  const noSession=await f.request('/api/enhancements',{method:'POST',headers:{'content-type':'application/json',origin:f.headers.origin},body:JSON.stringify(payload)});
  assert.equal(noSession.status,401);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM enhancement_jobs').get().n,0);
  assert.equal(f.store.db.prepare("SELECT count(*) AS n FROM counters WHERE key LIKE 'generation:global:%'").get().n,0);assert.equal(f.calls.length,0);
});

test('enhancement HTTP: repeated body/key returns one operation and one quota; changed body conflicts, completed replay does not POST',async t=>{
  const f=await fixture(t),a=await f.post(),first=(await a.json()).operation;
  const duplicate=await f.post(),second=(await duplicate.json()).operation;assert.equal(duplicate.status,202);assert.equal(second.id,first.id);
  const conflict=await f.post({...payload,prompt:'Changed meaning'});assert.equal(conflict.status,409);assert.equal((await conflict.json()).error.code,'IDEMPOTENCY_CONFLICT');
  assert.equal(f.store.db.prepare("SELECT count FROM counters WHERE key LIKE 'generation:global:%'").get().count,1);
  await f.app.enhancements.start();const done=await f.terminal(first.id);assert.equal(done.status,'complete');
  const replay=await f.post();assert.equal(replay.status,202);assert.equal((await replay.json()).operation.status,'complete');
  assert.equal(f.calls.filter(x=>x.path==='/v1/music').length,1);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,0);
});

test('enhancement HTTP: schema, request ID, and malformed JSON errors do not create an operation or consume generation quota',async t=>{
  const f=await fixture(t);
  for(const value of [{prompt:''},{prompt:'Valid prompt',seed:-1},{prompt:'Valid prompt',unknown_fixture_field:true}]){
    const reply=await f.post(value);assert.equal(reply.status,400);assert.equal((await reply.json()).error.code,'INVALID_REQUEST');
  }
  const noId=await f.post(payload,{'idempotency-key':''});assert.equal(noId.status,400);assert.equal((await noId.json()).error.code,'IDEMPOTENCY_REQUIRED');
  const broken=await f.request('/api/enhancements',{method:'POST',headers:f.headers,body:'{"prompt":'});assert.equal(broken.status,400);assert.equal((await broken.json()).error.code,'INVALID_JSON');
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM enhancement_jobs').get().n,0);
  assert.equal(f.store.db.prepare("SELECT count(*) AS n FROM counters WHERE key LIKE 'generation:global:%'").get().n,0);
  assert.equal(f.calls.filter(x=>x.path==='/v1/music').length,0);
});

test('enhancement HTTP: worker refusal is terminal and safely named while exact upstream error stays private',async t=>{
  const raw={success:false,error_code:'INVALID_REQUEST',error:privateMarker,refused:['seed: < min 0 '+privateMarker],auth:{api_key:privateMarker}};
  const f=await fixture(t,async()=>response(raw,422));await f.app.enhancements.start();
  const receipt=await f.post();assert.equal(receipt.status,202);const id=(await receipt.json()).operation.id,out=await f.terminal(id);
  assert.equal(out.status,'failed');assert.equal(out.error.fields[0].path,'seed');assert.ok(!('result' in out));
  assert.equal(out.request.prompt,payload.prompt);assert.ok(!JSON.stringify(out).includes(privateMarker));
  assert.deepEqual(JSON.parse(f.store.db.prepare('SELECT response FROM enhancement_jobs WHERE id=?').get(id).response),raw);
  const replay=await f.post();assert.equal(replay.status,202);assert.equal((await replay.json()).operation.status,'failed');
  assert.equal(f.calls.filter(x=>x.path==='/v1/music').length,1);assert.equal(f.musicWakes,0);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,0);
});
