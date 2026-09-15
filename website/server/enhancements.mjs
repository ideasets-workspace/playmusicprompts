import {randomUUID} from 'node:crypto';
import {problem,sha,stable} from './store.mjs';
import {validateRequest,ValidationError} from './validation.mjs';
import {publicFailure} from './jobs.mjs';
import {ENHANCEMENT_DAILY_CEILING,ADMISSION_DAY_MS} from './admission-limits.mjs';

const own=(value,key)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.hasOwn(value,key)?value[key]:undefined;
const plain=value=>value&&typeof value==='object'&&!Array.isArray(value)&&[Object.prototype,null].includes(Object.getPrototypeOf(value));
const uncertainCodes=new Set(['ENGINE_TIMEOUT','ENGINE_CONNECTION_ERROR','ENGINE_RESPONSE_INVALID','ENHANCE_TIMEOUT']);
const messages={
  ENHANCE_INVALID:'The service did not return a verified enhanced prompt. Your original draft is unchanged.',
  ENHANCE_NOT_REWRITTEN:'The service did not rewrite this prompt. Your original draft is unchanged.',
  ENHANCE_CHECK_FAILED:'Enhance did not preserve every required term. Your original draft is unchanged.',
  ENHANCE_TIMEOUT:'The enhancement response was not confirmed in time. Your original draft is saved; this operation will not be repeated automatically.',
  ENHANCE_INTERRUPTED:'The enhancement was interrupted after submission began. Its outcome is unknown; it will not be repeated automatically.',
  ENHANCE_MODE_INVALID:'This saved operation is not a valid enhancement request. It has not been submitted.',
};
const localError=code=>problem(502,code,messages[code]);

// Only musical intent belongs in the enhancer's input. Rendering/transport,
// request IDs, account labels, verification policy and lyric text stay in their
// original typed fields. In the observed 2026-09-12 rewrite, supplying those
// typed sound fields alone did not preserve the selected musical direction.
// Explicit prompt context supplies that direction to the rewrite input; the
// returned prose still requires semantic review, beyond this input projection.
const SOUND_KEYS=new Set(`creative_goal negative_prompt genres eras moods prompt_blocks tempo_bpm key time_signature duration structure energy_curve instruments sonic_tags mood_orbit vocal lyrics references controls vocal_style vocal_register vocal_effects backing_vocals adlibs lyrics_structure lyrics_language_per_line vocal_intensity vocal_emotion vocal_accent mix_stereo_width mix_dynamic_range mix_low_end mix_brightness mix_vocal_prominence master_style arrangement_density dynamics_shape transitions groove_feel harmonic_palette melodic_character rhythmic_feel percussion_style bass_style texture_layers sound_fx production_era spatial_ambience intro_style outro_style tempo_feel solo_instrument chord_progression cultural_style reference_artist_style instrumentation_notes mood_progression target_use reference_tempo_source mix_compression mix_saturation fade_in_seconds fade_out_seconds channel_layout loop_ready click_track key_change hook_placement tension_curve vocal_layering vocal_pronunciation syllable_stress melisma vibrato song_title_in_lyrics countin`.split(' '));
const SOUND_FIELDS={duration:new Set(['target_seconds','tolerance_seconds']),vocal:new Set(['mode','language']),lyrics:new Set(['mode','theme','language']),references:new Set(['kind','text'])};
const UNITS={'duration.target_seconds':' seconds','duration.tolerance_seconds':' seconds',tempo_bpm:' BPM',fade_in_seconds:' seconds',fade_out_seconds:' seconds',mix_dynamic_range:' LU'};
function enhancementPrompt(request,capabilities){
  if(typeof request.prompt!=='string'||!request.prompt.trim())throw new ValidationError([{path:'prompt',code:'REQUIRED',message:'Describe the music you want to enhance.'}]);
  const parameters=new Map(capabilities.parameters.map(parameter=>[parameter.name,parameter]));
  const lines=[];
  function selected(value,spec,path){
    if(typeof value==='string'){
      // Labels come ONLY from this exact selected enum's current schema entry;
      // never bring default choices, evidence metadata or invented styles in.
      const option=Array.isArray(spec?.values)?spec.values.find(option=>typeof option==='object'?option.id===value:option===value):undefined;
      const label=typeof option?.label==='string'?option.label:value;
      if(/(?:[a-z][a-z0-9+.-]*:\/\/|www\.|\bBearer\s+\S+|\bpmp_[A-Za-z0-9_-]{12,})/i.test(label))throw new ValidationError([{path,code:'ENHANCE_CONTEXT_ADDRESS',message:'Use a sound description in this setting. Web addresses and authorization strings cannot be included in the enhancement context. Your original draft is unchanged.'}]);
      return label;
    }
    if(typeof value==='number')return String(value)+(UNITS[path]??'');
    if(typeof value==='boolean')return String(value);
    if(Array.isArray(value))return value.map(item=>selected(item,spec,path)).filter(item=>item!==null);
    if(plain(value))return Object.fromEntries(Object.entries(value).filter(([key])=>!SOUND_FIELDS[path]||SOUND_FIELDS[path].has(key)).map(([key,item])=>[key,selected(item,spec?.fields?.[key],path+'.'+key)]).filter(([,item])=>item!==null));
    return null;
  }
  for(const [key,value] of Object.entries(request)){
    if(!SOUND_KEYS.has(key)||!parameters.has(key))continue;
    const context=selected(value,parameters.get(key),key);
    if(context===null||context===''||Array.isArray(context)&&context.length===0||plain(context)&&Object.keys(context).length===0)continue;
    lines.push(`${key}: ${typeof context==='string'?context:JSON.stringify(context)}`);
  }
  if(request.lyrics?.mode==='custom'&&typeof request.lyrics.text==='string'&&request.lyrics.text.trim())lines.push('Custom lyrics are provided separately. Keep those words unchanged; refine only the musical description.');
  if(!lines.length)return request.prompt;
  const prompt=`${request.prompt}\n\nKeep these choices and their exact names in the expanded description:\n${lines.join('\n')}`;
  if(Array.from(prompt).length>5000)throw new ValidationError([{path:'prompt',code:'ENHANCE_CONTEXT_TOO_LONG',message:'Your description and selected sound settings exceed the 5,000-character Enhance limit. Shorten the description or reduce selected settings. Your original draft is unchanged.'}]);
  return prompt;
}

