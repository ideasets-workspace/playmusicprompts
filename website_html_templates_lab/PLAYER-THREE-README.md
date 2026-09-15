# The Listening Room — expanded Three.js player

Latest follow-up: **Visuals → Director** turns Visual Studio into a visual performance instrument: four-look morphing, real audio routing, song-bound visual cues, cinematic optics and actual PNG capture. The accepted four worlds and 29-setting Studio remain available. Current evidence is `memory/lanes/three-player-20260911/evidence/DIRECTOR-02.json` and `DIRECTOR-03.json`; earlier sections describe their dated delivery stages.

Latest visual revision: Neural Bloom, Event Horizon and Prism Passage replace the three earlier alternatives. The approved Record is preserved. Verification is recorded in `memory/lanes/three-player-20260911/evidence/FRONTIER-02.json` and `FRONTIER-03.json`:45 scoped feature/asset/collection checks,18 storage regressions and actual desktop browser playback/rendered checks. Neural and Prism were refined after the first visual pass; Event Horizon received separate horizontal/vertical fitting after narrow-window clipping was observed. No global-novelty, measured-FPS or fresh phone-device verification claim is made. Diagnostic WAV files in `verification/` are test signals, not demonstration songs, and are not auto-loaded.

Open **http://127.0.0.1:4175/player-three.html** while the local preview is running. Otherwise open **START-PLAYER.cmd**. Node.js is required to serve the folder. The separate player preserves the five approved website pages and the original player layout.

Share the HTTP preview link as the playable entry. Opening `player-three.html` directly from a folder now leads to `player-launch.html`, with the preview link and launcher instructions; it does not run the 3D player under `file://`. The browser needs HTTP for the module graph and WebGL texture loading. The launcher opens the browser after the preview has started listening. Keep using the same browser and local address to retain your imported library and settings.

Desktop windows now keep the complete playback bar visible, including short windows and Cinema. At smaller heights, the introduction and side controls can scroll independently. The approved visual identity and original Record remain intact.

Room preferences and playback history use separate versioned records. Existing settings and queue references migrate automatically; imported audio stays in the existing device database. Changing a visual or volume setting cannot replace the song list. Old open pages cannot overwrite the new records, and only the tab explicitly used to select/play/seek or edit a queue can update that session's position. Tabs on different local ports still have separate browser libraries; use a consistent address.

Choose **Bring your music**, or drop audio files into the room. Imported audio stays on this device and restores in the same browser and local address. No demonstration songs are bundled. If browser storage cannot save a file, the player explains that it is available for the current visit only.

## Four scenes, nine worlds and motion

Open **Scene** above the stage to choose between four distinct listening experiences:

- **Record** keeps the approved turntable, with Resonance, Orbit and Flow detail modes plus the record-only rotation controls.
- **Neural Bloom** is a suspended neural canopy with braided roots, dimensional branches, cellular junctions and electrical fronts. The real spectrum opens and bends the canopy; detected musical attacks send light along its branches.
- **Event Horizon** is a cinematic black-hole artwork with flowing accretion, curved secondary light images and spatial stars. Real audio energy stirs its disk and detected attacks launch outward fronts. This is an art-directed light-bending effect, not a general-relativity simulation.
- **Prism Passage** is a deep curved corridor with glossy faceted black-metal panels, spectral light guides and moving architectural ribs. Real audio controls its speed and sends light fronts along the passage.

Scene changes dissolve the outgoing rendered frame over the new world without replacing the audio element. Motion off makes selection immediate. Selection persists using the existing internal ids, so previous alternative selections now open their replacement worlds. Each alternative owns its environment and camera framing. Event Horizon and Prism Passage use composed views with depth zoom; Orbit camera is disabled for these views. Record and Neural Bloom support orbiting. Returning to Record restores its floor, architecture, camera and detail/turntable controls.

