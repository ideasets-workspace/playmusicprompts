/**
 * js/player-bar.js — the persistent bottom player bar: waveform scrubber, transport,
 * clock, like/queue/volume. One instance per page; the page passes the track to show.
 *
 * DESIGN SOURCE: Berk's two reference images (2026-09-09): 3-region bar, waveform scrubber
 * (Muzes) chosen over the flat line (Dawn FM) because PMP has real audio data to draw.
 *
 * ACCESSIBILITY: the canvas is decoration; a real <input type="range"> underneath carries
 * the semantics (aria-label, aria-valuetext), arrow keys step PLAYER_CLOCK.keyboardStepSeconds
 * (WCAG 2.2 SC 2.5.7 non-drag alternative), every button is >= 40 px (SC 2.5.8).
 *
 * MOCKUP TRUTH: no <audio> here by Berk's order (design first). The clock advances on a
 * timer and the waveform is a seeded deterministic shape. In production `WaveformPainter`
 * receives the AnalyserNode/beat-grid samples and `PlayerClock` reads audio.currentTime.
 */
import { WAVEFORM, PLAYER_CLOCK, COMPOSER_ATTRIBUTION } from "./constants.js";

/** Mulberry32 — small deterministic PRNG so every review build shows the same waveform. */
function seededRandom(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export class WaveformPainter {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas, seed = WAVEFORM.seed) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.samples = WaveformPainter.buildSeededShape(seed, WAVEFORM.barCount);
    this.progress = 0.35;
    this.hoverX = null;
    this.resizeObserver = new ResizeObserver(() => this.paint());
    this.resizeObserver.observe(canvas);
  }
  /** A musical-looking envelope: slow phrase swells + bar-level accents + noise floor. */
  static buildSeededShape(seed, n) {
    const rnd = seededRandom(seed);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const phrase = 0.55 + 0.45 * Math.sin((i / n) * Math.PI * 3.2 - 0.6);       // long swells
      const bar = (i % 8 === 0) ? 1.0 : (i % 4 === 0 ? 0.82 : 0.62);              // beat accents
      const noise = 0.75 + rnd() * 0.35;
      out[i] = Math.min(1, Math.max(WAVEFORM.minBarRatio, phrase * bar * noise));
    }
    return out;
  }
  setProgress(ratio) { this.progress = Math.min(1, Math.max(0, ratio)); this.paint(); }
  setHover(x) { this.hoverX = x; this.paint(); }
  paint() {
    const { canvas, ctx } = this;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const n = this.samples.length;
    const barW = (w - (n - 1) * WAVEFORM.barGapPx) / n;
    const headX = this.progress * w;
    for (let i = 0; i < n; i++) {
      const x = i * (barW + WAVEFORM.barGapPx);
      const bh = Math.max(2, this.samples[i] * h * 0.92);
      const y = (h - bh) / 2;
      const played = x + barW <= headX;
      const partial = !played && x < headX;
      ctx.fillStyle = played ? WAVEFORM.playedColor : WAVEFORM.aheadColor;
      if (this.hoverX != null && Math.abs(x - this.hoverX) < 6) ctx.fillStyle = WAVEFORM.headColor;
      ctx.beginPath(); ctx.roundRect(x, y, Math.max(1.5, barW), bh, 2); ctx.fill();
      if (partial) { // split the bar the playhead is crossing
        ctx.save(); ctx.beginPath(); ctx.rect(x, 0, headX - x, h); ctx.clip();
        ctx.fillStyle = WAVEFORM.playedColor; ctx.beginPath(); ctx.roundRect(x, y, Math.max(1.5, barW), bh, 2); ctx.fill(); ctx.restore();
      }
    }
    // playhead
    ctx.fillStyle = WAVEFORM.headColor; ctx.fillRect(headX - 1, 2, 2, h - 4);
    ctx.shadowColor = WAVEFORM.playedColor; ctx.shadowBlur = 10; ctx.fillRect(headX - 1, 2, 2, h - 4); ctx.shadowBlur = 0;
  }
}

