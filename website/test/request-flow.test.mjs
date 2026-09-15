import * as resultPresentation from '../public/result-presentation.js';
import test from 'node:test';

test('actual discovery renderer uses stable labels rather than embedded sample voice and duration values',()=>{
  const h=experience();vm.runInContext(read('request-preview.js'),h.context);
  h.window.PMPPreview.show({kind:'capability-preview',capabilities:{request_parameter_count:5,parameters:['vocal','lyrics','duration','seed','key'].map(name=>({name}))}});
  const html=h.dialogs.at(-1).body;
  assert.match(html,/>Vocals</);assert.match(html,/>Lyrics</);assert.match(html,/>Duration</);assert.match(html,/>Recorded seed</);
  assert.doesNotMatch(html,/Vocal Mode: Instrumental|Lyric Mode: None|02:15 exact|Reproducible seed/);
});
test('actual plan renderer escapes compiled prose and explicitly labels fields not sent to the model',()=>{
  const h=experience();vm.runInContext(read('request-preview.js'),h.context);
  const privateMarker='SYNTHETIC_PRIVATE_NOT_FOR_UI';
  h.window.PMPPreview.show({kind:'request-preview',musicGenerated:false,notice:'No music generated.',model:'Model fixture',settings:{durationSeconds:30,takes:1,export:'wav24_48k'},received:['prompt','seed'],promptSent:'<script>fixture()</script>',bindings:[{parameter:'seed',sent_to_model:false,note:'Recorded for tracking.'}],auth:{key:privateMarker},rawResponse:{secret:privateMarker}});
  const html=h.dialogs.at(-1).body;assert.ok(!html.includes('<script>'));assert.match(html,/&lt;script&gt;/);assert.match(html,/not sent as a model parameter/);assert.ok(!html.includes(privateMarker));
});
test('actual HTTP boundary preserves field-specific refusals and does not expose unrelated raw error data in its message',async()=>{
  const h=appBoundary(),ui=experience();h.window.PMPControls=ui.window.PMPControls;h.APP.csrf='local-fixture-csrf';let sent;
  h.setFetch(async(path,options)=>{sent={path,options};return{ok:false,status:400,json:async()=>({error:{code:'INVALID_REQUEST',message:'Review settings.',issues:[{path:'lyrics.text',message:'Too long.'}]},auth:{key:'SYNTHETIC_PRIVATE_NOT_REAL'}})};});
  let failure;try{await h.rawRequest('/api/previews',{method:'POST',body:{prompt:'Music',dry_run:true}});}catch(error){failure=error;}
  assert.equal(failure.status,400);assert.equal(failure.code,'INVALID_REQUEST');assert.equal(failure.message,'Lyrics · Your lyrics: Too long.');
  assert.ok(!failure.message.includes('SYNTHETIC_PRIVATE'));assert.equal(sent.options.headers['X-CSRF-Token'],'local-fixture-csrf');assert.equal(sent.options.credentials,'same-origin');
});

import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {projectControlsSchema} from '../server/validation.mjs';

const read=name=>readFileSync(new URL('../public/'+name,import.meta.url),'utf8').replaceAll('\r\n','\n');
const entrySource=read('app-entry.js'),experienceSource=read('experience.js'),controlsSource=read('controls.js'),connectedSource=read('connected.js');
const raw=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json',import.meta.url),'utf8'));
const schema=projectControlsSchema(raw),copy=value=>JSON.parse(JSON.stringify(value));
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const flush=async()=>{for(let i=0;i<10;i++)await Promise.resolve();};

