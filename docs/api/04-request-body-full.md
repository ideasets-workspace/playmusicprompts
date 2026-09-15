# 04 · Request Body — All 103 Parameters

Every field the service accepts on `POST /v1/music`, its **binding class**, its **control shape**,
and its **allowed values**. Everything is optional except `prompt`. Unknown fields — top-level AND
nested — are refused BY NAME (400 `INVALID_REQUEST`) — the API never silently drops or coerces an
unknown field.

The parameter surface is versioned in the service's versioned parameter specification
(the single source of truth) and is loaded at container start. The tables and shape reference below
are GENERATED from that file by an internal operator script (marker-fenced blocks;
`--check` fails the build when they drift) — the prose around them is hand-authored.

## Binding classes — what actually happens when you set a field

| Binding | Meaning | Example |
|---------|---------|---------|
| `typed` | Real vendor field passed to Vertex Lyria as a typed parameter | `prompt`, `seed`, `lyrics.text` (`negative_prompt` is prose since 2026-09-07 — see its row below) |
| `prose` | Compiled into the Lyria prompt as English natural language; the exact sent clause is echoed back in `bindings.<param>.sent` | `vocal`, `tempo_bpm`, `moods`, `genres`, `instruments` |
| `enforced` | Measured or edited on the delivered file post-generation | `duration`, `mastering`, `export`, `channel_layout`, `normalize_output`, `fade_in_seconds`, `fade_out_seconds`, `mix_dynamic_range` |
| `compiled` | Compiled by one of our pre-generation stages (e.g. structure → `[mm:ss]` timeline; energy_curve → per-section intensity) | `structure`, `energy_curve`, `mood_orbit`, `controls`, `references` |
| `our_stage` | Handled by one of our pipeline stages (variations, stems, threshold overrides, orthography routing) | `output_package`, `variation_count`, `arrangement_ai`, `stems`, `lyrics_orthography_route`, `lyrics_verify_metric`, `lyrics_threshold_override`, `lyrics_measurement_domain`, `run_originality_gate`, `route`, `quality`, `webhook_url`, `capabilities`, `labels`, `prompt_enhance` |
| `response_field` | Output-only; the field is echoed in the response but not sent to any engine | `rights`, `compliance`, `analysis_outputs` |
| `client_side` | For the UI's own use; the server ignores it (except for echoing) | `project`, `client_side_echo` |

## Wiring status — measured, not assumed

<!-- GENERATED:wiring-status BEGIN -->
**103 parameters in the spec (100 request parameters + 3 response-only)** — every one wired, verified by two instruments run against the serving tree:

- an internal operator script (static trace per binding class): **103/103 wired**, 36 nested sub-fields with 0 unwired.
- an internal operator script (differential: baseline vs mutated plan must differ, or the parameter must carry an honest declaration): **103/103, 0 failures** — every request parameter not hand-tabled receives a mutation derived from the spec's own value set, so the audited count equals the spec count by construction.
- LIVE (2026-09-06, an internal operator script): one `dry_run=true` request carrying every request parameter returned 200 on the tagged revision and every parameter left a compiled trace (`bindings` entry, prompt clause or typed slot); 15 differential samples changed `prompt_sent` / `bindings` / `generation_payload` / `route` / `render_settings` live, at $0.

`dry_run: true` (D-MUS122-49) is how a caller — or a test — sees exactly what a request compiles to without paying for a take: the response carries `prompt_sent`, `generation_payload`, `bindings`, `route`, `language_capability` and `render_settings` (what the render stage would do), and `spend_note` states that nothing billable ran.
<!-- GENERATED:wiring-status END -->

**Every free-text field is also content-checked** before anything is generated — seven policy
categories. See [16 — Content policy](16-content-policy.md).

## Control shapes — how a UI should render each field

| Control | Meaning |
|---------|---------|
| `text` | Free text input; `constraints.max_length` if set |
| `combo` | Single-choice from a fixed enum or an imported vocabulary |
| `multi-select` | Any subset of a fixed enum or imported vocabulary |
| `chips` | Ordered list of freeform chips (comma-separated), or from a fixed enum |
| `slider` | Numeric with `min`, `max`, `step`, and `unit` |
| `toggle` | Boolean or "on"/"off" |
| `envelope` | Time-value curve (`{preset, points[{t, v}]}`) |
| `radar` | Named-axis vector (`{axes[], value_range}`) |
| `upload` | Reference asset uploaded to a GCS URL |

