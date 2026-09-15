import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {projectControlsSchema,validateRequest} from '../server/validation.mjs';

const raw=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json',import.meta.url),'utf8'));
const schema=projectControlsSchema(raw),copy=value=>JSON.parse(JSON.stringify(value));
const source=name=>readFileSync(new URL('../public/'+name,import.meta.url),'utf8');
// Actual composer + actual controls validator over an explicit local DOM model.
// These are interaction/serialization checks, not native layout or music proof.
function harness(draft={prompt:'A song about home.'}){
  class Element{
    constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.parentElement=null;this.dataset={};this.attrs={};this.value='';this.hidden=false;this._text='';this.id='';this.className='';this.classList={toggle:(name,on)=>{const values=new Set(this.className.split(' ').filter(Boolean));on?values.add(name):values.delete(name);this.className=[...values].join(' ');}};}
    setAttribute(name,value){this.attrs[name]=String(value);}getAttribute(name){return this.attrs[name]??null;}
    append(...nodes){for(const node of nodes)this.insertBefore(node,null);}
    insertBefore(node,before){node.remove();const at=before?this.children.indexOf(before):this.children.length;this.children.splice(at,0,node);node.parentElement=this;return node;}
    remove(){if(this.parentElement){this.parentElement.children.splice(this.parentElement.children.indexOf(this),1);this.parentElement=null;}}
    contains(node){return node===this||this.children.some(child=>child.contains(node));}
    get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}set textContent(value){this._text=String(value);for(const child of [...this.children])child.remove();}
    matches(selector){if(selector.startsWith('#'))return this.id===selector.slice(1);if(selector.startsWith('.'))return this.className.split(' ').includes(selector.slice(1));if(selector.startsWith('['))return false;return this.tagName.toLowerCase()===selector;}
    querySelectorAll(selector){return this.children.flatMap(child=>[...(child.matches(selector)?[child]:[]),...child.querySelectorAll(selector)]);}
    querySelector(selector){return this.querySelectorAll(selector)[0]??null;}
  }
  const body=new Element('body'),form=new Element('form'),energy=new Element('div'),prompt=new Element('textarea');form.id='composer';energy.className='energy';prompt.id='prompt';prompt.value=draft.prompt||'';form.append(prompt,energy);body.append(form);
  const storage=new Map(),errors=[];let saves=0,storageFail=false;
  const P={state:{draft:copy(draft)},$:(selector,root=body)=>root.querySelector(selector),$$:(selector,root=body)=>root.querySelectorAll(selector),esc:String,icon:()=>'',onInput:[],onChange:[],pageHooks:[],toast:message=>errors.push(message),storage:{get:(key,fallback)=>storage.has(key)?copy(storage.get(key)):fallback,set(key,value){if(storageFail&&key==='lyricsComposerWriting')return false;storage.set(key,copy(value));return true;}},saveDraft(){saves++;P.state.draft.prompt=prompt.value;P.storage.set('draft',P.state.draft);}};
  const window={PMP:P,PMP_SCHEMA:copy(schema)},context=vm.createContext({window,document:{createElement:tag=>new Element(tag)},URL});
  vm.runInContext(source('request-contract.js'),context);vm.runInContext(source('controls.js'),context);vm.runInContext(source('lyrics-composer.js'),context);
  for(const hook of P.pageHooks)hook();
  return{P,window,body,form,energy,storage,errors,$:P.$,get saves(){return saves;},setStorageFail(value){storageFail=value;},change(id,value,type='change'){const input=P.$(id);assert.ok(input,id);input.value=value;for(const hook of type==='input'?P.onInput:P.onChange)hook(input);},payload(){return copy(window.PMPControls.payload(P.state.draft));},verify(){return validateRequest(this.payload(),raw);}};
}

test('main composer is visible before energy, uses exact schema modes, and leaves untouched fields omitted',()=>{
  const h=harness(),before=copy(h.P.state.draft);
  assert.ok(h.form.children.indexOf(h.$('#lyrics-composer'))<h.form.children.indexOf(h.energy));
  assert.equal(h.$('#lyrics-composer').hidden,false);assert.equal(h.$('#lyrics-composer-title').textContent,'Give your sound a voice');
  assert.deepEqual(h.$('#lyrics-source').children.map(option=>option.value),['',...schema.parameters.find(n=>n.key==='lyrics').fields.find(n=>n.key==='mode').options.map(o=>o.id)]);
  assert.equal(h.$('#lyrics-source').value,'');assert.equal(h.$('#lyrics-text').parentElement.hidden,true);assert.equal(h.$('#lyrics-theme').parentElement.hidden,true);
  assert.deepEqual(h.P.state.draft,before);assert.deepEqual(h.payload(),before);assert.equal(h.saves,0);assert.equal(h.storage.size,0);
});

