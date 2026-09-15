import http from 'node:http';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {resolve,extname,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const root=dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.wav':'audio/wav','.mp3':'audio/mpeg'};
const pngSignature=Buffer.from([137,80,78,71,13,10,26,10]);
const pngCRCTable=Uint32Array.from({length:256},(_,index)=>{let value=index;for(let bit=0;bit<8;bit++)value=value&1?0xedb88320^(value>>>1):value>>>1;return value>>>0;});
function pngCRC(bytes,start,end){let value=0xffffffff;for(let index=start;index<end;index++)value=pngCRCTable[(value^bytes[index])&255]^(value>>>8);return(value^0xffffffff)>>>0;}
// Validate bounded PNG structure from the canvas encoder. This does not decode IDAT pixels.
function inspectCapturePNG(png){
  if(png.length<57||!png.subarray(0,8).equals(pngSignature))return null;
  let offset=8,chunks=0,width=0,height=0,sawHeader=false,sawPalette=false,sawData=false,dataEnded=false,dataBytes=0;
  while(offset+12<=png.length){
    if(++chunks>65536)return null;
    const length=png.readUInt32BE(offset);
    if(length>png.length-offset-12)return null;
    const kind=png.toString('latin1',offset+4,offset+8),dataStart=offset+8,end=dataStart+length;
    if(!/^[A-Za-z]{2}[A-Z][A-Za-z]$/.test(kind)||pngCRC(png,offset+4,end)!==png.readUInt32BE(end))return null;
    if(!sawHeader&&kind!=='IHDR')return null;
    if(kind==='IHDR'){
      if(sawHeader||length!==13)return null;
      width=png.readUInt32BE(dataStart);height=png.readUInt32BE(dataStart+4);
      if(!width||!height||width>16384||height>16384||width*height>64*1024*1024)return null;
      // Browser canvas RGB/RGBA, eight-bit channels; compression/filter methods are fixed by PNG.
      if(png[dataStart+8]!==8||![2,6].includes(png[dataStart+9])||png[dataStart+10]!==0||png[dataStart+11]!==0||png[dataStart+12]>1)return null;
      sawHeader=true;
    }else if(kind==='PLTE'){
      if(sawPalette||sawData||!length||length>768||length%3)return null;
      sawPalette=true;
    }else if(kind==='IDAT'){
      if(dataEnded)return null;
      sawData=true;dataBytes+=length;
    }else if(kind==='IEND'){
      return length===0&&sawData&&dataBytes>0&&end+4===png.length?{width,height}:null;
    }else{
      if(kind[0]===kind[0].toUpperCase())return null;
      if(sawData)dataEnded=true;
    }
    offset=end+4;
  }
  return null;
}
const server=http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/captures'){
    const expected=`http://127.0.0.1:${server.address().port}`;
    if(req.method!=='POST'||req.headers.origin!==expected||req.headers['content-type']!=='image/png'){res.writeHead(403);res.end('Capture requires this local player.');return;}
    const chunks=[];let length=0;for await(const chunk of req){length+=chunk.length;if(length>24*1024*1024){res.writeHead(413);res.end('Image is too large.');return;}chunks.push(chunk);}
    const png=Buffer.concat(chunks),dimensions=inspectCapturePNG(png);if(!dimensions){res.writeHead(415);res.end('A complete canvas PNG image is required.');return;}
    const world=['tidal','monolith','aether','record','aurora','orbital','liquid'].includes(url.searchParams.get('world'))?url.searchParams.get('world'):'world';
    const name=`beyond-${world}-${new Date().toISOString().replace(/[:.]/g,'-')}-${randomUUID().slice(0,8)}.png`;
    await mkdir(resolve(root,'captures'),{recursive:true});await writeFile(resolve(root,'captures',name),png,{flag:'wx'});
    res.writeHead(201,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify({url:'/captures/'+name,name,...dimensions}));return;
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end('Method not allowed');return;}
  const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!path.startsWith(root+sep)||path.includes(sep+'scripts'+sep)||path.includes(sep+'verification'+sep)){res.writeHead(403);res.end('Forbidden');return;}const info=await stat(path);if(!info.isFile())throw Error();const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','X-PMP-Edition':'beyond-living'});res.end(req.method==='HEAD'?undefined:data);
}catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}});
server.listen(Number(process.env.PORT)||4176,'127.0.0.1',()=>{
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
