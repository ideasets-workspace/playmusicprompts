# 04 · Request Body — All 101 Parameters

Every field the service accepts on `POST /v1/music`, its **binding class**, its **control shape**,
and its **allowed values**. Everything is optional except `prompt`. Unknown fields are refused
BY NAME (400 `INVALID_REQUEST`) — the API never silently drops or coerces an unknown field.

The parameter surface is versioned in the service's versioned parameter specification
(the single source of truth) and is loaded at container start; the count MUST equal 101 or the
container fails its startup control.

## Binding classes — what actually happens when you set a field

| Binding | Meaning | Example |
|---------|---------|---------|
| `typed` | Real vendor field passed to Vertex Lyria as a typed parameter | `prompt`, `seed`, `negative_prompt`, `lyrics.text` |
| `prose` | Compiled into the Lyria prompt as English natural language; the exact sent clause is echoed back in `bindings.<param>.sent` | `vocal`, `tempo_bpm`, `moods`, `genres`, `instruments` |
| `enforced` | Measured or edited on the delivered file post-generation | `duration`, `mastering`, `export`, `channel_layout`, `normalize_output`, `fade_in_seconds`, `fade_out_seconds`, `mix_dynamic_range` |
| `compiled` | Compiled by one of our pre-generation stages (e.g. structure → `[mm:ss]` timeline; energy_curve → per-section intensity) | `structure`, `energy_curve`, `mood_orbit`, `controls`, `references` |
| `our_stage` | Handled by one of our pipeline stages (variations, stems, threshold overrides, orthography routing) | `output_package`, `variation_count`, `arrangement_ai`, `stems`, `lyrics_orthography_route`, `lyrics_verify_metric`, `lyrics_threshold_override`, `lyrics_measurement_domain`, `run_originality_gate`, `route`, `quality`, `webhook_url`, `capabilities`, `labels`, `prompt_enhance` |
| `response_field` | Output-only; the field is echoed in the response but not sent to any engine | `rights`, `compliance`, `analysis_outputs` |
| `client_side` | For the UI's own use; the server ignores it (except for echoing) | `project`, `client_side_echo` |

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

Rows are the 101 parameters as loaded by the service, with `binding` and `control` from the spec.
See the service's internal research documentation (available from the API operator on request) for the deeper research-item rationale per parameter.

