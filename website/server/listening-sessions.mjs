import {randomUUID} from 'node:crypto';
import {problem,stable,sha} from './store.mjs';
import {validateRequest} from './validation.mjs';
import {planAdaptiveRequest,decideRefill,recalibratePrepared,ADAPTIVE_POLICY} from './adaptive-policy.mjs';
import {SIGNED_IN_DAILY_LIMIT} from './admission-limits.mjs';

const terminal=new Set(['ready','partial','failed','uncertain','ingest_failed']);
const idPattern=/^[a-zA-Z0-9_-]{8,160}$/;
const trackIdPattern=/^[a-f0-9]{64}$/;
const requestIdentity=request=>stable({...request,...(request.async===undefined?{async:true}:{})});
export function createListeningSessions({store,jobs,capabilities,config,deliveryReady=async()=>{}}){
  const locks=new Map();
  function serial(owner,work){const prior=locks.get(owner)||Promise.resolve();const task=prior.catch(()=>{}).then(work);locks.set(owner,task);return task.finally(()=>{if(locks.get(owner)===task)locks.delete(owner);});}
  store.db.exec(`CREATE TABLE IF NOT EXISTS listening_sessions(id TEXT PRIMARY KEY,owner TEXT NOT NULL,idem TEXT NOT NULL,fingerprint TEXT NOT NULL,data TEXT NOT NULL,created INTEGER NOT NULL,updated INTEGER NOT NULL,UNIQUE(owner,idem));
    CREATE TABLE IF NOT EXISTS listening_events(session_id TEXT NOT NULL,event_id TEXT NOT NULL,fingerprint TEXT NOT NULL,PRIMARY KEY(session_id,event_id));
    CREATE TABLE IF NOT EXISTS listening_admission_aliases(owner TEXT NOT NULL,idem TEXT NOT NULL,fingerprint TEXT NOT NULL,session_id TEXT NOT NULL REFERENCES listening_sessions(id),PRIMARY KEY(owner,idem,fingerprint));`);
  const save=session=>{session.updatedAt=Date.now();const changed=store.db.prepare('UPDATE listening_sessions SET data=?,updated=? WHERE id=? AND owner=?').run(JSON.stringify(session),session.updatedAt,session.id,session.owner);if(changed.changes!==1)throw problem(409,'SESSION_CHANGED','Your account session changed. Refresh this page before continuing.');};
  function load(id,owner){const row=store.db.prepare('SELECT * FROM listening_sessions WHERE id=? AND owner=?').get(id,owner);if(!row)throw problem(404,'NOT_FOUND','Listening session not found.');return JSON.parse(row.data);}
  function reconcile(s){
    if(s.admission&&!s.activeJobId){
      const admitted=store.db.prepare('SELECT id,fingerprint FROM jobs WHERE owner=? AND idem=?').get(s.owner,s.admission.id);
      if(admitted&&admitted.fingerprint===sha(stable(s.admission.payload))){s.activeJobId=admitted.id;s.admission=null;s.status='preparing';save(s);}
    }
    if(!s.activeJobId)return false;
    const job=store.publicJob(store.ownJob(s.activeJobId,s.owner));
    const tracks=job.tracks.filter(t=>!s.queue.includes(t.id)&&!s.served.includes(t.id)&&!(s.dismissedQueueIds||[]).includes(t.id)&&t.id!==s.currentTrackId);
    s.queue.push(...tracks.map(t=>t.id));
    // A directed creation can deliver the faithful track before its two peers.
    // Publish verified peers as they arrive while retaining the same group.
    if(!terminal.has(job.status)){if(tracks.length)save(s);return false;}
    if(job.status==='uncertain'||job.creation?.children.some(child=>child.job.status==='uncertain'))s.blockedJobId=job.id;s.activeJobId=null;
    if(job.status!=='ready'){s.status='needs-attention';s.error=job.error||{code:'INCOMPLETE_DELIVERY',message:'Some outputs need attention. Available songs remain in your queue.'};}
    else{s.status=s.enabled?'listening':'paused';s.error=null;s.bufferRecheck=true;}
    save(s);return job.status==='ready';
  }
  function visible(s){
    return {id:s.id,clientId:s.clientId,idempotencyKey:s.idempotencyKey,enabled:s.enabled,playing:s.playing,status:s.status,currentTrackId:s.currentTrackId,queue:s.queue.map(id=>store.track(id)).filter(Boolean),
      activeJob:(s.activeJobId||s.blockedJobId)?store.publicJob(store.ownJob(s.activeJobId||s.blockedJobId,s.owner)):null,history:s.history,policy:s.policy,error:s.error||null,createdAt:s.createdAt,updatedAt:s.updatedAt};
  }
  function limits(s,ipKey){return {owner:s.owner,ipKey,limits:{daily:config.dailyAdmissionLimit,owner:s.owner.startsWith('guest:')?config.guestDailyLimit:SIGNED_IN_DAILY_LIMIT,ip:config.ipDailyLimit}};}
  async function refill(s,ipKey,{event='track-start',remainingSeconds=null,playing=true}={}){
    if(!s.enabled||!s.playing||s.status==='needs-attention'||s.blockedJobId)return;
    if(s.bufferRecheck&&!['skip','track-start'].includes(event))event='buffer-ready';
    if(s.bufferRecheck&&s.queue.length>=2){s.bufferRecheck=false;save(s);}
    const decision=decideRefill({event,preparedAhead:s.queue.length,inFlight:s.activeJobId?1:0,remainingSeconds,recalibrated:s.recalibrated,playing,sessionActive:s.enabled});
    if(decision.recalibrate){
      const current=store.track(s.currentTrackId);
      const recalibration=recalibratePrepared({candidates:s.queue.map(id=>store.track(id)).filter(Boolean),history:s.history,
        currentListen:{listenedSeconds:s.playedSeconds,durationSeconds:current?.duration,skipped:false,role:current?.seedRole},manualQueue:s.manualQueue===true});
      s.queue=recalibration.afterIds;s.recalibrated=true;
      s.policy={...s.policy,recalibration:{...recalibration,trackId:s.currentTrackId,remainingSeconds,at:Date.now()}};save(s);
    }
    if(!decision.generate)return;
    try{
      const plan=planAdaptiveRequest({request:s.request,history:s.history,strategy:'adaptive'}),request=plan.request;
      if(request.async===undefined)request.async=true;
      const payload=validateRequest(request,await capabilities(),{webhookUrl:config.webhookUrl});
      if(!s.admission||!store.db.prepare('SELECT 1 FROM jobs WHERE owner=? AND idem=?').get(s.owner,s.admission.id))await deliveryReady();
      store.assertOwnerCurrent(s.owner);
      // Counter is persisted before admission. A missed response is recovered by
      // this same key, never by generating a replacement under a new request ID.
      if(!s.admission){s.counter++;s.admission={id:`listen-${s.id}-${s.counter}`,payload,generationIntent:{request:s.request,policy:{version:2,mode:'adaptive',role:plan.strategy}}};save(s);}
      const admitted=store.admit({...limits(s,ipKey),idem:s.admission.id,payload:s.admission.payload,generationIntent:s.admission.generationIntent||null});
      s.activeJobId=admitted.job.id;s.admission=null;s.bufferRecheck=false;s.status='preparing';s.policy={...s.policy,signal:plan.signal,strategy:plan.strategy,guidance:plan.guidance,reason:decision.reason,preparedTarget:ADAPTIVE_POLICY.minPreparedAhead};save(s);jobs.wake();
    }catch(error){s.status='needs-attention';s.error={code:error.code||'CONTINUATION_UNAVAILABLE',message:error.status&&error.status<500?error.message:'The next request could not be prepared. Your saved music remains available.'};save(s);}
  }
  async function start({owner,ipKey,idem,body}){
    store.assertOwnerCurrent(owner);
    if(!idPattern.test(idem||'')||!idPattern.test(body?.clientId||'')||typeof body.trackId!=='string'||!store.track(body.trackId))throw problem(400,'INVALID_REQUEST','Choose an available song before starting continuous listening.');
    if(Object.keys(body).some(k=>!['clientId','trackId','request'].includes(k)))throw problem(400,'INVALID_REQUEST','Unrecognized session setting.');
    const fingerprint=sha(stable(body)),alias=store.db.prepare('SELECT session_id FROM listening_admission_aliases WHERE owner=? AND idem=? AND fingerprint=?').get(owner,idem,fingerprint);
    const prior=alias?store.db.prepare('SELECT * FROM listening_sessions WHERE owner=? AND id=?').get(owner,alias.session_id):store.db.prepare('SELECT * FROM listening_sessions WHERE owner=? AND idem=?').get(owner,idem);
    if(prior){if(prior.fingerprint!==fingerprint)throw problem(409,'IDEMPOTENCY_CONFLICT','This session ID belongs to a different request.');const s=JSON.parse(prior.data);reconcile(s);return visible(s);}
    const request=validateRequest(body.request,await capabilities(),{webhookUrl:config.webhookUrl});
    store.assertOwnerCurrent(owner);
    if(request.dry_run===true||request.capabilities===true)throw problem(400,'PREVIEW_MODE','Turn off preview mode before starting continuous listening.');
    // The track-to-job relation and owner come from SQLite, never client metadata.
    // A changed brief can start a new direction, but must not silently adopt the
    // previous brief's siblings as its prepared outputs.
    const source=store.db.prepare('SELECT j.* FROM jobs j JOIN tracks t ON t.job_id=j.id WHERE t.id=? AND j.owner=?').get(body.trackId,owner);
    // Website creation may have declared a three-take default in its dispatched
    // payload while preserving the user's original unset output choice. Match
    // that durable server intent, not the generated wire defaults or a client's
    // claimed origin. Legacy jobs have only their accepted payload to compare.
    const sourceRequest=source?(store.generationIntent?.(source.id)?.request??JSON.parse(source.payload)):null;
    let owningJob=sourceRequest&&requestIdentity(sourceRequest)===requestIdentity(request)?source:null;
    const group=owningJob&&store.creationGroup?.(owningJob.id);
    if(group&&group.owner===owner)owningJob=store.ownJob(group.id,owner);
    const sourceView=owningJob?store.publicJob(owningJob):null;
    const siblings=sourceView?sourceView.tracks.filter(track=>track.id!==body.trackId&&track.owned===true&&track.url==='/api/listen/'+encodeURIComponent(track.id)):[];
    const sourcePending=!!sourceView&&!terminal.has(sourceView.status);
    const sourceNeedsAttention=!!sourceView&&terminal.has(sourceView.status)&&sourceView.status!=='ready';
    const already=store.db.prepare('SELECT data FROM listening_sessions WHERE owner=? ORDER BY created DESC').all(owner).map(r=>JSON.parse(r.data)).find(s=>s.enabled);
    if(already){if(already.lastEventAt>Date.now()-30000)throw problem(409,'SESSION_IN_PROGRESS','A listening session is already active. Resume it or switch it off before starting another.');already.enabled=false;already.playing=false;already.status='paused';save(already);}
    const now=Date.now(),s={id:randomUUID(),owner,clientId:body.clientId,idempotencyKey:idem,enabled:true,playing:true,status:sourcePending?'preparing':sourceNeedsAttention?'needs-attention':'listening',request,queue:siblings.map(track=>track.id),served:[],history:[],currentTrackId:body.trackId,counter:0,activeJobId:sourcePending?owningJob.id:null,blockedJobId:sourceNeedsAttention?owningJob.id:null,admission:null,policy:{preparedTarget:ADAPTIVE_POLICY.minPreparedAhead,adoptedPrepared:siblings.length},error:sourceNeedsAttention?(owningJob.error?JSON.parse(owningJob.error):{code:'INCOMPLETE_DELIVERY',message:'This creation needs attention. Available songs remain prepared.'}):null,recalibrated:false,playedSeconds:0,activeWallSeconds:0,finalized:false,lastPosition:null,lastEventAt:now,createdAt:now,updatedAt:now};
    store.db.prepare('INSERT INTO listening_sessions VALUES (?,?,?,?,?,?,?)').run(s.id,owner,idem,fingerprint,JSON.stringify(s),now,now);
    await refill(s,ipKey);return visible(s);
  }
  function get(id,owner){const s=load(id,owner);reconcile(s);return visible(s);}
  function list(owner){return store.db.prepare('SELECT data FROM listening_sessions WHERE owner=? ORDER BY created DESC LIMIT 20').all(owner).map(row=>{const s=JSON.parse(row.data);reconcile(s);return visible(s);});}
  async function event({id,owner,ipKey,body}){
    const dismiss=body?.type==='dismiss';
    const fields=dismiss?['eventId','clientId','type','trackIds']:['eventId','clientId','type','trackId','position','playedSeconds','playing','manualQueue'];
    if(!body||Object.keys(body).some(k=>!fields.includes(k))||!idPattern.test(body.eventId||'')||!idPattern.test(body.clientId||'')||!['start','progress','skip','ended','pause','resume','disable','dismiss'].includes(body.type))throw problem(400,'INVALID_REQUEST','Invalid listening update.');
    if(dismiss&&(!Array.isArray(body.trackIds)||body.trackIds.length>100||Array.from(body.trackIds).some(id=>typeof id!=='string'||!trackIdPattern.test(id))||new Set(body.trackIds).size!==body.trackIds.length))throw problem(400,'INVALID_REQUEST','Choose up to 100 distinct prepared songs to remove.');
    if(body.manualQueue!==undefined&&typeof body.manualQueue!=='boolean')throw problem(400,'INVALID_REQUEST','Queue ordering must be an explicit true or false value.');
    const s=load(id,owner),fingerprint=sha(stable(body));
    const receipt=store.db.prepare('SELECT fingerprint FROM listening_events WHERE session_id=? AND event_id=?').get(id,body.eventId);
    if(receipt){if(receipt.fingerprint!==fingerprint)throw problem(409,'IDEMPOTENCY_CONFLICT','This listening update ID was already used.');reconcile(s);return visible(s);}
    if(s.clientId!==body.clientId)throw problem(409,'LISTENING_IN_ANOTHER_TAB','This listening session belongs to another tab.');
    if(dismiss){
      reconcile(s);
      if(body.trackIds.some(id=>id===s.currentTrackId||!s.queue.includes(id)||!store.track(id)))throw problem(409,'QUEUE_CHANGED','The prepared queue has changed. Refresh it before removing songs.');
      const removed=new Set(body.trackIds);
      s.queue=s.queue.filter(id=>!removed.has(id));
      // Queue editing is not listening feedback. Retain separate tombstones so
      // a recovered delivery cannot resurrect removed songs or mark them heard.
      s.dismissedQueueIds=[...new Set([...(s.dismissedQueueIds||[]),...removed])];
      if(removed.size)s.bufferRecheck=false;
      store.transaction(()=>{save(s);store.db.prepare('INSERT INTO listening_events VALUES (?,?,?)').run(id,body.eventId,fingerprint);});
      // Neither this edit nor its duplicate receipt is a request to buy music.
      return visible(s);
    }
    const position=body.position,played=body.playedSeconds;
    if(position!==undefined&&(!Number.isFinite(position)||position<0||position>3600)||played!==undefined&&(!Number.isFinite(played)||played<0||played>3600))throw problem(400,'INVALID_REQUEST','Invalid listening time.');
    const duplicateOutcome=['skip','ended'].includes(body.type)&&s.finalized;
    const bufferReady=reconcile(s),now=Date.now();
    if(body.manualQueue!==undefined)s.manualQueue=body.manualQueue;
    s.activeWallSeconds=(s.activeWallSeconds||0)+(s.playing?Math.min(10,Math.max(0,(now-s.lastEventAt)/1000)):0);
    if(body.type==='disable'){s.enabled=false;s.playing=false;s.status='paused';}
    else if(body.type==='pause'){s.playing=false;}
    else if(body.type==='resume'){
      const other=store.db.prepare('SELECT id,data FROM listening_sessions WHERE owner=? AND id<>?').all(owner,id).find(row=>JSON.parse(row.data).enabled);
      if(other)throw problem(409,'SESSION_IN_PROGRESS','Another listening session is active. Switch it off before resuming this one.');
      if(s.blockedJobId){const blocked=store.publicJob(store.ownJob(s.blockedJobId,owner));if(blocked.status==='uncertain'||blocked.creation?.children.some(child=>child.job.status==='uncertain'))throw problem(409,'OUTCOME_UNCONFIRMED','A generation outcome is still unconfirmed. Check its status before creating another song.');s.activeJobId=blocked.id;s.blockedJobId=null;reconcile(s);}
      s.enabled=true;s.playing=true;if(s.status==='needs-attention'){s.status='listening';s.error=null;}
    }
    else if(body.type==='start'){
      if(!store.track(body.trackId))throw problem(400,'INVALID_TRACK','This song is not available in our listening catalogue.');
      s.currentTrackId=body.trackId;s.queue=s.queue.filter(t=>t!==body.trackId);s.recalibrated=false;s.playedSeconds=0;s.activeWallSeconds=0;s.finalized=false;s.lastPosition=position??0;
    }
    else if(body.trackId!==s.currentTrackId)throw problem(409,'TRACK_CHANGED','This update belongs to a different song.');
    const track=store.track(s.currentTrackId),duration=track?.duration;
    // Playback telemetry can guide taste, never grant access or bypass budgets.
    // Count only supplied real played time, bounded by elapsed wall time. Seeks
    // change position but cannot manufacture a full-listen signal.
    if(played!==undefined)s.playedSeconds=Math.max(s.playedSeconds,Math.min(played,s.activeWallSeconds));
    if(['skip','ended'].includes(body.type)&&!s.finalized){
      s.history.push({trackId:s.currentTrackId,listenedSeconds:s.playedSeconds,durationSeconds:duration,skipped:body.type==='skip',...(track?.seedRole?{role:track.seedRole}:{})});s.history=s.history.slice(-100);s.served=[...new Set([...s.served,s.currentTrackId])];
      s.finalized=true;
    }
    s.lastPosition=position??s.lastPosition;s.lastEventAt=now;
    store.transaction(()=>{save(s);store.db.prepare('INSERT INTO listening_events VALUES (?,?,?)').run(id,body.eventId,fingerprint);});
    if(!duplicateOutcome&&s.enabled&&s.playing&&body.type!=='pause'&&body.type!=='disable')await refill(s,ipKey,{event:['start','resume'].includes(body.type)?'track-start':body.type==='skip'?'skip':bufferReady?'buffer-ready':'time-update',remainingSeconds:Number.isFinite(duration)&&position!==undefined?Math.max(0,duration-position):null,playing:body.playing===true});
    return visible(s);
  }
  return {start:args=>serial(args.owner,()=>start(args)),event:args=>serial(args.owner,()=>event(args)),get:(id,owner)=>serial(owner,()=>get(id,owner)),list:owner=>serial(owner,()=>list(owner))};
}
