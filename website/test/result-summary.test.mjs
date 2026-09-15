import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeResult,summarizeAssets } from '../server/result-summary.mjs';

// Sanitized structures from the two stored live envelopes; no original lyric,
// prompt, transcript, credentials, or storage address is copied into fixtures.
const payload = { duration: { target_seconds: 30, tolerance_seconds: 2 }, vocal: { mode: 'female', language: 'en' }, lyrics: { mode: 'custom', verify: true }, lyrics_measurement_domain: 'stem' };
const sung = () => ({ success: true, takes_requested: 1, takes_delivered: 1, tracks: [{ take: 1, kind: 'delivered master' }], measured: { duration_seconds: 30, duration_measured: true }, render_plan: { processed_probe: { duration_seconds: 30 } }, lyrics_verification: { measured: true, language: 'en', per: 0.2469, threshold: 0.418776, verdict: 'PASS', verify_metric: 'per', primary_metric: { metric: 'per', value: 0.2469, threshold: 0.418776, verdict: 'PASS' }, measurement_domain: { requested: 'stem', measured_on: 'separated vocal stem' } }, originality_gate: { measured: false, opt_in: true } });

test('actual sung shape retains requested and measured values without a word-perfect claim', () => {
  const summary = summarizeResult(payload, sung());
  assert.equal(summary.state, 'available');
  assert.deepEqual(summary.duration, { requestedSeconds: 30, toleranceSeconds: 2, measuredSeconds: 30, measured: true });
  assert.deepEqual(summary.takes.items.map(({audio,...rest})=>rest), [{ take: 1, kind: 'master', durationSeconds: 30, measured: true }]);
  assert.equal(summary.lyrics.state, 'measured');
  assert.equal(summary.lyrics.verdict, 'PASS');
  assert.equal(summary.lyrics.value, 0.2469);
  assert.equal(summary.lyrics.threshold, 0.418776);
  assert.equal(summary.lyrics.requestedDomain, 'stem');
  assert.equal(summary.lyrics.measuredDomain, 'stem');
  assert.equal(summary.lyrics.interpretation, 'measured-gate-only');
  assert.equal(summary.originality.state, 'not-requested');
});

test('actual instrumental14s is not relabelled as the requested15s and opt-in is not pending', () => {
  const summary = summarizeResult({ duration: { target_seconds: 15, tolerance_seconds: 2 }, vocal: { mode: 'instrumental' } }, { success: true, takes_requested: 1, takes_delivered: 1, tracks: [{ take: 1, kind: 'delivered master' }], measured: { duration_seconds: 14, duration_measured: true }, lyrics_verification: null, originality_gate: { opt_in: true, measured: false } });
  assert.equal(summary.duration.requestedSeconds, 15);
  assert.equal(summary.duration.measuredSeconds, 14);
  assert.equal(summary.lyrics.state, 'not-applicable');
  assert.equal(summary.lyrics.verdict, null);
  assert.equal(summary.originality.state, 'not-requested');
});

test('missing, failed, generation-pending and skipped results remain distinct', () => {
  assert.equal(summarizeResult(null, null).state, 'unavailable');
  assert.equal(summarizeResult(payload, { success: false, error: 'private error omitted' }).state, 'failed');
  const pending = summarizeResult(payload, { success: true, async: true, status: 'queued' });
  assert.equal(pending.state, 'pending');
  assert.equal(pending.lyrics.state, 'pending');
  assert.equal(pending.duration.measuredSeconds, null);
  assert.equal(summarizeResult({ lyrics: { mode: 'custom', verify: false } }, {}).lyrics.state, 'skipped');
  assert.equal(summarizeResult(payload, { lyrics_verification: { state: 'SKIPPED', measured: false } }).lyrics.state, 'skipped');
  assert.equal(summarizeResult(payload, { success: true, dry_run: true }).state, 'unavailable');
});