## Full parameter table

<!-- GENERATED:parameter-table BEGIN -->
Rows are the 103 parameters as loaded by the service, with `binding` and `control` from the spec.
See the service's internal research documentation (available from the API operator on request) for the deeper research-item rationale per parameter.

| # | Parameter | Binding | Control | Values / constraints |
|---|-----------|---------|---------|----------------------|
| 1 | `project` | client_side | text | object: `name`, `track_id`, `version_note` — see shape reference |
| 2 | `creative_goal` | prose | combo | `epic_cinematic_uplifting`, `dark_tense_driving`, `warm_intimate_acoustic`, `playful_light_quirky`, `melancholic_reflective`, `heroic_triumphant`, `mysterious_atmospheric`, `romantic_sweeping`, `energetic_upbeat_pop`, `calm_ambient_meditative` |
| 3 | `prompt` | typed | text | max_length 5000 — **REQUIRED** |
| 4 | `prompt_enhance` | our_stage | toggle | object: `enabled`, `style` — see shape reference |
| 5 | `negative_prompt` | prose | chips | `cheesy`, `meme`, `lo-fi`, `distorted`, `90s_eurodance`, `muddy_low_end`, `harsh_highs`, `off_key_vocals`, `abrupt_ending` |
| 6 | `genres` | prose | multi-select | imported from the service's versioned `genre_vocabulary` data file (2,196 entries) |
| 7 | `eras` | prose | multi-select | imported from the service's versioned `era_vocabulary` data file (14 entries) |
| 8 | `moods` | prose | multi-select | imported from the service's versioned `mood_vocabulary` data file (114 entries) |
| 9 | `prompt_blocks` | prose | chips | array of objects: `role`, `text`, `weight` — see shape reference |
| 10 | `tempo_bpm` | prose | slider | `60`, `80`, `100`, `120`, `128`, `140`, `160`, `174` |
| 11 | `key` | prose | combo | generated: 12 roots × 9 modes |
| 12 | `time_signature` | prose | combo | `4/4`, `3/4`, `6/8`, `2/4`, `5/4`, `7/8`, `9/8`, `12/8`, `5/8`, `7/4`, `10/8` |
| 13 | `duration` | enforced | combo | object: `target_seconds`, `tolerance_seconds`, `on_miss` — see shape reference |
| 14 | `structure` | compiled | chips | array of objects: `section`, `bars` — see shape reference |
| 15 | `arrangement_ai` | our_stage | toggle | `on`, `off` |
| 16 | `energy_curve` | compiled | envelope | object: `preset`, `points` — see shape reference |
| 17 | `instruments` | prose | multi-select | imported from the service's versioned `instrument_vocabulary` data file (1,057 entries) |
| 18 | `sonic_tags` | prose | chips | `cinematic_swell`, `warm_analog`, `nostalgic_texture`, `hybrid_orchestral`, `punchy_low_end`, `no_vocals`, `dramatic_hits`, `wide_stereo`, `ethereal_pads`, `dark_undertone` — max_selected 10 |
| 19 | `mood_orbit` | compiled | radar | object: `axes`, `value_range` — see shape reference |
| 20 | `vocal` | prose | combo | object: `mode`, `language`, `language_policy` — see shape reference |
| 21 | `lyrics` | typed | combo | object: `mode`, `text`, `theme`, `verify`, `language`, `script` — see shape reference |
| 22 | `references` | compiled | upload | array of objects: `kind`, `url`, `text` — see shape reference |
| 23 | `output_package` | our_stage | combo | `single_track`, `variations`, `stems_bundle` |
| 24 | `variation_count` | our_stage | slider | `2`, `3`, `4` |
| 25 | `labels` | our_stage | text | object: `shape` — see shape reference |
| 26 | `route` | typed | combo | `auto`, `lyria-3-pro-preview`, `lyria-3-clip-preview`, `lyria-002` |
| 27 | `quality` | our_stage | combo | `draft`, `balanced`, `ultra` |
| 28 | `controls` | compiled | slider | object: `harmony_complexity`, `rhythm_density`, `sonic_polish` — see shape reference |
| 29 | `mastering` | enforced | combo | object: `target`, `loudness_lufs`, `true_peak_db` — see shape reference |
| 30 | `export` | enforced | combo | `wav24_48k`, `wav16_48k`, `flac_48k`, `mp3_320`, `mp3_native` |
| 31 | `stems` | our_stage | multi-select | `drums`, `bass`, `music`, `vocals`, `fx`, `ambience`, `master` |
| 32 | `rights` | response_field | toggle | response-only (see 06 — Response envelope) |
| 33 | `compliance` | response_field | toggle | response-only (see 06 — Response envelope) |
| 34 | `seed` | typed | text | type integer, min 0 |
| 35 | `webhook_url` | our_stage | text | type https_uri |
| 36 | `async` | our_stage | toggle | `true`, `false` |
| 37 | `dry_run` | our_stage | toggle | `true`, `false` |
| 38 | `capabilities` | our_stage | toggle | `true` |
| 39 | `analysis_outputs` | response_field | radar | response-only (see 06 — Response envelope) |
| 40 | `client_side_echo` | client_side | text | free text |
| 41 | `vocal_style` | prose | combo | `belting`, `soft`, `breathy`, `raspy`, `operatic`, `rap`, `falsetto`, `conversational` |
| 42 | `vocal_register` | prose | combo | `soprano`, `alto`, `tenor`, `baritone`, `bass` |
| 43 | `vocal_effects` | prose | chips | `reverb`, `doubling`, `harmony_stack`, `autotune`, `telephone`, `whisper` |
| 44 | `backing_vocals` | prose | combo | `none`, `harmonies`, `choir`, `call_response`, `oohs_aahs`, `gang_vocals` |
| 45 | `adlibs` | prose | text | free text → prose clause |
| 46 | `lyrics_structure` | prose | text | free text → prose clause |
| 47 | `lyrics_language_per_line` | prose | text | free text → prose clause |
| 48 | `lyrics_orthography_route` | our_stage | combo | `R0`, `R1` |
| 49 | `lyrics_verify_metric` | our_stage | combo | `per`, `cer`, `wer`, `ser` |
| 50 | `lyrics_threshold_override` | our_stage | slider | numeric 0.0–1.0 step 0.001 |
| 51 | `lyrics_measurement_domain` | our_stage | combo | `stem`, `mix` |
| 52 | `vocal_intensity` | prose | combo | `gentle`, `moderate`, `powerful`, `explosive` |
| 53 | `vocal_emotion` | prose | chips | free text → prose clause |
| 54 | `vocal_accent` | prose | text | free text → prose clause |
| 55 | `mix_stereo_width` | prose | combo | `mono`, `narrow`, `natural`, `wide`, `ultra_wide` |
| 56 | `mix_dynamic_range` | enforced | slider | numeric 1–20 step 1 LU |
| 57 | `mix_low_end` | prose | combo | `tight`, `punchy`, `deep`, `warm`, `minimal` |
| 58 | `mix_brightness` | prose | combo | `dark`, `warm`, `balanced`, `bright`, `airy` |
| 59 | `mix_vocal_prominence` | prose | combo | `buried`, `blended`, `forward`, `dominant` |
| 60 | `master_style` | prose | combo | `transparent`, `loud`, `vintage`, `punchy`, `smooth` |
| 61 | `arrangement_density` | prose | combo | `sparse`, `moderate`, `dense`, `wall_of_sound` |
| 62 | `dynamics_shape` | prose | combo | `steady`, `building`, `swelling`, `call_and_drop`, `waves` |
| 63 | `transitions` | prose | chips | `riser`, `impact`, `drum_fill`, `silence`, `sweep` |
| 64 | `groove_feel` | prose | combo | `straight`, `swing`, `shuffle`, `laid_back`, `pushed`, `syncopated` |
| 65 | `harmonic_palette` | prose | combo | `diatonic`, `modal`, `jazz`, `chromatic`, `dissonant` |
| 66 | `melodic_character` | prose | combo | `catchy`, `flowing`, `angular`, `minimal`, `virtuosic` |
| 67 | `rhythmic_feel` | prose | combo | `simple`, `moderate`, `complex`, `broken` |
| 68 | `percussion_style` | prose | combo | `acoustic_kit`, `electronic`, `orchestral`, `world`, `hybrid`, `none` |
| 69 | `bass_style` | prose | combo | `electric`, `synth`, `upright`, `sub`, `808`, `none` |
| 70 | `texture_layers` | prose | chips | `pads`, `field_recording`, `drones`, `arpeggios`, `risers`, `vinyl_crackle` |
| 71 | `sound_fx` | prose | chips | free text → prose clause |
| 72 | `production_era` | prose | combo | `modern_hifi`, `vintage_analog`, `lo_fi`, `demo`, `polished` |
| 73 | `spatial_ambience` | prose | combo | `dry`, `room`, `hall`, `cathedral`, `outdoor` |
| 74 | `intro_style` | prose | combo | `cold_open`, `fade_in`, `atmospheric`, `instrumental_hook`, `vocal_first` |
| 75 | `outro_style` | prose | combo | `hard_stop`, `fade_out`, `ritardando`, `outro_solo`, `ambient_tail` |
| 76 | `tempo_feel` | prose | combo | `relaxed`, `steady`, `driving`, `frantic`, `rubato` |
| 77 | `solo_instrument` | prose | text | free text → prose clause |
| 78 | `chord_progression` | prose | text | free text → prose clause |
| 79 | `cultural_style` | prose | text | free text → prose clause |
| 80 | `reference_artist_style` | prose | text | free text → prose clause |
| 81 | `instrumentation_notes` | prose | text | free text → prose clause |
| 82 | `mood_progression` | prose | text | free text → prose clause |
| 83 | `target_use` | prose | combo | `film_trailer`, `game`, `advert`, `podcast`, `streaming_single`, `social_clip` |
| 84 | `reference_tempo_source` | prose | text | free text → prose clause |
| 85 | `mix_compression` | prose | combo | `gentle`, `moderate`, `heavy`, `none` |
| 86 | `mix_saturation` | prose | combo | `clean`, `tape`, `tube`, `distorted` |
| 87 | `fade_in_seconds` | enforced | slider | numeric 0–15 step 1 seconds |
| 88 | `fade_out_seconds` | enforced | slider | numeric 0–15 step 1 seconds |
| 89 | `normalize_output` | enforced | toggle | `true`, `false` |
| 90 | `run_originality_gate` | our_stage | toggle | `true`, `false` |
| 91 | `channel_layout` | enforced | combo | `stereo`, `mono` |
| 92 | `loop_ready` | prose | toggle | `true` |
| 93 | `click_track` | prose | combo | `tight`, `human`, `loose` |
| 94 | `key_change` | prose | text | free text → prose clause |
| 95 | `hook_placement` | prose | combo | `early`, `chorus`, `throughout`, `delayed` |
| 96 | `tension_curve` | prose | combo | `constant`, `release_heavy`, `single_arc`, `cyclical` |
| 97 | `vocal_layering` | prose | combo | `single`, `double`, `stacked`, `unison_octave` |
| 98 | `vocal_pronunciation` | prose | text | free text → prose clause |
| 99 | `syllable_stress` | prose | text | free text → prose clause |
| 100 | `melisma` | prose | combo | `none`, `light`, `heavy` |
| 101 | `vibrato` | prose | combo | `none`, `subtle`, `expressive`, `operatic` |
| 102 | `song_title_in_lyrics` | prose | text | free text → prose clause |
| 103 | `countin` | prose | combo | `none`, `count_in`, `pickup`, `downbeat` |
<!-- GENERATED:parameter-table END -->

