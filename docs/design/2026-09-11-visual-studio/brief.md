# Visual Studio expansion

User accepted the three new worlds and requests ultra-level settings affecting their visuals. Preserve actual accepted scene art, Record, audio/session/library behavior, English interface, local-only deployment, motion-off freeze and exact default appearance. Quality before speed to protect Berk's finite time; never claim a slider works from its presence alone. Parent owns website integration and actual rendered verification. Delegates write only explicitly assigned files in this folder. Read project law and lane before edits.

Atomic sequence: STUDIO-01 current source/contracts/backup; STUDIO-02 shared rendering, scene tuning and coherent live-preview studio (independent child assets); STUDIO-03 real browser control/persistence/audio/visual QA and handoff. New settings are stored separately from playback at pmp.room.visual-studio.v1. No changes to original preference/session ownership module.

## Flat settings contract (key: default [min,max])

Look: exposure1.05 [.55,1.75], bloom1 [0,2], bloomRadius.65 [0,1], saturation1 [0,1.8], vignette0 [0,.8], particles1 [0,1], particleGlow1 [.2,2].
Motion: motionSpeed1 [.1,2.5], bassGain1 [0,2], midGain1 [0,2], trebleGain1 [0,2], pulseGain1 [0,2], smoothing1 [.25,2.5], framing1 [.75,1.35], orbitSpeed.26 [.05,1.2].
Record: recordSpectrum1 [.2,2], recordReflect1 [0,1.5], recordFog.057 [0,.12].
Neural: neuralSpread1 [.7,1.2], neuralSway1 [0,2], neuralTrail1 [.4,2].
Horizon: horizonGravity1 [.75,1.25], horizonFlow1 [0,2], horizonDetail1 [.5,1.5], horizonTilt0 [-.12,.18].
Prism: prismWidth1 [.8,1.3], prismTwist1 [0,2], prismSpeed1 [0,2], prismGloss1 [.6,1.6].

29 settings total (15 shared +14 scene). Parent handles shared render/audio mapping and Record; asset delegates implement their own scene keys and global particles/particleGlow via frame.look. Existing frame contract still works without look. All defaults must preserve current accepted appearance. Every explicit setting must visibly affect real material/geometry/motion at relevant time; no labels disconnected from rendering. No own RAF/renderer/audio/storage/UI in assets. Host passes dt and time scaled by motionSpeed for scene choreography; motionfalse still freezes clocks and audio values. Explicit static controls may be adjusted while frozen. Real audio only: do not invent events. Density must reduce drawn particles, glow must control visible point light; PulseGain0 must actually suppress actual-onset fronts.

Neural spread scales canopy/root width while keeping group host position intact; sway controls sound-driven bend and depth movement; trail controls width/decay of actual traveling electrical front. Global particles/particleGlow controls dust; cellular nodes are structural.
Horizon gravity affects curved-ray acceleration (art effect), flow affects disk drift, detail affects filament density with anti-aliasing as needed, tilt adjusts diskNormal z offset consistently in accretion and crossings. Respect bounds/performance, central dark void. Global particles/particleGlow affect stars. Low quality still32 ray steps.
Prism width scales corridorRadius, twist scales corridorTwist, speed scales real flight travel only (does not fabricate waves), gloss affects studio-strip sharpness coherently. Density/glow affect peripheral streaks. No flat pastel regression or near-black invisible walls.

## Settings module API (schema/storage delegate)

Export VISUAL_SCHEMA mapping keys to {label,min,max,step,default,group,scene?}; group=look/motion/scene, scene=record/aurora/orbital/liquid where specific. Export VISUAL_DEFAULTS, VISUAL_PRESETS [{id,name,description,settings}] with five meaningful looks including original, night-drive,dreamstate,high-voltage,deep-space. Presets are complete sanitized settings, separate from scene/atmosphere/motion enable/volume.
Export sanitizeVisualSettings(value), VISUAL_STORAGE_KEY, createVisualStore(adapter) where adapter get(key,fallback),set(key,value)->boolean. store.read()->{settings,presets:[{id,name,settings}]}; store.patch(key,value), store.replace(settings), store.savePreset(name,settings), store.deletePreset(id), store.importPresets(payload), store.exportPresets(). Mutation returns {ok,state,error?,id?}, never claims durable save on failure; reads latest before merge; patch preserves unrelated fields and saved looks; no storage writes during read or initialization. JSON export schema {format:'pmp-visual-looks',version:1,presets:[...]}. Import must validate size/count/name/settings, reject unknown version/format, avoid prototype pollution, bound20 custom looks; no eval. Roundtrip and stale-tab tests required. Parents handles visual no-storage temporary fallback on failed save honestly in UI.

## Live studio interface (parent)

Real existing #scene DOM moves into an in-panel preview while Visuals is open, returning to its exact original stage position on close. ResizeObserver and camera profiles handle actual viewport; no duplicate renderer or fake preview. Keep transport/audio independent. Compact Look/Motion/Scene tabs, visible numeric values, preset selection/save/delete/import/export, compare-original toggle and reset studio. Existing Motion/quality/intensity/reactivity/Record controls stay available and connected. Per-scene controls only show for selected scene. Applies live, persisted independently, cross-tab sync, explicit custom looks. Parent tests actual all29 settings using rendered representative changes plus source/runtime mapping, defaults, pause/motion freeze, scene switching while panel open, Escape/focus, persistence and failed/corrupt storage.
