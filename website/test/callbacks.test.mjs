import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign,randomUUID} from 'node:crypto';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,sep,basename} from 'node:path';
import {once} from 'node:events';
import {request as httpRequest} from 'node:http';
import {Readable} from 'node:stream';
import {OAuth2Client} from 'google-auth-library';
import {Store} from '../server/store.mjs';
import {createApplication} from '../server/http.mjs';
import {createJobs} from '../server/jobs.mjs';
import {createCallbacks,createCallbackVerifier,callbackDestination,CALLBACK_EMAIL,CALLBACK_PATH} from '../server/callbacks.mjs';

// Cryptographically signed LOCAL fixtures exercise the installed Google SDK's
// actual verifyIdToken path. Only its certificate retrieval returns a fixture
// public key: these are not real Google credentials or a live push proof.
const keys=generateKeyPairSync('rsa',{modulusLength:2048});
const audience='https://music.fixture.invalid'+CALLBACK_PATH;
function signed(overrides={},key=keys.privateKey){
  const seconds=Math.floor(Date.now()/1000);
  const payload={iss:'https://accounts.google.com',aud:audience,sub:'123456789012345678901',email:CALLBACK_EMAIL,email_verified:true,iat:seconds,exp:seconds+3600,...overrides};
  const head=Buffer.from(JSON.stringify({alg:'RS256',kid:'local-fixture'})).toString('base64url');
  const body=Buffer.from(JSON.stringify(payload)).toString('base64url');
  return head+'.'+body+'.'+sign('RSA-SHA256',Buffer.from(head+'.'+body),key).toString('base64url');
}
function verifier(){
  const client=new OAuth2Client();let checks=0;
  client.getFederatedSignonCertsAsync=async()=>({certs:{'local-fixture':keys.publicKey.export({type:'spki',format:'pem'})}});
  const actual=client.verifyIdToken.bind(client);client.verifyIdToken=options=>{checks++;return actual(options);};
  return {verify:createCallbackVerifier({client}),get checks(){return checks;}};
}
async function fixture(t,{enabled=true,external=false,production=false}={}){
  const folder=await mkdtemp(join(tmpdir(),'pmp-callback-'));
  const publicRoot=join(folder,'public'),stateRoot=join(folder,'private');await mkdir(publicRoot);await mkdir(stateRoot);
  const store=new Store(join(stateRoot,'fixture.sqlite')),verification=verifier(),notified=[];
  const config={origin:'https://music.fixture.invalid',publicRoot,stateRoot,production,proxySecret:'fixture-proxy-secret-32-characters-minimum',oidc:null,ads:{enabled:false},consent:{enabled:false},
    webhookUrl:enabled?(external?'https://external.fixture.invalid/notification':audience):null};
  const jobs={wake(){assert.fail('Callback must not use a general generation wake.');},notifyCompletion(value){notified.push(value);return true;}};
  const engine={capabilities:async()=>({parameters:[]}),submit(){assert.fail('Callback must never submit music.');}};
  const app=createApplication({config,store,jobs,engine,media:{},callbackVerifier:verification.verify});
  app.server.listen(0,'127.0.0.1');await once(app.server,'listening');
  const base='http://127.0.0.1:'+app.server.address().port;
  t.after(async()=>{app.enhancements.stop();app.server.closeAllConnections();await new Promise(done=>app.server.close(done));store.close();
    const target=resolve(folder);assert.ok(target.startsWith(resolve(tmpdir())+sep)&&basename(target).startsWith('pmp-callback-'));await rm(target,{recursive:true,force:true});});
  function seed({remember=true,result=true,url=config.webhookUrl}={}){
    const requestId=randomUUID(),upstreamId='job-'+requestId;
    const j=store.admit({owner:'guest:'+randomUUID(),ipKey:randomUUID(),idem:randomUUID(),payload:{prompt:'A local fixture only',async:true,webhook_url:url},limits:{daily:100,owner:100,ip:100}}).job;
    store.updateJob(j.id,{status:'pending',upstreamId,result:result?{success:true,status:'queued',job_id:upstreamId,request_id:requestId,auth:{account_id:'website'}}:{success:true,status:'processing'}});
    const job=store.job(j.id);if(remember)app.callbacks.rememberAdmission(job);
    const body={success:true,request_id:requestId,job:{job_id:upstreamId,mode:'async',attempt:1},auth:{account_id:'website'},tracks:[],private_text:'PRIVATE_FIXTURE_DO_NOT_PERSIST'};
    return {job,requestId,upstreamId,body};
  }
  const request=(path,options={})=>new Promise((resolve,reject)=>{
    const body=options.body;
    const req=httpRequest(base+path,{method:options.method??'GET',headers:{host:'music.fixture.invalid',...(body!==undefined?{'content-length':Buffer.byteLength(body)}:{}),...options.headers}},res=>{
      const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('error',reject);res.on('end',()=>{
        const text=Buffer.concat(chunks).toString('utf8');resolve({status:res.statusCode,headers:new Headers(res.headers),json:async()=>JSON.parse(text)});
      });
    });req.on('error',reject);req.end(body);
  });
  const post=(body,options={})=>request(CALLBACK_PATH,{method:'POST',...options,headers:{authorization:'Bearer '+signed(),'content-type':'application/json','x-playmusicprompts-request-id':body.request_id,...options.headers},body:options.body??JSON.stringify(body)});
  return {store,app,config,jobs,verification,notified,seed,request,post};
}

