import * as resultPresentation from '../public/result-presentation.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import vm from 'node:vm';

const source=name=>readFileSync(new URL('../public/'+name,import.meta.url),'utf8');
const decode=value=>value.replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
const flush=async()=>{for(let n=0;n<12;n++)await Promise.resolve();};
const track=(letter='a',extra={})=>({id:letter.repeat(64),title:'Fixture take '+letter,owned:true,url:'/api/listen/'+letter.repeat(64),take:1,...extra});
const job=(tracks=[track()],extra={})=>({id:randomUUID(),status:'ready',createdAt:1789200000000,tracks,summary:null,assetsSummary:null,error:null,...extra});
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};

test('delivered creation installs real sibling takes in order while preserving manual queue and avoiding duplicates',async()=>{
  const a=track('a'),b=track('b'),c=track('c'),manual=track('d'),h=harness({catalog:[manual]});
  h.P.state.queue=[manual.id,b.id];
  const chosen=h.P.queueCreation({...a,preparedTracks:[b,c,b,{...track('e'),url:'https://outside.invalid/audio'}]});
  assert.equal(chosen.id,a.id);assert.deepEqual([...h.P.state.queue],[b.id,c.id,manual.id]);
  await h.P.playTrack(chosen.id);await h.P.actions.next();
  assert.equal(h.P.state.current.id,b.id);assert.equal(h.audio.src,b.url);
  assert.deepEqual([...h.P.state.queue],[c.id,manual.id]);
});

test('new creation while listening queues its actual takes without interrupting the selected song',async()=>{
  const playing=track('d'),a=track('a'),b=track('b'),h=harness({catalog:[playing]});
  await h.P.playTrack(playing.id);const loads=h.loadCalls.length;
  h.P.queueCreation({...a,preparedTracks:[b]},{includePrimary:true});
  assert.equal(h.P.state.current.id,playing.id);assert.equal(h.loadCalls.length,loads);
  assert.deepEqual([...h.P.state.queue],[a.id,b.id]);
});

