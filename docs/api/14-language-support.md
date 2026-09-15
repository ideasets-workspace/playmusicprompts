# 14 · Language Support

Which languages the platform accepts, what the service measures for each, and what happens when a
caller asks for a language whose singing has not yet been proven on our own route.

Source of truth: the service's versioned language registry (evidence states)
plus `the service's internal data/gemini_language_support.json` (Google's documented
Gemini language list — the transcription leg; generated from
`docs/external-api/vertex-gemini/2026-09-05-vertex-google-models-language-support.md`). Both are loaded at
container start; every value in this document was read from them, or measured on the live service, on
2026-09-05.

## The accepted universe — 109 languages (since 2026-09-05)

`vocal.language` and `lyrics.language` accept **109 codes**: the 11 registry languages below plus every
language Google documents for all Gemini models. The full list with per-language states is served by the
capabilities call (`POST /v1/music` with `{"capabilities": true}`, field `vocal.fields.language.values`).
A code outside the universe is refused with HTTP `400` / `error_code: INVALID_REQUEST` and the message
names both sources.

Two questions are answered separately for every language, never as one blended "supported" flag:

| question | answer |
|---|---|
| Can the engine **sing** in this language? | Yes for any accepted language — Lyria sings lyrics in the language of the prompt and adapts pronunciation to it (`docs/external-api/vertex-lyria-3/music-generation-interactions.html`, Google, Last updated 2026-09-04). |
| Can the service **verify** what was sung? | Transcription (Gemini): documented for all 109. Phoneme error rate (PER): only where a sourced phonemiser exists (`per_gate._LANGUAGES`: `tr`, `en`); every other language receives the line-aware grapheme metrics CER / WER (the service's grapheme_metrics module, verdict `GRAPHEME_ONLY`, `per: null`; WER flagged `LOW_INFORMATION` for scripts written without spaces). Calibrated pass/fail bar: `en` only. |

Every sung or spoken response carries `language_capability` (the service's language_capability module):

```json
"language_capability": {
    "code": "tr", "name": "Türkçe",
    "generation": "PROMPT_LANGUAGE",
    "transcription": "GEMINI_DOCUMENTED",
    "intelligibility_gate": "PHONEMISER_AVAILABLE",
    "bar": "NOT_CALIBRATED",
    "singing": "ENGINEERING_PATH_ESTABLISHED",
    "speech": "PENDING_MEASUREMENT"
}
```

`intelligibility_gate` is `PHONEMISER_AVAILABLE` (PER computed) or `GRAPHEME_METRICS_ONLY` (CER/WER only);
`bar` is `CALIBRATED` or `NOT_CALIBRATED`; `singing` / `speech` are the registry states below or
`NOT_IN_REGISTRY` for the 98 Gemini-documented languages that have no registry entry yet. The lyric
gate's own block (`lyrics_verification`) repeats `language` and `intelligibility_gate` next to its numbers.

## The 11 registered languages

| Code | Label | Singing state | Bar (PER) | Coverage | Blocker |
|------|-------|---------------|-----------|----------|---------|
| `en` | English | **SINGING_PROVEN** | 0.418776 (n=14 vocadito, recalibrated 2026-09-03 after D11) | 0.4681 vs RU | — |
| `tr` | Turkish | ENGINEERING_PATH_ESTABLISHED | NOT_MEASURED | 0.6232 vs RU | a recorded platform decision corpus licence (CC BY-NC-ND) — see below |
| `zh` | Chinese | DOCUMENTED_CONVERGENT | NOT_MEASURED | 0.3086 vs RU | Owner spend + sung corpus |
| `ja` | Japanese | DOCUMENTED_CONVERGENT | NOT_MEASURED | 0.6275 vs RU | Owner spend + sung corpus (PJS candidate) |
| `ko` | Korean | DOCUMENTED_CONVERGENT | NOT_MEASURED | 0.3908 vs RU | Owner spend + sung corpus |
| `ru` | Russian | DOCUMENTED_CONVERGENT | NOT_MEASURED | 0.4179 vs RU (self) | Owner spend + sung corpus |
| `es` | Spanish | DOCUMENTED_CONVERGENT | NOT_MEASURED | 0.4878 vs RU | Owner spend + sung corpus |
| `fr` | French | DOCUMENTED_CONVERGENT | NOT_MEASURED | 0.5893 vs PT | Owner spend + sung corpus (vocadito candidate) |
| `de` | German | DOCUMENTED_CONVERGENT | NOT_MEASURED | 0.7586 vs RU | Owner spend + sung corpus |
| `it` | Italian | DOCUMENTED_CONVERGENT | NOT_MEASURED | 0.4938 vs RU | Owner spend + sung corpus |
| `pt` | Portuguese | DOCUMENTED_SINGLE | NOT_MEASURED | 0.4022 vs ES | Owner spend + sung corpus |

`en` is the only language whose PER bar has been calibrated on labelled sung material. Every other
language is delivered with its state reported (`bar: NOT_CALIBRATED`) — never refused by default and
never silently promoted.

## `SINGING_PROVEN` — what it means precisely

A language enters `SINGING_PROVEN` state ONLY when:

1. A **labelled sung corpus** exists in that language (with hand-scored PER on each sample).
2. The `bar_calibration` tool has run on that corpus and produced a numeric `bar.value` with an
   `n` and `dataset` field.
3. The calibration was performed on the current phonemiser + ASR + separator combination (a bar
   from a different setup would drift).

an operator decision a recorded platform decision: a language enters with EVIDENCE, and a silent substitution is the
deception class the project must never commit.

## Requesting a language that is not `SINGING_PROVEN` — `vocal.language_policy`

- **`measure`** (default since 2026-09-05 — the operator's order verbatim: *"dünyadaki tüm dilleri
  destekliyoruz biz"*): the song is generated in the requested language and the response reports
  `language_capability` (above) plus the lyric gate's measured numbers with verdict `NOT_CALIBRATED` where no
  bar exists. Nothing is refused, nothing is substituted, nothing is hidden.
- **`strict`**: the request is refused with HTTP `400` / `error_code: INVALID_REQUEST` unless the
  language's state satisfies the mode (`SINGING_PROVEN` for sung, `SPEECH_PROVEN` for spoken) — a recorded platform decision
  behaviour, kept as an opt-in for products that must only ship gate-proven languages.
- **`prefer_proven`**: the request falls back to a proven language (`en` today) and the response carries
  `language_fallback` with the requested language, its state and the reason — never a silent swap.

(Until 2026-09-05 this section documented `422 LANGUAGE_NOT_PROVEN` with `error_class` / `caller_action`
fields. No such code or fields exist in `the service's main stage` or the error catalogue; validation refusals have always
been `400 INVALID_REQUEST`. The measured envelope is below.)

Example (default policy, sung Turkish — measured live 2026-09-05 on revision `music-api-00059-4pk`, HTTP 200):

```json
{
    "prompt": "Warm acoustic ballad, gentle piano and strings, intimate and hopeful.",
    "duration": {"target_seconds": 30},
    "genres": ["pop"],
    "vocal": {"mode": "female", "language": "tr"},
    "lyrics": {"mode": "custom", "text": "Kalbim seninle, yolum uzun\nGece biter, sabah olur"}
}
```

Response (excerpt): `success: true`, a delivered master (30.0 s, pcm_s24le, 48 kHz), `language_capability`
as above, and `lyrics_verification` with `per: 0.025`, `verdict: "NOT_CALIBRATED"`,
`bar_source: "NOT_CALIBRATED — no calibrated bar for this language (registry)"`, `language: "tr"`.
Evidence: the live proof record of 2026-09-05 (see the service's internal research documentation (available from the API operator on request), section "Language capability").

Example (strict):

```json
{
    "prompt": "warm Turkish folk song",
    "vocal": {"mode": "male", "language": "tr", "language_policy": "strict"},
    "lyrics": {"mode": "custom", "text": "..."}
}
```

Response (HTTP 400, measured live 2026-09-05):

```json
{
    "success": false,
    "error": "vocal.language 'tr' refused for mode=male under language_policy=strict: singing state is ENGINEERING_PATH_ESTABLISHED, SINGING_PROVEN required. Evidence: ... Unlock: the calibration protocol of a recorded platform decision, or language_policy=measure to deliver with the measured capability reported. Currently SINGING_PROVEN languages: ['en']",
    "error_code": "INVALID_REQUEST"
}
```

Example (fallback):

```json
{
    "prompt": "warm Turkish folk song",
    "vocal": {"mode": "male", "language": "tr", "language_policy": "prefer_proven"},
    "lyrics": {"mode": "custom", "text": "..."}
}
```

Response includes `"language_fallback": {"requested": "tr", "requested_state": "ENGINEERING_PATH_ESTABLISHED", "delivered": "en", "reason": "singing for 'tr' is ENGINEERING_PATH_ESTABLISHED, not SINGING_PROVEN; prefer_proven fell back — never silently"}`.

## Writing system of the lyric

The service measures the script of `lyrics.text` (Unicode script name of its letters,
the service's lyric_script module). A non-Latin lyric is refused (HTTP 400) **only** for a language whose
phonemiser reads Latin orthography (`tr`, `en`); for every other language the script is accepted as written —
the engine sings it and the gate uses grapheme metrics. `lyrics.script: "latin"` is a claim and is refused
when the text contradicts it. Control: an internal operator script #5.

## Coverage score — what it measures

`coverage_score.value` is the fraction of the language's phoneme inventory that appears in the
best-matching PHOIBLE reference inventory. Higher = more of the language's sounds are covered by
the compiler + phonemiser.

Compute path:

1. Load the PHOIBLE inventory of the language (from the service's versioned `phoible_segment_features` data file).
2. Compare against every other PHOIBLE reference inventory in the registry.
3. Take the maximum `intersection / language_phones` ratio; note the reference.

Example: `de.coverage_score = 0.7586 vs RU` means 75.86 % of German phones exist in the Russian
PHOIBLE inventory (highest coverage among the 11 references). This is a **feasibility signal**
for the phonemiser + PER path, not a quality prediction.

## Turkish — the special case

Turkish is the only non-`en` language with a `coverage_score` computed against a live corpus. Its
inventory covers ~62 % of the Russian reference (best match among all references).

Turkish IS delivered (default policy) — measured live 2026-09-05 (PER 0.025 on the delivered take,
verdict `NOT_CALIBRATED`) — but its bar is not calibrated because:

- a recorded platform decision — the only lawful Turkish sung corpus identified so far (`Turkish Makam Music`) is CC BY-NC-ND,
  which forbids commercial derivative use.
- The R1 phoneme-informed respelling route exists specifically for Turkish (using the CC BY 4.0
  MFA Turkish lexicon + variant rules) and PER is computed on every Turkish take, so once a sung corpus
  becomes available Turkish should be the second language to move to `SINGING_PROVEN`.

Full research: the service's internal research documentation (available from the API operator on request), the service's internal research documentation (available from the API operator on request).

## Adding a new language (operator runbook)

1. Extract the PHOIBLE inventory (if the language is in PHOIBLE) via
   an internal operator script — add the language code to `RESEARCH_LANGUAGES`.
2. Compute the coverage score via `an internal operator script --write-registry`.
3. Add a phonemiser module (the service's per-language phonemiser module) — pointing at the language's MFA
   dictionary + variant rules (all under the CC BY 4.0 MFA licence).
4. Provision a labelled sung corpus (with hand-scored PER).
5. Run `bar_calibration.py` to produce `bar.value` and store it in the service's versioned `language_registry` data file.
6. Flip `singing: NOT_MEASURED` → `singing: SINGING_PROVEN` in the registry.
7. (Retired 2026-09-05: there is no twin tree any more - `the service's internal ` is the only tree.)
8. Redeploy the Cloud Run service.

All eight steps are needed. Skipping any of them silently produces a language that "seems
supported" but is not lawful.

## Language-per-line

For a multi-language sung request use the `lyrics_language_per_line` parameter. Today this is a
free-text descriptor sent as prose; a structured tuple-per-line surface is a follow-up.

## Related documents

- Phonology + coverage research: the service's internal research documentation (available from the API operator on request)
- Bar calibration research: the service's internal research documentation (available from the API operator on request)
- Language registry research: the service's internal research documentation (available from the API operator on request)
- G2P (R0/R1) research: the service's internal research documentation (available from the API operator on request)
