import {timingSafeEqual,createHmac,randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {nonce,problem} from './store.mjs';
import {isIP} from 'node:net';

export function equal(a,b){if(typeof a!=='string'||typeof b!=='string')return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export function parseCookie(raw,name){const values=String(raw||'').split(';').map(v=>v.trim()).filter(v=>v.startsWith(name+'='));return values.length===1?values[0].slice(name.length+1):null;}
export function createSecurity(config,store){
  const keyPath=resolve(config.stateRoot,'request-salt.local.txt');let salt;try{salt=readFileSync(keyPath,'utf8');}catch(e){if(e.code!=='ENOENT')throw e;salt=nonce();writeFileSync(keyPath,salt,{flag:'wx',mode:0o600});}
  const cookieName=config.production?'__Host-pmp_session':'pmp_dev_session';
  const cookie=(token,maxAge=172800)=>`${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${config.production?'; Secure':''}`;
  function headers(res){res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=()');
    const policy={'default-src':["'self'"],'script-src':["'self'"],'style-src':["'self'","'unsafe-inline'"],'img-src':["'self'",'data:','blob:'],'media-src':["'self'",'blob:'],'font-src':["'self'"],'connect-src':["'self'"],'worker-src':["'self'",'blob:'],'frame-src':["'none'"],'object-src':["'none'"],'base-uri':["'none'"],'form-action':["'self'"],'frame-ancestors':["'none'"]};
    if(config.adCsp?.enabled){res.pmpNonce=randomBytes(24).toString('base64');for(const [key,sources]of Object.entries(config.adCsp.directives)){if(!policy[key])continue;policy[key]=[...policy[key].filter(v=>v!=="'none'"),...sources];}policy['script-src'].push(`'nonce-${res.pmpNonce}'`,"'strict-dynamic'");}
    res.setHeader('Content-Security-Policy',Object.entries(policy).map(([key,sources])=>`${key} ${[...new Set(sources)].join(' ')}`).join('; '));
    if(config.production)res.setHeader('Strict-Transport-Security','max-age=31536000; includeSubDomains');
  }
  function check(req){if(req.headers.host!==new URL(config.origin).host)throw problem(421,'INVALID_HOST','Request host is not allowed.');if(req.headers['sec-fetch-site']==='cross-site' && req.url.startsWith('/api/'))throw problem(403,'CROSS_SITE','Cross-site requests are not allowed.');}
  function session(req,res,create=false){let s=store.session(parseCookie(req.headers.cookie,cookieName));if(!s&&create){const n=store.newSession();s=n.row;res.setHeader('Set-Cookie',cookie(n.token));}return s;}
  function mutate(req,s){if(!s)throw problem(401,'SESSION_REQUIRED','Refresh the page to continue.');if(req.headers.origin!==config.origin||!equal(req.headers['x-csrf-token'],s.csrf))throw problem(403,'CSRF_REJECTED','This request could not be verified. Refresh the page.');}
  function account(s){if(!s?.user_id)throw problem(401,'LOGIN_REQUIRED','Sign in to save playlists or download music.');return s.user_id;}
  function ipKey(req){let address=req.socket.remoteAddress||'unknown';if(config.production){
    if(!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(address)||!equal(req.headers['x-pmp-proxy-secret'],config.proxySecret))throw problem(403,'PROXY_REQUIRED','The request did not pass the trusted application gateway.');
    const client=req.headers['x-pmp-client-ip'];if(typeof client!=='string'||client.length>45||!isIP(client))throw problem(400,'INVALID_CLIENT_ADDRESS','The gateway client address is invalid.');address=client;
  }return createHmac('sha256',salt).update(address).digest('hex');}
  return {headers,check,session,mutate,account,ipKey,cookie,cookieName};
}
export async function readJSON(req,max=65536){if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw problem(415,'CONTENT_TYPE','Send JSON for this request.');const declared=Number(req.headers['content-length']);if(declared>max)throw problem(413,'BODY_TOO_LARGE','The music brief is too large.');let length=0;const parts=[];for await(const chunk of req){length+=chunk.length;if(length>max)throw problem(413,'BODY_TOO_LARGE','The music brief is too large.');parts.push(chunk);}try{const body=JSON.parse(Buffer.concat(parts).toString('utf8'));if(!body||typeof body!=='object'||Array.isArray(body))throw Error();return body;}catch{throw problem(400,'INVALID_JSON','A JSON object is required.');}}
export function exactKeys(body,keys){if(Object.keys(body).some(k=>!keys.includes(k)))throw problem(400,'INVALID_REQUEST','This request contains unsupported fields.');}
export function playlistBody(body,partial=false){exactKeys(body,partial?['name','songs','revision']:['name','songs']);if(partial&&(!Number.isSafeInteger(body.revision)||body.revision<1))throw problem(400,'REVISION_REQUIRED','The current playlist revision is required.');if(!partial||body.name!==undefined){if(typeof body.name!=='string'||!body.name.trim()||body.name.length>100)throw problem(400,'INVALID_NAME','Use a playlist name from 1 to 100 characters.');body.name=body.name.trim();}if(body.songs!==undefined&&(!Array.isArray(body.songs)||body.songs.length>500||body.songs.some(t=>typeof t!=='string'||t.length>100)))throw problem(400,'INVALID_TRACKS','Choose up to 500 available songs.');return body;}
