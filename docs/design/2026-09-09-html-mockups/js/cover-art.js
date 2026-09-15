/**
 * js/cover-art.js — procedural cover art: every track gets a unique "sound field" image
 * rendered by OUR OWN canvas code from the track's measured properties (bpm, loudness,
 * duration, genre seed). Nothing here is a stock image or a grey placeholder.
 *
 * WHY THIS EXISTS (measured 2026-09-09, tools/probe-endpoint.mjs): all 13 image providers of
 * the Ideasets asset API were unavailable in this session — the Vertex worker crashes server-
 * side; OpenAI, fal.ai (flux/ideogram/recraft/nano/qwen/seedream), Stability, Luma, Kling and
 * Runway all report exhausted credits (billing is Berk's decision). The one Runway image that
 * did complete is the hero (assets/hero-sound-field.jpg). Rule 23 §5: a failed generation is
 * reported as failed, never silently replaced — this module is the reported, labelled interim,
 * AND a product proposal in its own right: a generated track can carry its own sound field as
 * cover, derived from its real beat grid and loudness envelope at integration time.
 *
 * Deterministic: the same track always renders the same cover (seeded PRNG).
 */
import { BRAND } from "./constants.js";

const PALETTES = [
  [BRAND.violet, BRAND.magenta, BRAND.cyan],
  [BRAND.cobalt, BRAND.ultraviolet, BRAND.magenta],
  [BRAND.azure, BRAND.cyan, BRAND.violet],
  [BRAND.magenta, BRAND.fuchsia, BRAND.ultraviolet],
];

function hex(n, a = 1) { return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
function prng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function seedOf(track) { let h = 2166136261; for (const ch of track.id + track.title) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

export class CoverArt {
  static cache = new Map();

  /** @returns {string} a data URL (PNG) for the track's cover */
  static src(track, size = 512) {
    const key = `${track.id}:${size}`;
    if (this.cache.has(key)) return this.cache.get(key);
    const url = this.#render(track, size);
    this.cache.set(key, url);
    return url;
  }

  static #render(track, size) {
    const c = document.createElement("canvas"); c.width = c.height = size;
    const ctx = c.getContext("2d");
    const rnd = prng(seedOf(track));
    const pal = PALETTES[Math.floor(rnd() * PALETTES.length)];
    const energy = Math.min(1, Math.max(0.2, (track.lufs + 20) / 12));   // −16 LUFS → .33, −9 → .9
    const tempo = (track.bpm ?? 100) / 160;

    // base: near-black with a soft radial glow in the palette's first hue
    ctx.fillStyle = "#050308"; ctx.fillRect(0, 0, size, size);
    const g = ctx.createRadialGradient(size * (0.35 + rnd() * 0.3), size * (0.35 + rnd() * 0.3), 0, size / 2, size / 2, size * 0.75);
    g.addColorStop(0, hex(pal[0], 0.55)); g.addColorStop(0.6, hex(pal[1], 0.12)); g.addColorStop(1, "rgba(5,3,8,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);

    // rings: count from tempo, jitter from energy (the FieldStop language)
    ctx.globalCompositeOperation = "lighter";
    const rings = 6 + Math.round(tempo * 8);
    for (let r = 0; r < rings; r++) {
      const radius = size * (0.08 + (r / rings) * 0.42);
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.02) {
        const wob = 1 + Math.sin(a * (3 + r % 4) + r) * 0.035 * energy + (rnd() - 0.5) * 0.004;
        const x = size / 2 + Math.cos(a) * radius * wob, y = size / 2 + Math.sin(a) * radius * wob;
        a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = hex(pal[r % 3], 0.16 + 0.5 * (1 - r / rings));
      ctx.lineWidth = 1 + (1 - r / rings) * 3 * energy;
      ctx.shadowColor = hex(pal[r % 3], 0.8); ctx.shadowBlur = 14 * energy;
      ctx.stroke();
    }

    // ribbon: one luminous waveform sweep (duration decides the wavelength)
    ctx.shadowBlur = 24; ctx.shadowColor = hex(pal[1], 0.9);
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, hex(pal[0], 0.95)); grad.addColorStop(0.5, hex(pal[1], 0.95)); grad.addColorStop(1, hex(pal[2], 0.95));
    ctx.strokeStyle = grad; ctx.lineWidth = 3 + energy * 4; ctx.lineCap = "round";
    const waves = 2 + ((track.seconds ?? 120) / 60);
    const yBase = size * (0.4 + rnd() * 0.2), amp = size * 0.08 * (0.6 + energy);
    for (let pass = 0; pass < 3; pass++) {
      ctx.beginPath();
      for (let x = -size * 0.1; x <= size * 1.1; x += 4) {
        const u = x / size;
        const y = yBase + Math.sin(u * Math.PI * waves + pass * 0.7) * amp * (1 - pass * 0.25) + Math.sin(u * 11 + pass) * amp * 0.2;
        x <= -size * 0.1 + 4 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.globalAlpha = 1 - pass * 0.3; ctx.lineWidth = (3 + energy * 4) * (1 - pass * 0.3);
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; ctx.shadowBlur = 0;

    // fine grain so it reads as a rendered object, not a vector
    const img = ctx.getImageData(0, 0, size, size), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 10; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL("image/png");
  }
}
