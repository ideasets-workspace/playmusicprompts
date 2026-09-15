// Capability contract from the live endpoint; documented shape refinements are
// from docs/api/04-request-body-full.md. This validates input, not musical proof.
const RESPONSE_ONLY = new Set(['rights', 'compliance', 'analysis_outputs']);
const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const ARRAY_OBJECTS = new Set(['prompt_blocks', 'structure', 'references']);
const own = (object, key) => Object.hasOwn(object, key);
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const entries = values => (values ?? []).map(value => typeof value === 'object'
  ? { id: value.id, label: typeof value.label === 'string' ? value.label : String(value.id) }
  : { id: value, label: String(value) });

export class ValidationError extends Error {
  constructor(issues) {
    super('Review the highlighted music settings.');
    this.name = 'ValidationError'; this.status = 400; this.code = 'INVALID_REQUEST'; this.issues = issues;
  }
}

function contractParameters(raw) {
  if (!plain(raw) || raw.success === false || !Array.isArray(raw.parameters) || !raw.parameters.length)
    throw Object.assign(new Error('The music capability contract is unavailable.'), { status: 503, code: 'CAPABILITIES_UNAVAILABLE' });
  const names = new Set();
  for (const parameter of raw.parameters) {
    if (!plain(parameter) || typeof parameter.name !== 'string' || UNSAFE_KEYS.has(parameter.name) || names.has(parameter.name))
      throw Object.assign(new Error('The music capability contract is invalid.'), { status: 503, code: 'CAPABILITIES_INVALID' });
    names.add(parameter.name);
  }
  return raw.parameters.filter(p => !RESPONSE_ONLY.has(p.name) && p.binding !== 'response_field');
}

function scalarSchema(source = {}) {
  const rules = { ...source, ...source.constraints };
  const schema = {};
  if (rules.type === 'boolean') schema.type = 'boolean';
  else if (rules.type === 'integer' || rules.step === 1) schema.type = 'integer';
  else if (typeof rules.min === 'number' || typeof rules.max === 'number') schema.type = 'number';
  else schema.type = 'string';
  if (typeof rules.min === 'number') schema.minimum = rules.min;
  if (typeof rules.max === 'number') schema.maximum = rules.max;
  if (typeof rules.step === 'number') schema.multipleOf = rules.step;
  if (typeof rules.max_length === 'number') schema.maxLength = rules.max_length;
  // Numeric sliders have labelled suggestions, not a closed enum.
  if (schema.type === 'string' && Array.isArray(source.values)) schema.enum = entries(source.values).map(x => x.id);
  if (rules.type === 'uri' || rules.type === 'https_uri') schema.format = rules.type;
  if (rules.server_assigned) schema.readOnly = true;
  if (rules.active_when) schema.activeWhen = rules.active_when;
  return schema;
}

