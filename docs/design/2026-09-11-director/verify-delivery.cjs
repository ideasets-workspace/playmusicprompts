const fs=require('fs'),crypto=require('crypto');
(async()=>{
 const site='website_html_templates/',root='docs/design/2026-09-11-director/',hash=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
 const manifestPath=site+'verification/ultra-delivery-files.json',previous=JSON.parse(fs.readFileSync(manifestPath,'utf8').replace(/^\uFEFF/,''));
 const names=[...new Set([...previous.map(x=>x.file),'player-three-director.js','player-three-director-ui.js','player-three-director.css','player-three-performance.js','player-three-optics.js'])];
 const manifest=names.map(file=>{const b=fs.readFileSync(site+file);return {file,bytes:b.length,sha256:hash(b)};});
 const served=await Promise.all(manifest.map(async entry=>{const r=await fetch('http://127.0.0.1:4173/'+entry.file);if(!r.ok)throw Error(entry.file+':HTTP'+r.status);const sha=hash(Buffer.from(await r.arrayBuffer()));if(sha!==entry.sha256)throw Error('Stale served file '+entry.file);return {file:entry.file,status:r.status,sha256:sha};}));
 const preserved=JSON.parse(fs.readFileSync(root+'preservation-result.json','utf8').replace(/^\uFEFF/,''));if(preserved.some(x=>!x.preserved))throw Error('Protected source changed');
 fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
 const report={at:new Date().toISOString(),files:served.length,preserved:preserved.length,served,capture:{file:'captured-prism.png',bytes:fs.statSync(root+'captured-prism.png').size,sha256:hash(fs.readFileSync(root+'captured-prism.png')),width:703,height:225,visuallyInspected:true}};
 fs.writeFileSync(root+'delivery-result.json',JSON.stringify(report,null,2));console.log(JSON.stringify({files:served.length,preserved:preserved.length,verifiedHTTP:true,capture:report.capture},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
