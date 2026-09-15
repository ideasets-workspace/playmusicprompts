/* Real Google IMA audio / GPT banner lifecycle. No rewarded-download grant API.
 * Config from PMP_APP.config.ads:
 * {enabled:true,audio:{enabled:true,tagUrl:'https://pubads.g.doubleclick.net/gampad/ads?...',
 *   minTracksBetweenAds:3,requestTimeoutMs:10000},
 *  banner:{enabled:true,adUnitPath:'/network/unit',sizes:[[320,50],[728,90]]}}
 * configure({audio,consent,getVolume?}) / consentChanged() prepare only after consent({purpose})
 * returns {allowed:true,personalized:boolean,storageAllowed:true,
 *          restrictDataProcessing?:boolean,requestParams?:{gdpr,gdpr_consent,gpp,gpp_sid}}.
 * The callback MUST represent the actual CMP decision, never a guessed region,
 * checkbox mock or stored boolean masquerading as certified consent.
 * getVolume optionally returns a WebAudio player's effective volume (0 when muted).
 * userGesture(audio) MUST run synchronously in a real click/remote OK handler.
 * beforeNext({audio,reason:'ended'|'next',signal?,playIntent?}) -> Promise
 * {allowNext,status}; caller advances only on allowNext. NEVER auto-plays content.
 * While active, route transport through pause/resume/toggle/setVolume; cancel()
 * on explicit selection/stop. Duplicate beforeNext calls share one promise.
 * Events pmp:ads-state {phase,active,paused}, pmp:ads-result {allowNext,status}.
 * Persistent hosts are direct body children, outside the replaceable #main.
 * Official sources checked 2026-09-12:
 * https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/audio
 * https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/get-started
 * https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/multiple-requests
 * https://developers.google.com/publisher-tag/guides/control-ad-loading
 * https://developers.google.com/publisher-tag/reference (PrivacySettings)
 */
