import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';

// Actual player.js plus the actual followup module. DOM/media are explicit
// fixtures; no real audio, server state, or generation is created here.
const source=name=>readFileSync(new URL('../public/'+name,import.meta.url),'utf8');
const groupId='directed-group-fixture',roles=['faithful','neighbour','explore'];
const track=(letter,role=0,extra={})=>({id:letter.repeat(64),title:'Fixture '+letter,url:'/api/listen/'+letter.repeat(64),owned:true,creationId:groupId,seedRole:roles[role],jobId:'fixture-child-'+letter,...extra});
const a=track('a',0),b=track('b',1),c=track('c',2);
const group=(tracks=[],extra={})=>({id:groupId,status:'pending',tracks,creation:{id:groupId,mode:'directed-three',primaryTrackId:tracks.find(track=>track.seedRole==='faithful')?.id||null},...extra});
function memory(){const data=new Map();return{fail:false,getItem:key=>data.get(key)??null,setItem(key,value){if(this.fail)throw Error('Explicit full storage fixture');data.set(key,String(value));},removeItem:key=>data.delete(key),snapshot:()=>new Map(data)};}
function harness({jobs=[group([a])],catalog=[],queue=[],storage=memory()}={}){
  const listeners=new Map(),notices=[],loads=[],requests=[],nodes=new Map(),local=memory();let dialogOpen=true,manualCalls=0;
  class Node{
    constructor(){this.dataset={};this.attrs={};this.listeners=new Map();this.style={};this.classList={toggle(){},add(){},remove(){}};this.value=0;}
    addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push(fn);}
    fire(type){for(const fn of this.listeners.get(type)||[])fn({type,target:this});}
    setAttribute(name,value){this.attrs[name]=String(value);}getContext(){return{clearRect(){},fillRect(){}};}
  }
  const $=name=>{if(!nodes.has(name))nodes.set(name,new Node());return nodes.get(name);};
  const audio=$('#audio');Object.assign(audio,{src:'',paused:true,ended:false,currentTime:0,duration:120,readyState:4,load(){loads.push(this.src);this.currentTime=0;this.ended=false;},async play(){this.paused=false;this.fire('play');this.fire('playing');},pause(){this.paused=true;this.fire('pause');}});
  const state={songs:catalog.map(track=>({...track})),queue:[...queue],history:[],current:null,station:null,continuation:false,saved:[],autofilling:false,shuffle:false,repeat:false};
  const P={state,$,$$:selector=>selector==='[data-action="play"]'?[$('play')]:[],cfg:{},song:id=>state.songs.find(track=>track.id===id),station:id=>({id,name:'Fixture station',description:'Fixture',genre:'fixture'}),art:()=>'',icon:()=>'',esc:String,dialog(){dialogOpen=true;},closeDialog(){dialogOpen=false;},toast:message=>notices.push(message),storage:{get:(key,fallback)=>{try{return JSON.parse(local.getItem(key))??fallback;}catch{return fallback;}},set:(key,value)=>local.setItem(key,JSON.stringify(value))},syncSaved(){},renderLibrary(){},persist(){},actions:{},onInput:[],onChange:[]};
  const APP={jobs,catalog,notify:message=>notices.push(message)},window={PMP:P,PMP_APP:APP,PMPListening:{setPlayIntent(){},ending(){},onTrackStart(){},markManualQueue(){manualCalls++;},async dismissPrepared(){}},addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},removeEventListener(type,fn){listeners.get(type)?.delete(fn);},dispatchEvent(event){for(const fn of [...listeners.get(event.type)||[]])fn(event);}};
  const context=vm.createContext({window,document:{body:{classList:{toggle(){}}}},navigator:{},sessionStorage:storage,crypto:{randomUUID},URL,fetch:async url=>{requests.push(url);throw Error('Waveform decoding is outside this media fixture.');},setTimeout,clearTimeout});
  vm.runInContext(source('player.js'),context,{filename:'player.js'});vm.runInContext(source('creation-followups.js'),context,{filename:'creation-followups.js'});
  return{P,APP,audio,window,storage,notices,loads,requests,get dialogOpen(){return dialogOpen;},open(){dialogOpen=true;},get manualCalls(){return manualCalls;},publish(nextJobs){APP.jobs=nextJobs;window.dispatchEvent({type:'pmp:jobs'});},accept(selected=a,peers=[],options){return P.queueCreation({...selected,preparedTracks:peers},options);},ids:()=>[...state.queue]};
}

