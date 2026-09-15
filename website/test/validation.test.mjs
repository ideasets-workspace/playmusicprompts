import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { projectCapabilities, projectControlsSchema, validateRequest, ValidationError } from '../server/validation.mjs';
// Saved free endpoint capture, not a live request or proof of generation.
const raw = JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json', import.meta.url)));
const prompt = 'Warm piano and cello.';
test('measured units survive the schema adapter',()=>{
  const controls=projectControlsSchema(raw);
  for(const name of ['mix_dynamic_range','fade_in_seconds','fade_out_seconds'])assert.equal(controls.parameters.find(p=>p.key===name).unit,raw.parameters.find(p=>p.name===name).constraints.unit);
});
function invalid(payload, path, code) {
  assert.throws(() => validateRequest({ prompt, ...payload }, raw), error => error instanceof ValidationError
    && error.status === 400 && error.code === 'INVALID_REQUEST'
    && error.issues.some(issue => issue.path === path && (!code || issue.code === code)));
}

test('current snapshot projects 100 request fields, 109 language options and complete vocabulary', () => {
  const cap = projectCapabilities(raw);
  assert.equal(cap.request_parameter_count, 100);
  assert.equal(cap.languages.entries.length, 109);
  assert.deepEqual(cap.response_fields, ['rights', 'compliance', 'analysis_outputs']);
  for (const [name, count] of [['genres', 2196], ['moods', 114], ['instruments', 1057], ['eras', 14], ['key', 108]])
    assert.equal(cap.parameters.find(x => x.name === name).values.length, count);
  assert.equal(cap.parameters.find(x => x.name === 'lyrics_measurement_domain').default, 'mix');
});

test('projection strips auth/account/internal provenance recursively; defaults are independent copies', () => {
  const copy = structuredClone(raw);
  copy.auth = { api_key: 'secret-value', account_id: 'private-account' };
  copy.parameters[0].evidence = 'private-evidence';
  const cap = projectCapabilities(copy);
  const serialized = JSON.stringify(cap);
  for (const privateText of ['secret-value', 'private-account', 'private-evidence', 'coordinate_estimate', 'values_import', 'credential', 'evidence', 'coverage_score']) assert.ok(!serialized.includes(privateText), privateText);
  cap.parameters.find(x => x.name === 'duration').default.target_seconds = 1;
  assert.equal(raw.parameters.find(x => x.name === 'duration').default.value.target_seconds, 135);
});

test('minimal instrumental and custom sung request are accepted without injected defaults', () => {
  const instrumental = { prompt, duration: { target_seconds: 15 }, vocal: { mode: 'instrumental' }, async: true };
  assert.deepEqual(validateRequest(instrumental, raw), instrumental);
  const sung = { prompt, duration: { target_seconds: 30 }, vocal: { mode: 'female', language: 'mni-Mtei' }, lyrics: { mode: 'custom', text: 'The morning sings.', verify: true }, async: true };
  assert.deepEqual(validateRequest(sung, raw), sung);
  assert.notEqual(validateRequest(sung, raw).lyrics, sung.lyrics);
});

test('all 100 request names have schema coverage and a valid representative or named website restriction', () => {
  const cap = projectCapabilities(raw);
  function representative(s) {
    if (s.enum) return s.enum[0];
    if (s.type === 'array') return [];
    if (s.type === 'object') return {};
    if (s.type === 'boolean') return true;
    if (['number', 'integer'].includes(s.type)) return s.minimum ?? 0;
    return 'A gentle sound';
  }
  for (const p of cap.parameters) {
    const value = representative(p.schema);
    const body = { prompt, [p.name]: value };
    if (p.name === 'variation_count') body.output_package = 'variations';
    if (p.name === 'webhook_url') { invalid({ webhook_url: 'https://example.com/' }, 'webhook_url', 'WEBSITE_RESTRICTED'); continue; }
    assert.doesNotThrow(() => validateRequest(body, raw), p.name);
  }
});

test('actual numbers, integer/range/step checks; tempo presets do not constrain the range', () => {
  assert.equal(validateRequest({ prompt, tempo_bpm: 121 }, raw).tempo_bpm, 121);
  invalid({ tempo_bpm: '121' }, 'tempo_bpm', 'TYPE');
  invalid({ tempo_bpm: 121.5 }, 'tempo_bpm', 'INTEGER');
  invalid({ tempo_bpm: 221 }, 'tempo_bpm', 'MAXIMUM');
  invalid({ seed: Number.MAX_SAFE_INTEGER + 1 }, 'seed', 'INTEGER');
  invalid({ controls: { harmony_complexity: 'high' } }, 'controls.harmony_complexity', 'TYPE');
  invalid({ controls: { sonic_polish: 11 } }, 'controls.sonic_polish', 'MAXIMUM');
  invalid({ prompt_blocks: [{ weight: .25 }] }, 'prompt_blocks[0].weight', 'STEP');
  assert.doesNotThrow(() => validateRequest({ prompt, prompt_blocks: [{ weight: .3 }] }, raw));
  invalid({ lyrics_threshold_override: NaN }, 'lyrics_threshold_override', 'TYPE');
  invalid({ mastering: { loudness_lufs: -14 } }, 'mastering.loudness_lufs', 'TYPE');
  assert.doesNotThrow(() => validateRequest({ prompt, mastering: { loudness_lufs: '-14', true_peak_db: -1.2 } }, raw));
});

test('booleans are not string-coerced; false optional loop is omitted', () => {
  for (const key of ['async', 'dry_run', 'arrangement_ai', 'normalize_output', 'run_originality_gate']) {
    assert.equal(validateRequest({ prompt, [key]: false }, raw)[key], false);
    invalid({ [key]: 'false' }, key, 'TYPE');
  }
  assert.deepEqual(validateRequest({ prompt, loop_ready: false }, raw), { prompt });
  assert.deepEqual(validateRequest({ capabilities: true }, raw), { capabilities: true });
  invalid({ prompt_enhance: { enabled: 'true' } }, 'prompt_enhance.enabled', 'TYPE');
});

