import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { summarizeResult } from '../server/result-summary.mjs';
import { Store } from '../server/store.mjs';

// These fixtures test the documented response contract. They do not claim new
// generated audio or fresh upstream analysis, calibration or legal validation.
const details = (result, payload = {}) => summarizeResult(payload, result).details;
const privateMarker = 'PRIVATE_RESULT_DETAIL_SENTINEL';

test('routing compares reported model and exposes explicit seed application without a repeatability claim', () => {
  const r={route:{model:'lyria-3-pro-preview',why:privateMarker,delegate_reported:{surface:'interactions',model:'lyria-002'}},
    seed:{value:454533620,source:'server (secrets.randbits(31))',sent_to_model:false,note:privateMarker}};
  const d=details(r,{route:'auto',seed:42});
  assert.deepEqual(d.routing,{requested:'auto',model:'lyria-3-pro-preview',reportedModel:'lyria-002',modelMatches:false,surface:'interactions'});
  assert.deepEqual(d.seed,{requested:42,value:454533620,source:'server',sentToModel:false,interpretation:'provenance-only-no-repeatability-guarantee'});
  r.route.delegate_reported.model='PRIVATE_MODEL';r.seed.sent_to_model='false';r.seed.value=Number.MAX_SAFE_INTEGER+1;
  assert.equal(details(r).routing.modelMatches,null);assert.equal(details(r).seed.sentToModel,null);assert.equal(details(r).seed.value,null);
  assert.ok(!JSON.stringify(d).includes(privateMarker));
});

test('structured and legacy language fallback cannot silently become the requested language or a proven gate', () => {
  const r={language_fallback:{requested:'tr',requested_state:'ENGINEERING_PATH_ESTABLISHED',delivered:'en',reason:privateMarker},
    language_capability:{code:'en',accepted:true,generation:'PROMPT_LANGUAGE',transcription:'GEMINI_DOCUMENTED',intelligibility_gate:'PHONEMISER_AVAILABLE',bar:'CALIBRATED',singing:'SINGING_PROVEN',speech:'PENDING_MEASUREMENT',name:privateMarker}};
  const p={vocal:{language:'tr',language_policy:'prefer_proven'}};
  const d=details(r,p).language;
  assert.equal(d.requested,'tr');assert.equal(d.fallback.delivered,'en');assert.equal(d.fallback.state,'reported');assert.equal(d.capability.code,'en');
  r.language_fallback=privateMarker;const legacy=details(r,p).language.fallback;
  assert.equal(legacy.state,'reported');assert.equal(legacy.delivered,null);
  r.language_fallback=null;assert.equal(details(r,p).language.fallback.state,'none');
  delete r.language_fallback;assert.equal(details(r,p).language.fallback.state,'unavailable');
  r.language_capability={code:'fil',accepted:false,bar:'NOT_CALIBRATED',intelligibility_gate:'GRAPHEME_METRICS_ONLY',singing:'NOT_IN_REGISTRY'};
  assert.equal(details(r,p).language.capability.accepted,false);assert.equal(details(r,p).language.capability.calibration,'NOT_CALIBRATED');
  assert.ok(!JSON.stringify(d).includes(privateMarker));
});

