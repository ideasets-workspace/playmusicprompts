# 13 · Stems and Masters

What the API ships, what it does NOT ship, and how the delivered mix relates to the analysis-only
stems.

## The two "output" concepts

- **Delivered tracks (`tracks[]`)** — the mastered mixes that consumers download. Always safe to
  ship; loudness-normalised; measured.
- **Analysis-only stems (`stems/` in GCS)** — the separated vocal + instrumental produced during
  the intelligibility gate. Present as GCS URIs in `lyrics_verification.separator.*`. **NEVER
  shipped as `tracks[]`** (the platform's stem-shipping policy).

The gap is deliberate: shipping a separated stem as a delivery track is a legal-quality issue
(the separator is a research tool, not a licensed instrument-generator), and the platform refuses
to blur the line.

## `output_package` parameter

Values:

- `single_track` (default) — one delivered mastered mix.
- `variations` — N mastered mixes with `variation_count ∈ {2,3,4}`. Same prompt, N independent
  Lyria generations.
- `stems_bundle` — request-time HINT that a caller wants stems, but the platform's `mix_plan`
  refuses stems as delivered tracks (they must remain analysis-only). See below.

## `stems` parameter

An array of the sub-tracks you WOULD receive if the platform could lawfully ship them:
`drums, bass, music, vocals, fx, ambience, master`.

Today, **the platform ships `master` only** — the mastered mix. The other members are refused BY
LAW (the platform's stem-shipping policy) with a first-class explanation:

```json
"mix_plan": {
    "layers": [
        {
            "role": "MUSIC_BED",
            "engine": "lyria-3-pro-preview",
            "origin": "ENGINE_GENERATED",
            "delivery_class": "SHIPPABLE"
        }
    ],
    "refusals": [
        {
            "role": "LEAD_VOCAL",
            "refused": true,
            "reason": "No Google service generates a vocal-only signal. The only Google sung surface (lyria-3-pro-preview) returns a MIXED song, so an isolated vocal can only be obtained by separating that mix — and CLAUSE 15 forbids shipping a separated stem.",
            "law": "a platform policy that forbids shipping machine-separated stems",
            "what_is_still_lawful": "The sung take is delivered AS A WHOLE by lyria-3-pro-preview (single-path), and its separated vocal is used for MEASUREMENT only — which is exactly what the A8 intelligibility gate needs.",
            "what_would_unblock_it": [
                "a Google/Vertex surface that generates a vocal-only take (none known)",
                "his explicit suspension of CLAUSE 15 for this case, which is his decision"
            ]
        }
    ]
}
```

`render_plan.stages.stems.requested` echoes what you asked for; `.note` explains what was
delivered vs. refused.

## What IS available for analysis (not delivered)

For every sung request, `lyrics_verification.separator` carries the URIs of the analysis-only
stems:

```json
"lyrics_verification": {
    "separator": {
        "model": "Kim_Vocal_2.onnx",
        "stem_gcs_uri": "gs://playmusicprompts-content/stems/<request_id>_vocals.wav",
        "other_gcs_uri": "gs://playmusicprompts-content/stems/<request_id>_instrumental.wav",
        "rtf": 0.087
    }
}
```

These URIs are:

- Readable by the Cloud Run runtime service account (used by the gate to feed ASR).
- Readable by the separator VM's service account.
- **NOT readable by `allUsers`** — the `stems/` prefix has no public read grant.

If your integration needs a stem for debugging or research purposes, ask the operator to grant
one-off signed URLs; the stems are analysis-only by design.

## Master delivery contract

Every delivered track is:

- **44.1 kHz stereo** MP3 (Lyria's native output; the `export` parameter can rewrap to WAV/FLAC).
- **Loudness-normalised** to -14 LUFS, -1 dBTP (streaming target) by default; override via
  `mastering.loudness_lufs` and `mastering.true_peak_db`.
- **Bar-aligned trimmed** to `duration.target_seconds` when possible (aligned to `tempo_bpm` +
  `time_signature`); one-bar fade-out smooths the cut.
- **Independently verified** — the response `render_plan.stages.master.verification` re-measures
  the final file with a separate `ebur128` pass to catch a case where the mastering pipeline and
  the reader disagree.

## File names and locations

Delivered files:

```
gs://playmusicprompts-content/music/lyria_<utc>_<request_id>_t<n>.mp3       — raw Lyria take
gs://playmusicprompts-content/music/mastered_<sha256_short>.wav             — mastered final file
```

Analysis-only stems:

```
gs://playmusicprompts-content/stems/<request_id>_vocals.wav                 — vocal stem
gs://playmusicprompts-content/stems/<request_id>_instrumental.wav           — instrumental stem
```

The response carries a `public_url` (a V4 signed HTTPS URL any client can GET without credentials)
and a `gcs_uri` (the object's stable identifier). Use the URL to play or download; store the
`gcs_uri` and exchange it at `POST /v1/music/delivery-url` for a fresh URL when the signature
expires. Detail: `06-response-envelope.md`.

## Requesting variations

```json
{
    "prompt": "warm folk ballad, acoustic guitar, medium tempo",
    "output_package": "variations",
    "variation_count": 3,
    "vocal": {"mode": "instrumental"},
    "duration": {"target_seconds": 30}
}
```

Response `tracks[]` will have 3 entries (`take: 1, 2, 3`), each a fully-mastered independent
Lyria generation. Total elapsed = `3 × 140s ≈ 420 s` for instrumental; be prepared to raise your
client timeout to 500 s. Sung variations are ~3 × 250s = 750 s and MAY exceed Cloud Run's 3600 s
budget on a slow generator run.

## Cost of variations

Each variation is an independent Vertex Lyria call. `variation_count: 3` = 3 × Lyria cost. There is
no discount for batched generation because there is no batched generation — each take is a
separate Vertex request.

## Related documents

- Audio pipeline: `08-audio-pipeline.md`
- Mastering research: the service's internal research documentation (available from the API operator on request)
- Two-path mix plan (A7) research: the service's internal research documentation (available from the API operator on request)
