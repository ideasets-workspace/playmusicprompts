import {OAuth2Client} from 'google-auth-library';
import {createHash} from 'node:crypto';
import {problem} from './store.mjs';

export const CALLBACK_PATH='/api/music-callback';
export const CALLBACK_EMAIL='music-api-runtime@playmusicprompts.iam.gserviceaccount.com';
const ISSUER='https://accounts.google.com';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ID=/^[a-zA-Z0-9_-]{1,160}$/;
const ACCOUNT=/^[a-zA-Z0-9_.:@-]{1,128}$/;
const own=(o,k)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.hasOwn(o,k)?o[k]:undefined;
const rejected=()=>problem(401,'CALLBACK_UNAUTHENTICATED','This completion notification could not be verified.');
function readNotification(req){
  if(req.destroyed||req.aborted)throw problem(400,'CALLBACK_BODY_INCOMPLETE','The completion notification was interrupted.');
  if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw problem(415,'CONTENT_TYPE','Send a JSON completion notification.');
  return new Promise((resolve,reject)=>{
    let size=0;const parts=[];
    const cleanup=()=>{clearTimeout(timer);req.removeListener('data',data);req.removeListener('end',end);req.removeListener('error',error);req.removeListener('aborted',aborted);};
    const fail=e=>{cleanup();req.pause();reject(e);};
    const data=chunk=>{size+=chunk.length;if(size>8*1024*1024){fail(problem(413,'BODY_TOO_LARGE','The completion notification is too large.'));return;}parts.push(chunk);};
    const error=()=>fail(problem(400,'CALLBACK_BODY_INCOMPLETE','The completion notification was interrupted.'));
    const aborted=error;
    const end=()=>{cleanup();try{const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(parts)));if(!body||typeof body!=='object'||Array.isArray(body))throw Error();resolve(body);}catch{reject(problem(400,'INVALID_JSON','A JSON notification object is required.'));}};
    const timer=setTimeout(()=>fail(problem(408,'CALLBACK_BODY_TIMEOUT','The completion notification did not arrive in time.')),10000);
    req.on('data',data);req.on('end',end);req.on('error',error);req.on('aborted',aborted);
  });
}

export function callbackDestination(config){
  const expected=new URL(CALLBACK_PATH,config.origin);
  return expected.protocol==='https:'&&config.webhookUrl===expected.href?expected.href:null;
}

// verifyIdToken performs the signature check against Google's certificates.
// These additional checks narrow the SDK's general Google-login policy to the
// exact service-to-service contract in docs/api/11-webhook-async.md:30-78.
export function createCallbackVerifier({client,now=Date.now}={}){
  if(!client){
    client=new OAuth2Client();
    const request=client.transporter.request.bind(client.transporter);
    // Only this private client's certificate retrieval is changed. A callback
    // must finish well inside the sender's 30-second single-attempt deadline.
    client.transporter.request=options=>request({...options,timeout:5000,retry:false,signal:AbortSignal.timeout(5000)});
  }
  return async function verify(authorization,audience){
    if(typeof authorization!=='string'||authorization.length>12288||!/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(authorization))throw rejected();
    let timer;
    try{
      const ticket=await Promise.race([client.verifyIdToken({idToken:authorization.slice(7),audience,maxExpiry:86400}),
        new Promise((_,reject)=>{timer=setTimeout(()=>reject(rejected()),8000);})]);
      const claims=ticket.getPayload(),seconds=now()/1000;
      if(claims?.iss!==ISSUER||claims.aud!==audience||claims.email!==CALLBACK_EMAIL||claims.email_verified!==true
        ||typeof claims.sub!=='string'||!claims.sub||claims.sub.length>255
        ||!Number.isFinite(claims.exp)||claims.exp<=seconds||!Number.isFinite(claims.iat)||claims.iat>seconds+300)throw rejected();
      return true;
    }catch{throw rejected();}finally{clearTimeout(timer);}
  };
}

