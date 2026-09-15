import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,basename,sep} from 'node:path';
import {Store} from '../server/store.mjs';
import {EngineError} from '../server/engine.mjs';
import {createEnhancements} from '../server/enhancements.mjs';

// Real SQLite + real worker/validator. All upstream responses are explicit test
// fixtures; no HTTP, credentials, music, or live enhancement is called here.
const caps=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json',import.meta.url),'utf8'));
const audit=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/parameter-gap-audit.json',import.meta.url),'utf8'));
const input={prompt:'Make a music of happiness',async:true,prompt_enhance:{enabled:false,style:'cinematic'}};
const request=(payload=input,extra={})=>({owner:'enhance-owner',ipKey:'enhance-ip',idem:'enhance-request-one',payload:structuredClone(payload),...extra});
const rewritten=(text='A bright musical idea with a warm melodic theme.')=>({success:true,dry_run:true,
  prompt_sent:'PRIVATE_FULLY_COMPILED_PROMPT',auth:{token:'PRIVATE_AUTH'},route:{url:'PRIVATE_ROUTE_URL'},
  prompt_enhance:{state:'REWRITTEN',binding:'compiled_from_rewrite',rewritten_prompt:text,reason:'PRIVATE_REASON',
    checks:{non_empty:true,within_cap:true,controlled_terms_preserved:true}}});
function fixture(t,submit=async()=>rewritten(),overrides={}){
  const store=new Store(':memory:');let capCalls=0;
  const worker=createEnhancements({store,engine:{submit},capabilities:async()=>{capCalls++;return caps;},config:{dailyAdmissionLimit:100,...overrides},onError(){}});
  t.after(()=>{worker.stop();store.close();});return {store,worker,get capCalls(){return capCalls;}};
}

test('enhance: admission is durable and queued before any submission; all100 fields reach inert rewrite mode',async t=>{
  let calls=0,sent;const f=fixture(t,async body=>{calls++;sent=structuredClone(body);return rewritten();});
  const full=structuredClone(audit.dry_run_candidate.payload),op=await f.worker.admit(request(full));
  assert.equal(op.status,'queued');assert.equal(op.kind,'enhance');assert.equal(calls,0);assert.deepEqual(op.request,full);
  assert.equal(op.idempotencyKey,'enhance-request-one');
  const row=f.store.db.prepare('SELECT * FROM enhancement_jobs WHERE id=?').get(op.id);assert.equal(row.status,'queued');
  await f.worker.start();
  assert.equal(calls,1);assert.equal(Object.keys(sent).length,100);
  assert.ok(sent.prompt.startsWith(full.prompt+'\n\nKeep these choices and their exact names'));
  assert.deepEqual({...sent,prompt:full.prompt},{...full,dry_run:true,capabilities:false,prompt_enhance:{...full.prompt_enhance,enabled:true}});
  assert.deepEqual(op.dispatchRequest,sent);assert.ok(Array.from(sent.prompt).length<=5000);
  assert.equal(sent.async,full.async);assert.equal(sent.webhook_url,full.webhook_url);
  const complete=f.worker.get(op.id,'enhance-owner');assert.equal(complete.status,'complete');
  assert.equal(complete.result.original,full.prompt);assert.equal(complete.result.enhanced,rewritten().prompt_enhance.rewritten_prompt);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,0);
  assert.ok(!JSON.stringify(complete).includes('PRIVATE_'));
  assert.deepEqual(JSON.parse(f.store.db.prepare('SELECT response FROM enhancement_jobs WHERE id=?').get(op.id).response),rewritten());
});

test('enhance: default descriptive style is an explicit operation choice and owner input remains intact',async t=>{
  let sent;const f=fixture(t,async body=>{sent=body;return rewritten();});
  const original={prompt:'A quiet idea',dry_run:false,capabilities:true,async:false,webhook_url:'https://callback.fixture.invalid/inert'};
  const op=await f.worker.admit(request(original));assert.deepEqual(op.request,original);await f.worker.start();
  assert.equal(sent.dry_run,true);assert.equal(sent.capabilities,false);assert.equal(sent.async,false);
  assert.deepEqual(sent.prompt_enhance,{enabled:true,style:'descriptive'});
  assert.equal(sent.webhook_url,original.webhook_url);
});

