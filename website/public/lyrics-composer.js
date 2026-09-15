(() => {
'use strict';
const P=window.PMP,C=window.PMPControls;
if(!P||!C)return;
const schema=C.schema,lyricsNode=schema.parameters.find(n=>n.key==='lyrics'),vocalNode=schema.parameters.find(n=>n.key==='vocal');
if(!lyricsNode||!vocalNode)return;
const field=key=>lyricsNode.fields.find(n=>n.key===key),voiceNode=vocalNode.fields.find(n=>n.key==='mode');
const labels={none:'No lyrics',custom:'Use my lyrics',ai_write:'Write lyrics for me'};
const writingKey='lyricsComposerWriting';
let controls=null;
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
const own=(value,key)=>object(value)&&Object.hasOwn(value,key)?value[key]:undefined;
const create=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
function inputLabel(parent,id,title,tag='select'){
  const row=create('div','lyrics-field'),label=create('label','',title),input=create(tag);
  label.htmlFor=id;input.id=id;row.append(label,input);parent.append(row);return{row,input};
}
function options(select,node,emptyLabel,customLabels={}){
  const empty=create('option','',emptyLabel);empty.value='';select.append(empty);
  for(const value of node?.options||[]){const el=create('option','',customLabels[value.id]||value.label);el.value=String(value.id);select.append(el);}
}
function selected(input,value){
  const current=value===undefined?'':String(value);
  if(input.tagName.toLowerCase()==='select'){
    for(const option of [...input.children])if(option.dataset.savedValue)option.remove();
    if(current&&!Array.from(input.children).some(option=>option.value===current)){
      const option=create('option','',`Saved value: ${current} — review this setting`);option.value=current;option.dataset.savedValue='true';input.append(option);
    }
  }
  if(input.value!==current)input.value=current;
}
function count(input,node,output){
  const length=Array.from(input.value).length,max=node?.max_length;
  output.textContent=max?`${length.toLocaleString('en')} / ${max.toLocaleString('en')} characters`:`${length.toLocaleString('en')} characters`;
  input.setAttribute('aria-invalid',String(max!==undefined&&length>max));
  output.classList.toggle('lyrics-over-limit',max!==undefined&&length>max);
}
function sync(){
  const form=P.$('#composer');if(!form)return;
  if(!controls||!form.contains(controls.root))mount(form);
  const l=P.state.draft.lyrics,v=P.state.draft.vocal;
  for(const key of ['mode','text','theme','language','script','verify'])selected(controls[key],own(l,key));
  selected(controls.voice,own(v,'mode'));
  const mode=own(l,'mode')??lyricsNode.default?.mode,hasLyrics=['custom','ai_write'].includes(mode);
  controls.textRow.hidden=mode!=='custom';controls.themeRow.hidden=mode!=='ai_write';controls.voiceRow.hidden=!hasLyrics;controls.settings.hidden=!hasLyrics;
  controls.root.dataset.mode=mode||'unset';
  const voice=own(v,'mode')??vocalNode.default?.mode;
  controls.voiceNotice.hidden=!hasLyrics||voice!=='instrumental';
  controls.voiceNotice.textContent='Choose a voice for these lyrics. Your instrumental setting stays unchanged until you select one.';
  controls.description.textContent=mode==='custom'?'Your words, with every line kept as written. The result will report what was verified.':mode==='ai_write'?'Give your lyrics a direction. Their language and delivery stay under your control.':'Keep it wordless, or give this song something to say.';
  count(controls.text,field('text'),controls.textCount);count(controls.theme,field('theme'),controls.themeCount);
}
function mount(form){
  const root=create('section','lyrics-composer');root.id='lyrics-composer';root.setAttribute('aria-labelledby','lyrics-composer-title');
  const heading=create('div','lyrics-composer-heading'),title=create('h3','','Give your sound a voice');title.id='lyrics-composer-title';
  const kicker=create('span','lyrics-kicker','LYRICS');heading.append(kicker,title);root.append(heading);
  const description=create('p','lyrics-description');root.append(description);
  const source=inputLabel(root,'lyrics-source','Lyrics source');source.input.dataset.lyricsField='mode';
  options(source.input,field('mode'),'Use service default · No lyrics',labels);
  const text=inputLabel(root,'lyrics-text','Your lyrics','textarea');text.input.rows=7;text.input.dir='auto';text.input.dataset.lyricsField='text';text.input.placeholder='Write or paste your lyrics. Keep your verses, chorus, and line breaks.';
  const textCount=create('span','lyrics-count');textCount.id='lyrics-text-count';text.input.setAttribute('aria-describedby',textCount.id);text.row.append(textCount);
  const theme=inputLabel(root,'lyrics-theme','What should the lyrics be about?','textarea');theme.input.rows=3;theme.input.dir='auto';theme.input.dataset.lyricsField='theme';theme.input.placeholder='A story, a feeling, a moment. What do you want the song to say?';
  const themeCount=create('span','lyrics-count');themeCount.id='lyrics-theme-count';theme.input.setAttribute('aria-describedby',themeCount.id);theme.row.append(themeCount);
  const voice=inputLabel(root,'lyrics-voice','Voice');voice.input.dataset.lyricsField='voice';options(voice.input,voiceNode,'Choose a voice');
  const voiceNotice=create('p','lyrics-voice-notice');voiceNotice.id='lyrics-voice-notice';voiceNotice.setAttribute('role','status');voice.row.append(voiceNotice);voice.input.setAttribute('aria-describedby',voiceNotice.id);
  const settings=create('div','lyrics-settings');root.append(settings);
  const language=inputLabel(settings,'lyrics-language','Lyrics language','input');language.input.dataset.lyricsField='language';language.input.type='text';language.input.autocomplete='off';language.input.placeholder='Use service default';language.input.setAttribute('list','lyrics-language-list');
  const list=create('datalist');list.id='lyrics-language-list';for(const entry of field('language')?.options||[]){const option=create('option','',entry.label);option.value=String(entry.id);list.append(option);}language.row.append(list);
  const script=inputLabel(settings,'lyrics-script','Writing system');script.input.dataset.lyricsField='script';options(script.input,field('script'),'Use service default');
  const verify=inputLabel(settings,'lyrics-verify','Check the sung words');verify.input.dataset.lyricsField='verify';options(verify.input,field('verify'),'Use service default',{true:'Request a lyric check',false:'Do not request a lyric check'});
  const notice=create('p','lyrics-keep-note','Switching lyric source keeps your writing on this device. Only the selected source is sent.');root.append(notice);
  const error=create('p','lyrics-local-error');error.id='lyrics-local-error';error.setAttribute('role','alert');error.hidden=true;root.append(error);
  form.insertBefore(root,form.querySelector('.energy'));
  controls={root,description,mode:source.input,text:text.input,textRow:text.row,textCount,theme:theme.input,themeRow:theme.row,themeCount,voice:voice.input,voiceRow:voice.row,voiceNotice,settings,language:language.input,script:script.input,verify:verify.input,error};
}
function edit(input){
  if(!controls||!controls.root.contains(input))return;
  const key=input.dataset.lyricsField;if(!['mode','text','theme','language','script','verify','voice'].includes(key))return;
  try{
    const target=key==='voice'?'vocal':'lyrics',property=key==='voice'?'mode':key;
    const previous=P.state.draft[target];
    if(previous!==undefined&&!object(previous))throw Error('Review this saved setting in All controls before editing it here.');
    const value=key==='verify'?(input.value===''?undefined:input.value==='true'?true:input.value==='false'?false:input.value):['text','theme'].includes(key)?input.value:input.value===''?undefined:input.value;
    if(own(previous,property)===value)return;
    const next={...previous};
    if(value===undefined)delete next[property];else next[property]=value;
    if(key==='mode'){
      const saved=P.storage.get(writingKey,{}),writing={};
      for(const name of ['text','theme']){
        const keep=own(previous,name)??own(saved,name);if(typeof keep==='string')writing[name]=keep;
        delete next[name];
      }
      const active=value==='custom'?'text':value==='ai_write'?'theme':null;
      if(active&&Object.hasOwn(writing,active))next[active]=writing[active];
      if(P.storage.set(writingKey,writing)===false)throw Error('Your browser could not keep the previous lyrics. Keep this tab open and save your writing before changing source.');
    }
    if(Object.keys(next).length)P.state.draft[target]=next;else delete P.state.draft[target];
    // Partial writing is persisted without invoking the full request validator.
    // Enhance/Create and All controls use PMPControls.payload at submission.
    P.saveDraft();controls.error.hidden=true;C.syncQuick();sync();
  }catch(error){sync();controls.error.textContent=error.message;controls.error.hidden=false;}
}
P.onInput.push(input=>{if(['text','theme','language'].includes(input.dataset.lyricsField))edit(input);});
P.onChange.push(edit);
P.pageHooks.push(sync);
window.PMPLyricsComposer=Object.freeze({sync});
})();
