export const AETHER_KEY='pmp.lab.aether.v1';
export const AETHER_FORMS=Object.freeze([
 {id:'silk',name:'Silk',line:'Light, woven into motion.',path:'M2 17C8-6 16 30 22 7M2 12C9-11 15 35 22 12M2 7C8-16 16 40 22 17'},
 {id:'nova',name:'Supernova',line:'A universe unfolding.',path:'M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M5 19l3-3m8-8 3-3M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0'},
 {id:'helix',name:'Helix',line:'Follow the living current.',path:'M7 2c16 7-6 13 10 20M17 2C1 9 23 15 7 22M8 5h8M7 19h10M8 12h8'}
]);
export const AETHER_SCHEMA=Object.freeze({
 flow:{label:'Flow',min:0,max:2,step:.01,value:1,help:'The pace of movement through this world.'},
 spread:{label:'Expansion',min:.6,max:1.5,step:.01,value:1,help:'Open the space or gather its movement closer.'},
 turbulence:{label:'Turbulence',min:0,max:1.5,step:.01,value:.6,help:'From ordered movement to restless surfaces.'},
 glow:{label:'Radiance',min:.2,max:1.8,step:.01,value:1,help:'The brightness carried by the light.'},
 depth:{label:'Atmosphere',min:0,max:1,step:.01,value:.65,help:'The depth and density of the atmosphere.'},
 focus:{label:'Light focus',min:0,max:1,step:.01,value:.45,help:'Gather light around the heart of the scene.'}
});
export const AETHER_DEFAULTS=Object.freeze({form:'silk',...Object.fromEntries(Object.entries(AETHER_SCHEMA).map(([k,s])=>[k,s.value])),journey:false});
const has=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
export function sanitizeAether(value){
 const source=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
 const input=Object.fromEntries(Object.keys(AETHER_DEFAULTS).map(k=>[k,Object.getOwnPropertyDescriptor(source,k)?.value]));
 const result={...AETHER_DEFAULTS};
 if(AETHER_FORMS.some(f=>f.id===input.form))result.form=input.form;
 for(const [k,s]of Object.entries(AETHER_SCHEMA))if(typeof input[k]==='number'&&Number.isFinite(input[k]))result[k]=Math.max(s.min,Math.min(s.max,input[k]));
 result.journey=input.journey===true;return result;
}
export function createAetherStore(storage){
 let transient={};
 const read=()=>{let saved={};try{saved=storage.get(AETHER_KEY,{})||{};}catch{}return sanitizeAether({...saved,...transient});};
 return {read,patch(patch){
  if(!patch||typeof patch!=='object'||Array.isArray(patch)||Object.keys(patch).some(k=>!has(AETHER_DEFAULTS,k)||k==='form'&&!AETHER_FORMS.some(f=>f.id===patch[k])||k==='journey'&&typeof patch[k]!=='boolean'||has(AETHER_SCHEMA,k)&&(typeof patch[k]!=='number'||!Number.isFinite(patch[k]))))return {ok:false,settings:read(),error:'Choose a valid world setting.'};
  const settings=sanitizeAether({...read(),...patch});let ok=false;try{ok=storage.set(AETHER_KEY,settings)===true;}catch{}
  if(ok)transient={};else for(const key of Object.keys(patch))transient[key]=settings[key];
  return {ok,settings,...(!ok?{error:'Your world is live for this visit. These changes could not be saved.'}:{})};
 }};
}