test('enhance: duplicate/concurrent admission and repeated wake consumes one request; changed body conflicts',async t=>{
  let release,calls=0;const f=fixture(t,async()=>{calls++;return await new Promise(resolve=>{release=resolve;});});
  const [one,two]=await Promise.all([f.worker.admit(request()),f.worker.admit(request())]);assert.equal(one.id,two.id);
  assert.equal(f.store.db.prepare("SELECT count FROM counters WHERE key LIKE 'generation:global:%'").get().count,1);
  const running=f.worker.start();await Promise.resolve();assert.equal(calls,1);assert.equal(f.worker.running,true);
  await f.worker.wake();assert.equal(calls,1);release(rewritten());await running;
  const previousCapCalls=f.capCalls,again=await f.worker.admit(request());
  assert.equal(again.status,'complete');assert.equal(f.capCalls,previousCapCalls,'Durable replay must work without another capability fetch.');
  await assert.rejects(f.worker.admit(request({...input,prompt:'Different intent'})),{code:'IDEMPOTENCY_CONFLICT'});
  assert.equal(calls,1);
});

test('enhance: get/list/idempotency are owner-scoped, never another owner draft',async t=>{
  const f=fixture(t);const alice=await f.worker.admit(request({...input,prompt:'Alice text'}));
  const bob=await f.worker.admit(request({...input,prompt:'Bob text'},{owner:'bob',ipKey:'bob-ip'}));
  assert.notEqual(alice.id,bob.id);assert.throws(()=>f.worker.get(alice.id,'bob'),{status:404});
  assert.equal(f.worker.list('bob').length,1);assert.equal(f.worker.list('bob')[0].request.prompt,'Bob text');
  assert.deepEqual(f.worker.list('unknown'),[]);
});

test('enhance: invalid input is refused before quota or queue, and source references stay restricted',async t=>{
  let calls=0;const f=fixture(t,async()=>{calls++;return rewritten();});
  for(const body of [{prompt:''},{capabilities:true,genres:['electronic']},{capabilities:true,prompt:' ',genres:['electronic']},{prompt:'test',seed:-1},{prompt:'test',dry_run:'false'},{prompt:'test',prompt_enhance:{style:'invented'}},
    {prompt:'test',references:[{kind:'user_audio',url:'https://private.invalid/audio'}]}])await assert.rejects(f.worker.admit(request(body)),{code:'INVALID_REQUEST'});
  assert.equal(calls,0);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM counters').get().n,0);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM enhancement_jobs').get().n,0);
});

test('enhance: global generation quota is shared, owner20/day and IP3/min quotas roll back atomically',async t=>{
  const f=fixture(t);
  for(let n=0;n<3;n++)await f.worker.admit(request(input,{idem:'same-ip-request-'+n}));
  await assert.rejects(f.worker.admit(request(input,{idem:'same-ip-request-four'})),{code:'RATE_LIMITED'});
  assert.equal(f.store.db.prepare("SELECT count FROM counters WHERE key LIKE 'generation:global:%'").get().count,3);
  for(let n=3;n<20;n++)await f.worker.admit(request(input,{idem:'owner-request-'+n,ipKey:'different-ip-'+n}));
  await assert.rejects(f.worker.admit(request(input,{idem:'owner-request-last',ipKey:'new-ip'})),{code:'RATE_LIMITED'});
  assert.equal(f.store.db.prepare("SELECT count FROM counters WHERE key LIKE 'generation:global:%'").get().count,20);
  f.store.db.prepare("UPDATE counters SET count=100 WHERE key LIKE 'generation:global:%'").run();
  await assert.rejects(f.worker.admit(request(input,{owner:'other',ipKey:'other',idem:'global-cap-request'})),{code:'RATE_LIMITED'});
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM enhancement_jobs').get().n,20);
});

