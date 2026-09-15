/* Read current CMP consent; never create consent or reward entitlements.
 * Parent wiring:
 * PMPConsent.start(PMP_APP.config.consent, {nonce, nonTcfAdapter?});
 * PMPAds.configure({audio, consent:PMPConsent.getDecision});
 * PMPConsent.subscribe(() => PMPAds.consentChanged());
 * A non-TCF adapter is trusted application code bound directly to a real CMP:
 * {id, read({purpose}) -> Promise<decision>, subscribe(onChange) -> unsubscribe,
 *  openPreferences()}. Decision: {source:'cmp',cmpId,ready:true,scope:'non-tcf',
 *  allowed:boolean,storageAllowed:boolean,personalized:boolean,
 *  restrictDataProcessing:boolean,requestParams?:{gpp,gpp_sid}}.
 * No DOM CustomEvent, localStorage flag or gdprApplies=false grants permission.
 * Provider adapter, published CMP messages and legal configuration require actual
 * operator integration; injecting this interface is not proof of certification.
 * Official source review 2026-09-12:
 * https://support.google.com/admanager/answer/9805023?hl=en (purpose/legal bases)
 * https://support.google.com/admanager/answer/9999955?hl=en (Google vendor 755)
 * https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md
 * (add/removeEventListener, loaded, eventStatus, restrictions, disclosedVendors)
 * https://developers.google.com/funding-choices/fc-api-docs (revocation queue)
 */