test('processing retains per-take actual conform/master/export facts and does not call raw input a final probe', () => {
  const r={render_plan:{executed:true,stages:{conform:{ok:true,measured_duration_seconds:30,plan:{action:'trim',delivered_seconds:143.75,cut_seconds:30,fade_seconds:2,derivation:{bar_seconds:2,tempo_bpm:120,time_signature:'4/4',bar_aligned:true,rule:privateMarker}}},
    master:{ok:true,applied:false,dual_mono:false,mode:'linear_gain_plus_true_peak_limiter',applied_gain_db:0,limiter_limit_db:-1,relimit_passes:0,residual_overshoot_db:0,target:{lufs:-14,true_peak_db:-1},verification:{measured:true,has_audio:true,integrated_lufs:-13.9,true_peak_dbtp:-1,lra_lu:5.8}},
    post_edits:{ok:true,applied:false,fade_in_seconds:0,fade_out_seconds:0,channel_layout:'stereo'},
    export:{ok:true,applied:true,requested:'wav24_48k',file_size_bytes:1000,measured:{codec:'pcm_s24le',bits_per_raw_sample:'24',bit_rate:'2304000',sample_rate:'48000',channels:2},source:{bits_per_sample:16,sample_rate:44100},upsampled_from:{sample_rate:44100},output_path:privateMarker}},
    processed_probe:{codec_name:'pcm_s24le',sample_fmt:'s32',sample_rate:48000,channels:2,bits_per_sample:24,duration_seconds:30,size_bytes:1000}},
    tracks:[{take:1},{take:2,render_plan:{executed:false,stages:{conform:{action:'refuse_pad',delivered_seconds:20},master:{skipped:true,verification:{measured:false}}}}},{take:3,kind:'raw take (variation3: render pass failed)',measured:{duration_seconds:31}}]};
  const rows=details(r).processing;
  assert.equal(rows.length,2);assert.equal(rows[0].conform.sourceSeconds,143.75);assert.equal(rows[0].conform.measuredSeconds,30);
  assert.equal(rows[0].master.applied,false);assert.equal(rows[0].master.gainDb,0);assert.equal(rows[0].master.dualMono,false);
  assert.equal(rows[0].postEdits.applied,false);assert.equal(rows[0].export.measured.rawBitsPerSample,24);assert.equal(rows[0].export.source.bitsPerSample,16);
  assert.equal(rows[0].finalProbe.sampleFormat,'s32');assert.equal(rows[1].take,2);assert.equal(rows[1].executed,false);
  assert.equal(rows[1].conform.action,'refuse_pad');assert.equal(rows[1].master.measured,false);assert.equal(rows[1].finalProbe,null);
  assert.ok(!JSON.stringify(rows).includes(privateMarker));
});

test('provenance keeps signed-but-untrusted, calibrated watermark and vendor-only SynthID distinct', () => {
  const r={compliance:{c2pa:{state:'signed',survived_render:true,trust:'untrusted_own_ca',validation_state:'Valid',validation_codes:{success:['claimSignature.validated'],failure:['signingCredential.untrusted'],informational:['timeStamp.untrusted']},manifest_assertions:['c2pa.actions'],signature_info:{common_name:privateMarker}},
    watermark:{state:'embedded_calibrated',algorithm:'com.aiwatermark.audioseal.1',message_id:2,watermark_rms_dbfs:-41.8,soft_binding_in_manifest:true,detection:{detected:true,probability:0.999,message_id:2,message_bit_confidence:0.38,mean_frame_probability:0.993,sample_rate_hz:16000,seconds:29.936,detect_time_s:0.49},calibration:{calibrated:true,status:'CALIBRATED',threshold:0.5,marked:{n:30,detected:30,min_probability:0.977,max_probability:1,message_matches:30},unmarked:{n:20,detected:0,min_probability:0.002,max_probability:0.119,message_matches:0},artefact:privateMarker}},
    synthid:{state:'vendor_stated_not_verified',statement:privateMarker},ddex_ai_credit:{state:'declared',version:'ERN 4.3.2',contains_ai:'All',special_contributor:'GenerativeAI'}}};
  const p=details(r).provenance;
  assert.equal(p.c2pa.state,'signed');assert.equal(p.c2pa.trust,'untrusted_own_ca');assert.deepEqual(p.c2pa.validationCodes.failure,['signingCredential.untrusted']);
  assert.equal(p.watermark.probability,0.999);assert.equal(p.watermark.calibration.unmarked.detected,0);assert.equal(p.synthid.verified,false);
  assert.equal(p.ddex.state,'declared');assert.ok(!JSON.stringify(p).includes(privateMarker));
  r.compliance.c2pa=true;r.compliance.ddex_ai_credit=false;
  assert.deepEqual(details(r).provenance.c2pa,{state:'legacy-intent-only',intent:true});
  assert.deepEqual(details(r).provenance.ddex,{state:'legacy-intent-only',intent:false});
  r.compliance.watermark={state:'failed',detection:{detected:false,probability:0},calibration:{calibrated:false,status:'CALIBRATION_FAILED'}};
  assert.equal(details(r).provenance.watermark.detected,false);assert.equal(details(r).provenance.watermark.calibration.calibrated,false);
});