test('enhance: Unicode cap counts code points and does not substitute the fully compiled prompt',async t=>{
  const text='🎵'.repeat(5000),f=fixture(t,async()=>rewritten(text));
  const op=await f.worker.admit(request({...input,prompt:'Türkçe müzik — 星空\nİyi hisset'}));await f.worker.start();
  const out=f.worker.get(op.id,'enhance-owner');assert.equal(out.result.enhanced,text);assert.equal(out.result.changed,true);
  assert.equal(Array.from(out.result.enhanced).length,5000);assert.equal(out.result.state,'REWRITTEN');
  assert.ok(!JSON.stringify(out).includes('PRIVATE_FULLY_COMPILED_PROMPT'));
});

test('enhance: mixed delivery, unknown state, failed checks, empty and oversized rewrites are truthful failures',async t=>{
  const cases=[{...rewritten(),dry_run:false},{...rewritten(),tracks:[]},{...rewritten(),render_plan:{}},{...rewritten(),job_id:'unexpected'},
    {...rewritten(),prompt_enhance:{state:'SKIPPED',rewritten_prompt:'Not a rewrite'}},rewritten(' '),rewritten('🎵'.repeat(5001)),
    {...rewritten(),prompt_enhance:{...rewritten().prompt_enhance,checks:{controlled_terms_preserved:false}}},
    {...rewritten(),prompt_enhance:{...rewritten().prompt_enhance,checks:{within_cap:'true'}}}];
  for(const [index,raw] of cases.entries()){
    const f=fixture(t,async()=>raw),op=await f.worker.admit(request(input,{idem:'invalid-rewrite-'+index}));await f.worker.start();
    const out=f.worker.get(op.id,'enhance-owner');assert.equal(out.status,'failed');assert.equal(out.request.prompt,input.prompt);assert.ok(!('result' in out));
    assert.match(out.error.message,/original draft is unchanged/);assert.deepEqual(JSON.parse(f.store.db.prepare('SELECT response FROM enhancement_jobs WHERE id=?').get(op.id).response),raw);
    await f.worker.wake();assert.equal(f.worker.get(op.id,'enhance-owner').status,'failed');
  }
});

test('enhance: upstream field refusal and transport uncertainty preserve private evidence without replay',async t=>{
  const raw={success:false,error_code:'INVALID_REQUEST',refused:['seed: value -1 < min 0'],auth:{token:'PRIVATE_ERROR_AUTH'}};
  let calls=0;const f=fixture(t,async()=>{calls++;throw new EngineError('INVALID_REQUEST','PRIVATE_ERROR_MESSAGE',{upstreamStatus:400,upstreamBody:raw});});
  const op=await f.worker.admit(request());await f.worker.start();await f.worker.wake();
  const out=f.worker.get(op.id,'enhance-owner');assert.equal(out.status,'failed');assert.equal(out.error.fields[0].path,'seed');assert.ok(!JSON.stringify(out).includes('PRIVATE_'));
  assert.equal(calls,1);assert.deepEqual(JSON.parse(f.store.db.prepare('SELECT response FROM enhancement_jobs WHERE id=?').get(op.id).response),raw);
  const uncertain=fixture(t,async()=>{throw new EngineError('ENGINE_CONNECTION_ERROR','PRIVATE_NETWORK');});
  const lost=await uncertain.worker.admit(request());await uncertain.worker.start();assert.equal(uncertain.worker.get(lost.id,'enhance-owner').status,'uncertain');
});

test('enhance: observable deadline records uncertainty; late reply cannot replace it or overlap another POST',async t=>{
  let release,calls=0;const f=fixture(t,async()=>{calls++;return await new Promise(resolve=>{release=resolve;});},{enhancementTimeoutMs:10});
  const first=await f.worker.admit(request()),second=await f.worker.admit(request(input,{idem:'second-deadline-request'}));
  await f.worker.start();assert.equal(f.worker.get(first.id,'enhance-owner').status,'uncertain');assert.equal(f.worker.running,true);
  await f.worker.wake();assert.equal(calls,1);assert.equal(f.worker.get(second.id,'enhance-owner').status,'queued');
  f.worker.stop();release(rewritten());for(let n=0;n<10;n++)await Promise.resolve();
  assert.equal(f.worker.running,false);assert.equal(f.worker.get(first.id,'enhance-owner').status,'uncertain');
  assert.ok(f.store.db.prepare('SELECT response FROM enhancement_jobs WHERE id=?').get(first.id).response);
});

