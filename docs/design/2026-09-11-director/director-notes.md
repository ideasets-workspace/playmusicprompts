# Director engine work record

Scope: bounded pure engine/store child of DIRECTOR-02. The parent owns website integration and rendered verification. Quality takes precedence over speed; function checks below do not prove visual quality.

Atomic work items:

1. Read current law, project/lane records, contract, production visual schema and audio features. Verified from disk in this turn.
2. Implement and verify configuration validation, safe scoped persistence, four-corner morph, genuine audio routing/follow and deterministic score. Source/function scope verified by the 27 checks below.
3. Run meaningful actual-function checks; document exact behavior, hashes and integration limits. Verified for this child module; parent integration and browser acceptance remain required.

Source contract: `brief.md` in this folder; production imports target `./player-three-visual-settings.js` after parent integration. No DOM, animation frame, audio source or storage beyond the supplied adapter belongs in the engine.

## API and integration behavior

Exports: `DIRECTOR_DEFAULTS`, `DIRECTOR_SOURCES`, `DIRECTOR_TARGETS`, `DIRECTOR_STORAGE_KEY`, `sanitizeDirectorConfig`, `createDirectorStore`, `createDirectorEngine`.

- `createDirectorStore(adapter).read()` returns a fresh sanitized config and never writes. `patch(partialConfig)` reads the latest persisted state and shallow-merges top-level fields. For a nested edit, the caller must supply the complete edited `morph`, `optics` or `camera` object. Returning `ok:false` with an error on a storage failure means `config` is the requested transient candidate, usable for this visit but not saved. Invalid mutation data returns unchanged latest config with `accepted:false`; caller must not add rejected inputs to its transient dirty map or discard previously accepted transient edits. Valid failed writes do not return `accepted:false`. A failed read never causes a write of defaults. Caller retains transient edits; `read()` intentionally remains the persisted view.
- `createDirectorEngine().setConfig(config)` is idempotent for equal sanitized values. It never resets existing source envelopes just because the parent repeats a config. `update(frame)` produces complete sanitized 29-key settings and returns the exact contract fields: settings, scene, xy, signals, activeCueId, status, mode, optics and camera.
- Four corner order: Dreamstate at bottom-left, High Voltage bottom-right, Deep Space top-left, Night Drive top-right. Boundary corners are exact identities; interior settings are continuous bilinear blends with no quantization. The engine never modifies original visual preferences.
- Six source envelopes derive only supplied real signal values, clamped to 0..1. Attack rate is 12/s, release 5/s; the frame dt is bounded to 0..1 second. Pause releases the source envelopes to zero. Enabled routes add `level * amount * .35 * targetRange` to a fresh base/morph/cue result each frame; scene-only targets apply only in their own scene. Multiple routes may sum, with the final result clamped. There is no accumulation into saved base settings and no feedback through the band's gain controls.
- Follow operates only in Morph while playing and Motion is on. Real energy drives x and centroid drives y, eased at 3/s after the source envelopes. Silence never produces invented movement. Pause holds x/y. Pointer edits should commit x/y with `follow:false`; this is explicitly the UI's intentional edit, not an engine guess.
- Motion off holds settings, scene, x/y and signal levels when only time/audio changes. Static config or base changes still apply against the held score time and held audio levels. Explicit track selection is treated as a static change: a different track immediately returns to the manual base; selecting the score's track evaluates the selected track's actual time. Entering Score explicitly while frozen also evaluates the supplied current time. Resuming Motion catches the cue timeline up to actual audio time. Status reports `Motion is off · look held` or retains the track-mismatch warning with Motion-off text.
- Score is strictly bound to `scoreTrackId`. Missing track, missing cues, mismatched track and before-first-cue all return the exact manual base/current scene, suppressing routes in those states. On a cue, scene changes to that cue's scene and settings interpolate from the prior cue's full settings (first cue: supplied base) to the cue's settings using smoothstep over its duration. At zero duration, the change is immediate. Seeking derives directly from absolute time; no traversal clock or fake musical segmentation exists. If transitions overlap, the next starts from the previous cue's complete stored settings, exactly as the brief states. Real route envelopes overlaid on a cue remain audio-dependent rather than seek-history-independent; the underlying cue interpolation is deterministic.
- Status is readable English, not an enum. Parent/UI should display it rather than assume only a fixed list. `activeCueId` is null or the active safe ID.
- Recovery caps four routes and 24 cues, clamps all finite bounds, removes invalid cue/route data and normalizes labels to at most 48 characters. Cues sort numerically; at equal normalized times, the last supplied valid cue wins. Invalid/duplicate IDs are repaired deterministically on recovery. Store mutation validation rejects unknown fields, invalid IDs/types, unsafe keys, accessors and nonfinite numbers before writing. The store uses only `pmp.room.director.v1`.

## Verification evidence

Ran `director-check.mjs` against the actual delivered module with only its production-schema import URL adapted for Node. Result: **27 checks passed**. Coverage includes complete neutral identity; all four corners and center; bounds/continuity; every route target at positive and negative limits with 1,000 extra settled frames; all six actual supplied sources; scene gates; disabled/zero-depth/zero-pulse routes; follow silence/easing/pause; pointer edits; Motion freeze/resume and frozen static edits; equivalent setConfig idempotence; pause release; score before/at/within/after transition and deterministic forward/backward seek; zero-duration and overlapping transitions; frozen score with optics edit; empty/mismatch/track switch; bounded sanitized recovery; ownership; latest-state store merging; malformed/prototype/accessor rejection; read/write failures; module side-effect boundary.

Engine SHA256: `15556670c85b51a4d41c3f998e05eaff82703c345dcbea6e8a0b699e18e0d4b4`

Production schema SHA256 at verification: `cae11fa5b379256b0a586fa94f69615da081d109bac7d4ff3b414608594b09ed`

No browser, GPU, real audio import, screenshot, performance measurement or completed website-integration claim is made by this child. Parent must perform those checks on the combined product before closing DIRECTOR-02/03. This child did not edit the website, project memory or any files beyond the three explicitly assigned paths.
