/* Shared request contract for Create and the listening room. No player or DOM dependency. */
(() => {
'use strict';
function create(S){
  if(!S||!Array.isArray(S.parameters)||!S.parameters.length)throw Error('Music settings are not available. Reload before continuing.');
const clone=v=>JSON.parse(JSON.stringify(v)),get=(o,p)=>p.replace(/\[(\d+)\]/g,'.$1').split('.').reduce((v,k)=>v?.[k],o);
function active(condition,root,path){if(!condition)return true;let index=0;const indices=[...path.matchAll(/\[(\d+)\]/g)].map(x=>x[1]),p=condition.path.replace(/\[\]/g,()=>`[${indices[index++]}]`);let v=get(root,p);if(v===undefined){const [key,...parts]=p.replace(/\[(\d+)\]/g,'.$1').split('.'),n=S.parameters.find(x=>x.key===key);v=parts.reduce((value,k)=>value?.[k],n?.default);}return condition.in?condition.in.includes(v):v===condition.equals;}
const LABELS={project:'Track details','project.name':'Track title','project.version_note':'Version note',creative_goal:'Creative direction',prompt:'Describe your music',prompt_enhance:'Refine your description',negative_prompt:'Sounds to avoid',genres:'Genres and subgenres',eras:'Musical era',moods:'Mood and emotion',prompt_blocks:'Musical ideas',tempo_bpm:'Tempo (BPM)',key:'Key and scale',time_signature:'Time signature',duration:'Duration','duration.target_seconds':'Target length (seconds)','duration.tolerance_seconds':'Allowed difference (seconds)','duration.on_miss':'If the length differs',structure:'Song structure',arrangement_ai:'Automatic arrangement',energy_curve:'Energy over time','energy_curve.points':'Energy points','energy_curve.points[].t':'Time (seconds)','energy_curve.points[].v':'Energy (0–1)',instruments:'Instruments',sonic_tags:'Sound character',mood_orbit:'Emotional balance','mood_orbit.axes':'Emotion strengths',vocal:'Vocals','vocal.mode':'Voice','vocal.language_policy':'Language confidence',lyrics:'Lyrics','lyrics.mode':'Lyrics source','lyrics.text':'Your lyrics','lyrics.theme':'What should the lyrics be about?','lyrics.verify':'Check the sung words','lyrics.script':'Writing system',references:'Sound references','references[].kind':'Reference type','references[].url':'Reference link','references[].text':'Describe the sound',output_package:'Track versions and stems',variation_count:'Number of versions',labels:'Organizing labels',route:'Music model',quality:'Creation quality',controls:'Musical detail',mastering:'Mastering','mastering.loudness_lufs':'Loudness target (LUFS)','mastering.true_peak_db':'Peak ceiling (dB)',export:'File format',stems:'Separate parts',seed:'Recorded seed',webhook_url:'Completion notification link',async:'Create in the background',dry_run:'Preview the creation plan',capabilities:'Explore available settings',client_side_echo:'Request note',lyrics_orthography_route:'Lyric pronunciation method',lyrics_verify_metric:'How to check the lyrics',lyrics_threshold_override:'Maximum lyric error rate',lyrics_measurement_domain:'Audio used to check lyrics',run_originality_gate:'Check originality',reference_artist_style:'Describe a musical style',reference_tempo_source:'Tempo reference',mix_dynamic_range:'Dynamic range target (LU)',loop_ready:'Seamless loop',adlibs:'Ad-libs',sound_fx:'Sound effects',countin:'Count-in and pickup'};
function label(n){return LABELS[n.path]||LABELS[n.key]||(n.label||n.key).replace(/\s*\([^)]*\)/g,'').replaceAll('_',' ').trim();}
function unavailable(n){return n.website?.enabled===false;}
function blockedOption(n,value){const owner=S.parameters.find(x=>x.key===n.path.split(/[.[]/)[0]);return n.path==='references[].kind'&&owner?.website?.allowed_kinds&&!owner.website.allowed_kinds.includes(value);}
function fail(n,path,message){const error=Error(message);error.path=path;throw error;}
function validateNode(n,v,path,root){
  if(v===undefined)return;
  if(unavailable(n)&&!(n.website.allowed_in_dry_run&&root.dry_run===true))
    fail(n,path,n.website.reason||label(n)+' is not available.');
  if(!active(n.active_when,root,path))fail(n,path,label(n)+' does not apply to the current selection. Change the related choice or clear this setting.');
  if(n.type==='array'){
    if(!Array.isArray(v))fail(n,path,label(n)+' needs a list of choices.');
    if(n.max_items!==undefined&&v.length>n.max_items)fail(n,path,'Choose up to '+n.max_items+' for '+label(n)+'.');
    if(n.options_complete&&n.options)for(const item of v)if(!n.options.some(o=>o.id===item))fail(n,path,'Choose a listed value for '+label(n)+'.');
    if(n.items)v.forEach((item,i)=>validateNode(n.items,item,path+'['+i+']',root));
    return;
  }
  if(n.type==='object'){
    if(!v||Array.isArray(v)||typeof v!=='object')fail(n,path,label(n)+' needs its detail fields.');
    for(const key of Object.keys(v))if(['__proto__','prototype','constructor'].includes(key))fail(n,path,'The name “'+key+'” cannot be used here.');
    if(n.control==='key-value'){if(Object.values(v).some(x=>typeof x!=='string'))fail(n,path,'Labels need a name and text value.');return;}
    for(const key of Object.keys(v))if(!n.fields.some(f=>f.key===key))fail(n,path+'.'+key,'Unexpected setting “'+key+'” in '+label(n)+'.');
    for(const f of n.fields){
      const p=path+'.'+f.key,required=f.required||(f.required_when&&active(f.required_when,root,p));
      if(required&&(v[f.key]===undefined||typeof v[f.key]==='string'&&!v[f.key].trim()))fail(f,p,'Add '+label(f).toLowerCase()+'.');
      validateNode(f,v[f.key],p,root);
    }
    return;
  }
  if(n.type==='string'&&typeof v!=='string')fail(n,path,label(n)+' needs text.');
  if(n.type==='boolean'&&typeof v!=='boolean')fail(n,path,'Choose On or Off for '+label(n)+'.');
  if(n.options_complete&&n.options&&!n.options.some(o=>o.id===v))fail(n,path,'Choose a listed value for '+label(n)+'.');
  if(blockedOption(n,v))fail(n,path,'Audio and MIDI imports are not available. Choose a sound description.');
  if(['number','integer'].includes(n.type)){
    if(!Number.isFinite(v)||(n.type==='integer'&&!Number.isSafeInteger(v)))fail(n,path,label(n)+' needs '+(n.type==='integer'?'a safe whole number':'a number')+'.');
    if(n.minimum!==undefined&&v<n.minimum||n.maximum!==undefined&&v>n.maximum)fail(n,path,label(n)+' is outside its allowed range.');
    if(n.step&&Math.abs((v-(n.minimum||0))/n.step-Math.round((v-(n.minimum||0))/n.step))>1e-6)fail(n,path,label(n)+' uses steps of '+n.step+'.');
  }
  if(n.max_length!==undefined&&typeof v==='string'&&Array.from(v).length>n.max_length)fail(n,path,label(n)+' allows up to '+n.max_length+' characters.');
  if(n.format==='uri'||n.format==='https_uri'||n.control==='url'||n.control_hint==='url'){
    try{const u=new URL(v);if(n.format==='https_uri'&&u.protocol!=='https:')throw Error();}
    catch{fail(n,path,label(n)+' needs '+(n.format==='https_uri'?'an HTTPS':'a valid')+' link.');}
  }
}
function payload(draft){
  if(!draft||Array.isArray(draft)||typeof draft!=='object')throw Error('Choose your music settings before continuing.');
  const result={},metadata=new Set(['_scene','_quickLines']);
  for(const key of Object.keys(draft)){
    const n=S.parameters.find(x=>x.key===key);
    if(!n){if(!metadata.has(key))throw Error('Unexpected setting “'+key+'”.');continue;}
    if(draft[key]!==undefined&&!(n.false_action==='omit'&&draft[key]===false))result[key]=clone(draft[key]);
  }
  if(result.capabilities!==true&&(typeof result.prompt!=='string'||!result.prompt.trim()))throw Error('Add a description or choose a sound to begin.');
  if(result.capabilities===true&&typeof result.prompt==='string'&&!result.prompt.trim())delete result.prompt;
  if(result.prompt!==undefined&&(typeof result.prompt!=='string'||!result.prompt.trim()))throw Error('Add a description, or clear it when exploring available settings.');
  for(const n of S.parameters)validateNode(n,result[n.key],n.key,result);
  const vocalDefault=S.parameters.find(n=>n.key==='vocal')?.default?.mode;
  if((result.vocal?.mode??vocalDefault)==='instrumental'&&['custom','ai_write'].includes(result.lyrics?.mode))throw Error('Choose a voice to use lyrics, or set lyrics to “No lyrics”.');
  if(result.route==='lyria-3-clip-preview'&&(result.duration?.target_seconds??S.parameters.find(n=>n.key==='duration')?.default?.target_seconds)>30)throw Error('This short-track model needs a duration of 30 seconds or less.');
  return result;
}

return Object.freeze({payload,validateNode,active,label,blockedOption,unavailable});
}
window.PMPRequestContract=Object.freeze({create});
})();
