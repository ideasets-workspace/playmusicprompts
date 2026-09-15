# Aether particle asset integration notes

## Active refinement after restart

Superseding parent instruction: Berk rejected the compact extra effect as too simple. The next valid LAB-02 child is now a full spatial Aether environment, not a polished small sculpture. Parent authorized this delegate to own the atmosphere module and its two check/note files as well.

Current atomic work: (1) replace compact forms with deep cloud banks/cavity/braided currents and an inside-environment camera profile; (2) replace the old small volumetric density with a bounded space medium aligned to those banks and depth, retaining frozen motion and actual audio; (3) verify actual module state, bounds, quality and resource contracts; (4) send both modules for parent integration and real rendered judgment. New view uses aspectFit false; parent owns the new full-screen product composition. Earlier refinement remains historical below and is not user-accepted.

Parent actual renders found that the default Nova reads as uniform loops and the Helix becomes a thick white wire in the 173px Studio preview during audio. This is an open LAB-02 child refinement, not an accepted visual result.

1. Preserve the existing GPU state and contracts; identify the overlap cause in the current shader. Evidence: 65,536 additive samples had a forced minimum one-pixel footprint and no subpixel coverage compensation, plus a large constant filament alpha.
2. Reduce baseline overlap and pearl mixing; add projected footprint coverage for sampled points and viewport coverage for hairlines. Dependencies: step 1. Verify numeric settings, both quality budgets and zero-density behavior in actual module tests; parent must judge small/large actual renders.
3. Add bounded sparse depth motes and moving light riders sampled from the existing position state. Dependencies: step 2. Verify fixed finite topology, actual onset/treble routing, automatic clock freeze, reduced low-detail draw counts, no additional targets and complete disposal.
4. Rerun scoped checks, record exact source hash and integration limits, then return to parent for copy integration and real GPU/audio/visual assessment. Do not close LAB-02 or claim visual/worldwide superiority from protocol tests.

Status: the full-environment replacement and 26 behavior/resource/renderer-protocol checks pass. The particle and volume pair has been sent to the parent for actual GPU and visual assessment; it is not a verified visual result yet. No original or copied website files changed by this delegate.

## Exact interface

`createAetherAsset(THREE, {renderer})` returns `group`, `view`, `update(frame)`, `setPalette(world)`, `diagnostics()` and idempotent `dispose()`.

- Local center zero; parent positions group at y=2.75. No renderer or RAF is created.
- View: target [0,2.75,-5], direction [0,.04,1], distance 8, minDistance 4, maxDistance 18, aspectFit false, orbit true, bloom .52. The resulting camera is near world z=3, inside the near end of the cloud field. The host must honor aspectFit false instead of fitting the full forty-unit depth into the viewport.
- The base field runs from local z=+7 to -34; depth remaps this around z=3 by .74..1.22, plus bounded drift and suspended detail. The lateral fields broaden through depth to roughly 12–15 units before expansion/bass. GPU positions clamp at ±65 and CPU culling is disabled. Parent camera far100 covers the authored view; unrestricted user orbit may see a different composition than the intended forward corridor.

## Implementation

The renderer is checked for vertex texture access and EXT_color_buffer_float. Two 256×256 half-float nearest-filter position targets are allocated; their actual bound framebuffer status is checked before selecting `gpu-half-float`. Positions evolve through a bounded trigonometric advection field and attraction to three continuously blended authored path families. The prior output texture is the next step's input. No CPU position arrays are uploaded per frame.

256 fine filaments each have 256 samples. Their consecutive positions draw hairline segments; the same persistent positions carry individually shaded light motes. Low detail draws 64 spatially distributed filaments/mote rows and performs one compute pass per three motion updates. Row bit reversal preserves all three ribbon families and both helix sides at reduced detail. Counts are implementation budgets, not a claim about visible quality or FPS.

The restart refinement adds 4,096 sparse suspended motes distributed within and around the current structure, with broad z separation, and 768 seeded flow riders traveling through those existing GPU trajectories. The diffuse field and riders are shader-derived from the persistent state; they do not each own another persistent simulation or extra render targets. Low quality uses 1,024 field motes and 192 riders. Both follow the global density control, including zero. Seed attributes are immutable; shader phase and spectrum/event uniforms create their movement and audio response. Nova brings more motes through its interior while Silk and Helix retain their elongated silhouettes.