test('a separate raw variation uses its own measurement and preserves partial delivery', () => {
  const result = sung();
  result.takes_requested = 3; result.takes_delivered = 2;
  result.tracks.push({ take: 2, kind: 'raw take (variation2: render pass failed)' });
  result.source_take = [{ take: 2, measured: { duration_seconds: 37, duration_measured: true } }];
  result.generation_shortfall = { failed_take: 3 };
  const summary = summarizeResult(payload, result);
  assert.equal(summary.takes.partial, true);
  assert.deepEqual(summary.takes.items[1], { take: 2, kind: 'raw', durationSeconds: 37, measured: true,audio:null });
});

test('PER may exceed1; non-calibrated and grapheme-only outcomes remain explicit', () => {
  const result=sung();
  result.lyrics_verification={measured:true,language:'tr',verdict:'NOT_CALIBRATED',verify_metric:'per',per:1.25,threshold:null,measurement_domain:{measured_on:'separated vocal stem'}};
  const unknown=summarizeResult(payload,result).lyrics;
  assert.equal(unknown.value,1.25); assert.equal(unknown.verdict,'NOT_CALIBRATED'); assert.equal(unknown.threshold,null);
  result.lyrics_verification={measured:true,language:'fil',verdict:'GRAPHEME_ONLY',verify_metric:'cer',primary_metric:{metric:'cer',value:0.14,threshold:null}};
  assert.equal(summarizeResult(payload,result).lyrics.verdict,'GRAPHEME_ONLY');
  assert.equal(summarizeResult(payload,result).lyrics.language,'fil');
});

test('unmeasured or malformed PASS cannot become a verified gate and null is not zero', () => {
  const result=sung();
  result.lyrics_verification.measured=false;
  let summary=summarizeResult(payload,result);
  assert.equal(summary.lyrics.state,'unverified'); assert.equal(summary.lyrics.verdict,null);
  result.lyrics_verification.measured=true; result.lyrics_verification.primary_metric.value=null; result.lyrics_verification.per=null;
  summary=summarizeResult(payload,result);
  assert.equal(summary.lyrics.value,null); assert.equal(summary.lyrics.verdict,null);
  result.measured={duration_seconds:30,duration_measured:false}; delete result.render_plan;
  assert.equal(summarizeResult(payload,result).duration.measured,false);
});

test('only explicit originality execution states are reported, without starting a poll', () => {
  const result=sung();
  assert.equal(summarizeResult({...payload,run_originality_gate:true},result).originality.state,'unavailable');
  result.originality_gate={status:'pending',measured:false,poll_url:'https://private.invalid/token'};
  assert.deepEqual(summarizeResult({...payload,run_originality_gate:true},result).originality,{requested:true,state:'pending',measured:false,verdict:null,calibration:null,axes:null});
  result.originality_gate={status:'failed',measured:false,verdict:'PASS'};
  assert.equal(summarizeResult(payload,result).originality.state,'failed');
  result.originality_gate={status:'complete',measured:true,verdict:'PASS'};
  assert.equal(summarizeResult(payload,result).originality.verdict,null);
  assert.equal(summarizeResult(payload,result).originality.measured,null);
});

test('documented verify:false and ai_write typed records are skipped and not applicable', () => {
  const skipped={lyrics_verification:{measured:false,gate_ran:false,skipped_by_caller:true,reason:'Private note'}};
  const s=summarizeResult({lyrics:{mode:'custom',verify:false}},skipped).lyrics;
  assert.equal(s.state,'skipped'); assert.equal(s.measured,false); assert.equal(s.verdict,null);
  const composed={lyrics_verification:{measured:false,gate_ran:false,verdict:'NOT_APPLICABLE',language:'tr'}};
  const a=summarizeResult({vocal:{mode:'female'},lyrics:{mode:'ai_write'}},composed).lyrics;
  assert.equal(a.state,'not-applicable'); assert.equal(a.verdict,'NOT_APPLICABLE');
});

