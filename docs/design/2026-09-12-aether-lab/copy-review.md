# Independent copy and controls review

Reviewer scope: source inspection and production-module checks. Initial ownership was this document, `lab-controls-check.mjs` and `host-check.mjs`; the parent later explicitly added copied `server.mjs`, `capture-api-check.mjs` and its result for the bounded PNG structural-validation repair. `integrated-results.json` is written by the inspected verification runner. No original player or memory file was changed. The parent owns all other production integration and actual browser/GPU/audio/rendered verification. Review continued after the computer restart on 2026-09-12.

## Acceptance status

**The initial visual proposal did not satisfy Berk.** The parent reported Berk's rejection: the result was the same player with one simple additional effect. Revision 2 now implements Tidal, Monolith and Aether with a full-screen front stage; the parent is inspecting the actual rendered environments and refining Monolith lighting. The technical checks below concern that current implementation and do not establish visual success, owner acceptance, global novelty or completion of the visual review.

Bounded review work: (1) resolve actual lane and immutable-original boundary; (2) run the production host with pinned Three and explicit non-GPU boundaries; (3) cover Journey timing, freeze, gesture priority and setting propagation; (4) validate environment cue state and storage failure/recovery; (5) verify exact original file set and hashes; (6) report precise defects and verification limits. All checks in this bounded source/runtime review pass. The Journey/Auto orbit defect is corrected and regression-checked below.

## Preservation and isolation

The full original manifest contains 227 files. On 2026-09-12 at 11:30:15 UTC, every original file matched its pre-copy SHA256, and recursive enumeration matched the exact original file set with no added or removed files. The copied Neural Bloom, Event Horizon and Prism Passage assets, audio DSP, audio-feature extractor, motion-preference module and atmosphere palettes were byte-identical to the original. The original Record construction remains inside the host, whose copy is being extended; this review does not equate whole-host equality with Record regression verification.

All copied top-level runtime JavaScript storage literals use `pmp.lab.*`. Imported audio uses the separate `pmp-lab-local-audio` IndexedDB database. Copied entry/bootstrap/import map resolve locally; pinned vendor resources are included. Server and both launchers target 4175, with explicit launcher `PORT=4175`. The visible Original player link intentionally opens 4173 in a separate tab with `noopener`; it is navigation, not shared runtime state. Original browser state was not read or written by this reviewer.

## Production-store evidence

The current `lab-controls-check.mjs` run passed **44 checks** at 11:30:15 UTC. The harness imports actual production modules from `website_html_templates_lab` and tests:

- Complete defaults, every numeric limit, recovery from invalid stored values, and no writes during store construction/read.
- Atomic invalid-patch rejection, namespace scoping, mutation independence, latest-record merging across two store instances and last-successful same-field edits.
- Failed and thrown saves retaining temporary edits, merging peer fields, retrying durably and releasing temporary ownership after success.
- Complete Aether cue capture data persisting through Director; Silk, Helix and Supernova restored by absolute playback seeks; Motion off holding the selected cue; another song and manual bypass removing the scored override; original cues remaining valid.
- Strict validation of all six numeric Aether fields against non-finite and non-number values, form enumeration and boolean Journey; partial valid cue appearances remain accepted and bounded.
- Accessor-bearing cue mutations reject without invoking getters or changing the saved score. Recovery retains valid data fields and never invokes nested Aether getters. This test originally reproduced seven accessor calls and now passes after the parent made `sanitizeAether` descriptor-based.
- Original-source hashes and copied accepted modules; namespace, database and entry/port boundaries.
- All three new environment IDs through metadata, Director store/engine, actual cue-construction code and actual coordinator capture/application. The coordinator's DOM-heavy controls are an explicit boundary; unchanged focused UI/main functions are executed separately with named data/DOM surfaces.
- Manual edits retain the visible cue's complete world appearance before bypassing Score. The main scored getter stops exposing the old cue as soon as mode changes to Manual. The analyser loop updates the new shell after Director and world controls without registering an extra loop.
- Both actual main manual-edit callbacks adopt the visible score scene before bypass. Tests execute the actual World commit and Studio patch functions with the real coordinator/stores, using different visible and previous-manual scenes for each of Tidal, Aether and Monolith. Bypass precedes storage; the next coordinator frame keeps the selected world. A World Flow edit preserves the cue's other authored world values.

## Production-host evidence

