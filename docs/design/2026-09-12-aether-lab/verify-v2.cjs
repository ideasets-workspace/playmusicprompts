const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto'),path=require('node:path');
const dir='docs/design/2026-09-12-aether-lab/',site='website_html_templates_lab/';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const results=[];for(const [test,asset]of [['particle','aether'],['atmosphere','aether-atmosphere'],['tidal','tidal'],['monolith','monolith'],['host',null],['lab-controls',null]]){
 const args=[dir+test+'-check.mjs',...(asset?[path.resolve(site+'lab-'+asset+'.js')]:[])];
 const result=cp.spawnSync(process.execPath,args,{encoding:'utf8'});results.push({test,exitCode:result.status,output:result.stdout,errors:result.stderr});if(result.status!==0){fs.writeFileSync(dir+'integrated-results.json',JSON.stringify(results,null,2));throw Error('Failed '+test);}
}
for(const file of fs.readdirSync(site).filter(x=>x.endsWith('.js')||x.endsWith('.mjs'))){const r=cp.spawnSync(process.execPath,['--check',site+file],{encoding:'utf8'});if(r.status!==0)throw Error('Syntax '+file+' '+r.stderr);}
const original=JSON.parse(fs.readFileSync(dir+'original-manifest.json'));const current=fs.readdirSync('website_html_templates',{recursive:true}).filter(x=>fs.statSync(path.join('website_html_templates',x)).isFile());if(current.length!==original.length)throw Error('Original file set changed');for(const f of original)if(hash(path.join('website_html_templates',f.file))!==f.sha256)throw Error('Original changed '+f.file);
const manifest=fs.readdirSync(site).filter(x=>/\.(js|mjs|css|html|cmd|md)$/.test(x)).map(file=>({file,sha256:hash(site+file)}));
fs.writeFileSync(dir+'integrated-results.json',JSON.stringify({at:new Date().toISOString(),results,syntax:'all copied top-level JavaScript passed',originalFiles:original.length,originalUnchanged:true,manifest},null,2));console.log(JSON.stringify({suites:results.length,originalUnchanged:original.length,syntax:'passed'}));
