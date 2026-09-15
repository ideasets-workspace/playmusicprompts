/**
 * js/world/world.js — THE WORLD: the homepage IS a 3D scene (Berk, 2026-09-09 11:05:
 * "neden 3d animasyon yapmıyorsun … three.js ile en ileri seviyede"). Reference behaviour: the
 * overworldaudio.com pattern he sent first — "Drag or scroll to navigate. Click markers to explore."
 *
 * One full-viewport WebGL canvas is fixed behind the page. SCROLL does not scroll a document — it
 * moves the CAMERA along a spline through four stations; the HTML panels for each station fade in
 * when the camera arrives. DRAG rotates the world. CLICK on a floating cover plays that track.
 *
 *   station 0  SOURCE     — the glass composer core inside the particle field (the prompt speaks to it)
 *   station 1  COMPOSING  — a tunnel of particle rings the camera flies through (labour shown)
 *   station 2  NOW        — the frequency terrain (what is playing, as a landscape)
 *   station 3  CATALOGUE  — covers floating as 3D planes in an arc; raycast click → play
 *
 * Post: bloom + film grain/vignette (ShaderPass). Beat/energy envelopes drive everything;
 * production hooks setEnergy/setBeat/pushSpectrum are the same as scene3d.js.
 * Reduced motion: camera still moves with scroll (user-driven), idle animation is frozen.
 */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { SCENE3D, WORLD } from "../constants.js";
import { ParticleField } from "../fx/particle-field.js";
import { Ribbons, ComposerCore } from "../fx/ribbons-and-core.js";
import { TerrainMesh } from "./terrain-mesh.js";
import { CoverGallery } from "./cover-gallery.js";
import { ParticleTunnel } from "./particle-tunnel.js";
import { RadioDial } from "./radio-dial.js";