All three worlds use real analyser data: a 64-band log-frequency spectrum, spectral brightness and adaptive spectral-flux transients with a refractory interval. The transient envelope is not a BPM estimate and no beat clock runs during silence. Motion off freezes animated uniforms and pose, while explicit palette/light/quality changes still work. Assets load lazily, only the selected asset updates, and lower quality reduces particles or curved-ray steps. A frame-rate target is not a device performance guarantee.

**Explore all 9 worlds** opens Nightfall, Deep water, Afterglow, Aurora, Rainroom, Desert bloom, Lunar tide, Ember and Cloud nine. Atmospheres recolor all four scenes. In Record they also change artwork and room lighting; Rainroom has falling particles and Ember rising particles. Each new scene has its own atmospheric geometry. The six new illustrations are native 512 × 512 panels in one local 1536 × 1024 atlas. This is atmosphere artwork, not imported cover metadata.

The record face, grooves, center and visible marker rotate during playback, including quiet passages. Pause gently slows the record to rest. **Visuals → Rotation speed** sets 0–45 RPM; **Orbit camera** adds a slow camera journey while playing. Drag to adjust the view, scroll to zoom, or choose Reset view.

**Sound response** adjusts actual audio-driven movement. Separate channel analysis preserves visual energy for right-only and opposite-phase stereo tracks. Resonance, Orbit and Flow sculpture modes, reflective floor, particles, bloom, light intensity, rendering quality, Cinema and full screen remain available. Motion initially follows the system reduced-motion preference. An explicit on/off choice is saved separately, survives reload and takes precedence over later system changes. When off, the stage offers Enable motion. Legacy computed booleans migrate to system-following mode because they did not distinguish manual choices from defaults. Audio remains usable if WebGL cannot initialize or loses its context.

Idle particles are ambient animation. The frequency display reads real audio; silence and pause settle its energy.

## Visual Studio

Open **Visuals** to shape the scene while watching the same live WebGL canvas inside the panel. Closing the panel returns that canvas to the stage. The preview's music button controls the existing player; no second audio source or renderer is created. **Scene** above the stage opens the Scene tab directly, and selecting a world keeps the studio open.

| Tab | Advanced controls |
| --- | --- |
| Look | Exposure, bloom strength/diffusion, color richness, edge shade, particle density and glow; original light intensity and rendering quality remain available |
| Motion | World tempo, separate bass/midrange/treble response, transient impact, response smoothing, framing and orbit speed; original Motion and Sound response remain available |
| Scene: Record | Spectrum height, floor reflection, atmospheric depth, plus the original detail and turntable controls |
| Scene: Neural | Canopy spread, living sway and electrical trail |
| Scene: Horizon | Light curvature, accretion flow, filament detail and disk tilt |
| Scene: Prism | Passage width/twist, flight speed and surface gloss |

Original restores the accepted balance. Night Drive, Dreamstate, High Voltage and Deep Space apply complete advanced looks. Compare temporarily previews Original; editing or closing exits comparison. Reset studio resets these 29 settings, leaving your scene, atmosphere, explicit Motion choice and audio controls intact. Individual reset buttons restore one parameter. Transient impact is available in the three alternative worlds; camera orbit is available in Record and Neural. Battery friendly quality omits bloom and the reflective floor.

Save up to 20 named custom looks. Saving the same name updates that look. Import and Export exchange validated JSON containing saved custom looks; importing keeps your current settings. Settings use a separate `pmp.lab.room.visual-studio.v1` record, update across open tabs and return on reload. Failed writes keep edits live for the current visit with an unsaved indicator. Playback/session ownership is unchanged. World tempo affects visual time only; it never changes audio playback speed.