Baseline filament opacity and pearl mixing were reduced to preserve color and separate bright onset wavefronts from ambient light. Sampled points now compensate alpha for projected subpixel area; hairline coverage follows actual drawing-buffer height. This addresses the mathematical overdraw cause in a small preview, but the resulting exposure and visual readability still require actual rendered inspection. A main scene about 425px tall gives line coverage 425/620; a 173px drawing buffer gives 173/620. Device pixel ratio is already reflected in the drawing-buffer height.

Silk is three deep cloud banks that pass the foreground screen edges and converge toward an open distant sightline. Nova is a turbulent open cavity with irregular through-depth trajectories, not closed orbital rings. Helix is two broad braided currents through space, not a vertical object. An actual onset injects a bounded light/displacement front traveling through the full environment depth. Bass changes lateral expansion, mids bend the currents, and treble plus the real 64-bin spectrum brighten fine detail. No automatic onset or BPM is fabricated.

## Controls and ownership

- `labLook.form` drives eased shape weights. When Motion is disabled, a new explicit form selection remaps once at the retained time. An existing in-progress transition remains frozen.
- `flow` drives transport phase and the persistent advection field; zero stops that transport. `spread` scales structure. `turbulence` deforms and advects fibres. `depth` opens/closes the z extent. `glow` changes luminous output. `focus` controls depth separation/softening of luminous motes, not a calibrated camera aperture or physical depth-of-field claim.
- `journey` remains parent-owned camera behavior; the asset reports the input but does not fight OrbitControls.
- `look.particles` reduces actual dot and filament draw ranges, including zero. `look.particleGlow` multiplies lab glow. `look.pulseGain` gates supplied onset wavefronts; frame.pulse already contains its gain, so gain is not multiplied twice.
- Parent already applies bass/mid/treble gains, reactivity and smoothing to supplied signals, and motionSpeed to visualDt. The asset consumes that dt once. Global exposure, bloom, saturation, hue, framing and optics remain host-owned. Existing scene-specific settings continue to concern their original scenes.
- Motion off does not advance phase, event age, retained signal uniforms, shape weights or simulation. Explicit spatial changes remap at dt=0. Palette/glow/focus/density changes still apply.
- Pause releases actual audio envelopes while ambient motion may continue; ambient motion is not presented as sound detection.

## Renderer state and lifecycle

Compute/probing snapshots the prior target, active cube/mipmap, current viewport, actual scissor region/test, XR and autoClear. An existing render target's temporarily overridden viewport/scissor are restored exactly, including its original target fields. The public logical viewport/scissor settings are never altered. State restoration runs in finally on exceptions. The compute material overwrites a full target with no depth/stencil requirements.

If half-float capabilities, framebuffer completeness or a compute render call fail, diagnostics switches to `analytical-shader` with an explicit reason; the visible vertex shader then uses the same authored forms without claiming persistent simulation. A shader compilation error that Three only logs (without throwing) still requires parent browser detection; protocol checks cannot substitute for this.

Every owned geometry, material, target and placeholder texture is disposed once; update/palette become no-ops after disposal.

## Verification

`particle-check.mjs` imports the actual asset and pinned Three r185. 26 checks cover the inside-environment camera profile, finite/coherent topology, deterministic detail seeds, continuous form weights, frozen morph/phase/signals, explicit frozen form edits, real-onset gating, pause release, real draw reductions across all bundles and new layers, zero density, immutable detail attributes, numeric sanitation, global/lab glow multiplication, bounded dt, palette application, framebuffer checks, shared ping-pong references, renderer restoration, actual drawing-buffer coverage, reduced compute cadence, static remap, failure fallback and idempotent Three resource disposal.

The renderer double verifies protocol boundaries, not GPU execution or pixels. Parent must verify the actual GPU result and any fallback it claims in a browser, plus integrated audio, resized views and capture.

Full-environment source SHA256: `2ad27b1a3d7f6cac08f3653c7acd653744c5bfd812b232c9e049a8d91e57d655`. Pair only with the full-environment atmosphere module, SHA256 `5c096833eeb1e1caca1ddfe42d3c1efa2bbe945f7b6135efad0b8b1017f999ad`. The earlier compact sculpture and its small volume are superseded and were not owner-accepted.
