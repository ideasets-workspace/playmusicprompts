import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {once} from 'node:events';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import vm from 'node:vm';
import {projectPreview} from '../server/previews.mjs';
import {createApplication} from '../server/http.mjs';
import {Store} from '../server/store.mjs';

// Local response fixtures only: no upstream calls or audio generation. The
// HTTP test exercises the real BFF projection, then the actual UI renderer.
const caps=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json',import.meta.url),'utf8'));
const source=readFileSync(new URL('../public/request-preview.js',import.meta.url),'utf8');
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
function renderer(){
  let shown;
  const window={PMP:{esc,dialog:(title,html)=>{shown={title,html};}},PMPControls:{schema:{parameters:[]},label:n=>n.key}};
  vm.runInNewContext(source,{window,Intl});
  return {show:value=>{window.PMPPreview.show(value);return shown;}};
}
function plan(){return {success:true,dry_run:true,prompt_sent:'A gentle <chorus>',request_parameters_received:['prompt','dry_run','mastering','stems','vocal'],
  generation_payload:{takes:1,instrumental_only:false},route:{model:'lyria-3-pro-preview'},bindings:{prompt:{sent:'A gentle <chorus>',sent_to_model:false}},
  render_settings:{quality:'ultra',export:'wav24_48k',conform:{target_seconds:30,tolerance_seconds:0,on_miss:'regenerate',tempo_bpm:92,time_signature:'3/4'},
    master:{target:'streaming',loudness_lufs:-14,true_peak_db:-1,normalize_output:false,mix_dynamic_range_requested_lu:0},
    post_edits:{fade_in_seconds:0,fade_out_seconds:2.5,channel_layout:'stereo'},stems:{requested:['master','vocals','drums'],separated_requested:['vocals','drums'],separator_calls:1}},
  language_capability:{code:'en',accepted:true,generation:'PROMPT_LANGUAGE',transcription:'GEMINI_DOCUMENTED',intelligibility_gate:'PHONEMISER_AVAILABLE',bar:'CALIBRATED',singing:'SINGING_PROVEN',speech:'PENDING_MEASUREMENT'},
  language_fallback:{requested:'tr',requested_state:'ENGINEERING_PATH_ESTABLISHED',delivered:'en',reason:'Private provider rationale'}};}

test('preview details: documented resolved settings and language fallback reach the actual English disclosure renderer',()=>{
  const result=projectPreview(plan(),caps),{html}=renderer().show(result);
  assert.deepEqual(result.details.mastering,{target:'streaming',loudnessLufs:-14,truePeakDb:-1,normalizeOutput:false,dynamicRangeLu:0});
  assert.deepEqual(result.details.conform,{targetSeconds:30,toleranceSeconds:0,onMiss:'regenerate',tempoBpm:92,timeSignature:'3/4'});
  assert.deepEqual(result.details.stems,{requested:['master','vocals','drums'],separatedRequested:['vocals','drums'],separatorCalls:1});
  for(const text of ['Language &amp; voice','Timing &amp; structure','Mastering &amp; sound','Finishing touches','Separate parts','Turkish','English','A language change is planned','-14 LUFS','0 LU','0 seconds','2.5 seconds','Stereo','Master, Vocals, Drums','additional generation','No vocals have been generated'])assert.ok(html.includes(text),text);
  assert.match(html,/<dt>Normalize output<\/dt><dd>No<\/dd>/);
  assert.match(html,/<dt>Instrumental plan<\/dt><dd>No<\/dd>/);
  assert.match(html,/<dt>Planned separation calls<\/dt><dd>1<\/dd>/);
  assert.match(html,/A gentle &lt;chorus&gt;/);assert.doesNotMatch(html,/<chorus>|Private provider rationale/);
  assert.equal(result.musicGenerated,false);
});

test('preview details: absent, explicit empty, false, zero and unrecognized fields stay distinct',()=>{
  const missing=projectPreview({success:true,dry_run:true},caps);
  assert.equal(missing.details.mastering,null);assert.equal(missing.details.stems,null);
  assert.equal(missing.details.language.fallback.state,'unavailable');
  const missingHtml=renderer().show(missing).html;
  assert.match(missingHtml,/<dt>Planned separation calls<\/dt><dd>Not reported<\/dd>/);
  assert.doesNotMatch(missingHtml,/No language change reported|<dd>0 seconds<\/dd>|<dd>No<\/dd>/);
  const raw=plan();raw.language_fallback=null;raw.render_settings.stems={requested:[],separated_requested:[],separator_calls:0};
  raw.language_capability.singing='NEW_UNREVIEWED_STATE';raw.render_settings.master.normalize_output='false';raw.render_settings.master.loudness_lufs='-14';
  const result=projectPreview(raw,caps),html=renderer().show(result).html;
  assert.equal(result.details.language.capability.singing,null);assert.equal(result.details.mastering.normalizeOutput,null);assert.equal(result.details.mastering.loudnessLufs,null);
  assert.match(html,/No language change reported/);assert.match(html,/<dt>Requested parts<\/dt><dd>None<\/dd>/);assert.match(html,/<dt>Planned separation calls<\/dt><dd>0<\/dd>/);
  assert.doesNotMatch(html,/NEW_UNREVIEWED_STATE/);
});