export class PlayerClock {
  constructor(durationSeconds, onTick) {
    this.duration = durationSeconds; this.current = durationSeconds * 0.35; this.playing = false; this.onTick = onTick; this.timer = null;
  }
  play() { if (this.playing) return; this.playing = true; this.timer = setInterval(() => { this.current = Math.min(this.duration, this.current + PLAYER_CLOCK.tickMs / 1000); if (this.current >= this.duration) this.pause(); this.onTick(this); }, PLAYER_CLOCK.tickMs); this.onTick(this); }
  pause() { this.playing = false; clearInterval(this.timer); this.timer = null; this.onTick(this); }
  toggle() { this.playing ? this.pause() : this.play(); }
  seek(seconds) { this.current = Math.min(this.duration, Math.max(0, seconds)); this.onTick(this); }
  static fmt(s) { const m = Math.floor(s / 60), r = Math.floor(s % 60); return `${m}:${String(r).padStart(2, "0")}`; }
}

export class PlayerBar {
  /** @param {HTMLElement} root the <footer class="player"> */
  constructor(root, track) {
    this.root = root;
    this.track = track;
    this.canvas = root.querySelector("canvas");
    this.range = root.querySelector('input[type="range"][data-role="seek"]');
    this.tCur = root.querySelector("[data-role='t-cur']");
    this.tDur = root.querySelector("[data-role='t-dur']");
    this.painter = new WaveformPainter(this.canvas);
    this.clock = new PlayerClock(track.seconds ?? PLAYER_CLOCK.demoDurationSeconds, (c) => this.render(c));
    this.bindTrack(track);
    this.bindControls();
    this.render(this.clock);
  }
  bindTrack(track) {
    const img = this.root.querySelector(".p-cover");
    if (img) { img.src = track.cover; img.alt = `Cover art for ${track.title}`; }
    const title = this.root.querySelector(".p-title"); if (title) title.textContent = track.title;
    const sub = this.root.querySelector(".p-sub");
    if (sub) sub.innerHTML = `${COMPOSER_ATTRIBUTION} · <span class="live">${track.bpm} BPM measured</span>`;
    this.range.max = String(track.seconds);
  }
  bindControls() {
    this.root.querySelector("[data-action='play']").addEventListener("click", () => this.clock.toggle());
    this.range.addEventListener("input", () => this.clock.seek(Number(this.range.value)));
    this.range.addEventListener("keydown", (e) => {
      const step = PLAYER_CLOCK.keyboardStepSeconds;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); this.clock.seek(this.clock.current + step); }
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); this.clock.seek(this.clock.current - step); }
    });
    this.range.addEventListener("pointermove", (e) => { const r = this.canvas.getBoundingClientRect(); this.painter.setHover(e.clientX - r.left); });
    this.range.addEventListener("pointerleave", () => this.painter.setHover(null));
    const like = this.root.querySelector("[data-action='like']");
    like?.addEventListener("click", () => like.setAttribute("aria-pressed", like.getAttribute("aria-pressed") !== "true"));
    this.root.querySelector("[data-action='next']")?.addEventListener("click", () => this.clock.seek(0));
    this.root.querySelector("[data-action='prev']")?.addEventListener("click", () => this.clock.seek(0));
  }
  render(clock) {
    const ratio = clock.current / clock.duration;
    this.painter.setProgress(ratio);
    this.root.dataset.playing = String(clock.playing);
    this.root.style.setProperty("--progress", `${(ratio * 100).toFixed(2)}%`);
    this.range.value = String(clock.current);
    this.range.setAttribute("aria-valuetext", `${PlayerClock.fmt(clock.current)} of ${PlayerClock.fmt(clock.duration)}`);
    if (this.tCur) this.tCur.textContent = PlayerClock.fmt(clock.current);
    if (this.tDur) this.tDur.textContent = PlayerClock.fmt(clock.duration);
    this.root.querySelector("[data-action='play']").setAttribute("aria-label", clock.playing ? "Pause" : "Play");
  }
}
