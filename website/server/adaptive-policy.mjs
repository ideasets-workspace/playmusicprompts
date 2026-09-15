/**
 * Pure next-track policy; no network, storage, randomness or paid submissions.
 *
 * Provenance: the owner's original Aug 29 order is preserved in the supplied
 * play_music_promps_cursor_project_memory_11092026.md lines 91–105 (repeated
 * 3244–3260). Its analysis at 182–210 distinguishes faithful / neighbour /
 * explore and graded listening feedback. The Sept 2 carried implementation in
 * .claude/memory/STATE.md:134,146 records 3 initial takes, >=2 ready ahead,
 * T-minus-90 recalibration, <10-second early skip, >=90% full listen, and one
 * adaptive job in flight. The qualitative policy below is a new implementation
 * of that contract, not recovered deleted code or a learned numerical model.
 * No approved blend coefficients were found. The separate Sept 3 catalogue
 * research's Thompson/MMR/RRF proposals are not this owner policy.
 *
 * Integration duties: supply actual accumulated playback, excluding seeks,
 * paused/buffering/ad time; one settled history record per listen, chronological
 * oldest first; an immutable validated user request (never the previous planned
 * prompt); verified ready-ahead counts; atomically persist in-flight admission
 * and the per-track recalibration flag. This module alone does not provide
 * cross-tab coordination, a ready queue, musical effect proof or gapless audio.
 */

export const ADAPTIVE_POLICY=Object.freeze({
  initialBurst:3,
  minPreparedAhead:2,
  recalibrateRemainingSeconds:90,
  earlySkipSeconds:10,
  fullListenRatio:0.9,
  maxAdaptiveInFlight:1,
});

// Current API prompt limit: docs/api/04-request-body-full.md:64. The caller may
// pass the live limit when capabilities change; the user's text is never cut.
const CURRENT_PROMPT_LIMIT=5000;
const strategies=new Set(['adaptive','faithful','neighbour','explore']);
const skipSignals=new Set(['early-skip','moderate-skip','late-skip']);
const axisLabels=Object.freeze({
  genres:'genres',moods:'mood',eras:'era',creative_goal:'creative direction',
  instruments:'instrumentation',sonic_tags:'sound character',
  tempo_bpm:'tempo',key:'key and scale',time_signature:'metre',
  duration:'duration',structure:'structure',energy_curve:'energy shape',
  mood_orbit:'emotional balance',arrangement_ai:'arrangement direction',
  vocal:'voice',lyrics:'lyrics',references:'sound references',
});
const number=value=>typeof value==='number'&&Number.isFinite(value);

/** No skipped flag, unknown duration, or unreliable elapsed value => unknown. */
export function classifyListen(event){
  const {listenedSeconds,durationSeconds,skipped}=event&&typeof event==='object'?event:{};
  if(!number(listenedSeconds)||listenedSeconds<0||!number(durationSeconds)||durationSeconds<=0||typeof skipped!=='boolean')
    return {kind:'unknown',listenedSeconds:null,durationSeconds:null,ratio:null};
  const ratio=Math.min(1,listenedSeconds/durationSeconds);
  // Full-listen priority matters for short tracks and Skip pressed at the end.
  let kind;
  if(ratio>=ADAPTIVE_POLICY.fullListenRatio)kind='full-listen';
  else if(!skipped)kind='partial-listen';
  else if(listenedSeconds<ADAPTIVE_POLICY.earlySkipSeconds)kind='early-skip';
  else if(ratio<=0.5)kind='moderate-skip';
  else kind='late-skip';
  return {kind,listenedSeconds,durationSeconds,ratio};
}

