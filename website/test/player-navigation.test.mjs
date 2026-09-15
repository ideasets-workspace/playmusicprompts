import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {once} from 'node:events';
import {Store,sha} from '../server/store.mjs';
import {createApplication} from '../server/http.mjs';

// Real local HTTP/cookies/CSRF/SQLite. Catalogue metadata is an explicit
// fixture; this suite neither generates music nor claims audio decoding.
async function fixture(t){
 const folder=await mkdtemp(join(tmpdir(),'pmp-navigation-')),publicRoot=join(folder,'public');await mkdir(publicRoot);
 await writeFile(join(publicRoot,'player-three.html'),readFileSync(new URL('../public/player-three.html',import.meta.url)));
 const store=new Store(':memory:'),session=store.newSession(),other=store.newSession(),trackId=sha('navigation-track');
 const job=store.admit({owner:session.row.owner,ipKey:'fixture-ip',idem:'navigation-source',payload:{prompt:'PRIVATE NAVIGATION PROMPT'},limits:{daily:100,owner:100,ip:100}}).job;
 store.publish(job,{jobId:job.id,status:'ready',takes:[{id:trackId,take:1,status:'ready',master:{id:sha('private-master'),codec:'pcm_s24le'},listening:{id:sha('public-listening'),codec:'mp3',durationSeconds:30}}]});store.updateJob(job.id,{status:'ready'});
 const config={origin:'http://127.0.0.1:1',publicRoot,stateRoot:folder,production:false,oidc:null,ads:{enabled:false},dailyAdmissionLimit:100,guestDailyLimit:10,ipDailyLimit:10};
 let engineCalls=0;const app=createApplication({config,store,engine:{submit(){engineCalls++;throw Error('Navigation must not submit music');},health(){engineCalls++;return {ok:true};},capabilities(){engineCalls++;throw Error('Not needed for navigation');}},media:{},jobs:{wake(){throw Error('Navigation must not create music');}}});
 app.server.listen(0,'127.0.0.1');await once(app.server,'listening');config.origin='http://127.0.0.1:'+app.server.address().port;
 t.after(async()=>{app.enhancements.stop();app.server.closeAllConnections();await new Promise(r=>app.server.close(r));store.close();const target=resolve(folder);assert.ok(target.startsWith(resolve(tmpdir())+sep)&&target.includes('pmp-navigation-'));await rm(target,{recursive:true,force:true});});
 const headers=who=>({'Content-Type':'application/json',origin:config.origin,cookie:'pmp_dev_session='+who.token,'x-csrf-token':who.row.csrf});
 const request=async(path,{who=session,body,extra={},method=body?'POST':'GET'}={})=>{const r=await fetch(config.origin+path,{method,headers:{...headers(who),...extra},...(body?{body:JSON.stringify(body)}:{}),redirect:'manual'});const text=await r.text();let json;try{json=JSON.parse(text);}catch{}return{status:r.status,headers:r.headers,text,json};};
 return{store,session,other,job,trackId,request,get engineCalls(){return engineCalls;}};
}
test('room selection lives in a session-bound server context, is retryable, and is not a URL or a generation',async t=>{
 const f=await fixture(t),a=await f.request('/api/player-navigation',{body:{trackId:f.trackId}});assert.equal(a.status,200);assert.match(a.json.handle,/^[A-Za-z0-9_-]{43}$/);assert.equal(a.json.trackId,undefined);
 const stored=f.store.db.prepare('SELECT * FROM player_navigation').get();assert.notEqual(stored.handle_hash,a.json.handle);assert.equal(stored.session_hash,f.session.row.token_hash);
 for(let n=0;n<2;n++){const r=await f.request('/api/player-navigation/resolve',{body:{handle:a.json.handle}});assert.equal(r.status,200);assert.equal(r.json.track.id,f.trackId);assert.doesNotMatch(r.text,/PRIVATE NAVIGATION PROMPT|private-master|gs:\/\//);assert.equal(r.headers.get('cache-control'),'no-store');}
 assert.equal(f.engineCalls,0);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,1);
});
test('another guest, forged/expired context, query-only handoff and missing CSRF cannot select a context',async t=>{
 const f=await fixture(t),a=(await f.request('/api/player-navigation',{body:{trackId:f.trackId}})).json;
 assert.equal((await f.request('/api/player-navigation/resolve',{who:f.other,body:{handle:a.handle}})).status,404);
 assert.equal((await f.request('/api/player-navigation/resolve',{body:{handle:'x'.repeat(43)}})).status,404);
 assert.equal((await f.request('/api/player-navigation',{body:{trackId:f.trackId},extra:{'x-csrf-token':'forged'}})).status,403);
 assert.equal((await f.request('/api/player-navigation/resolve?handle='+a.handle,{body:{}})).status,404);
 f.store.db.prepare('UPDATE player_navigation SET expires=0').run();assert.equal((await f.request('/api/player-navigation/resolve',{body:{handle:a.handle}})).status,404);
});
test('arbitrary media destinations and extra private parameters are refused; logout revokes its context',async t=>{
 const f=await fixture(t);for(const body of [{trackId:'https://outside.invalid/audio'},{trackId:sha('missing')},{trackId:f.trackId,url:'https://outside.invalid/audio'},{trackId:f.trackId,prompt:'Injected'}])assert.ok([400,404].includes((await f.request('/api/player-navigation',{body})).status));
 const a=(await f.request('/api/player-navigation',{body:{trackId:f.trackId}})).json;await f.request('/api/auth/logout',{body:{}});
 assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM player_navigation').get().n,0);assert.equal((await f.request('/api/player-navigation/resolve',{body:{handle:a.handle}})).status,401);
});
test('legacy player query redirects to the clean URL and cannot choose a song',async t=>{
 const f=await fixture(t),r=await f.request('/player-three.html?track='+f.trackId+'&prompt=anything');assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/player-three.html');assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM player_navigation').get().n,0);
});
test('explicit public sharing uses its own opaque alias and exposes no creation or download authority',async t=>{
 const f=await fixture(t),link=await f.request('/api/song-links',{body:{trackId:f.trackId}});assert.match(link.json.path,/^\/s\/[A-Za-z0-9_-]{43}$/);assert.ok(!link.json.path.includes(f.trackId));assert.equal((await f.request('/api/song-links',{body:{trackId:f.trackId}})).json.path,link.json.path);
 const page=await f.request(link.json.path,{who:f.other});assert.equal(page.status,200);assert.match(page.text,/<base href="\/">/);assert.ok(page.text.includes('data-public-song="'+f.trackId+'"'));assert.doesNotMatch(page.text,/PRIVATE NAVIGATION PROMPT/);
 assert.equal((await f.request('/api/jobs/'+f.job.id,{who:f.other})).status,404);assert.equal((await f.request('/api/downloads/'+f.trackId,{who:f.other,body:{}})).status,401);
 assert.equal((await f.request('/s/'+sha('not a valid alias'),{who:f.other})).status,404);
});
