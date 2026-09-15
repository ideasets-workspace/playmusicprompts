# Director coordinator review

Bounded review child of DIRECTOR-02. Parent owns website fixes, actual DOM integration and rendered/audio checks. Quality before speed protects Berk from storage and integration regressions.

Atomic review:

1. Read the full current law, lane pointer, actual coordinator, planned UI integration script and relevant current main/Studio/UI sources. Complete.
2. Execute actual coordinator with the production engine/store/schema against explicit host boundaries. 18 checks pass after the validation/dirty-map defect was repaired by the parent.
3. Report source evidence and exact limitations without treating boundary tests as rendered/browser proof. Complete for this bounded review; combined browser acceptance belongs to the parent.

Only `coordinator-check.mjs` and this notes file are owned by this child. No website edits.

## Findings and repairs

1. **Reproduced dirty-map poisoning:** `commit({mode:'invalid'})` was correctly rejected by the store but coordinator retained the rejected mode as an unsaved edit. Every later otherwise-valid edit was then rejected. Returning the store's persisted result also discarded earlier valid transient state. The parent requested and integrated a narrow store signal, `accepted:false`, for validation rejection; coordinator now returns early with its current config and never changes dirty state for rejected input. It records sanitized accepted fields for valid failures. Both newly added regression cases pass against production coordinator and engine.
2. **Intentional cue seek boundary:** UI previously set `audio.currentTime` directly. Main `seekTo` additionally claims the user's current session and syncs the transport, preserving the earlier paused-seek/two-tab repair. Parent added `seek:seekTo` to main and the coordinator passes it to controls. Actual main wiring and coordinator propagation execute in this harness. Final UI call and browser session behavior remain part of parent/UI validation.

## Verification

`coordinator-check.mjs`: **18 passed, 0 failed** against production coordinator SHA256 `8568026daa8c91370c59472d9efd625cb4f8c2eb7e22ab9665565b7e9fb10952` and production engine with validation-rejection signal.

The harness executes the actual coordinator with its production engine/store/schema imports; only the DOM controls constructor is replaced with an explicitly recorded host boundary. Room methods, browser storage events, audio properties and PNG download are controlled boundaries. A separate check executes the actual two main integration statements, exercising cue-driven scene selection versus explicit manual selection and the original seek function forwarding.

Coverage:

- Initialization and per-frame execution perform no writes; unchanged neutral settings are not reapplied every frame. Exactly the 29 saved settings survive default operation.
- Real supplied modulation values, paused/ended/unready gates, Motion freeze, static lens edits and approximately 10 Hz controls updates.
- Latest-state merge, two consecutive temporary changes, external storage events, successful recovery, rejected data recovery and preservation of already accepted unsaved edits.
- Manual bypass, Compare engine hold and neutral lens, true Original snapshots, current effective cue snapshots, track mismatch, forward/backward absolute seeks and independent manual scene preference.
- Unavailable renderer error, delegation to the room's PNG Blob, local download boundary and event listener/UI disposal.

Both test scripts print structured JSON suitable for the parent's final evidence collector. No test here proves real WebGL output, audio playback, PNG image pixels, DOM accessibility, actual session restoration or overall visual quality. Those remain the parent's combined-browser acceptance checks. The child made no website edits; the earlier three engine files were amended only under the parent's explicit follow-up authorization.

## Follow-up: prior Studio regressions

Parent explicitly requested the previous eight Studio review checks against the integrated source. The unchanged historical harness initially stopped because its extracted controller lacked the new `endCompare` function and callbacks; this was a harness-boundary gap, not an observed application failure. A new `studio-review-checks.mjs` preserves all eight original checks and executes the actual new `endCompare` function with recording `onManualEdit`/`onCompareChange` callbacks. The camera-reset check adds an explicit no-op boundary for removing a preexisting camera offset, which is absent in that neutral camera test. One additional case verifies actual Studio edits notify manual bypass and end Compare before altering settings.

Result: **9 passed**. Tested Studio SHA256 `3a594a2e2f90c3bec127683dbf1d0cbcdb654d1d135aa830f4a7ddde5f29f3f8`; scene SHA256 `29549923ac59250ab6981f31b67cfcc50667b79bcd943538190b41fa6d64f67f`. Historical harness was not edited. The same controller/camera-boundary limitations apply; actual new camera choreography is not established by the neutral Prism framing invariant.