// prompt_sent is the fully compiled generation prompt and must never replace
// the owner's input. Only the measured rewrite field is the Enhance result.
function projectRewrite(original,raw){
  if(!plain(raw)||raw.success!==true||raw.dry_run!==true||['tracks','render_plan','job_id','job','source_take','takes_delivered','rights','compliance','budget'].some(key=>Object.hasOwn(raw,key)))throw localError('ENHANCE_INVALID');
  const record=own(raw,'prompt_enhance');
  if(plain(record)&&record.state==='REJECTED')throw localError('ENHANCE_CHECK_FAILED');
  if(!plain(record)||record.state!=='REWRITTEN')throw localError('ENHANCE_NOT_REWRITTEN');
  const enhanced=own(record,'rewritten_prompt');
  if(typeof enhanced!=='string'||!enhanced.trim()||Array.from(enhanced).length>5000)throw localError('ENHANCE_INVALID');
  const checks=own(record,'checks');
  if(checks!==undefined&&!plain(checks))throw localError('ENHANCE_CHECK_FAILED');
  for(const key of ['non_empty','within_cap','controlled_terms_preserved'])if(checks&&Object.hasOwn(checks,key)&&checks[key]!==true)throw localError('ENHANCE_CHECK_FAILED');
  return {original,enhanced,changed:original!==enhanced,state:'REWRITTEN'};
}

function privateError(error){
  return {name:typeof error?.name==='string'?error.name:null,code:typeof error?.code==='string'?error.code:null,
    message:typeof error?.message==='string'?error.message:null,upstreamStatus:Number.isInteger(error?.upstreamStatus)?error.upstreamStatus:null,uncertain:error?.uncertain===true};
}

