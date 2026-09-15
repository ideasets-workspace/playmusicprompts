import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {createMedia,validateCdnMappings,validateCdnDeliveryUrl,validateDeliveryUrl,isPublicMediaAddress,createCdnLookup} from '../server/media.mjs';
import {loadConfig} from '../server/config.mjs';

const bucket='test-owned-media',source=`gs://${bucket}/deliveries/masters/song.wav`;
const mappings=[{origin:'https://media.example.com',bucket,objectPrefix:'deliveries/',pathPrefix:'/audio/'}];
const url='https://media.example.com/audio/masters/song.wav';
const result={success:true,takes_requested:1,takes_delivered:1,tracks:[{take:1,kind:'delivered master',gcs_uri:source}]};
const lease={success:true,url,url_kind:'cdn_unsigned',url_expires_at:null,gcs_uri:source};
const errorCode=code=>error=>error.code===code;

async function fixture(t,overrides={}){
  const root=await mkdtemp(join(tmpdir(),'pmp-media-cdn-'));
  t.after(async()=>{assert.ok(resolve(root).startsWith(resolve(tmpdir())+sep+'pmp-media-cdn-'));await rm(root,{recursive:true,force:true});});
  let fetched=0,delivered=0,seen;
  const options={root,allowedBuckets:[bucket],mediaCdnMappings:mappings,ffmpegPath:join(root,'not-installed-ffmpeg.exe'),ffprobePath:join(root,'not-installed-ffprobe.exe'),
    delivery:async()=>{delivered++;return lease;},
    fetchImpl:async(value,init)=>{fetched++;seen={value,init};return new Response('downloaded-fixture-bytes');},...overrides};
  return {root,media:createMedia(options),counts:()=>({fetched,delivered}),seen:()=>seen};
}

test('CDN mapping requires exact approved origin/bucket/prefix and is disabled by default',()=>{
  assert.deepEqual(validateCdnMappings(undefined,[bucket]),[]);
  assert.throws(()=>validateCdnDeliveryUrl(url,source,[bucket]),errorCode('UNSAFE_DELIVERY'));
  const verified=validateCdnMappings(mappings,[bucket]);assert.ok(Object.isFrozen(verified));assert.ok(Object.isFrozen(verified[0]));
  assert.equal(validateCdnDeliveryUrl(url,source,[bucket],verified).href,url);
  assert.equal(validateCdnDeliveryUrl('https://media.example.com/audio/masters/%C5%9Fark%C4%B1.wav',`gs://${bucket}/deliveries/masters/şarkı.wav`,[bucket],verified).pathname,'/audio/masters/%C5%9Fark%C4%B1.wav');
  const two=[...mappings,{origin:'https://second.example.com',bucket,objectPrefix:'deliveries/',pathPrefix:'/'}];
  assert.equal(validateCdnDeliveryUrl('https://second.example.com/masters/song.wav',source,[bucket],two).hostname,'second.example.com');
});

test('operator mapping refuses ports, credentials, private/IP hosts and ambiguous prefix rewrites',()=>{
  for(const origin of ['http://media.example.com','https://media.example.com:443','https://media.example.com:8443','https://u:p@media.example.com','https://127.0.0.1','https://[::1]','https://2130706433','https://metadata.google.internal','https://x.localhost','https://x.home.arpa','https://media.example.com/','https://media.example.com/path','https://media.example.com?x=1','https://media.example.com#x','https://*.example.com'])
    assert.throws(()=>validateCdnMappings([{...mappings[0],origin}],[bucket]),TypeError,origin);
  for(const entry of [{...mappings[0],bucket:'unapproved'},{...mappings[0],objectPrefix:'../'},{...mappings[0],objectPrefix:'deliveries//'}, {...mappings[0],pathPrefix:'/audio/%2e%2e/'},{...mappings[0],pathPrefix:'/audio'},{...mappings[0],extra:'ignored?'}])assert.throws(()=>validateCdnMappings([entry],[bucket]),TypeError);
  assert.throws(()=>validateCdnMappings(Array.from({length:17},()=>mappings[0]),[bucket]),TypeError);
  assert.throws(()=>validateCdnMappings([...mappings,{...mappings[0],objectPrefix:'deliveries/masters/',pathPrefix:'/second/'}],[bucket]),TypeError);
  assert.throws(()=>validateCdnMappings([...mappings,{...mappings[0],bucket:'other-approved',objectPrefix:'elsewhere/',pathPrefix:'/audio/sub/'}],[bucket,'other-approved']),TypeError);
});

