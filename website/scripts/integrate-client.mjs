import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('public');
function edit(file,fn){const p=path.join(root,file),old=fs.readFileSync(p,'utf8'),next=fn(old);fs.writeFileSync(p,next);}
function replace(s,a,b){if(!s.includes(a))throw Error('Missing integration point: '+a.slice(0,100));return s.replace(a,b);}
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.js'))){edit(file,s=>s.replaceAll('pmp.beyond','pmp.website').replaceAll('pmp-beyond','pmp-website'));}
for(const file of ['index.html','explore.html','library.html','radio.html','login.html','player-three.html'])edit(file,s=>{
  s=s.replace(/<script\s+src="(?:config|data|schema|app|player|collections|controls|experience|player-three-entry)\.js"\s+defer><\/script>/g,'');
  return replace(s,'</head>','<link rel="stylesheet" href="platform-input.css"><link rel="stylesheet" href="advertising.css"><link rel="stylesheet" href="connected.css"><script src="app-entry.js" defer></script></head>');
});
edit('data.js',s=>s.replace(/songs:\[.*?\],stations:/,'songs:[],stations:'));
edit('app.js',s=>{
  s=replace(s,"saved:storage.get('saved',[]),playlists:storage.get('playlists',[])","saved:[],playlists:[]");
  return replace(s,"session:null","session:window.PMP_APP?.user||null");
});
edit('experience.js',s=>{
  s=s.replaceAll('Cancel creation','Stop waiting').replaceAll('Creation cancelled. Your description is still here.','You stopped waiting. Your creation continues; follow it in Creations.');
  s=replace(s,"e.name==='AbortError'?'You stopped waiting. Your creation continues; follow it in Creations.':'We couldn’t create your song. Try again.'","e.name==='AbortError'?'You stopped waiting. Your creation continues; follow it in Creations.':e.message||'We couldn’t create your song. Your brief is saved.'");
  return s;
});
edit('player.js',s=>{
  s=replace(s,'async function next(){','let advancing=false;\nasync function next(){if(advancing)return;advancing=true;try{if(state.queue.length&&state.current){const decision=await window.PMPAds?.beforeNext({audio,reason:audio.ended?\'ended\':\'next\'});if(decision&&!decision.allowNext){state.nextWaiting=true;return;}state.nextWaiting=false;}');
  s=replace(s,'}maybeContinue();}\nasync function previous()', '}maybeContinue();}finally{advancing=false;}}\nasync function previous()');
  s=replace(s,'const s=song(id);if(!s)return;closeDialog();','const s=song(id);if(!s)return;window.PMPAds?.cancel(\'track-selected\');closeDialog();');
  s=replace(s,"async function restore(){for(const s of storage.get('creations',[]))if(s.id&&s.url&&!song(s.id))state.songs.push(s);","async function restore(){");
  s=replace(s,'s.genre===st.genre','s.genre?.toLowerCase().includes(st.genre.toLowerCase())');
  return s;
});
edit('player-three.js',s=>{
  s=replace(s,"const saved=storage.get('pmp.website.saved',[]),isSaved=","const saved=window.PMP_APP?.saved||[],isSaved=");
  const favorite=s.match(/\$\('#favorite'\)\.onclick=\(\)=>\{[^\n]+/)[0];
  s=replace(s,favorite,"$('#favorite').onclick=()=>{if(current)window.PMP_APP?.toggleSave(current);};window.addEventListener('pmp:saved',syncFavorite);");
  s=replace(s,"...(window.PMP_CONFIG?.catalog||[]),...storage.get('pmp.website.creations',[])","...(window.PMP_CONFIG?.catalog||[])");
  s=replace(s,'async function togglePlay(options={}){','async function togglePlay(options={}){window.PMPAds?.userGesture(audio);if(window.PMPAds?.active){window.PMPAds.toggle();return;}');
  s=replace(s,'function goNext(automatic=false){','let advancing=false;\nasync function goNext(automatic=false){if(advancing)return;advancing=true;try{');
  s=replace(s,'if(target)select(target,{claim:!automatic});else{audio.pause();sync();}}','if(target){const decision=await window.PMPAds?.beforeNext({audio,reason:automatic?\'ended\':\'next\'});if(!decision||decision.allowNext)await select(target,{claim:!automatic});}else{audio.pause();sync();}}finally{advancing=false;}}');
  s=replace(s,'if(!track)return;const token=++selectToken;',"if(!track)return;window.PMPAds?.cancel('track-selected');const token=++selectToken;");
  s+=`\n// The same server-owned catalogue, advertisement boundary and TV contract as the main site.\nwindow.PMPAds?.configure({audio});\ndocument.addEventListener('click',()=>window.PMPAds?.userGesture(audio),{capture:true});\nwindow.PMPPlatform?.attach({getAudio:()=>audio,toggle:togglePlay,play:()=>{window.PMPAds?.userGesture(audio);if(window.PMPAds?.active)window.PMPAds.resume();else if(audio.paused)togglePlay();},pause:()=>window.PMPAds?.active?window.PMPAds.pause():audio.pause(),next:()=>goNext(),previous:()=>{window.PMPAds?.cancel('previous');previous();},seek:delta=>{if(!window.PMPAds?.active)seekTo(audio.currentTime+delta);},stop:()=>{window.PMPAds?.cancel('stop');audio.pause();seekTo(0);},back:()=>{if(currentPanel){closePanel();return true;}if(document.body.classList.contains('cinema')){cinema(false);return true;}return false;}});\nready.then(async()=>{const requested=new URLSearchParams(location.search).get('track');const match=available.find(t=>t.id===requested)||queue.find(t=>t.id===requested);if(match)await select(match,{play:false});});\n`;
  return s;
});
console.log('New application client integration points updated. Protected frontend trees untouched.');