test('musical estimates preserve failed agreement, uncalibrated fallback and absent loudness without correcting anything', () => {
  const r={analysis_outputs:{measured_loudness_lufs:null,measured_true_peak_dbtp:-1,measured_duration_seconds:30,measured_channels:2,measured_sample_rate:48000,measured_codec:'pcm_s24le'},
    measured:{tempo:{state:'MEASURED',tempo_bpm_estimated:120,tempo_bpm_requested:90,measured_on:'processed master (render_plan.processed_gcs_uri)',agreement:{acc1_within_4pct:false,acc2_octave_tolerant:false,octave_error_oe1:0.415},analysis:{ac_size_s:8,analysis_sample_rate_hz:22050,duration_s:30,max_tempo:320,onset_frames:5702,prior_start_bpm:120,prior_std_octaves:1}},
      key_estimated:{state:'ESTIMATED_UNCALIBRATED',key_estimated:'G|major',key_requested:'D|dorian',agreement:{mirex_weighted_score:0.5,relation:'fifth'},learned_branch:{attempted:true,error:privateMarker},best_correlation:0.85,margin_over_second:0.1,analysis:{correlations:{'G|major':0.85,'D|minor':-0.1,[privateMarker]:1}}},
      time_signature_estimated:{state:'NOT_MEASURABLE',value:'4/4',numerator_requested:7,numerator_estimated:4,equivalence_class:'duple',kappa:0.95,agreement:{equivalence_class_match:false,exact_match:false,requested_class:'septuple',estimated_class:'duple'},bar:{status:'CALIBRATED',theta:0.8,target_risk:0.25,held_out:{n:957,coverage:0.58,risk:0.13},gated_classes:['duple','triple'],excluded_classes:['quintuple','septuple']},analysis:{beats:120,downbeats:30,bars:29,beats_per_bar_histogram:{4:29,[privateMarker]:10}},reason:privateMarker}}};
  const a=details(r).analysis;
  assert.equal(a.outputs.integratedLufs,null);assert.equal(a.tempo.agreement.withinFourPercent,false);assert.equal(a.tempo.measuredOn,'delivered-master');
  assert.equal(a.key.state,'ESTIMATED_UNCALIBRATED');assert.equal(a.key.learnedAttempted,true);assert.equal(a.key.requested,'D|dorian');
  assert.equal(a.meter.state,'NOT_MEASURABLE');assert.equal(a.meter.agreement.exactMatch,false);assert.equal(a.meter.calibration.heldOut.risk,0.13);assert.deepEqual(a.meter.analysis.histogram,[{numerator:4,bars:29}]);
  assert.equal(a.meter.interpretation,'reported-estimate-not-correction');assert.ok(!JSON.stringify(a).includes(privateMarker));
});

test('regeneration presence is not a success/call-count claim; budget, retries and partial shortfall remain actual reports', () => {
  const r={duration_regeneration:{undocumented:privateMarker},job:{attempt:{retry_count:'0',execution_count:'1',caller_email:privateMarker}},
    generation_shortfall:{takes_requested:3,takes_generated:2,failed_take:3,error_code:'VENDOR_CONTENT_BLOCKED',vendor_refusal:{retried_by_service:false,message:privateMarker}},
    budget:{total_seconds:3600,elapsed_seconds:76.359,remaining_seconds:3523.641,stages:[{name:'lyria_generate',outcome:'ok',timeout_seconds:2645.98,remaining_at_start_seconds:3599.98,elapsed_seconds:18.892}],source_detail:privateMarker},
    rights:{commercial_use:true,sync:true,copyright_warranted:false,basis:privateMarker}};
  const e=details(r,{duration:{on_miss:'regenerate'}}).execution;
  assert.deepEqual(e.durationRegeneration,{state:'reported',requestedPolicy:'regenerate'});assert.equal(e.attempt.retryCount,0);assert.equal(e.shortfall.failedTake,3);assert.equal(e.shortfall.retriedByService,false);
  assert.equal(e.budget.stages[0].elapsedSeconds,18.892);assert.equal(e.rights.copyrightWarranted,false);assert.equal(e.rights.interpretation,'platform-assertion');
  r.duration_regeneration=null;assert.equal(details(r).execution.durationRegeneration.state,'none');
  delete r.duration_regeneration;assert.equal(details(r).execution.durationRegeneration.state,'unavailable');
  assert.ok(!JSON.stringify(e).includes(privateMarker));
});

