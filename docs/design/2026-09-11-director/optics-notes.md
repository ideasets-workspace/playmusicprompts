# Director optics — bounded implementation record

Lane: three-player-20260911 / DIRECTOR-02. This delegate owns only the optics module, this record and its scoped check script. Parent owns website integration and real GPU/rendered review.

Atomic work:

1. Inspect the recorded Director contract, active task ledger and pinned Three ShaderPass/Pass/OutputPass source. Done: API and linear HDR position established; composer passes receive effective buffer pixels through setSize.
2. Implement neutral-by-default optics with real bounded dispersion, highlight-selective horizontal streaks, motion-frozen grain and idempotent cleanup. Implemented in the bounded module; parent integration remains required.
3. Check actual Three pass construction, uniforms, resize, bounds, motion freeze, disposal and numerical shader properties. Initial 12 scoped checks passed but did not detect a renderer-prefix GLSL collision later found in the parent's actual GPU review. After repair and added namespace guards, **14 checks pass** against both the docs module and the production module on 2026-09-11. The render-call spy establishes wiring only, not GPU rendering.
4. Hand off module, hash and integration duties to parent. Module and contract supplied. These source checks cannot establish GPU compilation, final art or whole-player completion.

## Integration

`createOpticsPass()` returns `{pass, update, dispose}`. Insert `pass` after the existing grade pass and before OutputPass. Call `update({dispersion, streak, grain, time, motion, quality})` before each compositor render, supplying the effective Director optics, host scene time, explicit Motion state and effective quality (`low` when adaptive quality has lowered it). Controls are normalized numbers from 0 to 1. Missing or non-finite controls are zero. Invalid time retains the previous film frame. No own renderer, audio state, timers, assets, storage or animation loop exists.

All-zero values disable the pass, avoiding an extra draw and preserving the accepted image exactly. The shader operates in linear HDR and leaves display conversion to OutputPass. Alpha is preserved. It adds no scene-wide color grade.

EffectComposer automatically calls the overridden `pass.setSize(width, height)` with physical render-target pixels, so no manual resize uniform is required. The render wrapper additionally honors actual `readBuffer.width/height` for a custom capture path. Invalid/zero dimensions fall back to one; dimensions cap at 32768 to avoid invalid reciprocal resolution. Normal preview/main-canvas size changes are supported without reconstructing the pass.

Call `dispose()` during host cleanup (or `pass.dispose()`; they are the same guarded operation). Material and full-screen geometry cleanup occur once. Do not separately dispose this material or its full-screen quad. The pass cannot reactivate after disposal.

## Optical bounds and cost

- **Chromatic separation:** radial red/blue offsets scale with squared distance from the image center. Center displacement is zero. At maximum, each channel moves at most 0.003 UV per axis (0.3% of that image dimension). Green stays centered. Half-texel clamp prevents texture-edge wrapping. This is an artistic lens effect, not a calibrated lens model.
- **Horizontal streaks:** two-sided horizontal samples with exponentially decaying, normalized weights span at most 0.085 UV (8.5% of image width) in each direction. Only luminance above a soft 0.55-to-1.4 linear HDR threshold contributes; values below 0.55 add exactly zero. Sample RGB is capped at 8 to bound extreme highlights; maximum additive contribution is 2.56 linear RGB per channel. Out-of-frame taps contribute zero rather than smearing the edge pixel. Maximum control multiplies this by 0.32; low and high settings use the same length and normalized energy.
- **Film grain:** one monochrome noise value per physical pixel, with a 24-frame cadence. It scales by luminance and fades out in deep shadows, so true black stays black. Maximum linear perturbation is below 0.023 per channel. Motion off retains the last seed while explicit grain/other controls still apply. A bounded 4096-frame seed range keeps very long sessions numerically stable.
- **Texture reads per fragment:** 0 when neutral bypassed; 1 with grain alone; 3 with dispersion; 17 with streaks alone in high/auto (1 center + 16 streak); 9 in low (1 + 8); 19 maximum with all controls in high/auto, 11 in low. Uniform branches skip inactive effects. The full-screen draw itself is only added when at least one control is nonzero.

## Verification and remaining parent duties

Run with the bundled Node 24 runtime:

`node docs/design/2026-09-11-director/optics-check.mjs`

An optional absolute module filename argument runs the same checks against the parent-copied production file. Module resolution adapts only local pinned Three imports through Node's registration hook. It does not install or download anything.

Checks cover actual ShaderPass identity/uniforms, independent control enable/neutral bypass, malformed/extreme values, film freeze and resume, low-quality real loop budget, compositor and custom input-buffer sizing, actual pass texture assignment, linear threshold isolation, numeric radial bounds, normalized streak extent, bounded grain, and idempotent disposal.

Parent must inspect GPU shader compilation/error logs, rendered effect strength and accepted neutral artwork in all four scenes, preview-to-main resize, Motion off/on, effective low quality, and actual PNG capture. Source/property checks do not certify these. If rendered feedback calls for artistic tuning, adjust the bounded module and rerun relevant checks before the final source hash is recorded.

## Actual GPU failure and source repair

The parent observed a black scene upon first enabling optics in the real browser. The fragment shader failed compilation because this module declared `float luminance(vec3)` and the pinned Three renderer also injects a function with that name. The earlier constructor/uniform/property checks did not compile a GPU program and therefore missed the collision. This was a module defect; the passing scoped checks were not evidence of renderer success.

The exact pinned source is `vendor/three/build/three.module.js`: `getLuminanceFunction()` defines the injected helper (around line 6361), and the standard fragment prefix appends it (around line 7014). The parent changed the local helper and both calls to `directorLuma` in the docs and production modules.

The expanded test derives reserved GLSL helper names from the actual pinned renderer luminance generator, generated tone-mapping/encoding wrapper names, and exported common/colorspace/tone-mapping chunks. It checks both custom vertex and fragment function definitions for collisions. A negative regression case deliberately restores the original `luminance` name and verifies that the guard detects it; additional generated/common helper collisions are also rejected. This is a targeted namespace regression guard, not a replacement GLSL compiler.

Both repaired copies pass all 14 cases and have SHA256 `2aa3bfc0f4a9f555d4d2f27eebbd373c445a637a99fecb585f275ba614c3d806`. Parent owns fresh actual GPU compilation and visual confirmation of the repaired pass. No website edits were made by the delegate during this follow-up.
