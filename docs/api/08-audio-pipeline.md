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
[STAGE 3  Generate]                 — the service's vertex_lyria stage → Vertex AI Lyria, 60-150 s
      │
      ▼
[STAGE 4  Store + measure]          — the service's storage stage + ffprobe, in-container, 200-500 ms
      │
      ▼
[STAGE 5  Conform (trim/pad)]       — the service's render stage, in-container ffmpeg, 500 ms - 3 s
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
[STAGE 9  PER + vocable + VAD]      — the service's per_gate stage, in-container, ~1 s
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

**The three routable models, and what each one gives you** — read from the service's own model registry
(`lyria_models.json`), not from recollection. `route` accepts any of them explicitly; `auto` never selects
the third, so a caller who wants it must name it:

| `route` | Surface | Clip length | Container | Use it for |
|---------|---------|-------------|-----------|------------|
| `lyria-002` | `:predict`, synchronous | **32.8 s** per clip | WAV | Instrumental takes; `auto`'s instrumental choice |
| `lyria-3-pro-preview` | interactions, async + poll | **up to 184 s** — 1 clip per prompt, 44.1 kHz, 192 kbps | MP3 | Full songs and every SUNG request; `auto`'s sung choice |
| `lyria-3-clip-preview` | interactions, async + poll | **30 s** | MP3 | Short clips, loops and previews — the cheapest way to audition a prompt before committing to a full-length take |

`lyria-3-clip-preview` is the one `auto` will not pick for you. Its 30-second ceiling is the model's own
documented limit, so a longer `duration` on that route is refused rather than silently truncated.

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

**Where**: the service's `vertex_lyria.generate` step (the former
`instrumental_only` argument was removed on 2026-09-07 — no Lyria surface has such a field; instrumental rides the
prompt as the prose clause `Instrumental only, no vocals.`, recorded in `bindings.vocal`).
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

**Where**: the service's `storage.store_and_measure` step.
**Backend**: GCS bucket `playmusicprompts-music-studio` (multi-region, standard class).
**Cost**: 200-500 ms per take (upload + ffprobe).

Writes the raw bytes to `gs://playmusicprompts-music-studio/deliveries/takes/<YYYY>/<MM>/<DD>/lyria_<utc>_<request_id>_t<n>.<ext>`
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

**Where**: the service's `render.post_process` step.
**Backend**: ffmpeg in-container.
**Cost**: 500 ms - 3 s per take.

Reads `duration.target_seconds`, `duration.tolerance_seconds`, `duration.on_miss`. If the delivered
file is within the tolerance window the plan is `accept` and no trim is applied; otherwise
(the service's mastering path, the decision is separated from execution so it is unit-controlled at $0):

- **`on_miss: trim`** (default): a take LONGER than target+tolerance is cut at the **bar boundary**
  nearest the target inside ±tolerance (bar length derived from the request's own `tempo_bpm` and
  `time_signature`; the exact target when no boundary falls in the window) with a one-bar fade-out.
  A take SHORTER than target−tolerance is delivered as-is with the plan `refuse_pad`: padding would
  fabricate audio, which is a banned class, so a short take is never lengthened.
- **`on_miss: regenerate`**: a short take produces the plan `regenerate_required`; the request layer
  then makes ONE paid re-generation attempt and reports it under `duration_regeneration` (long takes
  are still trimmed as above).
- **`on_miss: accept`**: a SHORT take is delivered at its own length with the miss reported (no regeneration);
  a LONG take is still trimmed at the bar boundary like every other policy — measured 2026-09-07 (paid sweep T09,
  target 20 s ± 1 s, on_miss=accept): a 19.6 s raw take was cut to the nearest bar and reported as `action: trim`.
  `accept` governs what happens when the take is too short; surplus audio is never delivered as "accepted".

These three ids are the spec's; any other string is refused at validation (400).

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
`ebur128` (independent verification). A MONO source is measured as dual-mono in every pass (ITU-R BS.1770: one channel heard on
two speakers is 3.01 LU louder than a lone channel) — since 2026-09-07 (D-MUS122-64) pass 1, pass 2 and the verifier share that one
predicate; `render_plan.stages.master.dual_mono` reports the flag used.
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

The mastered file lands at `gs://playmusicprompts-music-studio/deliveries/masters/<YYYY>/<MM>/<DD>/mastered_<sha>.wav` and its
`public_url` becomes `response.render_plan.processed_url`. Downstream consumers should use the
`processed_url`, not the raw generator URL, as the delivered artefact.

Default target: **-14 LUFS, -1 dBTP** (streaming target — Spotify/YouTube/Apple Music baseline).
Override via `mastering.loudness_lufs` and `mastering.true_peak_db`.

## Stage 7 — Separate (GPU, sung requests only)

**Where**: the service's `separator_client.separate` step → HTTP POST to
`http://10.142.0.2/separate` (GCE VM the separator service, INTERNAL address, reached through Cloud Run
Direct VPC egress; every call carries a Google-signed ID token for the music-api runtime service account,
verified by the separator — D-MUS122-21, 2026-09-05).
**Backend**: Mel-Band RoFormer / `Kim_Vocal_2.onnx` on NVIDIA L4 (24 GB VRAM, its own region).
**Cost**: 5-25 s per take (RTF 0.087 measured on L4). A 143-second raw mix separates in ~12 s.

The separator downloads the mixed track from GCS, runs the ONNX Runtime CUDA provider on the L4,
and writes the vocal stem to `gs://playmusicprompts-music-studio/analysis/stems/<YYYY>/<MM>/<DD>/<request_id>_vocals.wav` (plus
the instrumental stem for auditability). Returns:

```json
{
    "stem_gcs_uri": "gs://playmusicprompts-music-studio/analysis/stems/2026/09/01/f6d584a0b02e_vocals.wav",
    "other_gcs_uri": "gs://playmusicprompts-music-studio/analysis/stems/2026/09/01/f6d584a0b02e_instrumental.wav",
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

**Where**: the service's `asr_vertex.transcribe` step.
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
4. **SER (syllable)** — only when a sourced syllabifier exists for the language; `NOT_RUN` otherwise, naming
   which languages are served. Served today: `tr` (S15) and `en` (S-BKC09 SONORITY, added 2026-09-11).
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

**Where**: the service's `main._start_originality_background` step.
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
`gs://playmusicprompts-music-studio/state/originality/<request_id>.json`; poll via
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
  **$0.874/hour**, distributed) + 1 × Gemini Pro (~$0.005 per request in this shape).

Full pricing: `09-limits-and-timeouts.md`.


<!-- S1-STORAGE-MIGRATION-NOTE-2026-09-10 -->
## Objects delivered before 2026-09-10

The paths above are the CURRENT layout. Objects delivered before 2026-09-10 live in the previous bucket (`playmusicprompts-music-studio`) under its old flat prefixes (`music/`, `stems/`, `watermark/`, `jobs/`, `originality/`). They were copied into the new structure and the originals were kept, so both addresses resolve; a stored `gcs_uri` from before that date still works with `POST /v1/music/delivery-url`, which mints URLs for the previous bucket as well as the current one. Nothing was deleted.