function schemaFor(parameter) {
  const name = parameter.name;
  if (name === 'labels') return { type: 'object', additionalProperties: { type: 'string' } };
  if (name === 'mood_orbit') return {
    type: 'object', additionalProperties: false, properties: {
      axes: { type: 'object', additionalProperties: false,
        properties: Object.fromEntries(entries(parameter.fields.axes.values).map(x => [x.id, scalarSchema(parameter.fields.value_range)])) }
    }
  };
  if (parameter.fields) {
    const properties = Object.fromEntries(Object.entries(parameter.fields).map(([key, field]) => [key, scalarSchema(field)]));
    if (name === 'energy_curve') properties.points = {
      type: 'array', items: { type: 'object', additionalProperties: false, required: ['t', 'v'],
        properties: { t: { type: 'number', minimum: 0 }, v: { type: 'number', minimum: 0, maximum: 1 } } }
    };
    const object = { type: 'object', additionalProperties: false, properties };
    if (name === 'structure') object.required = ['section', 'bars'];
    if (name === 'references') object.required = ['kind'];
    if (ARRAY_OBJECTS.has(name)) {
      const schema = { type: 'array', items: object };
      const max = parameter.constraints?.max_items ?? parameter.constraints?.max_sections;
      if (max !== undefined) schema.maxItems = max;
      return schema;
    }
    return object;
  }
  if (parameter.control === 'toggle') {
    const ids = entries(parameter.values).map(x => x.id);
    return { type: 'boolean', ...(name === 'loop_ready' && ids.length === 1 && ids[0] === 'true' ? { enum: [true] } : {}) };
  }
  if (parameter.control === 'multi-select' || parameter.control === 'chips') {
    const item = { type: 'string' };
    if (!parameter.free_text && parameter.values) item.enum = entries(parameter.values).map(x => x.id);
    return { type: 'array', items: item,
      ...(parameter.constraints?.max_selected !== undefined ? { maxItems: parameter.constraints.max_selected } : {}) };
  }
  const schema = scalarSchema(parameter);
  if (parameter.name === 'key' && parameter.values_generated?.roots && parameter.values_generated?.modes)
    schema.enum = parameter.values_generated.roots.flatMap(root => parameter.values_generated.modes.map(mode => `${root}|${mode}`));
  if (name === 'prompt') schema.minLength = 1;
  return schema;
}

/** Deliberate allowlist: never publish upstream auth, evidence or account metadata. */
export function projectCapabilities(raw, {webhookUrl=null} = {}) {
  const parameters = contractParameters(raw).map(p => {
    const schema = schemaFor(p);
    const projected = { name: p.name, label: p.ui_control ?? p.name, ui_control: p.ui_control ?? p.name,
      panel: p.panel, section: p.section, control: p.control, binding: p.binding,
      free_text: Boolean(p.free_text), required: p.name === 'prompt', schema };
    if (p.default?.value !== undefined && p.default.value !== null) projected.default = structuredClone(p.default.value);
    if (p.values) projected.values = entries(p.values);
    else if (p.name === 'key') projected.values = schema.enum.map(id => ({ id, label: id.replace('|', ' ') }));
    if (schema.properties) projected.fields = schema.properties;
    if (p.constraints) projected.constraints = Object.fromEntries(Object.entries(p.constraints)
      .filter(([key]) => ['type', 'min', 'max', 'step', 'unit', 'max_length', 'max_items', 'max_sections', 'max_selected'].includes(key)));
    if (p.name === 'variation_count') projected.active_when = 'output_package=variations';
    if (p.name === 'webhook_url') projected.website = { enabled: !!webhookUrl, allowed_url:webhookUrl, allowed_in_dry_run:true, reason: 'Callbacks require the configured destination. Request previews can validate the URL without sending a callback.' };
    if (p.name === 'references') projected.website = { enabled: true, allowed_kinds: ['descriptor'], reason: 'Audio and MIDI import require a verified upload workflow.' };
    return projected;
  });
  const vocal = parameters.find(p => p.name === 'vocal');
  const languageSource = raw.parameters.find(p => p.name === 'vocal')?.fields?.language?.values;
  return { schema_id: raw.schema_id, parameters, request_parameter_count: parameters.length,
    response_fields: raw.parameters.filter(p => RESPONSE_ONLY.has(p.name) || p.binding === 'response_field').map(p => p.name),
    routes: entries(raw.routes), languages: { entries: entries(languageSource), accepted: vocal?.schema.properties.language.enum ?? [] },
    notice: 'Accepted settings describe the engine contract. Generation and verification results report what was actually delivered.' };
}

/** Current data in the accepted controls.js format; load before controls.js.
 * Availability metadata must be honoured by the client; validation enforces it.
 */
