/* Public publisher configuration only. Never pass an engine/API credential here.
 * Operator must verify their CMP's current Google certification and published messages:
 * https://support.google.com/admanager/answer/13554116?hl=en (reviewed 2026-09-12).
 * GPT supports nonce/strict-dynamic CSP, not a complete stable host allowlist:
 * https://developers.google.com/publisher-tag/guides/content-security-policy
 * csp.directives is an enabled-only starting set. Inventory media/creative origins
 * require observed publisher testing; the returned configuration does not prove ad readiness.
 */
const OFF = () => ({ads:{enabled:false,audio:{enabled:false},banner:{enabled:false},rewardEnabled:false},consent:{enabled:false},csp:{enabled:false,requiresNonce:false,forceSafeFrame:false,directives:{}}});
const integer = (value, fallback, min, max, name) => {const n=Number(value ?? fallback);if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(`Invalid ${name}`);return n;};
function json(value, fallback, name) {if(!value)return fallback;try{return JSON.parse(value);}catch{throw Error(`Invalid ${name} JSON`);}}
function publicUrl(value,name) {
  let url;try{url=new URL(value);}catch{throw Error(`Invalid ${name}`);}
  if(url.protocol!=='https:'||url.username||url.password||url.hash||url.port||!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)||url.hostname.endsWith('.localhost'))throw Error(`Invalid ${name}: use a public HTTPS URL`);
  if([...url.searchParams.keys()].some(key=>/^(?:api[-_]?key|secret|password|authorization|access[-_]?token|id[-_]?token)$/i.test(key)))throw Error(`Invalid ${name}: credentials must never enter public ad configuration`);
  return url;
}
function origins(value,name){const items=json(value,[],name);if(!Array.isArray(items)||items.length>32)throw Error(`Invalid ${name}`);return [...new Set(items.map(item=>{const url=publicUrl(item,name);if(url.pathname!=='/'||url.search)throw Error(`Invalid ${name}: origins only`);return url.origin;}))];}
export function readAdConfig(env = process.env) {
  if(!env.PMP_ADS_ENABLED||env.PMP_ADS_ENABLED==='false')return OFF();
  if(env.PMP_ADS_ENABLED!=='true')throw Error('PMP_ADS_ENABLED must be true or false');
  if(env.PMP_CMP_CERTIFICATION_REVIEWED!=='true')throw Error('Verify the selected CMP certification and publisher configuration before enabling ads');
  const cmpId=integer(env.PMP_CMP_ID,undefined,1,65535,'PMP_CMP_ID');
  const script=publicUrl(env.PMP_CMP_SCRIPT_URL,'PMP_CMP_SCRIPT_URL');
  const audio={enabled:false},banner={enabled:false};
  if(env.PMP_AD_AUDIO_TAG_URL){
    const url=publicUrl(env.PMP_AD_AUDIO_TAG_URL,'PMP_AD_AUDIO_TAG_URL');
    if(!['pubads.g.doubleclick.net','securepubads.g.doubleclick.net'].includes(url.hostname)||url.pathname!=='/gampad/ads'||!/^\/\d+\/[^<>\r\n]{1,300}$/.test(url.searchParams.get('iu')||'')||url.searchParams.get('ad_rule')==='1')throw Error('Audio requires an actual Google Ad Manager single-break ad tag');
    if(['gdpr','gdpr_consent','gpp','gpp_sid','addtl_consent','npa','rdp'].some(key=>url.searchParams.has(key)))throw Error('Consent parameters must come from the current CMP decision, not a static ad tag');
    Object.assign(audio,{enabled:true,tagUrl:url.href,minTracksBetweenAds:integer(env.PMP_AD_INTERVAL_TRACKS,3,1,100,'PMP_AD_INTERVAL_TRACKS'),requestTimeoutMs:integer(env.PMP_AD_REQUEST_TIMEOUT_MS,10000,2000,20000,'PMP_AD_REQUEST_TIMEOUT_MS')});
  }
  if(env.PMP_AD_BANNER_UNIT){
    if(!/^\/\d+\/[^<>\s]{1,300}$/.test(env.PMP_AD_BANNER_UNIT))throw Error('Invalid PMP_AD_BANNER_UNIT');
    const sizes=json(env.PMP_AD_BANNER_SIZES_JSON,[[320,50],[728,90]],'PMP_AD_BANNER_SIZES_JSON');
    if(!Array.isArray(sizes)||!sizes.length||sizes.length>8||sizes.some(size=>!Array.isArray(size)||size.length!==2||!Number.isInteger(size[0])||!Number.isInteger(size[1])||size[0]<1||size[0]>1200||size[1]<1||size[1]>100))throw Error('Use discreet banner sizes up to 1200 by 100');
    Object.assign(banner,{enabled:true,adUnitPath:env.PMP_AD_BANNER_UNIT,sizes});
  }
  if(!audio.enabled&&!banner.enabled)throw Error('Provide at least one actual audio tag or banner ad unit');
  const adapterId=env.PMP_CMP_NON_TCF_ADAPTER_ID||null;
  if(adapterId&&!/^[a-z][a-z0-9.-]{2,79}$/.test(adapterId))throw Error('Invalid PMP_CMP_NON_TCF_ADAPTER_ID');
  const cmpOrigins=origins(env.PMP_CMP_RESOURCE_ORIGINS_JSON,'PMP_CMP_RESOURCE_ORIGINS_JSON');
  const adOrigins=origins(env.PMP_AD_RESOURCE_ORIGINS_JSON,'PMP_AD_RESOURCE_ORIGINS_JSON');
  const mediaOrigins=origins(env.PMP_AD_MEDIA_ORIGINS_JSON,'PMP_AD_MEDIA_ORIGINS_JSON');
  const google=audio.enabled?['https://imasdk.googleapis.com','https://pubads.g.doubleclick.net','https://securepubads.g.doubleclick.net']:[];
  if(banner.enabled)google.push('https://securepubads.g.doubleclick.net','https://tpc.googlesyndication.com');
  const shared=[...new Set([script.origin,...cmpOrigins,...google,...adOrigins])];
  return {
    ads:{enabled:true,audio,banner,rewardEnabled:false},
    consent:{enabled:true,mode:'tcf',cmpId,scriptUrl:script.href,googleVendorId:755,nonTcfAdapterId:adapterId,certification:'operator-reviewed',readiness:'publisher-unverified',timeoutMs:10000},
    csp:{enabled:true,requiresNonce:true,forceSafeFrame:banner.enabled,directives:{'script-src':shared,'connect-src':shared,'frame-src':shared,'img-src':shared,'style-src':[script.origin,...cmpOrigins],'font-src':cmpOrigins,'media-src':[...new Set([...google,...mediaOrigins])]},inventoryVerified:false}
  };
}
