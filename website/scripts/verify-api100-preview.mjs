// Exactly one non-generating compilation request. Never a paid smoke runner.
// Existing receipt prevents accidental repeats, including after uncertain failure.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {appRoot,loadConfig} from '../server/config.mjs';
const config=loadConfig();
assert.equal(config.production,false,'This bounded verification is local only.');
const inputPath=resolve(appRoot,'../docs/implementation/2026-09-12-website-api/parameter-gap-audit.json');
const payload=JSON.parse(await readFile(inputPath,'utf8')).dry_run_candidate.payload;
assert.equal(Object.keys(payload).length,100);
assert.equal(payload.dry_run,true);assert.equal(payload.capabilities,false);
assert.equal(payload.prompt_enhance.enabled,false);
assert.ok(payload.references.every(item=>item.kind==='descriptor'));
assert.equal(new URL(payload.webhook_url).hostname,'pmp-validation.invalid');
const privateDir=resolve(config.stateRoot,'verification');await mkdir(privateDir,{recursive:true});
const receiptPath=resolve(privateDir,'api100-preview-receipt.json');
const idem='api100-preview-20260912-v1';
let result,httpStatus;
if(process.argv.includes('--read-existing')){
  // Reconcile already-received evidence; this branch performs NO HTTP request.
  const existingDb=new DatabaseSync(resolve(config.stateRoot,'website.sqlite'),{readOnly:true});
  const prior=existingDb.prepare('SELECT id,state FROM request_previews WHERE idem=?').all(idem);existingDb.close();
  assert.equal(prior.length,1);assert.equal(prior[0].state,'complete');
  result={id:prior[0].id,kind:'request-preview',musicGenerated:false};httpStatus=200;
}else{
await writeFile(receiptPath,JSON.stringify({status:'reserved',idempotencyKey:idem,time:new Date().toISOString()},null,2),{flag:'wx',mode:0o600});
const client=await fetch(config.origin+'/api/session');assert.equal(client.status,200);
const cookie=client.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);
const session=await client.json();
await writeFile(receiptPath,JSON.stringify({status:'sending',idempotencyKey:idem,time:new Date().toISOString()},null,2),{mode:0o600});
const response=await fetch(config.origin+'/api/previews',{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie,Origin:config.origin,'X-CSRF-Token':session.csrf,'Idempotency-Key':idem},body:JSON.stringify(payload),signal:AbortSignal.timeout(360000)});
result=await response.json();httpStatus=response.status;
if(!response.ok){await writeFile(receiptPath,JSON.stringify({status:'failed',httpStatus:response.status,errorCode:result.error?.code,time:new Date().toISOString()},null,2));throw Error(`Preview failed: HTTP ${response.status}, ${result.error?.code}. Inspect the private record; do not automatically resend.`);}
}
assert.equal(result.kind,'request-preview');assert.equal(result.musicGenerated,false);
const db=new DatabaseSync(resolve(config.stateRoot,'website.sqlite'),{readOnly:true});
const row=db.prepare('SELECT response,payload,state FROM request_previews WHERE id=?').get(result.id);db.close();
assert.equal(row.state,'complete');
const raw=JSON.parse(row.response),wire=JSON.parse(row.payload);
assert.deepEqual(wire,payload);assert.equal(raw.dry_run,true);
// Current measured API consumes dry_run before listing received parameters.
// Its explicit true envelope flag proves that mode separately; don't invent a
// 100th received-list entry or repeat the request because of a documentation gap.
assert.deepEqual([...raw.request_parameters_received].sort(),Object.keys(payload).filter(key=>key!=='dry_run').sort());
for(const key of ['tracks','render_plan','job_id','budget','takes_delivered','rights','compliance'])assert.equal(Object.hasOwn(raw,key),false,`Dry run unexpectedly returned ${key}`);
const perParameter=Object.keys(payload).map(parameter=>({parameter,sent:true,listedAsReceived:raw.request_parameters_received.includes(parameter),modeConfirmed:parameter==='dry_run'?raw.dry_run===true:null,bindingRecorded:Object.hasOwn(raw.bindings||{},parameter)}));
const evidence={verifiedAt:new Date().toISOString(),kind:'actual-api-compile-only',httpStatus,parameterCount:100,receivedCount:raw.request_parameters_received.length,dryRunConfirmed:raw.dry_run===true,bindingCount:perParameter.filter(p=>p.bindingRecorded).length,perParameter,
  plan:{model:raw.route?.model,takes:raw.generation_payload?.takes,instrumentalOnly:raw.generation_payload?.instrumental_only,
    quality:raw.render_settings?.quality,targetSeconds:raw.render_settings?.conform?.target_seconds,toleranceSeconds:raw.render_settings?.conform?.tolerance_seconds,
    onMiss:raw.render_settings?.conform?.on_miss,loudnessTargetLufs:raw.render_settings?.master?.loudness_lufs,truePeakTargetDb:raw.render_settings?.master?.true_peak_db,
    dynamicRangeRequestedLu:raw.render_settings?.master?.mix_dynamic_range_requested_lu,export:raw.render_settings?.export,
    fadeInSeconds:raw.render_settings?.post_edits?.fade_in_seconds,fadeOutSeconds:raw.render_settings?.post_edits?.fade_out_seconds,channelLayout:raw.render_settings?.post_edits?.channel_layout,
    requestedStems:raw.render_settings?.stems?.requested},
  bindingKinds:Object.fromEntries(Object.keys(payload).map(key=>[key,['prose','typed','compiled','our_stage','echo'].includes(raw.bindings?.[key]?.binding)?raw.bindings[key].binding:'other'])),
  exactPayloadPreserved:true,noDeliveredAudioEnvelope:true,intentionalMusicGenerations:0,upstreamRequestId:raw.request_id,serviceRevision:raw.service?.revision,
  payloadSha256:createHash('sha256').update(row.payload).digest('hex'),
  limitations:['Compilation and acceptance are measured. This does not prove every musical choice was audibly realized.','The received-parameter list contains99 keys and omits dry_run; that mode is confirmed separately by the response. docs/api/06 currently describes this list as every sent key.','The one preview consumes API request quota; it is not an additional music-generation smoke.','This request exercises descriptor references, not audio/MIDI reference import or a real webhook receiver.']};
const outputPath=resolve(appRoot,'../docs/implementation/2026-09-12-website-api/api100-live-preview.json');await writeFile(outputPath,JSON.stringify(evidence,null,2)+'\n');
await writeFile(receiptPath,JSON.stringify({status:'complete',idempotencyKey:idem,previewId:result.id,time:new Date().toISOString()},null,2));
console.log(JSON.stringify({httpStatus,sentParameters:100,receivedListParameters:evidence.receivedCount,dryRunConfirmed:true,bindingRecords:evidence.bindingCount,musicGenerated:false,evidence:outputPath}));
