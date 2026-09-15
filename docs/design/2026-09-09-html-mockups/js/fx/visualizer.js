/**
 * js/fx/visualizer.js — the now-playing stage: a frequency TERRAIN that rolls toward the
 * camera. Each row is one frame of spectrum (VISUALIZER.columns bins); rows shift back one
 * step per tick so the surface is a scrolling history of the sound, lit by bloom. Wireframe
 * + vertex colours by height (brand hues), reflected in a dark "floor" plane.
 *
 * Production: `pushSpectrum(Uint8Array)` every frame from AnalyserNode.getByteFrequencyData.
 * Mockup: a synthesized spectrum (bass-heavy, beat-locked) from the same time envelope.
 */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { VISUALIZER, SCENE3D } from "../constants.js";

export class FrequencyTerrain {
  constructor(mount, { bpm = 100 } = {}) {
    this.mount = mount; this.bpm = bpm; this.disposed = false;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.clock = new THREE.Clock(); this.acc = 0;
    this.pointer = new THREE.Vector2(); this.pointerTarget = new THREE.Vector2();
    try { this.#build(); } catch (e) { console.warn("FrequencyTerrain: WebGL unavailable", e); return; }
    this.#bind();
    this.reduced ? this.#renderOnce() : this.#loop();
  }
  #build() {
    const { width, height } = this.mount.getBoundingClientRect();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); this.renderer.setSize(width, height, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.domElement.setAttribute("aria-hidden", "true"); this.mount.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene(); this.scene.fog = new THREE.FogExp2(0x050308, 0.06);
    this.camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    this.camera.position.set(0, 5.2, 11); this.camera.lookAt(0, 0.5, 0);

    const { columns: C, rows: R, cellSize: S } = VISUALIZER;
    const geo = new THREE.PlaneGeometry(C * S, R * S, C - 1, R - 1); geo.rotateX(-Math.PI / 2);
    const colors = new Float32Array(geo.attributes.position.count * 3);
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.heights = new Float32Array(C * R);
    this.mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, wireframe: true, transparent: true, opacity: 0.95 }));
    this.scene.add(this.mesh);
    // dark reflective floor gives the terrain a horizon
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x050308, roughness: 0.25, metalness: 0.8 }));
    floor.rotateX(-Math.PI / 2); floor.position.y = -0.02; this.scene.add(floor);
    this.scene.add(new THREE.PointLight(SCENE3D.colors.mid, 30, 40).translateY(6));

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 1.2, 0.5, 0.1); this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.near = new THREE.Color(SCENE3D.colors.near); this.mid = new THREE.Color(SCENE3D.colors.mid); this.far = new THREE.Color(SCENE3D.colors.far);
  }
  #bind() {
    window.addEventListener("pointermove", (e) => { const r = this.mount.getBoundingClientRect(); this.pointerTarget.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)); }, { passive: true });
    this.resizeObserver = new ResizeObserver(() => { const { width, height } = this.mount.getBoundingClientRect(); if (!width || !height) return; this.renderer.setSize(width, height, false); this.composer.setSize(width, height); this.camera.aspect = width / height; this.camera.updateProjectionMatrix(); if (this.reduced) this.#renderOnce(); });
    this.resizeObserver.observe(this.mount);
  }
  /** Production: feed real bins here. */
  pushSpectrum(bins) {
    const { columns: C, rows: R } = VISUALIZER;
    this.heights.copyWithin(C, 0, C * (R - 1));           // shift rows back by one
    for (let c = 0; c < C; c++) this.heights[c] = (bins[Math.floor((c / C) * bins.length)] ?? 0) / 255;
  }
  #demoSpectrum(t) {
    const bins = new Uint8Array(VISUALIZER.demoBins);
    const beat = Math.exp(-(((t * this.bpm) / 60) % 1) * 5);
    for (let i = 0; i < bins.length; i++) {
      const f = i / bins.length;
      const bass = Math.exp(-f * 9) * (0.55 + 0.45 * beat);
      const mids = Math.exp(-Math.pow((f - 0.3) * 6, 2)) * (0.35 + 0.25 * Math.sin(t * 2.1 + i * 0.3));
      const air = Math.exp(-Math.pow((f - 0.7) * 5, 2)) * 0.2 * (0.5 + 0.5 * Math.sin(t * 5 + i));
      bins[i] = Math.min(255, (bass + mids + air + (Math.random() * 0.05)) * 255);
    }
    return bins;
  }
  #apply() {
    const { columns: C, rows: R, heightScale } = VISUALIZER;
    const pos = this.mesh.geometry.attributes.position, col = this.mesh.geometry.attributes.color;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const i = r * C + c, h = this.heights[i], depthFade = 1 - r / R;
      pos.setY(i, h * heightScale * (0.35 + 0.65 * depthFade));
      const k = Math.min(1, h * 1.6);
      const color = k < 0.5 ? this.near.clone().lerp(this.mid, k * 2) : this.mid.clone().lerp(this.far, (k - 0.5) * 2);
      col.setXYZ(i, color.r * (0.35 + 0.65 * depthFade), color.g * (0.35 + 0.65 * depthFade), color.b * (0.35 + 0.65 * depthFade));
    }
    pos.needsUpdate = true; col.needsUpdate = true;
  }
  #update(t, dt) {
    this.acc += dt * VISUALIZER.speedRowsPerSec;
    while (this.acc >= 1) { this.pushSpectrum(this.#demoSpectrum(t)); this.acc -= 1; }
    this.#apply();
    this.pointer.lerp(this.pointerTarget, 0.05);
    this.camera.position.x = this.pointer.x * 2.2; this.camera.position.y = 5.2 + this.pointer.y * 1.2; this.camera.lookAt(0, 0.5, 0);
  }
  #renderOnce() { for (let i = 0; i < VISUALIZER.rows; i++) this.pushSpectrum(this.#demoSpectrum(i * 0.07)); this.#apply(); this.composer.render(); }
  #loop() { const tick = () => { if (this.disposed) return; const dt = Math.min(0.05, this.clock.getDelta()); this.#update(this.clock.elapsedTime, dt); this.composer.render(); requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
  dispose() { this.disposed = true; this.resizeObserver?.disconnect(); this.renderer?.dispose(); this.renderer?.domElement.remove(); }
}
