import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {Agent,fetch as transportFetch} from 'undici';
import {createEngine,EngineError,requestTimeout} from '../server/engine.mjs';

// Endpoint recommendations: docs/api/09-limits-and-timeouts.md:42–52.
// GET jobs and delivery are local operational budgets, not documented timing
// guarantees. 3600s is the API ceiling for unspecified long sync combinations;
// it does not establish support or observed latency for sung variations.
const credentials=async()=>({identityToken:'fixture-identity',apiKey:'fixture-key'});
const baseUrl='https://engine.fixture.invalid';
const response=()=>new Response(JSON.stringify({success:true,status:'queued',job_id:'fixture-job'}));

test('engine timeout policy: documented endpoint and sync music recommendations are selected independently',()=>{
  for(const [path,expected] of [['/health',15000],['/v1/music/capabilities',30000],['/v1/music/originality/fixture-id',15000],['/v1/music/jobs/fixture-id',15000],['/v1/music/delivery-url',30000]])assert.equal(requestTimeout(path),expected,path);
  for(const target_seconds of [15,60])assert.equal(requestTimeout('/v1/music',{vocal:{mode:'instrumental'},duration:{target_seconds},async:false}),180000);
  assert.equal(requestTimeout('/v1/music',{vocal:{mode:'female'},lyrics:{mode:'custom',text:'Fixture words'},async:false}),320000);
  assert.equal(requestTimeout('/v1/music',{vocal:{mode:'instrumental'},output_package:'variations',variation_count:3,async:false}),500000);
  assert.equal(requestTimeout('/v1/music',{vocal:{mode:'female'},output_package:'variations',variation_count:3,async:false}),3600000);
  assert.equal(requestTimeout('/v1/music',{vocal:{mode:'instrumental'},output_package:'variations',variation_count:4,async:false}),3600000);
  assert.equal(requestTimeout('/v1/music',{prompt:'Default instrumental mode'}),180000);
});

test('engine timeout policy: explicit non-generating and async admission modes take precedence over expensive output shape',()=>{
  const long={vocal:{mode:'female'},output_package:'variations',variation_count:4};
  for(const mode of [{dry_run:true},{capabilities:true},{async:true}])assert.equal(requestTimeout('/v1/music',{...long,...mode}),360000);
  assert.equal(requestTimeout('/v1/music',{...long,dry_run:false,capabilities:false,async:false}),3600000);
});

test('engine actual requests use selected defaults and explicit timeout override without changing the saved body',async t=>{
  const original=globalThis.setTimeout,delays=[];
  t.mock.method(globalThis,'setTimeout',(callback,delay,...args)=>{delays.push(delay);return original(callback,delay,...args);});
  const sent=[],make=timeoutMs=>createEngine({baseUrl,credentials,timeoutMs,fetchImpl:async(url,options)=>{sent.push({path:new URL(url).pathname,body:options.body});return response();}});
  const engine=make();t.after(()=>engine.close());await engine.health();await engine.capabilities();await engine.originality('fixture-id');await engine.job('fixture-id');await engine.delivery('gs://fixture-bucket/audio.wav');
  const payload={prompt:'Fixture direction',vocal:{mode:'female'},output_package:'variations',variation_count:3,async:false};await engine.submit(payload);
  assert.deepEqual(delays,[15000,30000,15000,15000,30000,3600000]);assert.deepEqual(JSON.parse(sent.at(-1).body),payload);
  const forced=make(1234);t.after(()=>forced.close());await forced.health();await forced.submit(payload);assert.deepEqual(delays.slice(-2),[1234,1234]);
  assert.equal(sent.filter(x=>x.path==='/v1/music').length,2);
});

test('engine timeout override aborts a non-cooperative transport once and distinguishes music from read-only uncertainty',async()=>{
  for(const [run,uncertain] of [[engine=>engine.submit({prompt:'Fixture music',async:false}),true],[engine=>engine.submit({prompt:'Fixture preview',dry_run:true}),false],[engine=>engine.job('fixture-id'),false]]){
    let calls=0,signal;
    const engine=createEngine({baseUrl,credentials,timeoutMs:10,fetchImpl:async(_,options)=>{calls++;signal=options.signal;return new Promise(()=>{});}});
    await assert.rejects(run(engine),error=>error instanceof EngineError&&error.code==='ENGINE_TIMEOUT'&&error.status===504&&error.uncertain===uncertain);
    assert.equal(calls,1);assert.equal(signal.aborted,true);await engine.close();
  }
});

test('engine deadline includes credential acquisition and a late credential cannot send music after expiration',async()=>{
  let release,calls=0;const auth=new Promise(resolve=>release=resolve);
  const engine=createEngine({baseUrl,credentials:()=>auth,timeoutMs:10,fetchImpl:async()=>{calls++;return response();}});
  await assert.rejects(engine.submit({prompt:'Fixture music'}),error=>error.code==='ENGINE_TIMEOUT'&&error.uncertain===false);
  release(await credentials());await new Promise(resolve=>setImmediate(resolve));assert.equal(calls,0);await engine.close();
  for(const timeoutMs of [0,-1,NaN,Infinity,'10'])assert.throws(()=>createEngine({baseUrl,credentials,timeoutMs}),error=>error.code==='CONFIG_ERROR');
});

