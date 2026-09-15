import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

// Tests the production store and filesystem boundaries. This is not GPU or visual evidence.
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const lab=resolve(root,'website_html_templates_beyond');
const original=resolve(root,'website_html_templates');
const {AETHER_KEY,AETHER_DEFAULTS,AETHER_SCHEMA,sanitizeAether,createAetherStore}=await import(pathToFileURL(resolve(lab,'lab-aether-settings.js')));
const checks=[];
function check(name,run){run();checks.push(name);}
const clone=value=>structuredClone(value);
function adapter(initial={}){
 const map=new Map(Object.entries(clone(initial)));let failed=false,thrown=false,writes=[];
 return {map,writes,set failed(value){failed=value;},set thrown(value){thrown=value;},get(key,fallback){return map.has(key)?clone(map.get(key)):fallback;},set(key,value){writes.push({key,value:clone(value)});if(thrown)throw Error('storage unavailable');if(failed)return false;map.set(key,clone(value));return true;}};
}
check('defaults are complete and independent',()=>{
 assert.equal(AETHER_KEY,'pmp.beyond.aether.v1');assert.equal(Object.keys(AETHER_DEFAULTS).length,8);
 assert.deepEqual(sanitizeAether(null),AETHER_DEFAULTS);assert.deepEqual(sanitizeAether([]),AETHER_DEFAULTS);
 const value=sanitizeAether(null);value.flow=0;assert.equal(AETHER_DEFAULTS.flow,1);
});
check('numeric boundaries clamp every parameter',()=>{
 for(const [key,schema]of Object.entries(AETHER_SCHEMA)){assert.equal(sanitizeAether({[key]:-1e9})[key],schema.min);assert.equal(sanitizeAether({[key]:1e9})[key],schema.max);}
});
check('invalid persisted values recover to defaults',()=>{
 for(const value of [NaN,Infinity,-Infinity,'1',true,null,{},[]])for(const key of Object.keys(AETHER_SCHEMA))assert.equal(sanitizeAether({[key]:value})[key],AETHER_DEFAULTS[key]);
 assert.equal(sanitizeAether({form:'supernova',journey:'true',unknown:4}).form,'silk');
 assert.equal(sanitizeAether({journey:'true'}).journey,false);assert.equal(Object.hasOwn(sanitizeAether({unknown:4}),'unknown'),false);
});
check('init and repeated read never write storage',()=>{
 const storage=adapter(),store=createAetherStore(storage);for(let i=0;i<10;i++)assert.deepEqual(store.read(),AETHER_DEFAULTS);assert.equal(storage.writes.length,0);
});
check('read storage failure recovers without side effects',()=>{
 let writes=0;const store=createAetherStore({get(){throw Error('blocked');},set(){writes++;return false;}});assert.deepEqual(store.read(),AETHER_DEFAULTS);assert.equal(writes,0);
});
check('stored settings are sanitized without initialization writes',()=>{
 const storage=adapter({[AETHER_KEY]:{flow:20,form:'helix',journey:true,unknown:1}}),store=createAetherStore(storage);assert.equal(store.read().flow,2);assert.equal(store.read().form,'helix');assert.equal(storage.writes.length,0);
});
check('patch merges against latest storage, preserving peer fields',()=>{
 const storage=adapter(),one=createAetherStore(storage),two=createAetherStore(storage);one.patch({flow:1.3});two.patch({depth:.2});one.patch({form:'nova'});assert.deepEqual(one.read(),{...AETHER_DEFAULTS,flow:1.3,depth:.2,form:'nova'});
});
check('same-field last successful patch wins',()=>{
 const storage=adapter(),one=createAetherStore(storage),two=createAetherStore(storage);one.patch({flow:.3});two.patch({flow:1.9});assert.equal(one.read().flow,1.9);
});
check('invalid patches reject atomically without writes',()=>{
 const storage=adapter(),store=createAetherStore(storage);for(const patch of [null,[],2,{flow:NaN},{flow:Infinity},{flow:'1'},{unknown:1},{journey:1},{form:'void'},{flow:.5,depth:'bad'}]){assert.equal(store.patch(patch).ok,false);assert.deepEqual(store.read(),AETHER_DEFAULTS);}assert.equal(storage.writes.length,0);
});
check('prototype-named fields cannot enter saved settings',()=>{
 const storage=adapter(),store=createAetherStore(storage);for(const patch of [JSON.parse('{"__proto__":{"flow":0}}'),{constructor:2},{prototype:2}])assert.equal(store.patch(patch).ok,false);assert.equal(storage.writes.length,0);assert.deepEqual(store.read(),AETHER_DEFAULTS);
});
check('patch bounds values and avoids mutating supplied object',()=>{
 const storage=adapter(),store=createAetherStore(storage),patch={spread:10,flow:-3};const result=store.patch(patch);assert.equal(result.ok,true);assert.equal(result.settings.spread,1.5);assert.equal(result.settings.flow,0);assert.deepEqual(patch,{spread:10,flow:-3});
});
check('failed save retains live choice but does not claim durability',()=>{
 const storage=adapter(),store=createAetherStore(storage);storage.failed=true;const result=store.patch({flow:1.7,form:'helix'});assert.equal(result.ok,false);assert.match(result.error,/could not be saved/);assert.equal(store.read().flow,1.7);assert.equal(store.read().form,'helix');assert.equal(storage.map.has(AETHER_KEY),false);
});
check('transient fields merge with peer changes and retry durably',()=>{
 const storage=adapter(),store=createAetherStore(storage);storage.failed=true;store.patch({flow:1.7});storage.map.set(AETHER_KEY,{...AETHER_DEFAULTS,depth:.22,form:'nova'});assert.equal(store.read().flow,1.7);assert.equal(store.read().depth,.22);assert.equal(store.read().form,'nova');storage.failed=false;assert.equal(store.patch({journey:true}).ok,true);assert.deepEqual(storage.map.get(AETHER_KEY),{...AETHER_DEFAULTS,flow:1.7,depth:.22,form:'nova',journey:true});
});
check('successful retry clears stale transient ownership',()=>{
 const storage=adapter(),store=createAetherStore(storage);storage.failed=true;store.patch({flow:1.7});storage.failed=false;store.patch({glow:1.4});storage.map.set(AETHER_KEY,{...store.read(),flow:.2});assert.equal(store.read().flow,.2);
});
check('thrown saves retain transient edits and can recover',()=>{
 const storage=adapter(),store=createAetherStore(storage);storage.thrown=true;assert.equal(store.patch({focus:.9}).ok,false);assert.equal(store.read().focus,.9);storage.thrown=false;assert.equal(store.patch({form:'nova'}).ok,true);assert.equal(storage.map.get(AETHER_KEY).focus,.9);
});
check('reset restores all fields durably',()=>{
 const storage=adapter(),store=createAetherStore(storage);store.patch({form:'helix',flow:0,journey:true});assert.equal(store.patch({...AETHER_DEFAULTS}).ok,true);assert.deepEqual(store.read(),AETHER_DEFAULTS);
});
check('returned objects cannot mutate persisted or transient state',()=>{
 const storage=adapter(),store=createAetherStore(storage),result=store.patch({form:'nova'});result.settings.flow=0;assert.equal(store.read().flow,1);storage.failed=true;const failed=store.patch({flow:1.8});failed.settings.flow=.2;assert.equal(store.read().flow,1.8);
});
check('store writes only lab key and preserves original keys',()=>{
 const untouched={'pmp.room.preferences.v2':{model:'orbital'},'pmp.room.session.v2':{current:'owner-song',time:24},'pmp.room.visual-studio.v1':{settings:{exposure:1.2}},'pmp.room.director.v1':{mode:'score'}};
 const storage=adapter(untouched),store=createAetherStore(storage);store.patch({form:'helix'});for(const[key,value]of Object.entries(untouched))assert.deepEqual(storage.map.get(key),value);assert.ok(storage.writes.every(row=>row.key===AETHER_KEY));
});