Implementation: `player-three-visual-settings.js` owns the schema and scoped store; `player-three-visual-studio.js` / `.css` provide the panel; the shared scene and individual worlds consume the actual settings. Local checks are in `../docs/design/2026-09-11-visual-studio/`. The integrated source, settings, renderer state, preset failures, controls and asset checks pass; actual CUA browser review covered four renders, live audio, visual changes, import/export, reload, keyboard focus and cross-tab updates at 1280 × 720 and the current 851 × 898 user window. No fresh physical-phone or measured-FPS claim is made.

## Director — perform, score and finish

Open **Visuals → Director**. The original live canvas stays above the controls, and playback continues through the existing audio engine.

| View | What you can do |
| --- | --- |
| Perform | Drag the look map to blend four complete looks. Use arrow keys or the two sliders; Shift makes larger keyboard steps. Assign curated looks to corners or capture the current view. |
| Follow the music | Actual energy moves horizontally; spectral brightness moves vertically. Moving the pad takes back control. No artificial beat or demo signal is used. |
| Signal routes | Enable up to four mappings from bass, midrange, treble, energy, transients or brightness into light and scene movement. Positive or negative depth adjusts the effect; meters report real signal levels. Scene-specific and unavailable effects are labeled. |
| Score | Capture up to 24 named moments at exact song times, each containing the current scene and full Studio look. Edit time/transition/name, jump to cues, remove them, or arm the sequence. Transitions follow absolute playback time and support backward/forward seeking. |
| Lens | Add chromatic separation, highlight streaks and fine grain. Choose Still, Breathe or Arc camera movement and depth. Capture frame downloads the actual rendered canvas as PNG at its current canvas size. |

One score is saved on this device and bound to the selected library track. A different track leaves the manual scene visible and cannot run or extend the old score. Return to the original song or explicitly clear the score. Arming never starts playback. Cue jumps use the player's existing intentional seek/session handling.

**Manual** disables morph, Follow, score playback and routes while preserving the saved Studio look. Lens settings are independent; **Reset lens & camera** restores a neutral finish. Compare temporarily removes Director effects; opening Director exits comparison. Motion off holds automatic look, cue, camera and grain movement; explicit edits still work. Camera gestures take priority, followed by a gentle handback while music and Motion are active.

Director uses `pmp.lab.room.director.v1`; automatic frames never save over the 29-setting Studio, manual scene preference or audio session. Valid edits remain usable for the visit if storage fails, with an explicit message. Runtime modules: `player-three-director.js`, `player-three-performance.js`, `player-three-director-ui.js`, `player-three-director.css` and `player-three-optics.js`.

Current checks are under `../docs/design/2026-09-11-director/`. Twelve suites cover source behavior, actual Three/OrbitControls mathematics, scoped persistence and regressions. Actual browser review separately covers the four worlds, live diagnostic-file response, cues, reload, mismatch, Motion, low-detail feedback and PNG pixels. The shader's original helper-name collision was repaired and checked in the actual GPU browser. No global-first, measured-FPS, physical-device or other-engine claim is made.

## Your sound

The **Sound** panel has four tabs with volume, mute and real left/right meters above them.

| Tab | Controls |
| --- | --- |
| Tone | Ten-band EQ at 31, 63, 125, 250, 500 Hz and 1, 2, 4, 8, 16 kHz; ±12 dB per band; response curve; preamp; automatic headroom |
| Space | Stereo width from mono to 200%; conventional left/right balance; mono listening; Studio, Hall and Space convolution ambience |
| Dynamics | Original dynamics, Gentle glue, Hold the punch and Late-night listening; actual gain reduction; 0.5–1.5× playback speed with browser pitch preservation; A–B passage loop |
| My presets | Save, restore and delete up to 32 named combinations of EQ, stereo, ambience, dynamics and effect settings |

Eight built-in EQ profiles: Original, Warm & full, Vocal clarity, Deep bass, Electronic, Acoustic, Cinematic and Soft focus. Built-in profiles change tone; named custom presets restore combined sound settings. Preferences persist locally. The effect switch bypasses sound processing while preserving volume and session controls. Reset all sound settings restores original processing settings.

