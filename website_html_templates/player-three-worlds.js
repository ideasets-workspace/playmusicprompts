export const WORLDS = [
 {id:'night',name:'Nightfall',line:'Violet skies. Open roads.',mood:'Electric · Nocturnal',image:'assets/stations.png',column:0,row:0,rows:1,accent:'#b598ff',light:0xb56aff,rim:0x58cced,tint:0xa79cc1,weather:'stars'},
 {id:'deep',name:'Deep water',line:'Let the world fall away.',mood:'Weightless · Immersive',image:'assets/stations.png',column:1,row:0,rows:1,accent:'#72d7e5',light:0x44c3d8,rim:0x93a7ff,tint:0x9ac8dc,weather:'float'},
 {id:'glow',name:'Afterglow',line:'Stay a little longer.',mood:'Warm · Unhurried',image:'assets/stations.png',column:2,row:0,rows:1,accent:'#efabc7',light:0xf49cbd,rim:0xffc485,tint:0xd5a4b3,weather:'float'},
 {id:'aurora',name:'Aurora',line:'Follow the northern lights.',mood:'Vast · Luminous',image:'assets/worlds-six-atlas.png',column:0,row:0,rows:2,accent:'#7fe3ba',light:0x4ae1a3,rim:0x74bce8,tint:0xb3e5cf,weather:'stars'},
 {id:'rain',name:'Rainroom',line:'Every street has a rhythm.',mood:'Neon · Reflective',image:'assets/worlds-six-atlas.png',column:1,row:0,rows:2,accent:'#efaace',light:0xde64b4,rim:0x68c9f5,tint:0xdac3e5,weather:'rain'},
 {id:'desert',name:'Desert bloom',line:'Let the horizon unfold.',mood:'Earthy · Expansive',image:'assets/worlds-six-atlas.png',column:2,row:0,rows:2,accent:'#edba8e',light:0xf6a26a,rim:0x799ade,tint:0xe9c9ad,weather:'float'},
 {id:'lunar',name:'Lunar tide',line:'Somewhere beyond the noise.',mood:'Silver · Still',image:'assets/worlds-six-atlas.png',column:0,row:1,rows:2,accent:'#b4cbee',light:0x9dbbec,rim:0x74c4dd,tint:0xc7d6ed,weather:'stars'},
 {id:'ember',name:'Ember',line:'Feel the fire beneath.',mood:'Elemental · Intense',image:'assets/worlds-six-atlas.png',column:1,row:1,rows:2,accent:'#efa184',light:0xf47645,rim:0xc4739a,tint:0xefb9a4,weather:'ember'},
 {id:'cloud',name:'Cloud nine',line:'Nothing holding you down.',mood:'Dreamlike · Open',image:'assets/worlds-six-atlas.png',column:2,row:1,rows:2,accent:'#e6b5e4',light:0xe79ccf,rim:0x9fa9f1,tint:0xeccadf,weather:'float'}
];
export const getWorld=id=>WORLDS.find(w=>w.id===id)||WORLDS[0];
export const worldStyle=id=>{const w=getWorld(id);return `background-image:url('${w.image}');background-size:300% ${w.rows*100}%;background-position:${w.column*50}% ${w.rows===1?50:w.row*100}%`;};
export const colorRGB=hex=>[1,3,5].map(start=>parseInt(hex.slice(start,start+2),16)).join(',');