async function loopback(t,handle){
  const timers=new Set(),engines=new Set(),dispatchers=new Set(),requests=[];
  const later=(work,ms)=>{const timer=setTimeout(()=>{timers.delete(timer);work();},ms);timers.add(timer);};
  const server=createServer((req,res)=>{requests.push({method:req.method,path:req.url});handle(req,res,later);});
  server.listen(0,'127.0.0.1');await once(server,'listening');const origin='http://127.0.0.1:'+server.address().port;
  t.after(async()=>{
    await Promise.all([...engines].map(engine=>engine.close()));
    for(const agent of dispatchers)assert.equal(agent.destroyed,true,'Engine close must finish its own real connection pool.');
    for(const timer of timers)clearTimeout(timer);
    server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
  });
  function engine(timeoutMs,scenario){
    // Production requires HTTPS. Only this explicit test transport rewrites the
    // origin to an isolated loopback server; the real pinned fetch and production
    // instance's actual dispatcher, signal and complete body handling are used.
    const instance=createEngine({baseUrl,credentials,timeoutMs,fetchImpl:(url,options)=>{
      dispatchers.add(options.dispatcher);return transportFetch(origin+new URL(url).pathname+'?'+scenario,options);
    }});engines.add(instance);return instance;
  }
  return {origin,server,engine,requests,dispatchers};
}

test('real Undici transport: short parser controls fail, while the engine keeps delayed headers and body inside its total deadline',async t=>{
  const f=await loopback(t,(req,res,later)=>{
    if(req.url.includes('headers'))later(()=>res.end('{"success":true,"dry_run":true}'),1700);
    else{res.setHeader('content-type','application/json');res.write('{"success":true,');later(()=>res.end('"dry_run":true}'),1700);}
  });
  // Negative controls prove this actual transport is sensitive to parser
  // deadlines. The installed parser uses coarse fast timers even for these
  // short values, so delayed responses exceed their actual timer resolution.
  // This avoids waiting the production 300 seconds without faking the clock.
  const short=new Agent({headersTimeout:20,bodyTimeout:20,allowH2:false});
  try{
    await assert.rejects(transportFetch(f.origin+'/?headers',{dispatcher:short}),error=>error.cause?.code==='UND_ERR_HEADERS_TIMEOUT');
    const body=await transportFetch(f.origin+'/?body',{dispatcher:short});
    await assert.rejects(body.text(),error=>error.cause?.code==='UND_ERR_BODY_TIMEOUT');
  }finally{await short.close();}
  for(const scenario of ['headers','body']){
    const engine=f.engine(4000,scenario);assert.deepEqual(await engine.submit({prompt:'Explicit local preview fixture',dry_run:true}),{success:true,dry_run:true});
    await engine.close();
  }
  assert.equal(f.requests.filter(x=>x.method==='POST').length,2);assert.equal(f.dispatchers.size,2);
});

test('real Undici transport: the total deadline aborts hung headers and body without any music retry or leaked pool',async t=>{
  const f=await loopback(t,(req,res)=>{if(req.url.includes('body')){res.setHeader('content-type','application/json');res.write('{"success":');}});
  for(const scenario of ['headers','body']){
    // Leave enough connection-establishment time when this file runs beside
    // the full suite's CPU/media workers; the server still never completes its
    // response, so the deadline and exactly-one-request assertions stay real.
    const engine=f.engine(1000,scenario),before=f.requests.length;
    await assert.rejects(engine.submit({prompt:'Explicit local request fixture',async:false}),error=>error.code==='ENGINE_TIMEOUT'&&error.uncertain===true);
    assert.equal(f.requests.length,before+1);await engine.close();
  }
  // The client pool destroys its sockets synchronously in engine.close(); the SERVER learns of each FIN on a later
  // event-loop turn (measured 2026-09-15: immediate on Windows, one tick later on Amazon Linux 2023 / kernel 6.18).
  // Wait, bounded, for the server's count to settle, then assert the real property: nothing stays open.
  const connections=await settledConnections(f.server,2000);
  assert.equal(connections,0,'Aborted real sockets must close with the owned engine pool.');
});

/** Polls server.getConnections until it reaches zero or the deadline passes; returns the last count. */
async function settledConnections(server,deadlineMs){
  const started=Date.now();let count;
  do{count=await new Promise((resolve,reject)=>server.getConnections((error,n)=>error?reject(error):resolve(n)));if(count===0)break;await new Promise(r=>setTimeout(r,10));}while(Date.now()-started<deadlineMs);
  return count;
}

test('real Undici transport: instance close drains an accepted response, refuses new requests and is idempotent',async t=>{
  let release,arrived;const started=new Promise(resolve=>arrived=resolve);
  const f=await loopback(t,(_req,res)=>{release=()=>res.end('{"success":true}');arrived();});
  const engine=f.engine(4000,'drain'),pending=engine.submit({prompt:'Explicit local request fixture',async:false});await started;
  let closed=false;const closing=engine.close();closing.then(()=>closed=true);
  assert.equal(engine.close(),closing);await assert.rejects(engine.health(),error=>error.code==='ENGINE_CLOSED'&&error.status===503&&error.uncertain===false);
  await new Promise(resolve=>setImmediate(resolve));assert.equal(closed,false);assert.equal(f.requests.length,1);
  release();assert.deepEqual(await pending,{success:true});await closing;assert.equal(closed,true);
  assert.equal([...f.dispatchers][0].destroyed,true);
});
