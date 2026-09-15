// This module consumes an owner-scoped publicJob, never a raw engine envelope.
// Stages reflect saved local transitions or a persisted upstream observation.
import {contentSafety,serviceQuota} from './failure-details.mjs';
const REQUEST_KEYS = new Set(`project creative_goal prompt prompt_enhance negative_prompt genres eras moods prompt_blocks tempo_bpm key time_signature duration structure arrangement_ai energy_curve instruments sonic_tags mood_orbit vocal lyrics references output_package variation_count labels route quality controls mastering export stems seed webhook_url async dry_run capabilities client_side_echo vocal_style vocal_register vocal_effects backing_vocals adlibs lyrics_structure lyrics_language_per_line lyrics_orthography_route lyrics_verify_metric lyrics_threshold_override lyrics_measurement_domain vocal_intensity vocal_emotion vocal_accent mix_stereo_width mix_dynamic_range mix_low_end mix_brightness mix_vocal_prominence master_style arrangement_density dynamics_shape transitions groove_feel harmonic_palette melodic_character rhythmic_feel percussion_style bass_style texture_layers sound_fx production_era spatial_ambience intro_style outro_style tempo_feel solo_instrument chord_progression cultural_style reference_artist_style instrumentation_notes mood_progression target_use reference_tempo_source mix_compression mix_saturation fade_in_seconds fade_out_seconds normalize_output run_originality_gate channel_layout loop_ready click_track key_change hook_placement tension_curve vocal_layering vocal_pronunciation syllable_stress melisma vibrato song_title_in_lyrics countin`.split(' '));
const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const LOCAL_STATES = new Set(['queued', 'submitting', 'pending', 'ingesting', 'ready', 'partial', 'failed', 'uncertain', 'ingest_failed']);
const UPSTREAM_STATES = new Set(['queued', 'processing', 'complete', 'failed']);
const own = (value, key) => value && typeof value === 'object' && !Array.isArray(value) && Object.hasOwn(value, key) ? value[key] : undefined;
const text = (value, max = 2000) => typeof value === 'string' && value.length <= max ? value : null;
const timestamp = value => Number.isSafeInteger(value) && value >= 0 ? value : null;

function descriptors(value) {
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null && !(Array.isArray(value) && prototype === Array.prototype)) throw new TypeError('Unsafe workflow request snapshot.');
  const entries = Object.getOwnPropertyDescriptors(value);
  for (const key of Reflect.ownKeys(entries)) {
    if (typeof key !== 'string' || UNSAFE_KEYS.has(key) || !Object.hasOwn(entries[key], 'value')) throw new TypeError('Unsafe workflow request snapshot.');
  }
  return entries;
}

function cloneJson(value, seen = new WeakSet(), depth = 0) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!value || typeof value !== 'object' || seen.has(value) || depth > 16) throw new TypeError('Invalid workflow request snapshot.');
  const entries = descriptors(value);
  seen.add(value);
  let result;
  if (Array.isArray(value)) {
    if (Object.keys(entries).some(key => key !== 'length' && !/^(0|[1-9]\d*)$/.test(key))) throw new TypeError('Invalid workflow request snapshot.');
    result = Array.from({ length: value.length }, (_, index) => {
      if (!Object.hasOwn(entries, index)) throw new TypeError('Invalid workflow request snapshot.');
      return cloneJson(entries[index].value, seen, depth + 1);
    });
  } else {
    result = {};
    for (const [key, descriptor] of Object.entries(entries)) result[key] = cloneJson(descriptor.value, seen, depth + 1);
  }
  seen.delete(value);
  return result;
}

export function requestSnapshot(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) throw new TypeError('Expected a validated music request.');
  const result = {};
  // Do not inject defaults, coerce booleans, trim writing, or serialize the raw
  // job/engine metadata. Nested values were already validated on admission.
  for (const [key, descriptor] of Object.entries(descriptors(request))) {
    if (REQUEST_KEYS.has(key)) result[key] = cloneJson(descriptor.value);
  }
  return result;
}

