// Public, owner-scoped interpretation of the documented delivery envelope.
// No upstream object, freeform text, URL, storage path or identity is copied.
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const get = (value, key) => record(value) ? Object.getOwnPropertyDescriptor(value, key)?.value : undefined;
const bool = value => typeof value === 'boolean' ? value : null;
const number = (value, min = 0, max = 900, integer = false) => {
  if (typeof value === 'string') value = /^-?\d{1,16}(?:\.\d{1,12})?$/.test(value) ? Number(value) : null;
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isSafeInteger(value)) ? value : null;
};
const choice = (value, values) => typeof value === 'string' && value.length <= 100 && values.includes(value) ? value : null;
const list = (value, limit = 32) => Array.isArray(value) ? value.slice(0, limit) : [];
const one = value => number(value, 0, 1);
const seconds = value => number(value, 0, 86400);
const tally = value => number(value, 0, 1000000, true);
const MODELS = ['lyria-3-pro-preview', 'lyria-3-clip-preview', 'lyria-002'];
const LANGUAGES = 'en tr zh ja ko ru es fr de it pt af am ar as az be bg bn bs ca ceb co cs cy da dv el eo et eu fa fi fil fy ga gd gl gu ha haw hi hmn hr ht hu hy id ig is iw jv ka kk km kn kri ku ky la lb lo lt lv mg mi mk ml mn mni-Mtei mr ms mt my ne nl no ny or pa pl ps ro sd si sk sl sm sn so sq sr st su sv sw ta te tg th ug uk ur uz vi xh yi yo zu'.split(' ');
const LANGUAGE_STATES = ['SINGING_PROVEN','SPEECH_PROVEN','ENGINEERING_PATH_ESTABLISHED','DOCUMENTED_CONVERGENT','DOCUMENTED_SINGLE','PENDING_MEASUREMENT','NOT_MEASURED','NOT_IN_REGISTRY'];
const ANALYSIS_STATES = ['MEASURED','NOT_MEASURABLE','ESTIMATED_UNCALIBRATED','NOT_RUN','NOT_AVAILABLE','FAILED'];
const CALIBRATION = ['CALIBRATED','PARTIALLY_CALIBRATED','NOT_CALIBRATED','CALIBRATION_FAILED','NOT_RUN'];
const CLASSES = ['duple','triple','quintuple','septuple'];
const CODECS = ['wav','mp3','aac','flac','opus','vorbis','pcm_u8','pcm_s8','pcm_s16le','pcm_s16be','pcm_s24le','pcm_s24be','pcm_s32le','pcm_s32be','pcm_f32le','pcm_f32be','pcm_f64le','pcm_f64be'];
const EXPORTS = ['wav24_48k','wav16_48k','flac_48k','mp3_320','mp3_native'];
const ROLES = ['MUSIC_BED','LEAD_VOCAL','BACKING_VOCAL','FX','AMBIENCE'];
const STAGES = ['lyria_generate','lyria_fetch','separator','asr_transcribe','gemini_text','render_master','storage_upload','measure_ffprobe','webhook_push'];
const key = value => typeof value === 'string' && /^[A-G](?:#|b)?\|(?:major|minor|dorian|phrygian|lydian|mixolydian|locrian)$/.test(value) ? value : null;
const meter = value => typeof value === 'string' && /^(?:[1-9]|1[0-6])\/(?:1|2|4|8|16|32)$/.test(value) ? value : null;
const sourceDomain = value => {
  if (typeof value !== 'string' || value.length > 160) return null;
  return /^(?:processed|delivered) master(?: \(render_plan\.processed_gcs_uri\))?(?:, ffprobe on the file)?$/.test(value) ? 'delivered-master'
    : value === 'raw generator output' || value === 'source_take' ? 'raw-source' : null;
};

function routing(payload, result) {
  const route = get(result, 'route'); if (!record(route)) return null;
  const delegate = get(route, 'delegate_reported');
  const selected = choice(get(route, 'model'), MODELS), reported = choice(get(delegate, 'model'), MODELS);
  return { requested: choice(get(payload,'route'), ['auto',...MODELS]), model: selected, reportedModel: reported,
    modelMatches: selected !== null && reported !== null ? selected === reported : null,
    surface: choice(get(delegate,'surface'), ['interactions','prediction']) };
}

function language(payload, result) {
  const capability = get(result,'language_capability'), fallback = get(result,'language_fallback');
  const vocal = get(payload,'vocal'), lyric = get(payload,'lyrics');
  const requested = choice(get(lyric,'language'),LANGUAGES) ?? choice(get(vocal,'language'),LANGUAGES);
  // A legacy reason proves only a reported fallback, not its parsed destination.
  const fallbackState = fallback === null ? 'none' : record(fallback) || typeof fallback === 'string' && fallback.length > 0 ? 'reported' : 'unavailable';
  if (!record(capability) && fallbackState === 'unavailable' && requested === null) return null;
  return { requested, policy: choice(get(vocal,'language_policy'),['measure','strict','prefer_proven']),
    fallback: { state: fallbackState, requested: choice(get(fallback,'requested'),LANGUAGES), delivered: choice(get(fallback,'delivered'),LANGUAGES), requestedState: choice(get(fallback,'requested_state'),LANGUAGE_STATES) },
    capability: record(capability) ? { code: choice(get(capability,'code'),LANGUAGES), accepted: bool(get(capability,'accepted')),
      generation: choice(get(capability,'generation'),['PROMPT_LANGUAGE']), transcription: choice(get(capability,'transcription'),['GEMINI_DOCUMENTED']),
      intelligibilityGate: choice(get(capability,'intelligibility_gate'),['PHONEMISER_AVAILABLE','GRAPHEME_METRICS_ONLY']),
      calibration: choice(get(capability,'bar'),CALIBRATION), singing: choice(get(capability,'singing'),LANGUAGE_STATES), speech: choice(get(capability,'speech'),LANGUAGE_STATES) } : null };
}

function seed(payload, result) {
  const value = get(result,'seed'); if (!record(value)) return null;
  return { requested: number(get(payload,'seed'),0,Number.MAX_SAFE_INTEGER,true), value: number(get(value,'value'),0,Number.MAX_SAFE_INTEGER,true),
    source: get(value,'source') === 'server (secrets.randbits(31))' ? 'server' : choice(get(value,'source'),['caller','request']),
    sentToModel: bool(get(value,'sent_to_model')), interpretation: 'provenance-only-no-repeatability-guarantee' };
}

function audioProbe(value) {
  if (!record(value)) return null;
  return { codec: choice(get(value,'codec_name') ?? get(value,'codec'),CODECS), sampleRate: number(get(value,'sample_rate'),8000,192000,true),
    channels: number(get(value,'channels'),1,8,true), bitsPerSample: number(get(value,'bits_per_sample'),1,64,true),
    rawBitsPerSample: number(get(value,'bits_per_raw_sample'),1,64,true), bitRate: number(get(value,'bit_rate'),1,100000000,true),
    sampleFormat: choice(get(value,'sample_fmt'),['u8','s16','s32','s64','flt','dbl','u8p','s16p','s32p','s64p','fltp','dblp']),
    durationSeconds: number(get(value,'duration_seconds'),0.001,900), sizeBytes: number(get(value,'size_bytes'),1,1073741824,true) };
}

function render(plan, take) {
  if (!record(plan)) return null;
  const stages=get(plan,'stages'), conform=get(stages,'conform'), conformPlan=get(conform,'plan') ?? conform, derivation=get(conformPlan,'derivation');
  const master=get(stages,'master'), target=get(master,'target'), verification=get(master,'verification'), edits=get(stages,'post_edits'), exported=get(stages,'export');
  return { take, executed:bool(get(plan,'executed')),
    conform:record(conform)?{ok:bool(get(conform,'ok')),action:choice(get(conformPlan,'action'),['trim','pad','passthrough','accept','refuse_pad','regenerate_required']),
      measuredSeconds:number(get(conform,'measured_duration_seconds'),0.001,900),sourceSeconds:number(get(conformPlan,'delivered_seconds'),0.001,900),
      cutSeconds:number(get(conformPlan,'cut_seconds'),0.001,900),fadeSeconds:number(get(conformPlan,'fade_seconds'),0,900),
      barSeconds:number(get(derivation,'bar_seconds'),0.001,120),tempoBpm:number(get(derivation,'tempo_bpm'),1,1000),meter:meter(get(derivation,'time_signature')),barAligned:bool(get(derivation,'bar_aligned'))}:null,
    master:record(master)?{ok:bool(get(master,'ok')),applied:bool(get(master,'applied')),skipped:bool(get(master,'skipped')),
      mode:choice(get(master,'mode'),['linear_gain_plus_true_peak_limiter','loudnorm','two_pass_linear_loudnorm']),dualMono:bool(get(master,'dual_mono')),
      gainDb:number(get(master,'applied_gain_db'),-120,120),limiterDb:number(get(master,'limiter_limit_db'),-120,30),relimitPasses:number(get(master,'relimit_passes'),0,32,true),overshootDb:number(get(master,'residual_overshoot_db'),0,30),
      targetLufs:number(get(target,'lufs'),-120,10),targetPeakDb:number(get(target,'true_peak_db'),-120,30),
      measured:bool(get(verification,'measured')),hasAudio:bool(get(verification,'has_audio')),integratedLufs:number(get(verification,'integrated_lufs'),-120,10),truePeakDbtp:number(get(verification,'true_peak_dbtp'),-120,30),loudnessRangeLu:number(get(verification,'lra_lu'),0,100)}:null,
    postEdits:record(edits)?{ok:bool(get(edits,'ok')),applied:bool(get(edits,'applied')),fadeInSeconds:number(get(edits,'fade_in_seconds'),0,900),fadeOutSeconds:number(get(edits,'fade_out_seconds'),0,900),channelLayout:choice(get(edits,'channel_layout'),['mono','stereo'])}:null,
    export:record(exported)?{ok:bool(get(exported,'ok')),applied:bool(get(exported,'applied')),requested:choice(get(exported,'requested'),EXPORTS),sizeBytes:number(get(exported,'file_size_bytes'),1,1073741824,true),
      measured:audioProbe(get(exported,'measured')),source:audioProbe(get(exported,'source')),upsampledFrom:audioProbe(get(exported,'upsampled_from'))}:null,
    finalProbe:audioProbe(get(plan,'processed_probe')),
    provenance:provenance({c2pa:get(stages,'provenance'),watermark:get(stages,'watermark')}) };
}

const VALIDATION_CODES=['timeStamp.validated','claimSignature.insideValidity','claimSignature.validated','assertion.hashedURI.match','assertion.dataHash.match','timeStamp.untrusted','signingCredential.untrusted'];
function provenance(value) {
  const c2pa=get(value,'c2pa'), mark=get(value,'watermark'), synth=get(value,'synthid'), ddex=get(value,'ddex_ai_credit');
  if (![c2pa,mark,synth,ddex].some(item=>record(item)||typeof item==='boolean')) return null;
  const detection=get(mark,'detection'), calibration=get(mark,'calibration'), codes=get(c2pa,'validation_codes');
  const control = item => record(item)?{samples:tally(get(item,'n')),detected:tally(get(item,'detected')),minProbability:one(get(item,'min_probability')),maxProbability:one(get(item,'max_probability')),messageMatches:tally(get(item,'message_matches'))}:null;
  const codeList = category => list(get(codes,category)).map(item=>choice(item,VALIDATION_CODES)).filter(Boolean);
  const unknownCodes = category => list(get(codes,category)).filter(item=>choice(item,VALIDATION_CODES)===null).length;
  return { interpretation:'upstream-delivery-report',
    c2pa:record(c2pa)?{state:choice(get(c2pa,'state'),['signed','absent','failed']),survivedRender:bool(get(c2pa,'survived_render')),trust:choice(get(c2pa,'trust'),['trusted','untrusted_own_ca']),validation:choice(get(c2pa,'validation_state'),['Valid','Trusted','Invalid']),
      validationCodes:{success:codeList('success'),informational:codeList('informational'),failure:codeList('failure')},validationCodesTruncated:['success','informational','failure'].some(name=>Array.isArray(get(codes,name))&&get(codes,name).length>32),
      unrecognizedValidationCodes:{success:unknownCodes('success'),informational:unknownCodes('informational'),failure:unknownCodes('failure')},
      assertions:list(get(c2pa,'manifest_assertions')).map(item=>choice(item,['c2pa.actions','com.ideasets.music-api.generation','c2pa.soft-binding'])).filter(Boolean)}:typeof c2pa==='boolean'?{state:'legacy-intent-only',intent:c2pa}:null,
    watermark:record(mark)?{state:choice(get(mark,'state'),['embedded_uncalibrated','embedded_calibrated','absent','failed']),algorithm:choice(get(mark,'algorithm'),['com.aiwatermark.audioseal.1']),messageId:number(get(mark,'message_id'),0,65535,true),
      detected:bool(get(detection,'detected')),probability:one(get(detection,'probability')),meanFrameProbability:one(get(detection,'mean_frame_probability')),detectedMessageId:number(get(detection,'message_id'),0,65535,true),messageBitConfidence:one(get(detection,'message_bit_confidence')),
      sampleRate:number(get(detection,'sample_rate_hz'),8000,192000,true),seconds:seconds(get(detection,'seconds')),detectionSeconds:seconds(get(detection,'detect_time_s')),rmsDbfs:number(get(mark,'watermark_rms_dbfs'),-160,0),softBindingInManifest:bool(get(mark,'soft_binding_in_manifest')),
      calibration:record(calibration)?{calibrated:bool(get(calibration,'calibrated')),state:choice(get(calibration,'status'),CALIBRATION),threshold:one(get(calibration,'threshold')),marked:control(get(calibration,'marked')),unmarked:control(get(calibration,'unmarked'))}:null}:null,
    synthid:record(synth)?{state:choice(get(synth,'state'),['vendor_stated_not_verified']),verified:false}:null,
    ddex:record(ddex)?{state:choice(get(ddex,'state'),['declared','written']),version:choice(get(ddex,'version'),['ERN 4.3.2']),containsAi:choice(get(ddex,'contains_ai'),['None','Partly','All']),contributor:choice(get(ddex,'special_contributor'),['GenerativeAI'])}:typeof ddex==='boolean'?{state:'legacy-intent-only',intent:ddex}:null };
}

function calibrationBar(value) {
  if (!record(value)) return null;
  const held=get(value,'held_out');
  return {state:choice(get(value,'status'),CALIBRATION),theta:one(get(value,'theta')),targetRisk:one(get(value,'target_risk')),
    heldOut:record(held)?{samples:tally(get(held,'n')),accepted:tally(get(held,'accepted')),errors:tally(get(held,'errors')),coverage:one(get(held,'coverage')),risk:one(get(held,'test_risk') ?? get(held,'risk'))}:null,
    gatedClasses:list(get(value,'gated_classes'),4).map(item=>choice(item,CLASSES)).filter(Boolean),excludedClasses:list(get(value,'excluded_classes'),4).map(item=>choice(item,CLASSES)).filter(Boolean)};
}

function estimate(value, type) {
  if (!record(value)) return null;
  const agreement=get(value,'agreement'), analysis=get(value,'analysis'), branch=get(value,'learned_branch'), engine=get(value,'engine');
  const shared={state:choice(get(value,'state'),ANALYSIS_STATES),kappa:one(get(value,'kappa')),threshold:one(get(value,'theta')),measuredOn:sourceDomain(get(value,'measured_on')),calibration:calibrationBar(get(value,'bar')),
    learnedAttempted:bool(get(branch,'attempted')),inferenceSeconds:seconds(get(engine,'inference_s')),interpretation:'reported-estimate-not-correction'};
  if(type==='tempo')return {...shared,requestedBpm:number(get(value,'tempo_bpm_requested'),1,1000),estimatedBpm:number(get(value,'tempo_bpm_estimated'),1,1000),
    agreement:record(agreement)?{withinFourPercent:bool(get(agreement,'acc1_within_4pct')),octaveTolerant:bool(get(agreement,'acc2_octave_tolerant')),octaveError:number(get(agreement,'octave_error_oe1'),-32,32)}:null,
    analysis:record(analysis)?{windowSeconds:seconds(get(analysis,'ac_size_s')),sampleRate:number(get(analysis,'analysis_sample_rate_hz'),1,192000,true),durationSeconds:seconds(get(analysis,'duration_s')),maxTempo:number(get(analysis,'max_tempo'),1,1000),onsetFrames:tally(get(analysis,'onset_frames')),priorBpm:number(get(analysis,'prior_start_bpm'),1,1000),priorOctaves:number(get(analysis,'prior_std_octaves'),0,32)}:null};
  if(type==='key'){
    const distribution=get(analysis,'distribution'),correlations=get(analysis,'correlations'),confidence=get(analysis,'confidence');
    const keys=[];for(const root of ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'])for(const mode of ['major','minor'])keys.push(`${root}|${mode}`);
    const scores=(input,min,max)=>record(input)?keys.filter(name=>Object.hasOwn(input,name)).map(name=>({key:name,value:number(get(input,name),min,max)})):[];
    return {...shared,requested:key(get(value,'key_requested')),estimated:key(get(value,'key_estimated')),score:one(get(agreement,'mirex_weighted_score')),relation:choice(get(agreement,'relation'),['same','fifth','relative','parallel','other']),
      bestCorrelation:number(get(value,'best_correlation'),-1,1),margin:number(get(value,'margin_over_second'),0,2),
      // The saved live array has 24 probabilities but the supplied contract does
      // not state their key ordering. Preserve indices; never invent key labels.
      distribution:Array.isArray(distribution)?list(distribution,24).map((value,index)=>({index,key:null,value:one(value)})):scores(distribution,0,1),
      distributionFormat:Array.isArray(distribution)?'indexed-unlabelled':record(distribution)?'labelled':'unavailable',distributionTruncated:Array.isArray(distribution)&&distribution.length>24,
      confidence:record(confidence)?{maxProbability:one(get(confidence,'max_prob')),margin:one(get(confidence,'margin_top1_top2')),negativeEntropy:number(get(confidence,'neg_entropy'),-32,0)}:null,
      correlations:scores(correlations,-1,1)};
  }
  const histogram=get(analysis,'beats_per_bar_histogram');
  return {...shared,requestedNumerator:number(get(value,'numerator_requested'),1,16,true),estimatedNumerator:number(get(value,'numerator_estimated'),1,16,true),value:meter(get(value,'value')),equivalenceClass:choice(get(value,'equivalence_class'),CLASSES),
    agreement:record(agreement)?{classMatch:bool(get(agreement,'equivalence_class_match')),exactMatch:bool(get(agreement,'exact_match')),requestedClass:choice(get(agreement,'requested_class'),CLASSES),estimatedClass:choice(get(agreement,'estimated_class'),CLASSES)}:null,
    tactusBpm:number(get(value,'tactus_bpm'),1,1000),margin:number(get(value,'margin_over_second'),0,1000),
    analysis:record(analysis)?{beats:tally(get(analysis,'beats')),downbeats:tally(get(analysis,'downbeats')),bars:tally(get(analysis,'bars')),histogram:Array.from({length:16},(_,i)=>i+1).filter(n=>record(histogram)&&Object.hasOwn(histogram,String(n))).map(n=>({numerator:n,bars:tally(get(histogram,String(n)))})),
      features:record(get(analysis,'features'))?{modeFraction:one(get(get(analysis,'features'),'mode_fraction')),modeMargin:one(get(get(analysis,'features'),'margin_mode_second')),bars:tally(get(get(analysis,'features'),'n_bars')),beatRegularityCv:number(get(get(analysis,'features'),'beat_regularity_cv'),0,1000),downbeatRegularityCv:number(get(get(analysis,'features'),'downbeat_regularity_cv'),0,1000)}:null}:null};
}

function analysis(result) {
  const outputs=get(result,'analysis_outputs'),measured=get(result,'measured');
  if(!record(outputs)&&!record(measured))return null;
  return {source:'upstream',interpretation:'reported-measurements-null-is-unavailable',
    outputs:record(outputs)?{integratedLufs:number(get(outputs,'measured_loudness_lufs'),-120,10),truePeakDbtp:number(get(outputs,'measured_true_peak_dbtp'),-120,30),loudnessRangeLu:number(get(outputs,'measured_loudness_range_lu'),0,100),durationSeconds:number(get(outputs,'measured_duration_seconds'),0.001,900),channels:number(get(outputs,'measured_channels'),1,8,true),sampleRate:number(get(outputs,'measured_sample_rate'),8000,192000,true),codec:choice(get(outputs,'measured_codec'),CODECS)}:null,
    tempo:estimate(get(measured,'tempo'),'tempo'),key:estimate(get(measured,'key_estimated'),'key'),meter:estimate(get(measured,'time_signature_estimated'),'meter')};
}

function mix(result) {
  const value=get(result,'mix_plan');if(!record(value))return null;
  const layers=get(value,'layers'),refusals=get(value,'refusals');
  return {multiPath:bool(get(value,'multi_path')),layerCount:number(get(value,'layer_count'),0,32,true),instantiated:bool(get(get(value,'stage'),'instantiated')),
    layers:list(layers).map(item=>({role:choice(get(item,'role'),ROLES),model:choice(get(item,'engine'),MODELS),origin:choice(get(item,'origin'),['ENGINE_GENERATED','SEPARATED','GENERATED']),deliveryClass:choice(get(item,'delivery_class'),['SHIPPABLE','ANALYSIS_ONLY','REFUSED'])})),
    refusals:list(refusals).map(item=>({role:choice(get(item,'role'),ROLES),refused:bool(get(item,'refused'))})),truncated:Array.isArray(layers)&&layers.length>32||Array.isArray(refusals)&&refusals.length>32};
}

function execution(payload,result) {
  const budget=get(result,'budget'),attempt=get(get(result,'job'),'attempt'),regeneration=get(result,'duration_regeneration'),shortfall=get(result,'generation_shortfall'),rights=get(result,'rights');
  const stages=get(budget,'stages');
  return {durationRegeneration:{state:regeneration===null?'none':record(regeneration)?'reported':'unavailable',requestedPolicy:choice(get(get(payload,'duration'),'on_miss'),['trim','accept','regenerate'])},
    attempt:record(attempt)?{retryCount:tally(get(attempt,'retry_count')),executionCount:tally(get(attempt,'execution_count'))}:null,
    shortfall:record(shortfall)?{requested:number(get(shortfall,'takes_requested'),0,32,true),generated:number(get(shortfall,'takes_generated'),0,32,true),failedTake:number(get(shortfall,'failed_take'),1,32,true),code:choice(get(shortfall,'error_code'),['VENDOR_CONTENT_BLOCKED','GENERATION_FAILED']),retriedByService:bool(get(get(shortfall,'vendor_refusal'),'retried_by_service'))}:null,
    budget:record(budget)?{totalSeconds:seconds(get(budget,'total_seconds')),elapsedSeconds:seconds(get(budget,'elapsed_seconds')),remainingSeconds:seconds(get(budget,'remaining_seconds')),
      stages:list(stages,64).map(item=>({name:choice(get(item,'name'),STAGES),timeoutSeconds:seconds(get(item,'timeout_seconds')),remainingAtStartSeconds:seconds(get(item,'remaining_at_start_seconds')),elapsedSeconds:seconds(get(item,'elapsed_seconds')),outcome:choice(get(item,'outcome'),['ok','failed','error','timeout','refused','skipped'])})),truncated:Array.isArray(stages)&&stages.length>64}:null,
    rights:record(rights)?{commercialUse:bool(get(rights,'commercial_use')),sync:bool(get(rights,'sync')),copyrightWarranted:bool(get(rights,'copyright_warranted')),interpretation:'platform-assertion'}:null};
}

export function summarizeDetails(payload,result){
  if(!record(result))return null;
  const tracks=list(get(result,'tracks')),processing=[],seen=new Set();
  const firstPlan=get(tracks.find(track=>get(track,'take')===1),'render_plan') ?? get(result,'render_plan');
  if(record(firstPlan)){processing.push(render(firstPlan,1));seen.add(1);}
  for(const track of tracks){const take=number(get(track,'take'),1,32,true);if(take!==null&&!seen.has(take)&&record(get(track,'render_plan'))){processing.push(render(get(track,'render_plan'),take));seen.add(take);}}
  return {routing:routing(payload,result),language:language(payload,result),seed:seed(payload,result),processing,
    provenance:provenance(get(result,'compliance')),analysis:analysis(result),mix:mix(result),execution:execution(payload,result)};
}