export function projectControlsSchema(raw, options = {}) {
  const projected = projectCapabilities(raw, options);
  const group = p => ['async','dry_run','capabilities','webhook_url'].includes(p.name)?'request':p.name.startsWith('lyrics') ? 'lyrics'
    : p.section === 'Vocal & Lyric' ? 'voice'
    : ['References'].includes(p.section) ? 'references'
    : p.section === 'Generation & Output' ? 'production'
    : p.section === 'Composition' ? 'composition' : 'idea';
  function node(schema, key, path, source, defaultValue) {
    const n = { key, path, label: key.replaceAll('_', ' ').replace(/^./, x => x.toUpperCase()), type: schema.type };
    if (defaultValue !== undefined && defaultValue !== null) n.default = structuredClone(defaultValue);
    for (const key of ['minimum', 'maximum', 'format']) if (schema[key] !== undefined) n[key] = schema[key];
    if (schema.maxLength !== undefined) n.max_length = schema.maxLength;
    if (schema.maxItems !== undefined) n.max_items = schema.maxItems;
    if (schema.multipleOf !== undefined) n.step = schema.multipleOf;
    const unit=source?.constraints?.unit??source?.unit;
    if(typeof unit==='string'&&unit.length<=40)n.unit=unit;
    if (schema.type === 'object') {
      n.control = schema.additionalProperties?.type === 'string' ? 'key-value' : 'fieldset';
      n.fields = Object.entries(schema.properties ?? {}).filter(([, s]) => !s.readOnly).map(([k, s]) => {
        const field = node(s, k, `${path}.${k}`, source?.fields?.[k], defaultValue?.[k]);
        if (schema.required?.includes(k)) field.required = true;
        return field;
      });
      n.additional_properties = schema.additionalProperties;
    } else if (schema.type === 'array') {
      n.control = schema.items.type === 'object' ? 'repeater' : 'chips';
      n.items = node(schema.items, key, `${path}[]`, source);
      if (schema.items.enum) { n.options = entries(source?.values); n.options_complete = true; }
    } else if (['number', 'integer'].includes(schema.type)) {
      n.control = 'number';
      if (source?.values) n.suggested_values = entries(source.values).map(x => Number(x.id)).filter(Number.isFinite);
    } else if (schema.type === 'boolean') {
      n.control = 'toggle'; n.options = (schema.enum ?? [true, false]).map(id => ({ id, label: id ? 'On' : 'Off' })); n.options_complete = true;
    } else {
      n.control = schema.enum ? 'combo' : 'text';
      if (schema.enum) { const labels = new Map(entries(source?.values).map(x => [x.id, x.label])); n.options = schema.enum.map(id => ({ id, label: labels.get(id) ?? String(id).replace('|', ' ') })); n.options_complete = true; }
      if (key === 'language' && n.options) n.control = 'language';
      if (schema.maxLength > 500 || key === 'prompt') n.control_hint = 'textarea';
    }
    if (schema.activeWhen) {
      const prefix = path.slice(0, path.lastIndexOf('.') + 1);
      const eq = /^([a-z_]+)=([^=]+)$/.exec(schema.activeWhen);
      const list = /^([a-z_]+) in \[([^\]]+)\]$/.exec(schema.activeWhen);
      if (eq) n.active_when = { path: prefix + eq[1], equals: eq[2] };
      if (list) n.active_when = { path: prefix + list[1], in: list[2].split(',').map(x => x.trim()) };
    }
    if (path === 'lyrics.text') n.required_when = { path: 'lyrics.mode', equals: 'custom' };
    return n;
  }
  return { schema_version: 2, kind: 'current-engine-controls', schema_id: projected.schema_id,
    scope: projected.notice, parameter_count: projected.parameters.length,
    excluded_response_parameters: projected.response_fields,
    groups: [{ id: 'idea', label: 'Your idea' }, { id: 'composition', label: 'Composition' },
      { id: 'voice', label: 'Voice' }, { id: 'lyrics', label: 'Lyrics' }, { id: 'references', label: 'References' },
      { id: 'production', label: 'Production and delivery' },{id:'request',label:'Request behavior'}],
    parameters: projected.parameters.map(p => {
      const source = raw.parameters.find(x => x.name === p.name);
      const n = { ...node(p.schema, p.name, p.name, source, p.default), label: p.label,
        required: p.required, binding: p.binding, group: group(p) };
      if (p.name === 'variation_count') n.active_when = { path: 'output_package', equals: 'variations' };
      if (p.name === 'loop_ready') n.false_action = 'omit';
      if (p.website) n.website = p.website;
      return n;
    }) };
}

