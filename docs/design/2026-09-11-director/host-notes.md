# Director host verification

Delegated ownership: only this file and host-check.mjs under DIRECTOR-02. Parent owns the production host and all browser/GPU testing. Quality before speed: inspect actual behavior and report defects; do not modify the host to make checks pass.

Atomic work:

1. Read current production host, prior Studio harness, pinned Three APIs and active Director ledger. Complete.
2. Adapt the existing current-function harness to Director imports, actual optics pass, camera interaction and capture boundaries. Complete. Production function bodies are unchanged; only imports are mapped through explicit dependency boundaries.
3. Verify neutral behavior, bounded setters, safe continuous framing, real camera/freeze/gesture behavior, raw signals and capture success/error/disposal timing. Final scoped run: **42 passed, 0 failed** on 2026-09-11 against host SHA256 `519ba7af3e98eb559ae6c77769228330a8cfafaeca8ceda64bac9d7fba955aae` with pinned Three revision 185. First run had 36 passed and 2 failed against `7708d71371c27b30958fe40d449f85a3597075eb771bad81ccf6c337ec44991b`; all reported failure paths now pass after parent repairs.
4. Report reproducible defects immediately, rerun after parent fixes, record source hash and precise evidence limitations. Scoped host verification complete; no website or memory edits were made by this delegate. This result does not close the parent's browser/GPU acceptance.

## Reproduced findings

1. **Camera freeze after manual handback:** activate Arc, start/end a manual gesture, continue active playback for seven seconds to finish the hold and handback, then disable Motion. The camera returns to its manual baseline instead of freezing its last arc pose. Measured x changed from 6.443768356872886 to 4.4604964993323595. `cameraUserUntil` remains greater than zero, so the Motion-off early return occurs after the previous camera offset was removed. Parent should retain the effective frozen handback amount/pose, while avoiding automatic reacquisition if Motion was disabled during the hold.
2. **PNG callback still outstanding on disposal:** capture is removed from `captureRequests` and its timeout cleared before `toBlob` calls back. Disposing the host during encoding therefore leaves its promise pending and later allows a successful resolution after disposal. Keeping the request tracked until settlement also retains bounded encoder timeout coverage.

Parent had already addressed two earlier source concerns before the first harness run: continuous framing now clamps to active controls distance limits, and a manual view remains stable when Motion is off throughout the gesture hold. Both those behavioral cases pass.

## Verified repairs

The parent replaced wall-clock handback strength with a stored blend that advances only during active playback with Motion on after the gesture hold. Both fully and partially reacquired camera poses now freeze correctly, and a paused manual hold remains stable. The checks also exercise smooth initial resume.

The parent retains each capture request, timeout and encoding flag until its callback settles. Disposal now rejects an outstanding encoder request, timeout remains active during encoding, and subsequent live frames do not start duplicate encoders. Null callback and thrown encoder error cases reject. A hidden-page request times out without encoding; a lost renderer rejects new requests.

## Scope and execution

`host-check.mjs` loads the current production function without changing any function bodies. The import bindings are adapted to a controlled dependency registry. Three scene/geometry/material/camera/Reflector, collection/assets/features/settings, ShaderPass optics and **actual OrbitControls mathematics** execute. OrbitControls is subclassed only to record update calls; its real update, damping, clamps, rotations and disposal run against a small document/event boundary.

GPU renderer/compositor execution, actual browser event delivery, PNG encoding and DOM layout remain explicit boundaries. The PNG callback uses an intentionally labeled boundary Blob solely to verify request order, callbacks and errors. It is not a captured product image. The harness therefore makes no GPU shader, screenshot, audible playback or user-interface acceptance claim.

Run `node docs/design/2026-09-11-director/host-check.mjs` with the bundled Node 24 runtime. It prints exact current host SHA256, pass/fail names and failure details, exiting nonzero for a failed assertion. The 42 cases include all 21 prior Studio host regressions, the expanded Director paths, and a longer four-scene/two-camera-mode drift check. Each mode executes 300 active plus 100 frozen frame updates; neutral camera position, orientation, framing and all 29 base settings are unchanged after bypass, within 1e-9 pose tolerance.

Parent still owns actual browser rendering, manual drag/zoom feel, encoder output inspection and responsive interface review. Rerun this harness if production host code changes before final evidence reconciliation.

Follow-up on 2026-09-11: after the parent added bloom-availability diagnostics and repaired the optics GLSL helper collision, the unchanged 42-case harness passed again with **0 failures**, now against host SHA256 `29549923ac59250ab6981f31b67cfcc50667b79bcd943538190b41fa6d64f67f`. This supersedes the earlier host hash for current source evidence. Actual GPU shader repair verification remains the parent's browser responsibility; optics-notes.md records the precise failure and the expanded 14-case namespace guard.
