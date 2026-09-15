import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdirSync, readFileSync} from 'node:fs';
import {readAdConfig} from './ad-config.mjs';
import {validateCdnMappings} from './media.mjs';
import {ADMISSION_CEILING, DEFAULT_DAILY_ADMISSION_LIMIT, DEFAULT_GUEST_DAILY_LIMIT, DEFAULT_IP_DAILY_LIMIT} from './admission-limits.mjs';
import {MAIL_TRANSPORT_FILE, MAIL_TRANSPORT_SES, DEFAULT_EMAIL_VERIFICATION, EMAIL_VERIFICATION_REQUIRED, EMAIL_VERIFICATION_OFF} from './account-constants.mjs';

export const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export function loadConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const port = Number(env.PORT || 4177);
  const origin = new URL(env.PMP_ORIGIN || `http://127.0.0.1:${port}`);
  if (!Number.isInteger(port) || port < 1024 || port > 65535 || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw Error('Invalid application origin or port');
  if (production && origin.protocol !== 'https:') throw Error('Production requires an HTTPS public origin');
  if (!production && !['127.0.0.1', 'localhost'].includes(origin.hostname)) throw Error('Development must remain on loopback');
  const stateRoot = resolve(env.PMP_STATE_DIR || resolve(appRoot, '.state'));
  if (stateRoot.toLowerCase().startsWith(resolve(appRoot,'public').toLowerCase())) throw Error('State must be outside public');
  mkdirSync(stateRoot, {recursive:true, mode:0o700});
  let local = {}; try { local = JSON.parse(readFileSync(resolve(stateRoot,'runtime.local.json'),'utf8').replace(/^\uFEFF/,'')); } catch (e) { if(e.code!=='ENOENT') throw Error('Invalid private runtime configuration'); }
  const integer = (value, fallback, max) => { const n=Number(value ?? fallback); if(!Number.isSafeInteger(n)||n<1||n>max) throw Error('Invalid admission limit'); return n; };
  const proxySecret=env.PMP_PROXY_SECRET;
  if(production&&(!proxySecret||proxySecret.length<32))throw Error('Production requires the authenticated loopback reverse-proxy contract (PMP_PROXY_SECRET)');
  const advertising=readAdConfig(env);
  let webhookUrl=null;
  if(env.PMP_WEBHOOK_URL){const target=new URL(env.PMP_WEBHOOK_URL);if(target.protocol!=='https:'||target.username||target.password||target.hash||!target.hostname.includes('.')||target.hostname.endsWith('.localhost'))throw Error('The configured webhook must be an exact public HTTPS destination');webhookUrl=target.href;}
  // An external configured destination remains external. This application's
  // authenticated receiver is enabled only at this exact own-origin URL.
  const webhookReceiver=origin.protocol==='https:'&&webhookUrl===new URL('/api/music-callback',origin).href;
  const allowedBuckets=['playmusicprompts-music-studio','playmusicprompts-content'];
  let cdnMappings=[];
  if(env.PMP_MEDIA_CDN_MAPPINGS){try{cdnMappings=JSON.parse(env.PMP_MEDIA_CDN_MAPPINGS);}catch{throw Error('PMP_MEDIA_CDN_MAPPINGS must be a JSON array of exact CDN mappings.');}}
  const mediaCdnMappings=validateCdnMappings(cdnMappings,allowedBuckets);
  return {
    production, port, origin:origin.origin, host:'127.0.0.1', stateRoot, publicRoot:resolve(appRoot,'public'),proxySecret,webhookUrl,webhookReceiver,
    engineBase:'https://music-api-636636169989.us-central1.run.app',
    credentialsMode:env.PMP_CREDENTIAL_MODE || (production?'aws-wif':'gcloud-developer'),
    apiKeySecretId:env.PMP_API_KEY_SECRET_ID,
    googleServiceAccount:'website-backend@playmusicprompts.iam.gserviceaccount.com',
    ffmpegPath:env.PMP_FFMPEG || local.ffmpegPath,
    ffprobePath:env.PMP_FFPROBE || local.ffprobePath,
    allowedBuckets,mediaCdnMappings,
    // Admission limits: defaults and ceiling come from admission-limits.mjs (owner order 2026-09-15: 1000).
    // Environment variables may set any value from 1 up to ADMISSION_CEILING; anything else refuses to start.
    dailyAdmissionLimit:integer(env.PMP_DAILY_ADMISSION_LIMIT,DEFAULT_DAILY_ADMISSION_LIMIT,ADMISSION_CEILING),
    guestDailyLimit:integer(env.PMP_GUEST_DAILY_LIMIT,DEFAULT_GUEST_DAILY_LIMIT,ADMISSION_CEILING),
    ipDailyLimit:integer(env.PMP_IP_DAILY_LIMIT,DEFAULT_IP_DAILY_LIMIT,ADMISSION_CEILING),
    oidc:env.PMP_OIDC_ISSUER && env.PMP_OIDC_CLIENT_ID ? {issuer:env.PMP_OIDC_ISSUER,clientId:env.PMP_OIDC_CLIENT_ID,clientSecret:env.PMP_OIDC_CLIENT_SECRET} : null,
    // Account e-mail (verification / reset). With PMP_ACCOUNT_EMAIL_VERIFICATION=off (owner order 2026-09-15 12:41,
    // the default for now) the account system runs without a mail transport: production may start with no sender
    // and mail-dependent features are reported as unavailable. With verification 'required', production must send
    // through SES with a verified sender (PMP_MAIL_FROM). Development uses the private on-disk outbox unless SES is asked for.
    accounts:{emailVerification:(()=>{const mode=env.PMP_ACCOUNT_EMAIL_VERIFICATION||DEFAULT_EMAIL_VERIFICATION;if(![EMAIL_VERIFICATION_REQUIRED,EMAIL_VERIFICATION_OFF].includes(mode))throw Error('Invalid e-mail verification mode');return mode;})()},
    mail:(()=>{
      const transport=env.PMP_MAIL_TRANSPORT||(production?MAIL_TRANSPORT_SES:MAIL_TRANSPORT_FILE);
      if(![MAIL_TRANSPORT_SES,MAIL_TRANSPORT_FILE].includes(transport))throw Error('Invalid mail transport');
      if(production&&transport!==MAIL_TRANSPORT_SES)throw Error('Production must send account e-mail through SES');
      const from=env.PMP_MAIL_FROM||(production?'':'no-reply@playmusicprompts.local');
      if(production&&!from){
        if((env.PMP_ACCOUNT_EMAIL_VERIFICATION||DEFAULT_EMAIL_VERIFICATION)===EMAIL_VERIFICATION_REQUIRED)throw Error('PMP_MAIL_FROM is required in production when e-mail verification is required');
        return null; // no mail transport: accounts work without e-mail; reset-by-mail is reported unavailable
      }
      return {transport,from,replyTo:env.PMP_MAIL_REPLY_TO||undefined,configurationSet:env.PMP_SES_CONFIGURATION_SET||undefined,region:env.PMP_SES_REGION||env.AWS_REGION||undefined,stateRoot};
    })(),
    // Publisher IDs and a certified CMP must be configured together before any ad SDK loads.
    ads:advertising.ads,consent:advertising.consent,adCsp:advertising.csp,
  };
}