`host-check.mjs` executes the unchanged production host function with its imports mapped to the real pinned Three.js r185, real OrbitControls mathematics, actual scene collection/assets, audio-feature extraction and optics ShaderPass. Renderer execution, compositor execution, DOM event surfaces and the PNG encoder are explicit test boundaries. Aether therefore selects its honestly labeled analytical fallback in this harness; no GPU pixels or simulation execution are claimed.

Current host SHA256: `efe9120db8952de6f4fbebe8dfbe002f2a5586b87de969ab59c6f4f02dfa12a6`.

Current result: **66 passing checks, zero failures**. The original 42 host checks continue to pass, including Record geometry/state, the other three copied assets, audio gating, framing, Motion freeze, optics and PNG request lifecycles. The new checks execute all three actual environment assets through the host and establish lab setting propagation, shared renderer ownership, frozen automatic uniforms/instance matrices, explicit frozen edits and audio response settling after pause. Low quality reduces Tidal triangles/waves/noise, Monolith instances/motes and Aether filaments/field/riders with a lower compute cadence. These are submitted-work measurements, not measured GPU performance.

Journey uses bounded per-environment translation, freezes exact camera poses on pause/Motion off and restores the user's baseline when disabled. A real OrbitControls wheel handler is invoked through the explicit DOM event surface for each world; all three yield during the five-second hold, resume and freeze correctly afterward. Tidal/Monolith remain composed views with rotation disabled. The former Auto orbit conflict passes its regression.

The resize assertion was updated because revision 2 intentionally changed Aether to an immersive `aspectFit:false` profile: it preserves authored camera position and changes lens zoom, rather than retreating from a centered sculpture. Camera-vector comparisons tolerate floating-point roundoff below 1e-9 world units. Long deterministic camera tests select High quality so their 20 ms steps remain render steps; Auto's actual adaptive 32 ms cadence had caused an assertion to inspect the frame before a setting was rendered, rather than revealing a production failure.

## UI and integration findings

1. **Corrected and read back:** Aether HUD initially compared renderer modes `analytic`/`gpu`, while the asset reports `analytical-shader`/`gpu-half-float`. Current label mapping uses the actual identifiers. Actual GPU mode must still be observed in browser.
2. **Corrected and read back:** The cue extension initially also added `labLook` to captured morph corners. Director's unchanged corner schema rejects that extra field. Current corner capture remains `{name,settings}` and only cue capture carries `labLook`.
3. **Corrected and regression checked:** Look → Compare → Aether previously hid the Compare control while leaving comparison active. World entry now ends comparison. The focused check executes the actual `showTab` function and passes.
4. **Corrected and read back:** Orbit speed help now includes Aether.
5. **Corrected and regression checked:** Aether cue mutation validation originally allowed malformed scalar/form/Journey types to be silently normalized. The parent added strict field validation; the full 44-check suite passes.
6. **Corrected and regression checked:** Journey and Auto orbit previously competed for camera ownership, moving the baseline during the intended five-second gesture hold. Current Aether Journey suppresses Auto orbit; Tidal and Monolith already disable rotation through their composed profiles. The original reproduced hold case and new all-three-world real wheel-handler cases now pass. The copied original four scenes retain their existing behavior.
7. **Parent browser discovery; corrected and regression checked:** A score could show Aether while `manualScene` still referred to the last manually selected Monolith. Editing Flow preserved Aether's Helix appearance but bypass returned the next frame to Monolith. The main World callback now assigns `manualScene=visualState.model` before bypass. The parent applied the same ownership correction to the Visual Studio callback. New actual-callback/coordinator checks cover all three mismatched scene pairs and verify handoff order and the following frame. The earlier tests had checked appearance transfer and bypass separately and did not cover this mismatched scene ownership; their previous passing result did not establish that scenario.

Control-flow review confirms native range inputs and labels, keyboard-operable form buttons, per-field reset, whole-world reset, Journey switch, disabled shared world fieldset when one of the original four scenes is selected, separate Enter Aether action, manual-edit bypass callback, scoped storage synchronization and no new UI animation loop. Five Studio tabs use dynamic-length keyboard navigation. Saved world settings remain separate from the original 29-setting Studio schema.

## Required parent verification

This report does not establish rendered quality, audible playback, GPU shader compilation, simulation mode, visual camera framing, motion freeze on the real renderer, adaptive GPU cost, touch behavior or PNG pixels. Parent browser QA must include all three environments and their three authored variants, actual audio/mute/pause, explicit Motion off and static edits, Journey with gesture priority, low/high detail, cue capture/seek/reload, Look Compare → World, and all preserved scene selections. Rerun preservation checks after the final production edit.

