/**
 * js/fx/motion.js — DOM-side motion: 3D tilt + glare on cards, staggered entrance reveals,
 * and a spinning 3D "orb" cover in the player bar.
 *
 *   TiltCard   — perspective tilt following the pointer (TILT.maxDeg), a moving specular glare
 *                layer, lerped so it never snaps; resets on leave. Touch: no tilt (no hover).
 *   Reveal     — IntersectionObserver-driven entrance (opacity + translateY + blur), staggered
 *                per sibling via --i; honours prefers-reduced-motion (renders final state).
 *   PlayerOrb  — the player-bar cover becomes a slowly rotating 3D disc with a conic sheen and
 *                a beat-locked ring; pure CSS transforms driven from rAF (no WebGL needed here).
 */
import { TILT } from "../constants.js";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export class TiltCard {
  static attachAll(selector) { if (matchMedia("(hover: none)").matches || reduced) return []; return [...document.querySelectorAll(selector)].map((el) => new TiltCard(el)); }
  constructor(el) {
    this.el = el; this.rx = 0; this.ry = 0; this.tx = 0; this.ty = 0; this.raf = 0;
    el.style.transformStyle = "preserve-3d"; el.style.willChange = "transform";
    if (TILT.glare) { this.glare = document.createElement("span"); this.glare.className = "tilt-glare"; this.glare.setAttribute("aria-hidden", "true"); el.appendChild(this.glare); }
    el.addEventListener("pointermove", (e) => this.#move(e)); el.addEventListener("pointerleave", () => this.#leave());
  }
  #move(e) {
    const r = this.el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    this.ty = -px * TILT.maxDeg * 2; this.tx = py * TILT.maxDeg * 2;
    if (this.glare) { this.glare.style.setProperty("--gx", `${(px + 0.5) * 100}%`); this.glare.style.setProperty("--gy", `${(py + 0.5) * 100}%`); this.glare.style.opacity = "1"; }
    this.#animate();
  }
  #leave() { this.tx = 0; this.ty = 0; if (this.glare) this.glare.style.opacity = "0"; this.#animate(); }
  #animate() {
    cancelAnimationFrame(this.raf);
    const step = () => {
      this.rx += (this.tx - this.rx) * TILT.lerp; this.ry += (this.ty - this.ry) * TILT.lerp;
      this.el.style.transform = `perspective(${TILT.perspectivePx}px) rotateX(${this.rx.toFixed(2)}deg) rotateY(${this.ry.toFixed(2)}deg) translateZ(${Math.abs(this.rx) + Math.abs(this.ry) > 0.2 ? 8 : 0}px)`;
      if (Math.abs(this.tx - this.rx) > 0.05 || Math.abs(this.ty - this.ry) > 0.05) this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }
}

export class Reveal {
  static attachAll(selector = "[data-reveal]") {
    const els = [...document.querySelectorAll(selector)];
    if (reduced) { els.forEach((el) => el.classList.add("is-in")); return; }
    els.forEach((el) => { [...el.children].forEach((c, i) => c.style.setProperty("--i", i)); });
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }
}

export class PlayerOrb {
  /** @param {HTMLElement} coverWrap wrapper around the player cover image */
  constructor(coverWrap, { bpm = 100 } = {}) {
    this.el = coverWrap; this.bpm = bpm; this.playing = true; this.t0 = performance.now();
    this.el.classList.add("p-orb");
    this.ring = document.createElement("span"); this.ring.className = "p-orb-ring"; this.ring.setAttribute("aria-hidden", "true"); this.el.appendChild(this.ring);
    this.sheen = document.createElement("span"); this.sheen.className = "p-orb-sheen"; this.sheen.setAttribute("aria-hidden", "true"); this.el.appendChild(this.sheen);
    if (!reduced) requestAnimationFrame(() => this.#tick());
  }
  setPlaying(p) { this.playing = p; }
  #tick() {
    const t = (performance.now() - this.t0) / 1000;
    const beat = this.playing ? Math.exp(-(((t * this.bpm) / 60) % 1) * 6) : 0;
    const spin = this.playing ? t * 18 : 0;
    this.el.style.transform = `perspective(600px) rotateY(${Math.sin(t * 0.6) * 14}deg) rotateX(${Math.cos(t * 0.45) * 8}deg)`;
    this.el.querySelector("img").style.transform = `rotate(${spin}deg) scale(${1 + beat * 0.03})`;
    this.ring.style.transform = `scale(${1 + beat * 0.25})`; this.ring.style.opacity = String(0.9 * beat);
    this.sheen.style.transform = `rotate(${-spin * 0.7}deg)`;
    requestAnimationFrame(() => this.#tick());
  }
}