(function(global){
  'use strict';
  const listeners=new Set(), doc=global.document;
  let config={enabled:false}, options={}, epoch=0, api, listenerId, retryTimer, timeoutTimer, script;
  let latest=null, ready=false, phase='disabled', adapterUnsubscribe=null, adapterReady=false, signature='', decisionRevision=0;
  const denied=reason=>({allowed:false,storageAllowed:false,personalized:false,reason});
  const clone=value=>JSON.parse(JSON.stringify(value));
  function publicState(){return {phase,enabled:config.enabled===true,ready,cmpId:config.cmpId||null,preferencesAvailable:!!(options.nonTcfAdapter?.openPreferences || (config.cmpId===300&&global.googlefc?.callbackQueue))};}
  function emit(next){phase=next;const text=JSON.stringify(publicState());if(text===signature)return;signature=text;for(const listener of listeners){try{listener(publicState());}catch{/* One consumer must not prevent withdrawal for others. */}}}
  function revoke(next='waiting'){decisionRevision++;latest=null;ready=false;emit(next);}
  function purposeAllowed(data,id,consentOnly=false){
    const vendor=755,restriction=data.publisher?.restrictions?.[id]?.[vendor];
    if(restriction===0 || (restriction!==undefined&&![1,2].includes(restriction)))return false;
    const consent=data.purpose?.consents?.[id]===true && data.vendor?.consents?.[vendor]===true;
    const legitimate=data.purpose?.legitimateInterests?.[id]===true && data.vendor?.legitimateInterests?.[vendor]===true;
    if(consentOnly)return restriction!==2&&consent;
    // Google defaults flexible purposes to LI. Consent applies when publisher requires it.
    return restriction===1?consent:legitimate;
  }
  function evaluateTCF(data,success,cfg=config){
    if(cfg.enabled!==true)return denied('disabled');
    if(success!==true||!data||data.cmpId!==cfg.cmpId)return denied('cmp-unverified');
    if(data.gdprApplies===false)return denied('non-tcf-adapter-required');
    if(data.gdprApplies!==true||data.cmpStatus!=='loaded'||!['tcloaded','useractioncomplete'].includes(data.eventStatus))return denied('waiting-for-cmp');
    if(data.isServiceSpecific!==true||data.vendor?.disclosedVendors?.[755]!==true)return denied('vendor-not-disclosed');
    if(typeof data.tcString!=='string'||data.tcString.length<20||data.tcString.length>20000||!/^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/.test(data.tcString))return denied('invalid-consent-string');
    if(!purposeAllowed(data,1,true))return denied('device-storage-not-permitted');
    if(![2,7,9,10].every(id=>purposeAllowed(data,id)))return denied('basic-ads-not-permitted');
    return {allowed:true,storageAllowed:true,personalized:purposeAllowed(data,3,true)&&purposeAllowed(data,4,true),requestParams:{gdpr:'1',gdpr_consent:data.tcString},source:'tcf'};
  }
  function accept(data,success,version){
    if(version!==epoch)return;
    if(Number.isInteger(data?.listenerId))listenerId=data.listenerId;
    if(success!==true||data?.cmpId!==config.cmpId){revoke('cmp-unverified');return;}
    // A real CMP replaces its initial stub. The completed callback binds its loaded API.
    api=global.__tcfapi;decisionRevision++;latest=clone(data);ready=true;
    const decision=evaluateTCF(latest,true);
    // Include consent changes in the signal even when the visible phase remains allowed.
    signature='';emit(decision.allowed?'permitted':data.gdprApplies===false?'non-tcf-required':decision.reason);
  }
  function listen(version){
    if(version!==epoch)return;
    if(typeof global.__tcfapi!=='function'){retryTimer=global.setTimeout(()=>listen(version),100);return;}
    api=global.__tcfapi;
    try{api('addEventListener',2,(data,success)=>accept(data,success,version));}
    catch{revoke('cmp-unavailable');}
  }
  function clear(){
    global.clearTimeout(retryTimer);global.clearTimeout(timeoutTimer);
    if(api&&Number.isInteger(listenerId)){try{api('removeEventListener',2,()=>{},listenerId);}catch{}}
    if(adapterUnsubscribe){try{adapterUnsubscribe();}catch{}}
    adapterUnsubscribe=null;adapterReady=false;api=null;listenerId=undefined;
    if(script){script.onload=script.onerror=null;script.remove();script=null;}
  }
  function start(next={},extra={}){
    epoch++;clear();config=clone(next);options=extra;latest=null;ready=false;const version=epoch;
    if(config.enabled!==true){emit('disabled');return publicState();}
    if(!Number.isInteger(config.cmpId)||config.cmpId<1||config.googleVendorId!==755){emit('invalid-configuration');return publicState();}
    const adapter=options.nonTcfAdapter;
    if(adapter&&config.nonTcfAdapterId===adapter.id&&typeof adapter.subscribe==='function'&&typeof adapter.read==='function'){
      try{adapterUnsubscribe=adapter.subscribe(()=>{if(version===epoch){decisionRevision++;signature='';emit('checking-cmp');}});adapterReady=typeof adapterUnsubscribe==='function';}catch{revoke('adapter-unavailable');}
    }
    emit('waiting-for-cmp');
    const timeout=Number.isFinite(config.timeoutMs)?Math.min(15000,Math.max(1000,config.timeoutMs)):10000;
    timeoutTimer=global.setTimeout(()=>{global.clearTimeout(retryTimer);if(version===epoch&&!ready)revoke('cmp-unavailable');},timeout);
    // Configured CMP may load before consent; ad SDKs remain gated separately.
    let cmpAlreadyLoaded=false;
    try{global.__tcfapi?.('ping',2,data=>{cmpAlreadyLoaded=data?.cmpLoaded===true&&data.cmpId===config.cmpId;});}catch{}
    if(config.scriptUrl&&!cmpAlreadyLoaded){
      let url;try{url=new URL(config.scriptUrl);}catch{revoke('invalid-configuration');return publicState();}
      if(url.protocol!=='https:'||url.username||url.password){revoke('invalid-configuration');return publicState();}
      script=doc.createElement('script');script.src=url.href;script.async=true;
      const nonce=options.nonce||doc.querySelector('script[nonce]')?.nonce;if(nonce)script.nonce=nonce;
      script.onerror=()=>{if(version===epoch)revoke('cmp-load-failed');};
      doc.head.appendChild(script);
    }
    listen(version);return publicState();
  }
  async function nonTcfDecision(purpose,version){
    const adapter=options.nonTcfAdapter;
    if(!adapterReady||!config.nonTcfAdapterId||adapter?.id!==config.nonTcfAdapterId||typeof adapter.read!=='function'||typeof adapter.subscribe!=='function')return denied('non-tcf-adapter-required');
    const revision=decisionRevision;
    let timer;
    try{
      const result=await Promise.race([Promise.resolve(adapter.read({purpose})),new Promise(resolve=>{timer=global.setTimeout(()=>resolve(null),2000);})]);
      if(version!==epoch||revision!==decisionRevision||api!==global.__tcfapi||latest?.gdprApplies!==false||result?.source!=='cmp'||result.cmpId!==config.cmpId||result.ready!==true||result.scope!=='non-tcf'||result.allowed!==true||result.storageAllowed!==true||typeof result.personalized!=='boolean'||typeof result.restrictDataProcessing!=='boolean')return denied('non-tcf-not-permitted');
      const params=result.requestParams||{};
      if(Object.keys(params).some(key=>!['gpp','gpp_sid'].includes(key))||Object.values(params).some(value=>typeof value!=='string'||value.length>20000))return denied('invalid-global-signals');
      if(params.gpp_sid&&!/^[0-9]+(?:,[0-9]+)*$/.test(params.gpp_sid))return denied('invalid-global-signals');
      return {allowed:true,storageAllowed:true,personalized:result.personalized,restrictDataProcessing:result.restrictDataProcessing,requestParams:{gdpr:'0',...params},source:'cmp-adapter'};
    }catch{return denied('adapter-unavailable');}finally{global.clearTimeout(timer);}
  }
  async function getDecision({purpose}={}){
    if(!['audio','banner'].includes(purpose)||config.enabled!==true)return denied('disabled');
    if(!api||api!==global.__tcfapi){revoke('cmp-unavailable');return denied('cmp-unavailable');}
    if(!ready||!latest)return denied('waiting-for-cmp');
    // This is a live observer snapshot; never persist it as a user-granted boolean.
    if(latest.gdprApplies===false)return nonTcfDecision(purpose,epoch);
    return clone(evaluateTCF(latest,true));
  }
  function subscribe(callback){if(typeof callback!=='function')throw TypeError('Consent subscriber must be a function');listeners.add(callback);return()=>listeners.delete(callback);}
  function openPreferences(){
    if(config.enabled!==true)return false;
    if(config.nonTcfAdapterId&&options.nonTcfAdapter?.id===config.nonTcfAdapterId&&typeof options.nonTcfAdapter.openPreferences==='function'){revoke('preferences-open');options.nonTcfAdapter.openPreferences();return true;}
    if(config.cmpId===300&&global.googlefc?.callbackQueue){revoke('preferences-open');global.googlefc.callbackQueue.push({'CONSENT_API_READY':()=>global.googlefc.showRevocationMessage()});return true;}
    return false;
  }
  function destroy(){epoch++;clear();config={enabled:false};revoke('disabled');}
  global.addEventListener('pagehide',destroy);
  global.PMPConsent=Object.freeze({start,getDecision,subscribe,openPreferences,destroy,getState:publicState,evaluateTCF});
})(window);
