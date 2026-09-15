# Audio review provenance — 2026-09-11

Scope: independently review and verify the real Three.js player's sound graph. Website source changes belong to the parent agent. This review wrote only this note, its reproducible test, and resulting evidence in this directory.

## Primary sources inspected

- [Web Audio API 1.1, compressor processing and makeup gain](https://webaudio.github.io/web-audio-api/#computing-the-makeup-gain), live editor draft dated 2026-09-09, retrieved 2026-09-11. Makeup derives from the compression curve at full scale, raised to power 0.6. The gain envelope is bounded at unity. The local 2026-08-26 copy is also under `docs/research/_sources/2026-09-09-frontier-ui-components/music-audio-ui/`; relevant local lines are 4489–4619.
- [Current Chromium dynamics compressor implementation](https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/platform/audio/dynamics_compressor.cc), retrieved 2026-09-11. Lines 132–134 compute automatic makeup; lines 287–306 apply its bounded envelope. Lines 429–515 implement the knee, ratio curve and parameter update. Lines 49 and 412–425 specify the six-millisecond look-ahead and conversion to integer samples. This source explains the measured transient overshoot and supports the proposed fixed output trim.
- [Web Audio working-group issue: adjustable makeup gain](https://github.com/WebAudio/web-audio-api/issues/2639), retrieved 2026-09-11, records the absence of a direct makeup-gain control in this API. It is supporting API context, not completion evidence.

## Calculation and implementation recommendation

Using the inspected Chromium compression-curve equations, the fixed profiles' makeup factors and their inverse gains are:

| Profile | Makeup factor | Exact inverse | Conservative implemented trim |
| --- | ---: | ---: | ---: |
| Gentle | 1.558044 | 0.641830 | 0.63 |
| Punch | 1.607467 | 0.622097 | 0.61 |
| Night | 3.099708 | 0.322611 | 0.31 |

These are calculation results, not measurements. Constant output attenuation compensates the native automatic makeup without changing the chosen compressor's attack and release settings. The Original path remains the separate, aligned dry path at unity gain.

A numerical sample of 39,711 parameter mixtures in the four fixed profiles' convex hull found maximum modeled makeup 3.099708 at Night. A more compressive comparison curve with threshold −30 dB, knee 17.142857 dB and ratio 5 gives 3.206531; its product with the 0.31 transition guard is 0.994024. These calculations apply to these fixed parameter choices and the inspected implementation. They are not a universal guarantee for arbitrary browser algorithms, new profiles, arbitrary upstream signals, or intersample true peaks.

The implemented transition first lowers the separate compressor-output trim, then changes the compressor parameters. It releases the trim after those ramps finish. The existing aligned dry/wet dynamics crossfade preserves Original playback. Same-profile EQ changes leave an ongoing dynamics transition intact.

## Actual production verification

Run `verify-audio-review.cjs` using the project's installed Node runtime while the local preview is running on port 4173. The script imports the actual production `AudioRack`; it does not replace processing with test-only implementation. Test signals remain confined to the isolated verification browser and are not shipped as music.

`audio-review-checks.json` records **52 passing checks**, no browser errors, Chrome version, and SHA-256 hashes of the production audio, sound-control and integration sources before/after the test.

Coverage includes Original startup RMS, impulse/burst output in all four modes, matching dry/compressor sample delays, 25 rapid profile changes with continuous sine, impulse-train and burst-train input at 44.1/48/96 kHz, the previous boosted-EQ transition regression, null/malformed presets through the actual UI, and right-channel-only waveform rendering. Maximum measured protected output peak was **0.949999988** for input amplitude 0.95. These tests establish the specified local acceptance cases; they do not turn the native compressor into a true-peak limiter.

Earlier review findings and their corrections were independently reproduced: nonlinear EQ/headroom transition overshoot, startup attenuation through a neutral native compressor, channel-zero-only waveform analysis, malformed preset exceptions, and automatic compressor-makeup transient overshoot. The final production tests pass all corresponding cases.