const {createDirectorStore,createDirectorEngine,sanitizeDirectorConfig,DIRECTOR_DEFAULTS,DIRECTOR_STORAGE_KEY}=await import(pathToFileURL(resolve(lab,'player-three-director.js')));
const {VISUAL_DEFAULTS,createVisualStore}=await import(pathToFileURL(resolve(lab,'player-three-visual-settings.js')));
const cue=(id,time,form,extra={})=>({id,time,label:id,scene:'aether',duration:0,settings:{...VISUAL_DEFAULTS},labLook:{...AETHER_DEFAULTS,form,...extra}});
const scored={...DIRECTOR_DEFAULTS,mode:'score',scoreTrackId:'test-song',cues:[cue('cue-silk',0,'silk',{flow:.7}),cue('cue-helix',10,'helix',{depth:.2}),cue('cue-nova',20,'nova',{glow:1.3})]};
const frame={baseSettings:VISUAL_DEFAULTS,scene:'aether',trackId:'test-song',time:0,dt:1/60,motion:true,playing:true,signals:{}};
check('Director persists complete Aether cue appearance under lab namespace',()=>{
 const storage=adapter(),store=createDirectorStore(storage);assert.equal(DIRECTOR_STORAGE_KEY,'pmp.beyond.room.director.v1');const result=store.patch(scored);assert.equal(result.ok,true);assert.notEqual(result.accepted,false);assert.deepEqual(store.read().cues.map(c=>c.labLook),scored.cues.map(c=>c.labLook));
});
check('Director rejects malformed Aether cue field types without modifying a saved score',()=>{
 const storage=adapter(),store=createDirectorStore(storage);assert.equal(store.patch(scored).ok,true);const saved=clone(storage.map.get(DIRECTOR_STORAGE_KEY)),initialWrites=storage.writes.length;
 for(const malformed of [{flow:'fast'},{spread:null},{turbulence:true},{glow:[]},{depth:{}},{focus:'0.5'},{form:'unknown'},{journey:'yes'}]){const result=store.patch({cues:[{...cue('bad-cue',0,'silk'),labLook:{...AETHER_DEFAULTS,...malformed}}]});assert.equal(result.ok,false,JSON.stringify(malformed));assert.equal(result.accepted,false);assert.deepEqual(storage.map.get(DIRECTOR_STORAGE_KEY),saved);}
 assert.equal(storage.writes.length,initialWrites);
});
check('Director rejects every non-finite and non-number Aether scalar while preserving the entire saved score',()=>{
 const storage=adapter(),store=createDirectorStore(storage);assert.equal(store.patch(scored).ok,true);const saved=clone(storage.map.get(DIRECTOR_STORAGE_KEY)),writes=storage.writes.length;
 for(const key of Object.keys(AETHER_SCHEMA))for(const value of [NaN,Infinity,-Infinity,'1',null,true,{},[]]){
  const result=store.patch({cues:[{...cue('invalid-scalar',0,'silk'),labLook:{[key]:value}}]});
  assert.equal(result.ok,false,`${key}: ${String(value)}`);assert.equal(result.accepted,false);assert.deepEqual(storage.map.get(DIRECTOR_STORAGE_KEY),saved);
 }
 assert.equal(storage.writes.length,writes);
});
check('Director accepts partial valid Aether appearances, bounds numbers and restores unspecified defaults',()=>{
 const storage=adapter(),store=createDirectorStore(storage);
 for(const partial of [{},{form:'silk'},{form:'nova'},{form:'helix'},{journey:true},{journey:false},...Object.keys(AETHER_SCHEMA).flatMap(key=>[{[key]:-1e6},{[key]:1e6}])]){
  const result=store.patch({cues:[{...cue('partial-world',0,'silk'),labLook:partial}]});assert.equal(result.ok,true,JSON.stringify(partial));assert.deepEqual(store.read().cues[0].labLook,sanitizeAether(partial));
 }
});
check('Director rejects accessor-bearing Aether patches without executing getters or overwriting the saved score',()=>{
 const storage=adapter(),store=createDirectorStore(storage);assert.equal(store.patch(scored).ok,true);const saved=clone(storage.map.get(DIRECTOR_STORAGE_KEY)),writes=storage.writes.length;let calls=0;
 for(const key of Object.keys(AETHER_DEFAULTS))for(const enumerable of [true,false]){
  const labLook={};Object.defineProperty(labLook,key,{enumerable,get(){calls++;throw Error('An accessor must never run');}});
  const result=store.patch({cues:[{...cue('accessor-world',0,'silk'),labLook}]});assert.equal(result.ok,false);assert.equal(result.accepted,false);
 }
 assert.equal(calls,0);assert.equal(storage.writes.length,writes);assert.deepEqual(storage.map.get(DIRECTOR_STORAGE_KEY),saved);
});
check('Director recovery never evaluates nested Aether accessors and retains valid own data fields',()=>{
 let calls=0;const labLook={glow:1.4};
 Object.defineProperty(labLook,'flow',{enumerable:true,get(){calls++;return 2;}});
 Object.defineProperty(labLook,'form',{enumerable:false,get(){calls++;return 'helix';}});
 const recovered=sanitizeDirectorConfig({...scored,cues:[{...cue('recover-world',0,'silk'),labLook}]});
 assert.equal(calls,0,'Recovery invoked an accessor inside cue.labLook');assert.equal(recovered.cues[0].labLook.glow,1.4);assert.equal(recovered.cues[0].labLook.flow,AETHER_DEFAULTS.flow);assert.equal(recovered.cues[0].labLook.form,AETHER_DEFAULTS.form);
});
check('Director keeps Aether valid in manual mode',()=>{
 const engine=createDirectorEngine();const live=engine.update(frame);assert.equal(live.scene,'aether');assert.equal(live.labLook,null);
});
check('absolute cue seeking restores each Aether form and appearance',()=>{
 const engine=createDirectorEngine();engine.setConfig(scored);for(const[time,form,flow,depth,glow]of [[0,'silk',.7,.65,1],[13,'helix',1,.2,1],[25,'nova',1,.65,1.3],[1,'silk',.7,.65,1]]){const live=engine.update({...frame,time});assert.equal(live.scene,'aether');assert.equal(live.labLook.form,form);assert.equal(live.labLook.flow,flow);assert.equal(live.labLook.depth,depth);assert.equal(live.labLook.glow,glow);}
});
check('Motion off holds scored Aether shape through seeks',()=>{
 const engine=createDirectorEngine();engine.setConfig(scored);engine.update({...frame,time:12});const live=engine.update({...frame,motion:false,time:24});assert.equal(live.labLook.form,'helix');assert.equal(live.activeCueId,'cue-helix');
});
check('different song and manual bypass clear score-specific Aether override',()=>{
 const engine=createDirectorEngine();engine.setConfig(scored);engine.update({...frame,time:24});const mismatch=engine.update({...frame,time:24,trackId:'other-song'});assert.equal(mismatch.labLook,null);assert.match(mismatch.status,/another song/);engine.setConfig({...scored,mode:'manual'});assert.equal(engine.update({...frame,time:24}).labLook,null);
});
check('legacy cues without lab data and returned scored values remain independent',()=>{
 const storage=adapter(),store=createDirectorStore(storage),legacy={id:'cue-record',time:0,label:'Record',scene:'record',duration:0,settings:{...VISUAL_DEFAULTS}};assert.equal(store.patch({...scored,cues:[legacy]}).ok,true);assert.equal(Object.hasOwn(store.read().cues[0],'labLook'),false);const engine=createDirectorEngine();engine.setConfig(scored);const live=engine.update({...frame,time:24});live.labLook.glow=.2;assert.equal(engine.update({...frame,time:24}).labLook.glow,1.3);
});
check('entering Aether controls exits hidden Studio comparison',()=>{
 const source=readFileSync(resolve(lab,'player-three-visual-studio.js'),'utf8');
 const actual=source.split(/\r?\n/).find(line=>line.trimStart().startsWith('function showTab('));assert.ok(actual,'Source showTab must be available for focused flow check');
 let comparisonsEnded=0;const node={setAttribute(){},focus(){},hidden:false,tabIndex:0,scrollTop:0};
 const showTab=new Function('STUDIO_TABS','endCompare','panel','q',`let activeTab='look';${actual};return showTab;`)(['look','motion','scene','world','director'],()=>comparisonsEnded++,{classList:{toggle(){}}},()=>node);
 showTab('world');assert.equal(comparisonsEnded,1,'Aether hides the Compare control, so it must end comparison on entry');
});

