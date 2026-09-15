// A strict projection of server-owned API results. Never spread upstream objects
// into this output. Request text, transcripts, URLs, paths and freeform reasons
// belong to private records. These are upstream measurements, not new local ASR.
import { summarizeDetails } from './result-details.mjs';
const LANGUAGES = new Map('en tr zh ja ko ru es fr de it pt af am ar as az be bg bn bs ca ceb co cs cy da dv el eo et eu fa fi fil fy ga gd gl gu ha haw hi hmn hr ht hu hy id ig is iw jv ka kk km kn kri ku ky la lb lo lt lv mg mi mk ml mn mni-Mtei mr ms mt my ne nl no ny or pa pl ps ro sd si sk sl sm sn so sq sr st su sv sw ta te tg th ug uk ur uz vi xh yi yo zu'.split(' ').map(code => [code.toLowerCase(), code]));
// Language IDs above are the actual 2026-09-12 capabilities snapshot. Unknown new
// IDs become null here until reviewed; this summary does not restrict generation.
const MODES = new Set(['none', 'custom', 'ai_write']);
const DOMAINS = new Set(['stem', 'mix']);
const METRICS = new Set(['per', 'cer', 'wer', 'ser']);
const VERDICTS = new Set(['PASS', 'FAIL', 'WARN', 'NOT_CALIBRATED', 'NOT_MEASURABLE', 'GRAPHEME_ONLY', 'NOT_APPLICABLE', 'SKIPPED', 'UNAVAILABLE', 'PENDING', 'ERROR', 'FAILED', 'NOT_RUN', 'REFUSED', 'NOT_AVAILABLE']);
const ORIGINALITY_VERDICTS = new Set(['PASS', 'MONOTONE_FLAGGED', 'CARBON_COPY_FLAGGED', 'NOT_CALIBRATED', 'NOT_MEASURABLE', 'NOT_APPLICABLE', 'NOT_RUN', 'UNAVAILABLE', 'FAILED']);
const CALIBRATION = new Set(['CALIBRATED', 'PARTIALLY_CALIBRATED', 'NOT_CALIBRATED', 'CALIBRATION_FAILED', 'NOT_RUN']);
const CALIBRATION_GENRES = new Set(['singer_songwriter_acoustic']);
// Exact published scope sentence (docs/api/12); unknown prose remains private.
const CALIBRATION_SCOPE = 'these bars judge material of this genre class; widening is a new calibration';
const STEMS = new Set(['master','vocals','music','drums','bass','fx','ambience']);
const STEM_STATES = new Set(['DELIVERED','REFUSED_LICENCE','NOT_BUILT','NOT_AVAILABLE','NOT_REQUESTED','FAILED','NOT_RUN']);
const ORIGINS = new Set(['separated','generated','rendered']);
const GRADES = new Set(['analysis-grade','delivery-grade']);
const MEDIA_STATES = new Set(['ready','partial','failed','ingesting']);
const CODECS = new Set(['mp3','aac','flac','opus','vorbis','pcm_u8','pcm_s8','pcm_s16le','pcm_s16be','pcm_s24le','pcm_s24be','pcm_s32le','pcm_s32be','pcm_f32le','pcm_f32be','pcm_f64le','pcm_f64be']);
const PENDING = new Set(['pending', 'queued', 'processing', 'running']);
const FAILED = new Set(['failed', 'error']);
const COMPLETE = new Set(['complete', 'completed']);
const get = (object, key) => object && typeof object === 'object' && !Array.isArray(object) ? Object.getOwnPropertyDescriptor(object, key)?.value : undefined;
const lower = value => typeof value === 'string' && value.length <= 40 ? value.toLowerCase() : null;
const pick = (value, allowed) => { const key = lower(value); return allowed.has(key) ? key : null; };
const bool = value => typeof value === 'boolean' ? value : null;
const upperPick = (value, allowed) => { const key = typeof value === 'string' && value.length <= 40 ? value.toUpperCase() : null; return allowed.has(key) ? key : null; };
const verdict = value => upperPick(value, VERDICTS);
const language = value => LANGUAGES.get(lower(value)) ?? null;
const numeric = (value, min, max, integer = false) => {
  if (typeof value === 'string') { if (!/^-?\d{1,12}(?:\.\d{1,12})?$/.test(value)) return null; value = Number(value); }
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value)) ? value : null;
};
const duration = value => numeric(value, 0.001, 900);
const count = value => numeric(value, 0, 32, true);
const boundedArray = value => Array.isArray(value) ? value.slice(0, 32) : [];