test('receiver configuration requires the exact own-origin HTTPS route',()=>{
  assert.equal(callbackDestination({origin:'https://music.fixture.invalid',webhookUrl:audience}),audience);
  for(const webhookUrl of [null,'https://external.fixture.invalid/notification',audience+'?token=x',audience+'/',audience.replace('https:','http:')])assert.equal(callbackDestination({origin:'https://music.fixture.invalid',webhookUrl}),null);
  assert.equal(callbackDestination({origin:'http://127.0.0.1:4177',webhookUrl:'http://127.0.0.1:4177'+CALLBACK_PATH}),null);
});
test('real Google SDK signature verification is narrowed to exact service claims',async()=>{
  const v=verifier();assert.equal(await v.verify('Bearer '+signed(),audience),true);
  const otherKey=generateKeyPairSync('rsa',{modulusLength:2048}).privateKey;
  await assert.rejects(v.verify('Bearer '+signed({},otherKey),audience),e=>e.code==='CALLBACK_UNAUTHENTICATED');
  for(const change of [{iss:'accounts.google.com'},{iss:'https://foreign.invalid'},{aud:'https://other.invalid'},{email:'foreign@example.test'},{email_verified:false},{email_verified:'true'},{sub:''},{exp:Math.floor(Date.now()/1000)-1},{iat:Math.floor(Date.now()/1000)+301}])
    await assert.rejects(v.verify('Bearer '+signed(change),audience),e=>e.status===401);
  for(const authorization of [undefined,'Bearer malformed','Bearer a.b.c\r\n','Basic '+signed(),'Bearer '+'a'.repeat(13000)+'.b.c'])await assert.rejects(v.verify(authorization,audience),e=>e.status===401);
  assert.equal(v.checks,11);
});
test('authenticated actual HTTP push bypasses only browser CSRF and records a minimal durable notification',async t=>{
  const f=await fixture(t),s=f.seed();
  const r=await f.post(s.body);assert.equal(r.status,202);assert.deepEqual(await r.json(),{accepted:true,duplicate:false});
  assert.equal(r.headers.get('set-cookie'),null);assert.equal(r.headers.get('cache-control'),'no-store');
  assert.deepEqual(f.notified,[{jobId:s.job.id,upstreamId:s.upstreamId,requestId:s.requestId}]);
  assert.equal(f.store.job(s.job.id).status,'pending','The callback does not trust its body as a generation result.');
  const receipt=f.store.db.prepare('SELECT * FROM completion_callback_receipts').get();assert.ok(receipt.notified);assert.ok(!JSON.stringify(receipt).includes('PRIVATE_FIXTURE'));
  assert.equal(f.store.db.prepare('SELECT count(*) n FROM jobs').get().n,1);
  const ordinary=await f.request('/api/jobs',{method:'POST',headers:{authorization:'Bearer '+signed(),'content-type':'application/json'},body:'{}'});assert.equal(ordinary.status,401);
});
test('missing, forged and foreign-token actual HTTP calls never record or schedule',async t=>{
  const f=await fixture(t),s=f.seed();
  for(const authorization of ['', 'Bearer '+signed({email:'other-runtime@example.test'}),'Bearer a.b.c'])assert.equal((await f.post(s.body,{headers:{authorization}})).status,401);
  assert.equal(f.notified.length,0);assert.equal(f.store.db.prepare('SELECT count(*) n FROM completion_callback_receipts').get().n,0);
});
test('unknown tenant/job, changed admission and mismatched identifiers are refused',async t=>{
  const f=await fixture(t),s=f.seed();
  const cases=[{...s.body,auth:{account_id:'another-tenant'}},{...s.body,job:{...s.body.job,job_id:'job-'+randomUUID()}},{...s.body,request_id:randomUUID()}];
  for(const body of cases)assert.equal((await f.post(body)).status,404);
  assert.equal((await f.post(s.body,{headers:{'x-playmusicprompts-request-id':randomUUID()}})).status,400);
  assert.equal((await f.post({...s.body,job:{...s.body.job,mode:'sync'}})).status,400);
  assert.equal((await f.post({...s.body,request_id:{toString:null}},{headers:{'x-playmusicprompts-request-id':s.requestId}})).status,400);
  f.store.db.prepare('UPDATE jobs SET upstream_id=? WHERE id=?').run('job-'+randomUUID(),s.job.id);
  assert.equal((await f.post(s.body)).status,404);assert.equal(f.notified.length,0);
});
test('duplicate callbacks are idempotent and conflicting outcomes do not replace a receipt',async t=>{
  const f=await fixture(t),s=f.seed();assert.equal((await f.post(s.body)).status,202);
  const duplicate=await f.post({...s.body,private_text:'DIFFERENT_IRRELEVANT_DETAIL'});assert.equal(duplicate.status,202);assert.equal((await duplicate.json()).duplicate,true);
  assert.equal((await f.post({...s.body,success:false})).status,409);assert.equal(f.notified.length,1);
  assert.equal(f.store.db.prepare('SELECT count(*) n FROM completion_callback_receipts').get().n,1);
});
test('malformed, oversized and compressed HTTP input is refused before admission',async t=>{
  const f=await fixture(t),s=f.seed();
  assert.equal((await f.post(s.body,{body:'{'})).status,400);
  assert.equal((await f.post(s.body,{body:Buffer.from([123,34,97,34,58,34,255,34,125])})).status,400);
  assert.equal((await f.post(s.body,{headers:{'content-type':'text/plain'}})).status,415);
  assert.equal((await f.post(s.body,{headers:{'content-encoding':'gzip'}})).status,415);
  assert.equal((await f.post(s.body,{body:'{}',headers:{'content-length':8*1024*1024+1}})).status,413);
  assert.equal(f.notified.length,0);
});
test('production callback still requires the authenticated reverse proxy',async t=>{
  const f=await fixture(t,{production:true}),s=f.seed();
  assert.equal((await f.post(s.body)).status,403);
  assert.equal((await f.post(s.body,{headers:{'x-pmp-proxy-secret':f.config.proxySecret,'x-pmp-client-ip':'192.0.2.1'}})).status,202);
});
test('disabled and external webhook destinations never open a website receiver',async t=>{
  for(const options of [{enabled:false},{external:true}]){
    const f=await fixture(t,options),s=f.seed();assert.equal((await f.post(s.body)).status,404);assert.equal(f.verification.checks,0);
  }
});
test('query, non-POST and cross-site requests cannot broaden the callback route',async t=>{
  const f=await fixture(t),s=f.seed();
  assert.equal((await f.request(CALLBACK_PATH+'?extra=1')).status,404);
  assert.equal((await f.request(CALLBACK_PATH)).status,405);
  assert.equal((await f.post(s.body,{headers:{'sec-fetch-site':'cross-site'}})).status,403);
  assert.equal(f.notified.length,0);
});
test('saved admission bindings survive status envelopes and receiver restart',async t=>{
  const f=await fixture(t),s=f.seed();f.store.updateJob(s.job.id,{result:{success:true,status:'processing'}});
  const restarted=createCallbacks({config:f.config,store:f.store,jobs:f.jobs,verify:f.verification.verify});
  assert.equal(restarted.enabled,true);assert.equal((await f.post(s.body)).status,202);
  const r=f.store.db.prepare('SELECT * FROM completion_callback_receipts').get();assert.equal(r.request_id,s.requestId);
});
test('only retained real admission metadata is backfilled; missing or foreign URLs remain unbound',async t=>{
  const f=await fixture(t),known=f.seed({remember:false}),missing=f.seed({remember:false,result:false}),foreign=f.seed({remember:false,url:'https://elsewhere.fixture.invalid/notify'});
  createCallbacks({config:f.config,store:f.store,jobs:f.jobs,verify:f.verification.verify});
  assert.equal((await f.post(known.body)).status,202);assert.equal((await f.post(missing.body)).status,404);assert.equal((await f.post(foreign.body)).status,404);
});
test('durable receipt can resume the GET notification after a process interruption',async t=>{
  const f=await fixture(t),s=f.seed();let fail=true;
  f.jobs.notifyCompletion=value=>{if(fail)throw Error('Explicit local crash fixture');f.notified.push(value);return true;};
  assert.equal((await f.post(s.body)).status,500);
  assert.equal(f.store.db.prepare('SELECT notified FROM completion_callback_receipts').get().notified,null);
  fail=false;const restarted=createCallbacks({config:f.config,store:f.store,jobs:f.jobs,verify:f.verification.verify});restarted.resume();restarted.resume();
  assert.equal(f.notified.length,1);assert.ok(f.store.db.prepare('SELECT notified FROM completion_callback_receipts').get().notified);
  assert.equal((await f.post(s.body)).status,202);assert.equal(f.notified.length,1);
});
test('chunked input is bounded by actual bytes, and aborted bodies never become notifications',async t=>{
  const f=await fixture(t),s=f.seed();
  const receiver=createCallbacks({config:f.config,store:f.store,jobs:f.jobs,verify:async()=>true});
  const req=Readable.from([Buffer.alloc(8*1024*1024,32),Buffer.from('x')]);req.headers={'content-type':'application/json','x-playmusicprompts-request-id':s.requestId};
  await assert.rejects(receiver.receive(req),e=>e.status===413);req.destroy();
  const aborted=Readable.from([]);aborted.headers={'content-type':'application/json'};aborted.destroy();
  await assert.rejects(receiver.receive(aborted),e=>e.code==='CALLBACK_BODY_INCOMPLETE');
  assert.equal(receiver.running,false);assert.equal(f.notified.length,0);
});
test('callback authentication concurrency is bounded and concurrent duplicates schedule once',async t=>{
  const f=await fixture(t),s=f.seed();let release;
  const gate=new Promise(resolve=>release=resolve),receiver=createCallbacks({config:f.config,store:f.store,jobs:f.jobs,verify:()=>gate});
  const request=()=>{const r=Readable.from([Buffer.from(JSON.stringify(s.body))]);r.headers={'content-type':'application/json','x-playmusicprompts-request-id':s.requestId};return r;};
  const requests=Array.from({length:8},request),pending=requests.map(req=>receiver.receive(req));
  assert.equal(receiver.running,true);const ninth=request();await assert.rejects(receiver.receive(ninth),e=>e.code==='CALLBACK_BUSY');ninth.destroy();
  release(true);const accepted=await Promise.all(pending);assert.equal(accepted.filter(value=>!value.duplicate).length,1);assert.equal(f.notified.length,1);assert.equal(receiver.running,false);
});
test('real job worker consumes callback notification as a GET status check without any submission',async t=>{
  const f=await fixture(t),s=f.seed();let gets=0,submits=0;
  f.store.updateJob(s.job.id,{status:'uncertain',error:{code:'STATUS_UNAVAILABLE'}});
  const worker=createJobs({store:f.store,engine:{async job(id){gets++;assert.equal(id,s.upstreamId);return {success:true,status:'processing'};},submit(){submits++;assert.fail('A callback must never submit generation.');}},media:{}});
  f.jobs.notifyCompletion=worker.notifyCompletion;
  try{
    assert.equal((await f.post(s.body)).status,202);
    const deadline=Date.now()+2000;while(worker.running&&Date.now()<deadline)await new Promise(resolve=>setImmediate(resolve));
    assert.equal(worker.running,false);assert.equal(gets,1);assert.equal(submits,0);assert.equal(f.store.job(s.job.id).status,'pending');
    assert.equal((await f.post(s.body)).status,202);assert.equal(gets,1);assert.equal(submits,0);
  }finally{worker.stop();}
});
test('certificate verification has a bounded deadline even if its instrument stalls',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const verify=createCallbackVerifier({client:{verifyIdToken:()=>new Promise(()=>{})}});
  const result=assert.rejects(verify('Bearer '+signed(),audience),e=>e.code==='CALLBACK_UNAUTHENTICATED');
  t.mock.timers.tick(8001);await result;
});
test('an authenticated but stalled body has a bounded read deadline',async t=>{
  const f=await fixture(t);t.mock.timers.enable({apis:['setTimeout']});
  const receiver=createCallbacks({config:f.config,store:f.store,jobs:f.jobs,verify:async()=>true});
  const req=new Readable({read(){}});req.headers={'content-type':'application/json'};
  const result=assert.rejects(receiver.receive(req),e=>e.code==='CALLBACK_BODY_TIMEOUT');
  await Promise.resolve();t.mock.timers.tick(10001);await result;req.destroy();
  assert.equal(receiver.running,false);assert.equal(f.notified.length,0);
});