test('the saved September05 envelope reaches the same public projection without exposing private input', async () => {
  const saved=JSON.parse(await readFile(new URL('../../docs/api/_captures/2026-09-05-job-cmtot1xn-sung-envelope.json',import.meta.url),'utf8'));
  const before=JSON.stringify(saved),d=details(saved),encoded=JSON.stringify(d);
  assert.equal(d.routing.model,'lyria-3-pro-preview');assert.equal(d.routing.modelMatches,true);assert.equal(d.seed.sentToModel,false);
  assert.equal(d.processing[0].conform.action,'refuse_pad');assert.equal(d.processing[0].finalProbe.durationSeconds,132.389);
  assert.equal(d.provenance.c2pa.state,'legacy-intent-only');assert.equal(d.analysis.meter.state,'NOT_RUN');
  assert.equal(d.analysis.outputs.sampleRate,44100,'A historical upstream discrepancy is retained, not overwritten by the final probe.');
  assert.equal(d.processing[0].finalProbe.sampleRate,48000);
  for(const text of ['https://','gs://','/tmp/','auth','key_id','account_id','prompt_sent','PRIVATE_'])assert.ok(!encoded.includes(text),text);
  assert.equal(JSON.stringify(saved),before);
});

test('unknown, inherited and accessor values cannot create facts or leak private details', () => {
  let getters=0;const getter={};Object.defineProperty(getter,'model',{get(){getters++;throw new Error('Must not execute');}});
  const inherited=Object.create({language_capability:{code:'en',accepted:true},seed:{value:1,sent_to_model:true},compliance:{c2pa:{state:'signed'}}});
  inherited.route=getter;const d=details(inherited);
  assert.equal(getters,0);assert.equal(d.routing.model,null);assert.equal(d.seed,null);assert.equal(d.provenance,null);
  assert.equal(details(null),null);
  const malicious={route:{model:privateMarker,delegate_reported:{model:privateMarker,surface:privateMarker}},language_capability:{code:privateMarker,generation:privateMarker,bar:privateMarker},
    seed:{value:Infinity,sent_to_model:1,source:privateMarker},compliance:{c2pa:{state:privateMarker,trust:privateMarker,manifest_assertions:[privateMarker]},synthid:{state:privateMarker}},measured:{key_estimated:{state:privateMarker,key_estimated:privateMarker,analysis:{distribution:{[privateMarker]:1}}}},render_plan:{stages:{master:{verification:{integrated_lufs:'-Infinity',true_peak_dbtp:-999}},export:{measured:{channels:Infinity,codec:privateMarker}}}}};
  const m=details(malicious);assert.equal(m.routing.model,null);assert.equal(m.processing[0].master.integratedLufs,null);assert.equal(m.processing[0].export.measured.codec,null);
  assert.ok(!JSON.stringify(m).includes(privateMarker));
});

