import {createServer} from 'node:http';
import {readFile,stat,realpath} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {createSecurity,readJSON,exactKeys,playlistBody} from './security.mjs';
import {problem} from './store.mjs';
import {createIdentity} from './identity.mjs';
import {projectCapabilities,projectControlsSchema,validateRequest} from './validation.mjs';
import {createPreviews} from './previews.mjs';
import {createEnhancements} from './enhancements.mjs';
import {createListeningSessions} from './listening-sessions.mjs';
import {createInitialCreation} from './initial-creation.mjs';
import {publicFailure} from './jobs.mjs';
import {EngineError} from './engine.mjs';
import {CALLBACK_PATH,createCallbacks} from './callbacks.mjs';
import {createPlayerNavigation} from './player-navigation.mjs';
import {SIGNED_IN_DAILY_LIMIT} from './admission-limits.mjs';

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ico':'image/x-icon',
  // Discoverability files (robots.txt, sitemap.xml) live in public/ like every other static asset.
  '.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
const identifier=/^[a-zA-Z0-9_-]{8,120}$/;
function json(res,status,body){const data=JSON.stringify(body);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Content-Length':Buffer.byteLength(data)});res.end(data);}
export function parseRange(value,size){
  if(!value)return {start:0,end:size-1,partial:false};
  const match=/^bytes=(\d*)-(\d*)$/.exec(value);
  if(!match||(!match[1]&&!match[2]))throw problem(416,'INVALID_RANGE','Requested audio range is unavailable.');
  let start,end;
  if(!match[1]){const length=Number(match[2]);if(!Number.isSafeInteger(length)||length<=0)throw problem(416,'INVALID_RANGE','Requested audio range is unavailable.');start=Math.max(0,size-length);end=size-1;}
  else {start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),size-1):size-1;}
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start)throw problem(416,'INVALID_RANGE','Requested audio range is unavailable.');
  return {start,end,partial:true};
}