const {SCENES,getScene}=await import(pathToFileURL(resolve(lab,'player-three-collection.js')));
check('revision 2 has three new worlds, four preserved choices and a Tidal default',()=>{
 assert.deepEqual(SCENES.map(scene=>scene.id),['tidal','monolith','aether','record','aurora','orbital','liquid']);assert.equal(new Set(SCENES.map(scene=>scene.id)).size,7);assert.equal(getScene().id,'tidal');assert.equal(getScene('unknown').id,'tidal');
});
check('Director stores and restores all three environment cues, including captured shared controls',()=>{
 const cues=['tidal','monolith','aether'].map((scene,index)=>({...cue('world-'+scene,index*10,['silk','nova','helix'][index],{flow:.4+index*.5,glow:.5+index*.4,journey:index===1}),scene}));
 const config={...scored,cues},storage=adapter(),store=createDirectorStore(storage),engine=createDirectorEngine();assert.equal(store.patch(config).ok,true);assert.deepEqual(store.read().cues,cues);engine.setConfig(store.read());
 for(const index of [0,2,1,0]){const live=engine.update({...frame,time:index*10+1});assert.equal(live.scene,cues[index].scene);assert.deepEqual(live.labLook,cues[index].labLook);}
 engine.update({...frame,time:11});const held=engine.update({...frame,time:25,motion:false});assert.equal(held.scene,'monolith');assert.deepEqual(held.labLook,cues[1].labLook);
});
check('the actual cue capture constructor includes lab appearance for each new environment',()=>{
 const source=readFileSync(resolve(lab,'player-three-director-ui.js'),'utf8'),statement=source.split(/\r?\n/).find(line=>line.trimStart().startsWith('const snapshot = getSnapshot(), cue ='));assert.ok(statement);
 const construct=new Function('getSnapshot','getScene','sanitizeVisualSettings','q','cueId','current','existing','time','duration',`${statement};return cue;`);
 for(const scene of ['tidal','monolith','aether','record']){const labLook={...AETHER_DEFAULTS,form:'helix',glow:1.4,journey:true},captured=construct(()=>({scene,settings:VISUAL_DEFAULTS,labLook}),getScene,value=>({...value}),()=>({value:'Captured world'}),()=>`capture-${scene}`,{cues:[]},null,12,2);assert.equal(captured.scene,scene);if(scene==='record')assert.equal(Object.hasOwn(captured,'labLook'),false);else{assert.deepEqual(captured.labLook,labLook);labLook.glow=.2;assert.equal(captured.labLook.glow,1.4);}}
});
check('manual world edits inherit the visible scored appearance before bypassing Director',()=>{
 const source=readFileSync(resolve(lab,'lab-aether-ui.js'),'utf8'),statement=source.split(/\r?\n/).find(line=>line.trimStart().startsWith('function commit(patch)'));assert.ok(statement);
 const storage=adapter({[AETHER_KEY]:{...AETHER_DEFAULTS,flow:.2}}),realStore=createAetherStore(storage),order=[];let scoredLook={...AETHER_DEFAULTS,form:'helix',flow:1.7,glow:1.4,depth:.2,journey:true};const visible=clone(scoredLook),status={};
 const subject=new Function('getScoredLook','onManualEdit','store','apply','render','q','toast',`let settings;${statement};return {commit,get settings(){return settings;}};`)(()=>{order.push('read');return scoredLook;},()=>{order.push('bypass');scoredLook=null;},{patch(value){order.push('save');return realStore.patch(value);}},()=>order.push('apply'),()=>order.push('render'),()=>status,()=>assert.fail('Unexpected save failure'));
 subject.commit({spread:1.3});assert.deepEqual(order,['read','bypass','save','apply','render']);assert.deepEqual(subject.settings,{...visible,spread:1.3});assert.deepEqual(realStore.read(),{...visible,spread:1.3});assert.match(status.textContent,/saved/);
});
check('main exposes scored world state only while Score mode owns it, preventing stale manual edits',()=>{
 const source=readFileSync(resolve(lab,'player-three.js'),'utf8'),match=source.match(/getScoredLook:\(\)=>([^,]+),storage/);assert.ok(match,'Review changed plumbing before adapting the harness');
 const read=new Function('performanceDirector',`return ${match[1]};`),labLook={...AETHER_DEFAULTS,form:'nova'};
 assert.equal(read({config:{mode:'score'},live:{labLook}}),labLook);assert.equal(read({config:{mode:'manual'},live:{labLook}}),null);assert.equal(read(null),null);
});
check('main analyser loop updates both world controls and the revised shell after Director',()=>{
 const source=readFileSync(resolve(lab,'player-three.js'),'utf8'),statement=source.split(/\r?\n/).find(line=>line.startsWith('function analyse()'));assert.ok(statement);const order=[];
 new Function('soundControls','performance','room','ctx','analyser','audio','muted','volume','performanceDirector','aetherControls','labShell','requestAnimationFrame',`let bins=null;${statement}`)({read(){order.push('read-audio');return new Uint8Array([1,2]);}},{now:()=>100},{setAudio(){order.push('route-audio');}},null,null,{paused:false,ended:false,readyState:4},false,.7,{tick(){order.push('director');}},{tick(){order.push('controls');}},{tick(){order.push('shell');}},()=>order.push('schedule'));
 assert.deepEqual(order,['schedule'],'The source registers its loop once');
 const execute=statement.slice(0,statement.lastIndexOf('requestAnimationFrame(analyse);'));
 order.length=0;new Function('soundControls','performance','room','ctx','analyser','audio','muted','volume','performanceDirector','aetherControls','labShell','requestAnimationFrame',`let bins=null;${execute};analyse();`)({read(){order.push('read-audio');return new Uint8Array([1,2]);}},{now:()=>100},{setAudio(){order.push('route-audio');}},null,null,{paused:false,ended:false,readyState:4},false,.7,{tick(){order.push('director');}},{tick(){order.push('controls');}},{tick(){order.push('shell');}},()=>order.push('schedule'));
 assert.deepEqual(order,['read-audio','route-audio','director','controls','shell','schedule']);
});

