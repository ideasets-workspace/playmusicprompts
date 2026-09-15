const fs=require('fs'),dir='website_html_templates_lab/';
for(const name of fs.readdirSync(dir)){
 if(!/\.(js|mjs|html|md|cmd)$/.test(name))continue;
 let s=fs.readFileSync(dir+name,'utf8');
 s=s.replaceAll('4173','4175').replaceAll('pmp-local-audio','pmp-lab-local-audio').replaceAll('pmp.','pmp.lab.');
 if(name.endsWith('.cmd'))s=s.replace('setlocal','setlocal\r\nset "PORT=4175"');
 if(name==='player-three.html')s=s.replace('<html lang="en">','<html lang="en" data-pmp-edition="aether-lab">').replace('<title>Immersive Player — PlayMusicPrompts</title>','<title>Aether Lab — PlayMusicPrompts</title>');
 if(name==='server.mjs')s=s.replace("'X-Content-Type-Options':'nosniff'","'X-Content-Type-Options':'nosniff','X-PMP-Edition':'aether-lab'");
 fs.writeFileSync(dir+name,s);
}
fs.writeFileSync(dir+'AGENTS.md','# Aether Lab\n\nThis is an independent experimental copy, served on127.0.0.1:4175. Modify only thiscopy forlabwork. The sibling website_html_templates/** and port4173 are explicitly protected by Berk. Do not link modules, assets or browser storage back tooriginal. Read parent .cursor/rules/00-berk-rank0-law.mdc and lane memory/lanes/three-lab-20260912/CURRENT.json. Quality before speed; actual rendered verification required.\n');
console.log('Independent namespace, database, port, entry and identity applied in copy only.');