// Run the actual app boundary definitions; stop before bootstrap/network/script
// loading. The request/wait collaborators below record local fixtures, never
// access a real service or generate music.
function appBoundary(){
  const storage=new Map(),events=[],calls=[],waited=[];let sequence=0,fetcher=async()=>{throw Error('No network expected');};
  const window={addEventListener(){},dispatchEvent:event=>events.push(event.type)};
  const context=vm.createContext({window,document:{currentScript:null,querySelector:()=>null},location:{pathname:'/index.html',origin:'http://local.invalid'},sessionStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},crypto:{randomUUID:()=> 'local-fixture-'+(++sequence)},fetch:(...args)=>fetcher(...args),CustomEvent:class{constructor(type){this.type=type;}},DOMException,URL,setTimeout,clearTimeout});
  const end=entrySource.indexOf('  try{\n    const session=');
  assert.ok(end>entrySource.indexOf('APP.generate='));
  vm.runInContext(entrySource.slice(0,end)+'})();',context);
  const APP=window.PMP_APP;APP.schemaAvailable=true;const rawRequest=APP.request;
  APP.request=async(path,options)=>{calls.push({path,options:copy({...options,signal:undefined})});return path==='/api/previews'?{kind:'request-preview',musicGenerated:false}:{job:{id:'fixture-job',status:'queued',tracks:[]}};};
  APP.wait=async(id,signal)=>{waited.push({id,signal});return{id:'fixture-track',owned:true};};
  return{APP,window,context,storage,calls,waited,events,rawRequest,setFetch(fn){fetcher=fn;}};
}
class Element{
  constructor(id='',owner){this.id=id;this.owner=owner;this.value='';this.dataset={};this.style={};this.hidden=false;this.disabled=false;this.textContent='';this.innerHTML='';this.scrollHeight=116;this.classList={add(){},toggle(){}};}
  setCustomValidity(value){this.validityMessage=value;}
  setAttribute(){}
  closest(selector){return selector==='.'+this.className?this:this.parentElement?.closest(selector)??null;}
  focus(){this.focused=true;}
  after(node){this.owner.set('#'+node.id,node);}
  remove(){this.owner.delete('#'+this.id);}
}
function experience({draft={prompt:'Exact original words.'},generate=async()=>({id:'fixture-track',owned:true}),current=null}={}){
  const elements=new Map(),dialogs=[],toasts=[],registered=[],played=[],previews=[],calls=[],events=[],workflowCalls=[];
  for(const id of ['prompt','prompt-count','create-button','creation-status'])elements.set('#'+id,new Element(id,elements));
  const creationActions=new Element('creation-actions',elements);creationActions.className='creation-actions';elements.get('#create-button').parentElement=creationActions;
  const state={draft:copy(draft),generating:false,current,queue:[],songs:[],session:null,view:'world'};
  const $=selector=>elements.get(selector)||null;
  const P={$, $$:()=>[],state,cfg:{adapters:{generate:async(payload,options)=>{calls.push({payload:copy(payload),options});return generate(payload,options);}},links:{}},esc,icon:()=>'',actions:{},onInput:[],onSubmit:[],pageHooks:[],storage:{get:()=>false,set(){}},audio:{paused:!current},
    dialog(title,body,footer){dialogs.push({title,body,footer});for(const id of ['refinement-style','apply-refinement','preview-refinement','refinement-error'])if((body+(footer||'')).includes('id="'+id+'"'))elements.set('#'+id,new Element(id,elements));if($('#refinement-style'))$('#refinement-style').value=state.draft.prompt_enhance?.style||'conservative';},
    closeDialog(){},toast:text=>toasts.push(text),saveDraft(){state.draft.prompt=$('#prompt').value;},updatePlayer(){},restoreAudio(){},registerTrack(track){registered.push(copy(track));state.songs.push(track);return track;},playTrack:async id=>{played.push(id);P.audio.paused=false;},renderLibrary(){events.push('library');}};
  const APP={schemaAvailable:true,jobs:[],generate:async(payload,options)=>{calls.push({payload:copy(payload),options});return generate(payload,options);}};
  const window={PMP:P,PMP_APP:APP,PMP_SCHEMA:copy(schema),PMPPreview:{show:result=>previews.push(copy(result))},PMPWorkflow:{enhance:async()=>{workflowCalls.push({kind:'enhance'});},create:async(payload,options)=>{workflowCalls.push({kind:'create',payload:copy(payload)});return APP.generate(payload,options);}}};
  const context=vm.createContext({window,document:{createElement:()=>new Element('',elements)},innerWidth:1280,AbortController,URL});
  const playerSource=read('player.js'),queueStart=playerSource.indexOf('function queueCreation('),queueEnd=playerSource.indexOf('function stationPool(',queueStart);
  assert.ok(queueStart>=0&&queueEnd>queueStart);
  vm.runInContext('(()=>{const P=window.PMP,state=P.state,register=track=>P.registerTrack(track),update=()=>P.updatePlayer();'+playerSource.slice(queueStart,queueEnd)+'P.queueCreation=queueCreation;})();',context);
  vm.runInContext(read('request-contract.js'),context);vm.runInContext(controlsSource,context);
  vm.runInContext(experienceSource.replace('window.PMPControls.init();','window.flowTest={createMusic};window.PMPControls.init();'),context);
  return{P,APP,window,context,state,$,dialogs,toasts,registered,played,previews,calls,events,workflowCalls,run:()=>window.flowTest.createMusic()};
}