| # | Parameter | Binding | Control | Values / constraints |
|---|-----------|---------|---------|----------------------|
| 1 | `project` | client_side | text | Object: `{name, track_id, version_note}` |
| 2 | `creative_goal` | prose | combo | `epic_cinematic_uplifting`, `dark_tense_driving`, `warm_intimate_acoustic`, `playful_light_quirky`, `melancholic_reflective`, `heroic_triumphant`, `mysterious_atmospheric`, `romantic_sweeping`, `energetic_upbeat_pop`, `calm_ambient_meditative` |
| 3 | `prompt` | typed | text | `{"max_length": 5000}` — **REQUIRED** |
| 4 | `prompt_enhance` | our_stage | toggle | Object: `{enabled, style}` |
| 5 | `negative_prompt` | typed | chips | `cheesy`, `meme`, `lo-fi`, `distorted`, `90s_eurodance`, `muddy_low_end`, `harsh_highs`, `off_key_vocals`, `abrupt_ending` |
| 6 | `genres` | prose | multi-select | Imported from the service's versioned `genre_vocabulary` data file (2,196 entries) |
| 7 | `eras` | prose | multi-select | Imported from the service's versioned `era_vocabulary` data file (14 entries) |
| 8 | `moods` | prose | multi-select | Imported from the service's versioned `mood_vocabulary` data file (114 entries) |
| 9 | `prompt_blocks` | prose | chips | Object: `{role, text, weight}` |
| 10 | `tempo_bpm` | prose | slider | `60`, `80`, `100`, `120`, `128`, `140`, `160`, `174` |
| 11 | `key` | prose | combo | Musical key ("C", "Cm", "D#", etc.) |
| 12 | `time_signature` | prose | combo | `4/4`, `3/4`, `6/8`, `2/4`, `5/4`, `7/8`, `9/8`, `12/8`, `5/8`, `7/4`, `10/8` |
| 13 | `duration` | enforced | combo | Object: `{target_seconds, tolerance_seconds, on_miss}` — see below |
| 14 | `structure` | compiled | chips | Array of `{section, bars}` — compiles into `[mm:ss]` section prose |
| 15 | `arrangement_ai` | our_stage | toggle | `on`, `off` |
| 16 | `energy_curve` | compiled | envelope | Object: `{preset, points}` — per-section intensity |
| 17 | `instruments` | prose | multi-select | Imported from the service's versioned `instrument_vocabulary` data file (1,057 entries) |
| 18 | `sonic_tags` | prose | chips | `cinematic_swell`, `warm_analog`, `nostalgic_texture`, `hybrid_orchestral`, `punchy_low_end`, `no_vocals`, `dramatic_hits`, `wide_stereo`, `ethereal_pads`, `dark_undertone` |
| 19 | `mood_orbit` | compiled | radar | Object: `{axes, value_range}` — resolved via the service's versioned `mood_orbit_lexicon` data file |
| 20 | `vocal` | prose | combo | Object: `{mode, language, language_policy}` — mode ∈ `{instrumental, male, female, duet, choir, spoken}` |
| 21 | `lyrics` | typed | combo | Object: `{mode, text, theme, verify, language, script}` — mode ∈ `{custom, ai_write, none}` |
| 22 | `references` | compiled | upload | Object: `{kind, url, text}` |
| 23 | `output_package` | our_stage | combo | `single_track`, `variations`, `stems_bundle` |
| 24 | `variation_count` | our_stage | slider | `2`, `3`, `4` (only when `output_package=variations`) |
| 25 | `labels` | our_stage | text | Object: `dict[str, str]` |
| 26 | `route` | typed | combo | `auto`, `lyria-3-pro-preview`, `lyria-3-clip-preview`, `lyria-002` |
| 27 | `quality` | our_stage | combo | `draft`, `balanced`, `ultra` |
| 28 | `controls` | compiled | slider | Object: `{harmony_complexity, rhythm_density, sonic_polish}` — resolved via the service's versioned `knob_grade_lexicon` data file |
| 29 | `mastering` | enforced | combo | Object: `{target, loudness_lufs, true_peak_db}` |
| 30 | `export` | enforced | combo | `wav24_48k`, `wav16_48k`, `flac_48k`, `mp3_320`, `mp3_native` |
| 31 | `stems` | our_stage | multi-select | `drums`, `bass`, `music`, `vocals`, `fx`, `ambience`, `master` |
| 32 | `rights` | response_field | toggle | Output only |
| 33 | `compliance` | response_field | toggle | Output only |
| 34 | `seed` | typed | text | `{"type": "integer", "min": 0}` |
| 35 | `webhook_url` | our_stage | text | `{"type": "https_uri"}` |
| 36 | `capabilities` | our_stage | toggle | `true` — flips the POST into a capability discovery response |
| 37 | `analysis_outputs` | response_field | radar | Output only |
| 38 | `client_side_echo` | client_side | text | Echoed back untouched |
| 39 | `vocal_style` | prose | combo | `belting`, `soft`, `breathy`, `raspy`, `operatic`, `rap`, `falsetto`, `conversational` |
| 40 | `vocal_register` | prose | combo | `soprano`, `alto`, `tenor`, `baritone`, `bass` |
| 41 | `vocal_effects` | prose | chips | `reverb`, `doubling`, `harmony_stack`, `autotune`, `telephone`, `whisper` |
| 42 | `backing_vocals` | prose | combo | `none`, `harmonies`, `choir`, `call_response`, `oohs_aahs`, `gang_vocals` |
| 43 | `adlibs` | prose | text | Free text |
| 44 | `lyrics_structure` | prose | text | Free text |
| 45 | `lyrics_language_per_line` | prose | text | Free text |
| 46 | `lyrics_orthography_route` | our_stage | combo | `R0` (default), `R1` (phoneme-informed respell, Turkish only) |
| 47 | `lyrics_verify_metric` | our_stage | combo | `per`, `cer`, `wer`, `ser` |
| 48 | `lyrics_threshold_override` | our_stage | slider | `{"min": 0.0, "max": 1.0, "step": 0.001}` |
| 49 | `lyrics_measurement_domain` | our_stage | combo | `stem` (default, an internal work item), `mix` |
| 50 | `vocal_intensity` | prose | combo | `gentle`, `moderate`, `powerful`, `explosive` |
| 51 | `vocal_emotion` | prose | chips | Free text |
| 52 | `vocal_accent` | prose | text | Free text |
| 53 | `mix_stereo_width` | prose | combo | `mono`, `narrow`, `natural`, `wide`, `ultra_wide` |
| 54 | `mix_dynamic_range` | enforced | slider | `{"min": 1, "max": 20, "step": 1, "unit": "LU"}` |
| 55 | `mix_low_end` | prose | combo | `tight`, `punchy`, `deep`, `warm`, `minimal` |
| 56 | `mix_brightness` | prose | combo | `dark`, `warm`, `balanced`, `bright`, `airy` |
| 57 | `mix_vocal_prominence` | prose | combo | `buried`, `blended`, `forward`, `dominant` |
| 58 | `master_style` | prose | combo | `transparent`, `loud`, `vintage`, `punchy`, `smooth` |
| 59 | `arrangement_density` | prose | combo | `sparse`, `moderate`, `dense`, `wall_of_sound` |
| 60 | `dynamics_shape` | prose | combo | `steady`, `building`, `swelling`, `call_and_drop`, `waves` |
| 61 | `transitions` | prose | chips | `riser`, `impact`, `drum_fill`, `silence`, `sweep` |
| 62 | `groove_feel` | prose | combo | `straight`, `swing`, `shuffle`, `laid_back`, `pushed`, `syncopated` |
| 63 | `harmonic_palette` | prose | combo | `diatonic`, `modal`, `jazz`, `chromatic`, `dissonant` |
| 64 | `melodic_character` | prose | combo | `catchy`, `flowing`, `angular`, `minimal`, `virtuosic` |
| 65 | `rhythmic_feel` | prose | combo | `simple`, `moderate`, `complex`, `broken` |
| 66 | `percussion_style` | prose | combo | `acoustic_kit`, `electronic`, `orchestral`, `world`, `hybrid`, `none` |
| 67 | `bass_style` | prose | combo | `electric`, `synth`, `upright`, `sub`, `808`, `none` |
| 68 | `texture_layers` | prose | chips | `pads`, `field_recording`, `drones`, `arpeggios`, `risers`, `vinyl_crackle` |
| 69 | `sound_fx` | prose | chips | Free text |
| 70 | `production_era` | prose | combo | `modern_hifi`, `vintage_analog`, `lo_fi`, `demo`, `polished` |
| 71 | `spatial_ambience` | prose | combo | `dry`, `room`, `hall`, `cathedral`, `outdoor` |
| 72 | `intro_style` | prose | combo | `cold_open`, `fade_in`, `atmospheric`, `instrumental_hook`, `vocal_first` |
| 73 | `outro_style` | prose | combo | `hard_stop`, `fade_out`, `ritardando`, `outro_solo`, `ambient_tail` |
| 74 | `tempo_feel` | prose | combo | `relaxed`, `steady`, `driving`, `frantic`, `rubato` |
| 75 | `solo_instrument` | prose | text | Free text |
| 76 | `chord_progression` | prose | text | Free text (e.g. `Am-F-C-G`) |
| 77 | `cultural_style` | prose | text | Free text |
| 78 | `reference_artist_style` | prose | text | Free text |
| 79 | `instrumentation_notes` | prose | text | Free text |
| 80 | `mood_progression` | prose | text | Free text |
| 81 | `target_use` | prose | combo | `film_trailer`, `game`, `advert`, `podcast`, `streaming_single`, `social_clip` |
| 82 | `reference_tempo_source` | prose | text | Free text |
| 83 | `mix_compression` | prose | combo | `gentle`, `moderate`, `heavy`, `none` |
| 84 | `mix_saturation` | prose | combo | `clean`, `tape`, `tube`, `distorted` |
| 85 | `fade_in_seconds` | enforced | slider | `{"min": 0, "max": 15, "step": 1, "unit": "seconds"}` |
| 86 | `fade_out_seconds` | enforced | slider | `{"min": 0, "max": 15, "step": 1, "unit": "seconds"}` |
| 87 | `normalize_output` | enforced | toggle | `true`, `false` |
| 88 | `run_originality_gate` | our_stage | toggle | `true`, `false` (default) |
| 89 | `channel_layout` | enforced | combo | `stereo`, `mono` |
| 90 | `loop_ready` | prose | toggle | `true` |
| 91 | `click_track` | prose | combo | `tight`, `human`, `loose` |
| 92 | `key_change` | prose | text | Free text |
| 93 | `hook_placement` | prose | combo | `early`, `chorus`, `throughout`, `delayed` |
| 94 | `tension_curve` | prose | combo | `constant`, `release_heavy`, `single_arc`, `cyclical` |
| 95 | `vocal_layering` | prose | combo | `single`, `double`, `stacked`, `unison_octave` |
| 96 | `vocal_pronunciation` | prose | text | Free text |
| 97 | `syllable_stress` | prose | text | Free text |
| 98 | `melisma` | prose | combo | `none`, `light`, `heavy` |
| 99 | `vibrato` | prose | combo | `none`, `subtle`, `expressive`, `operatic` |
| 100 | `song_title_in_lyrics` | prose | text | Free text |
| 101 | `countin` | prose | combo | `none`, `count_in`, `pickup`, `downbeat` |