function measuredDuration(probe, measurement) {
  const finalDuration = duration(get(probe, 'duration_seconds'));
  if (finalDuration !== null) return { seconds: finalDuration, measured: true };
  const seconds = duration(get(measurement, 'duration_seconds'));
  // The explicit false flag must not be overridden by a plausible number.
  return { seconds, measured: seconds === null ? null : bool(get(measurement, 'duration_measured')) };
}

function measuredDomain(verification) {
  const domain = get(verification, 'measurement_domain');
  if (typeof domain === 'string') return pick(domain, DOMAINS);
  const recorded = lower(get(domain, 'measured_on'));
  if (recorded === 'separated vocal stem' || recorded === 'stem') return 'stem';
  if (recorded === 'mix' || recorded === 'delivered mix' || recorded === 'delivered master' || recorded === 'processed master') return 'mix';
  return null;
}

function summarizeLyrics(payload, result, state) {
  const requested = get(payload, 'lyrics');
  const vocal = get(payload, 'vocal');
  const record = get(result, 'lyrics_verification');
  const requestedMode = pick(get(requested, 'mode'), MODES);
  const requestedVerify = bool(get(requested, 'verify'));
  const reportedVerdict = verdict(get(record, 'verdict'));
  const reportedState = lower(get(record, 'state') ?? get(record, 'status'));
  const measured = bool(get(record, 'measured'));
  const primary = get(record, 'primary_metric');
  const requestedMetric = pick(get(payload, 'lyrics_verify_metric'), METRICS) ?? pick(get(record, 'verify_metric'), METRICS);
  // An unavailable requested metric leaves the separately labelled PER gate in
  // force (response-envelope contract); never call that score SER/CER/WER.
  const primaryUnavailable = verdict(get(primary, 'verdict')) === 'NOT_RUN';
  const metric = primaryUnavailable ? 'per' : pick(get(primary, 'metric'), METRICS) ?? pick(get(record, 'verify_metric'), METRICS);
  const value = numeric(primaryUnavailable ? get(record, 'per') : get(primary, 'value') ?? (metric ? get(record, metric) : undefined), 0, 1000);
  const threshold = numeric(primaryUnavailable ? get(record, 'threshold') : get(primary, 'threshold') ?? get(record, 'threshold'), 0, 1000);
  const gateVerdict = primaryUnavailable ? reportedVerdict : verdict(get(primary, 'verdict')) ?? reportedVerdict;
  const actualDomain = measuredDomain(record);
  const rawBarSource=get(record,'bar_source');
  const barSourceText=typeof rawBarSource==='string'&&rawBarSource.length<=512?rawBarSource:null;
  const override=/^lyrics_threshold_override=(\d(?:\.\d{1,12})?)$/.exec(barSourceText??'');
  const callerThreshold=override?numeric(override[1],0,1):null;
  const notComparable=barSourceText==='NOT_COMPARABLE'||barSourceText?.startsWith('NOT_COMPARABLE ')===true;
  const barSource=notComparable?'not-comparable':callerThreshold!==null?'caller-override':barSourceText==='data/language_registry.json'?'language-registry':null;
  let lyricState = 'unavailable';
  if (record) {
    if ((get(record, 'skipped_by_caller') === true && get(record, 'gate_ran') === false) || reportedState === 'skipped' || gateVerdict === 'SKIPPED' || gateVerdict === 'NOT_RUN') lyricState = 'skipped';
    else if (reportedState === 'not_applicable' || gateVerdict === 'NOT_APPLICABLE') lyricState = 'not-applicable';
    else if (PENDING.has(reportedState) || gateVerdict === 'PENDING') lyricState = 'pending';
    else if (measured === true) lyricState = 'measured';
    else if (gateVerdict === 'PASS' || gateVerdict === 'FAIL') lyricState = 'unverified';
  } else if ((lower(get(vocal, 'mode')) === 'instrumental' && requestedMode !== 'custom' && requestedMode !== 'ai_write') || requestedMode === 'none') lyricState = 'not-applicable';
  else if (requestedVerify === false) lyricState = 'skipped';
  else if (state === 'pending' && requestedMode === 'custom') lyricState = 'pending';
  // Preserve non-calibrated/grapheme-only states. PASS/FAIL requires an explicit
  // measured flag and valid numeric gate; it never means every word was sung.
  const categoricalGate = gateVerdict === 'PASS' || gateVerdict === 'FAIL';
  const reportableVerdict = categoricalGate && (measured !== true || value === null || threshold === null) ? null : gateVerdict;
  if (categoricalGate && reportableVerdict === null) lyricState = 'unverified';
  return {
    requestedMode,
    requestedVerify,
    requestedLanguage: language(get(requested, 'language')) ?? language(get(vocal, 'language')),
    requestedDomain: pick(get(payload, 'lyrics_measurement_domain'), DOMAINS),
    requestedMetric,
    primaryMetricState: primaryUnavailable ? 'unavailable' : null,
    state: lyricState,
    measured,
    verdict: reportableVerdict,
    metric,
    value,
    threshold,
    language: language(get(record, 'language')),
    measuredDomain: actualDomain,
    barSource,
    requestedThreshold: numeric(get(payload,'lyrics_threshold_override'),0,1),
    callerThreshold,
    calibrationDomainMatch: notComparable||actualDomain==='mix'?false:actualDomain==='stem'?true:null,
    source: 'upstream',
    interpretation: 'measured-gate-only',
  };
}