// Exercise the actual workflow client with deterministic local transport,
// timers and a dialog collaborator that observes the real id/kind ownership
// rules. Renderer DOM/accessibility behavior is covered by its own test file.
function workflow({draft,request,generate}={}){
  const h=experience({...(draft?{draft}:{}),...(generate?{generate}:{})});
  const storage=new Map(),preferences=new Map(),timers=new Map(),listeners=new Map(),requests=[],opens=[],updates=[];
  let active=null,sequence=0;
  h.P.storage={get:(key,fallback)=>preferences.has(key)?preferences.get(key):fallback,set:(key,value)=>preferences.set(key,copy(value))};
  const D={open(model){active={...model};opens.push(active);},update(model){updates.push(model);if(!active||model.kind&&model.kind!==active.kind||model.id!==undefined&&active.id!==undefined&&model.id!==active.id)return false;active={...active,...model};return true;},close(){const previous=active;active=null;previous?.onClose?.({reason:'background'});},isOpen:()=>!!active};
  h.window.PMPWorkerDialog=D;
  h.window.addEventListener=(name,callback)=>{if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(callback);};
  h.APP.request=async(path,options={})=>{requests.push({path,options:copy(options)});return request?request(path,options):{operations:[]};};
  Object.assign(h.context,{sessionStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},crypto:{randomUUID:()=>`fixture-workflow-${++sequence}`},setTimeout:callback=>{const id=++sequence;timers.set(id,callback);return id;},clearTimeout:id=>timers.delete(id)});
  vm.runInContext(read('workflow-client.js'),h.context);
  return{...h,D,storage,preferences,timers,requests,opens,updates,get model(){return active;},emit(name){for(const callback of listeners.get(name)||[])callback();},async nextPoll(){const next=timers.entries().next().value;assert.ok(next,'Expected a scheduled status poll');timers.delete(next[0]);await next[1]();await flush();}};
}
const enhancementFixture=(request,status='queued')=>({id:'enhancement-fixture-one',kind:'enhance',status,idempotencyKey:'fixture-workflow-1',request:copy(request),createdAt:1000,updatedAt:2000,...(status==='complete'?{result:{original:request.prompt,enhanced:'Rewritten by the explicit service fixture.',changed:true,state:'REWRITTEN'}}:{})});
const creationFixture=(status='queued',id='creation-fixture-one',createdAt=1000)=>({id,status,createdAt,tracks:[],workflow:{id,kind:'create',status,title:status==='ready'?'Your music is ready':'Waiting for music worker',message:'Explicit local status fixture.',steps:[],request:{prompt:'Original fixture'}}});
const resultDetails=resultPresentation.render;

test('actual recovery action checks delivery and never submits a new generation when tools are unavailable',async()=>{
  const h=workflow({request:async path=>{assert.equal(path,'/api/connection');return{available:true,delivery:{available:false},generationAvailable:false};}});
  const job=creationFixture('ingest_failed');h.APP.jobs=[job];
  await h.window.PMPWorkflow.openCreate(job.id);
  assert.equal(typeof h.model.onRetry,'function');
  await assert.rejects(h.model.onRetry(),/no new generation was requested/);
  assert.deepEqual(h.requests.map(item=>item.path),['/api/connection']);
  assert.equal(h.calls.length,0);assert.equal(h.played.length,0);
});

test('actual group recovery resumes only failed deliveries, retaining ready and provider-refused directions',async()=>{
  const h=workflow({request:async path=>path==='/api/connection'?{delivery:{available:true}}:{job:{id:path.split('/')[3],status:'ingesting'}}});
  const job=creationFixture('failed');
  job.creation={children:[{job:creationFixture('ready','ready-child')},{job:creationFixture('failed','refused-child')},{job:creationFixture('ingest_failed','saved-child')}]};
  h.APP.jobs=[job];let refreshed=0;h.APP.refreshJobs=async()=>{refreshed++;};
  await h.window.PMPWorkflow.openCreate(job.id);await h.model.onRetry();
  assert.deepEqual(h.requests.map(item=>item.path),['/api/connection','/api/jobs/saved-child/retry-ingest']);
  assert.equal(h.requests[1].options.method,'POST');assert.deepEqual(h.requests[1].options.body,{});
  assert.equal(refreshed,1);assert.equal(h.calls.length,0);assert.equal(h.played.length,0);
});

