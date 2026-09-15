/**
 * js/constants.js — every tunable the mockup scripts use, in one place (rule 20).
 *
 * MOCKUP TRUTH STATEMENT (Berk's order 2026-09-09: design first, no backend):
 *   - PLAYER_CLOCK.demoDurationSeconds and the seeded waveform in WAVEFORM stand in for the
 *     real <audio> element + AnalyserNode / server beat grid that the production build
 *     already wires (deploy/payload/components/stream/useStreamEngine.ts, 2026-09-08).
 *   - SAMPLE_TRACKS is REVIEW CONTENT for this mockup only and is replaced by the live
 *     GET /api/musics rows at integration time. It is labelled as such in every page footer.
 */

export const BRAND = Object.freeze({
  // measured brand hues, DECISIONS.md D-PMP-06 (approved) — mirrored from css/tokens.css
  magenta: 0xE62BA4, orchid: 0xB014D5, violet: 0x5805E4, cobalt: 0x0A0FE6, azure: 0x0075FA,
  ultraviolet: 0x7F00FF, cyan: 0x00FFFF, fuchsia: 0xFF00FF,
  bg0: 0x050308,
});

export const WAVEFORM = Object.freeze({
  barCount: 160,        // bars across the scrubber at desktop width
  barGapPx: 2,
  minBarRatio: 0.12,    // quietest bar height as a fraction of canvas height
  seed: 20260909,       // deterministic shape for the review build
  playedColor: "#00FFFF",     // --accent-2: the part already heard
  aheadColor: "rgba(255,255,255,.28)",
  headColor: "#FFFFFF",
});

export const PLAYER_CLOCK = Object.freeze({
  demoDurationSeconds: 132,   // matches a real delivered take length measured 2026-09-08 (2:12)
  tickMs: 250,
  keyboardStepSeconds: 5,     // SC 2.5.7 non-drag alternative (same step the live player uses)
});

export const SCENE3D = Object.freeze({
  // GPU particle field (custom ShaderMaterial, additive, depth-sized soft discs)
  particleCount: 22000,
  fieldRadius: 9.5,
  fieldThickness: 0.35,
  particleSizePx: 42,          // base point size at z=0 before depth attenuation
  // three flowing luminous ribbons ("frozen waveforms")
  ribbonCount: 3,
  ribbonSegments: 220,
  ribbonAmplitude: 1.1,
  ribbonRadius: 0.06,
  // the "composer core": an iridescent glass torus-knot in the centre
  coreRadius: 1.15,
  coreTube: 0.34,
  // camera choreography
  cameraZ: 9.5,
  cameraFov: 40,
  pointerLerp: 0.05,
  parallaxX: 1.4, parallaxY: 0.8,
  scrollParallax: 2.6,         // world units the camera rises over one viewport of scroll
  idleRotationRadPerSec: 0.06,
  pulseHz: 1.9,                // ~114 BPM breathing while "playing"
  // bloom (UnrealBloomPass) — the neon glow both reference images have
  bloomStrength: 1.35,
  bloomRadius: 0.55,
  bloomThreshold: 0.12,
  colors: { near: 0x7F00FF, mid: 0xE62BA4, far: 0x00FFFF, core: 0xB014D5 },
  reducedMotionStaticFrame: true,
});

export const VISUALIZER = Object.freeze({
  // frequency terrain in the now-playing stage: rows roll toward the camera
  columns: 96,
  rows: 64,
  cellSize: 0.22,
  heightScale: 2.2,
  speedRowsPerSec: 14,
  demoBins: 96,
});

export const TILT = Object.freeze({
  maxDeg: 10,
  perspectivePx: 900,
  glare: true,
  lerp: 0.18,
});

/** THE WORLD (separate page set under world/): the homepage as a 3D scene the camera travels. */
export const WORLD = Object.freeze({
  cameraFov: 46,
  fogDensity: 0.014,
  // stations along -Z: 0 source/core, 1 composing tunnel, 2 now-playing terrain, 3 catalogue gallery, 4 radio dial
  stationZ: [0, -34, -70, -106, -146],
  // camera and look-at splines (x, y, z) — one control point per station plus the approach
  cameraPath: [[0, 2.2, 11], [0.8, 1.6, -22], [0, 5.5, -58], [0, 1.6, -88], [0, 3.2, -128]],
  lookPath:   [[0, 1.0, 0], [0, 0.8, -36], [0, -1.0, -72], [0, 1.2, -106], [0, 0.6, -146]],
  wheelSensitivity: 0.00042,
  touchSensitivity: 0.0016,
  dragSensitivity: 0.0045,
  progressLerp: 0.06,
  smoothingRatePerSec: 3.6,    // 0.06/frame at 60 fps, expressed per second so low-fps devices keep the same timing
  grainAmount: 0.035,
  vignette: 0.9,
  tunnel: { rings: 46, pointsPerRing: 180, radius: 6.5, length: 30, pointSizePx: 70 },
  gallery: { count: 16, radius: 5.6, rise: 2.4, coverSize: 3.0 },
  dial: { radius: 7.5, orbRadius: 0.9, tuneSnapRatePerSec: 4.0, labelPx: 512 },
});

