import * as resultPresentation from '../public/result-presentation.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const workerSource=readFileSync(new URL('../public/worker-dialog.js',import.meta.url),'utf8');
const appSource=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
// The real shared modal functions are executed, together with the complete
// worker module. This DOM fixture covers lifecycle and text-safety behavior;
// it deliberately does not claim native browser layout or screen-reader proof.
const modalSource=appSource.slice(appSource.indexOf('function dialog('),appSource.indexOf("modal.addEventListener('click'"));
const decode=s=>s.replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function harness(){
  const observers=new Set(),nativeEvents=[];
  let document;
  class Element{
    constructor(tag,attrs={}){
      this.tagName=tag.toLowerCase();this.attrs={};this.children=[];this.parentElement=null;this.listeners=new Map();this.dataset={};this._text='';this.scrollTop=0;this.focusCount=0;
      this.classList={add:(...names)=>{this.className=[...new Set([...this.className.split(/\s+/).filter(Boolean),...names])].join(' ');},remove:(...names)=>{this.className=this.className.split(/\s+/).filter(x=>!names.includes(x)).join(' ');},contains:name=>this.className.split(/\s+/).includes(name),toggle:(name,value)=>{const on=value??!this.classList.contains(name);this.classList[on?'add':'remove'](name);return on;}};
      for(const [key,value] of Object.entries(attrs))this.setAttribute(key,value);
    }
    get className(){return this.attrs.class||'';}set className(value){this.attrs.class=String(value);}
    get hidden(){return Object.hasOwn(this.attrs,'hidden');}set hidden(value){value?this.setAttribute('hidden',''):this.removeAttribute('hidden');}
    get open(){return Object.hasOwn(this.attrs,'open');}set open(value){value?this.setAttribute('open',''):this.removeAttribute('open');}
    get isConnected(){return this===document.body||!!this.parentElement?.isConnected;}
    get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
    set textContent(value){this.clear();this._text=String(value);}
    set innerHTML(value){this.clear();parse(String(value),this);}
    setAttribute(name,value){this.attrs[name]=String(value);if(name.startsWith('data-'))this.dataset[name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(value);}
    removeAttribute(name){delete this.attrs[name];}
    getAttribute(name){return this.attrs[name]??null;}
    clear(){for(const child of [...this.children])child.remove();this._text='';}
    append(...nodes){for(const node of nodes)this.insertBefore(node,null);}
    insertBefore(node,before){if(node===before)return;if(node.parentElement){const parent=node.parentElement;parent.children.splice(parent.children.indexOf(node),1);}const at=before?this.children.indexOf(before):this.children.length;this.children.splice(at,0,node);node.parentElement=this;return node;}
    remove(){if(this.parentElement){this.parentElement.children.splice(this.parentElement.children.indexOf(this),1);this.parentElement=null;if(this.contains(document.activeElement))document.activeElement=document.body;}}
    contains(other){return other===this||this.children.some(child=>child.contains(other));}
    matches(selector){if(selector[0]==='#')return this.attrs.id===selector.slice(1);if(selector[0]==='.')return this.classList.contains(selector.slice(1));if(selector[0]==='[')return Object.hasOwn(this.attrs,selector.slice(1,-1));return this.tagName===selector;}
    closest(selector){for(let node=this;node;node=node.parentElement)if(node.matches(selector))return node;return null;}
    querySelectorAll(selector){return this.children.flatMap(child=>[...(child.matches(selector)?[child]:[]),...child.querySelectorAll(selector)]);}
    querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
    addEventListener(type,listener){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(listener);}
    removeEventListener(type,listener){this.listeners.get(type)?.delete(listener);}
    dispatch(type,extra={}){const event={type,target:this,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...extra};for(const listener of [...(this.listeners.get(type)||[])])listener(event);return event;}
    focus(){document.activeElement=this;this.focusCount++;}
    showModal(){this.open=true;this.querySelector('button')?.focus();}
    close(){if(!this.open)return;this.open=false;nativeEvents.push(()=>this.dispatch('close'));}
    click(){return this.disabled?undefined:this.onclick?.({target:this});}
  }
  function parse(html,root){
    const stack=[root],voids=new Set(['input','br','hr','img','meta','link','use']);
    for(const token of html.match(/<\/?[^>]+>|[^<]+/g)||[]){
      if(token.startsWith('</')){const tag=token.slice(2,-1).trim();let at=stack.length-1;while(at>0&&stack[at].tagName!==tag)at--;if(at>0)stack.length=at;}
      else if(token.startsWith('<')){const match=/^<([a-z][a-z0-9-]*)\b([^>]*)>/i.exec(token);if(!match)continue;const attrs={};for(const attr of match[2].matchAll(/([^\s=<>/]+)(?:="([^"]*)")?/g))attrs[attr[1]]=decode(attr[2]??'');const el=new Element(match[1],attrs);stack.at(-1).append(el);if(!voids.has(el.tagName)&&!token.endsWith('/>'))stack.push(el);}
      else stack.at(-1)._text+=decode(token);
    }
  }
  document={createElement:tag=>new Element(tag),body:null,activeElement:null,querySelector:selector=>document.body.querySelector(selector)};
  document.body=new Element('body');document.activeElement=document.body;
  const opener=new Element('button',{id:'launch'}),modal=new Element('dialog',{id:'modal'}),content=new Element('div',{id:'modal-content'});
  modal.append(content);document.body.append(opener,modal);opener.focus();
  const P={icon:name=>'<svg aria-hidden="true"><use href="#i-'+escape(name)+'"/></svg>'};
  const context=vm.createContext({window:{PMP:P,PMPResultPresentation:resultPresentation},document,modal,$:selector=>document.querySelector(selector),esc:escape,icon:P.icon,MutationObserver:class{constructor(callback){this.callback=callback;}observe(){observers.add(this);}disconnect(){observers.delete(this);}}});
  vm.runInContext(modalSource+'\nwindow.PMP.dialog=dialog;window.PMP.closeDialog=closeDialog;',context);
  vm.runInContext(workerSource,context);
  return{P,api:context.window.PMPWorkerDialog,document,modal,opener,$:selector=>document.querySelector(selector),flush(){for(const observer of [...observers])observer.callback();while(nativeEvents.length)nativeEvents.shift()();},get observers(){return observers.size;}};
}
const initial=(extra={})=>({id:'request-1',kind:'enhance',status:'accepted',title:'Request accepted',message:'Waiting for the enhancement result.',updatedAt:'2026-09-12T14:20:05Z',steps:[{id:'request',label:'Request accepted',state:'complete'},{id:'result',label:'Enhancement result',state:'active',detail:'Waiting for a response.'}],request:{prompt:'Quiet piano.',async:false},...extra});
const completed=(extra={})=>({status:'ready',title:'Your description is ready.',message:'Compare the two versions.',steps:[{id:'request',label:'Request accepted',state:'complete'},{id:'result',label:'Enhancement result',state:'complete'}],result:{original:'Quiet piano.',enhanced:'Quiet piano in a spacious room.',changed:true},...extra});

test('delivery recovery prevents double clicks, stays open, and presents the actual processing failure',async()=>{
  const h=harness();let attempts=0,reject;
  h.api.open(initial({kind:'create',status:'ingest_failed',onRetry:()=>{attempts++;return new Promise((_,failure)=>{reject=failure;});}}));
  const button=h.$('.worker-retry');assert.equal(button.hidden,false);
  const pending=button.click();assert.equal(button.disabled,true);await button.click();assert.equal(attempts,1);
  reject(Error('Audio processing remains unavailable.'));await pending;
  assert.equal(h.modal.open,true);assert.equal(button.disabled,false);
  assert.equal(h.$('.worker-action-error').textContent,'Audio processing remains unavailable.');
  assert.equal(h.$('.worker-action-error').hidden,false);
  h.api.update({status:'ready',onRetry:undefined});assert.equal(button.hidden,true);
});

test('shared modal renders only actual reported steps, with no invented percentage or timed progression',()=>{
  const h=harness();h.api.open(initial());
  assert.equal(h.modal.open,true);assert.equal(h.modal.classList.contains('pmp-worker-dialog'),true);
  const rows=h.$('.worker-steps').children;assert.equal(rows.length,2);
  assert.equal(rows[0].dataset.state,'complete');assert.equal(rows[1].dataset.state,'active');
  assert.equal(rows[1].getAttribute('aria-current'),'step');
  assert.equal(h.$('.worker-title').textContent,'Request accepted');
  assert.equal(h.$('.worker-announcement').getAttribute('role'),'status');
  assert.equal(h.$('.worker-time').dateTime,'2026-09-12T14:20:05.000Z');
  assert.equal(h.$('.worker-apply').hidden,true);
  assert.equal(h.$('.worker-source-text').textContent,'Quiet piano.');
  assert.deepEqual(JSON.parse(h.$('.worker-request-text').textContent),{prompt:'Quiet piano.',async:false});
  assert.equal(h.modal.querySelectorAll('progress').length,0);
  assert.doesNotMatch(h.modal.textContent,/\d+%/);
});

test('updates preserve the open request disclosure, its scroll and keyboard focus',()=>{
  const h=harness();h.api.open(initial());
  const details=h.$('.worker-request'),pre=h.$('.worker-request-text'),row=h.$('.worker-steps').children[1];
  details.open=true;pre.scrollTop=86;pre.focus();h.modal.scrollTop=190;
  assert.equal(h.api.update({message:'Still waiting for the actual result.',updatedAt:'2026-09-12T14:22:00Z'}),true);
  assert.equal(h.$('.worker-request'),details);assert.equal(details.open,true);
  assert.equal(h.document.activeElement,pre);assert.equal(pre.scrollTop,86);assert.equal(h.modal.scrollTop,190);
  assert.equal(h.$('.worker-steps').children[1],row);
  assert.equal(row.dataset.state,'active');
});

test('server text is rendered as text in every status, comparison, request, error and track surface',()=>{
  const h=harness(),attack='<img src=x onerror="attack()"><script>attack()</script>&\"';
  h.api.open(initial({title:attack,message:attack,error:{message:attack},steps:[{id:attack,label:attack,state:attack,detail:attack}],request:{prompt:attack,nested:{text:attack}},onApply(){}}));
  h.api.update(completed({title:attack,message:attack,error:attack,result:{original:attack,enhanced:attack+' changed',changed:true,tracks:[{id:attack,title:attack,description:attack}]}}));
  assert.equal(h.modal.querySelectorAll('img').length,0);assert.equal(h.modal.querySelectorAll('script').length,0);
  for(const selector of ['.worker-title','.worker-message','.worker-error','.worker-original-text'])assert.equal(h.$(selector).textContent,attack);
  assert.equal(JSON.parse(h.$('.worker-request-text').textContent).prompt,attack);
  assert.equal(h.$('.worker-track').querySelector('strong').textContent,attack);
});

test('completed enhancement preserves both exact versions until explicit Use this version',async()=>{
  const h=harness(),applied=[],closed=[];h.api.open(initial({onApply:(...args)=>applied.push(args),onClose:event=>closed.push(event)}));
  h.api.update(completed());assert.equal(applied.length,0);
  assert.equal(h.$('.worker-compare').hidden,false);assert.equal(h.$('.worker-source').hidden,true);
  assert.equal(h.$('.worker-original-text').textContent,'Quiet piano.');assert.equal(h.$('.worker-apply').textContent,'Use this version');
  await h.$('.worker-apply').click();h.flush();
  assert.equal(applied.length,1);assert.equal(applied[0][0],'Quiet piano in a spacious room.');
  assert.equal(applied[0][1].request.prompt,'Quiet piano.');assert.equal(h.modal.open,false);
  assert.equal(closed.length,1);assert.equal(closed[0].reason,'close');assert.equal(h.document.activeElement,h.opener);
});

test('Keep my original never invokes apply and supports the parent keep callback',async()=>{
  const h=harness();let applied=0,kept=0,reason;
  h.api.open(initial({onApply:()=>applied++,onKeepOriginal:()=>kept++,onClose:event=>reason=event.reason}));h.api.update(completed());
  await h.$('.worker-keep-original').click();h.flush();
  assert.equal(applied,0);assert.equal(kept,1);assert.equal(reason,'original');assert.equal(h.modal.open,false);
});

test('unchanged or unready enhancement never offers an actionable replacement',()=>{
  const h=harness();h.api.open(initial({onApply(){}}));
  h.api.update(completed({status:'processing'}));assert.equal(h.$('.worker-apply').hidden,true);
  h.api.update(completed({result:{original:'Quiet piano.',enhanced:'Quiet piano.',changed:false}}));
  assert.equal(h.$('.worker-apply').hidden,true);assert.equal(h.$('.worker-unchanged').hidden,false);
  assert.equal(h.$('.worker-keep-original').hidden,false);
});

test('reported failures and reconnecting states keep the last confirmed steps without fabricating success',()=>{
  const h=harness();h.api.open(initial());
  h.api.update({status:'failed',error:{message:'The service rejected this description.'},reconnecting:true});
  assert.equal(h.$('.worker-error').getAttribute('role'),'alert');assert.equal(h.$('.worker-error').hidden,false);
  assert.equal(h.$('.worker-steps').children[1].dataset.state,'active');
  assert.equal(h.$('.worker-apply').hidden,true);assert.match(h.$('.worker-connection').textContent,/last confirmed update/);
  h.api.update({steps:[{id:'a',label:'First',state:'unexpected'},{id:'a',label:'Second',state:'failed'}],updatedAt:'not-a-date',reconnecting:false});
  assert.equal(h.$('.worker-steps').children.length,2);assert.equal(h.$('.worker-steps').children[0].dataset.state,'unavailable');
  assert.equal(h.$('.worker-time').hidden,true);assert.equal(h.$('.worker-connection').hidden,true);
});

test('background close, native Escape and external close each notify once and cannot be reopened by updates',()=>{
  for(const mode of ['background','escape','external']){
    const h=harness(),closed=[];h.api.open(initial({onClose:event=>closed.push(event)}));
    if(mode==='background')h.$('.worker-background').click();
    else if(mode==='escape')assert.equal(h.modal.dispatch('cancel').defaultPrevented,true);
    else h.P.closeDialog();
    h.flush();assert.equal(h.modal.open,false);assert.equal(h.api.update(completed()),false);
    assert.equal(closed.length,1);assert.equal(h.api.close(),false);assert.equal(h.observers,0);
    assert.equal(h.document.activeElement,h.opener);
  }
});

test('another application dialog stays intact when worker updates or native close events arrive',()=>{
  const h=harness(),closed=[];h.api.open(initial({onClose:event=>closed.push(event)}));
  h.P.dialog('Music details','<p id="other-dialog">Another task</p>');
  assert.equal(h.api.update(completed()),false);h.flush();
  assert.equal(h.modal.open,true);assert.equal(h.$('#other-dialog').textContent,'Another task');
  assert.equal(h.modal.classList.contains('pmp-worker-dialog'),false);
  assert.equal(closed.length,1);assert.equal(closed[0].reason,'replaced');
  assert.equal(h.api.close(),false);assert.equal(h.modal.open,true);
});

test('the ownership observer detects a replacement even without a worker update',()=>{
  const h=harness(),closed=[];h.api.open(initial({onClose:event=>closed.push(event)}));
  h.P.dialog('Another dialog','<p>Settings</p>');h.flush();
  assert.equal(h.api.isOpen(),false);assert.equal(closed[0].reason,'replaced');assert.equal(h.modal.open,true);
});

test('late close events from an old modal cannot dismiss a newly opened worker',()=>{
  const h=harness();h.api.open(initial());h.api.close();
  h.api.open(initial({id:'request-2'}));h.flush();
  assert.equal(h.api.isOpen(),true);assert.equal(h.modal.open,true);
  assert.equal(h.api.update({id:'request-1',status:'failed'}),false);
  assert.equal(h.api.update({id:'request-2',status:'processing'}),true);
});

test('request identity can be assigned after admission but other IDs and kinds cannot hijack updates',()=>{
  const h=harness();h.api.open(initial({id:undefined,status:'admitting'}));
  assert.equal(h.$('.worker-badge').textContent,'Sending your request');
  const focused=h.$('.worker-request-text');focused.focus();
  assert.equal(h.api.update({id:'admitted-job'}),true);
  assert.equal(h.document.activeElement,focused);
  assert.equal(h.api.update({id:'another-job',title:'Wrong'}),false);
  assert.equal(h.api.update({kind:'create',title:'Wrong'}),false);
  assert.equal(h.$('.worker-title').textContent,'Request accepted');
});

test('long original and enhanced texts are intact and have focusable labelled scrolling areas',()=>{
  const h=harness(),original='🎵 A thought.\n'.repeat(500),enhanced=original+'A spacious arrangement.';
  h.api.open(initial());h.api.update(completed({result:{original,enhanced,changed:true}}));
  for(const [selector,value] of [['.worker-original-text',original],['.worker-enhanced-text',enhanced]]){
    const node=h.$(selector);assert.equal(node.textContent,value);assert.equal(node.getAttribute('tabindex'),'0');
    assert.ok(h.$('#'+node.getAttribute('aria-labelledby')));
  }
});

test('ready generated tracks use the parent playback callback and remain in the dialog',async()=>{
  const h=harness(),played=[],tracks=[{id:'one',title:'First song'},{id:'two',title:'Second song'}];
  h.api.open(initial({kind:'create',onPlay:(...args)=>played.push(args)}));
  h.api.update({status:'ready',result:{tracks}});
  const buttons=h.$('.worker-tracks').querySelectorAll('button');assert.equal(buttons.length,2);
  await buttons[1].click();assert.equal(played[0][0],tracks[1]);assert.equal(played[0][1].kind,'create');
  assert.equal(h.modal.open,true);assert.equal(h.$('.worker-apply').hidden,true);
});

test('an unavailable playback callback never shows a disconnected Play action',()=>{
  const h=harness();h.api.open(initial({kind:'create',status:'ready',result:{tracks:[{id:'one',title:'Saved music'}]}}));
  assert.equal(h.$('.worker-tracks').querySelector('button').hidden,true);
});

test('failed or repeated async actions cannot silently apply twice and surface the actual error',async()=>{
  const h=harness();let reject,calls=0;
  h.api.open(initial({onApply:()=>{calls++;return new Promise((_,r)=>reject=r);}}));h.api.update(completed());
  const button=h.$('.worker-apply'),first=button.click();assert.equal(button.disabled,true);
  await button.click();assert.equal(calls,1);reject(new Error('The draft changed while you were reviewing.'));
  await first;assert.equal(h.modal.open,true);assert.equal(button.disabled,false);
  assert.equal(h.$('.worker-action-error').textContent,'The draft changed while you were reviewing.');assert.equal(h.$('.worker-action-error').hidden,false);
});

test('a late callback never closes a different dialog or restores focus over it',async()=>{
  const h=harness();let resolve;
  h.api.open(initial({onApply:()=>new Promise(r=>resolve=r)}));h.api.update(completed());
  const pending=h.$('.worker-apply').click();h.P.dialog('Other work','<button id="other-focus">Continue</button>');h.$('#other-focus').focus();
  resolve();await pending;h.flush();
  assert.equal(h.modal.open,true);assert.equal(h.document.activeElement,h.$('#other-focus'));
});

test('focus falls back safely when its ready action disappears and Undo is explicitly opt in',async()=>{
  const h=harness();let undo=0;h.api.open(initial({onApply(){}}));h.api.update(completed());
  h.$('.worker-apply').focus();h.api.update({status:'uncertain'});
  assert.equal(h.document.activeElement,h.$('.worker-background'));assert.equal(h.$('.worker-undo').hidden,true);
  h.api.update({onUndo:()=>undo++});assert.equal(h.$('.worker-undo').textContent,'Undo enhancement');
  await h.$('.worker-undo').click();assert.equal(undo,1);assert.equal(h.modal.open,false);
});
