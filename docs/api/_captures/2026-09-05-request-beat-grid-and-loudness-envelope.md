# Request to the Music API owner — per-take beat grid and loudness envelope in the response envelope

Date: 2026-09-05 · From: the interface lane (d575a0b1) · To: Berk (the API is coded by him — STATE.md 2026-08-31: "api yi ben bir yandan kodluyorum") · Status: **REQUEST, not implemented; nothing in the interface pretends this data exists until it does.**

## Why this is needed (decision D-PMP-06, approved 2026-09-05 18:44)

The approved UI direction renders the playing take as a beat-locked GPU visual ("THE FIELD" inside the centre stop of "THE STREAM"). Client-side audio analysis is not available on either surface:

- **Web:** the signed delivery URL carries no CORS header (measured 2026-09-02, `public/site/player.js` header comment), so a Web Audio `MediaElementSource` is tainted and silent — no client FFT is possible without an audio proxy, and the audio proxy was deliberately removed on 2026-09-02 (D-PMP delivery-URL fix).
- **Flutter:** released `just_audio` 0.10.6 exposes no visualiser API (0 symbols); waveform/FFT streams exist only on an unreleased `visualizer` branch (research `docs/research/apis/2026-09-05-frontier-music-ui-ux.md` S198). Pinning unreleased code or writing a native FFT tap per platform was rejected in D-PMP-06.

The frontier research recommends the same thing independently of these constraints: beat/downbeat trackers optimise F-measure and lose continuity, so a **server-side, once-per-take precomputed grid** is the correct substrate for beat-locked visuals (SOTA slice C4, Beat This! F1 89.1 / downbeat 78.3).

## What the envelope already carries (read from disk this session)

`docs/api/08-audio-pipeline.md` lines 148–172: `render_plan.stages.conform.plan.derivation` echoes `bar_seconds`, `tempo_bpm`, `time_signature`, `bar_aligned`. This is a **bar-level grid seed** and the interface will use it as such (regular grid from `bar_seconds` when `bar_aligned` is true). It is not present for `on_miss` values other than `conform`, and it carries no loudness information.

## Requested additions (all optional fields; absence must be a valid state)

Add to `render_plan.stages` a new stage echo, computed once per delivered take after mastering (stage 6), on the processed audio:

```json
"visual_grid": {
  "ok": true,
  "version": 1,
  "source": "conform_derivation | onset_tracker",
  "tempo_bpm": 120.0,
  "time_signature": "4/4",
  "first_downbeat_seconds": 0.0,
  "beat_seconds": [0.0, 0.5, 1.0, "..."],
  "downbeat_indices": [0, 4, 8, "..."],
  "loudness_envelope": {
    "hop_seconds": 0.05,
    "unit": "lufs_momentary",
    "values": [-23.1, -21.4, "..."]
  },
  "spectral_bands": {
    "hop_seconds": 0.05,
    "bands_hz": [[20, 250], [250, 2000], [2000, 20000]],
    "values_db": [[-30.2, -28.1, -35.0], "..."]
  }
}
```

Field notes, each traceable to a research constraint:

- `beat_seconds` / `downbeat_indices`: the visual is locked to these; the interface never runs its own tracker (C4).
- `loudness_envelope` at 50 ms hop: the interface's AV-asynchrony budget is 25–50 ms (APIs slice A03), so a 50 ms hop is the coarsest that stays inside it. Momentary LUFS matches the mastering verification already reported (`integrated_lufs`, stage 6).
- `spectral_bands` (3 bands) is what gives the visual its "material" without a client FFT; three bands keep the payload small (a 135 s take at 50 ms hop = 2,700 rows × 3 values).
- Size: for a 135 s take the whole block is ≈ 2,700 envelope values + 2,700 × 3 band values + ≈ 270 beats — well under 100 KB as JSON; if payload size matters, a separate `visual_grid_url` (signed, same expiry as the take) is equally acceptable to the interface.
- `source: onset_tracker` is requested for `on_miss != conform` and for catalogue tracks that were not conformed; when neither is available the field is absent and the interface renders its **time-locked degraded twin** (regular grid from `tempo_bpm` if present, otherwise no beat lock — shown as such, never faked).

## What the interface will do meanwhile

Until this lands: beat lock from `conform.plan.derivation.bar_seconds` when `bar_aligned` is true (bar-level, truthful); no loudness reactivity; the provenance panel states "visual locked to bars" vs "visual locked to beats and loudness" so the user is never shown a claim the data cannot support.

## Verification the interface will run when it lands

One real generation; the returned `visual_grid` read back and validated (monotonic `beat_seconds`, `downbeat_indices` inside range, envelope length = ceil(duration / hop)); the centre-stop visual's frame timestamps compared to `beat_seconds` in a real browser (≤ 40 ms end-to-end, APIs A01–A04); result recorded in `docs/verification/`.
