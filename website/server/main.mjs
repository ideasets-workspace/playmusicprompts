import {resolve} from 'node:path';
import {loadConfig} from './config.mjs';
import {createCredentials} from './credentials.mjs';
import {Store} from './store.mjs';
import {createEngine} from './engine.mjs';
import {createMedia} from './media.mjs';
import {createJobs} from './jobs.mjs';
import {createApplication} from './http.mjs';
import {acquireInstanceLock} from './instance-lock.mjs';
import {createOriginality} from './originality.mjs';
import {createDeliveryReadiness} from './delivery-readiness.mjs';
import {Mailer} from './mailer.mjs';
import {AccountService} from './accounts.mjs';
import {CapabilitiesCache} from './capabilities-cache.mjs';

const config=loadConfig();
// Acquire before Store's recovery can alter any persisted submitting job.
const instance=await acquireInstanceLock(config.stateRoot);
let store,engine,media,jobs,server,application,originality;
try {
  store=new Store(resolve(config.stateRoot,'website.sqlite'));
  // Engine-contact policy (owner rule 2026-09-15): every engine call is logged as one line, and every successful
  // generation response is shown to the capabilities cache so an engine redeploy triggers exactly one schema refresh.
  const engineLog=line=>console.log(JSON.stringify({event:'engine_call',...line}));
  let capabilitiesCache=null;
  engine=createEngine({baseUrl:config.engineBase,credentials:createCredentials(config),log:engineLog,onResponse:(path,data)=>{if(path!=='/v1/music/capabilities')capabilitiesCache?.noteEngineResponse(data);}});
  capabilitiesCache=new CapabilitiesCache({stateRoot:config.stateRoot,fetch:()=>engine.capabilities(),log:line=>console.log(JSON.stringify(line))});
  capabilitiesCache.load();
  media=createMedia({root:resolve(config.stateRoot,'media'),delivery:uri=>engine.delivery(uri),ffmpegPath:config.ffmpegPath,ffprobePath:config.ffprobePath,allowedBuckets:config.allowedBuckets,mediaCdnMappings:config.mediaCdnMappings});
  const readiness=createDeliveryReadiness(media);
  jobs=createJobs({store,engine,media,deliveryReady:readiness.assertReady,onAdmission:job=>application?.callbacks.rememberAdmission(job),onError:detail=>console.error(JSON.stringify({event:'job_notice',...detail}))});
  originality=createOriginality({store,engine,onError:detail=>console.error(JSON.stringify({event:'analysis_notice',...detail}))});
  // config.mail is null when production runs without a sender in verification-OFF mode (owner order 2026-09-15 12:41).
  const mailer=config.mail?new Mailer(config.mail):null;
  const accounts=new AccountService({store,mailer,origin:config.origin,emailVerification:config.accounts.emailVerification,onError:detail=>console.error(JSON.stringify({event:'account_notice',...detail}))});
  application=createApplication({config,store,engine,media,jobs,accounts,deliveryReady:readiness.assertReady,deliveryStatus:readiness.status,capabilitiesCache});server=application.server;
  capabilitiesCache.start();
} catch(error) {
  try { await engine?.close(); store?.close(); } finally { await instance.release(); }
  throw error;
}
server.listen(config.port,config.host,()=>{console.log(`PlayMusicPrompts: ${config.origin}`);application.callbacks.resume();jobs.start();originality.start();application.enhancements.start();});
server.on('error',e=>{console.error(JSON.stringify({event:'listen_failed',code:e.code}));shutdown(1);});
const cleanup=setInterval(()=>store.cleanup(),3600000);cleanup.unref();
let closing=false;
function shutdown(exitCode=0){
  if(closing)return;closing=true;jobs.stop();originality.stop();application.enhancements.stop();clearInterval(cleanup);
  let httpClosed=!server.listening,finishing=false;
  // Keep the guard while an in-flight admission/ingest owns the database. On a
  // hard shutdown the OS releases it and the next owner records uncertainty.
  const deadline=setTimeout(()=>process.exit(exitCode),25000);
  const check=setInterval(async()=>{
    if(finishing||!httpClosed||jobs.running||application.running||originality.running)return;finishing=true;clearInterval(check);clearTimeout(deadline);
    try { await engine.close(); store.close(); await instance.release(); process.exit(exitCode); }
    catch { process.exit(1); }
  },50);
  if(server.listening)server.close(()=>{httpClosed=true;});
}
process.on('SIGTERM',()=>shutdown(0));process.on('SIGINT',()=>shutdown(0));
