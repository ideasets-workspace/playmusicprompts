import {VISUAL_SCHEMA,VISUAL_DEFAULTS,VISUAL_PRESETS,VISUAL_STORAGE_KEY} from './player-three-visual-settings.js';
import {getScene} from './player-three-collection.js';

// The preview hosts the original scene. One canvas, one renderer, the same music.
export function createVisualStudio({store,getRoom,getModel,toast,audio,togglePlay,onManualEdit=()=>{},onCompareChange=()=>{}}){
  const panel=document.querySelector('#visual-panel'),q=s=>panel.querySelector(s),STUDIO_TABS=['look','motion','scene','world','director'];
  let state=store.read(),settings={...state.settings},comparing=false,activeTab='look',anchor=null,selectedId=null;
  const dirty=new Map(),rows=new Map();
  const original=[...panel.children],header=q('.drawer-head');
  const find=s=>panel.querySelector(s),heading=s=>find(s).closest('.setting-heading');
  const groups={look:[heading('#intensity-value'),find('#intensity'),find('label[for="quality"]'),find('#quality'),find('#quality').nextElementSibling],motion:[heading('#motion'),find('#motion-note'),heading('#reactivity-value'),find('#reactivity'),heading('#auto-orbit'),heading('#auto-orbit').nextElementSibling],scene:[find('.scene-selection-title'),find('#scene-collection'),find('#scene-experience-note'),find('#record-form-controls'),find('#record-spin-controls')]};
  header.querySelector('.eyebrow').textContent='EVERY WORLD. YOUR SIGNATURE.';
  header.querySelector('h2').innerHTML='Visual Studio<span>.</span>';
  panel.classList.add('visual-studio');
  const shell=document.createElement('div');shell.className='studio-shell';
  shell.innerHTML=`<div class="studio-preview"><div id="studio-preview-slot"></div><div class="studio-preview-top"><span><i></i> LIVE PREVIEW</span><strong id="studio-scene-name"></strong></div><div class="studio-preview-bottom"><button id="studio-play" type="button">Play music</button><button id="studio-reset-view" type="button">Reset view ↗</button></div></div>
    <div class="studio-presets"><div class="studio-preset-line"><label class="sr-only" for="studio-preset">Visual look</label><select id="studio-preset"></select><button id="studio-compare" type="button" aria-pressed="false" title="Temporarily preview the original studio settings">Compare</button></div><p id="studio-preset-description"></p><div class="studio-preset-actions"><button id="studio-save" type="button">＋ Save look</button><button id="studio-delete" type="button" hidden>Delete look</button><span></span><button id="studio-import" type="button">Import</button><button id="studio-export" type="button">Export</button></div><form id="studio-save-form" hidden><label class="sr-only" for="studio-look-name">Name your visual look</label><input id="studio-look-name" maxlength="48" required placeholder="Name your signature look" autocomplete="off"><button type="submit">Save</button><button id="studio-cancel-save" type="button" aria-label="Cancel saving look">×</button></form><input type="file" id="studio-import-file" accept=".json,application/json" hidden></div>
    <div class="studio-tabs" role="tablist" aria-label="Visual controls">${STUDIO_TABS.map((tab,i)=>`<button id="studio-tab-${tab}" role="tab" aria-selected="${i===0}" aria-controls="studio-view-${tab}" tabindex="${i===0?0:-1}">${['Look','Motion','Scene','World','Director'][i]}</button>`).join('')}</div><div class="studio-body">${STUDIO_TABS.map((tab,i)=>`<div id="studio-view-${tab}" role="tabpanel" aria-labelledby="studio-tab-${tab}" ${i?'hidden':''}><div class="studio-tab-intro"><h3>${['Light becomes feeling.','Give your sound a pulse.','A world with your name on it.'][i]}</h3><p>${['Shape the light, color and atmosphere.','Fine-tune how your world moves with your music.','Choose a scene, then make every detail your own.'][i]}</p></div><div class="studio-original-controls"></div><div class="studio-advanced-controls"></div></div>`).join('')}</div><div class="studio-footer"><span id="studio-status" role="status">Saved on this device</span><button id="studio-reset" type="button">Reset studio ↺</button></div>`;
  panel.append(shell);q('#studio-view-director').replaceChildren();q('#studio-view-world').replaceChildren();
  for(const [tab,nodes] of Object.entries(groups))nodes.filter(Boolean).forEach(node=>q(`#studio-view-${tab} .studio-original-controls`).append(node));
  original.filter(node=>node!==header&&node.parentElement===panel).forEach(node=>node.remove());
  const help={exposure:'Brightness of the finished scene.',bloom:'Glow around the brightest light. Available in Adaptive and High detail.',bloomRadius:'How far the glow spreads.',saturation:'From monochrome to vivid color.',vignette:'Draw attention toward the center.',particles:'How many ambient particles fill the scene.',particleGlow:'Brightness of dust, stars and light trails.',motionSpeed:'The pace of the world. Your song keeps its original speed.',bassGain:'Let low frequencies move the scene.',midGain:'Response to the body of your music.',trebleGain:'Response to detail and high frequencies.',pulseGain:'Strength of waves triggered by musical transients.',smoothing:'Higher values soften changes in the sound response.',framing:'Move closer or reveal more of the world.',orbitSpeed:'Camera speed during playback. Record, Neural and Aether.',recordSpectrum:'Reach of the sound-reactive halo and sound field.',recordReflect:'Light reflected across the floor. Adaptive and High detail.',recordFog:'Depth of the haze surrounding the record.',neuralSpread:'Width of the branching canopy.',neuralSway:'How deeply the branches bend with the music.',neuralTrail:'Width and persistence of electrical fronts.',horizonGravity:'Bend the paths of light around the dark center.',horizonFlow:'The drift of light within the disk.',horizonDetail:'Density of the luminous disk filaments.',horizonTilt:'Angle of the accretion disk.',prismWidth:'Open up the mirrored passage.',prismTwist:'The turn of the corridor around you.',prismSpeed:'Your speed through the passage.',prismGloss:'Sharpness of the reflections along the walls.'};
  function format(key,value){if(['vignette','particles','recordReflect'].includes(key))return Math.round(value*100)+'%';if(key==='recordFog')return value.toFixed(3);if(key==='horizonTilt')return (value>=0?'+':'')+Math.round(value*180/Math.PI)+'°';return value.toFixed(2).replace(/\.00$/,'')+'×';}
  for(const [key,schema] of Object.entries(VISUAL_SCHEMA)){
    const row=document.createElement('div');row.className='studio-control';if(schema.scene)row.dataset.scene=schema.scene;
    row.innerHTML=`<div class="studio-control-head"><label for="visual-${key}">${schema.label}</label><output for="visual-${key}"></output><button type="button" aria-label="Reset ${schema.label}" title="Reset to original">↺</button></div><input id="visual-${key}" type="range" min="${schema.min}" max="${schema.max}" step="${schema.step}" aria-describedby="hint-${key}"><p id="hint-${key}">${help[key]||''}</p>`;
    q(`#studio-view-${schema.group} .studio-advanced-controls`).append(row);rows.set(key,row);
    row.querySelector('input').oninput=e=>patch(key,Number(e.target.value));
    row.querySelector('button').onclick=()=>patch(key,schema.default);
  }
  // Keep first-use creative controls immediately below the preview; quality is a
  // secondary rendering preference at the end of Look.
  const qualityGroup=document.createElement('div');qualityGroup.className='studio-original-controls';
  groups.look.slice(2).forEach(node=>qualityGroup.append(node));q('#studio-view-look').append(qualityGroup);
  function apply(){getRoom()?.setVisualSettings(comparing?VISUAL_DEFAULTS:settings);}
  function selectedPreset(){const all=[...VISUAL_PRESETS,...state.presets],matches=p=>Object.keys(VISUAL_DEFAULTS).every(k=>p.settings[k]===settings[k]);return all.find(p=>p.id===selectedId&&matches(p))||all.find(matches);}
  function render(){
    for(const [key,row] of rows){row.querySelector('input').value=settings[key];row.querySelector('output').value=format(key,settings[key]);row.querySelector('button').disabled=settings[key]===VISUAL_DEFAULTS[key];row.hidden=!!row.dataset.scene&&row.dataset.scene!==getModel();}
    const match=selectedPreset(),select=q('#studio-preset');select.replaceChildren();
    const modified=new Option('Your custom mix','custom');select.add(modified);
    for(const [label,presets] of [['CURATED LOOKS',VISUAL_PRESETS],['YOUR LOOKS',state.presets]]){if(!presets.length)continue;const group=document.createElement('optgroup');group.label=label;for(const p of presets)group.append(new Option(p.name,p.id));select.append(group);}
    select.value=match?.id||'custom';
    q('#studio-preset-description').textContent=comparing?'Original settings on screen. Click Compare to return.':match?.description||(match?'Your signature, ready whenever you are.':'A little light. A little motion. Entirely yours.');
    q('#studio-delete').hidden=!state.presets.some(p=>p.id===select.value);
    q('#studio-export').disabled=state.presets.length===0;
    q('#studio-compare').setAttribute('aria-pressed',String(comparing));
    q('#studio-status').textContent=dirty.size?'Applied for this visit · not saved':comparing?'Comparing with original':'Applied · saved on this device';
    refreshScene();
  }
  function outcome(result,{settingChange=false}={}){
    state=result.ok||settingChange?result.state:store.read();
    if(settingChange){settings={...result.state.settings};comparing=false;if(result.ok)dirty.clear();}
    if(result.ok&&result.id)selectedId=result.id;
    if(!result.ok)toast(result.error||'Your changes are live for this visit. Device storage is unavailable.');
    apply();render();return result.ok;
  }
  function patch(key,value){
    endCompare();onManualEdit();
    const next={...settings,[key]:value};
    const result=dirty.size?store.replace({...store.read().settings,...Object.fromEntries(dirty),[key]:value}):store.patch(key,value);
    if(!result.ok)dirty.set(key,value);
    outcome(result,{settingChange:true});
    if(!result.ok){settings=next;apply();render();}
  }
  function replace(settingsToApply){endCompare();onManualEdit();const result=store.replace(settingsToApply);if(!result.ok)for(const [key,value] of Object.entries(settingsToApply))dirty.set(key,value);outcome(result,{settingChange:true});}
  function refreshScene(){
    q('#studio-scene-name').textContent=getScene(getModel()).name;
    for(const row of rows.values())if(row.dataset.scene)row.hidden=row.dataset.scene!==getModel();
    rows.get('orbitSpeed').querySelector('input').disabled=['orbital','liquid','tidal','monolith'].includes(getModel());
    rows.get('pulseGain').querySelector('input').disabled=getModel()==='record';
    rows.get('pulseGain').querySelector('p').textContent=getModel()==='record'?'Transient waves are available in Neural, Horizon, Prism and Aether.':help.pulseGain;
  }
  function showTab(tab,{focus=false}={}){if(!STUDIO_TABS.includes(tab))return;if(tab==='director'||tab==='world')endCompare();activeTab=tab;panel.classList.toggle('studio-directing',tab==='director');panel.classList.toggle('studio-world',tab==='world');for(const id of STUDIO_TABS){const button=q('#studio-tab-'+id);button.setAttribute('aria-selected',String(id===tab));button.tabIndex=id===tab?0:-1;q('#studio-view-'+id).hidden=id!==tab;}q('.studio-body').scrollTop=0;if(focus)q('#studio-tab-'+tab).focus();}
  q('.studio-tabs').onclick=e=>{const tab=e.target.closest('[role="tab"]');if(tab)showTab(tab.id.replace('studio-tab-',''));};
  q('.studio-tabs').onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=STUDIO_TABS,index=tabs.indexOf(activeTab);showTab(e.key==='Home'?'look':e.key==='End'?'director':tabs[(index+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length],{focus:true});};
  q('#studio-preset').onchange=e=>{const preset=[...VISUAL_PRESETS,...state.presets].find(p=>p.id===e.target.value);if(preset){selectedId=preset.id;replace(preset.settings);}};
  function endCompare(){if(!comparing)return;comparing=false;onCompareChange(false);apply();render();}
  q('#studio-compare').onclick=()=>{comparing=!comparing;onCompareChange(comparing);apply();render();};
  q('#studio-reset').onclick=()=>{selectedId='original';replace(VISUAL_DEFAULTS);toast(dirty.size?'Original settings restored for this visit.':'Original studio settings restored.');};
  q('#studio-save').onclick=()=>{q('#studio-save-form').hidden=false;q('#studio-look-name').focus();};
  q('#studio-cancel-save').onclick=()=>{q('#studio-save-form').hidden=true;q('#studio-save').focus();};
  q('#studio-save-form').onsubmit=e=>{e.preventDefault();const result=store.savePreset(q('#studio-look-name').value,settings);if(outcome(result)){q('#studio-save-form').hidden=true;q('#studio-look-name').value='';q('#studio-save').focus();toast('Your look is saved on this device.');}};
  q('#studio-delete').onclick=()=>{const preset=state.presets.find(p=>p.id===q('#studio-preset').value);if(preset&&outcome(store.deletePreset(preset.id)))toast('Saved look deleted. Your current view stays with you.');};
  q('#studio-import').onclick=()=>q('#studio-import-file').click();
  q('#studio-import-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error('Choose a visual looks file under 100 KB.');const payload=await file.text();if(outcome(store.importPresets(payload)))toast('Your looks are ready in the menu.');}catch(error){toast(error.message||'This visual looks file could not be read.');}finally{e.target.value='';}};
  q('#studio-export').onclick=()=>{const blob=new Blob([store.exportPresets()],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='playmusicprompts-visual-looks.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  q('#studio-reset-view').onclick=()=>getRoom()?.reset();
  function syncPlayback(){q('#studio-play').disabled=!audio.getAttribute('src');q('#studio-play').textContent=audio.paused?'▶ Play music':'Ⅱ Pause music';}
  q('#studio-play').onclick=()=>togglePlay();for(const event of ['play','pause','emptied','loadedmetadata','ended'])audio.addEventListener(event,syncPlayback);
  window.addEventListener('storage',e=>{if(e.key!==VISUAL_STORAGE_KEY&&e.key!==null)return;state=store.read();settings={...state.settings,...Object.fromEntries(dirty)};apply();render();});
  render();syncPlayback();apply();
  return {get settings(){return {...(comparing?VISUAL_DEFAULTS:settings)};},refreshScene,showTab,endCompare,
    open(){const scene=document.querySelector('#scene');if(!anchor){anchor=document.createComment('listening-room-scene');scene.before(anchor);q('#studio-preview-slot').append(scene);}refreshScene();syncPlayback();},
    close(){if(anchor){anchor.replaceWith(document.querySelector('#scene'));anchor=null;}endCompare();q('#studio-save-form').hidden=true;}
  };
}