test('delivery cannot escape exact object mapping by aliases, query, traversal, encoding or downgrade',()=>{
  const variants=[url.replace('https:','http:'),url.replace('media.example.com','media.example.com.evil.test'),url.replace('media.example.com','127.0.0.1'),url.replace('https://','https://user:pass@'),url.replace('media.example.com','media.example.com:443'),url.replace('media.example.com','media.example.com:8443'),url.replace('song.wav','other.wav'),url+'?token=x',url+'?',url+'#',url+'#fragment',url.replace('/audio/','/private/../audio/'),url.replace('/audio/','/private/%2e%2e/audio/'),url.replace('/audio/masters/','/audio/masters%2f'),url.replace('/audio/','/audio//'),url.replace('song.wav','%73ong.wav'),url.replace('/audio/','\\audio/'),` ${url}`];
  for(const value of variants)assert.throws(()=>validateCdnDeliveryUrl(value,source,[bucket],mappings),errorCode('UNSAFE_DELIVERY'),value);
  for(const uri of [`gs://${bucket}/unmapped/song.wav`,`gs://${bucket}/deliveries/masters/%2e%2e/song.wav`,`gs://${bucket}/deliveries/masters//song.wav`])assert.throws(()=>validateCdnDeliveryUrl(url,uri,[bucket],mappings));
  assert.throws(()=>validateCdnDeliveryUrl(url,'gs://different-bucket/deliveries/masters/song.wav',[bucket],mappings),errorCode('INVALID_SOURCE'));
});

test('all private/special address families are refused and regular global IPv4/IPv6 remain eligible',()=>{
  for(const address of ['0.0.0.0','10.1.2.3','100.64.0.1','127.0.0.1','169.254.169.254','172.16.0.1','192.0.0.8','192.0.2.1','192.88.99.1','192.168.1.1','198.18.0.1','198.51.100.1','203.0.113.1','224.0.0.1','255.255.255.255','::','::1','::ffff:127.0.0.1','::ffff:8.8.8.8','64:ff9b::7f00:1','fc00::1','fe80::1','fe80::1%lo','ff00::1','2001::1','2001:db8::1','2002:7f00:1::','3fff::1','not-an-address'])assert.equal(isPublicMediaAddress(address),false,address);
  for(const address of ['8.8.8.8','1.1.1.1','93.184.216.34','2606:4700:4700::1111','2001:4860:4860::8888'])assert.equal(isPublicMediaAddress(address),true,address);
});

const lookupResult=(lookup,host='media.example.com',options={all:true})=>new Promise((accept,reject)=>lookup(host,options,(error,address,family)=>error?reject(error):accept(options.all?address:{address,family})));
test('connection lookup uses the same vetted DNS answer set and rejects mixed public/private answers',async()=>{
  const records=[{address:'1.1.1.1',family:4},{address:'2606:4700:4700::1111',family:6}];let calls=0;
  const lookup=createCdnLookup('media.example.com',async(host,options)=>{calls++;assert.equal(host,'media.example.com');assert.deepEqual(options,{all:true,verbatim:true});return records;});
  assert.deepEqual(await lookupResult(lookup),records);assert.equal(calls,1);
  assert.deepEqual(await lookupResult(lookup,'media.example.com',{family:6}),records[1]);
  await assert.rejects(lookupResult(lookup,'unapproved.example.com'),errorCode('UNSAFE_DELIVERY'));assert.equal(calls,2);
  for(const answers of [[],[{address:'127.0.0.1',family:4}], [...records,{address:'169.254.169.254',family:4}],[{address:'1.1.1.1',family:6}],Array.from({length:65},()=>records[0])]){
    const guarded=createCdnLookup('media.example.com',async()=>answers);await assert.rejects(lookupResult(guarded),errorCode('UNSAFE_DELIVERY'));
  }
  await assert.rejects(lookupResult(createCdnLookup('media.example.com',async()=>{throw Error('PRIVATE_DNS_ERROR');})),errorCode('DOWNLOAD_FAILED'));
});

test('download branch accepts exact mapped lease, sends no credentials, and reaches the real local tool boundary',async t=>{
  const f=await fixture(t);const out=await f.media.ingest('cdn-fixture-download',result);
  assert.deepEqual(f.counts(),{fetched:1,delivered:1});assert.equal(f.seen().value,url);assert.equal(f.seen().init.redirect,'manual');assert.ok(f.seen().init.dispatcher);
  assert.deepEqual(f.seen().init.headers,{'Accept-Encoding':'identity'});assert.equal(out.status,'failed');assert.equal(out.takes[0].errors[0].code,'MISSING_TOOLS');
  // Deliberately absent fixture executables prove only the download-to-probe
  // boundary. This test does not label the bytes as measured audio or ready.
  assert.equal(out.takes[0].master,null);assert.ok(!(await readdir(f.root,{recursive:true})).some(path=>path.endsWith('.part')||path.endsWith('audio.bin')));
});

