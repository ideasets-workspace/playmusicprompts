import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../public/creation-continuation.js',import.meta.url),'utf8');
class Events{listeners=new Map();addEventListener(n,f){this.listeners.set(n,[...(this.listeners.get(n)||[]),f]);}removeEventListener(n,f){this.listeners.set(n,(this.listeners.get(n)||[]).filter(v=>v!==f));}emit(n,extra={}){for(const f of this.listeners.get(n)||[])f({type:n,...extra});}}
function fixture({storage=new Map(),scope='a'.repeat(64),reject=false,storageFails=false}={}){
 const window=new Events(),document=new Events(),audio=new Events(),calls=[],notices=[];
 const track={id:'b'.repeat(64),title:'Actual returned primary fixture',url:'/api/listen/'+'b'.repeat(64),owned:true};
 Object.assign(audio,{paused:true,ended:false,readyState:0,currentSrc:''});
 const player={audio,state:{current:null}},app={authScope:scope,jobs:[{id:'fixture-group',status:'pending',creation:{primaryTrackId:track.id,primaryStatus:'ready'},tracks:[track]}],notify:m=>notices.push(m)};
 Object.assign(window,{location:{origin:'http://local.invalid',href:'http://local.invalid/index.html'},PMPListening:{setEnabled(value){calls.push(value);return reject?Promise.reject(Error('Fixture unavailable')):Promise.resolve(true);}}});
 vm.runInNewContext(source,{window,URL});
 const controller=window.PMPCreationContinuationFactory.create({app,player,storage:{getItem:k=>storage.get(k),setItem(k,v){if(storageFails)throw Error('Denied');storage.set(k,v);}},document,window});
 function play(t=track){player.state.current=t;Object.assign(audio,{paused:false,ended:false,readyState:4,currentSrc:new URL(t.url,window.location.origin).href});audio.emit('playing');}
 return{controller,track,app,player,audio,window,document,calls,notices,storage,play};
}
test('real decoded primary playback enables exactly once; result receipt and loading events do not',async()=>{
 const f=fixture();assert.equal(f.controller.arm(f.track),true);assert.equal(f.calls.length,0);
 f.player.state.current=f.track;f.audio.paused=false;f.audio.emit('play');f.audio.emit('playing');assert.equal(f.calls.length,0);
 f.play();f.audio.emit('playing');assert.deepEqual(f.calls,[true]);
});
test('queued creation never enables for the old song, but its later primary does',()=>{const f=fixture();f.controller.arm(f.track);f.play({...f.track,id:'c'.repeat(64),url:'/api/listen/'+'c'.repeat(64)});assert.equal(f.calls.length,0);f.play();assert.equal(f.calls.length,1);});
test('reload retains a target only for the same owner and waits for playback',()=>{const one=fixture();one.controller.arm(one.track);one.controller.dispose();const two=fixture({storage:one.storage});assert.equal(two.calls.length,0);two.play();assert.equal(two.calls.length,1);const three=fixture({storage:one.storage});three.play();assert.equal(three.calls.length,0);});
test('scope change, explicit off, and new-creation clear cannot revive a pending target',()=>{
 for(const mode of ['scope','off','clear']){const f=fixture();f.controller.arm(f.track);if(mode==='scope'){const g=fixture({storage:f.storage,scope:'d'.repeat(64)});g.play();assert.equal(g.calls.length,0);}else{if(mode==='off')f.document.emit('change',{target:{id:'expanded-continuation',checked:false}});else f.controller.clear();f.play();assert.equal(f.calls.length,0);}}
});
test('local/remote/unconfirmed/secondary results never arm a continuation',()=>{for(const kind of ['local','remote','secondary','unconfirmed']){const f=fixture();if(kind==='local')f.app.jobs[0].tracks[0].local=true;if(kind==='remote')f.app.jobs[0].tracks[0].url='https://elsewhere.invalid/audio';if(kind==='secondary')f.app.jobs[0].creation.primaryTrackId='e'.repeat(64);if(kind==='unconfirmed')f.app.jobs[0].creation.primaryStatus='ingesting';assert.equal(f.controller.arm(f.track),false);f.play();assert.equal(f.calls.length,0);}});
test('source mismatch, ads, pause and disposal suppress automatic creation',()=>{for(const kind of ['source','ads','pause','dispose']){const f=fixture();f.controller.arm(f.track);f.player.state.current=f.track;Object.assign(f.audio,{currentSrc:'http://local.invalid'+f.track.url,paused:false,readyState:4});if(kind==='source')f.audio.currentSrc='https://other.invalid'+f.track.url;if(kind==='ads')f.window.PMPAds={active:true};if(kind==='pause')f.audio.paused=true;if(kind==='dispose')f.controller.dispose();f.audio.emit('playing');assert.equal(f.calls.length,0);}});
test('failed enable is not automatically retried by another media event',async()=>{const f=fixture({reject:true});f.controller.arm(f.track);f.play();await new Promise(resolve=>setImmediate(resolve));f.audio.emit('playing');assert.equal(f.calls.length,1);assert.match(f.notices[0],/unavailable/);});
test('storage failure cannot initiate continuation',()=>{const f=fixture({storageFails:true});assert.equal(f.controller.arm(f.track),false);f.play();assert.equal(f.calls.length,0);assert.match(f.notices[0],/storage/);});
test('a primary already started from its worker popup uses its actual observed playback when Create settles',()=>{const f=fixture();f.play();assert.equal(f.calls.length,0);f.controller.arm(f.track);assert.equal(f.calls.length,1);f.audio.emit('playing');assert.equal(f.calls.length,1);});