(function (global) {
  'use strict';
  const doc = global.document;
  const IMA_URL = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
  const GPT_URL = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
  const loads = new Map();
  let options = {}, epoch = 0, phase = 'unavailable', op = null, serial = 0, tracks = 0;
  let audio = null, display = null, loader = null, initialized = false, manager = null;
  let host, adContainer, status, pauseButton, skipButton, progress, bannerHost, bannerSlot;
  let consentAudio = null, bannerPromise = null, preparePromise = null, volumeListener = null, bannerRenderHandler = null;
  const cfg = () => global.PMP_APP?.config?.ads || {};
  const emit = (name, detail) => doc.dispatchEvent(new global.CustomEvent(name,{detail}));
  const clamp = (v,min,max,fallback) => Number.isFinite(Number(v)) ? Math.min(max,Math.max(min,Number(v))) : fallback;
  // WebAudio players can retain native volume=1 while their rack owns loudness.
  function effectiveVolume(element=audio || options.audio) {
    if(!element || element.muted) return 0;
    try { return clamp(typeof options.getVolume==='function' ? options.getVolume() : element.volume,0,1,0); }
    catch { return 0; }
  }
  function state(next) { phase = next; emit('pmp:ads-state',getState()); }
  function getState() { return {phase,active:!!op,paused:!!op && !op.playIntent,audioReady:!!loader && !!consentAudio,gestureReady:initialized,bannerReady:!!bannerSlot,rewardedDownload:'unavailable'}; }
  function audioConfig() {
    const c = cfg();
    if (c.enabled !== true || c.audio?.enabled !== true) return null;
    try {
      const url = new URL(c.audio.tagUrl);
      if (url.protocol !== 'https:' || url.username || url.password || !['pubads.g.doubleclick.net','securepubads.g.doubleclick.net'].includes(url.hostname) || url.pathname !== '/gampad/ads' || !/^\/\d+\/.+/.test(url.searchParams.get('iu') || '') || url.searchParams.get('ad_rule')==='1') return null;
      return {...c.audio,url};
    } catch { return null; }
  }
  function bannerConfig() {
    const c = cfg(), b = c.banner;
    if (c.enabled !== true || b?.enabled !== true || !/^\/\d+\/[^<>\r\n]{1,300}$/.test(b.adUnitPath || '')) return null;
    const sizes = (b.sizes || [[320,50],[728,90]]).filter(s=>Array.isArray(s) && s.length===2 && Number.isInteger(s[0]) && Number.isInteger(s[1]) && s[0]>=1 && s[0]<=1200 && s[1]>=1 && s[1]<=100);
    return sizes.length ? {...b,sizes} : null;
  }
  async function consent(purpose) {
    const gate = options.consent || cfg().consentGate;
    if (typeof gate !== 'function') return null;
    let timer;
    try {
      const result = await Promise.race([Promise.resolve().then(()=>gate({purpose})),new Promise(resolve=>{timer=global.setTimeout(()=>resolve(null),3000);})]);
      // This implementation does not silently downgrade to limited ads.
      return result?.allowed === true && result.storageAllowed === true ? result : null;
    } catch { return null; }
    finally { global.clearTimeout(timer); }
  }
  function loadScript(url, ready) {
    if (ready()) return Promise.resolve();
    if (loads.has(url)) return loads.get(url);
    const promise = new Promise((resolve,reject)=>{
      const el = doc.createElement('script');
      if(global.PMP_APP?.nonce)el.nonce=global.PMP_APP.nonce;
      let settled = false;
      const end = error => {
        if (settled) return; settled = true; global.clearTimeout(timer);
        el.onload = el.onerror = null;
        if (error) { el.remove(); loads.delete(url); reject(error); } else resolve();
      };
      const timer = global.setTimeout(()=>end(new Error('Advertising service timed out')),10000);
      el.async = true; el.src = url; el.crossOrigin = 'anonymous';
      el.onload = () => end(ready() ? null : new Error('Advertising service unavailable'));
      el.onerror = () => end(new Error('Advertising service unavailable'));
      doc.head.appendChild(el);
    });
    loads.set(url,promise); return promise;
  }
  function ensureHosts() {
    if (host?.isConnected) return;
    host = doc.createElement('section'); host.id = 'pmp-ad-break'; host.className = 'pmp-ad-break'; host.hidden = true; host.setAttribute('aria-label','Advertisement');
    status = doc.createElement('span'); status.className='pmp-ad-status'; status.setAttribute('role','status'); status.setAttribute('aria-live','polite');
    progress = doc.createElement('span'); progress.className='pmp-ad-progress'; progress.setAttribute('aria-live','off');
    pauseButton = doc.createElement('button'); pauseButton.type='button'; pauseButton.textContent='Pause ad'; pauseButton.onclick=toggle;
    skipButton = doc.createElement('button'); skipButton.type='button'; skipButton.textContent='Skip ad'; skipButton.hidden=true; skipButton.onclick=skip;
    adContainer = doc.createElement('div'); adContainer.className='pmp-ima-container'; adContainer.id='pmp-ima-container';
    host.append(status,progress,pauseButton,skipButton,adContainer); doc.body.appendChild(host);
  }
  function destroyEngine() {
    try { manager?.destroy(); } catch { /* SDK already ended. */ }
    try { loader?.destroy(); } catch { /* SDK already ended. */ }
    try { display?.destroy(); } catch { /* SDK already ended. */ }
    if (audio && volumeListener) audio.removeEventListener('volumechange',volumeListener);
    manager=null; loader=null; display=null; initialized=false; consentAudio=null; volumeListener=null;
  }
  function createEngine(element) {
    if (loader && audio === element) return;
    destroyEngine(); audio = element; ensureHosts();
    const ima = global.google.ima;
    display = new ima.AdDisplayContainer(adContainer,audio);
    loader = new ima.AdsLoader(display);
    loader.addEventListener(ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,onLoaded,false);
    loader.addEventListener(ima.AdErrorEvent.Type.AD_ERROR,event=>{
      const context = event.getUserRequestContext?.();
      if (op && context?.id === op.id) finish(op,'ad-unavailable');
    },false);
    volumeListener = () => setVolume(effectiveVolume(audio));
    audio.addEventListener('volumechange',volumeListener);
  }
  function armWatchdog(current,ms) {
    global.clearTimeout(current.timer);
    if (current.playIntent) current.timer=global.setTimeout(()=>finish(current,'ad-timeout'),ms);
  }
  function finish(current,reason,forceStop=false) {
    if (!current || op !== current || current.done) return;
    current.done=true; global.clearTimeout(current.timer);
    current.signal?.removeEventListener('abort',current.abort);
    op=null;
    try { manager?.destroy(); } catch { /* Finish is intentionally idempotent. */ }
    manager=null;
    if (host) host.hidden=true;
    if (current.started) tracks=0;
    const result={allowNext:!forceStop && current.playIntent && !current.signal?.aborted,status:reason};
    state(loader ? 'ready' : 'unavailable'); emit('pmp:ads-result',result); current.resolve(result);
  }
  function updateControls(event) {
    if (!op || !manager) return;
    let ad=event?.getAd?.(); if (ad) op.ad=ad; else ad=op.ad;
    const data=event?.getAdData?.();
    const remaining = manager.getRemainingTime?.();
    progress.textContent = Number.isFinite(remaining) && remaining>=0 ? `${Math.ceil(remaining)}s remaining` : '';
    const offset=ad?.getSkipTimeOffset?.();
    const canSkip=manager.getAdSkippableState?.()===true;
    skipButton.hidden=!(canSkip || (Number.isFinite(offset) && offset>=0));
    skipButton.disabled=!canSkip;
    skipButton.textContent=canSkip ? 'Skip ad' : Number.isFinite(data?.currentTime) && Number.isFinite(offset) ? `Skip in ${Math.max(0,Math.ceil(offset-data.currentTime))}s` : 'Skip not yet available';
    pauseButton.textContent=op.playIntent ? 'Pause ad' : 'Resume ad';
  }
  function onLoaded(event) {
    const current=op, context=event.getUserRequestContext?.();
    if (!current || context?.id!==current.id || current.epoch!==epoch) {
      try { event.getAdsManager(audio).destroy(); } catch { /* Late response never starts. */ }
      return;
    }
    const ima=global.google.ima, type=ima.AdEvent.Type;
    try {
      const rendering=new ima.AdsRenderingSettings();
      rendering.restoreCustomPlaybackStateOnAdBreakComplete=false;
      manager=event.getAdsManager(audio,rendering);
      const listen=(kind,fn)=>{ if(kind) manager.addEventListener(kind,e=>{if(op===current && !current.done) fn(e);}); };
      listen(ima.AdErrorEvent.Type.AD_ERROR,()=>finish(current,'ad-unavailable'));
      listen(type.CONTENT_PAUSE_REQUESTED,()=>audio.pause());
      listen(type.CONTENT_RESUME_REQUESTED,()=>finish(current,'finished'));
      listen(type.ALL_ADS_COMPLETED,()=>finish(current,'finished'));
      listen(type.LOADED,e=>{
        const ad=e.getAd?.();
        if (!ad?.isLinear?.()) { finish(current,'unsupported-ad'); return; }
        current.ad=ad; updateControls(e);
      });
      listen(type.STARTED,e=>{
        current.started=true; status.textContent='Advertisement';
        state(current.playIntent ? 'playing' : 'paused'); updateControls(e);
        if (!current.playIntent) manager.pause();
        else armWatchdog(current,120000);
      });
      listen(type.AD_PROGRESS,updateControls);
      listen(type.SKIPPABLE_STATE_CHANGED,updateControls);
      listen(type.PAUSED,()=>{if(op===current){current.playIntent=false;global.clearTimeout(current.timer);state('paused');updateControls();}});
      listen(type.RESUMED,()=>{if(op===current){current.playIntent=true;armWatchdog(current,120000);state('playing');updateControls();}});
      manager.setVolume(effectiveVolume(audio));
      current.launch=()=>{
        if(op!==current || current.launched || !current.playIntent) return;
        current.launched=true;
        try { manager.init(640,360); if(op===current) manager.start(); }
        catch { finish(current,'ad-unavailable'); }
      };
      current.launch();
    } catch { finish(current,'ad-unavailable'); }
  }
  async function prepare(element = options.audio) {
    if (preparePromise) return preparePromise;
    const version=epoch;
    preparePromise=(async()=>{
      if (!audioConfig() || !element) { state('unavailable'); return false; }
      const permission=await consent('audio');
      if (version!==epoch) return false;
      if (!permission) { consentAudio=null; state('consent-required'); return false; }
      try {
        await loadScript(IMA_URL,()=>!!global.google?.ima?.AdsLoader);
        if (version!==epoch || !audioConfig()) return false;
        createEngine(element); consentAudio=permission; state(initialized?'ready':'gesture-required'); return true;
      } catch { state('unavailable'); return false; }
    })();
    try { return await preparePromise; } finally { if(version===epoch) preparePromise=null; }
  }
  function userGesture(element=options.audio) {
    if (!element || element!==audio || !loader || !consentAudio || !audioConfig()) {
      void prepare(element); return false;
    }
    try { if (!initialized) { display.initialize(); initialized=true; state('ready'); } return true; }
    catch { state('gesture-required'); return false; }
  }
  function beforeNext(args={}) {
    if (op) return op.promise;
    const element=args.audio || audio || options.audio;
    const playIntent=args.playIntent !== undefined ? args.playIntent===true : !!element && (!element.paused || element.ended);
    const quick=reason=>Promise.resolve({allowNext:playIntent && !args.signal?.aborted,status:reason});
    const config=audioConfig();
    if (!config || !element) return quick('unconfigured');
    if (args.signal?.aborted || !playIntent) return quick('paused');
    if (effectiveVolume(element)===0) return quick('muted');
    if (!['ended','next'].includes(args.reason || 'ended')) return quick('not-a-boundary');
    tracks++;
    if (tracks < clamp(config.minTracksBetweenAds,1,100,3)) return quick('frequency');
    const current={id:++serial,epoch,audio:element,playIntent,signal:args.signal,done:false,started:false,timer:null};
    current.promise=new Promise(resolve=>{current.resolve=resolve;});
    op=current;
    current.abort=()=>finish(current,'cancelled',true);
    current.signal?.addEventListener('abort',current.abort,{once:true});
    state('checking');
    void (async()=>{
      const permission=await consent('audio');
      if(op!==current) return;
      if (!permission || current.epoch!==epoch) { consentAudio=null; finish(current,'consent-required'); state('consent-required'); return; }
      if (!initialized || audio!==element || !loader) { void prepare(element); finish(current,'gesture-required'); return; }
      if (!current.playIntent) { finish(current,'paused'); return; }
      consentAudio=permission; ensureHosts(); host.hidden=false;
      status.textContent='Connecting to advertisement…'; progress.textContent=''; skipButton.hidden=true; pauseButton.textContent='Pause ad';
      element.pause();
      const request=new global.google.ima.AdsRequest(), url=new URL(config.url.href);
      url.searchParams.set('ad_type','audio'); url.searchParams.set('env','instream'); url.searchParams.set('vpmute','0');
      url.searchParams.set('npa',permission.personalized===true ? '0' : '1');
      if(permission.restrictDataProcessing===true) url.searchParams.set('rdp','1');
      for(const key of ['gdpr','gdpr_consent','gpp','gpp_sid','us_privacy']) {
        const value=permission.requestParams?.[key];
        if(typeof value==='string' && value.length<=10000) url.searchParams.set(key,value);
      }
      request.adTagUrl=url.href; request.linearAdSlotWidth=640; request.linearAdSlotHeight=360;
      request.nonLinearAdSlotWidth=640; request.nonLinearAdSlotHeight=90;
      request.setAdWillAutoPlay?.(true); request.setAdWillPlayMuted?.(false);
      armWatchdog(current,clamp(config.requestTimeoutMs,2000,20000,10000));
      state('requesting');
      try { loader.requestAds(request,{id:current.id}); } catch { finish(current,'ad-unavailable'); }
    })().catch(()=>finish(current,'ad-unavailable'));
    return current.promise;
  }
  function pause() {
    if (!op) return false;
    op.playIntent=false; global.clearTimeout(op.timer);
    try { manager?.pause(); } catch { finish(op,'ad-unavailable',true); }
    if(op) { state('paused'); updateControls(); } return true;
  }
  function resume() {
    if (!op) return false;
    op.playIntent=true;
    try { if(op.launch && !op.launched) op.launch(); else manager?.resume(); } catch { finish(op,'ad-unavailable'); }
    if(op) { armWatchdog(op,manager?120000:10000); state(manager?'playing':'requesting'); updateControls(); } return true;
  }
  function toggle() { return op ? (op.playIntent ? pause() : resume()) : false; }
  function setVolume(value) { try { manager?.setVolume(clamp(value,0,1,0)); } catch { /* Content volume remains owned by its player. */ } }
  function skip() { try { if(op && manager?.getAdSkippableState?.()===true) { manager.skip(); return true; } } catch { finish(op,'ad-unavailable'); } return false; }
  function cancel(reason='cancelled') { if(op) finish(op,reason,true); }
  function destroyBanner() {
    try {
      if(global.googletag?.apiReady) {
        if(bannerRenderHandler) global.googletag.pubads().removeEventListener('slotRenderEnded',bannerRenderHandler);
        if(bannerSlot) global.googletag.destroySlots([bannerSlot]);
      }
    } catch { /* SDK may already be unloading. */ }
    bannerRenderHandler=null;
    bannerSlot=null; bannerHost?.remove(); bannerHost=null; bannerPromise=null;
  }
  async function mountBanner() {
    if (bannerPromise) return bannerPromise;
    if (bannerSlot) return true;
    const config=bannerConfig(), version=epoch;
    if(!config) return false;
    bannerPromise=(async()=>{
      const permission=await consent('banner');
      if(!permission || version!==epoch) return false;
      try {
        await loadScript(GPT_URL,()=>!!global.googletag?.apiReady);
        if(version!==epoch || !bannerConfig()) return false;
        const tag=global.googletag;
        // Width is checked before requesting; no hidden oversized placement.
        const sizes=config.sizes.filter(s=>s[0]<=Math.max(0,global.innerWidth-32));
        if(!sizes.length) return false;
        bannerHost=doc.createElement('aside'); bannerHost.id='pmp-banner'; bannerHost.className='pmp-banner'; bannerHost.hidden=true; bannerHost.setAttribute('aria-label','Advertisement');
        const label=doc.createElement('span'); label.textContent='Advertisement';
        const slotElement=doc.createElement('div'); slotElement.id='pmp-banner-slot';
        bannerHost.append(label,slotElement); doc.body.appendChild(bannerHost);
        tag.setConfig({disableInitialLoad:true,safeFrame:{forceSafeFrame:true,sandbox:true,allowOverlayExpansion:false,allowPushExpansion:false}});
        const service=tag.pubads();
        service.setPrivacySettings({nonPersonalizedAds:permission.personalized!==true,restrictDataProcessing:permission.restrictDataProcessing===true});
        bannerSlot=tag.defineSlot(config.adUnitPath,sizes,slotElement.id);
        if(!bannerSlot) { destroyBanner(); return false; }
        bannerSlot.addService(service);
        const ownedSlot=bannerSlot;
        bannerRenderHandler=event=>{if(version===epoch && event.slot===ownedSlot && bannerHost) bannerHost.hidden=event.isEmpty===true;};
        service.addEventListener('slotRenderEnded',bannerRenderHandler);
        tag.enableServices(); tag.display(slotElement.id);
        if(version===epoch) service.refresh([ownedSlot]);
        return true;
      } catch { destroyBanner(); return false; }
    })();
    try { return await bannerPromise; } finally { if(version===epoch) bannerPromise=null; }
  }
  async function configure(next={}) {
    epoch++; cancel('configuration-changed'); destroyEngine(); destroyBanner(); preparePromise=null;
    options={...options,...next};
    const results=await Promise.all([prepare(options.audio),mountBanner()]);
    return {audioReady:results[0],bannerReady:results[1]};
  }
  function consentChanged() { return configure(options); }
  global.addEventListener('pagehide',()=>{epoch++;cancel('page-hidden');destroyEngine();destroyBanner();});
  global.PMPAds=Object.freeze({configure,prepare,mountBanner,userGesture,beforeNext,pause,resume,toggle,setVolume,skip,cancel,consentChanged,getState,get active(){return !!op;}});
})(window);
