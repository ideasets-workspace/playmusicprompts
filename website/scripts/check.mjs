import {readdir,readFile} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve('.');let count=0;
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){if(['vendor','assets','node_modules','.state','.secrets','.secrets-owner'].includes(entry.name))continue;const p=join(dir,entry.name);if(entry.isDirectory())await walk(p);else if(/\.(mjs|js)$/.test(p)){const r=spawnSync(process.execPath,['--check',p],{encoding:'utf8',windowsHide:true});if(r.status!==0)throw Error(`${relative(root,p)}: ${r.stderr}`);count++;}}}
for(const dir of ['public','server','scripts','test'])await walk(join(root,dir));
for(const file of ['index.html','explore.html','library.html','login.html','account.html','radio.html','player-three.html']){const html=await readFile(join(root,'public',file),'utf8');if(!html.includes('app-entry.js'))throw Error(`Unconnected page ${file}`);if(/127\.0\.0\.1:(4173|4175|4176)/.test(html))throw Error(`Old preview dependency in ${file}`);}
console.log(`${count} JavaScript modules passed syntax checks; seven pages use the connected application entry.`);