test('custom lyrics require an explicit voice and retain every native selected field including false',()=>{
  const h=harness({prompt:'A song.',async:false,vocal:{mode:'instrumental',language:'tr',language_policy:'measure'},lyrics:{verify:false,language:'tr',script:'latin'}});
  h.change('#lyrics-source','custom');h.change('#lyrics-text','[Verse]\nİçimde 🎵\n  Every space stays.  ','input');
  assert.equal(h.$('#lyrics-text').parentElement.hidden,false);assert.equal(h.$('#lyrics-theme').parentElement.hidden,true);
  assert.equal(h.$('#lyrics-voice-notice').hidden,false);assert.equal(h.P.state.draft.vocal.mode,'instrumental');
  assert.throws(()=>h.payload(),/Choose a voice/);
  h.change('#lyrics-voice','female');const accepted=h.verify();
  assert.deepEqual(accepted.lyrics,{verify:false,language:'tr',script:'latin',mode:'custom',text:'[Verse]\nİçimde 🎵\n  Every space stays.  '});
  assert.deepEqual(accepted.vocal,{mode:'female',language:'tr',language_policy:'measure'});assert.equal(accepted.async,false);
  assert.equal(h.$('#lyrics-voice-notice').hidden,true);
});

test('theme writing dispatches ai_write, not a fabricated auto mode, and never chooses a language or verification value',()=>{
  const h=harness();h.change('#lyrics-source','ai_write');h.change('#lyrics-theme','A letter to the home I left.\nHope after loss.','input');
  assert.equal(h.$('#lyrics-theme').parentElement.hidden,false);assert.equal(h.$('#lyrics-text').parentElement.hidden,true);assert.equal(h.P.state.draft.vocal,undefined);
  assert.throws(()=>h.payload(),/Choose a voice/);h.change('#lyrics-voice','plan_decides');const accepted=h.verify();
  assert.deepEqual(accepted.lyrics,{mode:'ai_write',theme:'A letter to the home I left.\nHope after loss.'});assert.deepEqual(accepted.vocal,{mode:'plan_decides'});
  assert.equal(Object.hasOwn(accepted.lyrics,'verify'),false);assert.equal(Object.hasOwn(accepted.lyrics,'language'),false);
});

test('mode changes preserve custom and theme writing locally and send only the active field',()=>{
  const h=harness({prompt:'Music.',vocal:{mode:'male'},lyrics:{mode:'custom',text:'Exact original\n🎵',verify:false,language:'en',script:'auto'}});
  h.change('#lyrics-source','ai_write');assert.equal(h.P.state.draft.lyrics.text,undefined);assert.equal(h.storage.get('lyricsComposerWriting').text,'Exact original\n🎵');
  h.change('#lyrics-theme','A different theme.','input');h.change('#lyrics-source','none');
  assert.deepEqual(h.verify().lyrics,{mode:'none',verify:false,language:'en',script:'auto'});
  h.change('#lyrics-source','custom');assert.equal(h.$('#lyrics-text').value,'Exact original\n🎵');assert.equal(h.verify().lyrics.theme,undefined);
  h.change('#lyrics-source','ai_write');assert.equal(h.$('#lyrics-theme').value,'A different theme.');assert.equal(h.verify().lyrics.text,undefined);
  assert.equal(h.verify().lyrics.verify,false);
});

test('partial typing persists without throwing; submission validates required words and Unicode code-point caps',()=>{
  const h=harness({prompt:'Music.',vocal:{mode:'male'}});h.change('#lyrics-source','custom');
  h.change('#lyrics-text','','input');assert.throws(()=>h.payload(),/lyrics|required|Enter/i);assert.equal(h.$('#lyrics-local-error').hidden,true);
  h.change('#lyrics-text','🎵'.repeat(2000),'input');assert.equal(Array.from(h.verify().lyrics.text).length,2000);assert.equal(h.$('#lyrics-text-count').textContent,'2,000 / 2,000 characters');
  h.change('#lyrics-text','🎵'.repeat(2001),'input');assert.equal(h.P.state.draft.lyrics.text.length,4002);assert.equal(h.$('#lyrics-text').getAttribute('maxlength'),null);
  assert.equal(h.$('#lyrics-text').getAttribute('aria-invalid'),'true');assert.throws(()=>h.payload(),/2000/);assert.equal(h.$('#lyrics-local-error').hidden,true);
  h.change('#lyrics-source','ai_write');h.change('#lyrics-theme','🎵'.repeat(1001),'input');assert.throws(()=>h.payload(),/1000/);assert.equal(Array.from(h.P.state.draft.lyrics.theme).length,1001);
});

