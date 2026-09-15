/* A compiled plan is never registered as a song. All upstream prose is escaped. */
(() => {
  const P=window.PMP,{esc}=P;
  const WORDING={cinematic_trailer:'Cinematic trailer',streaming:'Streaming',broadcast:'Broadcast / TV',game:'Game / interactive',social:'Social media',none:'None',
    trim:'Trim to the target',regenerate:'Generate another take if needed — additional generation',accept:'Accept the delivered length',
    SINGING_PROVEN:'Singing measured by the service',SPEECH_PROVEN:'Speech measured by the service',ENGINEERING_PATH_ESTABLISHED:'Engineering path established',
    DOCUMENTED_CONVERGENT:'Supported by multiple documented sources',DOCUMENTED_SINGLE:'Supported by one documented source',PENDING_MEASUREMENT:'Awaiting measurement',NOT_MEASURED:'Not measured',NOT_IN_REGISTRY:'No registry evidence',
    PROMPT_LANGUAGE:'Language directed through the music description',GEMINI_DOCUMENTED:'Transcription documented by the provider',
    PHONEMISER_AVAILABLE:'Phoneme comparison available',GRAPHEME_METRICS_ONLY:'Written-character metrics only',CALIBRATED:'Calibrated',NOT_CALIBRATED:'Not calibrated',
    master:'Master',music:'Instrumental music',vocals:'Vocals',drums:'Drums',bass:'Bass',fx:'Sound effects',ambience:'Ambience',mono:'Mono',stereo:'Stereo'};
  const label=value=>value==null?'Not reported':WORDING[value]??String(value);
  const unit=(value,suffix)=>value==null?'Not reported':`${value}${suffix}`;
  const yesNo=value=>value==null?'Not reported':value?'Yes':'No';
  const language=value=>{
    if(value==null)return 'Not reported';
    try{return new Intl.DisplayNames(['en'],{type:'language'}).of(value)||value;}catch{return value;}
  };
  const list=value=>!Array.isArray(value)?'Not reported':value.length?value.map(label).join(', '):'None';
  const facts=rows=>`<dl class="request-plan-facts">${rows.map(([key,value])=>`<div><dt>${esc(key)}</dt><dd>${esc(value==null?'Not reported':value)}</dd></div>`).join('')}</dl>`;
  const section=(title,rows,note='')=>`<details class="request-plan-section"><summary>${esc(title)}</summary>${note?`<p class="connected-caption">${esc(note)}</p>`:''}${facts(rows)}</details>`;
  function detailSections(result){
    const {conform,mastering,postEdits,stems,language:lang}=result.details||{},capability=lang?.capability,fallback=lang?.fallback;
    const change=fallback?.state==='none'?'No language change reported':fallback?.state==='reported'?'A language change is planned':'Not reported';
    return section('Language & voice',[
      ['Capability language',language(capability?.code)],['Request accepted for this language',yesNo(capability?.accepted)],['Language change',change],
      ...(fallback?.state==='reported'?[['Requested language',language(fallback.requested)],['Language after fallback',language(fallback.planned)],['Requested language evidence',label(fallback.requestedState)]]:[]),
      ['Singing evidence',label(capability?.singing)],['Speech evidence',label(capability?.speech)],['Generation method',label(capability?.generation)],
      ['Transcription',label(capability?.transcription)],['Lyric comparison',label(capability?.intelligibilityGate)],['Comparison threshold',label(capability?.calibration)]
    ],'These are the service’s reported capabilities and planned language choices. No vocals have been generated or measured by this preview.')+
    section('Timing & structure',[
      ['Target duration',unit(conform?.targetSeconds,' seconds')],['Allowed difference',unit(conform?.toleranceSeconds,' seconds')],
      ['If the length differs',label(conform?.onMiss)],['Tempo',unit(conform?.tempoBpm,' BPM')],['Time signature',label(conform?.timeSignature)]
    ])+section('Mastering & sound',[
      ['Mastering profile',label(mastering?.target)],['Loudness target',unit(mastering?.loudnessLufs,' LUFS')],['Peak ceiling',unit(mastering?.truePeakDb,' dB')],
      ['Normalize output',yesNo(mastering?.normalizeOutput)],['Dynamic range target',unit(mastering?.dynamicRangeLu,' LU')]
    ],'Targets from the resolved plan. The finished audio will report its measured results separately.')+
    section('Finishing touches',[
      ['Fade in',unit(postEdits?.fadeInSeconds,' seconds')],['Fade out',unit(postEdits?.fadeOutSeconds,' seconds')],['Channels',label(postEdits?.channelLayout)]
    ])+section('Separate parts',[
      ['Requested parts',list(stems?.requested)],['Parts planned for separation',list(stems?.separatedRequested)],['Planned separation calls',stems?.separatorCalls]
    ],'This plan does not guarantee every requested part will be delivered. Each finished part has its own delivery status.');
  }
  function show(result){
    if(result.kind==='capability-preview'){
      const c=result.capabilities;
      P.dialog('Available music settings',`<p class="notice">${c.request_parameter_count} request parameters are available. This checks the contract and does not generate music.</p><div class="request-parameter-list">${c.parameters.map(p=>`<div><strong>${esc(window.PMPControls.label(window.PMPControls.schema.parameters.find(n=>n.key===p.name)||{key:p.name}))}</strong><code>${esc(p.name)}</code></div>`).join('')}</div>`);
      return;
    }
    if(result.kind!=='request-preview')throw Error('This response is not a request preview.');
    if(result.musicGenerated!==false)throw Error('This result is not a confirmed non-generating preview.');
    const rows=[['Music model',result.model],['Target duration',unit(result.settings.durationSeconds,' seconds')],['Requested takes',result.settings.takes],['File format',result.settings.export],['Creation quality',result.settings.quality],['Instrumental plan',yesNo(result.settings.instrumentalOnly)]];
    P.dialog('Your creation plan',`<p class="notice">${esc(result.notice)}</p>${facts(rows)}<p class="connected-caption">The service received ${result.received.length} request parameters.</p>${detailSections(result)}<details class="request-plan-section"><summary>Compiled music description</summary><pre>${esc(result.promptSent||'The service did not return a compiled description.')}</pre></details><details class="request-plan-section"><summary>How your settings were applied</summary>${result.bindings.map(item=>`<div class="request-binding"><strong>${esc(window.PMPControls?.label(window.PMPControls.schema.parameters.find(n=>n.key===item.parameter)||{key:item.parameter})||item.parameter)}</strong><pre>${esc(item.sent??item.description??item.note??item.reason??item.binding??'Recorded by the service.')}</pre>${item.sent_to_model===false?'<small>This value was not sent as a model parameter.</small>':''}</div>`).join('')}</details>`);
  }
  window.PMPPreview={show};
})();
