# Visual Studio host verification

Assigned parent child under STUDIO-02. Scope: read current host/features/settings, exercise actual host logic with bundled real Three scene objects and real collection/assets, and report renderer/control state defects. Only this note and `host-check.mjs` are owned by this child.

Atomic checks:

1. Establish import adaptation and explicit browser/GPU boundary substitutes. Actual production host function body remains unchanged.
2. Verify real host mappings: exposure, bloom strength/diffusion, grade enable/uniform identity, Record fog/reflection/spectrum, actual dust draw count/glow, all 29 forwarded settings, motion pacing, smoothing, three band gains, transient suppression, frozen pose, camera framing/reset and quality preservation.
3. Run complete checks and report reproducible failures to the parent. Browser GPU compilation, pixels, gestures, audio output and UI rendering remain parent responsibilities.

Status: all 21 checks passed using bundled Three r185 and actual current host SHA-256 `99c3bc4ce37939c4ddf83cc048eecc1ddee7b9fcd11f8940134c199e48d99dc2`. No current production defect was reproduced within this scope. No production files were edited and no rendered verification is claimed.

The harness imports the current host function body unchanged after adapting only its import declarations. Actual scene, geometry, instance matrices, materials, camera, Reflector shader/target, collection, all three assets, visual settings and feature detector come from current project files. Renderer, PMREM output, composer/pass execution, OrbitControls operations, texture loading, frame scheduler and DOM interfaces are explicit test boundaries. This verifies host/control state, not GPU compilation, pixel output, gesture behavior, real elapsed performance or audible playback.

Verified host results include:

- Exposure, bloom strength/radius and grade activation/uniforms; the default grade pass remains disabled, preserving identity.
- Actual Record dust draw ranges and opacity, fog scope, and reflected radiance strength. The updated shader uses `reflectionStrength`; existing Reflector tint is preserved.
- Record spectrum height changes real instance matrices and Wave position attributes while motion is frozen. Three gain controls cover all 64 forwarded spectral bins; zero gains remove the Record spectrum response without altering source analyser data.
- All 29 sanitized fields reach actual collection updates and persist across real asset switching. Individual asset mapping tests are separate child evidence.
- A host tempo of 2.5 forwards 0.125 seconds for a 0.05-second real frame, without changing real audio analysis timing or multiplying choreography speed twice. Smoothing measurably changes band/spectrum attack.
- Actual feature detector onsets produce Prism fronts, pulse gain scales forwarded impulse, and zero clears existing fronts even while frozen. Muted/inactive inputs do not emit new onsets.
- Motion off preserves Record matrices, rotor angle and reactive light strength plus Prism pose/audio uniforms despite incoming analyser changes.
- Record framing changes distance. Prism framing changes actual camera zoom over the full control range while retaining safe distance; other scenes reset zoom to 1. Unrelated setting edits preserve manually adjusted camera position, and reset/preview aspect fitting retain settings.
- Orbit enable/speed state, intentional low-quality bloom/reflection disablement, and disposal boundaries remain connected.

Run `node docs/design/2026-09-11-visual-studio/host-check.mjs` with the bundled Node runtime. The script prints the exact source hash and all check names. Parent should rerun if host/assets/features/settings drift and pair this evidence with actual browser review.

Harness corrections during construction: updated expected reflection behavior and Prism camera profile after the parent changed those implementations; aligned the OrbitControls boundary's initial `enableRotate` value with actual Three defaults. These were test-boundary/updated-contract corrections, not product defects.