function active(expression, siblings, defaults) {
  const equal = /^([a-z_]+)=([^=]+)$/.exec(expression);
  if (equal) return (siblings[equal[1]] ?? defaults?.[equal[1]]) === equal[2];
  const list = /^([a-z_]+) in \[([^\]]+)\]$/.exec(expression);
  if (list) return list[2].split(',').map(x => x.trim()).includes(siblings[list[1]] ?? defaults?.[list[1]]);
  return false; // New predicates require a reviewed implementation.
}

function check(value, schema, path, issues, defaults, depth = 0) {
  const refuse = (code, message) => issues.push({ path, code, message });
  if (depth > 12) { refuse('TOO_DEEP', 'The setting is nested too deeply.'); return; }
  if (schema.readOnly) { refuse('SERVER_ASSIGNED', 'This field is assigned by the music service.'); return; }
  if (schema.type === 'object') {
    if (!plain(value)) { refuse('TYPE', 'Expected a JSON object.'); return; }
    for (const key of schema.required ?? []) if (!own(value, key)) issues.push({ path: `${path}.${key}`, code: 'REQUIRED', message: 'This field is required.' });
    const result = {};
    for (const key of Object.keys(value)) {
      const fieldPath = `${path}.${key}`;
      if (UNSAFE_KEYS.has(key)) { issues.push({ path: fieldPath, code: 'UNSAFE_FIELD', message: 'This field is not allowed.' }); continue; }
      const fieldSchema = schema.properties && own(schema.properties, key) ? schema.properties[key]
        : (plain(schema.additionalProperties) ? schema.additionalProperties : undefined);
      if (!fieldSchema) { issues.push({ path: fieldPath, code: 'UNKNOWN_FIELD', message: 'This field is not accepted.' }); continue; }
      if (fieldSchema.activeWhen && !active(fieldSchema.activeWhen, value, defaults))
        issues.push({ path: fieldPath, code: 'INACTIVE_FIELD', message: `This field requires ${fieldSchema.activeWhen}.` });
      result[key] = check(value[key], fieldSchema, fieldPath, issues, defaults?.[key], depth + 1);
    }
    return result;
  }
  if (schema.type === 'array') {
    if (!Array.isArray(value)) { refuse('TYPE', 'Expected a JSON array.'); return; }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) refuse('TOO_MANY', `Choose at most ${schema.maxItems} items.`);
    return value.map((item, index) => check(item, schema.items, `${path}[${index}]`, issues, undefined, depth + 1));
  }
  if (schema.type === 'number' || schema.type === 'integer') {
    if (typeof value !== 'number' || !Number.isFinite(value)) { refuse('TYPE', 'Expected a finite JSON number.'); return; }
    if (schema.type === 'integer' && !Number.isSafeInteger(value)) refuse('INTEGER', 'Expected a whole number within the safe integer range.');
    if (schema.minimum !== undefined && value < schema.minimum) refuse('MINIMUM', `The minimum is ${schema.minimum}.`);
    if (schema.maximum !== undefined && value > schema.maximum) refuse('MAXIMUM', `The maximum is ${schema.maximum}.`);
    if (schema.multipleOf && Math.abs(value / schema.multipleOf - Math.round(value / schema.multipleOf)) > 1e-7)
      refuse('STEP', `Use increments of ${schema.multipleOf}.`);
  } else if (schema.type === 'boolean') {
    if (typeof value !== 'boolean') { refuse('TYPE', 'Expected true or false, without quotes.'); return; }
  } else {
    if (typeof value !== 'string') { refuse('TYPE', 'Expected a string.'); return; }
    const length = Array.from(value).length;
    if (schema.maxLength !== undefined && length > schema.maxLength) refuse('TOO_LONG', `Use at most ${schema.maxLength} characters.`);
    if (schema.minLength && !value.trim()) refuse('REQUIRED', 'Describe the music you want to create.');
    if (schema.format) {
      try { const url = new URL(value); if (schema.format === 'https_uri' && url.protocol !== 'https:') throw new Error(); }
      catch { refuse('FORMAT', 'Expected a valid URI with the required scheme.'); }
    }
  }
  if (schema.enum && !schema.enum.includes(value)) refuse('ENUM', 'Choose an accepted value from the current music settings.');
  return value;
}