test('actual APP generation preserves async:false, uses the website creation path, and returns the wait result',async()=>{
  const h=appBoundary(),payload={prompt:'Music',async:false,quality:'balanced'},before=copy(payload),controller=new AbortController();
  const result=await h.APP.generate(payload,{signal:controller.signal});
  assert.deepEqual(payload,before);assert.equal(h.calls.length,1);assert.equal(h.calls[0].path,'/api/creations');assert.deepEqual(h.calls[0].options.body,before);
  assert.equal(h.waited.length,1);assert.equal(h.waited[0].signal,controller.signal);assert.equal(result.id,'fixture-track');assert.equal(h.storage.size,0);
});

test('actual create-button hint visibly distinguishes default three, explicit output and non-generating preview',()=>{
  for(const [settings,expected] of [[{},/Start with three musical directions/],[{output_package:'single_track'},/Create one track\./],[{output_package:'variations',variation_count:4},/Create 4 versions/],[{dry_run:true},/No music will be generated/]]){
    const h=experience({draft:{prompt:'Music',...settings}});assert.match(h.$('#creation-output-hint').textContent,expected);
  }
});
test('actual APP dry-run and discovery branches never admit or wait for a music job',async()=>{
  for(const payload of [{prompt:'Music',dry_run:true,capabilities:false,async:false},{capabilities:true},{prompt:'Music',dry_run:true,capabilities:true}]){
    const h=appBoundary();h.APP.jobs=[{id:'already-creating',status:'pending'}];
    const result=await h.APP.generate(payload);
    assert.equal(result.kind,'request-preview');assert.equal(h.calls.length,1);assert.equal(h.calls[0].path,'/api/previews');
    assert.deepEqual(h.calls[0].options.body,payload);assert.equal(h.waited.length,0);assert.equal(h.storage.size,0);
    assert.deepEqual(h.APP.jobs,[{id:'already-creating',status:'pending'}]);assert.equal(h.events.length,0);
  }
});
test('actual APP refuses unavailable schema before either request mode and resumes admission with the same key',async()=>{
  const h=appBoundary();h.APP.schemaAvailable=false;
  await assert.rejects(h.APP.generate({capabilities:true}),/not connected/);assert.equal(h.calls.length,0);
  h.APP.schemaAvailable=true;let count=0;const ids=[];
  h.APP.request=async(path,options)=>{ids.push(options.headers['Idempotency-Key']);if(count++===0)throw Object.assign(Error('Local simulated connection loss'),{status:503});return{job:{id:'fixture-job',status:'queued',tracks:[]}};};
  const payload={prompt:'Music',async:false};await assert.rejects(h.APP.generate(payload),/connection loss/);
  assert.equal(h.storage.size,1);await h.APP.generate(payload);assert.equal(ids[0],ids[1]);assert.equal(h.storage.size,0);
});
test('actual experience previews do not register, play, enqueue or render a music result',async()=>{
  for(const [mode,kind]of [[{dry_run:true},'request-preview'],[{capabilities:true},'capability-preview']]){
    const h=experience({draft:{prompt:'Music',async:false,...mode},current:'existing-song',generate:async()=>({kind,musicGenerated:false})});
    await h.run();assert.equal(h.previews.length,1);assert.equal(h.registered.length,0);assert.equal(h.played.length,0);assert.deepEqual(h.state.queue,[]);assert.deepEqual(h.events,[]);
    assert.equal(h.calls[0].payload.async,false);assert.equal(h.state.generating,false);assert.equal(h.$('#creation-status').textContent,'Request checked. No music was generated.');
  }
});
test('unexpected music-shaped response to a preview cannot become a fake generated song',async()=>{
  const h=experience({draft:{prompt:'Music',dry_run:true},generate:async()=>({id:'unexpected-track',owned:true})});
  await h.run();assert.equal(h.registered.length,0);assert.equal(h.played.length,0);assert.equal(h.previews.length,0);
  assert.ok(h.state.creationMessage.error,'Unexpected preview response must be reported as an error.');
});
test('late preview result after Stop waiting cannot claim that music production continues',async()=>{
  let resolve;const reply=new Promise(r=>resolve=r);
  const h=experience({draft:{prompt:'Music',dry_run:true},generate:()=>reply}),running=h.run();await flush();
  h.P.actions['cancel-create']();resolve({kind:'request-preview',musicGenerated:false});await running;
  assert.equal(h.registered.length,0);assert.equal(h.previews.length,0);assert.equal(h.state.generating,false);
  assert.doesNotMatch(h.$('#creation-status').textContent,/creation continues/i);assert.match(h.$('#creation-status').textContent,/preview|request/i);
});
test('normal creation registers and plays the real adapter result exactly once',async()=>{
  const h=experience({draft:{prompt:'Music',async:false},generate:async()=>({id:'owned-result',owned:true,title:'Delivered title'})});
  await h.run();assert.equal(h.registered.length,1);assert.deepEqual(h.played,['owned-result']);assert.deepEqual(h.events,['library']);
  assert.equal(h.registered[0].prompt,'Music');assert.equal(h.calls[0].payload.async,false);assert.equal(h.previews.length,0);
});
test('actual experience Enhance delegates to the real worker flow without changing the draft or opening stale settings',async()=>{
  const h=experience({draft:{prompt:'Exact words\n🎵',prompt_enhance:{enabled:false,style:'conservative'}}});
  await h.P.actions.enhance();assert.equal(h.calls.length,0);assert.equal(h.state.draft.prompt,'Exact words\n🎵');
  assert.deepEqual(h.workflowCalls,[{kind:'enhance'}]);assert.equal(h.dialogs.length,0);
  assert.deepEqual(copy(h.state.draft.prompt_enhance),{enabled:false,style:'conservative'});
});
test('actual workflow enhancement sends the complete selected100 request once, then polls an owned receipt',async()=>{
  const draft=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/parameter-gap-audit.json',import.meta.url),'utf8')).dry_run_candidate.payload;
  draft.async=false;
  let release,operation;const h=workflow({draft,request:async(path,options)=>{
    if(options.method==='POST'){operation=enhancementFixture(options.body);return new Promise(resolve=>{release=()=>resolve({operation});});}
    return{operation:{...operation,status:'running'}};
  }});
  const running=h.P.actions.enhance();await flush();await h.P.actions.enhance();
  assert.equal(h.requests.length,1);assert.equal(h.model.status,'admitting');
  assert.deepEqual(h.requests[0].options.body,draft);assert.equal(Object.keys(h.requests[0].options.body).length,100);
  assert.equal(h.requests[0].options.body.async,false);assert.equal(h.requests[0].options.body.prompt_enhance.enabled,false);
  assert.equal(h.requests[0].path,'/api/enhancements');assert.equal(h.requests[0].options.headers['Idempotency-Key'],'fixture-workflow-1');
  release();await running;await flush();
  assert.equal(h.model.id,operation.id);assert.equal(h.model.status,'running');assert.equal(h.storage.size,0);
  assert.equal(h.calls.length,0);assert.deepEqual(copy(h.state.draft),draft);assert.equal(h.registered.length,0);
});
test('actual workflow applies only the returned rewrite explicitly, disables duplicate rewriting, and undoes without dropping controls',async()=>{
  const draft={prompt:'Exact words\n🎵',tempo_bpm:121,async:false,normalize_output:false,prompt_enhance:{enabled:true,style:'cinematic'},labels:{note:'Keep me'}};
  const h=workflow({draft,request:async(path,options)=>({operation:enhancementFixture(options.body,'complete')})});
  await h.P.actions.enhance();assert.equal(h.state.draft.prompt,draft.prompt);
  const result=h.model.result;h.model.onApply(result.enhanced,h.model);
  assert.deepEqual(copy(h.state.draft),{...draft,prompt:result.enhanced,prompt_enhance:{enabled:false,style:'cinematic'}});
  assert.equal(h.$('#prompt').value,result.enhanced);assert.equal(h.requests.length,1);assert.equal(h.calls.length,0);
  h.P.actions['workflow-undo']();assert.deepEqual(copy(h.state.draft),draft);assert.equal(h.$('#prompt').value,draft.prompt);
  assert.equal(h.requests.length,1);assert.equal(h.preferences.get('enhancementUndo'),null);
});
test('actual workflow refuses applying over new writing and refuses undo after later writing',async()=>{
  const h=workflow({request:async(path,options)=>({operation:enhancementFixture(options.body,'complete')})});
  await h.P.actions.enhance();const model=h.model;
  h.$('#prompt').value='My newer words';assert.throws(()=>model.onApply(model.result.enhanced,model),/changed while Enhance/);
  assert.equal(h.state.draft.prompt,'My newer words');assert.equal(h.preferences.size,0);
  h.$('#prompt').value=model.result.original;model.onApply(model.result.enhanced,model);
  h.$('#prompt').value='New words after apply';h.P.actions['workflow-undo']();
  assert.equal(h.state.draft.prompt,'New words after apply');assert.match(h.toasts.at(-1),/will not overwrite/);assert.equal(h.requests.length,1);
});
test('closing or reopening Enhance never cancels or resubmits and background polling can finish it',async()=>{
  let operation;const h=workflow({request:async(path,options)=>{if(options.method==='POST')operation=enhancementFixture(options.body);return{operation};}});
  await h.P.actions.enhance();await flush();h.D.close();const openCount=h.opens.length;
  operation={...operation,status:'running'};await h.nextPoll();assert.equal(h.model,null);assert.equal(h.opens.length,openCount);
  h.P.actions['workflow-enhance-open']();assert.equal(h.model.status,'running');await h.P.actions.enhance();
  assert.equal(h.requests.filter(r=>r.options.method==='POST').length,1);
  h.D.close();operation=enhancementFixture(operation.request,'complete');await h.nextPoll();h.P.actions['workflow-enhance-open']();
  assert.equal(h.model.status,'complete');assert.equal(h.model.result.original,'Exact original words.');assert.equal(h.state.draft.prompt,'Exact original words.');
  assert.ok(h.requests.every(r=>r.path.startsWith('/api/enhancements')));assert.equal(h.requests.filter(r=>r.options.method==='POST').length,1);
});
test('unconfirmed Enhance admission reuses its idempotency key and field refusal preserves the draft',async()=>{
  let count=0;const h=workflow({request:async(path,options)=>{if(count++===0)throw Object.assign(Error('Fixture connection loss'),{status:503});return{operation:enhancementFixture(options.body,'complete')};}});
  await h.P.actions.enhance();assert.equal(h.model.status,'uncertain');assert.equal(h.storage.size,1);const key=h.requests[0].options.headers['Idempotency-Key'];
  await h.P.actions.enhance();assert.equal(h.model.status,'complete');assert.equal(h.requests[1].options.headers['Idempotency-Key'],key);assert.equal(h.storage.size,0);
  const refused=workflow({request:async()=>{throw Object.assign(Error('The selected seed was refused.'),{status:400});}});
  await refused.P.actions.enhance();assert.equal(refused.model.status,'failed');assert.match(refused.model.error.message,/seed was refused/);
  assert.equal(refused.state.draft.prompt,'Exact original words.');assert.equal(refused.storage.size,0);assert.equal(refused.registered.length,0);
});
test('changed draft cannot replace an unconfirmed Enhance admission and unavailable schema never posts',async()=>{
  const h=workflow({request:async(path,options)=>{if(options.method==='POST')throw Error('Fixture unreadable response');return{operations:[]};}});
  await h.P.actions.enhance();h.$('#prompt').value='Another draft';await h.P.actions.enhance();
  assert.equal(h.requests.filter(r=>r.options.method==='POST').length,1);assert.match(h.toasts.at(-1),/needs to be reconciled/);
  const disconnected=workflow();disconnected.APP.schemaAvailable=false;await disconnected.P.actions.enhance();assert.equal(disconnected.requests.length,0);assert.equal(disconnected.opens.length,0);
});
test('actual experience creation delegates once and close/reopen does not cancel admitted work',async()=>{
  let resolve,options;const h=workflow({draft:{prompt:'Music',async:false},generate:async(payload,o)=>{options=o;const admitted=creationFixture();h.APP.jobs=[admitted];o.onAdmitted(admitted);return new Promise(r=>resolve=r);}});
  const running=h.run();await flush();assert.equal(h.calls.length,1);assert.equal(h.model.id,'creation-fixture-one');assert.equal(options.signal.aborted,false);
  h.D.close();h.P.actions['cancel-create']();assert.equal(h.model.id,'creation-fixture-one');assert.equal(options.signal.aborted,false);assert.equal(h.calls.length,1);
  const ready=creationFixture('ready');h.APP.jobs=[ready];h.emit('pmp:jobs');assert.equal(h.model.status,'ready');
  resolve({id:'owned-result',owned:true});await running;assert.equal(h.registered.length,1);assert.deepEqual(h.played,['owned-result']);
});
test('opening an active Create uses the saved job instead of generating again',async()=>{
  const h=workflow();h.APP.jobs=[creationFixture('pending')];
  await assert.rejects(h.window.PMPWorkflow.create({prompt:'Another request',async:false}),/still running/);
  assert.equal(h.calls.length,0);assert.equal(h.model.id,'creation-fixture-one');
  h.D.close();await h.window.PMPWorkflow.openCreate('creation-fixture-one');assert.equal(h.calls.length,0);
});
test('a new Create admission failure replaces its sending state even after an older completed creation',async()=>{
  const h=workflow({generate:async()=>{throw Object.assign(Error('Fixture admission rejected'),{status:400});}});
  h.APP.jobs=[creationFixture('ready','older-complete')];h.emit('pmp:jobs');
  await assert.rejects(h.window.PMPWorkflow.create({prompt:'New request'}),/admission rejected/);
  assert.match(h.model.message,/admission rejected/);assert.equal(h.model.status,'failed');
});
test('background updates for an older Create cannot replace a newly admitting request',async()=>{
  let finish;const h=workflow({generate:()=>new Promise(resolve=>{finish=resolve;})});
  h.APP.jobs=[creationFixture('ready','older-complete')];h.emit('pmp:jobs');
  const pending=h.window.PMPWorkflow.create({prompt:'New request'});await flush();h.emit('pmp:jobs');
  assert.equal(h.model.status,'admitting');assert.equal(h.model.id,undefined);assert.equal(h.model.request.prompt,'New request');
  finish({id:'fixture-track'});await pending;
});
test('actual observed terminal worker failure cannot be replaced by a stale queued admission when waiting rejects',async()=>{
  const h=workflow({generate:async(payload,options)=>{
    const admitted=creationFixture('queued');h.APP.jobs=[admitted];options.onAdmitted(admitted);
    const failed=creationFixture('failed');failed.workflow.title='Music worker failed';failed.workflow.message='The actual worker could not complete this request.';
    failed.workflow.error={code:'GENERATION_FAILED',message:failed.workflow.message};
    h.APP.jobs=[failed];h.emit('pmp:jobs');
    throw Error(failed.workflow.message);
  }});
  await assert.rejects(h.window.PMPWorkflow.create({prompt:'Music'}),/actual worker/);
  assert.equal(h.model.status,'failed');assert.equal(h.model.title,'Music worker failed');assert.match(h.model.error.message,/actual worker/);
  assert.notEqual(h.model.reconnecting,true);
});
test('result UI distinguishes requested/measured length and calibrated/noncalibrated lyric checks',()=>{
  const summary={state:'available',duration:{requestedSeconds:15,measuredSeconds:14,measured:true},lyrics:{requestedMode:'custom',measured:true,verdict:'NOT_CALIBRATED',metric:'per',value:1.25,measuredDomain:'mix',calibrationDomainMatch:false,primaryMetricState:'unavailable'}};
  const html=resultDetails(summary,null);
  assert.match(html,/Requested length<\/dt><dd>15s/);assert.match(html,/Measured length<\/dt><dd>14s/);
  assert.match(html,/No calibrated verdict/);assert.match(html,/not comparable with the calibrated vocal-stem threshold/);
  assert.match(html,/separate PER check/);assert.match(html,/does not guarantee that every word matches/);assert.doesNotMatch(html,/<dd>Passed/);
  summary.duration.measured=false;
  const reported=resultDetails(summary,null);assert.match(reported,/Reported length \(unverified\)<\/dt><dd>14s/);assert.doesNotMatch(reported,/Measured length<\/dt>/);
  summary.lyrics={requestedMode:'custom',measured:false,verdict:'PASS',state:'unverified'};
  assert.match(resultDetails(summary,null),/Not verified/);assert.doesNotMatch(resultDetails(summary,null),/<dd>Passed/);
});
test('result UI keeps originality pending, failed, calibrated scope and unknown verdicts distinct',()=>{
  const s={state:'available',originality:{requested:true,state:'pending'}};
  assert.match(resultDetails(s,null),/Pending — listening is ready/);s.originality.state='failed';assert.match(resultDetails(s,null),/Analysis failed/);
  s.originality={requested:true,state:'complete',axes:{monotony:{verdict:'PASS',corpusGenre:'singer_songwriter_acoustic',scope:'calibrated-genre-only'},similarity:{verdict:'CARBON_COPY_FLAGGED'}}};
  const html=resultDetails(s,null);assert.match(html,/Passed within calibrated scope/);assert.match(html,/Applies to the calibrated genre class only/);assert.match(html,/Similar takes flagged/);assert.doesNotMatch(html,/copyright-safe|globally original|worldwide/i);
});
test('result UI distinguishes master, listening copy, original source, unavailable and analysis-grade stems',()=>{
  const s={state:'available',takes:{requested:2,delivered:1,items:[{take:1,audio:{bitDepthPromoted:true,bitsPerSample:24,exportSourceBitsPerSample:16,mastering:{measured:true,integratedLufs:-14,truePeakDbtp:-1,loudnessRangeLu:8}}}]}};
  const assets={takes:[{take:1,master:{owned:true,codec:'pcm_s24le',sampleRate:48000,channels:2,bitsPerSample:24},listening:{owned:true,codec:'aac',sampleRate:48000,channels:2},source:{owned:false},stems:[{name:'vocals',state:'DELIVERED',grade:'analysis-grade',asset:{owned:true,codec:'flac'}},{name:'bass',state:'REFUSED_LICENCE'},{name:'drums',state:'NOT_BUILT'},{name:'music',state:'DELIVERED'}]}]};
  const html=resultDetails(s,assets);
  assert.match(html,/1 delivered · 2 requested/);assert.match(html,/Take 1 · Master/);assert.match(html,/Listening copy/);assert.match(html,/Original source<\/dt><dd>Not saved/);
  assert.match(html,/licence restriction/);assert.match(html,/Not produced by the service/);assert.match(html,/local transfer incomplete/);assert.match(html,/analysis-grade/);
  assert.match(html,/24-bit export from a 16-bit source/);assert.match(html,/-14 LUFS · -1 dBTP · 8 LU range/);assert.match(html,/last verified transfer/);
});
test('result details omit unknown raw/private data and escape selected text at the actual HTML boundary',()=>{
  const marker='SYNTHETIC_PRIVATE_NEVER_REAL';
  const s={state:'available',auth:{key:marker},rawResult:{token:marker},prompt:marker,lyrics:{requestedMode:'custom',measured:false,state:'unverified'}};
  const a={privatePath:marker,takes:[{take:1,master:{owned:true,codec:'<img src=x onerror=alert(1)>',url:marker},stems:[]}]};
  const html=resultDetails(s,a);assert.ok(!html.includes(marker));assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;IMG'));
  assert.equal(resultDetails({state:'pending',auth:marker},a),'');
});

test('pending generation receipts are isolated from a different signed-in or guest owner',async()=>{
 const h=appBoundary(),key='pmp.website.pending-admission';h.APP.notify=()=>{};h.APP.authScope='b'.repeat(64);const record={id:'old-owner-admission',payload:JSON.stringify({prompt:'Music'}),authScope:'a'.repeat(64)};h.storage.set(key,JSON.stringify(record));
 assert.equal(h.APP.readReceipt(key),null);assert.equal(h.calls.length,0);assert.equal(h.storage.get(key),undefined);assert.deepEqual(JSON.parse([...h.storage.values()][0]),record);
 await h.APP.generate({prompt:'Music'});assert.notEqual(h.calls[0].options.headers['Idempotency-Key'],record.id);
});
test('a malformed pending receipt never causes an untracked generation retry',async()=>{
 const h=appBoundary();h.storage.set('pmp.website.pending-admission','broken JSON');await assert.rejects(h.APP.generate({prompt:'Music'}),/receipt could not be read/);assert.equal(h.calls.length,0);
});