test('large nested arrays are bounded and truncation remains explicit', () => {
  const r={tracks:Array.from({length:500},(_,i)=>({take:i%31+2,render_plan:{executed:true}})),
    mix_plan:{layers:Array.from({length:500},()=>({role:privateMarker})),refusals:Array.from({length:500},()=>({role:'LEAD_VOCAL',refused:true,reason:privateMarker}))},
    budget:{stages:Array.from({length:500},()=>({name:'lyria_generate',outcome:'ok',elapsed_seconds:Infinity}))},
    compliance:{c2pa:{state:'signed',validation_codes:{failure:Array.from({length:500},()=>privateMarker)}}}};
  const d=details(r);
  assert.ok(d.processing.length<=32);assert.equal(d.mix.layers.length,32);assert.equal(d.mix.refusals.length,32);assert.equal(d.mix.truncated,true);
  assert.equal(d.execution.budget.stages.length,64);assert.equal(d.execution.budget.truncated,true);assert.equal(d.execution.budget.stages[0].elapsedSeconds,null);
  assert.equal(d.provenance.c2pa.validationCodesTruncated,true);assert.ok(JSON.stringify(d).length<50000);assert.ok(!JSON.stringify(d).includes(privateMarker));
});

test('current saved learned-estimator shape preserves test risk and unlabelled probability indices',()=>{
  const r={measured:{key_estimated:{state:'MEASURED',key_estimated:'C|major',kappa:0.7,theta:0.3,
    bar:{status:'CALIBRATED',theta:0.3,held_out:{n:100,accepted:70,coverage:0.7,test_risk:0.1,errors:7}},
    analysis:{confidence:{max_prob:0.8,margin_top1_top2:0.7,neg_entropy:-1.1},distribution:Array.from({length:24},(_,i)=>i===0?0.8:0.2/23)}},
    time_signature_estimated:{state:'MEASURED',value:'4/4',analysis:{beats:282,downbeats:71,bars:70,beats_per_bar_histogram:{4:70},features:{mode_fraction:1,margin_mode_second:1,n_bars:70,beat_regularity_cv:0.01,downbeat_regularity_cv:0.03}}}}};
  const a=details(r).analysis;
  assert.equal(a.key.calibration.heldOut.risk,0.1);assert.equal(a.key.calibration.heldOut.errors,7);
  assert.equal(a.key.distributionFormat,'indexed-unlabelled');assert.equal(a.key.distribution.length,24);
  assert.deepEqual(a.key.distribution[0],{index:0,key:null,value:0.8});assert.equal(a.key.confidence.negativeEntropy,-1.1);
  assert.equal(a.meter.analysis.features.bars,70);assert.equal(a.meter.analysis.features.beatRegularityCv,0.01);
  r.measured.key_estimated.analysis.distribution=Array.from({length:500},()=>privateMarker);
  const guarded=details(r).analysis.key;
  assert.equal(guarded.distribution.length,24);assert.equal(guarded.distributionTruncated,true);assert.ok(guarded.distribution.every(row=>row.value===null));
});

test('the real Store publicJob includes details from its private envelope with the existing ownership boundary',()=>{
  const store=new Store(':memory:');
  try{
    const {job}=store.admit({owner:'result-details-owner',ipKey:'result-details-ip',idem:'result-details-fixture',payload:{prompt:'A contract test',vocal:{language:'tr',language_policy:'measure'}},limits:{daily:100,owner:20,ip:20}});
    store.updateJob(job.id,{status:'ready',result:{success:true,route:{model:'lyria-3-pro-preview',why:privateMarker,delegate_reported:{surface:'interactions',model:'lyria-3-pro-preview'}},
      language_fallback:null,language_capability:{code:'tr',accepted:true,bar:'NOT_CALIBRATED',singing:'ENGINEERING_PATH_ESTABLISHED'},auth:{key_id:privateMarker},prompt_sent:privateMarker}});
    const publicJob=store.publicJob(store.ownJob(job.id,'result-details-owner'));
    assert.equal(publicJob.summary.details.routing.modelMatches,true);assert.equal(publicJob.summary.details.language.capability.calibration,'NOT_CALIBRATED');
    assert.ok(!JSON.stringify(publicJob).includes(privateMarker));
    assert.throws(()=>store.ownJob(job.id,'another-owner'),{status:404});
  }finally{store.close();}
});