## Structured parameters — shape reference

### `duration` (enforced, combo)

```json
{
    "target_seconds": 30,
    "tolerance_seconds": 2,
    "on_miss": "conform"
}
```

- `target_seconds`: 15 to 300 (5 minutes). Lyria emits ~30-160 s unasked; conform trims to target.
- `tolerance_seconds`: 0 to 15. If the raw generation lands within this window of `target_seconds`,
  no trim is applied.
- `on_miss`: `conform` (trim + fade, bar-aligned when possible; default) or `refuse` (return an error
  if the raw file is out of tolerance) or `report` (deliver as-is with the miss noted).

### `vocal` (prose, combo)

```json
{
    "mode": "male",
    "language": "en",
    "language_policy": "strict"
}
```

- `mode` ∈ `{instrumental, male, female, duet, choir, spoken}`. Anything other than `instrumental`
  activates the singing path.
- `language`: registry-gated. Only `en` is `SINGING_PROVEN` today. Non-proven languages are refused
  (`strict`) or fall back to `en` (`prefer_proven`).
- `language_policy` ∈ `{strict, prefer_proven}`.

### `lyrics` (typed, combo)

```json
{
    "mode": "custom",
    "text": "the exact words, sung verbatim",
    "verify": true
}
```

- `mode` ∈ `{custom, ai_write, none}`. `custom` uses the exact `text` you provide.
- `text`: the sung words (max 5000 chars).
- `verify`: if true, runs the PER intelligibility gate on the sung take (see `05-lyrics-and-singing.md`).
- `language` and `script`: optional overrides used by the phonemiser.