test('nested unknown/read-only/array-required fields and caller-owned prototypes are refused', () => {
  invalid({ rights: {} }, 'rights', 'RESPONSE_ONLY');
  invalid({ project: { track_id: 'forged' } }, 'project.track_id', 'SERVER_ASSIGNED');
  invalid({ duration: { duration: 10 } }, 'duration.duration', 'UNKNOWN_FIELD');
  invalid({ duration: { toString: 'not a field' } }, 'duration.toString', 'UNKNOWN_FIELD');
  invalid({ mood_orbit: { axes: { valueOf: .5 } } }, 'mood_orbit.axes.valueOf', 'UNKNOWN_FIELD');
  invalid({ structure: [{ section: 'intro' }] }, 'structure[0].bars', 'REQUIRED');
  invalid({ energy_curve: { points: [{ t: 1 }] } }, 'energy_curve.points[0].v', 'REQUIRED');
  invalid({ structure: Array.from({ length: 13 }, () => ({ section: 'intro', bars: 8 })) }, 'structure', 'TOO_MANY');
  invalid(JSON.parse('{"labels":{"__proto__":"x"}}'), 'labels.__proto__', 'UNSAFE_FIELD');
  assert.throws(() => validateRequest(Object.create({ prompt }), raw), ValidationError);
});

test('real map/structured shapes and descriptor-only import boundary', () => {
  assert.doesNotThrow(() => validateRequest({ prompt, labels: { campaign: 'spring' }, mood_orbit: { axes: { epic: .5, dark: 0 } },
    energy_curve: { preset: 'custom', points: [{ t: 0, v: .5 }] }, references: [{ kind: 'descriptor', text: 'Warm strings' }] }, raw));
  invalid({ labels: { shape: {} } }, 'labels.shape', 'TYPE');
  invalid({ mood_orbit: { axes: 'epic' } }, 'mood_orbit.axes', 'TYPE');
  invalid({ mood_orbit: { value_range: 1 } }, 'mood_orbit.value_range', 'UNKNOWN_FIELD');
  invalid({ mood_orbit: { axes: { happy: .5 } } }, 'mood_orbit.axes.happy', 'UNKNOWN_FIELD');
  invalid({ references: [{ kind: 'descriptor', url: 'https://example.com' }] }, 'references[0]', 'WEBSITE_RESTRICTED');
  invalid({ references: [{ kind: 'midi' }] }, 'references[0]', 'WEBSITE_RESTRICTED');
  invalid({ references: [{}] }, 'references[0].kind', 'REQUIRED');
});

test('all actionable refusals are returned, current vocabulary/language and active sibling rules are enforced', () => {
  invalid({ genres: ['no-such-genre'] }, 'genres[0]', 'ENUM');
  invalid({ genres: ['cinematic', 'cinematic', 'cinematic', 'cinematic', 'cinematic', 'cinematic', 'cinematic'] }, 'genres', 'TOO_MANY');
  invalid({ vocal: { language: 'unknown-language' } }, 'vocal.language', 'ENUM');
  invalid({ lyrics: { mode: 'custom', text: 'Words', theme: 'Other words' }, vocal: { mode: 'male' } }, 'lyrics.theme', 'INACTIVE_FIELD');
  invalid({ lyrics: { mode: 'custom', text: 'Words' } }, 'vocal.mode', 'CONTRADICTION');
  invalid({ lyrics: { mode: 'custom', text: '' }, vocal: { mode: 'male' } }, 'lyrics.text', 'REQUIRED');
  invalid({ variation_count: 2 }, 'variation_count', 'INACTIVE_FIELD');
  invalid({ route: 'lyria-3-clip-preview', duration: { target_seconds: 31 } }, 'duration.target_seconds', 'ROUTE_LIMIT');
  invalid({ lyrics: { mode: 'custom', text: 'a'.repeat(2001) }, vocal: { mode: 'male' } }, 'lyrics.text', 'TOO_LONG');
  invalid({ prompt: '   ' }, 'prompt', 'REQUIRED');
  assert.doesNotThrow(() => validateRequest({ prompt: '🎵'.repeat(5000) }, raw));
  try { validateRequest({ prompt, unknown: 1, duration: 30, seed: -1 }, raw); assert.fail(); }
  catch (error) { assert.equal(error.issues.length, 3); }
});

test('controls adapter fits accepted nested renderer with current typed values and explicit restrictions', () => {
  const controls = projectControlsSchema(raw);
  const param = key => controls.parameters.find(x => x.key === key);
  assert.equal(controls.parameter_count, 100);
  assert.equal(param('vocal').fields.find(x => x.key === 'language').options.length, 109);
  assert.equal(param('controls').fields[0].type, 'integer');
  assert.equal(param('controls').fields[0].options, undefined);
  assert.equal(param('mastering').fields.find(x => x.key === 'loudness_lufs').default, '-9');
  assert.equal(param('labels').control, 'key-value');
  assert.equal(param('energy_curve').fields.find(x => x.key === 'points').control, 'repeater');
  assert.equal(param('structure').items.fields.find(x => x.key === 'bars').required, true);
  assert.deepEqual(param('references').items.fields.find(x => x.key === 'url').active_when, { path: 'references[].kind', in: ['user_audio', 'midi'] });
  assert.ok(!param('project').fields.some(x => x.key === 'track_id'));
  assert.equal(param('webhook_url').website.enabled, false);
  assert.equal(param('negative_prompt').options, undefined, 'Free text chips must remain editable.');
});
