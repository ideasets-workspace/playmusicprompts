import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import crypto from 'node:crypto';

const disposable=process.argv.includes('--spawn-server');
const port=Number(process.env.CAPTURE_TEST_PORT)||(disposable?4187:4175);
assert(Number.isInteger(port)&&port>0&&port<65536);
if(disposable)assert(![4173,4175].includes(port),'A disposable test must never own a live player port');
const root='http://127.0.0.1:'+port,folder=new URL('../../../website_html_templates_lab/captures/',import.meta.url);
const serverFile=new URL('../../../website_html_templates_lab/server.mjs',import.meta.url),checks=[];
let child;
try{
  if(disposable){
    child=spawn(process.execPath,[fileURLToPath(serverFile)],{env:{...process.env,PORT:String(port)},windowsHide:true,stdio:['ignore','pipe','pipe']});
    await new Promise((resolve,reject)=>{
      let output='',errors='';const timer=setTimeout(()=>reject(Error('Disposable capture server did not start')),10000);
      child.stderr.on('data',chunk=>{errors+=chunk;});
      child.stdout.on('data',chunk=>{output+=chunk;if(output.includes(root)){clearTimeout(timer);resolve();}});
      child.once('error',error=>{clearTimeout(timer);reject(error);});
      child.once('exit',code=>{clearTimeout(timer);reject(Error('Disposable server exited '+code+': '+errors));});
    });
  }
  const before=(await readdir(folder)).sort(),file=before.find(name=>name.startsWith('beyond-tidal-'));
  assert(file,'An actual browser-captured Tidal PNG is required');
  const bytes=await readFile(new URL(file,folder)),source=await readFile(serverFile,'utf8');
  const headers={'Origin':root,'Content-Type':'image/png'};
  async function reject(name,body,status=415,customHeaders=headers,method='POST'){
    const response=await fetch(root+'/api/captures',{method,headers:customHeaders,...(method==='POST'?{body}:{})});
    assert.equal(response.status,status,name);await response.arrayBuffer();checks.push(name+' rejected');
  }
  await reject('foreign origin','x',403,{'Origin':'https://example.invalid','Content-Type':'image/png'});
  await reject('no origin','x',403,{'Content-Type':'image/png'});
  await reject('wrong content type','x',403,{'Origin':root,'Content-Type':'text/plain'});
  await reject('invalid PNG','x');
  await reject('oversized body',new Uint8Array(24*1024*1024+1),413);
  await reject('read cannot create capture',null,403,{},'GET');

  // Independent bit-by-bit CRC implementation for fixtures; production uses a table.
  function crc(payload){let value=0xffffffff;for(const byte of payload){value^=byte;for(let bit=0;bit<8;bit++)value=value&1?0xedb88320^(value>>>1):value>>>1;}return(value^0xffffffff)>>>0;}
  function chunk(kind,data=Buffer.alloc(0)){
    const type=Buffer.from(kind,'latin1'),result=Buffer.alloc(data.length+12);result.writeUInt32BE(data.length,0);type.copy(result,4);data.copy(result,8);result.writeUInt32BE(crc(Buffer.concat([type,data])),result.length-4);return result;
  }
  const signature=bytes.subarray(0,8),chunks=[];
  for(let offset=8;offset<bytes.length;){const size=bytes.readUInt32BE(offset)+12;chunks.push(bytes.subarray(offset,offset+size));offset+=size;}
  const type=value=>value.toString('ascii',4,8),header=Buffer.from(chunks[0].subarray(8,21)),data=chunks.filter(value=>type(value)==='IDAT'),end=chunk('IEND');
  assert.equal(type(chunks[0]),'IHDR');assert(data.length>0);
  const png=parts=>Buffer.concat([signature,...parts]);
  const changeHeader=change=>{const changed=Buffer.from(header);change(changed);return png([chunk('IHDR',changed),...data,end]);};
  await reject('signature-bearing 24-byte truncation',bytes.subarray(0,24));
  await reject('truncated final CRC',bytes.subarray(0,-1));
  await reject('zero width with valid CRC',changeHeader(value=>value.writeUInt32BE(0,0)));
  await reject('excessive dimensions with valid CRC',changeHeader(value=>value.writeUInt32BE(16385,0)));
  await reject('excessive pixel area with valid CRC',changeHeader(value=>{value.writeUInt32BE(16384,0);value.writeUInt32BE(16384,4);}));
  for(const[index,value,name]of [[8,3,'unsupported bit depth'],[9,5,'illegal color type'],[10,1,'invalid compression method'],[11,1,'invalid filter method'],[12,2,'invalid interlace method']])await reject(name+' with valid CRC',changeHeader(header=>{header[index]=value;}));
  const badHeaderCRC=Buffer.from(bytes);badHeaderCRC[32]^=1;await reject('corrupt IHDR CRC',badHeaderCRC);
  const badDataCRC=Buffer.from(data[0]);badDataCRC[badDataCRC.length-1]^=1;await reject('corrupt IDAT CRC',png([chunks[0],badDataCRC,...data.slice(1),end]));
  const tooLong=Buffer.from(data[0]);tooLong.writeUInt32BE(0x7fffffff,0);await reject('out-of-bounds chunk length',png([chunks[0],tooLong,end]));
  await reject('IHDR not first',png([data[0],chunks[0],...data.slice(1),end]));
  await reject('duplicate IHDR',png([chunks[0],chunks[0],...data,end]));
  await reject('wrong IHDR length',png([chunk('IHDR',header.subarray(0,12)),...data,end]));
  await reject('missing IDAT',png([chunks[0],end]));
  await reject('empty image-data stream',png([chunks[0],chunk('IDAT'),end]));
  await reject('unterminated PNG',png(chunks.filter(value=>type(value)!=='IEND')));
  await reject('IEND carries payload',png([chunks[0],...data,chunk('IEND',Buffer.from([0]))]));
  await reject('bytes after terminal IEND',Buffer.concat([bytes,Buffer.from([0])]));
  await reject('non-contiguous IDAT chunks',png([chunks[0],data[0],chunk('tEXt',Buffer.from('note\0boundary')),...data.slice(1),chunk('IDAT'),end]));
  await reject('unknown critical chunk',png([chunks[0],chunk('ABCD'),...data,end]));
  await reject('invalid reserved chunk-type bit',png([chunks[0],chunk('abcd'),...data,end]));
  await reject('high-bit chunk-type character',png([chunks[0],chunk('\u00e1BCD'),...data,end]));
  await reject('invalid palette length',png([chunks[0],chunk('PLTE',Buffer.from([1,2])),...data,end]));
  await reject('palette after image data',png([chunks[0],...data,chunk('PLTE',Buffer.from([1,2,3])),end]));
  assert.deepEqual((await readdir(folder)).sort(),before);checks.push('rejected requests create no files');

  // Execute the unchanged production validator for the actual saved image without creating another capture.
  const validation=source.slice(source.indexOf('const pngSignature='),source.indexOf('const server=http.createServer'));
  assert(validation.includes('function inspectCapturePNG('));
  const inspectPNG=new Function('Buffer',validation+';return inspectCapturePNG;')(Buffer);
  assert.deepEqual(inspectPNG(bytes),{width:1280,height:720});checks.push('production validator accepts the actual browser-captured PNG');
  const response=await fetch(root+'/captures/'+file),served=Buffer.from(await response.arrayBuffer());
  assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/png');assert.deepEqual(served,bytes);assert.equal(bytes.readUInt32BE(16),1280);assert.equal(bytes.readUInt32BE(20),720);checks.push('actual browser-captured 1280x720 PNG serves byte-identically');
  const result={at:new Date().toISOString(),root,disposable,checks,file,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),serverSHA256:crypto.createHash('sha256').update(source).digest('hex'),limits:'PNG chunk structure, supported canvas headers, dimensions, ordering and CRCs are validated. Compressed image data is not decoded. No new capture files are created by this test.'};
  await writeFile(new URL('capture-api-result.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify({passed:checks.length,root,disposable,serverSHA256:result.serverSHA256}));
}finally{
  if(child&&child.exitCode===null){const exited=new Promise(resolve=>child.once('exit',resolve));child.kill();await exited;}
}