test('SER is supported and an unavailable requested metric preserves a labelled PER fallback', () => {
  const r=sung(); r.lyrics_verification.verify_metric='ser';
  r.lyrics_verification.primary_metric={metric:'ser',value:0.25,threshold:0.4,verdict:'PASS'};
  let s=summarizeResult({...payload,lyrics_verify_metric:'ser'},r).lyrics;
  assert.equal(s.metric,'ser'); assert.equal(s.requestedMetric,'ser'); assert.equal(s.value,0.25);
  r.lyrics_verification.primary_metric.verdict='FAIL';
  assert.equal(summarizeResult({...payload,lyrics_verify_metric:'ser'},r).lyrics.verdict,'FAIL','Selected primary gate must take precedence over the separate top-level PER verdict.');
  r.lyrics_verification.primary_metric={metric:'ser',verdict:'NOT_RUN',reason:'Unsupported requested language'};
  s=summarizeResult({...payload,lyrics_verify_metric:'ser'},r).lyrics;
  assert.equal(s.requestedMetric,'ser'); assert.equal(s.primaryMetricState,'unavailable');
  assert.equal(s.metric,'per'); assert.equal(s.value,0.2469); assert.equal(s.verdict,'PASS'); assert.equal(s.state,'measured');
});

// Docs12 exact nested branch structure; numeric examples are contract fixtures,
// not fresh music measurements or a test of the upstream analysis algorithms.
const originalityComplete = () => ({success:true,status:'complete',verdict:{measured:true,
  bars_status:'CALIBRATED',bars_status_per_axis:{axis1_monotony:'CALIBRATED',axis2_similarity:'CALIBRATED'},
  axis1_monotony:{take:'take_1',lag_scan:{max_block_repeat_fraction:0.0168,best_lag_seconds:9.342,ran:true},
    tile_rule:{flagged:false,ran:true},verdict:'PASS',verdict_basis:{lag_scan_bar:0.14419,corpus_genre:'singer_songwriter_acoustic',scope_rule:'these bars judge material of this genre class; widening is a new calibration'}},
  axis2_similarity:{take_count:3,effective_distinct_takes_vendi:2.4,verdict:'CARBON_COPY_FLAGGED',
    verdict_basis:{qmax_norm_bar:0.085308,corpus_genre:'singer_songwriter_acoustic',scope_rule:'these bars judge material of this genre class; widening is a new calibration'},pairs:[
      {take_a:'take_1',take_b:'take_2',qmax_normalised:0.052,fingerprint_ber:0.49,near_exact_copy:false,verdict:'PASS'},
      {take_a:'take_1',take_b:'take_3',qmax_normalised:0.131,fingerprint_ber:0.47,near_exact_copy:false,verdict:'CARBON_COPY_FLAGGED'}]}}});

test('separate poll preserves the initial pending result and projects both calibrated axes', () => {
  const initial=sung(); initial.originality_gate={status:'pending',measured:false,poll:'/v1/music/originality/private-id'};
  const before=JSON.stringify(initial), poll=originalityComplete(), frozenPoll=JSON.stringify(poll);
  const s=summarizeResult({...payload,run_originality_gate:true},initial,poll).originality;
  assert.equal(s.state,'complete'); assert.equal(s.measured,true); assert.equal(s.verdict,null); assert.equal(s.calibration,'CALIBRATED');
  assert.equal(s.axes.monotony.take,1); assert.equal(s.axes.monotony.verdict,'PASS'); assert.equal(s.axes.monotony.repeatFraction,0.0168);
  assert.equal(s.axes.monotony.corpusGenre,'singer_songwriter_acoustic');assert.equal(s.axes.monotony.scope,'calibrated-genre-only');
  assert.equal(s.axes.similarity.corpusGenre,'singer_songwriter_acoustic');assert.equal(s.axes.similarity.scope,'calibrated-genre-only');
  assert.equal(s.axes.similarity.verdict,'CARBON_COPY_FLAGGED'); assert.equal(s.axes.similarity.effectiveDistinctTakes,2.4);
  assert.deepEqual(s.axes.similarity.pairs[1],{takeA:1,takeB:3,qmaxNormalised:0.131,fingerprintBer:0.47,nearExactCopy:false,verdict:'CARBON_COPY_FLAGGED'});
  assert.equal(JSON.stringify(initial),before); assert.equal(JSON.stringify(poll),frozenPoll);
  assert.equal(summarizeResult({...payload,run_originality_gate:true},initial).originality.state,'pending');
  assert.equal(summarizeResult(payload,initial,{success:true,status:'failed',reason:'Private worker error'}).originality.state,'failed');
  assert.equal(summarizeResult(payload,initial,{success:false,request_id:'private-id',error:'No record'}).originality.state,'unavailable');
});

