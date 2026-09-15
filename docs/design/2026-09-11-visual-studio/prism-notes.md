# Prism Visual Studio child

Parent task: STUDIO-02 in three-player-20260911. Parent owns website integration, task records and actual browser rendering. This child owns only the assigned module, check script and this note.

Accepted source: `website_html_templates/player-three-liquid.js`; there is no `player-three-asset-liquid.js` in the website. The assigned output name remains `player-three-asset-liquid.js` for parent integration. The prior Frontier copy matches the accepted source SHA-256 `9f8a0b0c1e2191c4ed204658cfe20a32b82550c94210b2d8d46678e65a366f07` and is the immutable default-comparison test input.

Atomic child scope:

1. Read source/contracts and preserve default art: read completed, factory baseline matched by SHA-256.
2. Implement actual width, twist, flight speed, glossy strip sharpness, peripheral particle density/glow, and explicit zero pulse suppression while preserving motion freeze. Implemented and source/control state checks passed.
3. Exercise real Three construction, defaults versus accepted module, extrema, malformed values, static edits during freeze, travel-only speed, real onset behavior, quality/density, palettes and disposal. Initial 17 checks in `prism-check.mjs` passed against bundled Three r185. Browser shader compilation and rendered control quality remain parent responsibilities, so the parent task remains open for integration/visual verification.
4. Parent follow-up: match the host's pre-scaled motion delta safety ceiling, accepting real dt up to 0.05 multiplied by motionSpeed (up to 0.125). Implemented without applying motionSpeed twice; all 18 checks passed on rerun. Module SHA-256: `017b84499e1a98e944a9b554eb699d4f6d7c3f3b6fa09993c3c4bb4546615132`.

No own renderer, frame scheduler, audio context, storage, UI or camera writes are introduced. Existing five-draw structure and geometry stay unchanged. Width scales the radius for architecture and peripheral filaments. Gloss changes studio-strip width and glint power on both walls and ribs, retaining dark material colors and the accepted negative-Z reflection support. Flight speed changes travel only; bend phase, real-onset front travel and audio smoothing remain independent of flight speed. Zero pulse gain immediately clears existing front strength and prevents new fronts, including during a frozen pose, as requested by the parent.

Source/control evidence: 240 active/inactive frames with absent look and explicit defaults retain byte-identical legacy uniform snapshots against the accepted module; all geometry/index attributes and camera profile match. Flight speed 0 retains phase/audio/front response but leaves travel zero; flight speed 2 produces exactly twice travel. Density changes actual draw ranges to zero through 190 whole filaments (90 in low quality); structural geometry remains intact. Explicit look edits preserve frozen audio/time, with the requested pulse-zero front suppression as the explicit exception. Long-flight bounds and all owned resource disposal pass.

Run: Node `docs/design/2026-09-11-visual-studio/prism-check.mjs`. The JSON result is printed by the check script. The checks do not create or claim GPU images. Parent should inspect all four Prism controls, particles/glow, motion off, and pulse off in the real live-preview panel before reporting complete integration.