// The real coordinator runs with only its DOM-heavy controls represented by an explicit boundary.
let coordinatorUI;globalThis.__labCoordinatorUI=args=>{coordinatorUI=args;return {update(){},refresh(){},dispose(){}};};
const uiBoundary='data:text/javascript;base64,'+Buffer.from('export function createDirectorControls(args){return globalThis.__labCoordinatorUI(args);}').toString('base64');
const coordinatorSource=readFileSync(resolve(lab,'player-three-performance.js'),'utf8').replace("'./player-three-director.js'",JSON.stringify(pathToFileURL(resolve(lab,'player-three-director.js')).href)).replace("'./player-three-visual-settings.js'",JSON.stringify(pathToFileURL(resolve(lab,'player-three-visual-settings.js')).href)).replace("'./player-three-director-ui.js'",JSON.stringify(uiBoundary));
const {createPerformanceDirector}=await import('data:text/javascript;base64,'+Buffer.from(coordinatorSource).toString('base64'));
check('actual coordinator captures and applies three-world cue state without per-frame storage writes',()=>{
 const priorWindow=globalThis.window;globalThis.window={addEventListener(){},removeEventListener(){}};
 const cues=['tidal','monolith','aether'].map((scene,index)=>({...cue('live-'+scene,index*10,['silk','nova','helix'][index],{flow:.4+index*.5,journey:true}),scene}));
 const storage=adapter({[DIRECTOR_STORAGE_KEY]:{...scored,cues}}),audio={currentTime:0,paused:false,ended:false,readyState:4},applied=[];let current='tidal';
 const base={...AETHER_DEFAULTS,flow:.3},room={diagnostics:{motion:true,signals:{}},setVisualSettings(){},setPerformance(){},setLabSettings(value){applied.push(clone(value));}};
 const director=createPerformanceDirector({container:{},storage,getRoom:()=>room,getBase:()=>VISUAL_DEFAULTS,getScene:()=>current,getManualScene:()=> 'tidal',getLabBase:()=>base,getTrack:()=>({id:'test-song'}),audio,seek(){},onScene(value){current=value;},toast(){}});
 try{let now=performance.now();for(const index of [0,1,2,0]){audio.currentTime=index*10+1;director.tick(now+=250);assert.equal(current,cues[index].scene);assert.deepEqual(applied.at(-1),cues[index].labLook);const snapshot=coordinatorUI.getSnapshot();assert.equal(snapshot.scene,cues[index].scene);assert.deepEqual(snapshot.labLook,cues[index].labLook);snapshot.labLook.flow=0;assert.equal(director.live.labLook.flow,cues[index].labLook.flow);}assert.equal(storage.writes.length,0);director.bypass();director.tick(now+=250);assert.equal(current,'tidal');assert.deepEqual(applied.at(-1),base);assert.deepEqual(coordinatorUI.getSnapshot().labLook,base);}
 finally{director.dispose();globalThis.window=priorWindow;}
});
check('editing a scored world adopts its visible scene before bypass and persists only the intended appearance change',()=>{
 const main=readFileSync(resolve(lab,'player-three.js'),'utf8'),line=main.split(/\r?\n/).find(value=>value.startsWith('aetherControls=createAetherControls('));
 const callback=line?.match(/onManualEdit:(\(\)=>\{[^}]*\}),toast/);assert.ok(callback,'Review the actual World manual-edit callback before adapting the test');
 const controlSource=readFileSync(resolve(lab,'lab-aether-ui.js'),'utf8'),commitSource=controlSource.split(/\r?\n/).find(value=>value.trimStart().startsWith('function commit(patch)'));assert.ok(commitSource);
 const priorWindow=globalThis.window;globalThis.window={addEventListener(){},removeEventListener(){}};
 try{for(const[visible,time,stale]of [['aether',10,'monolith'],['tidal',0,'aether'],['monolith',20,'tidal']]){
   const cues=[{...cue('regression-tidal',0,'silk',{depth:.3}),scene:'tidal'},{...cue('regression-aether',10,'helix',{glow:1.4,journey:true}),scene:'aether'},{...cue('regression-monolith',20,'nova',{focus:.8}),scene:'monolith'}];
   const storage=adapter({[DIRECTOR_STORAGE_KEY]:{...scored,cues},[AETHER_KEY]:{...AETHER_DEFAULTS,form:'nova',flow:.4}}),store=createAetherStore(storage),visualState={model:stale},order=[];
   let director,subject;const ownership=new Function('visualState','performanceDirector','initial',`let manualScene=initial;return {getManualScene:()=>manualScene,onManualEdit:${callback[1]}};`)(visualState,{bypass(){order.push('bypass');assert.equal(ownership.getManualScene(),visible,'Visible world must be adopted before bypass');director.bypass();}},stale);
   const room={diagnostics:{motion:true,signals:{}},setVisualSettings(){},setPerformance(){},setLabSettings(){}};
   const audio={currentTime:time,paused:true,ended:false,readyState:4};
   director=createPerformanceDirector({container:{},storage,getRoom:()=>room,getBase:()=>VISUAL_DEFAULTS,getScene:()=>visualState.model,getManualScene:ownership.getManualScene,getLabBase:()=>subject?.settings||store.read(),getTrack:()=>({id:'test-song'}),audio,seek(){},onScene(id){visualState.model=id;},toast(){}});
   try{let now=performance.now();director.tick(now+=250);assert.equal(visualState.model,visible);assert.equal(ownership.getManualScene(),stale);const displayed=clone(director.live.labLook);
     subject=new Function('getScoredLook','onManualEdit','store','apply','render','q','toast',`let settings;${commitSource};return {commit,get settings(){return settings;}};`)(()=>{order.push('read-visible');return director.config.mode==='score'?director.live.labLook:null;},ownership.onManualEdit,{patch(value){order.push('save');assert.equal(ownership.getManualScene(),visible);assert.equal(director.config.mode,'manual');return store.patch(value);}},()=>order.push('apply'),()=>order.push('render'),()=>({}),()=>assert.fail('Unexpected save failure'));
     subject.commit({flow:2});assert.deepEqual(order,['read-visible','bypass','save','apply','render']);assert.deepEqual(store.read(),{...displayed,flow:2});
     director.tick(now+=250);assert.equal(visualState.model,visible,'Next coordinator frame must keep the edited world visible');assert.equal(director.live.scene,visible);assert.equal(director.config.mode,'manual');assert.deepEqual(coordinatorUI.getSnapshot().labLook,{...displayed,flow:2});
   }finally{director.dispose();}
 }}finally{globalThis.window=priorWindow;}
});
check('editing a Studio control keeps the visible scored world instead of returning to the previous manual scene',()=>{
 const main=readFileSync(resolve(lab,'player-three.js'),'utf8'),line=main.split(/\r?\n/).find(value=>value.startsWith('visualStudio=createVisualStudio('));
 const callback=line?.match(/onManualEdit:(\(\)=>\{[^}]*\}),onCompareChange/);assert.ok(callback,'Review the actual Studio manual-edit callback before adapting the test');
 const source=readFileSync(resolve(lab,'player-three-visual-studio.js'),'utf8'),start=source.indexOf('  function patch(key,value){'),end=source.indexOf('  function replace(settingsToApply)',start);assert(start>=0&&end>start);const patchSource=source.slice(start,end);
 const priorWindow=globalThis.window;globalThis.window={addEventListener(){},removeEventListener(){}};
 try{for(const[visible,time,stale]of [['aether',10,'monolith'],['tidal',0,'aether'],['monolith',20,'tidal']]){
   const cues=[{...cue('studio-tidal',0,'silk'),scene:'tidal'},{...cue('studio-aether',10,'helix'),scene:'aether'},{...cue('studio-monolith',20,'nova'),scene:'monolith'}];
   const storage=adapter({[DIRECTOR_STORAGE_KEY]:{...scored,cues}}),store=createVisualStore(storage),visualState={model:stale},order=[];let director,subject;
   const ownership=new Function('visualState','performanceDirector','initial',`let manualScene=initial;return {getManualScene:()=>manualScene,onManualEdit:${callback[1]}};`)(visualState,{bypass(){order.push('bypass');assert.equal(ownership.getManualScene(),visible);director.bypass();}},stale);
   const room={diagnostics:{motion:true,signals:{}},setVisualSettings(){},setPerformance(){},setLabSettings(){}},audio={currentTime:time,paused:true,ended:false,readyState:4};
   director=createPerformanceDirector({container:{},storage,getRoom:()=>room,getBase:()=>subject?.settings||store.read().settings,getScene:()=>visualState.model,getManualScene:ownership.getManualScene,getLabBase:()=>AETHER_DEFAULTS,getTrack:()=>({id:'test-song'}),audio,seek(){},onScene(id){visualState.model=id;},toast(){}});
   try{let now=performance.now();director.tick(now+=250);assert.equal(visualState.model,visible);assert.equal(ownership.getManualScene(),stale);
     subject=new Function('initial','endCompare','onManualEdit','store','apply','render',`let settings={...initial};const dirty=new Map();function outcome(result){settings={...result.state.settings};} ${patchSource};return {patch,get settings(){return settings;}};`)(store.read().settings,()=>order.push('end-compare'),ownership.onManualEdit,{patch(key,value){order.push('save');assert.equal(director.config.mode,'manual');assert.equal(ownership.getManualScene(),visible);return store.patch(key,value);}},()=>{},()=>{});
     subject.patch('exposure',1.35);assert.deepEqual(order,['end-compare','bypass','save']);assert.equal(store.read().settings.exposure,1.35);director.tick(now+=250);assert.equal(visualState.model,visible);assert.equal(director.live.scene,visible);assert.equal(director.live.settings.exposure,1.35);
   }finally{director.dispose();}
 }}finally{globalThis.window=priorWindow;}
});