test('originality calibration failure, single-take inapplicability and unavailable scheduling remain distinct', () => {
  const r=sung(), poll=originalityComplete();
  poll.verdict.bars_status='PARTIALLY_CALIBRATED'; poll.verdict.bars_status_per_axis.axis1_monotony='CALIBRATION_FAILED';
  poll.verdict.axis1_monotony.verdict='NOT_CALIBRATED'; poll.verdict.axis1_monotony.calibration_failure={reason:'Private details'};
  poll.verdict.axis2_similarity={verdict:'NOT_APPLICABLE',take_count:1};
  const s=summarizeResult({run_originality_gate:true},r,poll).originality;
  assert.equal(s.axes.monotony.verdict,'NOT_CALIBRATED'); assert.equal(s.axes.monotony.calibration,'CALIBRATION_FAILED');
  assert.equal(s.axes.similarity.verdict,'NOT_APPLICABLE'); assert.deepEqual(s.axes.similarity.pairs,[]);
  r.originality_gate={status:'unavailable',measured:false};
  assert.equal(summarizeResult({},r).originality.state,'unavailable');
});

test('nested originality output blocks arbitrary strings, paths and excessive pair arrays', () => {
  const secret='NESTED_SECRET_SENTINEL', poll=originalityComplete();
  poll.verdict.note=secret; poll.verdict.axis1_monotony.take=secret; poll.verdict.axis1_monotony.verdict_basis.corpus_genre=secret;
  poll.verdict.axis1_monotony.verdict_basis.scope_rule=secret;
  poll.verdict.axis1_monotony.lag_scan.max_block_repeat_fraction=Infinity;
  poll.verdict.axis2_similarity.pairs=Array.from({length:500},()=>({take_a:secret,take_b:'take_33',qmax_normalised:-1,
    fingerprint_ber:'Infinity',verdict:secret,private_url:secret,near_exact_copy:'true'}));
  const s=summarizeResult(payload,sung(),poll).originality;
  assert.equal(s.axes.monotony.take,null); assert.equal(s.axes.monotony.repeatFraction,null);
  assert.equal(s.axes.monotony.corpusGenre,null);assert.equal(s.axes.monotony.scope,null);
  assert.equal(s.axes.similarity.pairs.length,32); assert.equal(s.axes.similarity.pairsTruncated,true);
  assert.ok(Object.values(s.axes.similarity.pairs[0]).every(v=>v===null));
  assert.ok(!JSON.stringify(s).includes(secret));
});

test('an explicit unmeasured originality reply cannot present a passing or flagged measured gate',()=>{
  const poll=originalityComplete();poll.verdict.measured=false;
  const s=summarizeResult({run_originality_gate:true},sung(),poll).originality;
  assert.equal(s.measured,false);assert.equal(s.verdict,null);
  assert.equal(s.axes.monotony.verdict,null);assert.equal(s.axes.similarity.verdict,null);
  assert.ok(s.axes.similarity.pairs.every(pair=>pair.verdict===null));
});

test('hostile extra fields and freeform labels cannot escape the allowlist', () => {
  const secret='LEAK_SENTINEL_PRIVATE_VALUE';
  const p={...payload,prompt:secret,lyrics:{...payload.lyrics,text:secret,theme:secret},auth:{secret},file:secret};
  const r=sung();r.prompt_sent=secret;r.auth={secret};r.tracks[0].public_url=secret;r.tracks[0].gcs_uri=secret;r.render_plan.processed_url=secret;r.lyrics_verification.transcript=secret;r.lyrics_verification.separator={stem_gcs_uri:secret};r.lyrics_verification.per_line=[{reference:secret,transcript:secret}];r.lyrics_verification.language=secret;r.lyrics_verification.measurement_domain={measured_on:secret};r.originality_gate.reason=secret;
  const serialized=JSON.stringify(summarizeResult(p,r));
  assert.ok(!serialized.includes(secret));
  for(const field of ['prompt_sent','public_url','gcs_uri','transcript','separator','auth','secret','per_line']) assert.ok(!serialized.includes('"'+field+'"'));
  assert.equal(summarizeResult(p,r).lyrics.language,null);
  assert.equal(summarizeResult(p,r).lyrics.measuredDomain,null);
});

