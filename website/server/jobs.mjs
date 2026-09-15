import {problem} from './store.mjs';
import {contentSafety,serviceQuota} from './failure-details.mjs';

// Refused[] is prose in docs/api/07, not a structured field-error schema. Only
// these reviewed paths from the 2026-09-12 capabilities may cross the boundary.
const FAILURE_PATHS = new Set(`adlibs arrangement_ai arrangement_density async backing_vocals bass_style capabilities channel_layout chord_progression click_track client_side_echo controls controls.harmony_complexity controls.rhythm_density controls.sonic_polish countin creative_goal cultural_style dry_run duration duration.on_miss duration.target_seconds duration.tolerance_seconds dynamics_shape energy_curve energy_curve.points energy_curve.points[] energy_curve.points[].t energy_curve.points[].v energy_curve.preset eras eras[] export fade_in_seconds fade_out_seconds genres genres[] groove_feel harmonic_palette hook_placement instrumentation_notes instruments instruments[] intro_style key key_change labels loop_ready lyrics lyrics.language lyrics.mode lyrics.script lyrics.text lyrics.theme lyrics.verify lyrics_language_per_line lyrics_measurement_domain lyrics_orthography_route lyrics_structure lyrics_threshold_override lyrics_verify_metric master_style mastering mastering.loudness_lufs mastering.target mastering.true_peak_db melisma melodic_character mix_brightness mix_compression mix_dynamic_range mix_low_end mix_saturation mix_stereo_width mix_vocal_prominence mood_orbit mood_orbit.axes mood_orbit.axes.aggressive mood_orbit.axes.dark mood_orbit.axes.epic mood_orbit.axes.hopeful mood_orbit.axes.melancholic mood_orbit.axes.uplifting mood_progression moods moods[] negative_prompt negative_prompt[] normalize_output output_package outro_style percussion_style production_era project project.name project.version_note prompt prompt_blocks prompt_blocks[] prompt_blocks[].role prompt_blocks[].text prompt_blocks[].weight prompt_enhance prompt_enhance.enabled prompt_enhance.style quality reference_artist_style reference_tempo_source references references[] references[].kind references[].text references[].url rhythmic_feel route run_originality_gate seed solo_instrument song_title_in_lyrics sonic_tags sonic_tags[] sound_fx sound_fx[] spatial_ambience stems stems[] structure structure[] structure[].bars structure[].section syllable_stress target_use tempo_bpm tempo_feel tension_curve texture_layers texture_layers[] time_signature transitions transitions[] variation_count vibrato vocal vocal.language vocal.language_policy vocal.mode vocal_accent vocal_effects vocal_effects[] vocal_emotion vocal_emotion[] vocal_intensity vocal_layering vocal_pronunciation vocal_register vocal_style webhook_url`.split(' '));
const FAILURE_MESSAGES = {
  INVALID_REQUEST:'Review the selected settings before creating again.',
  LANGUAGE_NOT_PROVEN:'Choose a supported vocal language or change Vocal language policy to allow a recorded fallback.',
  CONTENT_REFUSED:'Review your prompt and lyrics against the content guidelines before creating again.',
  VENDOR_CONTENT_BLOCKED:'The music provider declined this request. Review your prompt before choosing whether to create again.',
  GENERATION_FAILED:'The music service could not complete this creation. Your existing takes and job record remain saved.',
  MEASUREMENT_FAILED:'The service could not verify this delivery. Your job record remains saved.',
  RENDER_FAILED:'The service generated audio but could not prepare the requested delivery. Your result record remains saved; generating again is a separate request.',
  CONFIG_ERROR:'The music service connection needs attention.',INTERNAL_ERROR:'The music service encountered an error. Your job record remains saved.',
  BUDGET_EXHAUSTED:'The music service could not finish within its processing budget. Review the request length before trying again.',
  UNAUTHENTICATED:'The music service connection needs attention.',FORBIDDEN_SCOPE:'The music service connection needs attention.',
  RATE_LIMITED:'The music service request limit has been reached. Please try again later.',
  ENGINE_TIMEOUT:'The music service did not respond in time. Your request will not be submitted again automatically.',
  ENGINE_CONNECTION_ERROR:'The music service connection was interrupted. Your request will not be submitted again automatically.',
  ENGINE_RESPONSE_INVALID:'The music service returned an unreadable result. Your request will not be submitted again automatically.',
  ENGINE_UPSTREAM_ERROR:'The music service could not complete this request. Your job record remains saved.',
  SERVICE_UNAVAILABLE:'Your music could not be completed. Your brief and job record remain saved.'
};
const own=(object,key)=>object&&typeof object==='object'&&!Array.isArray(object)&&Object.hasOwn(object,key)?object[key]:undefined;
const safeCode=(value,fallback='SERVICE_UNAVAILABLE')=>typeof value==='string'&&Object.hasOwn(FAILURE_MESSAGES,value)?value:fallback;
function fieldIssue(path,reason){
  let code='REVIEW_SETTING',message='Review this setting against its available options and range.';
  if(/^required\b/i.test(reason)){code='REQUIRED';message='Enter this setting before creating again.';}
  else if(/\bnot active\b/i.test(reason)){code='INACTIVE_FIELD';message=path==='variation_count'?'Choose Variations in Output package before setting a variation count.':'Enable the related option before using this setting.';}
  else if(/\bnot in allowed set\b|\bnot allowed\b/i.test(reason)){code='ENUM';message='Choose an available option for this setting.';}
  else if(/<\s*min\b|>\s*max\b/i.test(reason)){code='RANGE';message='Use a value within the range shown for this setting.';}
  return {path,code,message};
}