function listeningTracks(job) {
  const input = own(job, 'tracks'), seen = new Set(), result = [];
  if (!Array.isArray(input)) return result;
  for (const track of input.slice(0, 32)) {
    const id = own(track, 'id');
    if (typeof id !== 'string' || !/^[a-f0-9]{64}$/.test(id) || seen.has(id) || own(track, 'owned') !== true || own(track, 'url') !== `/api/listen/${id}` || ['raw', 'source', 'unavailable'].includes(own(track, 'kind'))) continue;
    seen.add(id);
    const item = { id, url: `/api/listen/${id}`, owned: true };
    for (const key of ['title', 'art', 'origin', 'jobId', 'genre', 'mood', 'era', 'deliveryStatus']) {
      const value = text(own(track, key)); if (value !== null) item[key] = value;
    }
    if (typeof own(track, 'created') === 'boolean') item.created = track.created;
    if (Number.isInteger(own(track, 'take')) && track.take >= 1 && track.take <= 32) item.take = track.take;
    if (typeof own(track, 'duration') === 'number' && Number.isFinite(track.duration) && track.duration > 0 && track.duration <= 900) item.duration = track.duration;
    result.push(item);
  }
  return result;
}

function publicError(error) {
  if (!error || typeof error !== 'object' || Array.isArray(error)) return null;
  const result = {};
  const code = own(error, 'code'), message = text(own(error, 'message'));
  if (typeof code === 'string' && /^[A-Z][A-Z0-9_]{0,79}$/.test(code)) result.code = code;
  if (message !== null) result.message = message;
  const fields = own(error, 'fields');
  if (Array.isArray(fields)) result.fields = fields.slice(0, 32).flatMap(field => {
    const path = text(own(field, 'path'), 200), code = text(own(field, 'code'), 80), message = text(own(field, 'message'));
    return path && REQUEST_KEYS.has(path.split(/[.[]/, 1)[0]) && /^[a-z][a-z0-9_.\[\]]*$/.test(path) && code && /^[A-Z][A-Z0-9_]*$/.test(code) && message !== null ? [{ path, code, message }] : [];
  });
  if (Number.isSafeInteger(own(error, 'omittedDetails')) && error.omittedDetails >= 0) result.omittedDetails = error.omittedDetails;
  const content=contentSafety(own(error,'contentSafety')),quota=serviceQuota(own(error,'quota'));
  if(content)result.contentSafety=content;if(quota)result.quota=quota;
  return Object.keys(result).length ? result : null;
}

/** publicJob and its error/tracks/summary must already be owner-authorized and
 * projected by Store. request is its parsed validated payload. upstreamStatus
 * is the last real worker observation, not a timer or a desired stage. */
export function publicGenerationWorkflow(publicJob, request, upstreamStatus = null) {
  const selected = requestSnapshot(request);
  const tracks = listeningTracks(publicJob);
  const recorded = own(publicJob, 'status');
  const upstream = UPSTREAM_STATES.has(upstreamStatus) ? upstreamStatus : null;
  let status = LOCAL_STATES.has(recorded) ? recorded : 'uncertain';
  if (['ready', 'partial'].includes(status) && !tracks.length) status = 'ingest_failed';
  if (status === 'pending' && upstream === 'failed') status = 'failed';
  const summary = own(publicJob, 'summary'), assets = own(publicJob, 'assetsSummary');
  const ownedTakes = own(assets, 'takes');
  const hasOwnedOutput = Array.isArray(ownedTakes) && ownedTakes.some(take => ['master', 'source', 'listening'].some(role => own(own(take, role), 'owned') === true));
  const returned = upstream === 'complete' || status === 'ingesting' || tracks.length > 0 || hasOwnedOutput || own(summary, 'state') === 'available';
  const admitted = upstream !== null || ['pending', 'ingesting', 'ready', 'partial'].includes(status) || returned;
  const steps = [
    { id: 'request', label: 'Sending request', state: 'pending' },
    { id: 'music', label: 'Music worker', state: 'pending' },
    { id: 'delivery', label: 'Saving your music', state: 'pending' },
  ];
  const [sending, music, delivery] = steps;
  if (admitted) sending.state = 'complete';
  if (returned) { music.state = 'complete'; music.detail = 'The music service returned its result.'; }
  let title, message;
  const savedCount = `${tracks.length} ${tracks.length === 1 ? 'song is' : 'songs are'} saved and available to play.`;
  switch (status) {
    case 'queued':
      title = 'Request saved'; message = 'Your request is saved and waiting to be sent.'; break;
    case 'submitting':
      title = 'Sending request'; message = 'Your request is being sent. Waiting for the music service to respond.'; sending.state = 'active'; break;
    case 'pending':
      if (upstream === 'processing') {
        title = 'Music worker processing'; message = 'The music worker is processing your request. Individual production stages are not reported.'; music.state = 'active';
      } else if (upstream === 'queued') {
        title = 'Waiting for music worker'; message = 'The music service accepted your request and placed it in its queue.'; music.detail = 'The service reports this request as queued.';
      } else if (upstream === 'complete') {
        title = 'Music result returned'; message = 'The music result has returned. Waiting to prepare your saved listening copy.';
      } else {
        title = 'Waiting for music result'; message = 'Your request was accepted. Waiting for the next worker status.'; music.detail = 'No more detailed worker status has been received.';
      }
      break;
    case 'ingesting':
      title = 'Saving your music'; message = 'Your music result is being transferred and prepared for listening.'; delivery.state = 'active'; break;
    case 'ready':
      title = 'Your music is ready'; message = savedCount; delivery.state = 'complete'; break;
    case 'partial':
      title = 'Some music is ready'; message = `${savedCount} Other requested outputs need attention.`; delivery.state = 'unavailable'; delivery.detail = 'Some listening copies are saved; delivery is incomplete.'; break;
    case 'ingest_failed':
      title = 'Listening is not ready'; message = tracks.length ? `${savedCount} Other outputs need a transfer check.` : 'No verified listening copy is available. Your request and any existing outputs remain saved.';
      delivery.state = 'failed'; if (!returned) music.state = 'unavailable'; break;
    case 'failed':
      title = 'Creation did not finish'; message = tracks.length ? `${savedCount} The remaining creation did not finish.` : 'Your request remains saved. It will not be submitted again automatically.';
      if (!admitted) { sending.state = 'failed'; music.state = 'unavailable'; }
      else if (!returned) music.state = 'failed';
      delivery.state = tracks.length ? 'unavailable' : 'pending';
      break;
    default:
      title = 'Request outcome unconfirmed'; message = 'The latest outcome could not be confirmed. This request will not be submitted again automatically.';
      if (!admitted) sending.state = 'unavailable'; if (!returned) music.state = 'unavailable';
      delivery.state = tracks.length ? 'unavailable' : 'pending';
  }
  if (selected.run_originality_gate === true) {
    const analysis = own(summary, 'originality'), state = own(analysis, 'state');
    const step = { id: 'originality', label: 'Originality check', state: 'pending', detail: 'Optional analysis has been requested; it does not block listening.' };
    if (state === 'pending') { step.state = 'active'; step.detail = 'The service reports that this separate analysis is pending.'; }
    else if (state === 'complete') { step.state = 'complete'; step.detail = 'Analysis returned. Its reported calibration scope still applies.'; }
    else if (state === 'failed') { step.state = 'failed'; step.detail = 'The analysis failed. Available music remains playable.'; }
    else if (['no-record', 'unavailable', 'not-requested'].includes(state) && ['ready', 'partial', 'ingest_failed', 'failed'].includes(status)) { step.state = 'unavailable'; step.detail = 'No completed analysis is available for this request.'; }
    steps.push(step);
  }
  const error = publicError(own(publicJob, 'error'));
  return {
    id: text(own(publicJob, 'id'), 160), kind: 'create', status, title, message,
    createdAt: timestamp(own(publicJob, 'createdAt')), updatedAt: timestamp(own(publicJob, 'updatedAt')),
    steps, request: selected, ...(tracks.length ? { result: { tracks } } : {}), error,
  };
}