test('malformed numbers, excessive arrays, unknown enums and inherited properties are bounded', () => {
  const r=sung();r.tracks=Array.from({length:500},()=>({kind:'delivered master',measured:{duration_seconds:Infinity}}));r.takes_requested=Infinity;r.lyrics_verification={measured:true,verdict:'invented success',per:NaN,threshold:'Infinity',language:'secret',verify_metric:'private metric'};
  const summary=summarizeResult({duration:{target_seconds:-5,tolerance_seconds:999}},r);
  assert.equal(summary.takes.items.length,32);assert.equal(summary.takes.truncated,true);assert.equal(summary.takes.requested,null);
  assert.equal(summary.duration.requestedSeconds,null);assert.equal(summary.duration.toleranceSeconds,null);
  assert.equal(summary.lyrics.verdict,null);assert.equal(summary.lyrics.value,null);assert.equal(summary.lyrics.metric,null);
  const inherited=Object.create({lyrics_verification:{verdict:'PASS',measured:true,per:0,threshold:0.4}});
  assert.equal(summarizeResult(payload,inherited).lyrics.verdict,null);
});

test('lyric domain and caller override are reported separately from calibrated-stem comparability',()=>{
  const r=sung();r.lyrics_verification.bar_source='data/language_registry.json';
  let s=summarizeResult(payload,r).lyrics;
  assert.equal(s.barSource,'language-registry');assert.equal(s.calibrationDomainMatch,true);assert.equal(s.callerThreshold,null);
  r.lyrics_verification.bar_source='lyrics_threshold_override=0.3';
  s=summarizeResult({...payload,lyrics_threshold_override:0.3},r).lyrics;
  assert.equal(s.barSource,'caller-override');assert.equal(s.requestedThreshold,0.3);assert.equal(s.callerThreshold,0.3);
  r.lyrics_verification.measurement_domain={requested:'mix',measured_on:'delivered mix'};
  r.lyrics_verification.bar_source='NOT_COMPARABLE';
  s=summarizeResult({...payload,lyrics_measurement_domain:'mix'},r).lyrics;
  assert.equal(s.barSource,'not-comparable');assert.equal(s.calibrationDomainMatch,false);
  r.lyrics_verification.bar_source='PRIVATE_REGISTRY_PATH';
  assert.equal(summarizeResult(payload,r).lyrics.barSource,null);
  assert.ok(!JSON.stringify(summarizeResult(payload,r)).includes('PRIVATE_REGISTRY_PATH'));
});

test('export depth and upstream loudness values are measured separately from request intent',()=>{
  const r=sung();r.render_plan.processed_probe={duration_seconds:30,codec_name:'pcm_s24le',sample_rate:'48000',channels:2,bits_per_sample:24};
  r.render_plan.stages={export:{source:{bits_per_sample:16},upsampled_from:{sample_rate:44100,private_path:'PRIVATE'}},
    master:{verification:{measured:true,integrated_lufs:'-13.9',true_peak_dbtp:'-1.0',lra_lu:'5.8'}}};
  let audio=summarizeResult(payload,r).takes.items[0].audio;
  assert.equal(audio.codec,'pcm_s24le');assert.equal(audio.sampleRate,48000);assert.equal(audio.bitsPerSample,24);
  assert.equal(audio.exportSourceBitsPerSample,16);assert.equal(audio.bitDepthPromoted,true);
  assert.deepEqual(audio.mastering,{measured:true,integratedLufs:-13.9,truePeakDbtp:-1,loudnessRangeLu:5.8});
  delete r.render_plan.stages.export.source.bits_per_sample;
  audio=summarizeResult(payload,r).takes.items[0].audio;
  assert.equal(audio.bitDepthPromoted,null,'A sample-rate upsample does not prove bit-depth promotion.');
  assert.ok(!JSON.stringify(audio).includes('PRIVATE'));
  r.render_plan.processed_probe.codec_name='PRIVATE_CODEC';r.render_plan.stages.master.verification.integrated_lufs='-Infinity';
  audio=summarizeResult(payload,r).takes.items[0].audio;
  assert.equal(audio.codec,null);assert.equal(audio.mastering.integratedLufs,null);
});