export function publicFailure(error){
  const body=own(error,'upstreamBody'),code=safeCode(own(body,'error_code'),safeCode(own(error,'code')));
  const refused=own(body,'refused'),fields=[],seen=new Set();
  let omittedDetails=0;
  if(Array.isArray(refused))for(const entry of refused.slice(0,32)){
    const match=typeof entry==='string'&&entry.length<=4096?/^([a-z][a-z0-9_]*(?:(?:\[(?:\d{1,2})?\])|(?:\.[a-z][a-z0-9_]*))*)\s*:\s*([\s\S]*)$/.exec(entry):null;
    const normalized=match?.[1].replace(/\[\d{1,2}\]/g,'[]');
    if(!match||!FAILURE_PATHS.has(normalized)){omittedDetails++;continue;}
    if(!seen.has(match[1])){seen.add(match[1]);fields.push(fieldIssue(match[1],match[2]));}
  }
  if(Array.isArray(refused)&&refused.length>32)omittedDetails+=refused.length-32;
  // LANGUAGE_NOT_PROVEN itself names these two controls in the documented
  // error catalogue; this fallback does not guess which free text was rejected.
  if(code==='LANGUAGE_NOT_PROVEN')for(const path of ['vocal.language','vocal.language_policy'])if(!seen.has(path)){
    seen.add(path);fields.push({path,code:'LANGUAGE_NOT_PROVEN',message:path==='vocal.language'?'Choose a language with the required measured support.':'Allow a recorded fallback with Prefer proven, or select a language that satisfies Strict.'});
  }
  let message=FAILURE_MESSAGES[code];
  if(code==='INVALID_REQUEST'&&fields.length)message=`Review ${fields.map(field=>field.path).join(', ')} before creating again.`;
  if(code==='CONTENT_REFUSED'&&own(own(body,'content_safety'),'instrument_failure')===true)message='The service could not complete its content check. Your text has not been judged by that check.';
  const content=code==='CONTENT_REFUSED'?contentSafety(own(body,'content_safety')):null;
  const quota=serviceQuota(own(own(body,'auth'),'limit'));
  return {code,message,fields,omittedDetails,...(content?{contentSafety:content}:{}),...(quota?{quota}:{})};
}