test('enhance: restart quarantines running receipts, resumes queued work, and keeps completed receipts',async()=>{
  const folder=await mkdtemp(join(tmpdir(),'pmp-enhance-')),file=join(folder,'enhancements.sqlite');let store,worker;
  try{
    store=new Store(file);worker=createEnhancements({store,engine:{async submit(){return rewritten();}},capabilities:async()=>caps});
    const interrupted=await worker.admit(request()),queued=await worker.admit(request(input,{idem:'queued-before-restart',ipKey:'second-ip'}));
    store.db.prepare("UPDATE enhancement_jobs SET status='running' WHERE id=?").run(interrupted.id);
    worker.stop();store.close();store=new Store(file);let calls=0;
    worker=createEnhancements({store,engine:{async submit(){calls++;return rewritten();}},capabilities:async()=>caps});
    assert.equal(worker.get(interrupted.id,'enhance-owner').status,'uncertain');assert.equal(worker.get(queued.id,'enhance-owner').status,'queued');
    await worker.start();assert.equal(calls,1);assert.equal(worker.get(queued.id,'enhance-owner').status,'complete');
    const same=await worker.admit(request());assert.equal(same.id,interrupted.id);assert.equal(same.status,'uncertain');await worker.wake();assert.equal(calls,1);
    worker.stop();store.close();store=new Store(file);worker=createEnhancements({store,engine:{submit(){assert.fail('No replay');}},capabilities:async()=>caps});
    assert.equal(worker.get(queued.id,'enhance-owner').status,'complete');
  }finally{worker?.stop();store?.close();const target=resolve(folder);assert.ok(target.startsWith(resolve(tmpdir())+sep)&&basename(target).startsWith('pmp-enhance-'));await rm(target,{recursive:true,force:true});}
});

test('enhance: stored non-inert request is refused before engine dispatch',async t=>{
  let calls=0;const f=fixture(t,async()=>{calls++;return rewritten();});const op=await f.worker.admit(request());
  f.store.db.prepare('UPDATE enhancement_jobs SET payload=? WHERE id=?').run(JSON.stringify({...input,dry_run:false}),op.id);
  await f.worker.start();assert.equal(calls,0);assert.equal(f.worker.get(op.id,'enhance-owner').status,'failed');
  assert.equal(f.worker.get(op.id,'enhance-owner').error.code,'ENHANCE_MODE_INVALID');
});

test('enhance: observed electronic happiness request conveys its actual selected sound to the enhancer',async t=>{
  const original={prompt:'make a music of happiness',genres:['electronic'],moods:['peaceful'],instruments:['synthesizer'],eras:['era_1980s'],
    vocal:{mode:'female',language:'en',language_policy:'measure'},duration:{target_seconds:30,tolerance_seconds:2,on_miss:'trim'},async:true};
  let sent;const returned='A peaceful 1980s electronic song with a gentle female English vocal and soft synthesizer, shaped as a 30-second idea.';
  const f=fixture(t,async value=>{sent=structuredClone(value);return rewritten(returned);});
  const op=await f.worker.admit(request(original));assert.deepEqual(op.request,original);await f.worker.start();
  for(const word of ['electronic','peaceful','synthesizer','1980s','female','english','30 seconds','2 seconds'])assert.ok(sent.prompt.toLowerCase().includes(word),word);
  assert.ok(sent.prompt.startsWith(original.prompt+'\n'));assert.ok(!/orchestral|flutes|strings/i.test(sent.prompt));
  assert.deepEqual({...sent,prompt:original.prompt,prompt_enhance:undefined,dry_run:undefined,capabilities:undefined},
    {...original,prompt_enhance:undefined,dry_run:undefined,capabilities:undefined});
  const done=f.worker.get(op.id,'enhance-owner');assert.deepEqual(done.dispatchRequest,sent);assert.equal(done.result.original,original.prompt);
  assert.equal(done.result.enhanced,returned,'Only the actual rewritten_prompt is published; this fixture does not establish live musical obedience.');
  const repeated=await f.worker.admit(request(original));assert.deepEqual(repeated.dispatchRequest,sent);
});

