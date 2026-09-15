import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../public/platform-input.js',import.meta.url),'utf8');
function setup(ua='Desktop',input=null) {
  const listeners={}, events=[], nodes=[], classes=new Set();
  const body={querySelectorAll:()=>nodes,contains:el=>el===body||nodes.includes(el),isConnected:true,getAttribute:()=>null,closest:()=>null,getClientRects:()=>[1],matches:()=>false};
  const doc={body,activeElement:body,querySelectorAll:()=>[],documentElement:{classList:{toggle:(x,on)=>on?classes.add(x):classes.delete(x)}},addEventListener:(n,fn)=>listeners[n]=fn,dispatchEvent:e=>{events.push(e);return !e.defaultPrevented;}};
  const window={document:doc,navigator:{userAgent:ua},tizen:input?{tvinputdevice:input}:null,CustomEvent:class {constructor(type,o={}){this.type=type;Object.assign(this,o);} preventDefault(){this.defaultPrevented=true;}},addEventListener(){},getComputedStyle:()=>({visibility:'visible',display:'block'}),requestAnimationFrame:fn=>fn(),MutationObserver:class {observe(){}},PMP_APP:{config:{}}};
  vm.runInNewContext(source,{window,console});
  function node(x,y,kind='button') {
    const item={isConnected:true,disabled:false,tabIndex:0,kind,clicks:0,getAttribute:()=>null,closest:selector=>selector.includes('input,textarea') && kind==='input'?item:null,getClientRects:()=>[1],getBoundingClientRect:()=>({left:x,top:y,right:x+50,bottom:y+40}),focus:()=>doc.activeElement=item,blur:()=>doc.activeElement=body,scrollIntoView(){},matches:()=>true,click(){this.clicks++;}};
    nodes.push(item);return item;
  }
  function key(code,key='',extra={}) { const e={keyCode:code,key,target:doc.activeElement,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra}; listeners.keydown(e); return e; }
  function up(code,key='') { listeners.keyup({keyCode:code,key}); }
  return {api:window.PMPPlatform,doc,window,node,key,up,events,classes};
}
test('desktop input stays native until TV mode is explicitly enabled',()=>{
  const h=setup(), a=h.node(0,0), b=h.node(100,0);h.api.attach({});a.focus();
  assert.equal(h.key(39,'ArrowRight').defaultPrevented,undefined);assert.equal(h.doc.activeElement,a);
  h.api.setMode('tv');h.key(39,'ArrowRight');assert.equal(h.doc.activeElement,b);assert.ok(h.classes.has('pmp-tv'));
});
test('directional selection prefers the same row and rejects items behind the focus',()=>{
  const h=setup();const r=(l,t,r,b)=>({left:l,top:t,right:r,bottom:b});
  assert.equal(h.api.directionalIndex(r(0,0,50,40),[r(-60,0,-10,40),r(55,80,105,120),r(150,0,200,40)],'right'),2);
  assert.equal(h.api.directionalIndex(r(0,0,50,40),[r(0,50,50,90)],'left'),-1);
});
test('Samsung registration uses supported media keys only; required arrows/back never registered',()=>{
  const added=[],removed=[];
  const h=setup('Tizen',{getSupportedKeys:()=>[{name:'MediaPlay',code:415},{name:'MediaTrackNext',code:10233},{name:'ColorF0Red',code:403}],registerKey:x=>added.push(x),unregisterKey:x=>removed.push(x)});
  let played=0,next=0;h.api.attach({play:()=>played++,next:()=>next++});
  h.key(415);h.up(415);h.key(10233);assert.equal(played,1);assert.equal(next,1);assert.deepEqual(added,['MediaPlay','MediaTrackNext']);
  h.api.setMode('desktop');assert.deepEqual(removed,added);
});
test('LG real media and Back codes route while unhandled root Back remains native',()=>{
  const h=setup('webOS');let paused=0,delta=0;
  h.api.attach({pause:()=>paused++,seek:v=>delta+=v,back:()=>false});
  h.key(19);h.up(19);h.key(417);h.up(417);h.key(412);h.up(412);
  assert.equal(paused,1);assert.equal(delta,0);assert.equal(h.key(461).defaultPrevented,undefined);
  for(const [code,action] of [[415,'play'],[413,'stop'],[19,'pause'],[461,'back'],[10009,'back'],[10252,'toggle']]) assert.equal(h.api.keyCommand({keyCode:code}),action);
});
test('text/range/select editing is not replaced by spatial navigation; Back leaves edit focus',()=>{
  const h=setup('webOS'),input=h.node(0,0,'input');h.node(100,0);h.api.attach({});input.focus();
  assert.equal(h.key(39,'ArrowRight').defaultPrevented,undefined);assert.equal(h.doc.activeElement,input);
  assert.equal(h.key(461).defaultPrevented,true);assert.equal(h.doc.activeElement,h.doc.body);
});
test('held OK activates once and keyup permits the next deliberate activation',()=>{
  const h=setup('webOS'),button=h.node(0,0);h.api.attach({});button.focus();
  h.key(13);h.key(13,'Enter',{repeat:true});assert.equal(button.clicks,1);
  h.up(13);h.key(13);assert.equal(button.clicks,2);
});
test('modal focus stays inside the active layer and Back calls its real close control',()=>{
  const h=setup('webOS'),outside=h.node(0,0),inside=h.node(100,100);let closed=0;
  const layer={isConnected:true,getAttribute:()=>null,closest:()=>null,getClientRects:()=>[1],contains:e=>e===inside,querySelectorAll:()=>[inside],querySelector:()=>({click:()=>closed++})};
  h.doc.querySelectorAll=()=>[layer];h.api.attach({});outside.focus();h.api.refresh();assert.equal(h.doc.activeElement,inside);
  h.key(461);assert.equal(closed,1);
});
test('Samsung missing privilege reports unavailable registration without breaking focus',()=>{
  const h=setup('Tizen',{getSupportedKeys(){throw Error('SecurityError');}});h.api.attach({});
  assert.equal(h.api.getState().registration,'permission-unavailable');assert.equal(h.api.getState().enabled,true);
});
test('unhandled repeated root Back stays native while handled Back is debounced',()=>{
  const h=setup('webOS');h.api.attach({back:()=>false});
  h.key(461);assert.equal(h.key(461,'',{repeat:true}).defaultPrevented,undefined);h.up(461);
  let calls=0;h.api.attach({back:()=>{calls++;return true;}});h.key(461);assert.equal(h.key(461,'',{repeat:true}).defaultPrevented,true);assert.equal(calls,1);
});