export function createCallbacks({config,store,jobs,verify=createCallbackVerifier(),now=Date.now}){
  const audience=callbackDestination(config);
  store.db.exec(`CREATE TABLE IF NOT EXISTS completion_callback_bindings (
    job_id TEXT PRIMARY KEY REFERENCES jobs(id),upstream_id TEXT NOT NULL UNIQUE,request_id TEXT NOT NULL,
    account_id TEXT NOT NULL,callback_url TEXT NOT NULL,created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS completion_callback_receipts (
    job_id TEXT PRIMARY KEY REFERENCES jobs(id),request_id TEXT NOT NULL,upstream_id TEXT NOT NULL,
    fingerprint TEXT NOT NULL,received INTEGER NOT NULL,notified INTEGER);`);
  let active=0;
  function rememberAdmission(job){
    if(!audience||!job?.result||!job.payload||!ID.test(job.upstream_id??''))return false;
    let request,result;try{request=JSON.parse(job.payload);result=JSON.parse(job.result);}catch{return false;}
    const requestId=own(result,'request_id'),accountId=own(own(result,'auth'),'account_id');
    if(request.webhook_url!==audience||request.async!==true||result.job_id!==job.upstream_id
      ||typeof requestId!=='string'||!UUID.test(requestId)||typeof accountId!=='string'||!ACCOUNT.test(accountId))return false;
    store.db.prepare(`INSERT OR IGNORE INTO completion_callback_bindings VALUES (?,?,?,?,?,?)`)
      .run(job.id,job.upstream_id,requestId,accountId,audience,now());
    const row=store.db.prepare('SELECT * FROM completion_callback_bindings WHERE job_id=?').get(job.id);
    return row?.upstream_id===job.upstream_id&&row.request_id===requestId&&row.account_id===accountId&&row.callback_url===audience;
  }
  // Old jobs are bindable only when their real admission identity still exists.
  // Missing historical admission metadata is never invented from a job name.
  if(audience)for(const job of store.db.prepare('SELECT * FROM jobs WHERE upstream_id IS NOT NULL AND result IS NOT NULL').iterate())rememberAdmission(job);

  function notify(receipt){
    if(typeof jobs.notifyCompletion!=='function')throw problem(503,'CALLBACK_STATUS_UNAVAILABLE','The saved job status check is unavailable.');
    jobs.notifyCompletion({jobId:receipt.job_id,upstreamId:receipt.upstream_id,requestId:receipt.request_id});
    store.db.prepare('UPDATE completion_callback_receipts SET notified=? WHERE job_id=? AND notified IS NULL').run(now(),receipt.job_id);
  }
  function resume(){
    if(!audience)return;
    for(const receipt of store.db.prepare('SELECT * FROM completion_callback_receipts WHERE notified IS NULL').all())notify(receipt);
  }
  async function receive(req){
    if(!audience)throw problem(404,'NOT_FOUND','This endpoint does not exist.');
    if(active>=8)throw problem(503,'CALLBACK_BUSY','Completion notifications are temporarily busy.');
    active++;
    try{
      if(req.headers['content-encoding']&&req.headers['content-encoding']!=='identity')throw problem(415,'CONTENT_ENCODING','Send an uncompressed JSON notification.');
      // Reject declared oversize bodies before spending work on a signature.
      const size=Number(req.headers['content-length']);
      if(Number.isFinite(size)&&size>8*1024*1024)throw problem(413,'BODY_TOO_LARGE','The completion notification is too large.');
      await verify(req.headers.authorization,audience);
      const body=await readNotification(req);
      const requestId=own(body,'request_id'),upstreamId=own(own(body,'job'),'job_id'),accountId=own(own(body,'auth'),'account_id');
      if(typeof requestId!=='string'||!UUID.test(requestId)||req.headers['x-playmusicprompts-request-id']!==requestId
        ||typeof upstreamId!=='string'||!ID.test(upstreamId)||own(own(body,'job'),'mode')!=='async'
        ||typeof accountId!=='string'||!ACCOUNT.test(accountId)||typeof body.success!=='boolean')
        throw problem(400,'CALLBACK_INVALID','The completion notification has inconsistent identifiers.');
      const fingerprint=createHash('sha256').update(JSON.stringify({requestId,upstreamId,accountId,success:body.success})).digest('hex');
      const accepted=store.transaction(()=>{
        const binding=store.db.prepare(`SELECT b.*,j.upstream_id AS current_upstream,j.payload FROM completion_callback_bindings b JOIN jobs j ON j.id=b.job_id WHERE b.upstream_id=?`).get(upstreamId);
        if(!binding||binding.request_id!==requestId||binding.account_id!==accountId||binding.callback_url!==audience
          ||binding.current_upstream!==upstreamId||JSON.parse(binding.payload).webhook_url!==audience)
          throw problem(404,'CALLBACK_UNKNOWN','This completion notification does not match a saved admission.');
        const prior=store.db.prepare('SELECT * FROM completion_callback_receipts WHERE job_id=?').get(binding.job_id);
        if(prior&&prior.fingerprint!==fingerprint)throw problem(409,'CALLBACK_CONFLICT','A different completion notification is already recorded.');
        if(!prior)store.db.prepare('INSERT INTO completion_callback_receipts VALUES (?,?,?,?,?,NULL)').run(binding.job_id,requestId,upstreamId,fingerprint,now());
        return {duplicate:!!prior,receipt:prior??store.db.prepare('SELECT * FROM completion_callback_receipts WHERE job_id=?').get(binding.job_id)};
      });
      // Receipt commits before the wake. On a crash, resume() repeats only this
      // idempotent GET scheduling step, never submission or media ingestion.
      if(accepted.receipt.notified===null)notify(accepted.receipt);
      return {accepted:true,duplicate:accepted.duplicate};
    }finally{active--;}
  }
  return {enabled:!!audience,audience,rememberAdmission,receive,resume,get running(){return active>0;}};
}