## Structured parameters — shape reference

<!-- GENERATED:structured-shapes BEGIN -->
Every nested field below is enforced at the boundary exactly as written (the service's nested_field_validation module, driven by the spec's own `fields` declarations and the service's versioned `nested_field_shapes` data file): an unknown nested key, an out-of-range number, a non-whole number where `step` is 1, an over-long string, a value outside its enum, a field sent while its `active_when` sibling does not hold, or a client-sent server-assigned field is refused with the field path named — before anything is generated.

### `project` (client_side, text) — one JSON object

- `name`: string ≤ 120 chars
- `track_id`: **server-assigned — refused if sent**
- `version_note`: string ≤ 200 chars

### `prompt_enhance` (our_stage, toggle) — one JSON object

- `enabled`: boolean; default `false`
- `style`: one of `cinematic`, `conservative`, `descriptive`; default `"conservative"`

Default when omitted:

```json
{
  "enabled": false,
  "style": "conservative"
}
```

### `prompt_blocks` (prose, chips) — JSON array of objects

- `role`: one of `bass`, `climax`, `harmony`, `hook`, `outro`, `percussion`, `texture`, `transition`
- `text`: string ≤ 280 chars
- `weight`: number 0.0–1.0 step 0.1

Default when omitted:

```json
[]
```

### `duration` (enforced, combo) — one JSON object

- `target_seconds`: number 10–180 step 1; default `135`
- `tolerance_seconds`: number 0–10; default `2`
- `on_miss`: one of `accept`, `regenerate`, `trim`; default `"trim"`

Default when omitted:

```json
{
  "target_seconds": 135,
  "tolerance_seconds": 2,
  "on_miss": "trim"
}
```

### `structure` (compiled, chips) — JSON array of objects

- array length ≤ 12 (`constraints.max_sections`)
- `section`: one of `breakdown`, `bridge`, `build`, `chorus`, `drop`, `interlude`, `intro`, `outro`, `pre_chorus`, `solo`, `verse`
- `bars`: number 1–64 step 1
- `section` is **required per item** (the compiler indexes it directly)
- `bars` is **required per item** (the compiler indexes it directly)

Default when omitted:

```json
[
  {
    "section": "intro",
    "bars": 8
  },
  {
    "section": "build",
    "bars": 8
  },
  {
    "section": "verse",
    "bars": 16
  },
  {
    "section": "pre_chorus",
    "bars": 8
  },
  {
    "section": "chorus",
    "bars": 16
  },
  {
    "section": "bridge",
    "bars": 8
  },
  {
    "section": "drop",
    "bars": 8
  },
  {
    "section": "outro",
    "bars": 8
  }
]
```

### `energy_curve` (compiled, envelope) — one JSON object

- `preset`: one of `cinematic`, `custom`, `double_peak`, `flat`, `front_loaded`, `linear_rise`, `valley`; default `"cinematic"`
- `points`: free-form `[{t: seconds, v: 0..1}]`
- `points[]` items: `t` ≥ 0; `v` 0.0–1.0; required `t`, `v`

Default when omitted:

```json
{
  "preset": "cinematic"
}
```

### `mood_orbit` (compiled, radar) — dedicated shape

Validated by its own check in `models.validate_request` (models.validate_request section 5 validates {axes: {pole: 0..1}} against the spec's own axis ids and value_range).
- `axes`: one of `aggressive`, `dark`, `epic`, `hopeful`, `melancholic`, `uplifting`
- `value_range`: number 0.0–1.0

### `vocal` (prose, combo) — one JSON object

- `mode`: one of `choir`, `duet`, `female`, `instrumental`, `male`, `plan_decides`, `spoken`; default `"instrumental"`
- `language`: a code from the service's versioned `language_registry` data file ∪ the service's versioned `gemini_language_support` data file; default `"en"`
- `language_policy`: one of `measure`, `prefer_proven`, `strict`; default `"measure"`

Default when omitted:

```json
{
  "mode": "instrumental",
  "language": "en",
  "language_policy": "measure"
}
```

### `lyrics` (typed, combo) — one JSON object

- `mode`: one of `ai_write`, `custom`, `none`; default `"none"`
- `text`: string ≤ 2000 chars; only when `mode=custom`
- `theme`: string ≤ 1000 chars; only when `mode=ai_write`
- `verify`: boolean; default `true`
- `language`: a code from the service's versioned `language_registry` data file
- `script`: one of `auto`, `latin`

Default when omitted:

```json
{
  "mode": "none",
  "verify": true
}
```

### `references` (compiled, upload) — JSON array of objects

- array length ≤ 3 (`constraints.max_items`)
- `kind`: one of `descriptor`, `midi`, `user_audio`
- `url`: URI string; only when `kind in [user_audio, midi]`
- `text`: string ≤ 500 chars; only when `kind=descriptor`
- `kind` is **required per item** (the compiler indexes it directly)

Default when omitted:

```json
[]
```

### `labels` (our_stage, text) — dedicated shape

Validated by its own check in `models.validate_request` (models.validate_request section 4d validates Dict[key_type, value_type] read from labels.fields.shape).
- `shape`: object of string → string

### `controls` (compiled, slider) — one JSON object

- `harmony_complexity`: number 0–10 step 1; default `7`
- `rhythm_density`: number 0–10 step 1; default `6`
- `sonic_polish`: number 0–10 step 1; default `8`

Default when omitted:

```json
{
  "harmony_complexity": 7,
  "rhythm_density": 6,
  "sonic_polish": 8
}
```

### `mastering` (enforced, combo) — one JSON object

- `target`: one of `broadcast`, `cinematic_trailer`, `game`, `none`, `social`, `streaming`; default `"cinematic_trailer"`
- `loudness_lufs`: one of `-11`, `-14`, `-16`, `-23`, `-9`; default `"-9"`
- `true_peak_db`: number -3.0–0.0; default `-1.0`

Default when omitted:

```json
{
  "target": "cinematic_trailer",
  "loudness_lufs": "-9",
  "true_peak_db": -1.0
}
```
<!-- GENERATED:structured-shapes END -->

## Validation model

<!-- GENERATED:validation-model BEGIN -->
The validator (the service's request validator) runs every check and returns **all** refusals at once (`refused[]`), as an `INVALID_REQUEST` 400. Order of the sections in the code today:

1. **Unknown top-level fields** — refused BY NAME with the exact accepted list.
2. **Required** — `prompt` is the only field with no meaningful default.
3. **Per-parameter value sets** — `combo` and `multi-select` values must be in `values[]` / the imported vocabulary (and ≤ `max_selected`); `slider` values inside `[min, max]`; `text` ≤ `max_length`; typed `toggle`s accept a JSON boolean or one of their declared ids.
4. **Nested fields (2b)** — every `fields.<name>` declaration: wire shape (object / array of objects, `constraints.max_*` array caps), unknown nested keys refused by name, enum ids, `type: boolean`, `min`/`max` (whole numbers where `step` is 1), `max_length`, `type: uri`, `active_when`, `server_assigned`, and the per-item keys the compiler indexes (`structure[].section`, `structure[].bars`, `energy_curve.points[].t/.v`).
5. **Vocal / lyrics contracts** — `vocal.mode` ∈ its ids; `vocal.language` must be in the registry ∪ Google's documented Gemini list (109 codes) — a code outside both is refused naming both sources; `language_policy` `measure` (default: deliver and report the measured capability), `prefer_proven` (fall back, recorded) or `strict` (refuse unless proven); `lyrics.mode=custom` requires `lyrics.text`; `custom`/`ai_write` with `vocal.mode=instrumental` is a contradiction; `lyrics.verify` must be a boolean; a non-Latin lyric under a Latin-only phonemiser language (tr, en) is refused.
6. **References** — `references[].kind` ∈ `user_audio` / `midi` / `descriptor` (a named commercial track is a legal refusal).
7. **Active-when at the top level** — `variation_count` only with `output_package=variations`.
8. **`webhook_url`** must be `https://`.
9. **`labels`** must be an object of string → string (read from the spec's own shape).
10. **`mood_orbit`** — `{axes: {<pole>: 0..1}}` against the spec's axis ids and range.
11. **Turkish tradition rules** (music-16) — data-driven refusals and notices.

Before all of this, **content safety** (STAGE 0) and **prompt enhance** (STAGE 0.5) run on the text; a content refusal returns `CONTENT_REFUSED` and never reaches validation.
<!-- GENERATED:validation-model END -->

Every refusal is echoed in the response `refused[]` array with the field path and the reason.

## Bindings echoed in the response

The 200 response carries a `bindings` block that, for every field you set, shows how it reached
generation. Example:

```json
"bindings": {
    "duration": {
        "binding": "prose_hint_plus_enforced",
        "sent": "The piece is approximately 30 seconds long, continuous from beginning to end.",
        "note": "prose length request (no vendor duration field exists — measured); the conform stage enforces target±tolerance on the delivered file per duration.on_miss when it runs (render_plan.conform)"
    },
    "vocal": {"binding": "prose", "sent": "Vocal style: a male voice, singing in en."},
    "lyrics": {
        "binding": "typed",
        "convention": "Lyrics-in-quotes (measured)",
        "orthography_route": "R0 (default per a recorded platform decision)"
    }
}
```

The `bindings` block is the honest record of what actually left the frontend — a setting is always
distinguishable from a wish.

## Full parameter research

- Rationale, evidence and refusal-law behind every parameter: the service's internal research documentation (available from the API operator on request)
- Vocal and lyric fields, deep dive: the service's internal research documentation (available from the API operator on request)
- Composition + arrangement fields: the service's internal research documentation (available from the API operator on request)
- Taxonomy vocabularies: the service's internal research documentation (available from the API operator on request)