function cloneJSON(value,seen=new Set()){
  if(value===null||typeof value==='string'||typeof value==='boolean')return value;
  if(number(value))return value;
  if(typeof value!=='object'||seen.has(value))throw new TypeError('The adaptive policy needs a validated JSON request.');
  const prototype=Object.getPrototypeOf(value);
  if(!Array.isArray(value)&&prototype!==Object.prototype&&prototype!==null)throw new TypeError('The adaptive policy needs a plain JSON request.');
  seen.add(value);
  const result=Array.isArray(value)?[]:{};
  for(const key of Object.keys(value)){
    const descriptor=Object.getOwnPropertyDescriptor(value,key);
    if(!descriptor||!Object.hasOwn(descriptor,'value')||['__proto__','constructor','prototype'].includes(key))throw new TypeError('Unsafe adaptive request property.');
    result[key]=cloneJSON(descriptor.value,seen);
  }
  seen.delete(value);return result;
}
function countTail(signals,predicate){let count=0;for(let i=signals.length-1;i>=0&&predicate(signals[i].kind);i--)count++;return count;}
function substantive(value){return value!==undefined&&value!==null&&(typeof value==='object'?Object.keys(value).length>0:typeof value==='string'?value.trim().length>0:true);}
function guidanceFor(strategy,signal,consecutive,labels){
  // Unknown or partial listening does not assert a preference. Explicit seed
  // strategies may still request different interpretations of the chosen brief.
  if(strategy==='faithful'){
    if(signal.kind!=='full-listen')return '';
    return (consecutive.fullListens>1?'Repeated full listens support this direction. ':'The previous track was listened to in full. ')+
      'Keep the same musical direction in the next track, with fresh musical development rather than repeating the previous arrangement. '+
      'Preserve the original description and every explicitly selected setting, lyric and restriction.';
  }
  const basis=labels.length?'the selected '+labels.join(', '):'the original description';
  let feedback='';
  if(signal.kind==='early-skip')feedback='The previous track was skipped early. This is a strong rejection signal, but it does not identify a disliked genre, instrument or other specific cause. ';
  else if(signal.kind==='moderate-skip')feedback='The previous track was skipped during its first half after the opening. Keep its overall tone while trying a different structure and arrangement within the selected constraints. ';
  else if(signal.kind==='late-skip')feedback='The previous track was skipped after its first half. Treat this as a request for variety, not as evidence that its musical style was disliked. ';
  if(consecutive.skips>1)feedback+='Consecutive skips call for a more distinct interpretation of the same chosen direction. ';
  const approach=strategy==='neighbour'
    ?'Create a neighbouring interpretation, varying the musical presentation of '+basis+' while keeping its core identity. '
    :'Explore a more contrasting musical presentation of '+basis+', rather than repeating the previous interpretation. ';
  return feedback+approach+
    'Keep every explicitly selected value, voice, lyric, duration and restriction unchanged. Do not introduce a new genre or instrument outside the chosen description and settings. '+
    'Where structure or arrangement is explicitly fixed, vary its musical development without changing that structure.';
}

/**
 * Plan from a validated ORIGINAL request and settled actual listen records.
 * Explicit seed strategy is allowed; otherwise the latest graded outcome picks
 * a qualitative strategy. All selected fields retain their exact JSON values;
 * only prompt gains visible, returned guidance. negative_prompt is never expanded
 * from speculative causal attribution. These instructions request variation;
 * they cannot guarantee an audible difference from a generative model.
 */
export function planAdaptiveRequest({request,history=[],strategy='adaptive',promptLimit=CURRENT_PROMPT_LIMIT}={}){
  if(!request||typeof request!=='object'||Array.isArray(request))throw new TypeError('A validated original music description is required.');
  if(!Array.isArray(history)||!strategies.has(strategy)||!Number.isSafeInteger(promptLimit)||promptLimit<1)throw new TypeError('Invalid adaptive policy input.');
  const planned=cloneJSON(request);
  if(typeof planned.prompt!=='string'||!planned.prompt.trim())throw new TypeError('A validated original music description is required.');
  const signals=Array.from(history,classifyListen),signal=signals.at(-1)||classifyListen();
  const consecutive={fullListens:countTail(signals,kind=>kind==='full-listen'),skips:countTail(signals,kind=>skipSignals.has(kind))};
  let chosen=strategy;
  if(chosen==='adaptive')chosen=signal.kind==='full-listen'?'faithful':signal.kind==='late-skip'||consecutive.skips>1?'explore':skipSignals.has(signal.kind)?'neighbour':'faithful';
  const selectedAxes=Object.keys(axisLabels).filter(key=>substantive(planned[key]));
  const guidance=guidanceFor(chosen,signal,consecutive,selectedAxes.map(key=>axisLabels[key]));
  if(guidance)planned.prompt+='\n\nNext-track direction:\n'+guidance;
  if(Array.from(planned.prompt).length>promptLimit){
    const error=new Error('The original description plus the next-track direction exceeds the music service’s prompt limit. Your original words and settings are unchanged.');
    error.code='ADAPTIVE_PROMPT_LIMIT';error.issues=[{path:'prompt',message:'Leave room for the next-track direction, or use the original description without adaptation.'}];throw error;
  }
  return {request:planned,signal,strategy:chosen,consecutive,guidance,selectedAxes,changedPaths:guidance?['prompt']:[]};
}

/**
 * A transparent qualitative decision over actual ready candidates. Roles are
 * stored generation instructions, not acoustic measurements or inferred taste
 * vectors. No numeric preference weights were approved. Unknown/manual tracks
 * keep their positions; user ordering wins. Nothing is discarded or generated.
 */