test('enhance: context excludes operational metadata, addresses, verification and custom lyric text without dropping typed request fields',async t=>{
  const original={...input,genres:['electronic'],project:{name:'PRIVATE_PROJECT_TITLE',version_note:'PRIVATE_VERSION'},labels:{key:'PRIVATE_LABEL_TOKEN'},
    webhook_url:'https://callback.fixture.invalid/PRIVATE_CALLBACK',client_side_echo:'PRIVATE_NOTE',seed:777,route:'lyria-3-pro-preview',
    run_originality_gate:true,lyrics_verify_metric:'wer',lyrics_threshold_override:0.7,lyrics_measurement_domain:'mix',
    vocal:{mode:'female',language:'en',language_policy:'strict'},lyrics:{mode:'custom',text:'PRIVATE_LYRIC_WORDS',verify:true,language:'en',script:'latin'}};
  const f=fixture(t),op=await f.worker.admit(request(original)),wire=op.dispatchRequest;
  assert.deepEqual(op.request,original);assert.equal(wire.lyrics.text,'PRIVATE_LYRIC_WORDS');assert.equal(wire.webhook_url,original.webhook_url);
  assert.ok(!wire.prompt.includes('PRIVATE_'));assert.ok(!wire.prompt.includes('https:'));
  for(const field of ['webhook_url','run_originality_gate','lyrics_verify_metric','lyrics_threshold_override','lyrics_measurement_domain','language_policy','seed:','route:','async:'])assert.ok(!wire.prompt.includes(field),field);
  assert.match(wire.prompt,/Custom lyrics are provided separately/);
  const ai=await f.worker.admit(request({...input,vocal:{mode:'female'},lyrics:{mode:'ai_write',theme:'A hopeful dawn'}},{idem:'enhance-ai-lyrics-context'}));
  assert.match(ai.dispatchRequest.prompt,/A hopeful dawn/);assert.ok(!ai.dispatchRequest.prompt.includes('Custom lyrics are provided separately'));
});

test('enhance: no selected sound values means no invented defaults; selected zero and Unicode remain exact',async t=>{
  const f=fixture(t);const untouched={prompt:'🎵'.repeat(5000)};
  const first=await f.worker.admit(request(untouched));assert.equal(first.dispatchRequest.prompt,untouched.prompt);
  const second=await f.worker.admit(request({prompt:'Türkçe müzik — 星空',fade_in_seconds:0,fade_out_seconds:0},{idem:'enhance-zero-settings'}));
  assert.ok(second.dispatchRequest.prompt.startsWith('Türkçe müzik — 星空\n'));
  assert.match(second.dispatchRequest.prompt,/fade_in_seconds: 0 seconds/);assert.match(second.dispatchRequest.prompt,/fade_out_seconds: 0 seconds/);
  assert.ok(!/genres:|instruments:|vocal:|cinematic/i.test(second.dispatchRequest.prompt));
});

test('enhance: oversized combined context is refused before quota, never truncated to make it fit',async t=>{
  const f=fixture(t),original={prompt:'🎵'.repeat(4990),genres:['electronic']};
  await assert.rejects(f.worker.admit(request(original)),error=>error.code==='INVALID_REQUEST'&&error.issues[0].code==='ENHANCE_CONTEXT_TOO_LONG');
  assert.equal(Array.from(original.prompt).length,4990);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM enhancement_jobs').get().n,0);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM counters').get().n,0);
});

test('enhance: a web address or auth-like string in a sound field is not copied into the enhancer context',async t=>{
  const f=fixture(t);
  for(const text of ['https://private.fixture.invalid/music','gs://private-fixture/take','Bearer PRIVATE_AUTH_STRING','pmp_not_a_real_key_123456']){
    await assert.rejects(f.worker.admit(request({...input,instrumentation_notes:text})),error=>error.issues?.[0]?.code==='ENHANCE_CONTEXT_ADDRESS');
  }
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM enhancement_jobs').get().n,0);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM counters').get().n,0);
});
