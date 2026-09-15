// Shared presentation for the activity list and the real worker dialog.
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function resultRows(summary,assets){
  if(summary?.state!=='available')return [];
    const rows=[];
    if(Number.isFinite(summary.duration?.requestedSeconds))rows.push(['Requested length',`${summary.duration.requestedSeconds}s`]);
    if(Number.isFinite(summary.duration?.measuredSeconds))rows.push([summary.duration.measured===true?'Measured length':'Reported length (unverified)',`${summary.duration.measuredSeconds}s`]);
    const lyrics=summary.lyrics;
    if(lyrics?.requestedMode==='custom'){
      const verdict=lyrics.measured ? ({PASS:'Passed',FAIL:'Did not pass',NOT_CALIBRATED:'No calibrated verdict',GRAPHEME_ONLY:'Written characters checked only',NOT_MEASURABLE:'Not measurable',UNAVAILABLE:'Unavailable'}[lyrics.verdict]||'Measured without a pass/fail verdict') : ({pending:'Pending',skipped:'Skipped as requested',unverified:'Not verified',unavailable:'Unavailable'}[lyrics.state]||'Not measured');
      rows.push(['Lyrics check',verdict]);
      if(lyrics.measuredDomain)rows.push(['Checked audio',lyrics.measuredDomain==='stem'?'Separated vocal':'Full mix']);
      if(lyrics.measured&&lyrics.metric&&Number.isFinite(lyrics.value))rows.push([`${lyrics.metric.toUpperCase()} result`,`${lyrics.value}${Number.isFinite(lyrics.threshold)?` · threshold ${lyrics.threshold}`:''}`]);
      if(lyrics.primaryMetricState==='unavailable')rows.push(['Requested metric','Unavailable; the result above is the separate PER check']);
      if(lyrics.barSource==='caller-override')rows.push(['Threshold source',`Your override${Number.isFinite(lyrics.callerThreshold)?` · ${lyrics.callerThreshold}`:''}`]);
      if(lyrics.calibrationDomainMatch===false)rows.push(['Comparison scope','This measurement is not comparable with the calibrated vocal-stem threshold']);
    }
    if(summary.originality?.requested){
      rows.push(['Originality check',({pending:'Pending — listening is ready',complete:'Analysis returned',failed:'Analysis failed','no-record':'No analysis record',unavailable:'Analysis unavailable'}[summary.originality.state]||'No verified result')]);
      const verdicts={PASS:'Passed within calibrated scope',MONOTONE_FLAGGED:'Repeated pattern flagged',CARBON_COPY_FLAGGED:'Similar takes flagged',NOT_CALIBRATED:'No calibrated verdict',NOT_APPLICABLE:'Not applicable',NOT_MEASURABLE:'Not measurable'};
      for(const [axis,label]of [['monotony','Repetition within the song'],['similarity','Similarity between takes']]){
        const a=summary.originality.axes?.[axis];if(!a)continue;
        if(a.verdict)rows.push([label,verdicts[a.verdict]||'No verified pass/fail verdict']);
        if(a.corpusGenre)rows.push([`${label} · reference genre`,a.corpusGenre.replaceAll('_',' ')]);
        if(a.scope==='calibrated-genre-only')rows.push([`${label} · scope`,'Applies to the calibrated genre class only']);
      }
    }
    if(Number.isFinite(summary.takes?.requested))rows.push(['Takes',`${summary.takes.delivered??'Unknown'} delivered · ${summary.takes.requested} requested`]);
    const format=asset=>[asset.codec?.toUpperCase(),Number.isFinite(asset.sampleRate)?`${asset.sampleRate.toLocaleString('en')} Hz`:null,Number.isFinite(asset.channels)?`${asset.channels} channel${asset.channels===1?'':'s'}`:null,Number.isFinite(asset.bitsPerSample)?`${asset.bitsPerSample}-bit`:null,Number.isFinite(asset.durationSeconds)?`${asset.durationSeconds}s`:null].filter(Boolean).join(' · ');
    for(const take of assets?.takes||[]){
      const label=`Take ${take.take}`;
      for(const [key,name]of [['master','Master'],['listening','Listening copy'],['source','Original source']])rows.push([`${label} · ${name}`,take[key]?.owned?`Saved · ${format(take[key])}`:'Not saved']);
      for(const stem of take.stems||[]){
        const status=stem.asset?.owned?`Saved · ${format(stem.asset)}`:({REFUSED_LICENCE:'Not supplied by the service: licence restriction',NOT_BUILT:'Not produced by the service',NOT_REQUESTED:'Not requested',FAILED:'Transfer or processing failed',DELIVERED:'Service delivered; local transfer incomplete'}[stem.state]||'Unavailable');
        rows.push([`${label} · ${stem.name} stem`,`${status}${stem.grade?` · ${stem.grade}`:''}`]);
      }
      const audio=summary.takes?.items?.find(item=>item.take===take.take)?.audio;
      if(audio?.bitDepthPromoted)rows.push([`${label} · export resolution`,`${audio.bitsPerSample}-bit export from a ${audio.exportSourceBitsPerSample}-bit source`]);
      if(audio?.mastering?.measured){const m=audio.mastering;rows.push([`${label} · measured loudness`,[Number.isFinite(m.integratedLufs)?`${m.integratedLufs} LUFS`:null,Number.isFinite(m.truePeakDbtp)?`${m.truePeakDbtp} dBTP`:null,Number.isFinite(m.loudnessRangeLu)?`${m.loudnessRangeLu} LU range`:null].filter(Boolean).join(' · ')||'No numeric result']);}
    }

    appendDetails(rows,summary.details);
    return rows;
}
const title=value=>String(value).replaceAll('_',' ').replaceAll('|',' ');
const yes=value=>value===true?'Yes':value===false?'No':'Not reported';
const state=value=>({MEASURED:'Measured',NOT_MEASURABLE:'Not measurable',ESTIMATED_UNCALIBRATED:'Estimate without calibrated confidence',NOT_RUN:'Not run',NOT_AVAILABLE:'Unavailable',FAILED:'Failed',CALIBRATED:'Calibrated',PARTIALLY_CALIBRATED:'Partly calibrated',NOT_CALIBRATED:'Not calibrated',SINGING_PROVEN:'Measured singing evidence',SPEECH_PROVEN:'Measured speech evidence',ENGINEERING_PATH_ESTABLISHED:'Processing path established',PENDING_MEASUREMENT:'Awaiting measurement',NOT_MEASURED:'Not measured'}[value]||title(value));
function appendDetails(rows,d){
  if(!d)return;
  const add=(label,value)=>{if(value!==null&&value!==undefined&&value!=='')rows.push([label,String(value)]);};
  const num=(label,value,unit='')=>{if(Number.isFinite(value))add(label,`${value}${unit}`);};
  const r=d.routing;if(r){add('Selected model',r.model);add('Reported model',r.reportedModel);if(r.modelMatches===false)add('Model comparison','The selected and reported models differ');}
  const l=d.language;if(l){
    add('Requested language',l.requested?.toUpperCase());
    if(l.fallback?.state==='reported')add('Language fallback',l.fallback.delivered?`${l.fallback.requested?.toUpperCase()||'Requested language'} → ${l.fallback.delivered.toUpperCase()}`:'Reported by the service; destination not specified');
    else if(l.fallback?.state==='none')add('Language fallback','None reported');
    if(l.capability?.singing)add('Singing evidence',state(l.capability.singing));
    if(l.capability?.calibration)add('Language calibration',state(l.capability.calibration));
  }
  const seed=d.seed;if(seed){num('Recorded seed',seed.value);add('Seed sent to model',yes(seed.sentToModel));add('Seed scope','Records this creation; identical audio on repeat is not guaranteed');}
  const a=d.analysis;if(a){
    for(const [key,label,formatted]of [['tempo','Tempo',v=>Number.isFinite(v.estimatedBpm)?`${v.estimatedBpm} BPM`:null],['key','Key',v=>v.estimated?title(v.estimated):null],['meter','Meter',v=>v.value|| (Number.isFinite(v.estimatedNumerator)?`${v.estimatedNumerator} beats per bar`:null)]]){
      const item=a[key];if(!item)continue;
      add(`${label} analysis`,[item.state?state(item.state):'No measurement state',formatted(item)].filter(Boolean).join(' · '));
      if(item.calibration?.state)add(`${label} confidence`,state(item.calibration.state));
      if(item.agreement?.classMatch===false||item.agreement?.withinFourPercent===false)add(`${label} comparison`,'The measured result differs from the request');
    }
    if(a.tempo||a.key||a.meter)add('Musical measurements','Describe the returned audio; they do not mean the music was corrected to match');
  }
  for(const p of d.processing||[]){
    const label=`Take ${p.take}`;
    add(`${label} · processing`,p.executed===true?'Executed':p.executed===false?'Not executed':'Not reported');
    if(p.conform?.action)add(`${label} · duration handling`,title(p.conform.action));
    if(p.master)add(`${label} · mastering`,p.master.skipped===true?'Skipped':p.master.applied===true?'Applied':p.master.ok===true?'Completed':p.master.ok===false?'Failed':'No application confirmed');
    if(p.postEdits){add(`${label} · finishing`,p.postEdits.applied===true?'Applied':p.postEdits.ok===false?'Failed':'No application confirmed');num(`${label} · fade in`,p.postEdits.fadeInSeconds,'s');num(`${label} · fade out`,p.postEdits.fadeOutSeconds,'s');}
    if(p.export?.requested)add(`${label} · export`,title(p.export.requested));
  }
  const provenance=(p,prefix)=>{
    if(!p)return;
    if(p.c2pa){const c=p.c2pa;add(`${prefix} · content credentials`,c.state==='legacy-intent-only'?'Intent recorded; signing not verified':c.state?title(c.state):'Not reported');if(c.validation)add(`${prefix} · credential validation`,c.validation);if(c.trust)add(`${prefix} · signer trust`,c.trust==='trusted'?'Trusted':'Own certificate authority; not independently trusted');}
    if(p.watermark){const w=p.watermark;add(`${prefix} · audio watermark`,w.state?title(w.state):'Not reported');add(`${prefix} · watermark detected`,yes(w.detected));if(w.calibration)add(`${prefix} · watermark calibration`,w.calibration.calibrated===true?'Calibrated':w.calibration.calibrated===false?'Not calibrated':'Not reported');}
    if(p.synthid)add(`${prefix} · SynthID`,'Provider statement; not independently verified');
    if(p.ddex?.state)add(`${prefix} · AI credit`,p.ddex.state==='legacy-intent-only'?'Intent recorded; writing not verified':title(p.ddex.state));
  };
  provenance(d.provenance,'Original delivery');
  for(const p of d.processing||[])provenance(p.provenance,`Take ${p.take} master`);
  if(d.provenance||(d.processing||[]).some(p=>p.provenance))add('Credential scope','The original delivery report. Credentials on our listening copy have not been verified after conversion.');
  const m=d.mix;if(m){if(m.layerCount!==null)num('Reported mix layers',m.layerCount);add('Mix instantiated',yes(m.instantiated));for(const [i,layer]of(m.layers||[]).entries())add(`Layer ${i+1}`,[layer.role,layer.origin,layer.deliveryClass].filter(Boolean).map(title).join(' · '));}
  const e=d.execution;if(e){
    if(e.durationRegeneration?.state==='reported')add('Duration regeneration','Reported; detailed attempt results were not supplied');
    else if(e.durationRegeneration?.state==='none')add('Duration regeneration','None reported');
    if(e.shortfall)add('Incomplete output',`${e.shortfall.generated??'Unknown'} generated of ${e.shortfall.requested??'unknown'} requested`);
    if(e.attempt){num('Worker execution counter',e.attempt.executionCount);num('Worker retry counter',e.attempt.retryCount);}
    num('Reported processing time',e.budget?.elapsedSeconds,'s');
    for(const stage of e.budget?.stages||[])if(stage.name)add(`Service stage · ${title(stage.name)}`,[stage.outcome?title(stage.outcome):'No outcome',Number.isFinite(stage.elapsedSeconds)?`${stage.elapsedSeconds}s`:null].filter(Boolean).join(' · '));
    if(e.rights){add('Commercial use · service assertion',yes(e.rights.commercialUse));add('Sync use · service assertion',yes(e.rights.sync));add('Copyright warranted · service assertion',yes(e.rights.copyrightWarranted));}
  }
}
export function failureLines(error){
  const rows=[];if(!error)return rows;
  if(error.message)rows.push(error.code==='INGEST_PARTIAL'&&String(error.message).startsWith('Music was generated, but transfer')?'Your song was created. Saving did not finish. Check delivery to resume saving the same song.':String(error.message));
  const content=error.contentSafety;
  if(content?.instrumentFailure===true)rows.push('The content check is temporarily unavailable. This is not a judgement about your writing. No new request will be sent automatically.');
  else if(content?.categories?.length)rows.push('Review these categories: '+content.categories.map(item=>item.label).join(', ')+'.');
  const q=error.quota;
  if(q&&Number.isSafeInteger(q.remaining)&&q.remaining>=0)rows.push(`Music service daily allowance: ${q.remaining} remaining${Number.isSafeInteger(q.daily)?` of ${q.daily}`:''}.`);
  return rows;
}
export function render(summary,assets){
  const rows=resultRows(summary,assets);if(!rows.length)return '';
  return `<details class="connected-result"><summary>Creation details</summary><dl>${rows.map(([key,value])=>`<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>${assets?'<p>File details reflect the last verified transfer to our storage.</p>':''}${summary.lyrics?.measured&&summary.lyrics.requestedMode==='custom'?'<p>The lyrics result is the music service’s measured check. It does not guarantee that every word matches.</p>':''}</details>`;
}
export const directionLabel=role=>({faithful:'Your original idea',neighbour:'A different angle',explore:'Further exploration'}[role]||'Music direction');
export function renderCreation(job){
  if(!job?.creation?.children)return render(job?.summary,job?.assetsSummary);
  return `<details class="connected-result"><summary>Creation details · ${job.creation.deliveredTakes} of 3 directions ready</summary>${job.creation.children.map(child=>`<article class="creation-direction"><h4>${esc(directionLabel(child.role))}</h4><p>${esc(child.job.workflow?.title||child.job.status)}</p>${child.job.error?`<p class="notice">${esc(failureLines(child.job.error).join(' '))}</p>`:''}${render(child.job.summary,child.job.assetsSummary)}</article>`).join('')}</details>`;
}
if(typeof window!=='undefined')window.PMPResultPresentation=Object.freeze({resultRows,render,failureLines,renderCreation,directionLabel});