export function createEnhancements({store,engine,capabilities,config={},onError=()=>{}}){
  if(!store?.db||typeof engine?.submit!=='function'||typeof capabilities!=='function')throw new TypeError('Enhancement dependencies are incomplete.');
  // The current engine client has a 360-second request deadline. This worker
  // also bounds its observable operation; an unconfirmed call is never replayed.
  const timeoutMs=config.enhancementTimeoutMs??360000;
  if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>360000)throw new TypeError('Enhancement timeout must be within the engine request bound.');
  const dailyLimit=Math.min(ENHANCEMENT_DAILY_CEILING,config.dailyAdmissionLimit??ENHANCEMENT_DAILY_CEILING);
  if(!Number.isInteger(dailyLimit)||dailyLimit<0)throw new TypeError('Invalid enhancement admission limit.');
  store.db.exec(`CREATE TABLE IF NOT EXISTS enhancement_jobs (
    id TEXT PRIMARY KEY,owner TEXT NOT NULL,idem TEXT NOT NULL,fingerprint TEXT NOT NULL,
    request TEXT NOT NULL,payload TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('queued','running','complete','failed','uncertain')),
    response TEXT,error TEXT,created INTEGER NOT NULL,updated INTEGER NOT NULL,UNIQUE(owner,idem));
    CREATE INDEX IF NOT EXISTS enhancements_queued ON enhancement_jobs(status,created);`);
  // The application instance lock must be acquired before constructing workers.
  // A previous running receipt may have consumed a request: do not POST it again.
  store.db.prepare("UPDATE enhancement_jobs SET status='uncertain',error=?,updated=? WHERE status='running'")
    .run(JSON.stringify({code:'ENHANCE_INTERRUPTED'}),Date.now());
  let stopped=true,busy=false,inflight=false,timer;
  const notice=(id,code)=>{try{onError({operationId:id,code});}catch{/* Logging cannot turn a saved outcome into another request. */}};
  const rowById=id=>store.db.prepare('SELECT * FROM enhancement_jobs WHERE id=?').get(id);
  function visible(row){
    const request=JSON.parse(row.request);
    const output={id:row.id,idempotencyKey:row.idem,kind:'enhance',status:row.status,createdAt:row.created,updatedAt:row.updated,request,dispatchRequest:JSON.parse(row.payload)};
    if(row.status==='complete')output.result=projectRewrite(request.prompt,JSON.parse(row.response));
    if(row.error){
      const error=JSON.parse(row.error),raw=row.response?JSON.parse(row.response):undefined;
      output.error=Object.hasOwn(messages,error.code??'')?{code:error.code,message:messages[error.code],fields:[]}:
        publicFailure({...error,upstreamBody:raw});
    }
    return output;
  }
  function get(id,owner){if(typeof id!=='string'||typeof owner!=='string')throw problem(404,'NOT_FOUND','Enhancement not found.');const row=rowById(id);if(!row||row.owner!==owner)throw problem(404,'NOT_FOUND','Enhancement not found.');return visible(row);}
  function list(owner){return store.db.prepare('SELECT * FROM enhancement_jobs WHERE owner=? ORDER BY created DESC LIMIT 100').all(owner).map(visible);}
  function schedule(delay=1000){if(stopped||timer)return;timer=setTimeout(()=>{timer=undefined;void tick();},delay);timer.unref?.();}
  async function admit({owner,ipKey,idem,payload}){
    if(typeof owner!=='string'||!owner||owner.length>300||typeof ipKey!=='string'||!ipKey||ipKey.length>300||typeof idem!=='string'||!/^[A-Za-z0-9_-]{8,160}$/.test(idem))throw problem(400,'INVALID_REQUEST','A valid enhancement request and session are required.');
    if(!plain(payload))throw problem(400,'INVALID_REQUEST','Expected a music draft.');
    const draft=structuredClone(payload),fingerprint=sha(stable(draft));
    const prior=store.db.prepare('SELECT * FROM enhancement_jobs WHERE owner=? AND idem=?').get(owner,idem);
    if(prior){if(prior.fingerprint!==fingerprint)throw problem(409,'IDEMPOTENCY_CONFLICT','This enhancement ID belongs to a different draft.');return visible(prior);}
    const caps=await capabilities();
    // A callback in this draft is checked for shape only. The ONLY dispatched
    // body below is dry_run:true, whose documented path never sends webhooks.
    const request=validateRequest(draft,caps,{webhookUrl:draft.webhook_url??config.webhookUrl});
    const wire=validateRequest({...request,prompt:enhancementPrompt(request,caps),dry_run:true,capabilities:false,
      prompt_enhance:{...request.prompt_enhance,enabled:true,style:request.prompt_enhance?.style??'descriptive'}},caps,{webhookUrl:config.webhookUrl});
    const row=store.transaction(()=>{
      const old=store.db.prepare('SELECT * FROM enhancement_jobs WHERE owner=? AND idem=?').get(owner,idem);
      if(old){if(old.fingerprint!==fingerprint)throw problem(409,'IDEMPOTENCY_CONFLICT','This enhancement ID belongs to a different draft.');return old;}
      store.consume('generation:global',dailyLimit,ADMISSION_DAY_MS,'global');
      store.consume(`enhance:owner:${owner}`,20,86400000);store.consume(`enhance:ip:${ipKey}`,3,60000);
      const id=randomUUID(),now=Date.now();
      store.db.prepare("INSERT INTO enhancement_jobs (id,owner,idem,fingerprint,request,payload,status,created,updated) VALUES (?,?,?,?,?,?,'queued',?,?)")
        .run(id,owner,idem,fingerprint,JSON.stringify(request),JSON.stringify(wire),now,now);
      return rowById(id);
    });
    schedule(0);return visible(row);
  }
  async function process(row){
    let wire;
    try{wire=JSON.parse(row.payload);if(wire?.dry_run!==true||wire.capabilities!==false||wire.prompt_enhance?.enabled!==true)throw localError('ENHANCE_MODE_INVALID');}
    catch(error){store.db.prepare("UPDATE enhancement_jobs SET status='failed',error=?,updated=? WHERE id=? AND status='queued'").run(JSON.stringify(privateError(error)),Date.now(),row.id);return;}
    const claim=store.db.prepare("UPDATE enhancement_jobs SET status='running',updated=? WHERE id=? AND status='queued' AND NOT EXISTS(SELECT 1 FROM enhancement_jobs WHERE status='running')").run(Date.now(),row.id);
    if(claim.changes!==1)return;
    let response,deadline,timedOut=false;
    inflight=true;
    const submitted=Promise.resolve().then(()=>engine.submit(wire));
    const observed=submitted.then(value=>{
      if(timedOut){try{store.db.prepare("UPDATE enhancement_jobs SET response=?,updated=? WHERE id=? AND status='uncertain'").run(JSON.stringify(value),Date.now(),row.id);}catch{notice(row.id,'ENHANCE_LATE_RESULT_UNAVAILABLE');}}
      return value;
    }).finally(()=>{inflight=false;schedule();});
    try{
      response=await Promise.race([observed,new Promise((_,reject)=>{deadline=setTimeout(()=>{timedOut=true;reject(localError('ENHANCE_TIMEOUT'));},timeoutMs);})]);
      projectRewrite(JSON.parse(row.request).prompt,response);
      store.db.prepare("UPDATE enhancement_jobs SET status='complete',response=?,error=NULL,updated=? WHERE id=? AND status='running'").run(JSON.stringify(response),Date.now(),row.id);
    }catch(error){
      const raw=response??error?.upstreamBody;
      const status=timedOut||error?.uncertain===true||uncertainCodes.has(error?.code)?'uncertain':'failed';
      store.db.prepare("UPDATE enhancement_jobs SET status=?,response=?,error=?,updated=? WHERE id=? AND status='running'")
        .run(status,raw===undefined?null:JSON.stringify(raw),JSON.stringify(privateError(error)),Date.now(),row.id);
      notice(row.id,status==='uncertain'?'ENHANCE_UNCONFIRMED':'ENHANCE_FAILED');
    }finally{clearTimeout(deadline);}
  }
  async function tick(){
    if(stopped||busy||inflight)return;busy=true;
    try{
      const row=store.db.prepare("SELECT * FROM enhancement_jobs WHERE status='queued' ORDER BY created,rowid LIMIT 1").get();
      if(row)await process(row);
    }catch{notice(null,'ENHANCE_WORKER_UNAVAILABLE');}
    finally{busy=false;if(!inflight)schedule();}
  }
  return {admit,get,list,
    start(){stopped=false;clearTimeout(timer);timer=undefined;return tick();},
    wake(){clearTimeout(timer);timer=undefined;return tick();},
    stop(){stopped=true;clearTimeout(timer);timer=undefined;},
    get running(){return busy||inflight;},
  };
}