/**
 * RADIOS — continuous stations, each a place in THE WORLD. Order = measured global demand
 * ranking from docs/research/2026-09-07-music-catalogue-browse-category-demand.md (Lo-Fi /
 * Ambient-Sleep / Classical / Focus cells rank highest; 84 % of our catalogue is instrumental).
 * genre ids are literal ids from the live capabilities vocabulary (cross-matched 2026-09-07).
 * hue = the radio's own accent (from the brand set); bpm = the tempo the world breathes at.
 */
export const RADIOS = Object.freeze([
  { id: "lofi-night",   name: "Lo-fi Night",     genre: "lo_fi_hip_hop",   mood: "nostalgic",   hue: 0x7F00FF, bpm: 84,  brief: "warm lo-fi beats, rain on the window, vinyl crackle" },
  { id: "deep-sleep",   name: "Deep Sleep",      genre: "ambient",         mood: "calm",        hue: 0x5805E4, bpm: 60,  brief: "ambient drones, soft pads, no percussion, very slow" },
  { id: "piano-room",   name: "Piano Room",      genre: "classical_piano", mood: "melancholic", hue: 0x0075FA, bpm: 72,  brief: "solo piano, minimalist, long sustain, quiet" },
  { id: "cinema",       name: "Cinema",          genre: "cinematic",       mood: "epic",        hue: 0xE62BA4, bpm: 96,  brief: "orchestral builds, brass swells, choir pads" },
  { id: "blue-room",    name: "Blue Room Jazz",  genre: "jazz",            mood: "intimate",    hue: 0x00FFFF, bpm: 100, brief: "small-combo jazz, brushed drums, upright bass" },
  { id: "grid-horizon", name: "Grid Horizon",    genre: "synthwave",       mood: "driving",     hue: 0xFF00FF, bpm: 118, brief: "retro synthwave, arpeggios, gated reverb drums" },
]);

export const STORAGE_KEYS = Object.freeze({
  railCollapsed: "pmp.mockup.rail.collapsed",
});

export const COMPOSER_ATTRIBUTION = "Composed for you by Ideasets Hybrid Music Composer"; // D-PMP-06 wording

/** Review content only — see MOCKUP TRUTH STATEMENT above. Genre/mood ids are real vocabulary ids. */
export const SAMPLE_TRACKS = Object.freeze([
  { id: "t1", title: "Night Train Through Kadıköy", prompt: "warm lo-fi beat, rain on the window, vinyl crackle, slow", cover: "assets/cover-lofi-night.jpg", genres: ["lo_fi_hip_hop"], moods: ["nostalgic"], vocal: "instrumental", seconds: 132, plays: 1204, likes: 88, lufs: -14.0, tp: -1.0, bpm: 84 },
  { id: "t2", title: "Vault of Falling Stars", prompt: "colossal cinematic orchestral build, brass swells, choir pads", cover: "assets/cover-cinematic-orchestral.jpg", genres: ["cinematic"], moods: ["epic"], vocal: "choir", seconds: 178, plays: 932, likes: 140, lufs: -9.0, tp: -1.0, bpm: 96 },
  { id: "t3", title: "Silk Over Black Water", prompt: "ambient sleep drone, soft pads, no percussion, very slow", cover: "assets/cover-ambient-sleep.jpg", genres: ["ambient"], moods: ["calm"], vocal: "instrumental", seconds: 180, plays: 2110, likes: 301, lufs: -16.0, tp: -1.0, bpm: 60 },
  { id: "t4", title: "Chrome Sphere, 1994", prompt: "90s alternative rock, fuzzy guitars, driving drums, raw", cover: "assets/cover-90s-rock.jpg", genres: ["alternative_rock"], moods: ["energetic"], vocal: "male", seconds: 156, plays: 640, likes: 72, lufs: -11.0, tp: -1.0, bpm: 140 },
  { id: "t5", title: "Blue Room, 2 A.M.", prompt: "late-night small-combo jazz, brushed drums, upright bass, smoky", cover: "assets/cover-jazz-night.jpg", genres: ["jazz"], moods: ["intimate"], vocal: "instrumental", seconds: 144, plays: 512, likes: 61, lufs: -14.0, tp: -1.0, bpm: 100 },
  { id: "t6", title: "Grid Horizon", prompt: "retro synthwave, arpeggios, gated reverb drums, neon", cover: "assets/cover-synthwave.jpg", genres: ["synthwave"], moods: ["driving"], vocal: "instrumental", seconds: 160, plays: 1780, likes: 205, lufs: -11.0, tp: -1.0, bpm: 118 },
  { id: "t7", title: "Copper and Cedar", prompt: "Anatolian acoustic, bağlama and frame drum, warm sunset", cover: "assets/cover-turkish-acoustic.jpg", genres: ["turkish_folk"], moods: ["warm"], vocal: "female", seconds: 150, plays: 398, likes: 54, lufs: -14.0, tp: -1.0, bpm: 92 },
  { id: "t8", title: "Obsidian Nocturne", prompt: "solo classical piano, minimalist, long sustain, quiet", cover: "assets/cover-classical-piano.jpg", genres: ["classical_piano"], moods: ["melancholic"], vocal: "instrumental", seconds: 168, plays: 871, likes: 129, lufs: -16.0, tp: -1.0, bpm: 72 },
]);