### `mastering` (enforced, combo)

```json
{
    "target": "streaming",
    "loudness_lufs": -14,
    "true_peak_db": -1
}
```

Defaults: `-14 LUFS`, `-1 dBTP` (streaming target). See `08-audio-pipeline.md` for the two-pass
mastering algorithm.

### `structure` (compiled, chips)

```json
[
    {"section": "intro", "bars": 4},
    {"section": "verse", "bars": 16},
    {"section": "chorus", "bars": 16},
    {"section": "verse", "bars": 16},
    {"section": "outro", "bars": 8}
]
```

Compiled into `[mm:ss]` section prose in the Lyria prompt.

## Validation model

The validator (the service's request validator) applies these checks in order, and
refuses on the FIRST failure with an `INVALID_REQUEST` 400:

1. **Unknown fields** — every top-level and nested field must be in `param_spec.json`. Unknown
   fields are refused BY NAME.
2. **Type mismatch** — a field's type must match its `control` shape (e.g. `duration` must be an
   object, `prompt` must be a string, `seed` must be a non-negative integer).
3. **Predefined values** — a `combo` or `multi-select` value must be in the parameter's `values[]`
   list (or in the imported vocabulary).
4. **Range** — a `slider` value must be within `[min, max]` with the correct `step`.
5. **Cap** — `prompt.max_length`, `variation_count.max`, etc.
6. **`active_when` contract** — some fields are only active when another field is set
   (e.g. `variation_count` only when `output_package=variations`).
7. **Registry gate** — `vocal.language` must be in the service's versioned `language_registry` data file and, for a sung
   request, `SINGING_PROVEN` unless `language_policy=prefer_proven`.
8. **HTTPS scheme** — `webhook_url` must start with `https://`.
9. **Label shape** — `labels` must be `dict[str, str]`.

Every refusal is echoed in the response `refused[]` array with the field name and the reason.

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