const asset=(kind,id='a')=>({kind,id:id.repeat(64),measured:true,codec:kind==='listening'?'mp3':'pcm_s24le',durationSeconds:30,sampleRate:48000,channels:2,size:3456,path:'PRIVATE_PATH',sourceUri:'PRIVATE_GCS_URI'});
test('owned manifest retains explicit roles and named stem refusals without substituting a raw master',()=>{
  const p={stems:['vocals','drums','fx']};
  const manifest={status:'partial',takes:[{take:1,status:'partial',kind:'delivered-master',master:asset('master'),listening:asset('listening','b'),source:asset('source','c'),
    stems:[{name:'vocals',upstream:{state:'DELIVERED',origin:'separated',grade:'analysis-grade'},asset:asset('stem','d')},
      {name:'drums',upstream:{state:'REFUSED_LICENCE',origin:'separated',reason:'PRIVATE_REASON'},asset:null},
      {name:'fx',upstream:{state:'NOT_BUILT',origin:'generated'},asset:null}]},
    {take:2,status:'failed',kind:'raw',master:null,listening:null,source:asset('source','e'),stems:[]}]};
  const summary=summarizeAssets(p,{},manifest);
  assert.equal(summary.measurement,'last-verified-ingest');assert.equal(summary.state,'partial');
  assert.equal(summary.takes[0].master.owned,true);assert.equal(summary.takes[0].listening.owned,true);assert.equal(summary.takes[0].source.owned,true);
  assert.equal(summary.takes[0].master.bitsPerSample,null,'Local probe descriptor has no bit-depth field; codec must not be relabelled as a measured field.');
  assert.equal(summary.takes[0].stems[0].grade,'analysis-grade');assert.equal(summary.takes[0].stems[0].asset.owned,true);
  assert.equal(summary.takes[0].stems[1].state,'REFUSED_LICENCE');assert.equal(summary.takes[0].stems[1].asset.owned,false);
  assert.equal(summary.takes[0].stems[2].state,'NOT_BUILT');
  assert.equal(summary.takes[1].master.owned,false);assert.equal(summary.takes[1].listening.owned,false);assert.equal(summary.takes[1].source.owned,true);
  assert.ok(!JSON.stringify(summary).includes('PRIVATE_'));assert.ok(!JSON.stringify(summary).includes('"id"'));
});

test('stems bundle lists all seven requested names even when a manifest records no delivery',()=>{
  const s=summarizeAssets({output_package:'stems_bundle'},{},{status:'failed',takes:[{take:1,status:'failed',kind:'unavailable',stems:[]}]});
  assert.equal(s.takes[0].stems.length,7);assert.ok(s.takes[0].stems.every(stem=>stem.requested&&stem.state==='UNAVAILABLE'&&!stem.asset.owned));
  assert.equal(summarizeAssets({},null,null),null);
});

test('asset projection refuses mismatched roles, unknown grades, inherited fields and oversized arrays',()=>{
  const forged=asset('source');
  const bad={status:'PRIVATE_STATE',takes:Array.from({length:100},()=>({take:999,status:'PRIVATE_STATUS',kind:'PRIVATE_KIND',master:forged,stems:[
    {name:'vocals',upstream:{state:'PRIVATE_STATE',origin:'PRIVATE_ORIGIN',grade:'PRIVATE_GRADE'},asset:Object.create(asset('stem'))},
    {name:'PRIVATE_STEM_NAME',upstream:{state:'DELIVERED'},asset:asset('stem')}]}))};
  const s=summarizeAssets({},null,bad);
  assert.equal(s.takes.length,32);assert.equal(s.truncated,true);assert.equal(s.state,'unavailable');
  assert.equal(s.takes[0].master.owned,false);assert.equal(s.takes[0].stems.length,1);assert.equal(s.takes[0].stems[0].grade,null);
  assert.equal(s.takes[0].stems[0].asset.owned,false);assert.ok(!JSON.stringify(s).includes('PRIVATE_'));
});