Automatic headroom compensates combined EQ boost, stereo expansion and an ambience allowance. Transitions reserve headroom before moving filter gains. Dynamics profiles separately compensate the native compressor's automatic makeup gain using output trims that preserve attack shape; compressed profiles can sound quieter. This is native dynamic compression, not a true-peak limiter or a guarantee against clipping for every source and manual gain combination.

## Session tools

- **Sleep timer:** 15, 30, 45, 60 or 90 minutes, a custom duration, or After this song. Timed stops offer no fade or 5 / 15 / 30-second fades; very short timers cap the fade at half the duration. The fade is independent of volume. Timers count wall-clock time, can be cancelled, and restore their deadline after reload.
- **After this song** lets the song finish naturally, then stops before automatic next or repeat. The timed fade selector is disabled for this choice.
- **Keep the best moments:** name and save the current position, jump back to it, or delete it. Up to 50 bookmarks per song persist locally and appear on the waveform. Press **B** to save a moment without opening the panel.
- **Queue:** search titles, select, reorder and remove songs. Search changes the visible list without changing playback order. Clear queue keeps stored audio; Bring back saved music restores available tracks.

Waveform seeking, favorites, shuffle, repeat, backward history, keyboard shortcuts and OS media controls remain connected to actual playback. Shortcuts are listed under **Keys**. Settings panels contain keyboard focus and return it to their opener when closed.

## Files and integration

| File | Purpose |
| --- | --- |
| `player-three.html` | Separate English entry and semantic controls |
| `player-three-entry.js`, `player-launch.html` | Protocol-aware entry and static local launch guide |
| `player-three-layout.css` | Desktop viewport sizing and compact-height layout |
| `player-three-store.js` | Field-level preferences, one-time migration and session ownership |
| `player-three.css`, `player-three-ultra.css` | Preserved base design and expanded responsive controls |
| `player-three.js` | Playback, queue, storage, waveform and integration |
| `player-three-audio.js` | Ten-band processing, stereo matrix, convolution, dynamics and channel analysis |
| `player-three-sound-ui.js` | Sound controls, presets, response display and meters |
| `player-three-session.js` | Sleep timer, independent fade and bookmarks |
| `player-three-motion.js` | System-following defaults and explicit motion preferences |
| `player-three-worlds.js` | Shared world definitions and atlas coordinates |
| `player-three-scene.js` | Shared Three.js room, camera, palettes, audio bands and model visibility |
| `player-three-collection.js`, `player-three-collection.css` | Accessible four-scene selector and stage control styling |
| `player-three-models.js` | Lazy scene creation, palette propagation, update routing and disposal |
| `player-three-features.js` | Actual 64-band spectrum, spectral centroid and transient envelope |
| `player-three-aurora.js` | Neural Bloom branches, nodes and travelling electrical fronts |
| `player-three-orbital.js` | Event Horizon curved-ray accretion artwork and spatial stars |
| `player-three-liquid.js` | Prism Passage faceted corridor and musical wavefronts |
| `assets/worlds-six-atlas.png` | Six new illustrations; provenance manifest alongside |
| `vendor/three/` | Pinned Three.js 0.185.1, required addons, MIT license and hashes |

All runtime dependencies, fonts and artwork are local. Serve over HTTP: ES modules do not reliably run through a double-clicked `file:` URL. No build or external CDN is required.

Playable `PMP_CONFIG.catalog` entries and browser-local `pmp.lab.creations` remain integration points. Audio shares IndexedDB `pmp-lab-local-audio`, version 1, store `tracks`, with the HTML suite. Favorites share `pmp.lab.saved`; room preferences use `pmp.lab.room.preferences.v2`, session ownership/order/position use `pmp.lab.room.session.v2`. The legacy `pmp.lab.room` is migration input only. Sound, presets, timer and bookmarks use dedicated `pmp.lab.room.*` keys. Navigation from another player starts a separate playback session. Reload restores selection without autoplay.

