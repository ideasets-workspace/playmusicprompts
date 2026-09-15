/* Browser contract only: no engine key, identity token or upstream delivery URL. */
(async () => {
  'use strict';
  const scriptNonce=document.currentScript?.nonce||'';
  // pagehide tears down consent and advertising. A restored document must obtain
  // a fresh session/configuration and reinstall its listeners before continuing.
  window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
  const isRoom=location.pathname.endsWith('/player-three.html')||location.pathname.startsWith('/s/');
  const APP=window.PMP_APP={user:null,csrf:null,config:{ads:{enabled:false},identity:{available:false}},jobs:[],saved:[],playlists:[],schemaAvailable:false};
  APP.nonce=scriptNonce;
  const load=(src,module=false)=>new Promise((resolve,reject)=>{const script=document.createElement('script');if(scriptNonce)script.nonce=scriptNonce;if(module)script.type='module';script.src=src;script.onload=resolve;script.onerror=()=>reject(Error('A page component could not be loaded.'));document.head.append(script);});
  APP.notify=message=>{const node=document.querySelector('#toast');if(node){node.textContent=message;node.hidden=false;clearTimeout(APP.noticeTimer);APP.noticeTimer=setTimeout(()=>node.hidden=true,8500);}else{const p=document.createElement('p');p.className='connection-notice';p.setAttribute('role','status');p.textContent=message;document.body.prepend(p);}};
  APP.request=async(path,{method='GET',body,signal,headers={}}={})=>{
    const r=await fetch(path,{method,credentials:'same-origin',headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),...(method!=='GET'?{'X-CSRF-Token':APP.csrf||''}:{}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)}),signal});
    let data;try{data=await r.json();}catch{throw Error('The service returned an unreadable response. Please try again.');}
    if(!r.ok){const issues=data.error?.issues;const detail=issues?.length&&window.PMPControls?.formatIssues?.(issues);const e=Error(detail||data.error?.message||'The request could not be completed.');e.code=data.error?.code;e.status=r.status;e.issues=issues;e.contentSafety=data.error?.contentSafety;e.quota=data.error?.quota;throw e;}return data;
  };
  APP.refreshJobs=async()=>{APP.jobs=(await APP.request('/api/jobs')).jobs;window.dispatchEvent(new CustomEvent('pmp:jobs'));return APP.jobs;};
  APP.readReceipt=key=>{
    const raw=sessionStorage.getItem(key);if(!raw)return null;
    let pending;try{pending=JSON.parse(raw);}catch{throw Error('A previous request receipt could not be read. Keep this tab for recovery and use a new tab for another creation.');}
    if(!pending||typeof pending.id!=='string'||typeof pending.payload!=='string')throw Error('A previous request receipt needs review before another request can be sent.');
    if(pending.authScope===APP.authScope)return pending;
    // Ownership markers are not credentials. An old receipt is retained for
    // inspection, but never replayed as a new guest or another signed-in user.
    sessionStorage.setItem(key+'.archived.'+crypto.randomUUID(),raw);sessionStorage.removeItem(key);
    APP.notify('A request from your previous session was preserved for review. It has not been repeated.');return null;
  };
  APP.refreshCatalog=async()=>{
    const {tracks}=await APP.request('/api/catalog');const mine=new Set(APP.jobs.flatMap(j=>j.tracks.map(t=>t.id)));
    APP.catalog=tracks.map(t=>({...t,created:mine.has(t.id)}));
    window.PMP_CONFIG.catalog=APP.catalog;
    if(window.PMP){const P=window.PMP;P.state.songs=P.state.songs.filter(t=>t.local);for(const t of APP.catalog)P.state.songs.push(t);P.pageHooks.forEach(fn=>fn());}
    return APP.catalog;
  };
  APP.enterRoom=async trackId=>{
    const value=await APP.request('/api/player-navigation',{method:'POST',body:{trackId}});
    sessionStorage.setItem('pmp.website.room-navigation',JSON.stringify({handle:value.handle,authScope:APP.authScope}));
    location.assign('/player-three.html');
  };
  APP.resolveRoom=async()=>{
    const key='pmp.website.room-navigation',raw=sessionStorage.getItem(key);if(!raw)return null;
    let pending;try{pending=JSON.parse(raw);}catch{sessionStorage.removeItem(key);throw Error('Choose your song again to open the listening room.');}
    if(pending.authScope!==APP.authScope){sessionStorage.removeItem(key);return null;}
    try{const result=await APP.request('/api/player-navigation/resolve',{method:'POST',body:{handle:pending.handle}});sessionStorage.removeItem(key);return result.track;}
    catch(error){if(error.status&&error.status<500)sessionStorage.removeItem(key);throw error;}
  };
  APP.shareSong=async trackId=>{
    const result=await APP.request('/api/song-links',{method:'POST',body:{trackId}});
    if(typeof result.path!=='string'||!/^\/s\/[A-Za-z0-9_-]{43}$/.test(result.path))throw Error('The share link could not be verified.');
    return new URL(result.path,location.origin).href;
  };
  APP.signIn=async()=>{
    if(!APP.config.identity.available){APP.notify('Account sign-in is not connected yet. Creating and listening are available without an account.');return;}
    try{const {url}=await APP.request('/api/auth/start',{method:'POST',body:{}});location.assign(url);}catch(e){APP.notify(e.message);}
  };
  APP.download=async id=>{
    if(!APP.user){APP.notify('Sign in to download music. A rewarded ad is also required.');if(APP.config.identity.available)await APP.signIn();return;}
    try{await APP.request(`/api/downloads/${encodeURIComponent(id)}`,{method:'POST',body:{}});}catch(e){APP.notify(e.message);}
  };
  APP.toggleSave=async track=>{
    if(!APP.user){APP.notify('Sign in to save music. Listening and creating stay open to everyone.');return;}
    if(!track?.owned){APP.notify('Only songs in the service catalogue can be saved to your account.');return;}
    try{const r=await APP.request(`/api/favorites/${encodeURIComponent(track.id)}`,{method:'PUT',body:{saved:!APP.saved.some(s=>s.id===track.id)}});APP.saved=r.saved;if(window.PMP){window.PMP.state.saved=r.saved;window.PMP.syncSaved();window.PMP.renderLibrary();}window.dispatchEvent(new CustomEvent('pmp:saved'));APP.notify('Your library is updated.');}catch(e){APP.notify(e.message);}
  };
  const terminal=new Set(['ready','partial','failed','uncertain','ingest_failed']);
  APP.wait=async(id,signal)=>{
    APP.waiters=(APP.waiters||0)+1;try{for(;;){if(signal?.aborted)throw new DOMException('You stopped waiting. Your creation continues and is saved here.','AbortError');
      const {job}=await APP.request(`/api/jobs/${encodeURIComponent(id)}`,{signal});APP.jobs=[job,...APP.jobs.filter(j=>j.id!==id)];window.dispatchEvent(new CustomEvent('pmp:jobs'));
      const primary=job.creation?job.tracks.find(track=>track.id===job.creation.primaryTrackId):job.tracks[0];
      if(primary&&(job.creation||terminal.has(job.status))){try{await APP.refreshCatalog();}catch{APP.notify('Your song is ready. The catalogue could not refresh; you can play it from Creation activity.');}return {...primary,created:true,preparedTracks:job.tracks.filter(track=>track.id!==primary.id)};}
      if(terminal.has(job.status)||job.creation&&terminal.has(job.creation.primaryStatus))throw Error(job.error?.message||'Your first music direction needs attention. Any other completed songs remain available in Creation activity. No generation has been repeated.');
      await new Promise((resolve,reject)=>{const timer=setTimeout(done,3500);function done(){signal?.removeEventListener('abort',abort);resolve();}function abort(){clearTimeout(timer);signal?.removeEventListener('abort',abort);reject(new DOMException('You stopped waiting. Your creation continues and is saved here.','AbortError'));}signal?.addEventListener('abort',abort,{once:true});});
    }}finally{APP.waiters--;}
  };
  APP.resume=async id=>{try{APP.notify('Following your existing creation…');const track=await APP.wait(id);if(window.PMP){window.PMP.queueCreation(track);await window.PMP.playTrack(track.id);}else await APP.enterRoom(track.id);}catch(e){APP.notify(e.message);}};
  APP.generate=async(payload,{signal,onAdmitted}={})=>{
    if(!APP.schemaAvailable)throw Error('The music service is not connected. Your brief stays here.');
    if(payload.dry_run===true||payload.capabilities===true)return APP.request('/api/previews',{method:'POST',body:payload,headers:{'Idempotency-Key':crypto.randomUUID()},signal});
    const active=APP.jobs.find(j=>['queued','submitting','pending','ingesting'].includes(j.status));
    if(active)throw Error('Your previous creation is still running. Open Creations to follow it.');
    const storageKey='pmp.website.pending-admission',pending=APP.readReceipt(storageKey);
    const text=JSON.stringify(payload);if(pending&&pending.payload!==text)throw Error('A previous submission needs to be reconciled. Reload this page before creating another song.');
    const idem=pending?.id||crypto.randomUUID();sessionStorage.setItem(storageKey,JSON.stringify({id:idem,payload:text,authScope:APP.authScope}));
    let job;try{({job}=await APP.request('/api/creations',{method:'POST',body:payload,headers:{'Idempotency-Key':idem},signal}));}catch(e){if(e.status&&e.status<500)sessionStorage.removeItem(storageKey);throw e;}
    sessionStorage.removeItem(storageKey);APP.jobs=[job,...APP.jobs.filter(j=>j.id!==job.id)];onAdmitted?.(job);window.dispatchEvent(new CustomEvent('pmp:jobs'));
    return APP.wait(job.id,signal);
  };
  try{
    const session=await APP.request('/api/session');Object.assign(APP,{user:session.user,csrf:session.csrf,authScope:session.authScope,config:session.config});
    APP.readReceipt('pmp.website.pending-admission');APP.readReceipt('pmp.website.pending-enhancement');
    window.PMP_CONFIG={catalog:[],adapters:{generate:APP.generate,provider:async()=>{await APP.signIn();return{redirected:APP.config.identity.available};}},links:{}};
    await APP.refreshJobs();
    const results=await Promise.allSettled([APP.refreshCatalog(),APP.request('/api/controls-schema'),...(APP.user?[APP.request('/api/favorites'),APP.request('/api/playlists')]:[])]);
    if(results[1].status==='fulfilled'){window.PMP_SCHEMA=results[1].value;APP.schemaAvailable=true;}
    // Owner rule 2026-09-15: the schema is served from the server's own cache, never fetched from the engine at page
    // load. If it is genuinely absent (first start with the engine unreachable) the page still opens for listening;
    // the wording is the site's, never the engine's, and it is shown once, without blocking anything.
    else {await load('schema.js');APP.connectionError='Creation controls could not be loaded right now. Listening works; creating returns when the music service is reachable.';}
    if(APP.user){if(results[2].status==='fulfilled')APP.saved=results[2].value.saved;if(results[3].status==='fulfilled')APP.playlists=results[3].value.playlists;}

    // Keep the complete request contract. Preview/discovery modes have separate
    // non-generation responses; an explicit async choice is preserved.
    await load('request-contract.js');
    APP.getDraftRequest=()=>{
      if(window.PMP&&window.PMPControls){window.PMP.saveDraft();return window.PMPControls.payload(window.PMP.state.draft);}
      let draft;try{draft=JSON.parse(localStorage.getItem('pmp.website.draft'));}catch{throw Error('Your saved music brief could not be read. Open Create to review it.');}
      return window.PMPRequestContract.create(window.PMP_SCHEMA).payload(draft);
    };
    await load('result-presentation.js',true);
    await load('platform-input.js');await load('consent.js');await load('advertising.js');
    window.PMPConsent.start(APP.config.consent,{nonce:scriptNonce});window.PMPAds.configure({consent:request=>window.PMPConsent.getDecision(request)});window.PMPConsent.subscribe(()=>window.PMPAds.consentChanged());
    if(isRoom){await load('listening-client.js');await load('listening-room-client.js');await load('player-three.js',true);}
    else{for(const file of ['data.js','app.js','player.js','creation-followups.js','collections.js','controls.js','lyrics-composer.js','request-preview.js','worker-dialog.js','workflow-client.js','experience.js','connected.js','account-client.js','service-player.js','listening-client.js','creation-continuation.js'])await load(file);}
    if(APP.connectionError)APP.notify(APP.connectionError);
    // Restore a missed admission response using the same durable idempotency key, never a new request.
    const saved=sessionStorage.getItem('pmp.website.pending-admission');if(saved){const p=JSON.parse(saved);const found=APP.jobs.find(j=>j.idempotencyKey===p.id);if(found)sessionStorage.removeItem('pmp.website.pending-admission');}
    window.dispatchEvent(new CustomEvent('pmp:ready'));
    const requestedJob=new URLSearchParams(location.search).get('job');
    if(!isRoom&&requestedJob&&/^[a-zA-Z0-9_-]{8,160}$/.test(requestedJob)){
      try{const {job}=await APP.request('/api/jobs/'+encodeURIComponent(requestedJob));APP.jobs=[job,...APP.jobs.filter(item=>item.id!==job.id)];window.dispatchEvent(new CustomEvent('pmp:jobs'));await window.PMPWorkflow.openCreate(job.id);}catch(error){APP.notify(error.message);}
    }
    // Connection status is derived by the server from its own cache and history (no engine call); it never blocks
    // access to owned music and never shows engine wording at page load. Unavailability is learned at Create time.
    APP.request('/api/connection').then(result=>{APP.connection=result;APP.generationAvailable=result.generationAvailable;window.PMP?.refreshCreateButton?.();window.dispatchEvent(new CustomEvent('pmp:connection'));}).catch(()=>{APP.connection={available:null};});
    const remote=document.createElement('button');remote.type='button';remote.className='remote-mode-toggle';remote.title='Arrow keys move focus. OK selects. Back closes the current panel.';
    const storedMode=localStorage.getItem('pmp.website.inputMode');if(storedMode==='tv')window.PMPPlatform.setMode('tv');
    const showMode=()=>{const enabled=window.PMPPlatform.getState().enabled;remote.textContent=`TV controls: ${enabled?'on':'off'}`;remote.setAttribute('aria-pressed',String(enabled));remote.setAttribute('aria-label',remote.textContent);};
    remote.onclick=()=>{const next=window.PMPPlatform.getState().enabled?'desktop':'tv';window.PMPPlatform.setMode(next);localStorage.setItem('pmp.website.inputMode',next);showMode();};showMode();document.querySelector('header')?.append(remote);
    if(APP.config.consent?.enabled){const privacy=document.createElement('button');privacy.type='button';privacy.className='privacy-settings-toggle';privacy.textContent='Privacy settings';privacy.onclick=()=>{if(!window.PMPConsent.openPreferences())APP.notify('Use the privacy controls provided by the consent message.');};document.querySelector('header')?.append(privacy);}
    const refreshTimer=setInterval(async()=>{if(APP.waiters||APP.refreshing||document.visibilityState!=='visible'||!APP.jobs.some(j=>!terminal.has(j.status)||j.summary?.originality?.state==='pending'||j.creation?.children.some(child=>child.job.summary?.originality?.state==='pending')))return;APP.refreshing=true;try{await APP.refreshJobs();await APP.refreshCatalog();}catch{/* Keep existing state and the explicit refresh action. */}finally{APP.refreshing=false;}},10000);
    window.addEventListener('pagehide',()=>clearInterval(refreshTimer),{once:true});
  }catch(e){APP.notify(e.message||'The application could not connect. Please reload.');const btn=document.querySelector('#create-button');if(btn)btn.disabled=true;}
})();