test('preview details: legacy fallback reports a change without inventing its language or disclosing its prose',()=>{
  const raw=plan();raw.language_fallback='Legacy reason with gs://private-bucket/object';delete raw.language_capability;
  const result=projectPreview(raw,caps),html=renderer().show(result).html;
  assert.deepEqual(result.details.language.fallback,{state:'reported',requested:null,planned:null,requestedState:null});
  assert.match(html,/A language change is planned/);assert.match(html,/<dt>Language after fallback<\/dt><dd>Not reported<\/dd>/);
  assert.doesNotMatch(html,/private-bucket|Legacy reason/);
});

test('preview details: reviewed fields cannot carry credentials, storage URLs, arbitrary metadata or inherited getters',()=>{
  const raw=plan(),marker='PRIVATE_UNREVIEWED_VALUE';
  raw.auth={api_key:marker};raw.service={revision:marker};raw.render_settings.master.secret=marker;
  raw.language_capability.sources={url:marker};raw.language_capability.registry_evidence=marker;raw.language_capability.name=marker;
  raw.language_fallback.reason=marker;raw.render_settings.post_edits.path=marker;raw.render_settings.stems.files=[marker];
  raw.language_capability.singing=marker;raw.render_settings.master.target=marker;raw.render_settings.stems.requested=['master',marker];
  raw.route.model=marker;raw.render_settings.quality=marker;raw.render_settings.export=marker;raw.generation_payload.takes=-1;
  raw.prompt_sent='Words https://engine.invalid/private gs://bucket/object pmp_FAKE0123456789012345 Bearer FAKE_AUTH_VALUE';
  raw.bindings.prompt.sent='C:\\private\\audio.wav';raw.render_settings.post_edits=Object.create({fade_in_seconds:10});
  Object.defineProperty(raw.render_settings.master,'true_peak_db',{get(){throw Error('Must not invoke a getter');}});
  const result=projectPreview(raw,caps),serialized=JSON.stringify(result),html=renderer().show(result).html;
  assert.equal(result.details.mastering.truePeakDb,null);assert.equal(result.details.postEdits.fadeInSeconds,null);assert.equal(result.details.stems.requested,null);
  for(const text of [marker,'https://','gs://','pmp_FAKE','FAKE_AUTH_VALUE','C:\\private','<script>']){assert.ok(!serialized.includes(text),text);assert.ok(!html.includes(text),text);}
  assert.match(result.promptSent,/\[address removed\]/);assert.match(result.promptSent,/\[authorization removed\]/);
});

test('preview details: delivery-only envelopes and a delivered UI result cannot be labeled as a preview',()=>{
  for(const key of ['tracks','render_plan','job_id','job','source_take','budget','rights','compliance','takes_delivered'])assert.throws(()=>projectPreview({...plan(),[key]:{}},caps),{code:'PREVIEW_INVALID'});
  assert.throws(()=>renderer().show({...projectPreview(plan(),caps),musicGenerated:true}),/non-generating preview/);
});

test('preview details: actual owner HTTP preview preserves the selected request and exposes resolved settings without a music job',async t=>{
  const store=new Store(':memory:');let sent,calls=0;
  const config={origin:'http://127.0.0.1:1',publicRoot:resolve('public'),stateRoot:tmpdir(),production:false,oidc:null,ads:{enabled:false},consent:{enabled:false},dailyAdmissionLimit:100,guestDailyLimit:100,ipDailyLimit:100,webhookUrl:null};
  const app=createApplication({config,store,engine:{capabilities:async()=>caps,submit:async payload=>{sent=structuredClone(payload);calls++;return plan();}},media:{},jobs:{wake(){assert.fail('Preview must not wake music generation');}}});
  app.server.listen(0,'127.0.0.1');await once(app.server,'listening');config.origin='http://127.0.0.1:'+app.server.address().port;
  t.after(async()=>{app.server.closeAllConnections();await new Promise(resolve=>app.server.close(resolve));store.close();});
  const sessionResponse=await fetch(config.origin+'/api/session'),session=await sessionResponse.json(),cookie=sessionResponse.headers.get('set-cookie').split(';')[0];
  const payload={prompt:'Local selected brief',dry_run:true,async:true,mastering:{target:'streaming',true_peak_db:-1},stems:['master','vocals']};
  const response=await fetch(config.origin+'/api/previews',{method:'POST',headers:{cookie,origin:config.origin,'content-type':'application/json','x-csrf-token':session.csrf,'idempotency-key':'preview-detail-fixture'},body:JSON.stringify(payload)});
  assert.equal(response.status,200);const result=await response.json();
  assert.deepEqual(sent,payload);assert.equal(calls,1);assert.equal(store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,0);
  assert.equal(result.details.mastering.loudnessLufs,-14);assert.match(renderer().show(result).html,/-14 LUFS/);
  assert.equal(result.musicGenerated,false);
});
