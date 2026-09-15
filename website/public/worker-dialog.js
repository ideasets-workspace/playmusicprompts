(() => {
'use strict';
const P=window.PMP;
if(!P)return;
// Root owns durable work, safe request/result projection, and external reopen UI.
// update() never opens a dialog. Apply/Keep/Undo close only after their callback
// succeeds; Play stays open. onReopen is retained for the owner, never auto-fired.
const states=new Set(['pending','active','complete','failed','unavailable']);
const finished=new Set(['ready','complete','completed','succeeded','partial']);
const statusLabels={admitting:'Sending your request',accepted:'Request accepted',queued:'Waiting to begin',submitting:'Sending your request',running:'Working on your request',processing:'Working on your request',enhancing:'Enhancing your description',generating:'Creating your music',ingesting:'Saving your music',ready:'Ready',complete:'Ready',completed:'Ready',succeeded:'Ready',partial:'Some results are ready',failed:'Could not finish',uncertain:'Status needs checking',ingest_failed:'Music needs saving',pending:'Waiting for an update'};
const stepLabels={pending:'Waiting',active:'In progress',complete:'Complete',failed:'Needs attention',unavailable:'Not available'};
let active=null;

function element(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el;}
function setText(el,text){const value=String(text??'');if(el.textContent!==value)el.textContent=value;}
function messageOf(error){return typeof error==='string'?error:typeof error?.message==='string'?error.message:'This request needs attention. Check its latest status before trying again.';}
function owns(s){return active===s&&s.modal.open&&s.modal.contains(s.root);}
function dismiss(s,reason,closeNative=false){
  if(active!==s)return false;
  const owned=owns(s);active=null;
  s.observer?.disconnect();
  s.modal.removeEventListener('close',s.onNativeClose);
  s.modal.removeEventListener('cancel',s.onCancel);
  s.modal.classList.remove('pmp-worker-dialog');
  if(closeNative&&owned)P.closeDialog();
  if(reason!=='replaced'&&!s.modal.open&&s.opener?.isConnected)s.opener.focus({preventScroll:true});
  // Closing changes presentation only. No cancellation request is made here.
  s.model.onClose?.({id:s.model.id,kind:s.model.kind,status:s.model.status,reason});
  return true;
}
function stillOpen(s){if(owns(s))return true;if(active===s)dismiss(s,s.modal.open?'replaced':'close');return false;}
function close(){return active?dismiss(active,'background',true):false;}

function reconcile(parent,records,cache,create,paint){
  const keep=new Set();
  records.forEach((record,index)=>{
    // Duplicate or absent upstream IDs must not collapse reported steps/tracks.
    const key=String(record?.id??index)+'\u0000'+index;keep.add(key);
    let row=cache.get(key);if(!row){row=create(record,index);cache.set(key,row);}
    paint(row,record,index);
    if(parent.children[index]!==row.el)parent.insertBefore(row.el,parent.children[index]||null);
  });
  for(const [key,row] of cache)if(!keep.has(key)){row.el.remove();cache.delete(key);}
}
function canCompare(m){return m.kind==='enhance'&&typeof m.result?.original==='string'&&typeof m.result?.enhanced==='string';}
function hasRevision(m){return canCompare(m)&&m.result.enhanced.trim().length>0&&m.result.changed!==false&&m.result.enhanced!==m.result.original;}
function ready(m){return finished.has(m.status);}
function setBusy(s,value){s.busy=value;for(const b of [s.apply,s.original,s.undo,s.retry,...[...s.trackRows.values()].map(r=>r.button)])b.disabled=value;}
async function action(s,type,track){
  if(!stillOpen(s)||s.busy)return;
  const m=s.model;
  if(type==='apply'&&(!ready(m)||!hasRevision(m)||typeof m.onApply!=='function'))return;
  if(type==='play'&&(typeof m.onPlay!=='function'||!m.result?.tracks?.some(item=>item.id===track?.id)))return;
  if(type==='undo'&&typeof m.onUndo!=='function')return;
  if(type==='retry'&&typeof m.onRetry!=='function')return;
  setBusy(s,true);s.actionError.hidden=true;
  try{
    if(type==='apply')await m.onApply(m.result.enhanced,m);
    else if(type==='original')await m.onKeepOriginal?.(m);
    else if(type==='undo')await m.onUndo(m);
    else if(type==='retry')await m.onRetry(m);
    else await m.onPlay(track,m);
    if(!stillOpen(s))return;
    if(type==='apply'||type==='original'||type==='undo')dismiss(s,type==='original'?'original':'close',true);
  }catch(error){if(stillOpen(s)){setText(s.actionError,messageOf(error));s.actionError.hidden=false;}}
  finally{if(owns(s)){setBusy(s,false);paint(s);}}
}

function paint(s){
  const m=s.model,done=ready(m),bad=['failed','uncertain','ingest_failed'].includes(m.status);
  const focused=document.activeElement,hadFocus=s.modal.contains(focused);
  s.root.dataset.tone=bad?'attention':done?'ready':'working';
  const title=m.title||(done?(m.kind==='enhance'?'Your description is ready to review.':'Your music is ready to explore.'):bad?'Your request needs attention.':m.kind==='enhance'?'A little more detail. Still your idea.':'Your words. A new sound.');
  setText(s.title,title);setText(s.badge,statusLabels[m.status]||'Status update');
  const message=m.message||'Waiting for a status update.';setText(s.message,message);
  setText(s.announcement,(statusLabels[m.status]||'Status update')+'. '+message);
  const connection=m.reconnecting?'Reconnecting to check the latest status. The last confirmed update is shown below.':m.detached?'This request is running in the background. The last confirmed update is shown below.':'';
  setText(s.connection,connection);s.connection.hidden=!connection;
  const timestamp=m.updatedAt?new Date(m.updatedAt):null;
  s.time.hidden=!timestamp||!Number.isFinite(timestamp.getTime());
  if(!s.time.hidden){s.time.dateTime=timestamp.toISOString();setText(s.time,'Last confirmed '+timestamp.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit',second:'2-digit'}));}
  const steps=Array.isArray(m.steps)?m.steps:[];
  s.noSteps.hidden=steps.length>0;
  reconcile(s.steps,steps,s.stepRows,()=>{
    const el=element('li','worker-step'),marker=element('span','worker-step-marker'),body=element('div','worker-step-copy'),label=element('strong'),state=element('span','worker-step-state'),detail=element('p');
    marker.setAttribute('aria-hidden','true');body.append(label,state,detail);el.append(marker,body);return{el,marker,label,state,detail};
  },(r,step,index)=>{
    const state=states.has(step?.state)?step.state:'unavailable';r.el.dataset.state=state;
    if(state==='active')r.el.setAttribute('aria-current','step');else r.el.removeAttribute('aria-current');
    setText(r.marker,state==='complete'?'✓':state==='failed'?'!':state==='unavailable'?'—':String(index+1).padStart(2,'0'));
    setText(r.label,step?.label||'Request update');setText(r.state,stepLabels[state]);
    setText(r.detail,step?.detail||'');r.detail.hidden=!step?.detail;
  });
  s.error.hidden=!m.error;if(m.error)setText(s.error,window.PMPResultPresentation.failureLines(m.error).join(' ')||messageOf(m.error));
  const detailMarkup=window.PMPResultPresentation.renderCreation(m);
  if(s.detailsMarkup!==detailMarkup){const wasOpen=s.details.querySelector('details')?.open;s.details.innerHTML=detailMarkup;if(wasOpen&&s.details.firstElementChild)s.details.firstElementChild.open=true;s.detailsMarkup=detailMarkup;}
  s.details.hidden=!detailMarkup;
  const compare=canCompare(m);s.compare.hidden=!compare;
  if(compare){setText(s.originalText,m.result.original);setText(s.enhancedText,m.result.enhanced);}
  s.unchanged.hidden=!(done&&compare&&!hasRevision(m));
  const original=typeof m.result?.original==='string'?m.result.original:typeof m.originalRequest?.prompt==='string'?m.originalRequest.prompt:typeof m.request?.prompt==='string'?m.request.prompt:null;
  s.source.hidden=compare||original===null;if(!s.source.hidden)setText(s.sourceText,original);
  s.apply.hidden=!(done&&hasRevision(m)&&typeof m.onApply==='function');
  s.original.hidden=!(done&&m.kind==='enhance');
  s.undo.hidden=typeof m.onUndo!=='function';
  s.retry.hidden=typeof m.onRetry!=='function';
  const tracks=Array.isArray(m.result?.tracks)?m.result.tracks:[];
  s.tracksSection.hidden=tracks.length===0;
  reconcile(s.tracks,tracks,s.trackRows,()=>{
    const el=element('li','worker-track'),number=element('span','worker-track-number'),copy=element('div'),label=element('strong'),detail=element('span'),button=element('button','secondary','Play');
    number.setAttribute('aria-hidden','true');button.type='button';copy.append(label,detail);el.append(number,copy,button);return{el,number,label,detail,button};
  },(r,track,index)=>{
    const title=track?.title||'Generated track';setText(r.number,String(index+1).padStart(2,'0'));setText(r.label,title);setText(r.detail,track?.description||'');r.detail.hidden=!track?.description;
    r.button.setAttribute('aria-label','Play '+String(title));r.button.hidden=typeof m.onPlay!=='function';r.button.disabled=s.busy;
    r.button.onclick=()=>action(s,'play',s.model.result.tracks[index]);
  });
  const hasRequest=m.request!==undefined&&m.request!==null;s.request.hidden=!hasRequest;
  if(hasRequest){try{setText(s.requestText,JSON.stringify(m.creation?.children?.map(child=>({direction:window.PMPResultPresentation.directionLabel(child.role),request:child.job.workflow.request}))||m.request,null,2));}catch{setText(s.requestText,'The selected request could not be displayed.');}}
  setText(s.background,done||bad?'Done':'Continue browsing');
  setText(s.closeNote,done?'Saved in your activity.':bad?'Your brief is saved. Closing this window does not submit another request.':'We’ll keep working. You can return to this creation from your activity.');
  for(const b of [s.apply,s.original,s.undo,s.retry])b.disabled=s.busy;
  // All ordinary updates keep the same elements. If a focused action disappears,
  // put focus on the persistent close control instead of losing it to the page.
  if(hadFocus){
    if(!focused.isConnected||focused.closest('[hidden]'))s.background.focus({preventScroll:true});
    else if(document.activeElement!==focused)focused.focus({preventScroll:true});
  }
}

function open(model){
  if(!model||!['enhance','create'].includes(model.kind))throw new TypeError('A worker dialog needs an enhance or create request.');
  const previous=active,opener=previous?.opener||document.activeElement;
  if(previous)dismiss(previous,'replaced');
  const enhance=model.kind==='enhance';
  P.dialog(enhance?'Prompt studio · Enhance':'Your creation · PlayMusicPrompts',`
    <section id="worker-dialog" class="worker-dialog" aria-label="Request progress">
      <div class="worker-hero"><div class="worker-emblem" aria-hidden="true">${P.icon(enhance?'spark':'wave')}</div><div class="worker-hero-copy"><span class="worker-badge"></span><h3 class="worker-title" tabindex="-1"></h3><p class="worker-message"></p><time class="worker-time" hidden></time></div></div>
      <p class="sr-only worker-announcement" role="status" aria-live="polite" aria-atomic="true"></p>
      <p class="worker-connection notice" hidden></p>
      <section class="worker-tracks-section worker-section" hidden><div class="worker-section-heading"><h4>Your music</h4></div><ul class="worker-tracks"></ul></section>
      <div class="worker-section worker-progress"><div class="worker-section-heading"><h4>From request to result</h4><span>Live status</span></div><ol class="worker-steps"></ol><p class="worker-no-steps">No processing steps have been reported yet.</p></div>
      <p class="worker-error notice" role="alert" hidden></p>
      <details class="worker-source worker-section" hidden><summary id="worker-source-heading">Your music brief</summary><p class="worker-source-text worker-prose" tabindex="0" aria-labelledby="worker-source-heading"></p></details>
      <section class="worker-compare worker-section" aria-label="Compare descriptions" hidden><div class="worker-section-heading"><h4>Your idea, before and after</h4></div><div class="worker-comparison"><article><h5 id="worker-original-heading">Your original</h5><p class="worker-original-text worker-prose" tabindex="0" aria-labelledby="worker-original-heading"></p></article><article class="worker-revision"><h5 id="worker-enhanced-heading">Enhanced version</h5><p class="worker-enhanced-text worker-prose" tabindex="0" aria-labelledby="worker-enhanced-heading"></p></article></div><p class="worker-preserved">Your original stays available. Nothing changes until you choose a version.</p><p class="worker-unchanged notice" hidden>Your description was kept as written.</p></section>
      <section class="worker-details worker-section" hidden aria-label="Creation details"></section>
      <details class="worker-request"><summary>Request settings <span>Your exact selections</span></summary><pre class="worker-request-text" tabindex="0" aria-label="Selected request JSON"></pre></details>
      <p class="worker-action-error notice" role="alert" hidden></p><p class="worker-close-note"></p>
    </section>`,
    '<button type="button" class="text-button worker-background">Continue browsing</button><button type="button" class="secondary worker-undo" hidden>Undo enhancement</button><button type="button" class="secondary worker-keep-original" hidden>Keep my original</button><button type="button" class="primary worker-retry" hidden>Check delivery</button><button type="button" class="primary worker-apply" hidden>Use this version</button>',true,
    '');
  const modal=document.querySelector('#modal'),root=document.querySelector('#worker-dialog');
  const find=selector=>modal.querySelector(selector);
  const s={modal,root,model:{...model},opener,busy:false,stepRows:new Map(),trackRows:new Map(),details:find('.worker-details')};
  for(const [key,cls] of Object.entries({title:'title',badge:'badge',message:'message',announcement:'announcement',connection:'connection',time:'time',steps:'steps',noSteps:'no-steps',error:'error',source:'source',sourceText:'source-text',compare:'compare',originalText:'original-text',enhancedText:'enhanced-text',unchanged:'unchanged',tracksSection:'tracks-section',tracks:'tracks',request:'request',requestText:'request-text',actionError:'action-error',closeNote:'close-note',background:'background',apply:'apply',original:'keep-original',undo:'undo',retry:'retry'}))s[key]=find('.worker-'+cls);
  active=s;modal.classList.add('pmp-worker-dialog');
  s.onNativeClose=()=>{if(!modal.open)dismiss(s,'close');};
  s.onCancel=event=>{if(owns(s)){event.preventDefault();dismiss(s,'close',true);}};
  modal.addEventListener('close',s.onNativeClose);modal.addEventListener('cancel',s.onCancel);
  s.observer=new MutationObserver(()=>{if(active===s&&!modal.contains(root))dismiss(s,'replaced');});
  s.observer.observe(document.querySelector('#modal-content'),{childList:true,subtree:true});
  s.background.onclick=()=>dismiss(s,ready(s.model)?'close':'background',true);
  s.apply.onclick=()=>action(s,'apply');s.original.onclick=()=>action(s,'original');s.undo.onclick=()=>action(s,'undo');
  s.retry.onclick=()=>action(s,'retry');
  paint(s);s.title.focus({preventScroll:true});
  return true;
}
function update(model){
  const s=active;if(!s||!stillOpen(s))return false;
  if(model?.kind!==undefined&&model.kind!==s.model.kind)return false;
  if(model?.id!==undefined&&s.model.id!==undefined&&model.id!==s.model.id)return false;
  s.model={...s.model,...model};paint(s);return true;
}
window.PMPWorkerDialog={open,update,close,isOpen:()=>active?stillOpen(active):false};
})();
