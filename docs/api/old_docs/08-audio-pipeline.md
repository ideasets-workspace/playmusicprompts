# 08 · Audio Pipeline — From Prompt to Delivered File

Every stage the audio passes through, in order, with what runs, where, and what the response
reports. Every duration/measurement in this document is captured from real production runs in the
current session; the raw audit is an internal evidence artefact.

## Overview

```
[client request]
      │
      ▼
[STAGE 1  Validate + Plan]          — planner.py, in-container, ~5 ms
      │
      ▼
[STAGE 2  A7 two-path mix plan]     — routing.py, in-container, ~10 ms
      │
      ▼
[STAGE 3  Generate]                 — vertex_lyria.py → Vertex AI Lyria, 60-150 s
      │
      ▼
[STAGE 4  Store + measure]          — storage.py + ffprobe, in-container, 200-500 ms
      │
      ▼
[STAGE 5  Conform (trim/pad)]       — render.py, in-container ffmpeg, 500 ms - 3 s
      │
      ▼
[STAGE 6  Master + verify]          — mastering.py, in-container ffmpeg + ebur128, 3-8 s
      │
      ▼
(sung only)
[STAGE 7  Separate (GPU)]           — separator_client → GCE L4 VM, 5-25 s
      │
      ▼
[STAGE 8  ASR-on-stem]              — asr_vertex → Vertex Gemini 2.5 Pro, 15-45 s
      │
      ▼
[STAGE 9  PER + vocable + VAD]      — per_gate.py, in-container, ~1 s
      │
      ▼
[STAGE 10 (opt-in) Originality]     — background thread, ~120 s (poll for verdict)
      │
      ▼
[response]
```

Instrumental requests skip stages 7-9; the request path is stages 1-6 only. Stage 10 runs off the
critical path when `run_originality_gate: true`.

## Stage 1 — Validate + Plan

**Where**: the service's `planner.plan` function, in-container.
**Cost**: ~5 ms.
**Fails as**: `INVALID_REQUEST` (400) with the `refused` array.

Reads the parameter body against `param_spec.json`, applies all 9 validation checks from
`04-request-body-full.md`, chooses the Lyria route (`auto` picks `lyria-3-pro-preview` for sung,
`lyria-002` for instrumental), and compiles the prompt into the exact English prose Lyria will see.

The compiled prompt is echoed in `response.prompt_sent`; every parameter's binding is echoed in
`response.bindings`.

## Stage 2 — A7 two-path mix plan

**Where**: the service's two-path mix-plan builder, in-container.
**Cost**: ~10 ms.
**Fails as**: `INVALID_REQUEST` (400) with the exact `the platform's stem-shipping policy` refusal.

Builds the set of layers the request implies:

- `MUSIC_BED` — always shipped
- `FX_BED`, `AMBIENCE_BED` — only when `stems[]` names them AND the request routes to a generator
  that can emit them (a recorded platform decision)
- `LEAD_VOCAL`, `STS_VOCAL` — refused BY LAW (no Google service emits a vocal-only signal; a
  separated stem may never be shipped per Clause 15)

The plan is executed AT PLAN TIME (before any billable call) so an unlawful request is refused for
free. The response `mix_plan` block reports every layer and every refusal with the law and the
"what would unblock it" note.

## Stage 3 — Generate

**Where**: `vertex_lyria.py::generate(prompt, model, instrumental_only, seed)`.
**Backend**: Vertex AI Lyria (Interactions surface, `:predict`) in `us-central1`.
**Auth**: ADC from the Cloud Run runtime service account (no WIF, no static key).
**Cost**: 60-150 s per take. Sung requests to `lyria-3-pro-preview` are slower than instrumental
`lyria-002`.

The generator produces one raw audio blob per take at 44.1 kHz stereo MP3 (measured). Lyria does
NOT accept a duration request — the raw output is ~30-160 s regardless. The conform stage handles
duration matching.

The generator returns:
```json
{
    "success": true,
    "audio_bytes": "<base64>",
    "extension": "mp3",
    "model": "lyria-3-pro-preview",
    "delegate_reported": {"surface": "interactions", "model": "lyria-3-pro-preview"}
}
```