export function createApplication({config,store,engine,media,jobs,accounts=null,callbackVerifier,deliveryReady=async()=>{},deliveryStatus=async()=>({available:true})}){
  const security=createSecurity(config,store),identity=createIdentity(config,store);let cachedCaps,capPromise;
  async function capabilities(){if(cachedCaps&&cachedCaps.at>Date.now()-300000)return cachedCaps.raw;if(!capPromise)capPromise=engine.capabilities().then(raw=>{cachedCaps={raw,at:Date.now()};return raw;}).finally(()=>capPromise=null);return capPromise;}
  let cachedHealth,healthPromise;
  async function connection(){
    if(cachedHealth&&cachedHealth.checkedAt>Date.now()-30000)return cachedHealth;
    if(!healthPromise)healthPromise=engine.health().then(raw=>{
      if(typeof raw?.ok!=='boolean')throw problem(502,'HEALTH_INVALID','The music service returned an unreadable connection status.');
      cachedHealth={available:raw.ok===true,checkedAt:Date.now()};return cachedHealth;
    }).finally(()=>healthPromise=null);
    return healthPromise;
  }
  const previews=createPreviews({store,engine,capabilities,config});
  const enhancements=createEnhancements({store,engine,capabilities,config});
  const listening=createListeningSessions({store,jobs,capabilities,config,deliveryReady});
  const creations=createInitialCreation({store,capabilities,config,deliveryReady});
  const callbacks=createCallbacks({config,store,jobs,...(callbackVerifier?{verify:callbackVerifier}:{})});
  const navigation=createPlayerNavigation(store);
  async function serveAudio(req,res,id){
    if(!identifier.test(id)||!store.track(id))throw problem(404,'NOT_FOUND','Song not found.');
    const descriptor=await media.resolve(store.listeningId(id),'listening');
    if(!descriptor)throw problem(404,'NOT_FOUND','Listening audio is unavailable.');
    const info=await stat(descriptor.path);let range;
    try{range=parseRange(req.headers.range,info.size);}catch(e){res.setHeader('Content-Range',`bytes */${info.size}`);throw e;}
    res.writeHead(range.partial?206:200,{'Content-Type':descriptor.contentType||'audio/mpeg','Content-Length':range.end-range.start+1,'Accept-Ranges':'bytes',...(range.partial?{'Content-Range':`bytes ${range.start}-${range.end}/${info.size}`}:{}) ,'Cache-Control':'private, max-age=300','Content-Disposition':'inline','Cross-Origin-Resource-Policy':'same-origin'});
    if(req.method==='HEAD'){res.end();return;}const stream=createReadStream(descriptor.path,{start:range.start,end:range.end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  }
  async function route(req,res){
    security.headers(res);security.check(req);
    if(!['GET','HEAD','POST','PATCH','PUT','DELETE'].includes(req.method))throw problem(405,'METHOD_NOT_ALLOWED','This method is not supported.');
    const url=new URL(req.url,config.origin),path=url.pathname;
    if(path===CALLBACK_PATH){
      // A Google-authenticated server push cannot supply browser cookies or a
      // CSRF token. Only this exact configured receiver uses that separate
      // trust boundary; host/proxy checks and a bounded rate still apply.
      res.setHeader('Connection','close');
      if(!callbacks.enabled||url.href!==callbacks.audience)throw problem(404,'NOT_FOUND','This endpoint does not exist.');
      if(req.method!=='POST')throw problem(405,'METHOD_NOT_ALLOWED','Send a completion notification with POST.');
      const ipKey=security.ipKey(req);store.transaction(()=>store.consume(`callback:${ipKey}`,60,60000));
      json(res,202,await callbacks.receive(req));return;
    }
    if(path==='/healthz'&&req.method==='GET'){json(res,200,{ok:true,application:'PlayMusicPrompts',storage:'local-owned',version:'0.1.0'});return;}
    if(path==='/auth/callback'&&req.method==='GET'){
      const signed=await identity.callback(url,security.session(req,res));res.setHeader('Set-Cookie',security.cookie(signed.token,7*86400));res.writeHead(303,{Location:'/library.html','Cache-Control':'no-store'});res.end();return;
    }
    if(path.startsWith('/api/')){
      res.setHeader('Cache-Control','no-store');
      const session=security.session(req,res,path==='/api/session'&&req.method==='GET');
      if(!['GET','HEAD'].includes(req.method))security.mutate(req,session);
      const ipKey=security.ipKey(req);
      // All requests use the socket address. Unconfigured proxy headers never influence trust.
      store.transaction(()=>store.consume(`http:${ipKey}`,600,60000));
      if(path==='/api/session'&&req.method==='GET'){json(res,200,{user:store.user(session.user_id),csrf:session.csrf,authScope:createHash('sha256').update('pmp-auth-scope:'+session.owner).digest('hex'),config:{identity:{available:!!config.oidc||!!accounts,password:!!accounts,oidc:!!config.oidc,mail:!!accounts?.mailAvailable,emailVerificationRequired:!!accounts?.verificationRequired},ads:config.ads,consent:config.consent||{enabled:false},downloads:{available:false,reason:'Rewarded music downloads are awaiting publisher eligibility and a supported verification method.'},platforms:{web:true,tvHardwareVerified:false},generation:{guestAllowed:true}}});return;}
      if(path==='/api/capabilities'&&req.method==='GET'){json(res,200,projectCapabilities(await capabilities(),{webhookUrl:config.webhookUrl}));return;}
      if(path==='/api/connection'&&req.method==='GET'){const [engineState,delivery]=await Promise.all([connection(),deliveryStatus()]);json(res,200,{...engineState,delivery,generationAvailable:engineState.available&&delivery.available});return;}
      if(path==='/api/controls-schema'&&req.method==='GET'){json(res,200,projectControlsSchema(await capabilities(),{webhookUrl:config.webhookUrl}));return;}
      if(path==='/api/listening-sessions'){
        if(!session)throw problem(401,'SESSION_REQUIRED','Refresh the page to continue.');
        if(req.method==='GET'){json(res,200,{sessions:await listening.list(session.owner)});return;}
        if(req.method==='POST'){json(res,202,{session:await listening.start({owner:session.owner,ipKey,idem:req.headers['idempotency-key'],body:await readJSON(req)})});return;}
      }
      const listeningMatch=/^\/api\/listening-sessions\/([a-zA-Z0-9_-]+)(\/events)?$/.exec(path);
      if(listeningMatch){
        if(!session)throw problem(401,'SESSION_REQUIRED','Refresh the page to continue.');
        if(req.method==='GET'&&!listeningMatch[2]){json(res,200,{session:await listening.get(listeningMatch[1],session.owner)});return;}
        if(req.method==='POST'&&listeningMatch[2]){json(res,200,{session:await listening.event({id:listeningMatch[1],owner:session.owner,ipKey,body:await readJSON(req)})});return;}
      }
      if(path==='/api/enhancements'){
        if(!session)throw problem(401,'SESSION_REQUIRED','Refresh the page to continue.');
        if(req.method==='GET'){json(res,200,{operations:enhancements.list(session.owner)});return;}
        if(req.method==='POST'){
          const idem=req.headers['idempotency-key'];if(typeof idem!=='string'||!identifier.test(idem))throw problem(400,'IDEMPOTENCY_REQUIRED','A unique enhancement request ID is required.');
          const operation=await enhancements.admit({owner:session.owner,ipKey,idem,payload:await readJSON(req)});
          json(res,202,{operation});enhancements.wake();return;
        }
      }
      const enhancementMatch=/^\/api\/enhancements\/([a-zA-Z0-9_-]+)$/.exec(path);
      if(enhancementMatch&&req.method==='GET'){
        if(!session)throw problem(401,'SESSION_REQUIRED','Refresh the page to continue.');
        json(res,200,{operation:enhancements.get(enhancementMatch[1],session.owner)});return;
      }
      if(path==='/api/previews'&&req.method==='POST'){
        const idem=req.headers['idempotency-key'];if(typeof idem!=='string'||!identifier.test(idem))throw problem(400,'IDEMPOTENCY_REQUIRED','A unique preview request ID is required.');
        json(res,200,await previews.submit({owner:session.owner,ipKey,idem,payload:await readJSON(req)}));return;
      }
      if(path==='/api/catalog'&&req.method==='GET'){json(res,200,{tracks:store.catalog()});return;}
      if(['/api/player-navigation','/api/player-navigation/resolve','/api/song-links'].includes(path)&&req.method==='POST'){
        const body=await readJSON(req);const resolving=path.endsWith('/resolve');exactKeys(body,[resolving?'handle':'trackId']);
        json(res,200,resolving?navigation.resolve(session,body.handle):path==='/api/song-links'?navigation.share(session,body.trackId):navigation.open(session,body.trackId));return;
      }
      if(path==='/api/radio'&&req.method==='GET'){const all=store.catalog();const genre=url.searchParams.get('genre');const tracks=genre?all.filter(t=>t.genre.toLowerCase().includes(genre.toLowerCase())):all;json(res,200,{kind:'personalized-sequence',tracks,adBreaks:'between-tracks',synchronizedBroadcast:false});return;}
      if(path==='/api/auth/start'&&req.method==='POST'){await readJSON(req);store.transaction(()=>store.consume(`signin:${ipKey}`,10,60000));json(res,200,await identity.start(session));return;}
      if(path==='/api/auth/logout'&&req.method==='POST'){await readJSON(req);store.deleteSession(session);res.setHeader('Set-Cookie',security.cookie('',0));json(res,200,{ok:true});return;}
      // E-mail + password accounts (server/accounts.mjs). Every route below passed security.mutate (origin + CSRF).
      if(path.startsWith('/api/account/')&&req.method==='POST'){
        if(!accounts)throw problem(503,'IDENTITY_NOT_CONFIGURED','Account sign-in is not connected yet. You can still create and listen.');
        const body=await readJSON(req);const signedIn=session?.user_id||null;
        const setSession=signed=>{res.setHeader('Set-Cookie',security.cookie(signed.token,7*86400));return {user:signed.user,csrf:signed.row.csrf};};
        switch(path){
          case '/api/account/register':{exactKeys(body,['email','name','password']);const r=await accounts.register({...body,ipKey,session});json(res,201,{...setSession(r),emailVerified:false,emailVerificationRequired:r.emailVerificationRequired,mail:r.mail});return;}
          case '/api/account/sign-in':{exactKeys(body,['email','password']);const r=await accounts.signIn({...body,ipKey,session});json(res,200,{...setSession(r),emailVerified:r.emailVerified});return;}
          case '/api/account/verify-email':{exactKeys(body,['token']);json(res,200,accounts.verifyEmail(body));return;}
          case '/api/account/resend-verification':{exactKeys(body,[]);if(!signedIn)throw problem(401,'SESSION_REQUIRED','Sign in first.');json(res,200,await accounts.resendVerification({userId:signedIn}));return;}
          case '/api/account/request-reset':{exactKeys(body,['email']);json(res,202,await accounts.requestPasswordReset({...body,ipKey}));return;}
          case '/api/account/reset':{exactKeys(body,['token','password']);json(res,200,await accounts.resetPassword(body));return;}
          case '/api/account/change-password':{exactKeys(body,['currentPassword','password']);if(!signedIn)throw problem(401,'SESSION_REQUIRED','Sign in first.');const r=await accounts.changePassword({...body,userId:signedIn,session});json(res,200,{...setSession(r),changed:true});return;}
          case '/api/account/delete':{exactKeys(body,['password']);if(!signedIn)throw problem(401,'SESSION_REQUIRED','Sign in first.');const r=await accounts.deleteAccount({...body,userId:signedIn});res.setHeader('Set-Cookie',security.cookie('',0));json(res,200,r);return;}
          default:throw problem(404,'NOT_FOUND','This endpoint does not exist.');
        }
      }
      if(path==='/api/account'&&req.method==='GET'){if(!session?.user_id)throw problem(401,'SESSION_REQUIRED','Sign in first.');json(res,200,{user:store.user(session.user_id),...(accounts?accounts.profile(session.user_id):{passwordAccount:false})});return;}
      if(path==='/api/jobs'&&req.method==='GET'){if(!session)throw problem(401,'SESSION_REQUIRED','Refresh the page to continue.');json(res,200,{jobs:store.jobs(session.owner).map(j=>store.publicJob(j))});return;}
      if(path==='/api/creations'&&req.method==='POST'){
        const result=await creations.admit({owner:session.owner,ipKey,idem:req.headers['idempotency-key'],payload:await readJSON(req)});
        json(res,202,{job:store.publicJob(result.job),existing:result.existing});jobs.wake();return;
      }
      if(path==='/api/jobs'&&req.method==='POST'){
        const idem=req.headers['idempotency-key'];if(typeof idem!=='string'||!identifier.test(idem))throw problem(400,'IDEMPOTENCY_REQUIRED','A unique creation request ID is required.');
        const raw=await readJSON(req);
        if(raw.dry_run===true||raw.capabilities===true)throw problem(400,'CONTROL_MODE_UNSUPPORTED','Use the capabilities view to inspect controls. A creation request must produce music.');
        const payload=validateRequest(raw,await capabilities(),{webhookUrl:config.webhookUrl});if(payload.async===undefined)payload.async=true;
        if(!store.db.prepare('SELECT 1 FROM jobs WHERE owner=? AND idem=?').get(session.owner,idem))await deliveryReady();
        const result=store.admit({owner:session.owner,ipKey,idem,payload,limits:{daily:config.dailyAdmissionLimit,owner:session.user_id?SIGNED_IN_DAILY_LIMIT:config.guestDailyLimit,ip:config.ipDailyLimit}});
        json(res,202,{job:store.publicJob(result.job),existing:result.existing});jobs.wake();return;
      }
      const jobMatch=/^\/api\/jobs\/([a-zA-Z0-9_-]+)(\/retry-ingest|\/retry-status)?$/.exec(path);
      if(jobMatch){if(!session)throw problem(401,'SESSION_REQUIRED','Refresh the page to continue.');const j=store.ownJob(jobMatch[1],session.owner);
        if(req.method==='GET'&&!jobMatch[2]){json(res,200,{job:store.publicJob(j)});return;}
        if(req.method==='POST'&&jobMatch[2]==='/retry-status'){await readJSON(req);store.transaction(()=>store.consume(`status-retry:${j.id}`,3,60000));json(res,202,{job:store.publicJob(jobs.retryStatus({id:j.id,owner:session.owner}))});jobs.wake();return;}
        if(req.method==='POST'&&jobMatch[2]==='/retry-ingest'){await readJSON(req);if(!['ingest_failed','partial'].includes(j.status)||!j.result)throw problem(409,'NOT_RETRYABLE','This creation does not need a transfer retry.');await deliveryReady();store.transaction(()=>store.consume(`retry:${j.id}`,3,60000));store.updateJob(j.id,{status:'ingesting',error:null});json(res,202,{job:store.publicJob(store.job(j.id))});jobs.wake();return;}
      }
      const listen=/^\/api\/listen\/([a-zA-Z0-9_-]+)$/.exec(path);
      if(listen&&['GET','HEAD'].includes(req.method)){await serveAudio(req,res,listen[1]);return;}
      if(path==='/api/playlists'){
        const user=security.account(session);
        if(req.method==='GET'){json(res,200,{playlists:store.playlists(user)});return;}
        if(req.method==='POST'){const body=playlistBody(await readJSON(req));if(body.songs?.length)throw problem(400,'INVALID_REQUEST','Create the playlist before adding songs.');json(res,201,{playlist:store.createPlaylist(user,body.name)});return;}
      }
      const playlist=/^\/api\/playlists\/([a-zA-Z0-9_-]+)$/.exec(path);
      if(playlist){const user=security.account(session);if(req.method==='PATCH'){json(res,200,{playlist:store.changePlaylist(playlist[1],user,playlistBody(await readJSON(req),true))});return;}if(req.method==='DELETE'){store.deletePlaylist(playlist[1],user);json(res,200,{ok:true});return;}}
      if(path==='/api/favorites'&&req.method==='GET'){json(res,200,{saved:store.favorites(security.account(session))});return;}
      const favorite=/^\/api\/favorites\/([a-zA-Z0-9_-]+)$/.exec(path);
      if(favorite&&req.method==='PUT'){const user=security.account(session),body=await readJSON(req);exactKeys(body,['saved']);if(typeof body.saved!=='boolean')throw problem(400,'INVALID_REQUEST','Saved must be a boolean.');json(res,200,{saved:store.favorite(user,favorite[1],body.saved)});return;}
      if(path.startsWith('/api/downloads')||path.startsWith('/api/rewards')){
        security.account(session);
        // There is deliberately no client-grant route. GPT web has no signed server reward callback.
        throw problem(503,'REWARDED_DOWNLOAD_UNAVAILABLE','Rewarded downloads are not available yet. Listening and creating remain available.');
      }
      throw problem(404,'NOT_FOUND','This endpoint does not exist.');
    }
    if(!['GET','HEAD'].includes(req.method))throw problem(405,'METHOD_NOT_ALLOWED','This method is not supported.');
    if(path==='/player-three.html'&&url.search){res.writeHead(303,{Location:'/player-three.html','Cache-Control':'no-store'});res.end();return;}
    const shared=/^\/s\/([A-Za-z0-9_-]+)$/.exec(path),sharedTrack=shared?navigation.publicTrack(shared[1]):null;
    let decoded;try{decoded=decodeURIComponent(path);}catch{throw problem(400,'INVALID_PATH','Invalid path.');}
    if(/[\\\x00-\x1f:]/.test(decoded)||decoded.split('/').some(p=>p==='..'||p.startsWith('.')))throw problem(404,'NOT_FOUND','Page not found.');
    const requested=resolve(config.publicRoot,sharedTrack?'player-three.html':decoded==='/'?'index.html':'.'+decoded);
    if(!requested.startsWith(config.publicRoot+sep))throw problem(404,'NOT_FOUND','Page not found.');
    const type=mime[extname(requested).toLowerCase()];if(!type)throw problem(404,'NOT_FOUND','Page not found.');
    let actual,info;try{actual=await realpath(requested);info=await stat(actual);}catch{throw problem(404,'NOT_FOUND','Page not found.');}
    if(!actual.startsWith(config.publicRoot+sep)||!info.isFile())throw problem(404,'NOT_FOUND','Page not found.');
    if(extname(actual)==='.html'){
      let html=await readFile(actual,'utf8');
      if(sharedTrack)html=html.replace('<head>','<head><base href="/">').replace(/<body\b/,`<body data-public-song="${sharedTrack.id}"`);
      if(res.pmpNonce)html=html.replace(/<script\b/g,`<script nonce="${res.pmpNonce}"`);
      else{const hashes=[...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>`'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);res.setHeader('Content-Security-Policy',String(res.getHeader('Content-Security-Policy')).replace("script-src 'self'",`script-src 'self' ${hashes.join(' ')}`));}
      res.writeHead(200,{'Content-Type':type,'Content-Length':Buffer.byteLength(html),'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:html);return;
    }
    res.writeHead(200,{'Content-Type':type,'Content-Length':info.size,'Cache-Control':'no-cache'});if(req.method==='HEAD'){res.end();return;}const stream=createReadStream(actual);stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  }
  const server=createServer({maxHeaderSize:16384},(req,res)=>{
    const requestId=randomUUID();res.setHeader('X-Request-Id',requestId);
    route(req,res).catch(e=>{if(res.headersSent){res.destroy();return;}const status=Number.isInteger(e.status)&&e.status>=400&&e.status<=599?e.status:500;
      const refusal=e instanceof EngineError?publicFailure(e):null;
      json(res,status,{error:{code:refusal?.code||e.code||'INTERNAL_ERROR',message:refusal?.message||(status===500?'The request could not be completed.':e.message),requestId,...(e.issues?{issues:e.issues}:refusal?.fields?.length?{issues:refusal.fields}:{}),...(refusal?.contentSafety?{contentSafety:refusal.contentSafety}:{}),...(refusal?.quota?{quota:refusal.quota}:{})}});
      if(status>=500)console.error(JSON.stringify({event:'request_error',requestId,code:e.code||'INTERNAL_ERROR'}));
    });
  });
  server.requestTimeout=30000;server.headersTimeout=15000;server.keepAliveTimeout=5000;
  return {server,capabilities,enhancements,callbacks,get running(){return previews.running||enhancements.running||callbacks.running;}};
}
