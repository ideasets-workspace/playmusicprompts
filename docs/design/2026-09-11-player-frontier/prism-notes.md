# Prism Passage — FRONTIER-02-C asset handoff

The replacement is a continuous 112-unit architectural passage, not the prior liquid sculpture. Eight faceted walls curve around a changing centerline. Fifty-six instanced structural bays carry recessed colored faces, sixteen continuous light rails run along the corners, and peripheral filaments convey forward travel. Shell facets use procedural metallic lighting so depth remains readable without distant point-light coverage.

## Host integration

- Keep export `createLiquidAsset(THREE)` and existing liquid model id. Group placement is the shared y=2.75.
- Honor `view.aspectFit:false`. Target `[0,2.75,-18]`, direction `[0,0,1]`, distance24.5 puts the default camera at world `[0,2.75,6.5]`, looking into the corridor. Orbit is false. Near walls fill the stage rather than being fit as an isolated object. min/max distance22.5/25 permit only shallow zoom. The default 100-unit camera far plane clips the last distant bays, where the curved walls already obscure the opening; extending far to140 is harmless if the host supports it.
- Suggested bloom strength0.42. Rails/face highlights have intentional restrained bright emission; changing bloom materially can wash out the faceted walls.
- Hide shared floor, sculpture architecture and Record dust, as agreed. The passage supplies its whole visual environment. No renderer, camera, audio, browser, fetch or animation-loop ownership.

## Response map and motion contract

- Actual smoothed energy controls forward travel. Bass gently widens the corridor. Mids and treble energize frame faces and rails. Idle travel is deliberately slow and creates no onset events.
- `active && onset` launches a light front near depth88; it travels toward the camera at45 units/second. Three fronts can overlap. Amplitude uses the actual pulse envelope. No beat clock or invented BPM.
- Motion false returns before any phase, audio envelope, front, or brightness animation changes. Explicit palette, intensity and quality changes remain allowed. Host time jumps are ignored because the asset maintains a local incremental phase.
- All nine world light/rim/tint values are used. Low quality reduces the peripheral filaments from190 to90. Core architecture stays coherent at both quality levels.

## Evidence and limits

`prism-check.mjs` executes the factory with the actual locally pinned Three.js revision185. Ten scoped checks pass: finite geometry/budget, camera profile, initial motion freeze, idle without fabricated audio, actual input/onset response, live pose freeze, all nine palettes, explicit intensity/quality while frozen, long-running bounded flight and idempotent disposal. Geometry:5 draw calls,42,112 triangles,22,892 source vertices. Count includes both instanced rib passes.

These are structural/source checks, not evidence of WebGL shader compilation, visual quality or measured frame rate. Parent must copy the module into the website, inspect the actual rendered corridor, check for shader errors, and evaluate it during real audio playback and motion-off before closing the integration task. No website or memory file was edited by this bounded delegate.

## Material revision after actual parent render

Parent's first browser render compiled cleanly but exposed broad pastel/matte-looking walls and excessive white piping. This was a visual quality failure, not acceptance. The revised shaders replace diffuse facet fill with near-black metal and localized continuous view-dependent studio-strip reflections, a restrained grazing iridescent coating, finer seam light and stronger distance absorption. Ribs now have dark faces with reflective glints; rail/frame emission is reduced to retain spectral color. This is a procedural art material, not a claim of traced physical reflections. Geometry, camera profile, playback input mapping, freeze behavior and ownership are unchanged. All ten source/real-Three structural checks were rerun successfully after this revision. The second actual browser material review remains the parent's required acceptance step; this delegate's CUA inventory was empty, so no separate render inspection is claimed.

The second actual parent render showed an overcorrection: insufficient visible reflections and nearly black walls. Root cause was forward-Z reflection gating, although corridor walls largely reflect toward negative-Z. The third revision removes that gating, lets both reflected directions see the procedural studio strips, broadens their support and strengthens their local energy. Base metal remains near-black, preserving separation between the specular bands. Rails are moderately brighter and more saturated again. Distance absorption is retained, with a slightly gentler coefficient. Ten structural checks passed after this final calibration; parent still owns the actual final visual acceptance and may adjust small material values from direct rendered evidence.
