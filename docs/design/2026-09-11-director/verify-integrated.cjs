const fs=require('fs'),path=require('path'),crypto=require('crypto'),{spawnSync}=require('child_process');
const root='docs/design/2026-09-11-director/',site='website_html_templates/',studio='docs/design/2026-09-11-visual-studio/';
const results=[];
const suites=[
 ['director',root+'director-check.mjs'],['optics',root+'optics-check.mjs',[path.resolve(site+'player-three-optics.js')]],
 ['host',root+'host-check.mjs'],['coordinator',root+'coordinator-check.mjs'],
 ['ui',root+'ui-check.mjs',[path.resolve(site+'player-three-director-ui.js')]],['studio-review',root+'studio-review-checks.mjs'],
 ['settings',studio+'settings-check.mjs',[path.resolve(site+'player-three-visual-settings.js')]],
 ['organic',studio+'organic-check.mjs'],['prism',studio+'prism-check.mjs'],
 ['collection','docs/design/2026-09-11-player-frontier/check-collection.mjs'],
 ['room-store','docs/design/2026-09-11-player-repair/check-room-store.mjs'],
 ['main-persistence','docs/design/2026-09-11-player-repair/check-integration.cjs']
];
for(const [name,script,args=[]] of suites){
 const r=spawnSync(process.execPath,[script,...args],{encoding:'utf8'});
 fs.writeFileSync(root+name+'-result.json',r.stdout||r.stderr);
 results.push({name,pass:r.status===0});
 if(r.status!==0){console.error(name+' failed\n'+r.stderr+'\n'+r.stdout);process.exitCode=1;}
}
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const copies=['player-three-director.js','player-three-director-ui.js','player-three-optics.js'];
for(const name of copies)if(hash(root+name)!==hash(site+name))throw Error('Deliverable differs from checked module: '+name);
for(const [a,b]of [['player-three-asset-aurora.js','player-three-aurora.js'],['player-three-asset-orbital.js','player-three-orbital.js'],['player-three-asset-liquid.js','player-three-liquid.js'],['player-three-visual-settings.js','player-three-visual-settings.js']])if(hash(studio+a)!==hash(site+b))throw Error('Prior checked source differs: '+b);
const scripts=fs.readdirSync(site).filter(p=>p.startsWith('player-three')&&p.endsWith('.js'));
for(const name of scripts){const r=spawnSync(process.execPath,['--check',site+name],{encoding:'utf8'});if(r.status!==0)throw Error(name+': '+r.stderr);}
const report={at:new Date().toISOString(),suites:results,syntax:scripts.length,copies:copies.map(file=>({file,sha256:hash(site+file)})),scope:'Actual source/function/storage checks with documented host boundaries. GPU, audio UI and PNG acceptance are recorded separately.'};
fs.writeFileSync(root+'integrated-result.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
