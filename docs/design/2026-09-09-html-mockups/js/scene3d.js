/**
 * js/scene3d.js — the interactive 3D "sound field" (hero, auth pane, stage variants).
 *
 * Upgrade of 2026-09-09 10:5x on Berk's review ("3d effectler yok, çok daha ilerisini yap"):
 *   - UnrealBloomPass post-processing → real neon glow (the look of both reference images)
 *   - 22k-point GPU particle field (js/fx/particle-field.js, custom shader)
 *   - three luminous ribbons + an iridescent glass torus-knot core (js/fx/ribbons-and-core.js)
 *   - camera choreography: slow orbit + pointer parallax + SCROLL parallax (the field sinks
 *     and tilts as the page scrolls, so the hero feels like a place you leave, not a banner)
 *   - beat + energy envelopes drive every object (production: AnalyserNode / beat grid —
 *     `setEnergy()` / `setBeat()`; mockup: time envelope, stated in README §Honesty)
 *
 * Imports use the bare "three" specifier resolved by an <script type="importmap"> in each page
 * (three r185.1 + examples/jsm addons on jsdelivr, verified HTTP 200 this session).
 *
 * Accessibility: prefers-reduced-motion → ONE static frame (a designed alternative, never a
 * deletion); canvas aria-hidden; the semantic DOM beneath carries all meaning. WebGL failure →
 * the CSS still image (assets/hero-sound-field.jpg) remains and nothing else breaks.
 */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { SCENE3D } from "./constants.js";
import { ParticleField } from "./fx/particle-field.js";
import { Ribbons, ComposerCore } from "./fx/ribbons-and-core.js";

export class SoundFieldScene {
  /**
   * @param {HTMLElement} mount  element that receives the canvas
   * @param {{playing?:boolean, intensity?:number, core?:boolean, scroll?:boolean}} opts
   */
  constructor(mount, { playing = true, intensity = 1, core = true, scroll = true } = {}) {
    this.mount = mount; this.playing = playing; this.intensity = intensity; this.withCore = core; this.withScroll = scroll;
    this.energy = 0.55; this.beatOverride = null;
    this.pointer = new THREE.Vector2(); this.pointerTarget = new THREE.Vector2();
    this.scrollY = 0;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.clock = new THREE.Clock(); this.disposed = false;
    try { this.#build(); } catch (err) { console.warn("SoundFieldScene: WebGL unavailable — CSS still stays", err); return; }
    this.#bind();
    this.reduced && SCENE3D.reducedMotionStaticFrame ? this.#renderOnce() : this.#loop();
  }

  #build() {
    const { width, height } = this.mount.getBoundingClientRect();
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    this.mount.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050308, 0.045);
    this.camera = new THREE.PerspectiveCamera(SCENE3D.cameraFov, width / height, 0.1, 120);
    this.camera.position.set(0, 1.4, SCENE3D.cameraZ);

    this.group = new THREE.Group(); this.group.rotation.x = -0.42; this.scene.add(this.group);
    this.field = new ParticleField(); this.group.add(this.field.object3d);
    this.ribbons = new Ribbons(); this.group.add(this.ribbons.object3d);
    if (this.withCore) { this.core = new ComposerCore(); this.group.add(this.core.object3d); }

    // lights for the glass core and the ribbons' standard material
    this.scene.add(new THREE.AmbientLight(0x2a1650, 0.6));
    const key = new THREE.PointLight(SCENE3D.colors.near, 60, 40); key.position.set(-6, 6, 5); this.scene.add(key);
    const rim = new THREE.PointLight(SCENE3D.colors.mid, 40, 40); rim.position.set(6, -2, 4); this.scene.add(rim);
    const fill = new THREE.PointLight(SCENE3D.colors.far, 25, 40); fill.position.set(0, 3, -8); this.scene.add(fill);

    // post-processing: render → bloom → output (sRGB + tone map)
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(width, height), SCENE3D.bloomStrength, SCENE3D.bloomRadius, SCENE3D.bloomThreshold);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
  }

  #bind() {
    const onMove = (x, y) => { const r = this.mount.getBoundingClientRect(); this.pointerTarget.set(((x - r.left) / r.width) * 2 - 1, -(((y - r.top) / r.height) * 2 - 1)); };
    window.addEventListener("pointermove", (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener("touchmove", (e) => { const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); }, { passive: true });
    if (this.withScroll) window.addEventListener("scroll", () => { this.scrollY = window.scrollY / Math.max(1, window.innerHeight); }, { passive: true });
    this.resizeObserver = new ResizeObserver(() => {
      const { width, height } = this.mount.getBoundingClientRect(); if (!width || !height) return;
      this.renderer.setSize(width, height, false); this.composer.setSize(width, height);
      this.camera.aspect = width / height; this.camera.updateProjectionMatrix();
      if (this.reduced) this.#renderOnce();
    });
    this.resizeObserver.observe(this.mount);
    document.addEventListener("visibilitychange", () => { document.hidden ? this.clock.stop() : this.clock.start(); });
  }

  /** Production hooks. */
  setEnergy(e) { this.energy = Math.min(1, Math.max(0, e)); }
  setBeat(b) { this.beatOverride = Math.min(1, Math.max(0, b)); }
  setPlaying(p) { this.playing = p; }

  #envelope(t) {
    // demo beat: sharp attack, exponential decay at pulseHz (production: setBeat from the grid)
    const phase = (t * SCENE3D.pulseHz) % 1;
    const beat = this.beatOverride ?? (this.playing ? Math.exp(-phase * 6) : 0.05);
    const energy = (this.playing ? 0.45 + 0.35 * Math.sin(t * 0.7) * Math.sin(t * 0.23) : 0.2) * this.energy * this.intensity;
    return { beat, energy: Math.max(0.05, Math.min(1, energy + 0.5 * this.intensity - 0.5)) };
  }

  #update(t, dt) {
    const { beat, energy } = this.#envelope(t);
    this.pointer.lerp(this.pointerTarget, SCENE3D.pointerLerp);
    this.group.rotation.y += SCENE3D.idleRotationRadPerSec * dt + this.pointer.x * 0.0012;
    this.group.rotation.x = -0.42 + this.pointer.y * 0.16 - this.scrollY * 0.35;
    this.camera.position.x = this.pointer.x * SCENE3D.parallaxX * 0.3;
    this.camera.position.y = 1.4 + this.pointer.y * SCENE3D.parallaxY * 0.3 + this.scrollY * SCENE3D.scrollParallax;
    this.camera.position.z = SCENE3D.cameraZ - this.scrollY * 1.2;
    this.camera.lookAt(0, 0.4 - this.scrollY * 1.5, 0);
    this.field.update(t, energy, beat);
    this.ribbons.update(t, energy, beat);
    this.core?.update(t, energy, beat);
    this.bloom.strength = SCENE3D.bloomStrength + beat * 0.5;
  }

  #renderOnce() { this.#update(1.7, 0); this.composer.render(); }
  #loop() {
    const tick = () => { if (this.disposed) return; const dt = Math.min(0.05, this.clock.getDelta()); this.#update(this.clock.elapsedTime, dt); this.composer.render(); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  dispose() { this.disposed = true; this.resizeObserver?.disconnect(); this.field?.dispose(); this.renderer?.dispose(); this.renderer?.domElement.remove(); }
}