test('language, script and verification map their native types and blank choices remove only the chosen field',()=>{
  const h=harness({prompt:'Music.',vocal:{mode:'duet'},lyrics:{mode:'ai_write',theme:'Home.'}});
  h.change('#lyrics-language','tr','input');h.change('#lyrics-script','latin');h.change('#lyrics-verify','false');
  assert.deepEqual(h.verify().lyrics,{mode:'ai_write',theme:'Home.',language:'tr',script:'latin',verify:false});
  h.change('#lyrics-verify','true');assert.equal(h.verify().lyrics.verify,true);
  h.change('#lyrics-verify','');h.change('#lyrics-language','','input');h.change('#lyrics-script','');
  assert.deepEqual(h.verify().lyrics,{mode:'ai_write',theme:'Home.'});
});

test('All controls and quick-vocal synchronization updates the same main form without recreating or losing focusable fields',()=>{
  const h=harness();const input=h.$('#lyrics-text'),root=h.$('#lyrics-composer');
  h.P.state.draft={prompt:'Changed in All controls.',vocal:{mode:'spoken'},lyrics:{mode:'custom',text:'New\n<words> & 🎵',verify:false,language:'ja'}};
  h.window.PMPControls.syncQuick();
  assert.equal(h.$('#lyrics-text'),input);assert.equal(h.$('#lyrics-composer'),root);assert.equal(input.value,'New\n<words> & 🎵');
  assert.equal(h.$('#lyrics-source').value,'custom');assert.equal(h.$('#lyrics-voice').value,'spoken');assert.equal(h.$('#lyrics-verify').value,'false');assert.equal(h.$('#lyrics-language').value,'ja');
  assert.equal(h.$('#lyrics-composer').querySelectorAll('script').length,0);
  for(const hook of h.P.pageHooks)hook();assert.equal(h.form.querySelectorAll('#lyrics-composer').length,1);
});

test('invalid saved fields remain visible and are rejected by the shared validator, never silently dropped',()=>{
  const h=harness({prompt:'Music.',lyrics:{mode:'unexpected',verify:'false',unknown:'Keep for explicit correction'},vocal:{mode:'instrumental'}});
  assert.equal(h.$('#lyrics-source').value,'unexpected');assert.match(h.$('#lyrics-source').children.at(-1).textContent,/Saved value/);
  h.change('#lyrics-source','none');assert.equal(h.P.state.draft.lyrics.unknown,'Keep for explicit correction');assert.equal(h.P.state.draft.lyrics.verify,'false');assert.throws(()=>h.payload(),/Unexpected|On or Off|unknown/i);
});

test('failed local writing preservation prevents destructive source changes and reports the concrete failure',()=>{
  const h=harness({prompt:'Music.',lyrics:{mode:'custom',text:'Do not lose these words',verify:false},vocal:{mode:'male'}}),before=copy(h.P.state.draft);
  h.setStorageFail(true);h.change('#lyrics-source','none');assert.deepEqual(h.P.state.draft,before);assert.equal(h.$('#lyrics-source').value,'custom');
  assert.equal(h.$('#lyrics-local-error').hidden,false);assert.match(h.$('#lyrics-local-error').textContent,/could not keep/);assert.equal(h.saves,0);
});

test('selecting the default keeps omission and does not alter independently selected voice or lyric flags',()=>{
  const h=harness({prompt:'Music.',vocal:{mode:'female',language:'tr'},lyrics:{mode:'custom',text:'Exact words.',verify:false}});
  h.change('#lyrics-source','');assert.deepEqual(h.verify().lyrics,{verify:false});assert.deepEqual(h.verify().vocal,{mode:'female',language:'tr'});
  h.change('#lyrics-voice','');assert.deepEqual(h.verify().vocal,{language:'tr'});assert.equal(h.P.state.draft.lyrics.verify,false);
});