test('undeclared/mislabeled/unconfigured CDN or expired permanent lease is never fetched',async t=>{
  for(const [name,overrides] of [
    ['unconfigured',{mediaCdnMappings:[]}],
    ['unknown-kind',{delivery:async()=>({...lease,url_kind:'private-proxy'})}],
    ['signed-label',{delivery:async()=>({...lease,url_kind:'v4_signed'})}],
    ['no-kind',{delivery:async()=>({...lease,url_kind:undefined})}],
    ['expiration',{delivery:async()=>({...lease,url_expires_at:'2026-09-20T00:00:00Z'})}],
    ['wrong-source',{delivery:async()=>({...lease,gcs_uri:`gs://${bucket}/deliveries/wrong.wav`})}],
    ['query',{delivery:async()=>({...lease,url:url+'?redirect=private'})}],
  ]){const f=await fixture(t,overrides);const out=await f.media.ingest('cdn-'+name,result);assert.equal(out.status,'failed');assert.equal(out.takes[0].errors[0].code,'UNSAFE_DELIVERY');assert.equal(f.counts().fetched,0);}
});

test('CDN redirect/auth failures are not followed or refreshed and bodies are cancelled',async t=>{
  for(const status of [301,302,307,308,401,403]){
    let calls=0,cancelled=false;
    const f=await fixture(t,{fetchImpl:async()=>{calls++;return new Response(new ReadableStream({cancel(){cancelled=true;}}),{status,headers:{location:'http://169.254.169.254/latest/meta-data/'}});}});
    const out=await f.media.ingest('cdn-status-'+status,result);assert.equal(out.status,'failed');assert.equal(out.takes[0].errors[0].code,'DOWNLOAD_FAILED');assert.equal(calls,1);assert.equal(f.counts().delivered,1);assert.equal(cancelled,true);
  }
});

test('actual Undici CDN connector rejects a private DNS answer before any network connection',async t=>{
  let lookups=0;
  const f=await fixture(t,{fetchImpl:globalThis.fetch,cdnLookupImpl:async()=>{lookups++;return[{address:'127.0.0.1',family:4}];}});
  const out=await f.media.ingest('cdn-private-dns',result);
  assert.equal(lookups,1);assert.equal(out.status,'failed');assert.equal(out.takes[0].errors[0].code,'UNSAFE_DELIVERY');assert.equal(out.takes[0].master,null);
});

test('CDN stream time and size limits apply before any publication',async t=>{
  const stalled=await fixture(t,{downloadTimeoutMs:20,fetchImpl:async(_,options)=>new Promise((accept,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}))});
  assert.equal((await stalled.media.ingest('cdn-stalled',result)).takes[0].errors[0].code,'DOWNLOAD_TIMEOUT');
  const large=await fixture(t,{maxBytes:8});assert.equal((await large.media.ingest('cdn-large',result)).takes[0].errors[0].code,'SOURCE_TOO_LARGE');
});

test('config carries only explicit mappings and preserves admission overrides',async t=>{
  const root=await mkdtemp(join(tmpdir(),'pmp-media-cdn-config-'));t.after(async()=>{assert.ok(resolve(root).startsWith(resolve(tmpdir())+sep+'pmp-media-cdn-config-'));await rm(root,{recursive:true,force:true});});
  const env={PMP_STATE_DIR:root};assert.deepEqual(loadConfig(env).mediaCdnMappings,[]);assert.equal(loadConfig(env).guestDailyLimit,1000);assert.equal(loadConfig({...env,PMP_GUEST_DAILY_LIMIT:'4'}).guestDailyLimit,4);
  const configured=[{...mappings[0],bucket:'playmusicprompts-content'}];
  assert.deepEqual(loadConfig({...env,PMP_MEDIA_CDN_MAPPINGS:JSON.stringify(configured)}).mediaCdnMappings,configured);
  assert.throws(()=>loadConfig({...env,PMP_MEDIA_CDN_MAPPINGS:'{'}));assert.throws(()=>loadConfig({...env,PMP_MEDIA_CDN_MAPPINGS:JSON.stringify(mappings)}));
});

test('signed Cloud Storage validation stays independent and cannot be downgraded through a CDN mapping',()=>{
  const signed=new URL(`https://storage.googleapis.com/${bucket}/deliveries/masters/song.wav`);
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  for(const [key,value] of Object.entries({'X-Goog-Algorithm':'GOOG4-RSA-SHA256','X-Goog-Credential':'fixture@example.invalid','X-Goog-Date':stamp,'X-Goog-Expires':'600','X-Goog-SignedHeaders':'host','X-Goog-Signature':'a'.repeat(512)}))signed.searchParams.set(key,value);
  assert.equal(validateDeliveryUrl(signed.href,source,[bucket]).href,signed.href);
  assert.throws(()=>validateDeliveryUrl(url,source,[bucket]),errorCode('UNSAFE_DELIVERY'));
  assert.throws(()=>validateCdnDeliveryUrl(signed.href,source,[bucket],mappings),errorCode('UNSAFE_DELIVERY'));
  signed.searchParams.delete('X-Goog-Signature');assert.throws(()=>validateDeliveryUrl(signed.href,source,[bucket]),errorCode('UNSAFE_DELIVERY'));
});
