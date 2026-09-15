import test from 'node:test';

test('actual search finds every displayed parameter title instead of the obsolete specification label',()=>{
  const h=setup();h.api.open({prompt:'Music'});
  const input=h.$('#control-search');
  for(const n of schema.parameters){
    input.value=h.api.label(n);input.oninput();
    assert.equal(h.$('[data-parameter="'+n.key+'"]').hidden,false,n.key+' should match its displayed title');
    assert.equal(h.$('#no-controls').hidden,true,n.key);
  }
  for(const [query,key]of [['  ORGANIZING  ','labels'],['Recorded   seed','seed'],['Reference type','references'],['Time (seconds)','energy_curve'],['Track title','project'],['Peak ceiling (dB)','mastering']]){
    input.value=query;input.oninput();
    assert.equal(h.$('[data-parameter="'+key+'"]').hidden,false,query);
    const visible=h.$$('.control-card').filter(card=>!card.hidden);
    assert.equal(h.$('#control-count').textContent,visible.length+' '+(visible.length===1?'control':'controls'));
  }
});
test('nested displayed labels remain searchable before repeater rows exist, with correct empty and group states',()=>{
  const h=setup();h.api.open({prompt:'Music'});
  const input=h.$('#control-search');input.value='Your lyrics';input.oninput();
  assert.equal(h.$('[data-parameter="lyrics"]').hidden,false);
  h.$('[data-group="composition"]').onclick();
  assert.equal(h.$('[data-parameter="lyrics"]').hidden,true);
  assert.equal(h.$('#no-controls').hidden,false);assert.equal(h.$('#control-count').textContent,'0 controls');
  h.$('[data-group="all"]').onclick();input.value='nothing-matches-this-control-title';input.oninput();
  assert.equal(h.$('#no-controls').hidden,false);
  input.value='';input.oninput();
  assert.equal(h.$('#control-count').textContent,'100 controls');assert.equal(h.$('#no-controls').hidden,true);
});


test('empty nested objects and arrays retain absence instead of acquiring unselected fields',()=>{
  const h=setup();
  for(const d of [{prompt:'Music',mood_orbit:{}},{prompt:'Music',energy_curve:{}},{prompt:'Music',mood_orbit:{axes:{}}},{prompt:'Music',energy_curve:{points:[]}}]){
    h.render(d);assert.deepEqual(copy(h.api.payload(h.internal.collect())),d);
  }
});
test('quick voice choices preserve lyrics and description instead of silently replacing either',()=>{
  const h=setup(),original={prompt:'My exact description.',vocal:{mode:'female'},lyrics:{mode:'custom',text:'My exact sung words.'}};
  h.P.state.draft=copy(original);h.api.quick('vocal');
  const n=schema.parameters.find(x=>x.key==='vocal').fields.find(x=>x.key==='mode'),select=h.$('[data-path="vocal.mode"]');
  select.value=String(n.options.findIndex(x=>x.id==='instrumental'));h.$('#apply-vocal').onclick();
  assert.deepEqual(h.P.state.draft,original);assert.equal(h.closed,0);assert.match(h.$('#controls-error').textContent,/lyrics are still saved/);
  select.value=String(n.options.findIndex(x=>x.id==='male'));h.$('#apply-vocal').onclick();
  assert.equal(h.closed,1);assert.equal(h.P.state.draft.vocal.mode,'male');
  assert.deepEqual(copy(h.P.state.draft.lyrics),original.lyrics);assert.equal(h.P.state.draft.prompt,original.prompt);
});
test('scene descriptions preserve overlong Unicode text and defer a named length refusal to validation',()=>{
  const h=setup(),original='🎵'.repeat(5000);h.P.state.draft={prompt:original};
  h.internal.addDescription('Scene: A quiet evening.');
  assert.equal(h.P.state.draft.prompt,original+'\nScene: A quiet evening.');
  assert.throws(()=>h.api.payload(h.P.state.draft),/5000 characters/);
});
test('applying request behavior refreshes the actual main create button contract',()=>{
  const h=setup();h.api.open({prompt:'Music',dry_run:true});h.$('#apply-controls').onclick();
  assert.equal(h.closed,1);assert.equal(h.refreshes,1);assert.equal(h.P.state.draft.dry_run,true);
});
test('unknown saved settings stay visible as an error until an explicit reset',()=>{
  const h=setup();h.api.open({prompt:'Music',outdated_option:'Old'});
  h.$('#apply-controls').onclick();assert.equal(h.closed,0);assert.match(h.$('#controls-error').textContent,/outdated_option/);
  h.$('#reset-controls').onclick();h.$('#apply-controls').onclick();assert.equal(h.closed,1);assert.equal(h.P.state.draft.outdated_option,undefined);
});

