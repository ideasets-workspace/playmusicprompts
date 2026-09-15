(() => {
'use strict';
const P=window.PMP,{$,$$,esc,icon,dialog,closeDialog,toast,state,saveDraft}=P,S=window.PMP_SCHEMA;
const {payload,validateNode,active,label,blockedOption,unavailable}=window.PMPRequestContract.create(S);
let working={},multiValues=new Map(),nodeMap=new Map(),group='all',loadedInactive=new Set(),unmapped={};
const clone=v=>JSON.parse(JSON.stringify(v)),get=(o,p)=>p.replace(/\[(\d+)\]/g,'.$1').split('.').reduce((v,k)=>v?.[k],o);
function defaults(n){if(n.default!==undefined)return clone(n.default);if(n.type==='object'&&n.fields){const value={};n.fields.forEach(f=>{const v=defaults(f);if(v!==undefined)value[f.key]=v;});return value;}if(n.type==='array')return [];return undefined;}
const OPTION_LABELS={'lyrics.mode':{ai_write:'Create lyrics for me',custom:'Use my lyrics',none:'No lyrics'},'vocal.language_policy':{measure:'Use my language and report the result',strict:'Require a verified language',prefer_proven:'Prefer a verified language, with any change reported'},'references[].kind':{descriptor:'Describe a sound',user_audio:'My audio file',midi:'My MIDI file'},output_package:{single_track:'One track',variations:'Multiple versions — each uses a separate generation',stems_bundle:'Track with separate parts'},lyrics_orthography_route:{R0:'Keep the original spelling',R1:'Adapt spelling to pronunciation'},lyrics_verify_metric:{per:'Sound errors',cer:'Character errors',wer:'Word errors',ser:'Syllable errors'},lyrics_measurement_domain:{stem:'Separate vocal part — requires vocal separation',mix:'Full song'},export:{wav24_48k:'WAV · 24-bit · 48 kHz',wav16_48k:'WAV · 16-bit · 48 kHz',flac_48k:'FLAC · 48 kHz',mp3_320:'MP3 · 320 kbps',mp3_native:'MP3 · original encoding'}};
function optionLabel(n,o){return OPTION_LABELS[n.path]?.[o.id]||o.label;}
function note(n){if(n.website?.reason)return n.website.reason;if(n.false_action==='omit')return 'Off leaves this setting out of the request.';if(n.path==='lyrics')return 'Only the fields for your selected lyric source are sent. Hidden text stays available while this editor is open.';if(n.path==='variation_count')return 'Used when multiple versions are selected.';if(n.path==='seed')return 'The result reports whether the seed was applied. Recording a seed does not promise identical playback.';if(n.path==='export')return 'The file format changes delivery encoding; it does not add detail to the original recording.';return '';}
function render(n,path,value){nodeMap.set(path,n);const v=value,id='control-'+path.replace(/[^a-z0-9_-]/gi,'-'),attrs=`data-path="${esc(path)}" data-present="${value!==undefined}" id="${id}"`,cap=n.max_length?`data-max-characters="${n.max_length}"`:'';let html='';
if(n.control==='key-value'){html=`<div class="key-values" data-kv="${esc(path)}">${Object.entries(v||{}).map(([k,x])=>kvRow(k,x)).join('')}</div><button type="button" class="text-button" data-add-kv="${esc(path)}">${icon('plus')}Add label</button>`;}
else if(n.type==='object'){html=`<div class="nested-fields">${(n.fields||[]).map(f=>render(f,path+'.'+f.key,v?.[f.key])).join('')}</div>`;}
else if(n.control==='repeater'||n.type==='array'&&!n.options?.length&&n.items){html=`<div class="repeater" data-repeater="${esc(path)}">${(v||[]).map((item,i)=>`<div class="repeat-row" data-index="${i}">${render(n.items,`${path}[${i}]`,item)}<button type="button" class="icon-button remove-row" data-remove-row aria-label="Remove item">${icon('close')}</button></div>`).join('')}</div><button type="button" class="text-button" data-add-row="${esc(path)}">${icon('plus')}Add ${n.key==='structure'?'section':n.key==='references'?'reference':'item'}</button>${n.max_items?`<small>Up to ${n.max_items} items.</small>`:''}`;}
else if(n.type==='array'&&n.options?.length){multiValues.set(path,new Set(v||[]));html=`<div class="multi-control" data-multi="${esc(path)}"><input type="search" data-option-search="${esc(path)}" aria-label="Search ${esc(label(n))}" placeholder="Search ${esc(label(n).toLowerCase())}"><div class="selected-values"></div><div class="multi-options"></div><p class="option-count"></p><button type="button" class="text-button" data-more-options hidden>Show more</button></div>`;}
else if(n.type==='array'){html=`<textarea ${attrs} data-kind="chips" rows="3" placeholder="One choice on each line">${esc((v||[]).join('\n'))}</textarea><small>One choice per line. Commas stay within each choice.</small>`;}
else if(n.control==='language'){html=`<input ${attrs} list="${id}-list" value="${esc(v||'')}" placeholder="Choose or enter a language code" autocomplete="off"><datalist id="${id}-list">${n.options.map(o=>`<option value="${esc(o.id)}">${esc(o.label)}</option>`).join('')}</datalist><small>Choose a suggestion or enter a language code.</small>`;}
else if(n.options?.length&&n.control!=='number'&&n.type!=='boolean'){html=`<select ${attrs} data-kind="enum"><option value="">Use default</option>${n.options.map((o,i)=>`<option value="${i}" ${v===o.id?'selected':''} ${blockedOption(n,o.id)?'disabled':''}>${esc(optionLabel(n,o))}${blockedOption(n,o.id)?' — unavailable':''}</option>`).join('')}</select>`;}
else if(n.type==='boolean'){html=`<select ${attrs} data-kind="bool"><option value="">Use default</option><option value="true" ${v===true?'selected':''}>On</option>${!n.options_complete||n.options?.some(o=>o.id===false)||n.false_action==='omit'?`<option value="false" ${v===false?'selected':''}>Off</option>`:''}</select>`;}
else if(['number','integer'].includes(n.type)){const min=n.minimum!==undefined?`min="${n.minimum}"`:'',max=n.maximum!==undefined?`max="${n.maximum}"`:'',step=n.step??(n.type==='integer'?1:'any');html=`<div class="numeric-control">${n.minimum!==undefined&&n.maximum!==undefined?`<input type="range" aria-label="${esc(label(n))} slider" data-number-range="${esc(path)}" ${min} ${max} step="${step==='any'?.01:step}" value="${v??n.minimum}">`:''}<input type="number" ${attrs} ${min} ${max} step="${step}" value="${v??''}" placeholder="Auto">${n.unit?`<span>${esc(n.unit)}</span>`:''}</div>${n.suggested_values?.length?`<small>Suggestions: ${n.suggested_values.join(', ')}</small>`:''}`;}
else if(n.control_hint==='textarea'||n.key==='prompt'||n.max_length>500||n.path.endsWith('[]')){html=`<textarea ${attrs} ${cap} rows="${n.key==='prompt'?4:3}">${esc(v||'')}</textarea>`;}
else html=`<input ${attrs} type="${n.control==='url'||n.control_hint==='url'?'url':'text'}" ${cap} value="${esc(v||'')}" ${n.format==='https_uri'?'placeholder="https://…"':''}>`;
return `<div class="control-field field" data-node="${esc(path)}" data-present="${value!==undefined}"><label for="${id}">${esc(label(n))}${n.required?' <span class="required-mark">*</span>':''}</label>${html}${n.max_length?`<small>Up to ${n.max_length} characters.</small>`:''}${note(n)?`<small class="control-note">${esc(note(n))}</small>`:''}</div>`;}
function kvRow(k='',v=''){return `<div class="kv-row" data-present="${arguments.length>0}"><textarea rows="1" aria-label="Label name" placeholder="Label name">${esc(k)}</textarea><textarea rows="1" aria-label="Label value" placeholder="Value">${esc(v)}</textarea><button type="button" class="icon-button" data-remove-kv aria-label="Remove label">${icon('close')}</button></div>`;}
function present(path){return $('[data-node="'+path+'"]')?.dataset.present==='true'||Boolean($('[data-enable="'+path+'"]')?.checked);}
function read(n,path,root){if(n.control==='key-value'){const result={};for(const row of $$(`[data-kv="${path}"] .kv-row`)){const inputs=$$('input,textarea',row),key=inputs[0].value;if(key||inputs[1].value!==''||row.dataset.present==='true'){if(Object.hasOwn(result,key))throw Error(`The label “${key}” is repeated. Give each label a different name.`);Object.defineProperty(result,key,{value:inputs[1].value,enumerable:true,writable:true,configurable:true});}}return result;}
if(n.type==='object'){const result={};for(const f of n.fields||[]){const value=read(f,path+'.'+f.key,root);if(value!==undefined)result[f.key]=value;}return Object.keys(result).length||present(path)?result:undefined;}
if(n.control==='repeater'||n.type==='array'&&!n.options?.length&&n.items){const rows=$$(`[data-repeater="${path}"] > .repeat-row`);if(!rows.length&&!present(path))return undefined;return rows.map(r=>{const value=read(n.items,`${path}[${r.dataset.index}]`,root);return value===undefined&&n.items.type==='string'?'':value;});}
if(n.type==='array'&&n.options?.length){const values=[...(multiValues.get(path)||[])];return values.length||present(path)?values:undefined;}const el=$(`[data-path="${path}"]`);if(!el)return undefined;if(el.value==='')return el.dataset.present==='true'&&n.type==='string'?'':undefined;if(el.dataset.kind==='enum')return n.options[Number(el.value)]?.id;if(el.dataset.kind==='bool')return el.value==='true';if(el.dataset.kind==='chips')return el.value.split('\n');if(['number','integer'].includes(n.type))return Number(el.value);return el.value;}
function collect(includeInactive=false){const root={...unmapped};for(const n of S.parameters){const enable=$(`[data-enable="${n.key}"]`);if(enable?.checked)root[n.key]=read(n,n.key,working);}if(includeInactive)return root;function prune(n,v,path){if(v===undefined)return;if(n.type==='array'&&n.items)v.forEach((x,i)=>prune(n.items,x,`${path}[${i}]`));if(n.type==='object'&&n.fields)for(const f of n.fields){const p=path+'.'+f.key;if(!active(f.active_when,root,p)&&!loadedInactive.has(p))delete v[f.key];else prune(f,v[f.key],p);}}for(const n of S.parameters){if(!active(n.active_when,root,n.key)&&!loadedInactive.has(n.key))delete root[n.key];else prune(n,root[n.key],n.key);}return root;}
function conditionals(){try{working=collect(true);}catch(error){showError(error);return;}for(const [path,n]of nodeMap){const el=$(`[data-node="${path}"]`);if(!el)continue;const yes=active(n.active_when,working,path);el.classList.toggle('required-field',Boolean(n.required_when&&active(n.required_when,working,path)));el.hidden=!yes;$$('input,textarea,select',el).forEach(x=>{if(n.active_when)x.disabled=!yes;});}updateAvailability();}
function optionList(el,limit=70){const path=el.dataset.multi,n=nodeMap.get(path),q=$('[data-option-search]',el).value.trim().toLowerCase(),set=multiValues.get(path),matches=n.options.filter(o=>o.label.toLowerCase().includes(q)||String(o.id).toLowerCase().includes(q));$('.selected-values',el).innerHTML=[...set].map(v=>`<span class="selected-chip">${esc(n.options.find(o=>o.id===v)?.label||v)}</span>`).join('');$('.multi-options',el).innerHTML=matches.slice(0,limit).map(o=>{const index=n.options.indexOf(o);return `<label class="choice"><input type="checkbox" data-choice="${index}" ${set.has(o.id)?'checked':''}><span>${esc(o.label)}</span></label>`;}).join('');$('.option-count',el).textContent=`${set.size} selected · ${matches.length.toLocaleString()} choices`;const more=$('[data-more-options]',el);more.hidden=matches.length<=limit;more.onclick=()=>optionList(el,limit+100);$$('[data-choice]',el).forEach(c=>c.onchange=()=>{const val=n.options[+c.dataset.choice].id;if(c.checked){if(n.max_items&&set.size>=n.max_items){c.checked=false;toast(`Choose up to ${n.max_items}.`);return;}set.add(val);}else set.delete(val);optionList(el,limit);});}
function bind(root=$('#controls-form')){if(!root)return;for(const el of $$('.multi-control',root)){optionList(el);$('[data-option-search]',el).oninput=()=>optionList(el);}for(const b of $$('[data-add-row]',root))b.onclick=()=>{working=collect();const path=b.dataset.addRow,n=nodeMap.get(path),list=$(`[data-repeater="${path}"]`),rows=$(':scope > .repeat-row',list);if(n.max_items&&rows.length>=n.max_items){toast(`You can add up to ${n.max_items} items.`);return;}const i=rows.length?Math.max(...rows.map(r=>+r.dataset.index))+1:0;const wrapper=document.createElement('div');wrapper.className='repeat-row';wrapper.dataset.index=i;wrapper.innerHTML=render(n.items,`${path}[${i}]`,defaults(n.items))+`<button type="button" class="icon-button remove-row" data-remove-row aria-label="Remove item">${icon('close')}</button>`;list.append(wrapper);bind(wrapper);conditionals();};for(const b of $$('[data-remove-row]',root))b.onclick=()=>{const row=b.closest('.repeat-row'),list=row.parentElement,path=list.dataset.repeater,n=nodeMap.get(path);const values=$(':scope > .repeat-row',list).filter(r=>r!==row).map(r=>read(n.items,path+'['+r.dataset.index+']',working));list.innerHTML=values.map((v,i)=>'<div class="repeat-row" data-index="'+i+'">'+render(n.items,path+'['+i+']',v)+'<button type="button" class="icon-button remove-row" data-remove-row aria-label="Remove item">'+icon('close')+'</button></div>').join('');bind(list);conditionals();};for(const b of $$('[data-add-kv]',root))b.onclick=()=>{const target=$(`[data-kv="${b.dataset.addKv}"]`);target.insertAdjacentHTML('beforeend',kvRow());bind(target);};for(const b of $$('[data-remove-kv]',root))b.onclick=()=>b.closest('.kv-row').remove();for(const r of $$('[data-number-range]',root))r.oninput=()=>{const el=$(`[data-path="${r.dataset.numberRange}"]`);el.value=r.value;conditionals();};for(const el of $$('[data-path]',root))el.onchange=()=>{if(el.value==='')el.dataset.present='false';const r=$(`[data-number-range="${el.dataset.path}"]`);if(r&&el.value!=='')r.value=el.value;conditionals();};}
function searchLabels(n){return [label(n),n.key,...(n.fields||[]).map(searchLabels),...(n.items?[searchLabels(n.items)]:[])].join(' ');}
function filter(){
  const q=$('#control-search').value.trim().toLowerCase().replace(/\s+/g,' ');
  let count=0;
  for(const card of $$('.control-card')){
    const n=S.parameters.find(n=>n.key===card.dataset.parameter);
    const text=searchLabels(n).toLowerCase().replace(/\s+/g,' ');
    const yes=(group==='all'||n.group===group)&&(!q||text.includes(q));
    card.hidden=!yes;if(yes)count++;if(q&&yes)card.open=true;
  }
  $('#control-count').textContent=`${count} ${count===1?'control':'controls'}`;
  $('#no-controls').hidden=count>0;
}
function showError(error){const el=$('#controls-error');if(!el){toast(error.message);return;}el.hidden=false;el.textContent=error.message;el.scrollIntoView({block:'center'});}
function controlCard(n){
  const selected=working[n.key]!==undefined||n.required,disabled=unavailable(n)&&!(n.website.allowed_in_dry_run&&working.dry_run===true);
  return `<details class="control-card" data-parameter="${n.key}" ${n.key==='prompt'?'open':''}><summary><span>${esc(label(n))}</span><span class="control-set">${disabled?'Unavailable':selected?'Set':'Auto'}</span>${icon('down')}</summary><div class="control-content"><label class="use-control"><input type="checkbox" data-enable="${n.key}" ${selected?'checked':''} ${n.required||disabled&&!selected?'disabled':''}>${n.required?'Required':disabled?'Not currently available':'Use this control'}</label><fieldset class="control-inputs" ${!selected||disabled?'disabled':''}>${render(n,n.key,working[n.key])}</fieldset></div></details>`;
}
function updateAvailability(){
  for(const n of S.parameters){
    const card=$('[data-parameter="'+n.key+'"]');if(!card)continue;
    const enable=$('[data-enable]',card),disabled=unavailable(n)&&!(n.website.allowed_in_dry_run&&working.dry_run===true);
    enable.disabled=Boolean(n.required||disabled&&!enable.checked);
    $('fieldset',card).disabled=!enable.checked||disabled;
    $('.control-set',card).textContent=disabled?'Unavailable':enable.checked?'Set':'Auto';
  }
}
function open(draft=state.draft){
  const openedVersion=P.draftVersion?.();
  working=clone(draft);multiValues.clear();nodeMap.clear();loadedInactive.clear();group='all';
  unmapped=Object.fromEntries(Object.entries(draft).filter(([key])=>!S.parameters.some(n=>n.key===key)&&!['_scene','_quickLines'].includes(key)));
  dialog('Shape every detail',`<div class="controls-toolbar"><label class="search-box">${icon('search')}<input type="search" id="control-search" placeholder="Find a control" aria-label="Find a control"></label><span id="control-count">${S.parameters.length} controls</span></div><div class="controls-layout"><nav class="control-groups" aria-label="Control groups"><button type="button" data-group="all" aria-current="true">All controls</button>${S.groups.map(g=>`<button type="button" data-group="${g.id}">${esc(g.label)}</button>`).join('')}</nav><form id="controls-form"><p class="controls-hint">Choose the details that matter. Create starts with three versions unless you choose a track package. Other unselected settings use the service defaults. Your explicit choices are preserved.</p>${S.parameters.map(controlCard).join('')}<div id="no-controls" class="empty-state" hidden>No controls match your search.</div><p id="controls-error" role="alert" class="form-status error" hidden></p><button type="button" class="text-button" id="clear-inactive-controls" hidden>Clear inactive saved settings</button></form></div>`,`<button class="text-button" id="reset-controls">Reset controls</button><button class="secondary" data-action="close">Cancel</button><button class="primary" id="apply-controls">Apply changes</button>`,true,'Fine-tune your sound. Your description stays editable.');
  for(const [path,n]of nodeMap)if(get(draft,path)!==undefined&&!active(n.active_when,draft,path))loadedInactive.add(path);
  const clearInactive=$('#clear-inactive-controls');clearInactive.hidden=loadedInactive.size===0;
  clearInactive.onclick=()=>{loadedInactive.clear();clearInactive.hidden=true;$('#controls-error').hidden=true;conditionals();};
  bind();
  for(const el of $$('[data-enable]'))el.onchange=()=>{conditionals();updateAvailability();};
  $('#control-search').oninput=filter;
  $$('[data-group]').forEach(b=>b.onclick=()=>{group=b.dataset.group;$$('[data-group]').forEach(x=>x.toggleAttribute('aria-current',x===b));filter();});
  $('#reset-controls').onclick=()=>open({prompt:$('[data-path="prompt"]').value});
  $('#apply-controls').onclick=()=>{
    try{
      P.assertDraftVersion?.(openedVersion);
      const normalized=payload(collect());
      state.draft={...normalized,_scene:state.draft._scene,_quickLines:state.draft._quickLines};
      if($('#prompt'))$('#prompt').value=state.draft.prompt||'';
      saveDraft();syncQuick();P.autoSizePrompt?.();closeDialog();toast('Your sound is updated');
    }catch(error){showError(error);}
  };
  conditionals();updateAvailability();
  if(draft.prompt?.trim()||draft.capabilities===true)try{payload(draft);}catch(error){showError(error);}
}
function nodeAt(path){
  const tokens=String(path).replace(/\[(\d+)\]/g,'.$1').split('.');
  const key=tokens.shift();let n=S.parameters.find(x=>x.key===key);
  for(const token of tokens)n=/^\d+$/.test(token)?n?.items:n?.fields?.find(x=>x.key===token);
  return n;
}
function formatIssues(issues){
  return (Array.isArray(issues)?issues:[]).map(issue=>{
    const path=String(issue.path||issue.field||''),n=nodeAt(path),top=S.parameters.find(x=>x.key===path.split(/[.[]/)[0]);
    const title=n?(top&&n!==top?label(top)+' · ':'')+label(n):path.replaceAll('_',' ')||'Music settings';
    const item=[...path.matchAll(/\[(\d+)\]/g)].map(x=>Number(x[1])+1);
    return title+(item.length?' (item '+item.join(', ')+')':'')+': '+String(issue.message||issue.reason||'Review this setting.');
  }).join('\n');
}
function choiceLabel(key,value){const n=S.parameters.find(x=>x.key===key);const text=n?.options?.find(o=>o.id===value)?.label||String(value||'Any');return text.charAt(0).toUpperCase()+text.slice(1);}
function syncQuick(){
 for(const key of ['genres','moods','instruments','eras']){const el=$('[data-value="'+key+'"]');if(el)el.textContent=state.draft[key]?.length?state.draft[key].map(v=>choiceLabel(key,v)).slice(0,2).join(', '):'Any';}
 if($('[data-value="scene"]'))$('[data-value="scene"]').textContent=state.draft._scene||'Any scene';
 if($('[data-value="vocal"]'))$('[data-value="vocal"]').textContent=state.draft.vocal?.mode==='instrumental'?'Instrumental':state.draft.vocal?.mode?state.draft.vocal.mode[0].toUpperCase()+state.draft.vocal.mode.slice(1):'Instrumental';
 const curve=state.draft.energy_curve,energy=curve?.points?.[0]?.v;
 const flat=curve?.preset==='flat'&&curve.points?.length&&curve.points.every(p=>p.v===energy);
 const energyText=!curve?'Auto · move to set':flat?Math.round(energy*100)+'%':'Custom curve';
 if($('#energy')){$('#energy').value=energy===undefined?50:energy*100;$('#energy').style.setProperty('--fill',(energy===undefined?50:energy*100)+'%');$('#energy').dataset.auto=String(!curve);$('#energy').setAttribute('aria-valuetext',energyText);}
 if($('#energy-value'))$('#energy-value').textContent=energyText;
 const selected=S.parameters.filter(n=>n.key!=='prompt'&&state.draft[n.key]!==undefined),summary=$('#selected-settings');
 if(summary){const details=[];if(state.draft.duration?.target_seconds)details.push(state.draft.duration.target_seconds+'s');if(state.draft.lyrics?.mode)details.push(state.draft.lyrics.mode==='custom'?(state.draft.lyrics.text?.trim()?'Custom lyrics attached':'Custom lyrics · add your words'):state.draft.lyrics.mode==='ai_write'?'AI-written lyrics':'No lyrics');if(state.draft.prompt_enhance?.enabled)details.push('Enhance on creation');if(state.draft.dry_run===true||state.draft.capabilities===true)details.push('No music: preview mode');summary.textContent=[selected.length+' selected controls',...details].join(' · ');}
 P.refreshCreateButton?.();window.PMPLyricsComposer?.sync();
}
function init(){/* An empty draft stays empty; defaults belong to the music service. */}
function describe(draft){const parts=[];for(const key of ['genres','moods','eras','instruments'])if(draft[key]?.length)parts.push(`${key==='genres'?'Style':key==='moods'?'Mood':key==='eras'?'Era':'Instruments'}: ${draft[key].map(v=>choiceLabel(key,v)).join(', ')}.`);if(draft.vocal?.mode)parts.push(draft.vocal.mode==='instrumental'?'Keep it instrumental.':`Voice: ${draft.vocal.mode}.`);return parts.join(' ');}
function quick(key){
  const openedVersion=P.draftVersion?.();
  if(key==='scene'){
    P.picker('Set the scene',['Night drive','Rainy afternoon','Sunrise','A quiet evening','City lights','Ocean escape','Open road','Your own scene'],value=>{
      if(value==='Your own scene'){
        dialog('Set the scene',`<label class="field"><span>What is happening around you?</span><input id="scene-text" placeholder="A moment, a place, a memory…"></label><p id="controls-error" role="alert" class="form-status error" hidden></p>`,`<button class="primary" id="apply-scene">Use this scene</button>`);
        $('#apply-scene').onclick=()=>applyScene($('#scene-text').value.trim());
      }else applyScene(value);
    },state.draft._scene);return;
  }
  working=clone(state.draft);multiValues.clear();nodeMap.clear();loadedInactive.clear();unmapped={};
  const n=S.parameters.find(n=>n.key===key);if(!n){toast('This setting is not available.');return;}
  if(key==='vocal'){
    dialog('Choose your vocals',`<form id="quick-vocal">${render(n,'vocal',working.vocal)}</form><p id="controls-error" role="alert" class="form-status error" hidden></p>`,`<button class="secondary" data-action="close">Cancel</button><button class="primary" id="apply-vocal">Apply changes</button>`);
    bind($('#quick-vocal'));
    $('#apply-vocal').onclick=()=>{
      try{
        P.assertDraftVersion?.(openedVersion);
        const voice=read(n,'vocal',working);
        validateNode(n,voice,'vocal',{...state.draft,vocal:voice});
        if((voice?.mode??n.default?.mode)==='instrumental'&&['custom','ai_write'].includes(state.draft.lyrics?.mode))throw Error('Your lyrics are still saved. Choose a singing voice, or change Lyrics to No lyrics first.');
        addDescription('','vocal');
        if(voice===undefined)delete state.draft.vocal;else state.draft.vocal=voice;
        saveDraft();syncQuick();closeDialog();
      }catch(error){showError(error);}
    };return;
  }
  dialog({genres:'Choose your genre',moods:'Set the mood',eras:'Choose an era',instruments:'Choose an instrument'}[key],`<form id="quick-form">${render(n,key,state.draft[key])}</form><p id="controls-error" role="alert" class="form-status error" hidden></p>`,`<button class="text-button" id="clear-quick">Clear selection</button><button class="primary" id="apply-quick">Apply changes</button>`);
  bind($('#quick-form'));
  $('#clear-quick').onclick=()=>{multiValues.get(key).clear();optionList($('.multi-control'));};
  $('#apply-quick').onclick=()=>{
    try{
      P.assertDraftVersion?.(openedVersion);
      const values=[...multiValues.get(key)];validateNode(n,values,key,{...state.draft,[key]:values});
      addDescription('',key);state.draft[key]=values;saveDraft();syncQuick();closeDialog();
    }catch(error){showError(error);}
  };
}
function addDescription(text,key='scene'){
  const lines={...(state.draft._quickLines||{})};
  let prompt=state.draft.prompt||'';
  if(lines[key])prompt=prompt.replace(lines[key],'');
  if(text){prompt+=(prompt&&!prompt.endsWith('\n')?'\n':'')+text;lines[key]=text;}else delete lines[key];
  // Preserve every character. The same contract validator reports length errors
  // before a request; the user's writing is never shortened to fit a limit.
  state.draft._quickLines=lines;state.draft.prompt=prompt;
  if($('#prompt'))$('#prompt').value=prompt;
  saveDraft();P.autoSizePrompt?.();
}
function applyScene(value){
  if(!value)return;
  addDescription(`Scene: ${value}.`);
  state.draft._scene=value;saveDraft();syncQuick();closeDialog();
}
window.PMPControls={open,quick,payload,describe,syncQuick,init,formatIssues,label,schema:S};
})();