const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const baseline=JSON.parse(readFileSync(resolve(root,'docs/design/2026-09-12-aether-lab/original-manifest.json'),'utf8'));
check(`original ${baseline.length} files match pre-copy SHA256 manifest`,()=>{
 for(const row of baseline)assert.equal(sha(resolve(original,row.file)),row.sha256,row.file);
 const current=[];function visit(directory,prefix=''){for(const item of readdirSync(directory,{withFileTypes:true})){const name=prefix+item.name;if(item.isDirectory())visit(resolve(directory,item.name),name+'/');else if(item.isFile())current.push(name);else assert.fail(`Unexpected non-file entry: ${name}`);}}visit(original);
 assert.deepEqual(current.sort(),baseline.map(row=>row.file.replaceAll('\\','/')).sort(),'Original file set changed after copying');
});
check('both accepted trees retain their exact complete file sets and source hashes',()=>{
 const accepted=JSON.parse(readFileSync(resolve(root,'docs/design/2026-09-12-beyond-living/accepted-manifests.json'),'utf8'));
 for(const[key,directory]of [['original','website_html_templates'],['accepted','website_html_templates_lab']]){
   const baseline=accepted[key];assert.ok(Array.isArray(baseline),`Unknown accepted manifest key ${key}; inspect it before changing the test`);
   const current=[];function visit(folder,prefix=''){for(const item of readdirSync(folder,{withFileTypes:true})){const name=prefix+item.name;if(item.isDirectory())visit(resolve(folder,item.name),name+'/');else if(item.isFile())current.push(name);else assert.fail(`Unexpected non-file entry: ${directory}/${name}`);}}visit(resolve(root,directory));
   assert.deepEqual(current.sort(),baseline.map(row=>row.file.replaceAll('\\','/')).sort(),directory+' file set changed');for(const row of baseline)assert.equal(sha(resolve(root,directory,row.file)),row.sha256,directory+'/'+row.file);
 }
});
const preserved=['player-three-aurora.js','player-three-orbital.js','player-three-liquid.js','player-three-audio.js','player-three-features.js','player-three-motion.js','player-three-worlds.js'];
check('accepted alternative assets, audio DSP, features, motion and palettes are byte-identical',()=>{for(const file of preserved)assert.equal(sha(resolve(lab,file)),sha(resolve(original,file)),file);});
check('new copied runtime stores have no original namespace literals',()=>{
 for(const name of readdirSync(lab).filter(name=>name.endsWith('.js'))){const source=readFileSync(resolve(lab,name),'utf8');assert.equal(/['"`]pmp\.(?!beyond\.)/.test(source),false,name);assert.equal(/['"]pmp-local-audio['"]/.test(source),false,name);}
});
check('independent port and launch routes remain configured',()=>{
 for(const name of ['START-PLAYER.cmd','START.cmd','server.mjs','player-launch.html']){const source=readFileSync(resolve(lab,name),'utf8');assert.ok(source.includes('4176'),name);assert.equal(source.includes('4173'),false,name);}
 for(const name of ['START-PLAYER.cmd','START.cmd'])assert.match(readFileSync(resolve(lab,name),'utf8'),/set "PORT=4176"/);
});
check('lab entry identity and local import map remain independent',()=>{
 const source=readFileSync(resolve(lab,'player-three.html'),'utf8');assert.match(source,/data-pmp-edition="beyond-living"/);assert.match(source,/"three":"\.\/vendor\/three\/build\/three.module.js"/);assert.equal(/\.\.\/website_html_templates\//.test(source),false);
});
console.log(JSON.stringify({at:new Date().toISOString(),passed:checks.length,checks,limits:'Production stores and coordinator, focused unchanged UI/main function fragments, source and immutability checks. DOM-heavy coordinator controls are an explicit boundary. Actual UI interaction, GPU rendering and audible playback verification belongs to parent browser QA.'},null,2));
