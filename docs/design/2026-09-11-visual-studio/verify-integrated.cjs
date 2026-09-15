const fs=require('fs'),crypto=require('crypto'),{spawnSync}=require('child_process');
const root='docs/design/2026-09-11-visual-studio/',checks=[];
for(const [name,script,args=[]] of [
 ['settings',root+'settings-check.mjs',[process.cwd()+'/website_html_templates/player-three-visual-settings.js']],
 ['organic',root+'organic-check.mjs'],['prism',root+'prism-check.mjs'],['host',root+'host-check.mjs'],['review',root+'review-checks.mjs'],
 ['collection','docs/design/2026-09-11-player-frontier/check-collection.mjs'],
 ['room-store','docs/design/2026-09-11-player-repair/check-room-store.mjs'],['main-persistence','docs/design/2026-09-11-player-repair/check-integration.cjs']
]){const result=spawnSync(process.execPath,[script,...args],{encoding:'utf8'});fs.writeFileSync(root+name+'-result.json',result.stdout||result.stderr);if(result.status!==0)throw Error(name+': '+result.stderr+'\n'+result.stdout);checks.push(name);}
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const copies=[['player-three-asset-aurora.js','player-three-aurora.js'],['player-three-asset-orbital.js','player-three-orbital.js'],['player-three-asset-liquid.js','player-three-liquid.js'],['player-three-visual-settings.js','player-three-visual-settings.js']];
for(const [a,b]of copies)if(hash(root+a)!==hash('website_html_templates/'+b))throw Error('Integrated copy differs: '+b);
const production=fs.readdirSync('website_html_templates').filter(p=>p.startsWith('player-three')&&p.endsWith('.js'));
for(const p of production){const r=spawnSync(process.execPath,['--check','website_html_templates/'+p],{encoding:'utf8'});if(r.status!==0)throw Error(p+': '+r.stderr);}
const result={at:new Date().toISOString(),passedSuites:checks,exactCopies:copies.map(([a,b])=>({file:b,sha256:hash('website_html_templates/'+b)})),syntax:production.length,scope:'Integrated source/runtime/storage checks; real GPU/UI observations recorded separately.'};fs.writeFileSync(root+'integrated-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
