import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ADAPTIVE_POLICY,classifyListen,planAdaptiveRequest,decideRefill,recalibratePrepared} from '../server/adaptive-policy.mjs';
import {validateRequest} from '../server/validation.mjs';

const original={prompt:'Quiet piano with room for breath. 🎵',tempo_bpm:90,instruments:['piano'],vocal:{mode:'instrumental'},duration:{target_seconds:120},async:false,prompt_enhance:{enabled:false},negative_prompt:['harsh_highs']};
const listen=(listenedSeconds,skipped=true,durationSeconds=120)=>({listenedSeconds,durationSeconds,skipped});
const scheduling={event:'track-start',preparedAhead:1,inFlight:0,playing:true,sessionActive:true};

test('candidate recalibration uses real role identities while unknown or manually ordered slots keep their positions',()=>{
  const candidates=[{id:'explore',seedRole:'explore'},{id:'manual-library'},{id:'neighbour',seedRole:'neighbour'},{id:'faithful',seedRole:'faithful'}],before=structuredClone(candidates);
  const history=[{...listen(2),role:'faithful'}],decision=recalibratePrepared({candidates,history});
  assert.deepEqual(decision.afterIds,['neighbour','manual-library','explore','faithful']);assert.equal(decision.changed,true);assert.equal(decision.evidence.kind,'early-skip');assert.deepEqual(candidates,before);
  const manual=recalibratePrepared({candidates,history,manualQueue:true});assert.deepEqual(manual.afterIds,manual.beforeIds);assert.equal(manual.changed,false);assert.equal(manual.reason,'manual-order-preserved');
});

test('candidate recalibration retains a fully listened role and distinguishes consecutive from single skips',()=>{
  const candidates=[{id:'faithful',seedRole:'faithful'},{id:'neighbour',seedRole:'neighbour'},{id:'explore',seedRole:'explore'}];
  const full=recalibratePrepared({candidates,history:[{...listen(120,false),role:'explore'}]});assert.equal(full.afterIds[0],'explore');assert.equal(full.reason,'full-listen-direction');
  const streak=recalibratePrepared({candidates,history:[listen(2),listen(2)]});assert.equal(streak.preferredRole,'explore');assert.equal(streak.evidence.consecutiveSkips,2);assert.equal(streak.afterIds[0],'explore');
});

test('partial current listening or an end seek cannot manufacture a positive candidate choice',()=>{
  const candidates=[{id:'faithful',seedRole:'faithful'},{id:'neighbour',seedRole:'neighbour'},{id:'explore',seedRole:'explore'}],history=[listen(2)];
  const partial=recalibratePrepared({candidates,history,currentListen:{...listen(10,false),role:'explore',position:119}});assert.equal(partial.evidence.kind,'early-skip');assert.equal(partial.preferredRole,'neighbour');
  const observed=recalibratePrepared({candidates,history,currentListen:{...listen(110,false),role:'explore'}});assert.equal(observed.evidence.kind,'full-listen');assert.equal(observed.preferredRole,'explore');
});

test('empty and unlabelled prepared candidates produce a recorded absence instead of fabricated musical comparison',()=>{
  const empty=recalibratePrepared();assert.equal(empty.reason,'no-prepared-candidates');assert.deepEqual(empty.afterIds,[]);assert.equal(empty.changed,false);
  const unknown=recalibratePrepared({candidates:[{id:'one'},{id:'two'}],history:[listen(2)]});assert.equal(unknown.reason,'no-labelled-candidates');assert.deepEqual(unknown.afterIds,['one','two']);
  assert.throws(()=>recalibratePrepared({candidates:[{id:'same'},{id:'same'}]}),/unique identities/);assert.throws(()=>recalibratePrepared({manualQueue:'false'}),/Invalid prepared/);
});