test('late verified peers append exactly once with Keep it going off and never interrupt the actual selected media',async()=>{
  const manual=track('d',0,{creationId:'unrelated-fixture'}),h=harness({catalog:[manual],queue:[manual.id]});h.accept();await h.P.playTrack(a.id);const loads=h.loads.length,requests=h.requests.length;
  h.publish([group([a,b])]);assert.deepEqual(h.ids(),[manual.id,b.id]);h.publish([group([a,b])]);h.publish([group([a,b,c],{status:'ready'})]);
  assert.deepEqual(h.ids(),[manual.id,b.id,c.id]);assert.equal(h.P.state.current.id,a.id);assert.equal(h.loads.length,loads);assert.equal(h.requests.length,requests);assert.equal(h.P.state.continuation,false);
});

test('unselected groups and forged/unverified peers never enter the queue',()=>{
  const h=harness();h.publish([group([a,b,c])]);assert.deepEqual(h.ids(),[]);h.accept(a);
  h.publish([group([a,{...b,url:'https://outside.invalid/music'},{...c,owned:false},track('d',2,{creationId:'different-fixture'})])]);assert.deepEqual(h.ids(),[]);
  assert.throws(()=>h.accept({...a,creationId:'unrelated-fixture'}),/verified track record/);
});

test('played peers cannot return after repeated job refreshes or a reload',async()=>{
  const h=harness({jobs:[group([a,b,c])]});h.accept(a,[b,c]);await h.P.playTrack(a.id);await h.P.actions.next();assert.equal(h.P.state.current.id,b.id);assert.deepEqual(h.ids(),[c.id]);
  h.publish([group([a,b,c])]);assert.deepEqual(h.ids(),[c.id]);await h.P.actions.next();assert.equal(h.P.state.current.id,c.id);assert.deepEqual(h.ids(),[]);
  h.publish([group([a,b,c])]);assert.deepEqual(h.ids(),[]);const reload=harness({jobs:[group([a,b,c])],storage:h.storage});assert.deepEqual(reload.ids(),[]);
});

test('explicit removal stays dismissed across later delivery updates and reload',async()=>{
  const h=harness({jobs:[group([a,b,c])]});h.accept(a,[b,c]);await h.P.playTrack(a.id);await h.P.actions['queue-remove']({dataset:{id:b.id}});h.publish([group([a,b,c])]);assert.deepEqual(h.ids(),[c.id]);
  const reload=harness({jobs:[group([a,b,c])],storage:h.storage});assert.deepEqual(reload.ids(),[c.id]);assert.equal(reload.loads.length,0);
});

test('choosing a sibling first cannot resurrect earlier roles when they finish later',async()=>{
  const h=harness({jobs:[group([b])]});h.accept(b);await h.P.playTrack(b.id);h.publish([group([a,b,c])]);assert.deepEqual(h.ids(),[c.id]);
  h.accept(b,[a,c]);h.publish([group([a,b,c])]);assert.deepEqual(h.ids(),[c.id]);
});

test('a new primary can be queued during existing playback without being replayed by refresh',async()=>{
  const manual=track('d',0,{creationId:'other-fixture'}),h=harness({catalog:[manual]});await h.P.playTrack(manual.id);h.accept(a,[],{includePrimary:true});assert.deepEqual(h.ids(),[a.id]);
  h.publish([group([a,b,c])]);assert.deepEqual(h.ids(),[a.id,b.id,c.id]);await h.P.actions.next();assert.equal(h.P.state.current.id,a.id);h.publish([group([a,b,c])]);assert.deepEqual(h.ids(),[b.id,c.id]);
});

test('reload appends only this tab’s unconsumed automatic peers after an existing manual queue',()=>{
  const manual=track('d',0,{creationId:'manual-fixture'}),h=harness({jobs:[group([a,b])]});h.accept(a,[b]);
  const reload=harness({jobs:[group([a,b,c])],catalog:[manual],queue:[manual.id],storage:h.storage});assert.deepEqual(reload.ids(),[manual.id,b.id,c.id]);assert.equal(reload.loads.length,0);
  const otherTab=harness({jobs:[group([a,b,c])]});assert.deepEqual(otherTab.ids(),[]);
});

test('a manual collection replaces the creation follow intent and cannot gain its late peers',async()=>{
  const d=track('d',0,{creationId:'manual-fixture'}),e=track('e',0,{creationId:'manual-fixture'}),h=harness({catalog:[d,e]});h.accept();await h.P.playTrack(a.id);h.P.playCollection([d.id,e.id]);
  h.publish([group([a,b,c])]);assert.equal(h.P.state.current.id,d.id);assert.deepEqual(h.ids(),[e.id]);assert.equal(h.manualCalls,1);
  const reload=harness({jobs:[group([a,b,c])],storage:h.storage});assert.deepEqual(reload.ids(),[]);
});