function summarizeOriginality(payload, result, poll) {
  const initial = get(result, 'originality_gate');
  const hasPoll = !!poll && typeof poll === 'object' && !Array.isArray(poll);
  const record = hasPoll ? poll : initial;
  const requested = bool(get(payload, 'run_originality_gate'));
  const reportedState = lower(get(record, 'status') ?? get(record, 'state'));
  const report = get(record, 'verdict');
  const measured = COMPLETE.has(reportedState) ? bool(get(report, 'measured')) : bool(get(record, 'measured'));
  let state = 'unavailable';
  if (get(record, 'success') === false) state = 'unavailable';
  else if (PENDING.has(reportedState) || get(record, 'pending') === true) state = 'pending';
  else if (FAILED.has(reportedState)) state = 'failed';
  else if (COMPLETE.has(reportedState)) state = 'complete';
  else if (reportedState === 'unavailable') state = 'unavailable';
  else if (!hasPoll && requested !== true) state = 'not-requested';
  // opt_in:true in the actual API is an opt-in instruction, not a started job.
  // This gate has two separate judgments. There is no aggregate PASS verdict.
  const axes = state === 'complete' && report && typeof report === 'object' && !Array.isArray(report) ? originalityAxes(report) : null;
  return { requested, state, measured, verdict: null, calibration: axes ? upperPick(get(report, 'bars_status'), CALIBRATION) : null, axes };
}

const takeNumber = value => {
  if (typeof value !== 'string' || !/^take_\d{1,2}$/.test(value)) return null;
  return numeric(Number(value.slice(5)), 1, 32, true);
};
function originalityAxes(report) {
  const monotony = get(report, 'axis1_monotony'), similarity = get(report, 'axis2_similarity');
  const calibration = get(report, 'bars_status_per_axis');
  const lag = get(monotony, 'lag_scan'), tile = get(monotony, 'tile_rule');
  const monoBasis = get(monotony, 'verdict_basis'), simBasis = get(similarity, 'verdict_basis');
  const pairs = get(similarity, 'pairs');
  const measured = get(report, 'measured') === true;
  const axisVerdict = value => {
    const v=upperPick(value, ORIGINALITY_VERDICTS);
    return !measured && ['PASS','MONOTONE_FLAGGED','CARBON_COPY_FLAGGED'].includes(v) ? null : v;
  };
  const scope = basis => {
    const text=get(basis,'scope_rule');
    return typeof text==='string' && text.length<=512 && text.trim().toLowerCase().replace(/\.$/,'')===CALIBRATION_SCOPE ? 'calibrated-genre-only' : null;
  };
  return {
    monotony: monotony && typeof monotony === 'object' && !Array.isArray(monotony) ? {
      take: takeNumber(get(monotony, 'take')),
      verdict: axisVerdict(get(monotony, 'verdict')),
      calibration: upperPick(get(calibration, 'axis1_monotony') ?? get(monotony, 'calibration_status'), CALIBRATION),
      corpusGenre: pick(get(monoBasis, 'corpus_genre'), CALIBRATION_GENRES),
      scope: scope(monoBasis),
      repeatFraction: numeric(get(lag, 'max_block_repeat_fraction'), 0, 1),
      bestLagSeconds: duration(get(lag, 'best_lag_seconds')),
      lagScanRan: bool(get(lag, 'ran')),
      threshold: numeric(get(monoBasis, 'lag_scan_bar'), 0, 1),
      tileFlagged: bool(get(tile, 'flagged')),
      tileRan: bool(get(tile, 'ran')),
    } : null,
    similarity: similarity && typeof similarity === 'object' && !Array.isArray(similarity) ? {
      verdict: axisVerdict(get(similarity, 'verdict')),
      calibration: upperPick(get(calibration, 'axis2_similarity') ?? get(similarity, 'calibration_status'), CALIBRATION),
      corpusGenre: pick(get(simBasis, 'corpus_genre'), CALIBRATION_GENRES),
      scope: scope(simBasis),
      takeCount: count(get(similarity, 'take_count')),
      effectiveDistinctTakes: numeric(get(similarity, 'effective_distinct_takes_vendi'), 0, 32),
      threshold: numeric(get(simBasis, 'qmax_norm_bar'), 0, 1000),
      pairs: boundedArray(pairs).map(pair => ({
        takeA: takeNumber(get(pair, 'take_a')), takeB: takeNumber(get(pair, 'take_b')),
        qmaxNormalised: numeric(get(pair, 'qmax_normalised'), 0, 1000),
        fingerprintBer: numeric(get(pair, 'fingerprint_ber'), 0, 1),
        nearExactCopy: bool(get(pair, 'near_exact_copy')),
        verdict: axisVerdict(get(pair, 'verdict')),
      })),
      pairsTruncated: Array.isArray(pairs) && pairs.length > 32,
    } : null,
  };
}

