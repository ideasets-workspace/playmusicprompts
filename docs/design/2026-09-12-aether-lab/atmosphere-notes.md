# Aether atmosphere implementation

Owned files only: `lab-aether-atmosphere.js`, `atmosphere-check.mjs`, this note. Original website and copied runtime were not edited by this delegate.

## Parent integration API

`createAetherAtmosphere(THREE)` returns `{group, update(frame), setPalette(world), diagnostics(), dispose()}`. Add `group` beneath the Aether particle group and forward the same frame and palette. Dispose it explicitly with the owning Aether asset. There is no renderer, render target, RAF, external image, or audio context in this module.

This is the full-environment revision paired with particle module `2ad27b1a3d7f6cac08f3653c7acd653744c5bfd812b232c9e049a8d91e57d655`; do not combine it with the rejected compact sculpture.

The frame consumes `dt`, `motion`, `active`, `bass`, `mid`, `treble`, `energy`, `quality`, `labLook` and `look.particleGlow`. Host `dt` already contains motion speed; it is not multiplied a second time. Phase follows the particle formula exactly: dt × flow × (.34 + smoothed energy × .68). Both layers use active envelope smoothing9, release5 and form easing2.2 per second. A new cross-module check verifies exact matching clocks, envelopes and morph weights through playback, pause and frozen changes. Motion off retains phase, weights and audio envelopes; deliberate form changes apply immediately. Static spread, turbulence, depth, focus, glow and palette edits continue to work.

## Actual method and bounds

One BackSide box mesh, local bounds ±(34,24,55), supplies exit positions and surrounds the authored camera. Its density is limited to the same foreground and distant span as the particles, with faded ends; the box bounds are only an integration boundary, not a visible rectangle. `onBeforeRender` transforms the actual render camera through the full inverse mesh-world matrix. This covers parent translation, rotation, scale, orbit, zoom and a camera inside the box. An orthographic ray branch is present and its matrix setup is checked, although the product uses a perspective camera.

The fragment shader uses explicit slab ray-box intersection, then 64 midpoint samples in High/Auto or 36 in Low. Density follows three cloud banks through depth for Silk, a turbulent open cavity for Nova, and two vast braided currents for Helix. Broad cloud shoulders and fine ridges share the particle centerlines. Bounded broad and fine domain structure breaks up the medium; there are no texture lookups or noisy screen-space jitter. Each sample integrates opacity with an exponential extinction term and accumulated transmittance. Emissive RGB uses additive One/One blending and leaves destination alpha unchanged. The final volume contribution is capped at .42 per channel; it cannot occlude the particles with an opaque rectangle. Depth zero disables the mesh draw entirely.

Focus concentrates supporting light around the authored focal depth. Spread changes lateral extent, depth changes the near/far extent and optical density, turbulence changes three-dimensional distortion, glow and global particle glow multiply the finish, bass changes lateral expansion and brightness, mids bend all currents, and treble changes the pale edge color. The particle system supplies detailed spectrum response and actual onset wavefronts.

## Checks run

14 checks passed using the actual copied pinned Three build: construction/blending, full transformed camera, prefix-helper collision guard, ray slab comparisons against a separate reference for eight selected cases and 1,000 deterministic rays, actual quality loop budgets, convex form transition and Motion freeze, static edits while frozen, input/dt bounds, audio envelope release and flow zero, depth integration identity/radiance ceiling, camera inside full-depth bounds, exact cross-module clocks/envelopes/morphs, palette wiring, and once-only resource disposal.

Command: pinned Node runtime executing `docs/design/2026-09-12-aether-lab/atmosphere-check.mjs`. An optional first argument supplies a copied production module path for the same checks.

Module SHA256: `5c096833eeb1e1caca1ddfe42d3c1efa2bbe945f7b6135efad0b8b1017f999ad`.

## Honest boundaries for parent acceptance

These are API, matrix, numerical and source checks, not GPU compilation or visual acceptance. Parent must inspect integrated GPU renders, free orbit and zoom, each form, depth zero/high, actual music, frozen motion, pause and Low quality. Check brightness with the actual particle composition and bloom before judging the aesthetic. The medium is an artistic bounded emissive field, not a physically complete multiple-scattering simulation. No FPS, global-first, mobile-device or commercial-production claim is supported by these checks.
