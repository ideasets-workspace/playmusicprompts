# Neural and Horizon studio integration

Assigned child work for STUDIO-02. Parent owns website integration, the full task ledger and actual rendered verification. Quality and completeness take precedence over speed; source checks below do not establish visual acceptance.

## Atomic work and evidence

1. Read current law, lane, project records, studio contract and the accepted current asset sources: performed before edits. Source files are `website_html_templates/player-three-aurora.js` and `player-three-orbital.js`.
2. Implement bounded Neural settings, actual dust controls and frozen-state tuning in the assigned copy: implemented; real Three object checks pass.
3. Implement bounded Horizon settings, actual star controls and continuous disk-flow timing in the assigned copy: implemented; real Three object and exact CPU ray-equation checks pass.
4. Validate baseline compatibility, extrema, motion freeze, real-onset gate, resources and setting bindings: 16 Node checks passed on the pinned local Three revision185. Parent integration and browser render/control inspection remain required.

## Files to integrate

- `player-three-asset-aurora.js` → `website_html_templates/player-three-aurora.js`
- `player-three-asset-orbital.js` → `website_html_templates/player-three-orbital.js`
- `organic-check.mjs` is executable with the bundled Node binary from the project root. It imports these assigned copies and the previous Frontier baseline modules, never replacing the live website itself.

## Actual mappings

Neural: `neuralSpread` sets joined fiber and cell x/z scale together, retaining the host group position and unscaled dust. `neuralSway` scales the sound-driven shader displacement and audio-driven portion of the group turn, using retained drive/flow when frozen. `neuralTrail` changes Gaussian front width and the real-front decay endpoint. Dust draw count is `floor((low ? 480 : 1050) * particles)`, and only its fragment alpha is multiplied by `particleGlow`; structural cells remain present. CPU bounds cover maximum2x sound displacement so tuning cannot trigger incorrect culling.

Horizon: `horizonGravity` multiplies curved-ray acceleration; `horizonTilt` modifies the disk normal identically in material coordinates and ray crossings. `horizonDetail` scales the thread and vein radial frequencies within [.5,1.5]. `horizonFlow` integrates a separate disk drift phase, so speed changes never retroactively multiply elapsed time; zero stops drift while other clocks and real audio still update. Stars draw `floor((low ? 576 : 1152) * particles)` and their alpha receives `particleGlow`. High/low ray steps remain56/32. This remains art-directed lensing, not a scientific physical model.

Both assets use `frame.look`; missing/nonfinite fields restore original defaults and finite values clamp to contract bounds. A zero `pulseGain` immediately masks existing fronts and prevents new ones, including while Motion is off. Front arrays and clocks remain frozen; masking is an explicit visual change. Nonzero gain is already applied to host pulse values and is not multiplied a second time in these assets.

Motion-off freezes phase, fresh audio, spectral/drive envelopes, wave ages and flow. Static settings, explicit intensity and quality still apply. Speed controls take effect on the next advancing frame. The host supplies pre-scaled `dt`; these assets do not multiply it again. Their defensive cap is `.05 * motionSpeed` so higher speeds are not truncated at lower frame rates; absent look preserves the previous .05 cap.

## Verification scope

The16 checks cover original and explicit-default equivalence over180 mixed moving/frozen/audio frames for each asset, geometry arrays and camera profiles, all scene-specific setting endpoints, malformed settings, draw-count changes including zero, quality limits, immediate zero-pulse suppression, no invented onsets, frozen animated state, scaled time, Neural junction alignment/culling bounds, continuous Horizon flow, finite rays with a disk and dark central capture at every gravity/tilt endpoint and32/56 steps, and idempotent disposal.

No extra renderer, scheduling loop, audio source, storage, UI or dependency was added. No GPU shader compilation, pixel-level equivalence, device performance or rendered quality is claimed from these tests. Parent must inspect the real live-preview studio and scene changes before task closure.