Remote audio must allow anonymous CORS access. No account or music-generation service is called. Maximum file size is 256 MB; codec support depends on the browser. Large files retain seeking when waveform decoding is skipped.

Audio path: one media source → explicit stereo input → headroom → ten filters → dry/convolution mix → stereo width/balance matrix → latency-aligned dry/dynamics paths → volume → independent sleep fade → output. Two channel analysers read final output. Original dynamics uses a delay matched to the native compressor's roughly 6 ms lookahead; it does not pass through the compressor. Convolution responses are generated DSP decay buffers, not generated music. The context starts from a user gesture.

## Verification — 2026-09-11

165 automated checks passed with actual Web Audio processing and isolated browser playback:

| Report | Passing checks |
| --- | ---: |
| `verification/ultra-audio-checks.json` | 15 |
| `verification/ultra-world-checks.json` | 17 |
| `verification/ultra-session-checks.json` | 12 |
| `verification/ultra-regression-checks.json` | 44 |
| `verification/ultra-final-checks.json` | 25 |
| `../docs/design/2026-09-11-player-ultra-assets/audio-review-checks.json` | 52 |

Independent audio review exercised Original startup, matched delays, impulses and bursts, 25 rapid dynamics reversals, boosted EQ reversals, malformed presets and right-only waveforms at 44.1, 48 and 96 kHz. Tested 0.95-amplitude transient sources remained below full scale after the dynamics correction. Production source hashes remained unchanged during review. Reproducible tests and primary-source calculations are beside the independent report.

Parent and independent reviewer inspected desktop/mobile surfaces and keyboard navigation. Clean final screenshots use `verification/ultra-final-*.png`, from 320 to 1920 px. Early `ultra-player-mobile-first.png` was captured before a visible scene and is superseded by settled final captures. Other test screenshots may contain test-track labels or transient feedback.

Execution used local Chrome 152, actual Web Audio and WebGL including software rendering, plus responsive viewport emulation. Physical-device performance and other browser engines are not established by these checks. Test signals exist only in isolated verification sessions, not as shipped music. Approved v1 source is preserved in `../docs/design/2026-09-11-player-ultra-assets/approved-player-v1-source.zip`.

## Primary references

- [Three.js documentation](https://threejs.org/docs/) and locally pinned source, addons, license and hashes.
- [W3C Web Audio API](https://webaudio.github.io/web-audio-api/) for audio processing and compressor behavior.
- [MDN ConvolverNode](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode), [DynamicsCompressorNode](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode) and [filter frequency response](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/getFrequencyResponse).
- [Chromium native dynamics processor](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/audio/dynamics_compressor.cc) for makeup gain and lookahead, checked against measured production output.
- [W3C slider interaction pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/).

Playback-motion correction: 11 additional preference cases passed in verification/motion-preference-checks.json. Actual in-app browser checks covered explicit enable/reload, explicit disable/reload and rendered WAV playback/pause on a separate 4174 test origin. Distinct playback frames showed rotating artwork and active spectral bars. Existing user player tabs were updated with motion enabled. See memory/lanes/three-player-20260911/evidence/MOTION-02.json for exact scope.

Scene expansion verification (historical, before the Frontier replacement): parent asset checks cover audio/motion response, exact Motion-off freezing and finite geometry for Aurora, Orbital and Liquid Chrome (10 checks, including Liquid local-clock resume). In-app browser review covered the four-way selector, Record-only control visibility, all nine atmosphere palette selections, reload and two-tab persistence, Cinema mode naming, distinct integrated renders and zero page errors. Motion-on and Motion-off were compared from actual rendered frames on the integrated Liquid scene; the first changed across 500 ms and the second remained byte-identical across 500 ms. Mobile-specific selector styles are present in `player-three-collection.css`; the existing responsive player layout remains unchanged.