## Final integrated source verification — 2026-09-12

The independent reviewer inspected `verify-v2.cjs` before executing it. It runs the six current suites against production asset paths, checks every copied top-level JavaScript file for syntax, verifies original hashes and records the copied source manifest. Its only written output is `integrated-results.json`. The atmosphere harness's additional particle import points to its delegated source file; that file was separately checked byte-identical to the production Aether asset during this run.

At **11:35:56 UTC**, all six suites exited 0 without stderr: particle 26, atmosphere 14, Tidal 13, Monolith 13, host 66 and controls/coordinator 44 — **176 passing checks**. All copied top-level JavaScript syntax passed. The original exact 227-file set and every SHA256 remained unchanged. The runner's manifest records current top-level copied source hashes; a subsequent hash read found no drift at review time. Raw results, module hashes, explicit renderer boundaries and source manifest are preserved in `integrated-results.json`. That verification run did not modify production or memory files; the subsequently authorized copied-server repair is documented below.

## PNG project-save source review

The current source connects the new shell's Save frame button to the host's `captureFrame()`, displays that returned Blob, posts it to `/api/captures`, then updates the download link to the exact returned `/captures/<name>` URL. Failures retain a Blob download fallback; the capture button is restored in `finally`. Closing the preview revokes its Blob URL. The API binds to loopback, requires POST, the exact local Origin and `image/png`, bounds the body at 24 MiB and writes generated whitelisted-world/UUID names beneath the copy's `captures` directory with exclusive creation. The saved path cannot be selected by client input. There is no disconnected capture API in this source path.

The parent-produced `capture-api-result.json` records eight checks at 11:30:37 UTC, including foreign/missing Origin, wrong type/method, oversized and ordinary invalid bodies, no files from rejected requests, and byte-identical serving of an actual captured 1280 × 720 PNG. This reviewer inspected that evidence and source; it did not independently perform the browser capture or image inspection.

**Historical gap, now repaired below:** the initial API verified only a PNG signature and minimum 24-byte length, then read width/height fields. A truncated signature-bearing payload could therefore be accepted. This gap was reported and the parent authorized the bounded structural repair below. Compressed-image decoding remains outside scope.

### Authorized structural-validation repair

The parent authorized a bounded correction to copied `server.mjs` and `capture-api-check.mjs` only. Atomic work: (1) implement a bounded PNG chunk walk with supported canvas header, dimensions, ordering and CRC checks; (2) add truncated/header/CRC/unterminated rejection fixtures and rerun all existing API checks on a disposable alternate server without touching either live server; (3) inspect exact source hashes and update this evidence. Compressed-image decoding remains explicitly outside the validator's claim.

The repair is implemented and its scoped checks pass. The validator walks every bounded chunk, checks every type/data CRC32, requires exactly one first 13-byte IHDR, accepts eight-bit canvas RGB/RGBA with legal compression/filter/interlace fields, bounds each dimension at 16,384 and total area at 64 Mi pixels, requires a nonempty contiguous IDAT stream and terminal empty IEND, validates optional palette size/order, and rejects unknown critical chunks, invalid chunk-type bytes, out-of-bounds lengths and trailing data. At most 65,536 chunks are processed within the existing 24 MiB request limit. CRC fixtures use a separate bit-by-bit implementation from production's table-based calculation.

At **11:43:33 UTC**, **36 API/validator checks passed** on disposable port **4187**. These retain the original origin/type/method/body-limit and real-PNG GET checks and add signature-bearing truncation, legal-header fields with recalculated CRCs, corrupted CRCs, chunk bounds/order, absent/non-contiguous image data, missing/invalid IEND, trailing bytes and palette/type guards. Rejected requests created no capture files. The unchanged production validator accepts the parent's actual 1280 × 720 canvas PNG; the alternate server serves it byte-identically. This test did not create a new capture file, decode pixels or replace either live server. Its own spawned server was stopped in `finally`.

Final copied server SHA256: `490f3ce2fef46c63a0a4f01dac3412dd33be93723e5eb6f7f8de6759f412408b`. The parent was notified immediately to restart the live lab and verify a fresh actual capture. The six-suite integrated runner was rerun after this server change and the parent's final scene-count/README edits; **all 176 checks, copied JavaScript syntax and original 227-file preservation passed again**, with the current source manifest in `integrated-results.json`. These structural checks do not claim successful decoding of arbitrary compressed IDAT data; that limit is explicit in the server comment and API test output.