export function summarizeResult(payload, result, originalityPoll = null) {
  const tracks = boundedArray(get(result, 'tracks'));
  const rawTracks = get(result, 'tracks');
  const sources = boundedArray(get(result, 'source_take'));
  const plan = get(result, 'render_plan');
  const overall = measuredDuration(get(plan, 'processed_probe'), get(result, 'measured'));
  const status = lower(get(result, 'status'));
  const state = get(result, 'success') === false || FAILED.has(status) ? 'failed' : PENDING.has(status) ? 'pending' : get(result, 'success') === true && (tracks.length > 0 || overall.seconds !== null) && get(result, 'dry_run') !== true ? 'available' : 'unavailable';
  const requested = count(get(result, 'takes_requested'));
  const delivered = count(get(result, 'takes_delivered'));
  const items = tracks.map((track, index) => {
    const take = numeric(get(track, 'take'), 1, 32, true) ?? index + 1;
    const kindText = get(track, 'kind');
    const isRaw = typeof kindText === 'string' && kindText.length <= 512 && /raw\s+take|render\s+pass\s+failed/i.test(kindText);
    const isMaster = typeof kindText === 'string' && kindText.length <= 512 && /^delivered master(?:\b|$)/i.test(kindText);
    const trackPlan = get(track, 'render_plan');
    const source = sources.find(item => get(item, 'take') === take);
    const reading = isRaw ? measuredDuration(null, get(track, 'measured') ?? get(source, 'measured')) : measuredDuration(get(trackPlan, 'processed_probe') ?? (take === 1 ? get(plan, 'processed_probe') : null), get(track, 'measured') ?? (take === 1 ? get(result, 'measured') : null));
    return { take, kind: isRaw ? 'raw' : isMaster || (take === 1 && get(plan, 'processed_probe')) ? 'master' : 'unknown', durationSeconds: reading.seconds, measured: reading.measured,
      audio: isRaw?null:summarizeAudio(trackPlan??(take===1?plan:null),get(track,'measured')??(take===1?get(result,'measured'):null)) };
  });
  return {
    state,
    duration: { requestedSeconds: duration(get(get(payload, 'duration'), 'target_seconds')), toleranceSeconds: numeric(get(get(payload, 'duration'), 'tolerance_seconds'), 0, 10), measuredSeconds: overall.seconds, measured: overall.measured },
    takes: { requested, delivered, partial: !!get(result, 'generation_shortfall') || (requested !== null && delivered !== null && delivered < requested) || items.some(item => item.kind === 'raw'), truncated: Array.isArray(rawTracks) && rawTracks.length > 32, items },
    lyrics: summarizeLyrics(payload, result, state),
    originality: summarizeOriginality(payload, result, originalityPoll),
    details: summarizeDetails(payload, result),
  };
}