test('manual play-next ordering wins and another late peer only appends',async()=>{
  const d=track('d',0,{creationId:'manual-fixture'}),h=harness({jobs:[group([a,b])],catalog:[d]});h.accept(a,[b]);await h.P.playTrack(a.id);h.P.queueTrack(d.id);h.publish([group([a,b,c])]);assert.deepEqual(h.ids(),[d.id,b.id,c.id]);assert.equal(h.manualCalls,1);
});

test('a late peer can never replace a device file sharing its ID',()=>{
  const local={...b,title:'Device file',url:'blob:local-fixture',local:true},h=harness({catalog:[local],queue:[local.id]});h.accept();h.publish([group([a,b,c])]);assert.equal(h.P.song(b.id).url,'blob:local-fixture');assert.equal(h.P.song(b.id).title,'Device file');assert.deepEqual(h.ids(),[b.id,c.id]);
});

test('restoring saved automatic peers never overwrites a device file',()=>{
  const original=harness({jobs:[group([a,b,c])]});original.accept(a,[b,c]);
  const local={...b,title:'Device file',url:'blob:local-fixture',local:true},reload=harness({jobs:[group([a,b,c])],catalog:[local],storage:original.storage});
  assert.equal(reload.P.song(b.id).url,'blob:local-fixture');assert.deepEqual(reload.ids(),[c.id]);reload.publish([group([a,b,c])]);assert.deepEqual(reload.ids(),[c.id]);
});

test('a temporarily missing current record waits for verified metadata before restoring a saved peer once',()=>{
  const original=harness({jobs:[group([a,b,c])]});original.accept(a,[b,c]);
  const reload=harness({jobs:[],storage:original.storage});assert.deepEqual(reload.ids(),[]);reload.publish([]);reload.publish([group([a,b,c])]);assert.deepEqual(reload.ids(),[b.id,c.id]);reload.publish([group([a,b,c])]);assert.deepEqual(reload.ids(),[b.id,c.id]);assert.equal(reload.loads.length,0);
});

test('a rejected queue dismissal leaves the peer queued and durable',async()=>{
  const h=harness({jobs:[group([a,b,c])]});h.accept(a,[b,c]);h.window.PMPListening.dismissPrepared=async()=>{throw Error('Fixture server rejection');};
  await h.P.actions['queue-remove']({dataset:{id:b.id}});assert.deepEqual(h.ids(),[b.id,c.id]);assert.match(h.notices.at(-1),/server rejection/);h.publish([group([a,b,c])]);assert.deepEqual(h.ids(),[b.id,c.id]);
  const reload=harness({jobs:[group([a,b,c])],storage:h.storage});assert.deepEqual(reload.ids(),[b.id,c.id]);
});

test('storage failure is visible and stops unrecorded future queue changes',()=>{
  const storage=memory(),h=harness({storage});h.accept();storage.fail=true;h.publish([group([a,b])]);assert.deepEqual(h.ids(),[]);h.publish([group([a,b,c])]);assert.deepEqual(h.ids(),[]);assert.match(h.notices.at(-1),/could not save.*Creation activity/);
});

test('pagehide disconnects followup updates without modifying another player’s records',()=>{
  const h=harness();h.storage.setItem('pmp.room.fixture','preserved');h.accept();h.window.dispatchEvent({type:'pagehide'});h.publish([group([a,b,c])]);assert.deepEqual(h.ids(),[]);assert.equal(h.storage.getItem('pmp.room.fixture'),'preserved');
});

test('navigation persists the actual automatic order after the listening controller reorders its queue',()=>{
  const h=harness({jobs:[group([a,b,c])]});h.accept(a,[b,c]);h.P.state.queue=[c.id,b.id];h.window.dispatchEvent({type:'pagehide'});
  const reload=harness({jobs:[group([a,b,c])],storage:h.storage});assert.deepEqual(reload.ids(),[c.id,b.id]);assert.equal(reload.loads.length,0);
});

test('advancing a reordered listening queue keeps its unplayed earlier-role candidate',async()=>{
  const h=harness({jobs:[group([a,b,c])]});h.accept(a,[b,c]);await h.P.playTrack(a.id);h.P.state.queue=[c.id,b.id];await h.P.actions.next();
  assert.equal(h.P.state.current.id,c.id);assert.deepEqual(h.ids(),[b.id]);h.publish([group([a,b,c])]);assert.deepEqual(h.ids(),[b.id]);await h.P.actions.next();assert.equal(h.P.state.current.id,b.id);assert.deepEqual(h.ids(),[]);
});

test('real player honors keepDialog for worker Play while ordinary playback still closes the dialog',async()=>{
  const h=harness({catalog:[a,b]});await h.P.playTrack(a.id,{keepDialog:true});assert.equal(h.dialogOpen,true);assert.equal(h.audio.src,a.url);await h.P.playTrack(b.id);assert.equal(h.dialogOpen,false);assert.equal(h.audio.src,b.url);
});
