import {randomUUID} from 'node:crypto';
import {problem,sha,stable} from './store.mjs';
import {validateRequest,projectCapabilities} from './validation.mjs';

const safeText=(value,max=24000)=>typeof value==='string'?value.slice(0,max)
  .replace(/\bBearer\s+[^\s<>"']+/gi,'[authorization removed]')
  .replace(/\bpmp_[A-Za-z0-9_-]{12,}/g,'[key removed]')
  .replace(/\b(?:https?|gs|file):\/\/[^\s<>"']+/gi,'[address removed]')
  .replace(/\b[A-Za-z]:[\\/][^\r\n<>"']+/g,'[path removed]')
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,''):null;
const scalar=value=>typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value)||typeof value==='string';
const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const get=(value,key)=>record(value)?Object.getOwnPropertyDescriptor(value,key)?.value:undefined;
const number=value=>typeof value==='number'&&Number.isFinite(value)?value:null;
const count=value=>Number.isSafeInteger(value)&&value>=0?value:null;
const boolean=value=>typeof value==='boolean'?value:null;
const choice=(value,values)=>typeof value==='string'&&values.includes(value)?value:null;
const LANGUAGE_STATES=['SINGING_PROVEN','SPEECH_PROVEN','ENGINEERING_PATH_ESTABLISHED','DOCUMENTED_CONVERGENT','DOCUMENTED_SINGLE','PENDING_MEASUREMENT','NOT_MEASURED','NOT_IN_REGISTRY'];

// docs/api/06:718-752 defines the resolved plan; doc14:28-44,143 defines
// language evidence and fallback. These are planned operations, never audio
// measurements. Copy only reviewed fields; absence never acquires a default.
function planDetails(raw,capabilities){
  const parameters=new Map(capabilities.parameters.map(parameter=>[parameter.name,parameter]));
  const values=(name,field)=>{
    const source=field?parameters.get(name)?.fields?.[field]:parameters.get(name);
    return (source?.values??[]).map(value=>record(value)?value.id:value);
  };
  const enumValue=(value,name,field)=>choice(value,values(name,field));
  const stemList=value=>Array.isArray(value)&&value.length<=32&&value.every(item=>enumValue(item,'stems')!==null)?[...value]:null;
  const render=get(raw,'render_settings'),conform=get(render,'conform'),master=get(render,'master'),edits=get(render,'post_edits'),stems=get(render,'stems');
  const capability=get(raw,'language_capability'),fallback=get(raw,'language_fallback');
  const languageCode=value=>enumValue(value,'vocal','language');
  const fallbackState=fallback===null?'none':record(fallback)||typeof fallback==='string'&&fallback.trim()?'reported':'unavailable';
  return {
    conform:record(conform)?{targetSeconds:number(get(conform,'target_seconds')),toleranceSeconds:number(get(conform,'tolerance_seconds')),
      onMiss:enumValue(get(conform,'on_miss'),'duration','on_miss'),tempoBpm:number(get(conform,'tempo_bpm')),
      timeSignature:enumValue(get(conform,'time_signature'),'time_signature')}:null,
    mastering:record(master)?{target:enumValue(get(master,'target'),'mastering','target'),loudnessLufs:number(get(master,'loudness_lufs')),
      truePeakDb:number(get(master,'true_peak_db')),normalizeOutput:boolean(get(master,'normalize_output')),
      dynamicRangeLu:number(get(master,'mix_dynamic_range_requested_lu'))}:null,
    postEdits:record(edits)?{fadeInSeconds:number(get(edits,'fade_in_seconds')),fadeOutSeconds:number(get(edits,'fade_out_seconds')),
      channelLayout:enumValue(get(edits,'channel_layout'),'channel_layout')}:null,
    stems:record(stems)?{requested:stemList(get(stems,'requested')),separatedRequested:stemList(get(stems,'separated_requested')),
      separatorCalls:count(get(stems,'separator_calls'))}:null,
    language:{capability:record(capability)?{code:languageCode(get(capability,'code')),accepted:boolean(get(capability,'accepted')),
      generation:choice(get(capability,'generation'),['PROMPT_LANGUAGE']),transcription:choice(get(capability,'transcription'),['GEMINI_DOCUMENTED']),
      intelligibilityGate:choice(get(capability,'intelligibility_gate'),['PHONEMISER_AVAILABLE','GRAPHEME_METRICS_ONLY']),
      calibration:choice(get(capability,'bar'),['CALIBRATED','NOT_CALIBRATED']),singing:choice(get(capability,'singing'),LANGUAGE_STATES),speech:choice(get(capability,'speech'),LANGUAGE_STATES)}:null,
      fallback:{state:fallbackState,requested:languageCode(get(fallback,'requested')),planned:languageCode(get(fallback,'delivered')),
        requestedState:choice(get(fallback,'requested_state'),LANGUAGE_STATES)}}
  };
}
// These are request compilation fields, never a delivered-file envelope. The
// complete upstream response is retained privately; auth/service/URLs are not spread.
export function projectPreview(raw,capabilities){
  if(raw?.dry_run!==true||raw.success!==true||['tracks','render_plan','job_id','job','source_take','budget','rights','compliance','takes_delivered'].some(key=>Object.hasOwn(raw,key)))throw problem(502,'PREVIEW_INVALID','The music service did not return a valid request preview. No new request was sent.');
  const projected=projectCapabilities(capabilities),known=new Set(projected.parameters.map(p=>p.name));
  const accepted=(value,name)=>choice(value,projected.parameters.find(parameter=>parameter.name===name)?.values?.map(option=>option.id)??[]);
  const bindings=[];
  for(const [parameter,value] of Object.entries(raw.bindings||{})){
    if(!known.has(parameter))continue;
    const entry={parameter};
    if(typeof value==='string')entry.description=safeText(value);
    else if(value&&typeof value==='object')for(const key of ['binding','mode','status','sent','sent_to_model','accepted','note','reason']){
      if(scalar(value[key]))entry[key]=typeof value[key]==='string'?safeText(value[key]):value[key];
    }
    bindings.push(entry);
  }
  const fields=raw.request_parameters_received,details=planDetails(raw,capabilities);
  return {kind:'request-preview',musicGenerated:false,promptSent:safeText(raw.prompt_sent),model:choice(raw.route?.model,projected.routes.map(route=>route.id)),
    received:Array.isArray(fields)?fields.filter(key=>known.has(key)):[],bindings,
    settings:{quality:accepted(raw.render_settings?.quality,'quality'),export:accepted(raw.render_settings?.export,'export'),
      durationSeconds:Number.isFinite(raw.render_settings?.conform?.target_seconds)?raw.render_settings.conform.target_seconds:null,
      takes:count(raw.generation_payload?.takes),instrumentalOnly:boolean(raw.generation_payload?.instrumental_only)},details,
    notice:'This is the compiled request, not generated music. It uses one API request; no music generation is billed.'};
}

export function createPreviews({store,engine,capabilities,config}){
  store.db.exec(`CREATE TABLE IF NOT EXISTS request_previews (id TEXT PRIMARY KEY,owner TEXT NOT NULL,idem TEXT NOT NULL,fingerprint TEXT NOT NULL,payload TEXT NOT NULL,state TEXT NOT NULL,response TEXT,error TEXT,created INTEGER NOT NULL,UNIQUE(owner,idem))`);
  const running=new Map(),admitted=new Set();
  async function submit({owner,ipKey,idem,payload}){
    if(payload?.dry_run!==true&&payload?.capabilities!==true)throw problem(400,'PREVIEW_MODE_REQUIRED','Choose request preview or capabilities. This endpoint never generates music.');
    const caps=await capabilities();const valid=validateRequest(payload,caps,{webhookUrl:config.webhookUrl});
    const fingerprint=sha(stable(valid));
    const row=store.transaction(()=>{
      const old=store.db.prepare('SELECT * FROM request_previews WHERE owner=? AND idem=?').get(owner,idem);
      if(old){if(old.fingerprint!==fingerprint)throw problem(409,'IDEMPOTENCY_CONFLICT','This preview ID belongs to different settings.');return old;}
      store.consume('generation:global',config.dailyAdmissionLimit,86400000);
      store.consume(`preview:owner:${owner}`,20,86400000);store.consume(`preview:ip:${ipKey}`,3,60000);
      const id=randomUUID();store.db.prepare('INSERT INTO request_previews (id,owner,idem,fingerprint,payload,state,created) VALUES (?,?,?,?,?,?,?)').run(id,owner,idem,fingerprint,JSON.stringify(valid),'submitting',Date.now());
      admitted.add(id);
      return store.db.prepare('SELECT * FROM request_previews WHERE id=?').get(id);
    });
    const project=response=>valid.capabilities===true?{kind:'capability-preview',musicGenerated:false,capabilities:projectCapabilities(response)}:projectPreview(response,caps);
    if(row.state==='complete')return {id:row.id,...project(JSON.parse(row.response))};
    if(running.has(row.id))return running.get(row.id);
    if(row.state!=='submitting'||row.response||row.error)throw problem(409,'PREVIEW_NEEDS_ATTENTION','This preview could not finish. Review its status before deliberately requesting a new preview.');
    // A prior process can leave 'submitting'. Its exact outcome is unknown; do
    // not silently consume another upstream quota request after a restart.
    if(!admitted.has(row.id))throw problem(409,'PREVIEW_UNCONFIRMED','The previous preview was interrupted. It will not be repeated automatically.');
    const work=(async()=>{
      let response;
      try{response=await engine.submit(valid);const output=project(response);
        store.db.prepare("UPDATE request_previews SET state='complete',response=? WHERE id=?").run(JSON.stringify(response),row.id);
        return {id:row.id,...output};
      }catch(error){const privateResponse=response??error.upstreamBody;store.db.prepare("UPDATE request_previews SET state='failed',response=?,error=? WHERE id=?").run(privateResponse?JSON.stringify(privateResponse):null,JSON.stringify({code:error.code||'PREVIEW_FAILED'}),row.id);throw error;}
      finally{running.delete(row.id);}
    })();running.set(row.id,work);return work;
  }
  return {submit,get running(){return running.size>0;}};
}