function summarizeAudio(plan,measurement){
  const probe=get(plan,'processed_probe'),stages=get(plan,'stages'),exportStage=get(stages,'export');
  const output=probe??measurement,source=get(exportStage,'source');
  const verification=get(get(stages,'master'),'verification');
  const measured=duration(get(probe,'duration_seconds'))!==null||(get(measurement,'duration_measured')===true&&duration(get(measurement,'duration_seconds'))!==null);
  const sourceBits=numeric(get(source,'bits_per_sample'),1,64,true),bits=numeric(get(output,'bits_per_sample'),1,64,true);
  return {source:'upstream-delivered-file',measured,
    codec:pick(get(output,'codec_name')??get(output,'codec'),CODECS),sampleRate:numeric(get(output,'sample_rate'),8000,192000,true),channels:numeric(get(output,'channels'),1,8,true),
    bitsPerSample:bits,exportSourceBitsPerSample:sourceBits,
    bitDepthPromoted:sourceBits!==null&&bits!==null?bits>sourceBits:null,
    mastering:{measured:bool(get(verification,'measured')),integratedLufs:numeric(get(verification,'integrated_lufs'),-120,10),
      truePeakDbtp:numeric(get(verification,'true_peak_dbtp'),-120,30),loudnessRangeLu:numeric(get(verification,'lra_lu'),0,100)},
  };
}

function ownedAsset(record,kind){
  // These flags describe the last verified ingest, not a fresh disk-health check
  // on every page view. IDs, hashes and private storage paths stay server-side.
  const owned=!!record&&get(record,'kind')===kind&&get(record,'measured')===true&&typeof get(record,'id')==='string'&&/^[a-f0-9]{64}$/.test(get(record,'id'));
  return {owned,measured:owned,source:'owned-ingest',
    durationSeconds:owned?duration(get(record,'durationSeconds')):null,
    codec:owned?pick(get(record,'codec'),CODECS):null,sampleRate:owned?numeric(get(record,'sampleRate'),8000,192000,true):null,
    channels:owned?numeric(get(record,'channels'),1,8,true):null,sizeBytes:owned?numeric(get(record,'size'),1,268435456,true):null,
    bitsPerSample:owned?numeric(get(record,'bitsPerSample'),1,64,true):null};
}

export function summarizeAssets(payload,result,manifest){
  if(!manifest||typeof manifest!=='object'||Array.isArray(manifest))return null;
  const rawTakes=get(manifest,'takes');
  return {state:pick(get(manifest,'status'),MEDIA_STATES)??'unavailable',measurement:'last-verified-ingest',
    takes:boundedArray(rawTakes).map(take=>{
      const takeIndex=numeric(get(take,'take'),1,32,true);
      const track=boundedArray(get(result,'tracks')).find(row=>get(row,'take')===takeIndex);
      const plan=get(track,'render_plan')??(takeIndex===1?get(result,'render_plan'):null);
      const stemsStage=get(get(plan,'stages'),'stems');
      const requested=new Set([...boundedArray(get(payload,'stems')),...boundedArray(get(stemsStage,'requested'))].map(name=>pick(name,STEMS)).filter(Boolean));
      if(get(payload,'output_package')==='stems_bundle')for(const name of STEMS)requested.add(name);
      const records=boundedArray(get(take,'stems')),byName=new Map();
      for(const entry of records){const name=pick(get(entry,'name'),STEMS);if(name&&!byName.has(name))byName.set(name,entry);}
      const names=new Set([...requested,...byName.keys()]);
      return {take:takeIndex,state:pick(get(take,'status'),MEDIA_STATES)??'unavailable',kind:pick(get(take,'kind'),new Set(['delivered-master','raw','unavailable'])),
        master:ownedAsset(get(take,'master'),'master'),listening:ownedAsset(get(take,'listening'),'listening'),source:ownedAsset(get(take,'source'),'source'),
        stems:[...names].map(name=>{const entry=byName.get(name),upstream=get(entry,'upstream')??get(get(stemsStage,'stems'),name);
          return {name,requested:requested.has(name),state:upperPick(get(upstream,'state'),STEM_STATES)??'UNAVAILABLE',
            origin:pick(get(upstream,'origin'),ORIGINS),grade:pick(get(upstream,'grade'),GRADES),asset:ownedAsset(get(entry,'asset'),'stem')};})};
    }),truncated:Array.isArray(rawTakes)&&rawTakes.length>32};
}
