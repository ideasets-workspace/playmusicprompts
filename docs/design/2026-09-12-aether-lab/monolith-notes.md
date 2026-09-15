# Monolith asset — integration and evidence

Bounded child of LAB-02, three-lab-20260912. Original website and production lab were not edited. Parent owns copying, integration, actual GPU rendering and acceptance. The initial lab was rejected for visual sameness and insufficient ambition; this module therefore establishes a spatial architectural environment with solid foreground framing, inhabited perspective and material surfaces, rather than another small object against black.

## Atomic child work

1. Read live law, project/lane memory, active ledger, revision-2 contract, host camera/model source and accepted Prism Passage source. Done in this child turn. The new environment does not reuse Prism Passage's folded tunnel or rail topology.
2. Implement independent environment, same host frame/quality/palette/lifecycle interface. Source implemented in `lab-monolith.js`; syntax and numeric tests passed. Parent GPU/visual review remains required before the integrated item can close.
3. Check genuine behavior with pinned Three, then refine against parent render evidence. Thirteen checks currently pass. They inspect actual scene instances and material callbacks, but they do not compile shaders or establish the quality of a rendered image.

## Composition

- `createMonolithAsset(THREE)` returns `group`, `view`, `update(frame)`, `setPalette(world)`, `diagnostics()` and `dispose()`.
- Host adds group Y 2.75. Global target `[0, 3.1, -20]`, direction `[0, .016, 1]`, distance 32 places the camera at approximately local `[0, .862, 11.996]`. `aspectFit:false`, `orbit:false`, zoom distance 30–33, bloom .35. The camera looks down an irregular canyon toward the illuminated aperture around Z -47. Architecture deliberately crops the frame near the viewer.
- 36 beveled primary monolith instances, 36 outer-strata instances, 16 suspended cantilever instances and 36 recessed seams. Nine ground slabs have real thickness, overlap and visible step risers. A large deep backdrop supplies atmospheric continuity; a far solid gate contains the emissive vertical aperture.
- Architectural materials are real `MeshPhysicalMaterial`, using real surface normals, clearcoat, metallic response and iridescence. Reflections come from the host's existing PMREM environment, not screen-space reflections of the architecture. Added actual hemisphere, directional and point lights reveal surfaces along the full scene depth. No claim of ray tracing or physical atmospheric simulation is made.
- Shared GLSL hooks add analytic distance haze and mineral finish to the PBR result. Aperture, fine seams and motes are shaders. The renderer/postprocessing/clock/camera/audio remain host-owned. No external textures, network loads, new rendering context or animation loop.

## Forms and controls

The shared IDs are retained; scene-specific display names, if used by the parent, could be `Sanctum` (silk), `Awakening` (nova) and `Rift` (helix).

| Input | Actual effect |
| --- | --- |
| form silk | Tall, ordered mineral canyon |
| form nova | Inner monoliths fan outward and rotate, the far aperture opens wider |
| form helix | Alternating tectonic tilt, elevated strata and longer suspended cantilevers close around the route |
| flow | Rate of ambient light currents, motes and structural phase |
| spread | Actual lateral width of the architecture |
| turbulence | Irregular structure drift, airborne mineral drift and diffuse haze variation |
| glow | Actual seam/aperture radiance, motes and aperture point-light intensity |
| depth | Distance haze strength and background illumination |
| focus | Width and intensity distribution of the focal aperture |
| journey | Host camera responsibility; this asset supplies a composed view with orbit disabled |
| global particles | Submitted point draw count, including zero |
| global particleGlow | Shared light finish multiplier |
| global pulseGain | Onset-wave gain; explicit zero clears pending waves, including under Motion off |

Actual bass adds gentle structural displacement and aperture intensity. Mids bend the moving luminous current. Treble affects suspended motes and seam response. Real onsets schedule one coherent wave at Z -48 that propagates toward the foreground. Zero audio never creates an onset; ambient phase is independent of playing music. All automatic clocks, wave fronts, audio envelopes, form interpolation and instance transforms hold exactly when Motion is off. Explicit controls and palette edits still apply.

## Quality and lifetime

Low quality actually reduces 124 submitted structural/light instances to 98 and 1000 points to 220, before the independent particle-density multiplier. Host pixel ratio, bloom and render pacing remain host responsibilities. Geometry/material/instance resources dispose once; a disposed asset cannot resume updates.

## Current evidence and limits

Run the child check with the bundled Node runtime: `monolith-check.mjs`, optionally passing the integrated production module path. Thirteen checks cover pinned Three construction and PBR callback wiring, finite bounded transforms, real input-driven envelopes, wave fronts, full Motion freeze, static edits, quality reduction, convex form interpolation, input validation, palette changes, bounded mineral highlight/depth math and lifecycle.

The test's own output includes the exact current source SHA256 and an explicit scope statement. The checks cannot establish GLSL compilation, real GPU visual quality, frame rate, photographic realism or owner artistic acceptance. Those remain parent integration duties. LAB-02 stays open through actual render review and any resulting repair.

## Render-driven contrast repair

Parent reported the first actual 1280×720 production render compiled without errors and established substantial full-frame architecture, but failed the contrast criterion: broad white reflections and flat haze obscured central material forms and steps. This is an observed visual defect, not resolved by the prior numeric checks.

The source identified two concrete contributors: an aperture point-light intensity of 850 close to distant metal faces, and a haze curve that replaced about 77% of far-face shading at default depth. The repaired source reduces the point light to 110, lowers the added directional/fill lights and PMREM/clearcoat intensity, narrows the luminous aperture, and reduces default far haze replacement to about 43% with a darker haze base. A hue-preserving bounded mineral highlight curve prevents broad reflected faces from supplying uncontrolled HDR bloom; dedicated luminous seams/aperture retain their emission. The geometry, depth, form transitions and actual audio response are unchanged. Parent must render this revised source before calling the visual defect resolved.
