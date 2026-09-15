# Independent Visual Studio review

Scope: installed `player-three-visual-studio.js`, player integration in `player-three.js`, shared host in `player-three-scene.js`, and related collection/store contracts. No website files were edited by this reviewer. Parent owns actual browser, accessibility interaction, layout, sound and rendered verification.

## Concrete findings and parent corrections

1. **Duplicate-setting custom looks could not be selected or deleted.** The first review snapshot matched built-in settings before any saved custom look, so saving Original as a custom immediately selected Original again and hid Delete. The parent added explicit `selectedId` preference, retained the returned save ID, and honors explicit selection. Source-extracted real controller tests now save/select/delete both an Original-equivalent custom and two identically configured custom looks successfully.
2. **Record reflection at zero retained bright reflections.** Scaling the vendor Reflector's overlay color does not scale reflected radiance: a fully bright reflected pixel remains bright even with color zero. The parent added a real `reflectionStrength` uniform multiplying the reflected result, with exact default 1 and the original color preserved. The current source and installed vendor shader correction pass the targeted check. Actual visual magnitude remains parent-rendered verification.
3. **Prism framing had large ineffective slider regions.** Its narrow safe camera-distance clamp flattened much of the .75–1.35 range. The parent now uses camera zoom for the composed Prism view while retaining the accepted camera distance. A test executes the actual current reset function with the installed Three.js `PerspectiveCamera`: .75, 1 and 1.35 all produce their distinct zoom values at exact distance 24.5; switching to Record restores zoom 1.
4. **Record exposed Transient impact without consuming the effect.** The Record path has no transient-front effect; the parent preserves its accepted art and explicitly disables that control in Record with a precise applicability hint. Neural, Horizon and Prism keep the control available. Current actual refresh function passes the availability checks; the existing composed-view orbit-speed restriction remains correct.

These four findings are resolved at the current source/controller-contract level. No additional concrete unresolved defect was found in this bounded review. This is not a claim that source checks substitute for all actual visual or interaction review.

## Current targeted verification

Run `node docs/design/2026-09-11-visual-studio/review-checks.mjs`.

All eight checks pass against installed website source. The harness extracts actual controller functions and event handlers and supplies a recording DOM boundary, rather than reimplementing controller logic. It also uses the real installed settings store and Three.js camera. No jsdom/linkedom/happy-dom dependency exists in the bundled runtime or project; no package was installed and no separate browser driver was used.

The checks cover:

- Original-equivalent custom save, explicit selection and deletion.
- Two identical custom looks remaining independently selectable and deletable.
- Consecutive failed exposure/particle edits retaining both live values and honest unsaved status; another tab's saturation edit merging while both local fields remain dirty; a later successful vignette edit saving all four fields together.
- Failed custom save producing no ghost saved look and retaining current temporary settings.
- Temporary Original comparison and reset without deleting saved looks.
- Full Prism framing endpoints and default camera preservation.
- Actual reflection-strength uniform wiring.
- Correct availability of transient impact and orbit speed by scene.

The real scene preview relocation is source-connected: opening moves the original `#scene` to the preview slot and leaves a comment anchor; closing returns that same element to the anchor's exact position. It does not create another renderer. The main panel flow invokes these hooks and releases the outside inert state on close. Actual resizing, focus, keyboard and visual quality remain parent browser checks.

Reviewed hashes from the passing run:

- `player-three-visual-studio.js`: `91c59100307715356a87b936a7be897b76dbae846c52cc95a8b115fec1ceb731`
- `player-three-scene.js`: `99c3bc4ce37939c4ddf83cc048eecc1ddee7b9fcd11f8940134c199e48d99dc2`

The script emits fresh hashes on each run. Rerun after relevant source changes rather than treating these snapshot hashes as current indefinitely.