Failures propagate as `GENERATION_FAILED` (502, upstream, terminal).

Retry policy: **one attempt per take, no automatic retry** (the platform's no-hidden-retry policy). The client can
issue a new request if they choose to.

## Stage 4 — Store + measure

**Where**: `storage.py::store_and_measure(audio_bytes, extension, request_id, take_index)`.
**Backend**: GCS bucket `playmusicprompts-content` (multi-region, standard class).
**Cost**: 200-500 ms per take (upload + ffprobe).

Writes the raw bytes to `gs://playmusicprompts-content/music/lyria_<utc>_<request_id>_t<n>.<ext>`
and runs ffprobe to measure `duration_seconds`, `codec`, `sample_rate`, `channels`. All values in
`response.measured` come from this ffprobe pass, not from Lyria labels.

The delivered file is fetched through a **V4 signed URL** that the API mints at delivery time. Any
HTTP client can GET it with no credentials of its own — a browser `<audio src>`, a mobile media
player, `curl -O`. The signature is time-limited (default 7 days, Google Cloud Storage's documented
V4 maximum), and `POST /v1/music/delivery-url` exchanges the stable `gcs_uri` for a fresh URL at no
cost when one expires.

The URL is signed rather than public because the delivery bucket cannot be made public: uniform
bucket-level access is enabled and locked until 2026-11-25, and the organisation policy
`iam.allowedPolicyMemberDomains` refuses an `allUsers` binding (both measured 2026-09-01). Signing
is performed through the IAM `signBlob` API using the Cloud Run runtime identity, so no key file
exists anywhere. If signing fails the request fails with `502` naming the cause — the API never
returns a URL it has not made fetchable.

## Stage 5 — Conform (trim / pad, bar-aligned)

**Where**: `render.py::post_process(body, gcs_uri)`.
**Backend**: ffmpeg in-container.
**Cost**: 500 ms - 3 s per take.

Reads `duration.target_seconds`, `duration.tolerance_seconds`, `duration.on_miss`. If the delivered
file is within the tolerance window, no trim is applied; otherwise:

- **`on_miss: conform`** (default): trim (or pad, rare) to the target. When `tempo_bpm` and
  `time_signature` are set the cut is **bar-aligned** — the cut lands on the bar boundary nearest
  the target within ±tolerance, so the trim never lands mid-bar. A one-bar fade-out (2 seconds at
  120 BPM 4/4) smooths the cut.
- **`on_miss: report`**: no trim, note the miss in the response.
- **`on_miss: refuse`**: return `MEASUREMENT_FAILED` if out of tolerance.

The plan is echoed in `render_plan.stages.conform`:

```json
{
    "ok": true,
    "measured_duration_seconds": 30.0,
    "plan": {
        "action": "trim",
        "cut_seconds": 30.0,
        "fade_seconds": 2.0,
        "derivation": {
            "bar_seconds": 2.0,
            "tempo_bpm": 120.0,
            "time_signature": "4/4",
            "bar_aligned": true,
            "rule": "cut at the bar boundary nearest target inside ±tolerance"
        },
        "delivered_seconds": 143.751792
    }
}
```

Full research: the service's internal research documentation (available from the API operator on request) (conform section).

## Stage 6 — Master (linear-gain + limiter, two-pass verified)

**Where**: `mastering.py::probe_duration + plan_conform + conform + master + verify_loudness`.
**Backend**: ffmpeg `loudnorm` (first-pass measurement) + `alimiter` (true-peak enforcement) +
`ebur128` (independent verification).
**Cost**: 3-8 s per take.

Two paths:

- **`linear_gain_plus_true_peak_limiter`** (frontier — chosen when the requested loudness can be
  reached without dynamic squashing): apply linear gain to hit the target LUFS, then a true-peak
  limiter to enforce the -1 dBTP ceiling. Preserves LRA.
- **`loudnorm`** (legacy fallback — chosen when linear gain would overshoot dBTP): two-pass ffmpeg
  loudnorm with dynamic normalisation.

Every master step measures BEFORE and AFTER. The `verification` block re-measures the FINAL file
with an independent `ebur128` pass to catch a case where `loudnorm` and the reader disagree
(measured on this project: single-pass `loudnorm` silently squashed LRA 14.40 → 6.70 on real
material; Clause 15 makes the second pass mandatory).

```json
"master": {
    "ok": true,
    "mode": "linear_gain_plus_true_peak_limiter",
    "applied_gain_db": 0.68,
    "limiter_limit_db": -1.0,
    "relimit_passes": 0,
    "residual_overshoot_db": 0.0,
    "target": {"lufs": -14.0, "true_peak_db": -1.0},
    "verification": {
        "has_audio": true,
        "measured": true,
        "channels": 2,
        "integrated_lufs": -13.9,
        "lra_lu": 5.8,
        "true_peak_dbtp": -1.0,
        "measured_by": "ebur128 (separate from the loudnorm that made the file)"
    }
}
```

The mastered file lands at `gs://playmusicprompts-content/music/mastered_<sha>.wav` and its
`public_url` becomes `response.render_plan.processed_url`. Downstream consumers should use the
`processed_url`, not the raw generator URL, as the delivered artefact.

Default target: **-14 LUFS, -1 dBTP** (streaming target — Spotify/YouTube/Apple Music baseline).
Override via `mastering.loudness_lufs` and `mastering.true_peak_db`.

## Stage 7 — Separate (GPU, sung requests only)

**Where**: `separator_client.py::separate(mix_gcs_uri)` → HTTP POST to
`the internal separator endpoint (configured server-side)` (GCE VM the separator service).
**Backend**: Mel-Band RoFormer / `Kim_Vocal_2.onnx` on NVIDIA L4 (24 GB VRAM, its own region).
**Cost**: 5-25 s per take (RTF 0.087 measured on L4). A 143-second raw mix separates in ~12 s.

The separator downloads the mixed track from GCS, runs the ONNX Runtime CUDA provider on the L4,
and writes the vocal stem to `gs://playmusicprompts-content/stems/<request_id>_vocals.wav` (plus
the instrumental stem for auditability). Returns:

```json
{
    "stem_gcs_uri": "gs://playmusicprompts-content/stems/f6d584a0b02e_vocals.wav",
    "other_gcs_uri": "gs://playmusicprompts-content/stems/f6d584a0b02e_instrumental.wav",
    "model": "Kim_Vocal_2.onnx",
    "mix_duration_s": 143.752,
    "stem_duration_s": 143.752,
    "separate_time_s": 12.47,
    "rtf": 0.087,
    "request_id": "f6d584a0b02e"
}
```

The stem is **analysis-only** (the platform's stem-shipping policy): it is never shipped in `tracks[]`. It exists to
feed Stage 8 (ASR) and Stage 9 (PER).

**NO_FALLBACK_TO_MIX policy**: if the separator is unreachable or fails, the gate reports
`measured:false` with `stage_failed:"1_separate"`; it MUST NOT silently downgrade to running ASR
on the mix. Running ASR on a mix conflates instrumental frequencies with vocal phonemes and
inflates PER — the exact defect this stage exists to prevent.

Full research: the service's internal research documentation (available from the API operator on request) (stem separation).

## Stage 8 — ASR on the stem

**Where**: `asr_vertex.py::transcribe(stem_gcs_uri, language)`.
**Backend**: Vertex AI Gemini 2.5 Pro (`:generateContent`).
**Cost**: 15-45 s per take.

Transcribes the vocal stem to a text hypothesis. The stem, not the mix, is transcribed — running
ASR on the mix would conflate instrumental content with phonemes (see Stage 7 above).

The returned transcript is used in Stage 9. It is also echoed in
`response.lyrics_verification.transcript` for auditability.

Failures propagate as `lyrics_verification.measured = false` with `stage_failed:"3_asr"`; the
delivery is still successful (the mastered mix is still delivered), only the gate reports honestly
that it could not measure.

## Stage 9 — PER + CER + WER + vocable exemption + VAD

**Where**: the service's `per_gate.evaluate_full_a8` function.
**Cost**: ~1 s.

Runs the four sub-computations in one pass:

1. **PER** — Phoneme Error Rate `(S+D+I)/len(reference)` on aligned phoneme sequences (reference
   phonemised from the input `lyrics.text`, hypothesis phonemised from the ASR transcript). The
   reference is scored as a **variant lattice** so an alternate pronunciation is not charged as an
   error. Uses the MFA phone set for the language (the service's per-language phonemiser module).
2. **CER** — same algorithm, character units.
3. **WER** — same algorithm, word units.
4. **SER (syllable)** — only when a sourced syllabifier exists for the language; `NOT_RUN` otherwise.
5. **Vocable exemption** — non-lexical vocables (`ooh`, `ah`, `la`, per Chambers 1980) are
   disaggregated from the PASS/FAIL denominator; the report shows both `total_word_count` and
   `lead_word_count`.
6. **VAD segmentation state** — `NOT_SUPPLIED` today on the production path (an RMS-envelope
   segmenter is wired in the module but not yet invoked by `main._run_lyric_gate`; an operator follow-up).

The verdict is `PASS` if the measured PER is below the language's calibrated bar
(`data/language_registry.json:bar.value`), `FAIL` otherwise, `NOT_CALIBRATED` if the language has
no bar yet.

Full field reference: `05-lyrics-and-singing.md`, `06-response-envelope.md`.

## Stage 10 — Originality gate (opt-in, background)

**Where**: `main.py::_start_originality_background` + `_compute_originality`.
**Runs when**: request has `run_originality_gate: true`.
**Cost**: ~120 s in a background thread (does NOT extend the response time).

Two axes:

- **axis 1 (within-take monotony)** — `rhythm_monotony.measure_take` on the first delivered take:
  structureness indicator + cyclic tempogram + tile rule at the request's `bar_seconds`.
- **axis 2 (between-take carbon copy)** — `take_similarity.compare_takes` on every pair of takes;
  only meaningful when `output_package = variations` with `variation_count >= 2`.

Verdicts are `NOT_CALIBRATED` today (Serra/Wu-Yang publish no transferable threshold; a locally
labelled bar is a follow-up owner decision). Raw scores are always returned.

The response returns immediately with `originality_gate.status = "pending"` and a poll URL. The
background worker writes to
`gs://playmusicprompts-content/originality/<request_id>.json`; poll via
`GET /v1/music/originality/{request_id}`.

Full document: `12-originality-gate.md`.

## End-to-end timing (production, measured)

Verbatim from an internal evidence artefact (2026-09-01 08:47 UTC):

| Stage | Elapsed |
|-------|---------|
| Validate + Plan + Mix Plan | negligible |
| Generate (Vertex Lyria) | ~140 s |
| Store + measure | ~500 ms |
| Conform | ~1 s |
| Master + verify | ~4 s |
| **Instrumental total** | **~146 s** |
| Separate (L4 GPU) | 12.47 s (RTF 0.087) |
| ASR on stem (Gemini 2.5 Pro) | ~30 s |
| PER + vocable + VAD | ~1 s |
| **Sung total** | **~250 s** |

## What determines "success"

A `success:true` response requires ALL of:

1. Every stage 1-6 completed without error.
2. `stage 4 measured` returned real ffprobe numbers (never a labelled duration).
3. `stage 5 conform.ok = true` and `stage 6 master.verification.measured = true`.
4. For sung requests, `lyrics_verification.measured` can be `true` or `false`. `false` is honest
   (the gate could not measure, e.g. ASR failed) and does NOT flip `success` — the mastered mix
   is still delivered.

## Cost sketch, per request

- Instrumental: 1 × Vertex Lyria call (~$0.03 per second of output at `lyria-002` list price) +
  0 × separator + 0 × Gemini. Steady-state cost dominated by Lyria.
- Sung EN: 1 × Vertex Lyria (higher for `lyria-3-pro-preview`) + 1 × Separator (L4 always-on at
  (operator-managed), distributed) + 1 × Gemini Pro (~$0.005 per request in this shape).

Full pricing: `09-limits-and-timeouts.md`.