// The actual job HTML, delegated document click routing, transport and APP.wait
// run together. Only browser/HTMLMediaElement and HTTP responses are fixtures.
// This proves selected-source behavior, not decoded audio or audible playback.
function harness({jobs=[],catalog=[],play}={}){
  let document,timer=0,transport;
  const timers=new Map(),requests=[],playCalls=[],pauseCalls=[],loadCalls=[],metadata=[],windowListeners=new Map(),documentListeners=new Map();
  const memory=()=>{const data=new Map();return{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};};
  function listen(map,type,listener,options){if(!map.has(type))map.set(type,[]);map.get(type).push({listener,capture:!!options?.capture});}
  class Element{
    constructor(tag,attrs={}){this.tagName=tag.toLowerCase();this.attrs={};this.dataset={};this.children=[];this.parentElement=null;this.listeners=new Map();this._text='';this.value='';this.style={setProperty(){}};this.classList={contains:name=>this.className.split(/\s+/).includes(name),add:(...names)=>{this.className=[...new Set([...this.className.split(/\s+/).filter(Boolean),...names])].join(' ');},remove:(...names)=>{this.className=this.className.split(/\s+/).filter(name=>!names.includes(name)).join(' ');},toggle:(name,value)=>{const on=value??!this.classList.contains(name);this.classList[on?'add':'remove'](name);return on;}};for(const [key,value]of Object.entries(attrs))this.setAttribute(key,value);}
    get id(){return this.attrs.id||'';}set id(value){this.setAttribute('id',value);}
    get className(){return this.attrs.class||'';}set className(value){this.attrs.class=String(value);}
    get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}set textContent(value){this.replaceChildren();this._text=String(value);}
    get isConnected(){return this===document.body||!!this.parentElement?.isConnected;}
    set innerHTML(html){this.replaceChildren();const stack=[this],voids=new Set(['input','br','hr','img','meta','link','image','use']);for(const token of String(html).match(/<\/?[^>]+>|[^<]+/g)||[]){if(token.startsWith('</')){const tag=token.slice(2,-1).trim();let at=stack.length-1;while(at>0&&stack[at].tagName!==tag)at--;if(at>0)stack.length=at;}else if(token.startsWith('<')){const match=/^<([a-z][a-z0-9-]*)\b([^>]*)>/i.exec(token);if(!match)continue;const attrs={};for(const attr of match[2].matchAll(/([^\s=<>/]+)(?:="([^"]*)")?/g))attrs[attr[1]]=decode(attr[2]??'');const child=new Element(match[1],attrs);stack.at(-1).append(child);if(!voids.has(child.tagName)&&!token.endsWith('/>'))stack.push(child);}else stack.at(-1)._text+=decode(token);}}
    setAttribute(key,value){this.attrs[key]=String(value);if(key.startsWith('data-'))this.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(value);}
    getAttribute(key){return this.attrs[key]??null;}removeAttribute(key){delete this.attrs[key];}
    append(...nodes){for(const node of nodes){node.remove();node.parentElement=this;this.children.push(node);}}
    prepend(node){node.remove();node.parentElement=this;this.children.unshift(node);}
    replaceChildren(...nodes){for(const child of [...this.children])child.remove();this._text='';this.append(...nodes);}
    remove(){if(this.parentElement){const parent=this.parentElement;parent.children.splice(parent.children.indexOf(this),1);this.parentElement=null;}}
    contains(node){return this===node||this.children.some(child=>child.contains(node));}
    matches(selector){return selector.split(',').some(raw=>{const parts=raw.trim().split(/\s+/);const simple=parts.pop();const match=/^([a-z][\w-]*)?((?:#[\w-]+|\.[\w-]+)?)(?:\[([^=\]]+)(?:=['"]?([^'"\]]+)['"]?)?\])?$/i.exec(simple);if(!match)return false;const[,tag,name,attr,value]=match;if(tag&&tag!==this.tagName)return false;if(name?.startsWith('#')&&this.id!==name.slice(1))return false;if(name?.startsWith('.')&&!this.classList.contains(name.slice(1)))return false;if(attr){const current=attr.startsWith('data-')?this.dataset[attr.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]:this.getAttribute(attr);if(current==null||(value!==undefined&&current!==value))return false;}if(parts.length){let parent=this.parentElement;while(parent&&!parent.matches(parts.join(' ')))parent=parent.parentElement;return !!parent;}return true;});}
    closest(selector){for(let node=this;node;node=node.parentElement)if(node.matches(selector))return node;return null;}
    querySelectorAll(selector){return this.children.flatMap(child=>[...(child.matches(selector)?[child]:[]),...child.querySelectorAll(selector)]);}
    querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
    addEventListener(type,listener,options){listen(this.listeners,type,listener,options);}
    dispatch(type){for(const {listener}of this.listeners.get(type)||[])listener({type,target:this});}
    focus(){document.activeElement=this;}showModal(){this.open=true;}close(){this.open=false;}
  }
  document={currentScript:null,createElement:tag=>new Element(tag),createTextNode:value=>{const node=new Element('#text');node._text=String(value);return node;},addEventListener:(...args)=>listen(documentListeners,...args),querySelector:selector=>document.body.querySelector(selector),querySelectorAll:selector=>document.body.querySelectorAll(selector)};
  document.body=new Element('body');document.head=new Element('head');document.activeElement=document.body;
  document.body.innerHTML='<main id="main" data-page="create"></main><dialog id="modal"><div id="modal-content"></div></dialog><div id="toast" hidden></div><audio id="audio"></audio><canvas id="waveform"></canvas><strong id="track-title"></strong><span id="track-origin"></span><div class="player-art"></div><button data-action="play"></button><input id="seek"><span id="duration"></span><span id="elapsed"></span><span id="queue-status"></span><input id="continuation"><input id="volume">';
  const audio=document.querySelector('#audio');Object.assign(audio,{src:'',paused:true,ended:false,duration:30,currentTime:0,volume:.7,error:null,muted:false,load(){loadCalls.push(this.src);this.currentTime=0;this.ended=false;},pause(){pauseCalls.push(this.src);this.paused=true;this.dispatch('pause');},play(){this.paused=false;const src=this.src;playCalls.push(src);this.dispatch('play');const result=play?play({audio:this,index:playCalls.length-1,src}):Promise.resolve();return result.then(value=>{if(this.src===src&&!this.paused)this.dispatch('playing');return value;});}});
  const canvas=document.querySelector('#waveform');Object.assign(canvas,{width:440,height:40,getContext:()=>({clearRect(){},fillRect(){}})});
  const mediaSession={setActionHandler(){},set metadata(value){metadata.push(value);},get metadata(){return metadata.at(-1);}};
  class MediaMetadata{constructor(value){Object.assign(this,value);}}
  const window={PMPResultPresentation:resultPresentation,PMP_CONFIG:{catalog},PMP_DATA:{songs:[],stations:[]},MediaMetadata,PMPPlatform:{attach:value=>{transport=value;},refresh(){}},addEventListener:(...args)=>listen(windowListeners,...args),dispatchEvent:event=>{for(const {listener}of windowListeners.get(event.type)||[])listener(event);}};
  const location={pathname:'/index.html',origin:'http://fixture.invalid',href:'http://fixture.invalid/index.html',protocol:'http:',assign(){},reload(){}};
  let http=async path=>{throw Error('Unexpected fixture request '+path);};
  const context=vm.createContext({window,document,navigator:{mediaSession},MediaMetadata,location,history:{},localStorage:memory(),sessionStorage:memory(),crypto:{randomUUID},URL,DOMException,AbortController,CustomEvent:class{constructor(type,options={}){this.type=type;Object.assign(this,options);}},fetch:async(path,options)=>{requests.push({path,options});return http(path,options);},setTimeout:(fn,ms)=>{timers.set(++timer,{fn,ms});return timer;},clearTimeout:id=>timers.delete(id)});
  const entry=source('app-entry.js'),boundary=entry.indexOf('  try{\n    const session=');assert.ok(boundary>0,'actual bootstrap boundary exists');
  vm.runInContext(entry.slice(0,boundary)+'})();',context,{filename:'app-entry.js'});
  window.PMP_APP.jobs=jobs;window.PMP_APP.catalog=catalog;
  vm.runInContext(source('app.js'),context,{filename:'app.js'});
  window.PMP.renderLibrary=()=>{}; // unrelated collection UI; click routing is real.
  for(const name of ['player.js','connected.js','service-player.js'])vm.runInContext(source(name),context,{filename:name});
  return{P:window.PMP,APP:window.PMP_APP,window,document,audio,playCalls,pauseCalls,loadCalls,metadata,requests,get transport(){return transport;},$:selector=>document.querySelector(selector),setHttp:fn=>{http=fn;},publish(nextJobs){window.PMP_APP.jobs=nextJobs;window.dispatchEvent({type:'pmp:jobs'});},click(target){assert.ok(target,'actual rendered click target exists');const event={type:'click',target,button:0,preventDefault(){}};for(const {listener}of(documentListeners.get('click')||[]).filter(item=>item.capture))listener(event);for(const {listener}of(documentListeners.get('click')||[]).filter(item=>!item.capture))listener(event);},button(id){return document.querySelector('.connected-job-takes').querySelectorAll('button').find(button=>button.dataset.id===id);}};
}

test('actual generated take button resolves and registers owned audio before catalogue arrival',async()=>{
  const take=track(),h=harness({jobs:[job([take])]});
  assert.equal(h.P.song(take.id),undefined);assert.equal(h.APP.catalog.length,0);
  h.click(h.button(take.id).querySelector('span'));await flush();
  assert.deepEqual(h.playCalls,[take.url]);assert.equal(h.audio.src,take.url);assert.equal(h.P.state.current.id,take.id);assert.equal(h.P.song(take.id).owned,true);assert.equal(h.$('#track-title').textContent,take.title);assert.equal(h.metadata.at(-1).title,take.title);
});

test('catalogue failure and a later stale empty catalogue cannot disable the actual job button',async()=>{
  const take=track(),h=harness({jobs:[job([take])]});
  h.setHttp(async()=>({ok:false,status:503,json:async()=>({error:{message:'Fixture catalogue unavailable'}})}));
  await assert.rejects(h.APP.refreshCatalog(),/Fixture catalogue unavailable/);
  h.click(h.button(take.id).querySelector('use'));await flush();assert.equal(h.audio.src,take.url);
  h.setHttp(async path=>{if(path==='/api/catalog')return{ok:true,json:async()=>({tracks:[]})};throw Error('No waveform fixture');});
  await h.APP.refreshCatalog();assert.equal(h.P.song(take.id),undefined);
  h.transport.pause();h.click(h.button(take.id));await flush();
  assert.equal(h.P.song(take.id).id,take.id);assert.equal(h.audio.paused,false);assert.equal(h.playCalls.length,2);
});

test('actual wait preserves a delivered result when its separate catalogue refresh fails',async()=>{
  const take=track(),ready=job([take]),h=harness();
  h.setHttp(async path=>path==='/api/jobs/'+ready.id?{ok:true,json:async()=>({job:ready})}:{ok:false,status:503,json:async()=>({error:{message:'Fixture catalogue unavailable'}})});
  const result=await h.APP.wait(ready.id);assert.equal(result.id,take.id);assert.equal(result.created,true);assert.equal(h.APP.waiters,0);
  assert.match(h.$('#toast').textContent,/song is ready.*catalogue could not refresh/i);
  h.click(h.button(take.id));await flush();assert.equal(h.audio.src,take.url);
  assert.ok(h.requests.every(request=>!request.options?.method||request.options.method==='GET'),'waiting and playback never submit another generation');
});

test('actual failed wait remains a failure rather than manufacturing a playable result',async()=>{
  const failed=job([],{status:'failed',error:{message:'Fixture generation refusal'}}),h=harness();
  h.setHttp(async()=>({ok:true,json:async()=>({job:failed})}));
  await assert.rejects(h.APP.wait(failed.id),/Fixture generation refusal/);
  assert.equal(h.APP.waiters,0);assert.equal(h.playCalls.length,0);assert.equal(h.requests.length,1);assert.equal(h.$('.connected-job-takes'),null);
});

test('repeated routed Play clicks while loading and playing never pause or duplicate the source load',async()=>{
  const pending=deferred(),take=track(),h=harness({jobs:[job([take])],play:()=>pending.promise});
  h.click(h.button(take.id));h.click(h.button(take.id).querySelector('span'));await flush();
  assert.equal(h.playCalls.length,1);assert.equal(h.loadCalls.length,1);assert.equal(h.pauseCalls.length,0);
  pending.resolve();await flush();h.click(h.button(take.id));await flush();
  assert.equal(h.playCalls.length,1);assert.equal(h.audio.paused,false);
  h.transport.pause();assert.equal(h.audio.paused,true);h.click(h.button(take.id));await flush();assert.equal(h.playCalls.length,2);assert.equal(h.audio.paused,false);
});

for(const staleResult of ['resolve','reject'])test('last selected song wins when earlier audio.play later '+staleResult+'s',async()=>{
  const a=track('a'),b=track('b'),first=deferred(),second=deferred(),h=harness({jobs:[job([a,b])],play:({index})=>[first,second][index].promise});
  h.click(h.button(a.id));h.click(h.button(b.id).querySelector('span'));second.resolve();await flush();
  if(staleResult==='resolve')first.resolve();else first.reject(new DOMException('Interrupted by the new source','AbortError'));
  await flush();assert.equal(h.P.state.current.id,b.id);assert.equal(h.audio.src,b.url);assert.equal(h.metadata.at(-1).title,b.title);assert.deepEqual(h.metadata.map(item=>item.title),[b.title]);assert.doesNotMatch(h.$('#toast').textContent,/unavailable|couldn.t|could not|press play/i);
});

test('current autoplay denial is visible and the same generated button can retry it',async()=>{
  const take=track(),h=harness({jobs:[job([take])],play:({audio,index})=>{if(index===0){audio.paused=true;return Promise.reject(new DOMException('User gesture needed','NotAllowedError'));}return Promise.resolve();}});
  h.click(h.button(take.id));await flush();assert.match(h.$('#toast').textContent,/Press play to listen/i);assert.equal(h.audio.paused,true);
  h.click(h.button(take.id));await flush();assert.equal(h.playCalls.length,2);assert.equal(h.audio.paused,false);
});

for(const retry of ['song-button','system-play'])test('retrying a blocked second song via '+retry+' updates system now-playing metadata',async()=>{
  const a=track('a'),b=track('b'),h=harness({jobs:[job([a,b])],play:({audio,index})=>{if(index===1){audio.paused=true;return Promise.reject(new DOMException('User gesture needed','NotAllowedError'));}return Promise.resolve();}});
  h.click(h.button(a.id));await flush();assert.equal(h.metadata.at(-1).title,a.title);
  h.click(h.button(b.id));await flush();assert.equal(h.audio.paused,true);
  if(retry==='song-button')h.click(h.button(b.id));else await h.transport.play();await flush();
  assert.equal(h.audio.paused,false);assert.equal(h.metadata.at(-1).title,b.title);
});

test('unknown or unverified fallback IDs produce a visible message and never load remote audio',async()=>{
  for(const take of [track('a',{owned:false}),track('b',{url:'https://fixture.invalid/untrusted.mp3'}),track('c',{url:'/api/listen/different'})]){
    const h=harness({jobs:[job([take])]});h.click(h.button(take.id));await flush();
    assert.equal(h.playCalls.length,0);assert.equal(h.loadCalls.length,0);assert.equal(h.P.state.current,null);assert.match(h.$('#toast').textContent,/could not be found/i);
  }
  const take=track(),h=harness({jobs:[job([take])]});const button=h.button(take.id);button.dataset.id='unknown';h.click(button);await flush();assert.equal(h.playCalls.length,0);assert.match(h.$('#toast').textContent,/could not be found/i);
});


test('a partial group renders recovery controls for the actual child, never the already-ready primary',()=>{
  const primary=job([track('a')]),uncertain=job([],{status:'uncertain',canRetryStatus:true}),transfer=job([],{status:'ingest_failed'});
  const group={...primary,status:'partial',creation:{id:primary.id,mode:'directed-three',primaryJobId:primary.id,primaryTrackId:primary.tracks[0].id,primaryStatus:'ready',deliveredTakes:1,children:[{role:'faithful',job:primary},{role:'neighbour',job:uncertain},{role:'explore',job:transfer}]}};
  const h=harness({jobs:[group]});
  const status=h.document.querySelector('[data-action="connected-job-status-retry"]'),copy=h.document.querySelector('[data-action="connected-job-retry"]');
  assert.equal(status.dataset.id,uncertain.id);assert.equal(copy.dataset.id,transfer.id);assert.match(status.textContent,/A different angle/);assert.match(copy.textContent,/Further exploration/);assert.notEqual(copy.dataset.id,primary.id);
});

test('actual wait returns the faithful primary while other directions are still pending',async()=>{
 const take=track(),ready=job([take],{status:'pending',creation:{primaryTrackId:take.id,primaryStatus:'ready',children:[]}}),h=harness();
 h.setHttp(async path=>({ok:true,json:async()=>path.startsWith('/api/jobs/')?{job:ready}:{tracks:[take]}}));
 const result=await h.APP.wait(ready.id);assert.equal(result.id,take.id);assert.equal(h.APP.waiters,0);assert.equal(h.requests.length,2);assert.ok(h.requests.every(r=>!r.options?.method||r.options.method==='GET'));
});
test('a failed faithful primary never silently substitutes a completed secondary direction',async()=>{
 const secondary=track('b'),ready=job([secondary],{status:'pending',creation:{primaryTrackId:null,primaryStatus:'failed',children:[]}}),h=harness();
 h.setHttp(async()=>({ok:true,json:async()=>({job:ready})}));await assert.rejects(h.APP.wait(ready.id),/first music direction needs attention/);assert.equal(h.APP.jobs[0].tracks[0].id,secondary.id);assert.equal(h.playCalls.length,0);h.click(h.button(secondary.id));await flush();assert.equal(h.audio.src,secondary.url);
});
test('a completed secondary alone keeps waiting for the faithful primary and respects Stop waiting',async()=>{
 const secondary=track('b'),ready=job([secondary],{status:'pending',creation:{primaryTrackId:null,primaryStatus:'pending',children:[]}}),h=harness(),controller=new AbortController();
 h.setHttp(async()=>({ok:true,json:async()=>({job:ready})}));let resolved=false;const wait=h.APP.wait(ready.id,controller.signal).then(r=>{resolved=true;return r;});await flush();assert.equal(resolved,false);controller.abort();await assert.rejects(wait,{name:'AbortError'});assert.equal(h.requests.length,1);assert.equal(h.playCalls.length,0);
});