import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {projectControlsSchema,validateRequest} from '../server/validation.mjs';

// Actual saved free capabilities + actual renderer/read/payload. This small DOM
// tests serialization and editor logic; it is not browser or music-delivery proof.
const raw=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json',import.meta.url),'utf8'));
const schema=projectControlsSchema(raw),source=readFileSync(new URL('../public/controls.js',import.meta.url),'utf8');
const copy=v=>JSON.parse(JSON.stringify(v));
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const decode=v=>String(v).replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
class Element{
  constructor(tag='div',attrs={}){this.tagName=tag;this.attrs=attrs;this.children=[];this.dataset={};this.style={setProperty(){}};this._text='';for(const k of ['hidden','disabled','checked','open'])this[k]=Object.hasOwn(attrs,k);for(const [k,v]of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=v;this.classList={add(){},toggle(){}};}
  append(...items){for(const c of items){c.parentElement=this;this.children.push(c);}}
  remove(){this.parentElement.children=this.parentElement.children.filter(x=>x!==this);}
  get value(){if(this._value!==undefined)return this._value;if(this.tagName==='textarea')return this._text;if(this.tagName==='select'){const o=this.children.filter(x=>x.tagName==='option');return(o.find(x=>Object.hasOwn(x.attrs,'selected'))||o[0])?.attrs.value??'';}return this.attrs.value??'';}
  set value(v){this._value=String(v);}
  set innerHTML(html){this.children=[];this._text='';parse(html,this);}
  get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
  set textContent(v){this._text=String(v);this.children=[];}
  insertAdjacentHTML(_,html){parse(html,this);}
  toggleAttribute(k,v){if(v)this.attrs[k]='';else delete this.attrs[k];}
  scrollIntoView(){}
  closest(s){let p=this;while(p){if(matches(p,s))return p;p=p.parentElement;}return null;}
}
function parse(html,root=new Element()){
  const stack=[root],voids=new Set(['input','br','hr','img','meta','link']);
  for(const token of html.match(/<\/?[^>]+>|[^<]+/g)||[]){
    if(token.startsWith('</')){const tag=token.slice(2,-1).trim();let i=stack.length-1;while(i>0&&stack[i].tagName!==tag)i--;if(i>0)stack.length=i;}
    else if(token.startsWith('<')){const m=/^<([a-z][a-z0-9-]*)\b([^>]*)>/i.exec(token);if(!m)continue;const attrs={};for(const a of m[2].matchAll(/([^\s=<>/]+)(?:="([^"]*)")?/g))attrs[a[1]]=decode(a[2]??'');const el=new Element(m[1],attrs);stack.at(-1).append(el);if(!voids.has(el.tagName))stack.push(el);}
    else stack.at(-1)._text+=decode(token);
  }return root;
}
const descendants=r=>r.children.flatMap(x=>[x,...descendants(x)]);
function matches(el,s){
  if(s.startsWith('#'))return el.attrs.id===s.slice(1);
  if(s.startsWith('.'))return(el.attrs.class||'').split(/\s+/).includes(s.slice(1));
  const a=/^\[([^=\]]+)(?:="(.*)")?\]$/.exec(s);
  if(a)return Object.hasOwn(el.attrs,a[1])&&(a[2]===undefined||el.attrs[a[1]]===a[2]);
  return el.tagName===s;
}
function query(s,r){
  if(s.includes(','))return[...new Set(s.split(',').flatMap(x=>query(x.trim(),r)))];
  if(s.startsWith(':scope > '))return r.children.filter(x=>matches(x,s.slice(9)));
  const d=s.indexOf(' > ');if(d>=0)return query(s.slice(0,d),r).flatMap(x=>x.children.filter(el=>matches(el,s.slice(d+3))));
  const split=s.indexOf('] ');if(split>=0)return query(s.slice(0,split+1),r).flatMap(x=>query(s.slice(split+2),x));
  return descendants(r).filter(el=>matches(el,s));
}
function setup(custom=schema){
  let root=new Element(),closed=0,saves=0,refreshes=0;
  const $=(s,r=root)=>query(s,r)[0]||null,$$=(s,r=root)=>query(s,r);
  const P={$, $$,esc,icon:()=>'',state:{draft:{prompt:'Warm piano.'}},dialog:(_title,body,footer)=>{root=parse(body+footer);},closeDialog:()=>closed++,toast(){},saveDraft:()=>saves++,autoSizePrompt(){},refreshCreateButton:()=>refreshes++,storage:{get:()=>false,set(){}}};
  const c=vm.createContext({window:{PMP:P,PMP_SCHEMA:copy(custom)},document:{createElement:tag=>new Element(tag)},URL});
  vm.runInContext(readFileSync(new URL('../public/request-contract.js',import.meta.url),'utf8'),c);
  // Instrument only the test realm to reach actual lexical functions.
  vm.runInContext(source.replace('window.PMPControls={','window.controlTest={render,read,collect,label,active,nodeAt,controlCard,conditionals,addDescription,setDraft:d=>{working=d;unmapped={};loadedInactive.clear();multiValues.clear();nodeMap.clear();}};window.PMPControls={'),c);
  const api=c.window.PMPControls,internal=c.window.controlTest;
  return{api,internal,P,$,$$,get closed(){return closed;},get saves(){return saves;},get refreshes(){return refreshes;},render(d){internal.setDraft(copy(d));root=parse(custom.parameters.map(n=>'<input type="checkbox" data-enable="'+n.key+'" '+(d[n.key]!==undefined?'checked':'')+'>'+internal.render(n,n.key,d[n.key])).join(''));return root;}};
}
function representative(n){
  const special={'vocal.mode':'female','lyrics.mode':'custom','references[].kind':'descriptor',output_package:'variations',route:'auto','duration.target_seconds':30,'duration.on_miss':'accept'};
  if(Object.hasOwn(special,n.path))return special[n.path];
  if(n.control==='key-value')return{campaign:'spring',note:'Two\nlines, together'};
  if(n.type==='object')return Object.fromEntries((n.fields||[]).filter(f=>!['lyrics.theme','references[].url'].includes(f.path)).map(f=>[f.key,representative(f)]));
  if(n.type==='array'){if(n.options?.length)return[...new Set([n.options[0].id,n.options.at(-1).id])].slice(0,n.max_items??2);if(n.items.type==='object')return[representative(n.items),representative(n.items)];return['Soft, warm details','Two\nseparate lines'];}
  if(n.type==='boolean')return n.options?.some(x=>x.id===false)?false:true;
  if(n.options?.length)return n.options[0].id;
  if(['number','integer'].includes(n.type))return n.minimum??0;
  if(n.format==='https_uri')return'https://example.com/music-finished';
  return'A warm 🎵 idea';
}
const candidate=()=>Object.fromEntries(schema.parameters.map(n=>[n.key,representative(n)]));
test('all 100 fields survive actual editor render/read with exact nested types and strings',()=>{
  const h=setup(),d=candidate();assert.equal(schema.parameters.length,100);h.render(d);
  const actual=copy(h.internal.collect(true));assert.deepEqual(Object.keys(actual).sort(),Object.keys(d).sort());assert.deepEqual(actual,d);
});
test('every current request name has actual payload coverage or an explicit website restriction',()=>{
  const h=setup();let accounted=0;
  for(const n of schema.parameters){
    const d={prompt:'Warm piano.',[n.key]:representative(n)};
    if(n.key==='variation_count')d.output_package='variations';
    if(n.key==='lyrics')d.vocal={mode:'female'};
    if(n.website?.enabled===false)assert.throws(()=>h.api.payload(d),e=>e.message.includes(n.website.reason));
    else{const actual=copy(h.api.payload(d));assert.deepEqual(actual,d,n.key);assert.deepEqual(validateRequest(actual,raw),actual,n.key);}
    accounted++;
  }assert.equal(accounted,100);
});
test('combined supported request survives renderer and current server validation without default injection',()=>{
  const h=setup(),d=candidate();for(const n of schema.parameters)if(n.website?.enabled===false)delete d[n.key];h.render(d);
  const actual=copy(h.api.payload(h.internal.collect()));assert.deepEqual(actual,d);assert.deepEqual(validateRequest(actual,raw),actual);
  const minimal={prompt:'Exact words',duration:{target_seconds:30},vocal:{mode:'female'},mastering:{true_peak_db:0}};
  h.render(minimal);assert.deepEqual(copy(h.api.payload(h.internal.collect())),minimal);
});
test('all scalar enum alternatives retain their real identifiers in rendered controls',()=>{
  const h=setup();let count=0;
  function walk(n){if(n.options_complete&&n.options&&n.type!=='array')for(const o of n.options){
    const el=query('[data-path="'+n.path+'"]',parse(h.internal.render(n,n.path,o.id)))[0];
    assert.ok(el,n.path);assert.equal(el.value,n.type==='boolean'?String(o.id):n.control==='language'?String(o.id):String(n.options.indexOf(o)),n.path);count++;
  }n.fields?.forEach(walk);if(n.items?.type==='object')walk(n.items);}
  schema.parameters.forEach(walk);assert.ok(count>300);
});
test('unknown and inactive direct or saved fields are refused, with explicit editor repair',()=>{
  const h=setup(),d={prompt:'Warm piano.',vocal:{mode:'female'},lyrics:{mode:'custom',text:'Exact words',theme:'Old theme'}};
  assert.throws(()=>h.api.payload(d),/does not apply/);assert.equal(d.lyrics.theme,'Old theme');
  assert.throws(()=>h.api.payload({prompt:'Music',variation_count:2}),/does not apply/);
  assert.throws(()=>h.api.payload({prompt:'Music',unexpected:1}),/Unexpected setting/);
  h.api.open(d);assert.equal(h.$('#controls-error').hidden,false);assert.equal(h.$('#clear-inactive-controls').hidden,false);
  h.$('#apply-controls').onclick();assert.equal(h.closed,0);
  h.$('#clear-inactive-controls').onclick();h.$('#apply-controls').onclick();assert.equal(h.closed,1);
  assert.deepEqual(copy(h.P.state.draft.lyrics),{mode:'custom',text:'Exact words'});
});
test('changing modes omits inactive UI fields while retaining text within the editor',()=>{
  const h=setup();h.api.open({prompt:'Music',vocal:{mode:'female'},lyrics:{mode:'custom',text:'Exact words'}});
  const mode=h.$('[data-path="lyrics.mode"]'),n=schema.parameters.find(x=>x.key==='lyrics').fields.find(x=>x.key==='mode');
  mode.value=String(n.options.findIndex(x=>x.id==='ai_write'));mode.onchange();h.$('[data-path="lyrics.theme"]').value='Evening walk';
  const changed=copy(h.internal.collect());assert.equal(changed.lyrics.text,undefined);assert.equal(changed.lyrics.theme,'Evening walk');assert.equal(h.$('[data-path="lyrics.text"]').value,'Exact words');
  mode.value=String(n.options.findIndex(x=>x.id==='custom'));mode.onchange();assert.equal(copy(h.internal.collect()).lyrics.text,'Exact words');
});
test('repeated reference conditions use the correct index; nested required fields and booleans are enforced',()=>{
  const h=setup(),d={prompt:'Music',references:[{kind:'descriptor',text:'Brass'},{kind:'descriptor',text:'Piano'}],energy_curve:{points:[{t:0,v:0},{t:30.5,v:1}]},prompt_enhance:{enabled:false}};
  h.render(d);assert.deepEqual(copy(h.api.payload(h.internal.collect())),d);
  assert.throws(()=>h.api.payload({...d,energy_curve:{points:[{t:0}]}}),/Add energy/);
  assert.throws(()=>h.api.payload({...d,structure:[{section:'intro'}]}),/Add bars/);
  assert.throws(()=>h.api.payload({...d,references:[{kind:'descriptor',text:'Yes'},{kind:'descriptor',url:'https://example.com'}]}),/does not apply/);
  assert.throws(()=>h.api.payload({...d,prompt_enhance:{enabled:'false'}}),/On or Off/);
});
test('Unicode limits match the server and controls do not truncate valid astral characters',()=>{
  const h=setup();
  for(const [key,size]of [['prompt',5000],['project.name',120],['project.version_note',200],['lyrics.text',2000],['prompt_blocks[0].text',280],['references[0].text',500]]){
    const n=h.internal.nodeAt(key),text='🎵'.repeat(size);assert.ok(n,key);assert.ok(!/\smaxlength=/.test(h.internal.render(n,key,text)),key);
    const d={prompt:'Music',vocal:{mode:'female'}};
    const put=(target,value)=>{if(key==='prompt')target.prompt=value;else if(key.startsWith('project.'))target.project={[key.split('.')[1]]:value};else if(key==='lyrics.text')target.lyrics={mode:'custom',text:value};else if(key.startsWith('prompt_blocks'))target.prompt_blocks=[{text:value}];else target.references=[{kind:'descriptor',text:value}];};
    put(d,text);assert.deepEqual(validateRequest(copy(h.api.payload(d)),raw),d,key);put(d,text+'🎵');assert.throws(()=>h.api.payload(d),/characters/);
  }
});
test('loop Off is intentional omission, other false switches survive, discovery needs no prompt',()=>{
  const h=setup();assert.deepEqual(copy(h.api.payload({prompt:'Music',loop_ready:false,async:false,dry_run:false,normalize_output:false,arrangement_ai:false})),{prompt:'Music',async:false,dry_run:false,normalize_output:false,arrangement_ai:false});
  assert.deepEqual(copy(h.api.payload({capabilities:true})),{capabilities:true});assert.deepEqual(copy(h.api.payload({prompt:'',capabilities:true})),{capabilities:true});
  assert.deepEqual(copy(h.api.payload({prompt:'Music',capabilities:false})),validateRequest({prompt:'Music',capabilities:false},raw));
  const n=schema.parameters.find(x=>x.key==='loop_ready');assert.match(h.internal.render(n,'loop_ready',false),/Off leaves this setting out/);
});
test('unavailable controls and reference types are visible and cannot masquerade as enabled',()=>{
  const h=setup();h.api.open({prompt:'Music'});
  const card=h.$('[data-parameter="webhook_url"]');assert.match(h.$('.control-set',card).textContent,/Unavailable/);assert.equal(h.$('[data-enable]',card).disabled,true);
  const n=schema.parameters.find(x=>x.key==='references'),r=parse(h.internal.render(n,'references',[{kind:'descriptor',text:'Piano'}])),select=query('[data-path="references[0].kind"]',r)[0],options=n.items.fields.find(x=>x.key==='kind').options;
  options.forEach((o,i)=>assert.equal(Object.hasOwn(select.children.find(x=>x.attrs.value===String(i)).attrs,'disabled'),o.id!=='descriptor'));
  assert.throws(()=>h.api.payload({prompt:'Music',references:[{kind:'midi'}]}),/not available/);
});
test('explicit dry-run availability metadata is honored without weakening HTTPS',()=>{
  const custom=copy(schema);custom.parameters.find(n=>n.key==='webhook_url').website={enabled:false,allowed_in_dry_run:true,reason:'Notifications unavailable for generation.'};
  const h=setup(custom),d={prompt:'Music',dry_run:true,webhook_url:'https://example.com/done'};assert.deepEqual(copy(h.api.payload(d)),d);
  assert.throws(()=>h.api.payload({...d,dry_run:false}),/unavailable/);assert.throws(()=>h.api.payload({...d,webhook_url:'http://example.com'}),/HTTPS/);
  h.api.open({prompt:'Music',dry_run:true});assert.equal(h.$('[data-enable="webhook_url"]').disabled,false);
});
test('stable wording and field-specific error labels avoid sample values and internal claims',()=>{
  const h=setup();for(const [key,want]of [['vocal','Vocals'],['lyrics','Lyrics'],['duration','Duration'],['key','Key and scale'],['seed','Recorded seed']])assert.equal(h.internal.label(schema.parameters.find(n=>n.key===key)),want);
  for(const n of schema.parameters)assert.doesNotMatch(h.internal.label(n),/02:15|Vocal Mode:|Lyric Mode:|202 \+ job_id|D-SSM|8 reusable|Reproducible/);
  assert.equal(h.api.formatIssues([{path:'energy_curve.points[1].v',message:'At most 1.'}]),'Energy over time · Energy (0–1) (item 2): At most 1.');
  const before=copy(h.P.state.draft);h.api.init();assert.deepEqual(h.P.state.draft,before);
});
test('unsafe/duplicate label names, unknown fields, invalid numbers and clip limits are refused',()=>{
  const h=setup();assert.throws(()=>h.api.payload(JSON.parse('{"prompt":"Music","labels":{"__proto__":"x"}}')),/cannot be used/);
  assert.throws(()=>h.api.payload({prompt:'Music',project:{track_id:'forged'}}),/Unexpected setting/);
  assert.throws(()=>h.api.payload({prompt:'Music',seed:Number.MAX_SAFE_INTEGER+1}),/whole number/);
  assert.throws(()=>h.api.payload({prompt:'Music',prompt_blocks:[{weight:.25}]}),/steps/);
  assert.throws(()=>h.api.payload({prompt:'Music',route:'lyria-3-clip-preview',duration:{target_seconds:31}}),/30 seconds/);
  h.render({prompt:'Music',labels:{one:'A',two:'B'}});const rows=h.$$('[data-kv="labels"] .kv-row');h.$('textarea',rows[1]).value='one';assert.throws(()=>h.internal.collect(),/repeated/);
});
test('label dictionaries preserve empty strings, whitespace and line breaks allowed by the actual contract',()=>{
  const h=setup(),d={prompt:'Music',labels:{'':'Blank-name value',' empty ':'','line\nbreak':'Value\nwith, punctuation'}};
  h.render(d);const actual=copy(h.api.payload(h.internal.collect()));assert.deepEqual(actual,d);assert.deepEqual(validateRequest(actual,raw),d);
});