const POLL_DELAYS=[5000,8000,12000,20000,30000];
const upstreamJobId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,160}$/.test(id);
export function createJobs({store,engine,media,onError=()=>{},onAdmission=()=>{},deliveryReady=async()=>{},now=Date.now}){
  if(typeof now!=='function')throw new TypeError('A job clock is required.');
  store.db.exec(`CREATE TABLE IF NOT EXISTS generation_job_polls (
    job_id TEXT PRIMARY KEY REFERENCES jobs(id),state TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,
    failures INTEGER NOT NULL DEFAULT 0,next_poll_at INTEGER,response TEXT,error TEXT,http_status INTEGER,updated INTEGER NOT NULL);`);
  // Main acquires the application instance lock before constructing workers.
  // A GET may be resumed after restart; a generation POST is never replayed.
  store.db.prepare("UPDATE generation_job_polls SET state='active',next_poll_at=?,updated=? WHERE state='running'").run(now(),now());
  let running=false,stopped=false,timer;
  const notice=(jobId,code)=>{try{onError({jobId,code});}catch{/* Reporting cannot change a durable outcome. */}};
  const pollRow=id=>store.db.prepare('SELECT * FROM generation_job_polls WHERE job_id=?').get(id);
  function ensurePoll(id){store.db.prepare("INSERT OR IGNORE INTO generation_job_polls(job_id,state,next_poll_at,updated) VALUES (?,'active',?,?)").run(id,now(),now());return pollRow(id);}
  function retryStatus({id,owner}){
    return store.transaction(()=>{
      const job=store.ownJob(id,owner);
      if(job.status!=='uncertain'||!upstreamJobId(job.upstream_id))throw problem(409,'STATUS_NOT_RETRYABLE','This creation does not have an unconfirmed saved status to check.');
      ensurePoll(id);
      store.db.prepare("UPDATE generation_job_polls SET state='active',failures=0,next_poll_at=?,updated=? WHERE job_id=?").run(now(),now(),id);
      store.updateJob(id,{status:'pending',error:null});return store.job(id);
    });
  }
  // Called only by the authenticated callback receiver after durable identity
  // correlation. The callback is a notification; the GET remains authoritative.
  function notifyCompletion({jobId,upstreamId,requestId}){
    if(!upstreamJobId(upstreamId)||!upstreamJobId(requestId))return false;
    const accepted=store.transaction(()=>{
      const job=store.job(jobId);
      if(!job||job.upstream_id!==upstreamId||!['pending','uncertain'].includes(job.status))return false;
      const current=ensurePoll(jobId);
      // Do not replace a GET already in flight or a confirmed terminal receipt.
      if(current.state==='running'||current.state==='complete')return false;
      store.db.prepare("UPDATE generation_job_polls SET state='active',failures=0,next_poll_at=?,updated=? WHERE job_id=?").run(now(),now(),jobId);
      if(job.status==='uncertain')store.updateJob(jobId,{status:'pending',error:null});
      return true;
    });
    if(accepted){clearTimeout(timer);tick();}return accepted;
  }
  function recordPollError(job,error,response){
    const current=pollRow(job.id),status=Number.isInteger(error?.upstreamStatus)?error.upstreamStatus:null;
    const permanent=[401,403,404].includes(status)||error?.code==='JOB_STATUS_ID_INVALID';
    const failures=current.failures+1;
    let delay=POLL_DELAYS[Math.min(failures-1,POLL_DELAYS.length-1)];
    const raw=response??error?.upstreamBody;
    if(status===429){
      const limit=own(own(raw,'auth'),'limit')??own(raw,'limit');
      const seconds=own(limit,'reset_seconds');
      if(typeof seconds==='number'&&Number.isFinite(seconds)&&seconds>0&&seconds<=86400)delay=Math.max(delay,Math.ceil(seconds*1000));
      if(own(limit,'resets')==='next UTC day'){const time=new Date(now());delay=Math.max(delay,Date.UTC(time.getUTCFullYear(),time.getUTCMonth(),time.getUTCDate()+1)-now());}
    }
    const next=permanent?null:now()+delay;
    const code=status===404?'JOB_STATUS_NOT_FOUND':[401,403].includes(status)?'JOB_STATUS_ACCESS_UNAVAILABLE':error?.code==='JOB_STATUS_ID_INVALID'?'JOB_STATUS_ID_INVALID':'JOB_STATUS_UNAVAILABLE';
    const message=status===404?'The music service could not find this saved job. Its generation outcome is unconfirmed. Check status explicitly after the service is available; no new generation will be submitted.':
      [401,403].includes(status)?'The music service could not authorize this status check. Your generation outcome is unconfirmed. Restore the connection, then check status; no new generation will be submitted.':
      permanent?'This saved job has an invalid status identifier. Its generation outcome is unconfirmed; no new generation will be submitted.':
      'The latest music-service status could not be confirmed. Your last confirmed state is saved; status checks will resume automatically without generating again.';
    store.transaction(()=>{
      store.db.prepare('UPDATE generation_job_polls SET state=?,failures=?,next_poll_at=?,error=?,http_status=?,updated=? WHERE job_id=?')
        .run(permanent?'paused':'active',failures,next,JSON.stringify({code:error?.code??null,message:error?.message??null,body:raw??null}),status,now(),job.id);
      store.updateJob(job.id,{...(permanent?{status:'uncertain'}:{}),error:{code,message,statusCheck:{state:permanent?'paused':'retrying',nextCheckAt:next,attempts:current.attempts,httpStatus:status}}});
    });
    notice(job.id,code);
  }
  async function poll(job){
    const row=ensurePoll(job.id);
    if(row.state!=='active'||row.next_poll_at>now())return;
    const claim=store.db.prepare("UPDATE generation_job_polls SET state='running',attempts=attempts+1,updated=? WHERE job_id=? AND state='active' AND next_poll_at<=?").run(now(),job.id,now());
    if(claim.changes!==1)return;
    if(!upstreamJobId(job.upstream_id)){recordPollError(job,{code:'JOB_STATUS_ID_INVALID'});return;}
    let response;
    try{response=await engine.job(job.upstream_id);}
    catch(error){recordPollError(job,error);return;}
    if(!response||response.success!==true||!['queued','processing','complete','failed'].includes(response.status)
      ||(response.status==='complete'&&(!response.response||typeof response.response!=='object'||Array.isArray(response.response)))){
      recordPollError(job,{code:'JOB_STATUS_RESPONSE_INVALID'},response);return;
    }
    const terminal=['complete','failed'].includes(response.status);
    store.transaction(()=>{
      // Keep the last private failure for diagnosis after recovery; failures=0
      // and the job's public error=null identify the current healthy check.
      store.db.prepare('UPDATE generation_job_polls SET state=?,failures=0,next_poll_at=?,response=?,http_status=200,updated=? WHERE job_id=?')
        .run(terminal?'complete':'active',terminal?null:now()+POLL_DELAYS[0],JSON.stringify(response),now(),job.id);
      // An actual good poll clears an earlier transport notice, even when the
      // upstream worker's reported queued/processing state did not change.
      if(!terminal)store.updateJob(job.id,{result:response,error:null});
      // A process may stop immediately after this commit. Both records must
      // already agree: restart resumes owned-media ingestion without polling or
      // generating again, and a completed failure remains a completed failure.
      else if(response.status==='complete')store.updateJob(job.id,{status:'ingesting',result:response.response,error:null});
      else store.updateJob(job.id,{status:'failed',result:response,error:publicFailure({code:'GENERATION_FAILED',upstreamBody:response.error})});
    });
    if(response.status==='complete'){await ingest(job,response.response);return;}
  }
  async function ingest(job,result){
    store.updateJob(job.id,{status:'ingesting',result,error:null});
    store.registerOriginality(job.id);
    const manifest=await media.ingest(job.id,result);
    store.publish(store.job(job.id),manifest);
    const hasTracks=store.db.prepare('SELECT 1 FROM tracks WHERE job_id=? LIMIT 1').get(job.id)!==undefined;
    const processingUnavailable=manifest.takes?.some(take=>take.errors?.some(error=>error.code==='MISSING_TOOLS'));
    store.updateJob(job.id,{status:manifest.status==='ready'?'ready':hasTracks?'partial':'ingest_failed',error:manifest.status==='ready'?null:{code:processingUnavailable?'DELIVERY_UNAVAILABLE':'INGEST_PARTIAL',message:processingUnavailable?'Your song was created. Saving is paused because our audio processing service is unavailable. Your generation record is saved so delivery can be retried without creating another song.':hasTracks?'Some takes are ready. Other outputs are still stored with their delivery status.':'Your song was created. Saving did not finish. Check delivery to resume saving the same song.'}});
  }
  async function process(job){
    if(job.status==='queued'){
      try{await deliveryReady();}catch{store.updateJob(job.id,{error:{code:'DELIVERY_UNAVAILABLE',message:'Waiting for song delivery to recover. No music request has been sent yet.'}});return;}
      if(!store.claimSubmission(job.id))return;
      let response;
      try{response=await engine.submit(JSON.parse(job.payload));}
      catch(e){store.updateJob(job.id,{status:e.uncertain?'uncertain':'failed',result:e.upstreamBody,error:publicFailure(e)});return;}
      const upstreamId=response.job_id??response.job?.job_id;
      if(upstreamId){store.updateJob(job.id,{status:'pending',upstreamId,result:response,error:null});try{onAdmission(store.job(job.id));}catch{notice(job.id,'CALLBACK_BINDING_UNAVAILABLE');}return;}
      if(response.success&& (response.tracks||response.render_plan)){await ingest(job,response);return;}
      store.updateJob(job.id,{status:'uncertain',result:response,error:{code:'ADMISSION_UNCERTAIN',message:'The generation service returned an unexpected admission record. This request will not be repeated automatically.'}});return;
    }
    if(job.status==='ingesting'&&job.result){await ingest(job,JSON.parse(job.result));return;}
    if(job.status==='pending'&&job.upstream_id){
      await poll(job);
    }
  }
  async function tick(){
    if(running||stopped)return;running=true;
    try{
      // Upgrade already-delivered jobs from their owned private manifests. This
      // reads local metadata only: no source download, transcode, or generation.
      if(typeof media.read==='function')for(const job of store.jobsMissingMediaSummary()){
        if(stopped)break;try{store.recordMediaSummary(job,await media.read(job.id));}catch{onError({jobId:job.id,code:'MEDIA_SUMMARY_UNAVAILABLE'});}
      }
      for(const job of store.activeJobs()){if(stopped)break;try{await process(job);}catch(e){store.updateJob(job.id,{status:'ingest_failed',error:{code:safeCode(e.code,'INGEST_FAILED'),message:'Your generated result is saved. Transfer or listening preparation needs another attempt.'}});onError({jobId:job.id,code:safeCode(e.code,'JOB_PROCESSING_FAILED')});}}
    }
    finally{running=false;if(!stopped)timer=setTimeout(tick,5000);}
  }
  return {retryStatus,notifyCompletion,start(){stopped=false;tick();},wake(){clearTimeout(timer);tick();},stop(){stopped=true;clearTimeout(timer);},get running(){return running;}};
}