test('policy constants match the recovered carried contract without invented blend weights',()=>{
  assert.deepEqual(ADAPTIVE_POLICY,{initialBurst:3,minPreparedAhead:2,recalibrateRemainingSeconds:90,earlySkipSeconds:10,fullListenRatio:0.9,maxAdaptiveInFlight:1});
  assert.equal(Object.isFrozen(ADAPTIVE_POLICY),true);
});
test('graded skip boundaries use actual played seconds and full-listen priority',()=>{
  for(const [event,expected] of [[listen(9.999),'early-skip'],[listen(10),'moderate-skip'],[listen(60),'moderate-skip'],[listen(60.001),'late-skip'],[listen(107.999),'late-skip'],[listen(108),'full-listen'],[listen(120,false),'full-listen'],[listen(50,false),'partial-listen'],[listen(9.5,true,10),'full-listen']])assert.equal(classifyListen(event).kind,expected);
});
test('missing/invalid duration or elapsed metadata never fabricates positive or negative preference',()=>{
  for(const event of [undefined,null,{},listen(NaN),listen(-1),listen(5,true,0),{...listen(5),durationSeconds:undefined},{...listen(120),durationSeconds:Infinity},{...listen(120),skipped:undefined},{listenedSeconds:'120',durationSeconds:120,skipped:false}])assert.equal(classifyListen(event).kind,'unknown');
});
test('seeking near the end is not a full listen when only a few seconds actually played',()=>{
  // The parent supplies listenedSeconds separately from the seek position.
  const signal=classifyListen({...listen(3),currentTime:119,seekTime:119});
  assert.equal(signal.kind,'early-skip');assert.equal(signal.ratio,3/120);
});
test('faithful/no-history plan is an independent exact copy with no defaults or invented choices',()=>{
  const plan=planAdaptiveRequest({request:original});
  assert.deepEqual(plan.request,original);assert.notEqual(plan.request,original);assert.notEqual(plan.request.vocal,original.vocal);
  assert.deepEqual(plan.changedPaths,[]);assert.equal(plan.guidance,'');assert.equal(plan.strategy,'faithful');
});
test('initial faithful/neighbour/explore variants retain all explicit selected values',()=>{
  const plans=['faithful','neighbour','explore'].map(strategy=>planAdaptiveRequest({request:original,strategy}));
  assert.deepEqual(plans[0].request,original);assert.notEqual(plans[1].request.prompt,plans[2].request.prompt);
  for(const plan of plans){const {prompt,...other}=plan.request,{prompt:base,...expected}=original;assert.deepEqual(other,expected);assert.ok(prompt.startsWith(base));}
  assert.match(plans[1].guidance,/neighbouring/);assert.match(plans[2].guidance,/contrasting/);
});
test('recent actual outcomes steer qualitatively, with stronger exploration after consecutive skips',()=>{
  for(const [history,strategy] of [[[listen(2)],'neighbour'],[[listen(40)],'neighbour'],[[listen(80)],'explore'],[[listen(3),listen(4)],'explore'],[[listen(120,false)],'faithful'],[[listen(120,false),listen(120,false)],'faithful']]){
    const plan=planAdaptiveRequest({request:original,history});assert.equal(plan.strategy,strategy);
  }
  const repeat=planAdaptiveRequest({request:original,history:[listen(40),listen(5)]});
  assert.equal(repeat.consecutive.skips,2);assert.match(repeat.guidance,/Consecutive skips/);
  const full=planAdaptiveRequest({request:original,history:[listen(120,false),listen(120,false)]});
  assert.equal(full.consecutive.fullListens,2);assert.match(full.guidance,/Repeated full listens/);
});
test('moderate/late/early guidance makes no unsupported causal attribution or new negative constraints',()=>{
  const moderate=planAdaptiveRequest({request:original,history:[listen(40)]});assert.match(moderate.guidance,/Keep its overall tone/);assert.match(moderate.guidance,/different structure and arrangement/);
  const late=planAdaptiveRequest({request:original,history:[listen(80)]});assert.match(late.guidance,/request for variety/);
  const early=planAdaptiveRequest({request:original,history:[listen(3)]});assert.match(early.guidance,/does not identify a disliked genre/);
  for(const plan of [moderate,late,early]){assert.deepEqual(plan.request.negative_prompt,original.negative_prompt);assert.deepEqual(plan.request.instruments,original.instruments);assert.equal(plan.request.tempo_bpm,90);assert.deepEqual(plan.changedPaths,['prompt']);}
});
test('an unknown or partial latest outcome interrupts streaks without inventing a rejection',()=>{
  for(const last of [{},listen(50,false)]){
    const plan=planAdaptiveRequest({request:original,history:[listen(2),listen(3),last]});
    assert.equal(plan.strategy,'faithful');assert.equal(plan.consecutive.skips,0);assert.deepEqual(plan.request,original);
  }
});
test('deterministic planning does not mutate original request or the chronological history',()=>{
  const request=structuredClone(original),history=[listen(3),listen(35)],before=structuredClone({request,history});
  const first=planAdaptiveRequest({request,history}),second=planAdaptiveRequest({request,history});
  assert.deepEqual(first,second);assert.deepEqual({request,history},before);
  first.request.vocal.mode='female';assert.equal(request.vocal.mode,'instrumental');
});
test('actual current 100-field valid request round-trips every selected field including false and nested data',()=>{
  const base=new URL('../../docs/implementation/2026-09-12-website-api/',import.meta.url);
  const capabilities=JSON.parse(readFileSync(new URL('live-capabilities.json',base),'utf8'));
  const candidate=JSON.parse(readFileSync(new URL('parameter-gap-audit.json',base),'utf8')).dry_run_candidate.payload;
  const request=validateRequest(candidate,capabilities),plan=planAdaptiveRequest({request,history:[listen(12)]});
  assert.equal(Object.keys(request).length,100);assert.deepEqual(Object.keys(plan.request).sort(),Object.keys(request).sort());
  for(const key of Object.keys(request))if(key!=='prompt')assert.deepEqual(plan.request[key],request[key],key);
  assert.deepEqual(validateRequest(plan.request,capabilities),plan.request);assert.equal(plan.request.prompt_enhance.enabled,false);
  // Planning does not silently change preview/transport modes to paid generation.
  assert.equal(plan.request.dry_run,request.dry_run);assert.equal(plan.request.async,request.async);
});
test('long Unicode descriptions are never truncated and a named refusal preserves the original',()=>{
  const request={prompt:'🎵'.repeat(5000),async:false},before=structuredClone(request);
  assert.deepEqual(planAdaptiveRequest({request}).request,request);
  assert.throws(()=>planAdaptiveRequest({request,history:[listen(3)]}),error=>error.code==='ADAPTIVE_PROMPT_LIMIT'&&error.issues[0].path==='prompt');
  assert.deepEqual(request,before);
  assert.throws(()=>planAdaptiveRequest({request:original,strategy:'neighbour',promptLimit:20}),{code:'ADAPTIVE_PROMPT_LIMIT'});
});
test('invalid JSON request shapes fail without executing accessors or silently discarding fields',()=>{
  let read=false;const request={prompt:'Music',get project(){read=true;return {};}};
  assert.throws(()=>planAdaptiveRequest({request}),/Unsafe/);assert.equal(read,false);
  assert.throws(()=>planAdaptiveRequest({request:{get prompt(){read=true;return 'Music';}}}),/Unsafe/);assert.equal(read,false);
  const cycle={};cycle.self=cycle;assert.throws(()=>planAdaptiveRequest({request:{prompt:'Music',project:cycle}}),/validated JSON/);
  assert.throws(()=>planAdaptiveRequest({request:{prompt:'Music',seed:NaN}}),/validated JSON/);
});
test('track start refills below two prepared and successful delivery can refill sequentially',()=>{
  assert.deepEqual(decideRefill(scheduling),{generate:true,count:1,recalibrate:false,reason:'prepared-buffer-short'});
  assert.equal(decideRefill({...scheduling,preparedAhead:2}).generate,false);
  assert.equal(decideRefill({...scheduling,event:'buffer-ready',preparedAhead:1}).generate,true);
  assert.equal(decideRefill({...scheduling,event:'buffer-ready',preparedAhead:2}).generate,false);
});
test('each skip requests one replacement and in-flight cap prevents another concurrent adaptive job',()=>{
  assert.equal(decideRefill({...scheduling,event:'skip',preparedAhead:2}).count,1);
  for(const event of ['track-start','skip','buffer-ready','time-update'])for(const inFlight of [1,3]){
    const decision=decideRefill({...scheduling,event,inFlight,remainingSeconds:70});
    assert.equal(decision.generate,false);assert.equal(decision.reason,'generation-in-flight');
  }
});
test('T-minus-90 recalibrates once without claiming another generation when the buffer is full',()=>{
  const at=remainingSeconds=>decideRefill({...scheduling,event:'time-update',remainingSeconds});
  assert.equal(at(90.001).recalibrate,false);assert.equal(at(90).recalibrate,true);assert.equal(at(90).generate,true);
  const full=decideRefill({...scheduling,event:'time-update',remainingSeconds:45,preparedAhead:2});assert.equal(full.recalibrate,true);assert.equal(full.generate,false);
  const busy=decideRefill({...scheduling,event:'time-update',remainingSeconds:45,inFlight:1});assert.equal(busy.recalibrate,true);assert.equal(busy.generate,false);
  assert.equal(decideRefill({...scheduling,event:'time-update',remainingSeconds:44,recalibrated:true}).recalibrate,false);
});
test('paused/stopped/unknown state and failed events never authorize background or duplicate work',()=>{
  for(const change of [{playing:false},{sessionActive:false},{preparedAhead:undefined},{inFlight:-1},{event:'job-failed'},{event:'time-update',remainingSeconds:NaN},{event:'time-update',remainingSeconds:-1}])assert.equal(decideRefill({...scheduling,...change}).generate,false);
});