export function recalibratePrepared({candidates=[],history=[],currentListen=null,manualQueue=false}={}){
  if(!Array.isArray(candidates)||!Array.isArray(history)||typeof manualQueue!=='boolean')throw new TypeError('Invalid prepared queue evidence.');
  const roles=new Set(['faithful','neighbour','explore']),beforeIds=candidates.map(candidate=>candidate.id);
  if(beforeIds.some(id=>typeof id!=='string')||new Set(beforeIds).size!==beforeIds.length)throw new TypeError('Prepared candidates must have unique identities.');
  const settled=history.map(event=>({...classifyListen(event),role:roles.has(event?.role)?event.role:null}));
  const current=classifyListen(currentListen);
  // A track still playing is not a skip, and a partial listen is no preference.
  // Only an already observed >=90% listen adds provisional positive evidence.
  if(current.kind==='full-listen')settled.push({...current,role:roles.has(currentListen?.role)?currentListen.role:null});
  const evidence=settled.at(-1)||classifyListen(),consecutiveSkips=countTail(settled,signal=>skipSignals.has(signal));
  let preferredRole='faithful',reason='original-direction';
  if(evidence.kind==='full-listen'){preferredRole=evidence.role||'faithful';reason='full-listen-direction';}
  else if(evidence.kind==='late-skip'||consecutiveSkips>1){preferredRole='explore';reason=consecutiveSkips>1?'consecutive-skips':'late-skip-variety';}
  else if(skipSignals.has(evidence.kind)){preferredRole=evidence.role==='neighbour'?'explore':'neighbour';reason='try-another-interpretation';}
  if(!candidates.length)reason='no-prepared-candidates';
  else if(!candidates.some(candidate=>roles.has(candidate.seedRole)))reason='no-labelled-candidates';
  const ranked=candidates.filter(candidate=>roles.has(candidate.seedRole)).map((candidate,index)=>({candidate,index})).sort((a,b)=>Number(b.candidate.seedRole===preferredRole)-Number(a.candidate.seedRole===preferredRole)||a.index-b.index).map(row=>row.candidate);
  let cursor=0;const ordered=manualQueue?candidates.slice():candidates.map(candidate=>roles.has(candidate.seedRole)?ranked[cursor++]:candidate);
  const afterIds=ordered.map(candidate=>candidate.id);
  return {version:1,method:'qualitative-seed-role',preferredRole,reason:manualQueue?'manual-order-preserved':reason,
    evidence:{kind:evidence.kind,role:evidence.role||null,listenedSeconds:evidence.listenedSeconds,durationSeconds:evidence.durationSeconds,ratio:evidence.ratio,consecutiveSkips,currentKind:current.kind},
    beforeIds,afterIds,changed:beforeIds.some((id,index)=>id!==afterIds[index]),protectedManualOrder:manualQueue,
    candidateRoles:candidates.map(candidate=>({id:candidate.id,role:roles.has(candidate.seedRole)?candidate.seedRole:null}))};
}

/**
 * Pure scheduling decision. `playing` means the listener intends playback;
 * buffering and an inter-track ad are not user pauses. `buffer-ready` is emitted
 * only after verified music enters the queue, never on failed/unknown jobs.
 * The caller must claim count=1 atomically and persist recalibrate per track.
 * No elapsed generation time/ETA is guessed and no previously failed request is
 * retried by this policy. Initial 3-slot seeding is coordinated by the caller.
 */
export function decideRefill({event,preparedAhead,inFlight,remainingSeconds,recalibrated=false,playing=false,sessionActive=false}={}){
  const no=reason=>({generate:false,count:0,recalibrate:false,reason});
  if(sessionActive!==true)return no('session-inactive');
  if(playing!==true)return no('listener-paused');
  if(!Number.isSafeInteger(preparedAhead)||preparedAhead<0||!Number.isSafeInteger(inFlight)||inFlight<0||typeof recalibrated!=='boolean')return no('unknown-buffer-state');
  if(!['track-start','skip','time-update','buffer-ready'].includes(event))return no('unhandled-event');
  let recalibrate=false;
  if(event==='time-update'){
    if(!number(remainingSeconds)||remainingSeconds<0)return no('unknown-remaining-time');
    if(remainingSeconds>ADAPTIVE_POLICY.recalibrateRemainingSeconds)return no('before-recalibration');
    if(recalibrated)return no('already-recalibrated');
    recalibrate=true;
  }
  const short=preparedAhead<ADAPTIVE_POLICY.minPreparedAhead;
  if(inFlight>=ADAPTIVE_POLICY.maxAdaptiveInFlight)return {generate:false,count:0,recalibrate,reason:'generation-in-flight'};
  if(!short&&event!=='skip')return {generate:false,count:0,recalibrate,reason:'prepared-target-met'};
  return {generate:true,count:1,recalibrate,reason:event==='skip'?'replace-skipped-track':recalibrate?'recalibration-refill':'prepared-buffer-short'};
}