const GRAIN = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uAmount: { value: WORLD.grainAmount }, uVignette: { value: WORLD.vignette } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uAmount, uVignette; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uTime) * 43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv); float g = (hash(vUv * 1000.0) - 0.5) * uAmount; vec2 d = vUv - 0.5; float v = 1.0 - dot(d, d) * uVignette; gl_FragColor = vec4((c.rgb + g) * v, c.a); }`,
};

export class WorldScene {
  /** @param {HTMLElement} mount fixed full-viewport element  @param {{tracks:Array, onPlay:(t)=>void, onTune?:(radio)=>void}} opts */
  constructor(mount, { tracks, onPlay, onTune }) {
    this.mount = mount; this.tracks = tracks; this.onPlay = onPlay; this.onTune = onTune;
    this.pulseHz = SCENE3D.pulseHz; this.tint = new THREE.Color(1, 1, 1); this.radio = null;
    this.progress = 0; this.progressTarget = 0; this.station = 0;
    this.dragRot = 0; this.dragRotTarget = 0; this.dragging = false; this.lastX = 0;
    this.pointer = new THREE.Vector2(); this.pointerTarget = new THREE.Vector2(); this.ndc = new THREE.Vector2();
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.clock = new THREE.Clock(); this.disposed = false; this.listeners = new Set();
    try { this.#build(); } catch (e) { console.warn("WorldScene: WebGL unavailable", e); this.mount.dataset.webgl = "unavailable"; return; }
    this.#bind(); this.#loop();
  }

  #build() {
    const w = innerWidth, h = innerHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); this.renderer.setSize(w, h, false);
    this.renderer.setClearColor(0x050308, 1); this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.1;
    this.renderer.domElement.setAttribute("aria-hidden", "true"); this.mount.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene(); this.scene.fog = new THREE.FogExp2(0x050308, WORLD.fogDensity);
    this.camera = new THREE.PerspectiveCamera(WORLD.cameraFov, w / h, 0.1, 300);
    this.world = new THREE.Group(); this.scene.add(this.world);

    // camera path through the stations (world units); stations are laid out along -Z
    this.path = new THREE.CatmullRomCurve3(WORLD.cameraPath.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.6);
    this.lookPath = new THREE.CatmullRomCurve3(WORLD.lookPath.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.6);

    // station 0: field + ribbons + core
    this.field = new ParticleField(); this.world.add(this.field.object3d);
    this.ribbons = new Ribbons(); this.ribbons.object3d.position.z = WORLD.stationZ[0]; this.world.add(this.ribbons.object3d);
    this.core = new ComposerCore(); this.core.object3d.position.set(0, 1.2, WORLD.stationZ[0]); this.world.add(this.core.object3d);
    // station 1: tunnel
    this.tunnel = new ParticleTunnel(WORLD.stationZ[1]); this.world.add(this.tunnel.object3d);
    // station 2: terrain
    this.terrain = new TerrainMesh(); this.terrain.object3d.position.set(0, -2.2, WORLD.stationZ[2]); this.world.add(this.terrain.object3d);
    // station 3: gallery
    this.gallery = new CoverGallery(this.tracks, WORLD.stationZ[3]); this.world.add(this.gallery.object3d);
    // station 4: radio dial — tuning shifts the whole world's palette and tempo
    this.dial = new RadioDial(WORLD.stationZ[4], { onTune: (radio) => this.#tune(radio) }); this.world.add(this.dial.object3d);

    this.scene.add(new THREE.AmbientLight(0x2a1650, 0.7));
    const key = new THREE.PointLight(SCENE3D.colors.near, 80, 60); key.position.set(-8, 8, 6); this.scene.add(key);
    const rim = new THREE.PointLight(SCENE3D.colors.mid, 60, 60); rim.position.set(8, -2, 0); this.scene.add(rim);
    const far = new THREE.PointLight(SCENE3D.colors.far, 40, 80); far.position.set(0, 4, WORLD.stationZ[3]); this.scene.add(far);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), SCENE3D.bloomStrength, SCENE3D.bloomRadius, SCENE3D.bloomThreshold); this.composer.addPass(this.bloom);
    this.grain = new ShaderPass(GRAIN); this.composer.addPass(this.grain);
    this.composer.addPass(new OutputPass());
    this.raycaster = new THREE.Raycaster();
  }

  #bind() {
    // wheel / touch scroll → progress (the page itself does not scroll; see world/index.html).
    // Listened on window so panels floating over the canvas do not swallow the gesture.
    window.addEventListener("wheel", (e) => { if (/textarea/i.test(e.target?.tagName ?? "")) return; e.preventDefault(); this.progressTarget = THREE.MathUtils.clamp(this.progressTarget + e.deltaY * WORLD.wheelSensitivity, 0, 1); }, { passive: false });
    let touchY = 0;
    this.mount.addEventListener("touchstart", (e) => { touchY = e.touches[0].clientY; this.lastX = e.touches[0].clientX; }, { passive: true });
    this.mount.addEventListener("touchmove", (e) => { const t = e.touches[0]; this.progressTarget = THREE.MathUtils.clamp(this.progressTarget + (touchY - t.clientY) * WORLD.touchSensitivity, 0, 1); touchY = t.clientY; this.dragRotTarget += (t.clientX - this.lastX) * WORLD.dragSensitivity; this.lastX = t.clientX; }, { passive: true });
    // drag → rotate the world
    this.mount.addEventListener("pointerdown", (e) => { this.dragging = true; this.lastX = e.clientX; this.downAt = performance.now(); this.mount.classList.add("is-dragging"); });
    window.addEventListener("pointerup", (e) => { if (this.dragging && performance.now() - this.downAt < 220) this.#click(e); this.dragging = false; this.mount.classList.remove("is-dragging"); });
    window.addEventListener("pointermove", (e) => {
      this.pointerTarget.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      if (this.dragging) {
        const d = (e.clientX - this.lastX) * WORLD.dragSensitivity; this.lastX = e.clientX;
        // at the dial station a drag TUNES (turns the dial); elsewhere it turns the world
        if (this.station === WORLD.stationZ.length - 1) this.dial.turn(d); else this.dragRotTarget += d;
      }
    }, { passive: true });
    // keyboard: arrows / page keys move between stations (SC 2.1.1)
    window.addEventListener("keydown", (e) => {
      if (/input|textarea/i.test(document.activeElement?.tagName ?? "")) return;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); this.goTo(this.station + 1); }
      if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); this.goTo(this.station - 1); }
    });
    addEventListener("resize", () => { const w = innerWidth, h = innerHeight; this.renderer.setSize(w, h, false); this.composer.setSize(w, h); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); });
    document.addEventListener("visibilitychange", () => { document.hidden ? this.clock.stop() : this.clock.start(); });
  }

  /** Jump the camera to a station (0..4); used by the station dots and keyboard. */
  goTo(i) { const n = WORLD.stationZ.length; const k = THREE.MathUtils.clamp(i, 0, n - 1); this.progressTarget = k / (n - 1); }
  /** Tune a radio by index from the UI (station panel buttons / the home "radio" chips). */
  tuneRadio(i) { this.goTo(WORLD.stationZ.length - 1); this.dial.snapTo(i); }
  onStation(fn) { this.listeners.add(fn); }
  setEnergy(e) { this.energy = e; } setBeat(b) { this.beatOverride = b; } setPlaying(p) { this.playing = p; }

  #tune(radio) {
    this.radio = radio; this.pulseHz = radio.bpm / 60; this.tintTarget = new THREE.Color(radio.hue);
    this.onTune?.(radio);
  }

  #click(e) {
    this.ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const orb = this.dial.pick(this.raycaster);
    if (orb) { this.dial.snapTo(orb.i); return; }
    const hit = this.gallery.pick(this.raycaster);
    if (hit) { this.gallery.select(hit.track); this.onPlay?.(hit.track); }
  }

  #envelope(t) {
    const phase = (t * this.pulseHz) % 1;
    const beat = this.beatOverride ?? Math.exp(-phase * 6);
    const energy = this.energy ?? (0.55 + 0.3 * Math.sin(t * 0.7) * Math.sin(t * 0.23));
    return { beat, energy };
  }

  #update(t, dt) {
    const { beat, energy } = this.#envelope(t);
    // time-based smoothing: identical feel at 30 or 144 fps (factor = 1 - e^(-rate·dt))
    const k = 1 - Math.exp(-dt * WORLD.smoothingRatePerSec);
    this.progress += (this.progressTarget - this.progress) * k;
    this.dragRot += (this.dragRotTarget - this.dragRot) * k * 1.3;
    this.pointer.lerp(this.pointerTarget, k);

    // camera along the spline; slight pointer parallax; drag rotates the world about the path
    const p = this.path.getPointAt(this.progress), look = this.lookPath.getPointAt(this.progress);
    this.camera.position.set(p.x + this.pointer.x * 0.6, p.y + this.pointer.y * 0.4, p.z);
    this.camera.lookAt(look);
    this.world.rotation.y = this.dragRot;

    const station = Math.round(this.progress * (WORLD.stationZ.length - 1));
    if (station !== this.station) { this.station = station; this.listeners.forEach((fn) => fn(station, this.progress)); }
    const idle = this.reduced ? 0 : 1;
    this.field.update(t * idle, energy, beat);
    this.ribbons.update(t * idle, energy, beat);
    this.core.update(t * idle, energy, beat);
    this.tunnel.update(t * idle, energy, beat, this.progress);
    this.terrain.update(t, dt * idle, energy);
    this.gallery.update(t * idle, this.camera, beat);
    this.dial.update(t * idle, dt, beat, this.camera, this.station === WORLD.stationZ.length - 1 && Math.abs(this.progressTarget - this.progress) < 0.02);
    // palette follows the tuned radio (or drifts back to neutral when none)
    if (this.tintTarget) { this.tint.lerp(this.tintTarget, k * 0.6); this.field.tintToward(this.tintTarget, k * 0.6); this.core.material.emissive.lerp(this.tintTarget, k * 0.6); this.scene.fog.color.lerp(new THREE.Color(this.tintTarget).multiplyScalar(0.06), k * 0.6); }
    this.bloom.strength = SCENE3D.bloomStrength + beat * 0.45;
    this.grain.uniforms.uTime.value = t;
    this.mount.style.setProperty("--progress", this.progress.toFixed(4));
  }

  #loop() { const tick = () => { if (this.disposed) return; const dt = Math.min(0.05, this.clock.getDelta()); this.#update(this.clock.elapsedTime, dt); this.composer.render(); requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
  dispose() { this.disposed = true; this.renderer?.dispose(); this.renderer?.domElement.remove(); }
}
