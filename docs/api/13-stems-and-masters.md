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
  Lyria generations (each bills one call).
- `stems_bundle` — asks for EVERY stem the `stems` vocabulary declares (`drums, bass, music, vocals,
  fx, ambience, master`), unioned with whatever you list in `stems`. Until 2026-09-06 this value was
  accepted and changed nothing (D-MUS122-47, found by the differential wiring audit); now
  `bindings.output_package.stems_requested` echoes the expanded list and STAGE 6 delivers or refuses
  each member by name — see below.

## `stems` parameter

An array of the sub-tracks you want beside the master:
`drums, bass, music, vocals, fx, ambience, master`.

Every requested stem comes back in `render_plan.stages.stems.stems.<id>` with its **origin** and a
state — the operator's approved mechanism list of 2026-08-14 (option (a), a recorded platform decision): a stem is either
`separated` (our own Mel-Band RoFormer / Kim Vocal separator on the GPU VM), `generated` (a Lyria bed
pass) or `rendered` (our master stage), and **no stem is ever silently absent**:

| stem | origin | state today (measured 2026-09-07) |
|---|---|---|
| `master` | rendered | DELIVERED — `gcs_uri` of the mastered file (its fetchable URL is `tracks[0].public_url`) |
| `vocals`, `music` | separated | DELIVERED — one separator call serves both; `gcs_uri`, `public_url` (V4 signed, same signer and TTL as the master — D-MUS122-59), `url_kind`, `url_expires_at`, `model`, `separate_time_s`, `rtf` |
| `drums`, `bass` | separated | **REFUSED_LICENCE** — the models exist and work; **not one of them may be used commercially.** Measured 2026-09-11 across all 10 multi-stem candidates the deployed separator can load: every one is research- or education-only by its own author's words or by its training corpus's licence, or publishes no licence at all (Demucs v4's maintainer, verbatim: the weights are *"not covered by the MIT license … provided only for scientific purposes"*; MDX-Net's `kuielab_a_*` trained on MUSDB18-HQ, whose terms are *"educational purposes only … not for any commercial purpose"*). Delivering these stems would put non-commercial material into a paid product, so the request is refused BY NAME with this reason in the response. **Unblocks when** a weight whose own licence permits commercial use is published and verified from three independent primary sources, or an existing weight's author states commercial permission |
| `fx`, `ambience` | generated | **NOT_BUILT** — and this is a different situation from drums/bass, not the same one: these are beds to be GENERATED, so **no separator licence blocks them.** What is missing is the generation pass itself and its two-path routing (a generated bed delivered alongside the master, never mixed into it), plus a control that MEASURES the bed in the delivered artefact — presence, duration alignment against the master, and level relative to it — because a bed that was requested is not a bed that arrived |

`counts` reports `requested / delivered / not_available` so a caller never has to infer a gap. Until 2026-09-07 a
separated stem carried only its `gcs_uri`, so a caller who paid for stems could not download them without a second
call per stem to `POST /v1/music/delivery-url`; measured on the paid sweep of that day (take T12) and fixed the same
day — a stem whose URL cannot be signed is reported `NOT_AVAILABLE` with the signer's reason, never with an
unfetchable URL.

The `mix_plan` refusals below are the two-path routing's account of WHY a layer cannot be produced
as its own generated signal on the Google-only routes (a recorded platform decision); they are unchanged and still true:

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
        "stem_gcs_uri": "gs://playmusicprompts-music-studio/analysis/stems/<YYYY>/<MM>/<DD>/<request_id>_vocals.wav",
        "other_gcs_uri": "gs://playmusicprompts-music-studio/analysis/stems/<YYYY>/<MM>/<DD>/<request_id>_instrumental.wav",
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
gs://playmusicprompts-music-studio/deliveries/takes/<YYYY>/<MM>/<DD>/lyria_<utc>_<request_id>_t<n>.mp3       — raw Lyria take
gs://playmusicprompts-music-studio/deliveries/masters/<YYYY>/<MM>/<DD>/mastered_<sha256_short>.wav             — mastered final file
```

Analysis-only stems:

```
gs://playmusicprompts-music-studio/analysis/stems/<YYYY>/<MM>/<DD>/<request_id>_vocals.wav                 — vocal stem
gs://playmusicprompts-music-studio/analysis/stems/<YYYY>/<MM>/<DD>/<request_id>_instrumental.wav           — instrumental stem
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


<!-- S1-STORAGE-MIGRATION-NOTE-2026-09-10 -->
## Objects delivered before 2026-09-10

The paths above are the CURRENT layout. Objects delivered before 2026-09-10 live in the previous bucket (`playmusicprompts-music-studio`) under its old flat prefixes (`music/`, `stems/`, `watermark/`, `jobs/`, `originality/`). They were copied into the new structure and the originals were kept, so both addresses resolve; a stored `gcs_uri` from before that date still works with `POST /v1/music/delivery-url`, which mints URLs for the previous bucket as well as the current one. Nothing was deleted.