/** Does not inject defaults, rewrite prose, call the engine or silently drop errors. */
export function validateRequest(payload, rawCapabilities, {webhookUrl=null} = {}) {
  const parameters = contractParameters(rawCapabilities);
  const issues = [];
  if (!plain(payload)) throw new ValidationError([{ path: '$', code: 'TYPE', message: 'Expected a JSON request object.' }]);
  const byName = new Map(parameters.map(p => [p.name, p]));
  const result = {};
  if (payload.capabilities !== true && (!own(payload, 'prompt') || typeof payload.prompt !== 'string' || !payload.prompt.trim()))
    issues.push({ path: 'prompt', code: 'REQUIRED', message: 'Describe the music you want to create.' });
  for (const name of Object.keys(payload)) {
    const parameter = byName.get(name);
    if (UNSAFE_KEYS.has(name) || !parameter) {
      issues.push({ path: name, code: RESPONSE_ONLY.has(name) ? 'RESPONSE_ONLY' : 'UNKNOWN_FIELD', message: 'This is not an accepted request field.' }); continue;
    }
    if (name === 'webhook_url' && payload.dry_run !== true && payload[name] !== webhookUrl) {
      issues.push({ path: name, code: 'WEBSITE_RESTRICTED', message: 'Custom callback destinations are not enabled on this website.' }); continue;
    }
    // The single-value optional toggle has no upstream false id: off means omit.
    if (name === 'loop_ready' && payload[name] === false) continue;
    result[name] = check(payload[name], schemaFor(parameter), name, issues, parameter.default?.value);
  }
  if (own(payload, 'variation_count') && payload.output_package !== 'variations')
    issues.push({ path: 'variation_count', code: 'INACTIVE_FIELD', message: 'Variation count requires output_package=variations.' });
  if (Array.isArray(payload.references)) payload.references.forEach((reference, index) => {
    if (plain(reference) && (own(reference, 'url') || ['user_audio', 'midi'].includes(reference.kind)))
      issues.push({ path: `references[${index}]`, code: 'WEBSITE_RESTRICTED', message: 'Audio and MIDI references require a verified import workflow. Use a text descriptor.' });
  });
  const lyrics = plain(payload.lyrics) ? payload.lyrics : {};
  const vocal = plain(payload.vocal) ? payload.vocal : {};
  if (lyrics.mode === 'custom' && (typeof lyrics.text !== 'string' || !lyrics.text.trim()))
    issues.push({ path: 'lyrics.text', code: 'REQUIRED', message: 'Enter the lyrics to sing.' });
  const vocalMode = vocal.mode ?? byName.get('vocal')?.default?.value?.mode;
  if (['custom', 'ai_write'].includes(lyrics.mode) && vocalMode === 'instrumental')
    issues.push({ path: 'vocal.mode', code: 'CONTRADICTION', message: 'Choose a vocal mode when requesting lyrics.' });
  if (payload.route === 'lyria-3-clip-preview' && (payload.duration?.target_seconds ?? byName.get('duration')?.default?.value?.target_seconds) > 30)
    issues.push({ path: 'duration.target_seconds', code: 'ROUTE_LIMIT', message: 'The clip route supports a target of at most 30 seconds.' });
  if (issues.length) throw new ValidationError(issues);
  return result;
}
