import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const root=dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.wav':'audio/wav','.mp3':'audio/mpeg'};
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!path.startsWith(root+sep)||path.includes(sep+'scripts'+sep)||path.includes(sep+'verification'+sep)){res.writeHead(403);res.end('Forbidden');return;}const info=await stat(path);if(!info.isFile())throw Error();const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);}catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}});
server.listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>{
  const origin=`http://127.0.0.1:${server.address().port}`;
  console.log(`PlayMusicPrompts templates: ${origin}`);
  if(process.argv.includes('--open-player')){
    const url=`${origin}/player-three.html`;
    const command=process.platform==='win32'?'cmd.exe':process.platform==='darwin'?'open':'xdg-open';
    const args=process.platform==='win32'?['/d','/c','start','',url]:[url];
    const browser=spawn(command,args,{windowsHide:true,stdio:'ignore'});
    browser.on('error',()=>console.log(`Open your listening room: ${url}`));
    browser.unref();
  }
});
