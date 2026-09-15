# Beyond revision 2 — actual browser review, 2026-09-12

The parent inspected the live copy at `http://127.0.0.1:4175/player-three.html` through CUA. The original player was not used for these mutations. This is actual browser evidence, separate from the explicit renderer/DOM boundaries in the automated harnesses.

## Visual review

The new full-viewport frontstage was inspected at 1280×720 and the ordinary in-app viewport. Tidal presents a displaced ocean, eclipse, coast silhouettes and a coherent reflected light source. Nightfall and Afterglow were visibly distinct. Monolith presents solid walls, steps, cantilevers and a vertical light opening. Its first render was washed out; lower direct/environment lighting, bounded mineral highlights, reduced fog and bloom restored readable surfaces. Aether surrounds the camera with fine flowing currents, near/far particles and volumetric light. The actual renderer reported `Particle simulation` from `gpu-half-float`.

The authored World forms were inspected during the session: Tidal Drift/Swell/Current, Monolith Sanctum/Awakening/Rift, Aether River/Void/Helix. The copied Record, Neural Bloom, Event Horizon and Prism Passage were each selected in Collection; their settled live previews rendered. The collection count was found stale at05 and corrected to07.

The 390×844 responsive viewport had document/body width390 and canvas bounds390×844 with no horizontal overflow. World cards and the complete compact transport fitted the screen; Studio retained its real preview and internally scrolling controls. Score cue forms remained operable at this width. This is not a physical mobile-device/GPU test. The temporary viewport override was reset.

Cinema mode removed the large world heading, world cards, palette action and side rail, and dimmed the transport; it retained the header, scene selector and an accessible exit. It was then exited normally.

## Integrated interactions

- A local 32-second diagnostic WAV was explicitly imported only into the copy. Audio playback position progressed and the waveform was derived from that actual file. Playback/library state restored after restart/reload.
- On each new world, two actual scene screenshots were byte-identical with Motion off while the audio fixture continued. Tidal screenshots differed after Motion was enabled. An explicit Monolith Rift choice still changed the held world.
- Muting the active Aether playback changed its actual audio status from `Your sound, alive.` to `An atmosphere waiting for your sound.` while its renderer remained `Particle simulation`. It was unmuted afterward. No fake spectrum or music is used in the product.
- All six World values and Journey persisted through a reload at non-default settings. Whole-world reset restored defaults. Low Tidal actually rendered through its reduced shader path; submitted-work reductions for all three are separately measured by host tests.
- Three actual Director cues were created at0/10/20 seconds for Tidal/Aether/Monolith. Jumping to each selected that world; the matching cue displayed `ON SCREEN`. Reload retained all three cues.
- A real browser failure exposed stale manual scene ownership: editing Flow during an Aether cue returned to an earlier manually selected Monolith. Both main manual-edit callbacks now adopt the visible world before bypass. The exact Aether/Helix/Flow case was repeated successfully after reload, and all three mismatch pairs pass actual-callback/coordinator regression checks.
- Look Compare → World ended comparison, avoiding a hidden active Compare state. Morph-corner capture succeeded after keeping the extra world appearance field limited to cue capture.
- Browser warning/error logs were empty after the three new environments and four copied scenes had been selected.

## Real image output

Save frame produced actual1280×720 PNGs in the copy's `captures` folder, with a successful in-app preview and filesystem dimensions/bytes verified. The Tidal PNG was also opened from disk with the image viewer. These are renderer images, not generated mockups:

- `beyond-tidal-2026-09-12T11-25-48-154Z-acd082ec.png`
- `beyond-monolith-2026-09-12T11-36-47-873Z-5df2cbd8.png`
- `beyond-aether-2026-09-12T11-37-01-355Z-c9e78853.png`

The native browser Blob download-event observation timed out. The actual project-folder save is the verified route; the fallback native download is not presented as verified. API rejection and structural validation have separate results in `capture-api-result.json` and reviewer notes.

## Handoff preparation and limits

Only our three diagnostic score cues and our fixture's queue entry were removed after verification. Original user storage was not touched. The copy was left at Tidal, Afterglow, empty queue, Adaptive quality, Motion on and Journey on, ready for the user's music. The saved diagnostic audio remains on the copy's device storage, as stated by the queue removal UI; no user file was deleted.

Artistic acceptance belongs to Berk. This review establishes the implemented local behavior and inspected appearance, not world-first status, physical accuracy, universal hardware compatibility or measured frame-rate superiority.
