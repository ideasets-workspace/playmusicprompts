/**
 * js/fx/particle-field.js — 22,000-point GPU particle field with a custom ShaderMaterial.
 *
 * Each point is a soft additive disc whose size falls off with depth; its radius breathes with
 * an audio "energy" uniform and a per-particle phase, so the whole disc of particles pulses like
 * a ring of speakers. Colour is interpolated across three brand hues by radius (near→mid→far).
 * Runs entirely on the GPU: JS touches no per-particle data after construction.
 *
 * Production hook: `setEnergy(0..1)` per frame from the AnalyserNode RMS; `setBeat(0..1)` on
 * each beat from the server beat grid. In the mockup both come from the time envelope in
 * scene3d.js (no backend by Berk's order — stated in README §Honesty).
 */
import * as THREE from "three";
import { SCENE3D } from "../constants.js";

const VERT = /* glsl */`
  uniform float uTime; uniform float uEnergy; uniform float uBeat; uniform float uSize; uniform float uPixelRatio;
  attribute float aPhase; attribute float aRadius; attribute vec3 aColor;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    vec3 p = position;
    // radial breathing: rings expand on the beat, staggered by radius
    float wave = sin(uTime * 2.4 - aRadius * 1.9 + aPhase) * 0.5 + 0.5;
    float grow = 1.0 + (0.035 + 0.09 * uEnergy) * wave + uBeat * 0.08 * exp(-aRadius * 0.25);
    p.xz *= grow;
    p.y += sin(uTime * 1.3 + aPhase * 6.2831 + aRadius * 2.0) * (0.04 + 0.10 * uEnergy);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depthSize = uSize * uPixelRatio / max(1.0, -mv.z);
    gl_PointSize = depthSize * (0.6 + 0.6 * wave + 0.5 * uBeat);
    vColor = aColor;
    vAlpha = 0.35 + 0.65 * wave;
  }`;

const FRAG = /* glsl */`
  uniform vec3 uTint;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);          // soft disc
    float hot = smoothstep(0.18, 0.0, d);          // bright centre for bloom to pick up
    // uTint: the tuned radio's hue, blended 55 % over the ring colours (1,1,1 = neutral)
    vec3 col = mix(vColor, vColor * 0.4 + uTint * 0.8, 0.55 * (1.0 - step(2.99, uTint.r + uTint.g + uTint.b)));
    gl_FragColor = vec4(col * (0.55 + 0.9 * hot), core * vAlpha);
  }`;

export class ParticleField {
  constructor() {
    const n = SCENE3D.particleCount;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), phase = new Float32Array(n), rad = new Float32Array(n);
    const near = new THREE.Color(SCENE3D.colors.near), mid = new THREE.Color(SCENE3D.colors.mid), far = new THREE.Color(SCENE3D.colors.far);
    for (let i = 0; i < n; i++) {
      // disc distribution with denser centre (sqrt bias) and a slight spiral so rings read as motion
      const r = Math.sqrt(Math.random()) * SCENE3D.fieldRadius;
      const a = Math.random() * Math.PI * 2 + r * 0.35;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * SCENE3D.fieldThickness * (0.4 + r / SCENE3D.fieldRadius);
      pos[i * 3 + 2] = Math.sin(a) * r;
      const t = r / SCENE3D.fieldRadius;
      const c = t < 0.5 ? near.clone().lerp(mid, t * 2) : mid.clone().lerp(far, (t - 0.5) * 2);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      phase[i] = Math.random(); rad[i] = r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    geo.setAttribute("aRadius", new THREE.BufferAttribute(rad, 1));
    this.uniforms = { uTime: { value: 0 }, uEnergy: { value: 0.5 }, uBeat: { value: 0 }, uSize: { value: SCENE3D.particleSizePx }, uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) }, uTint: { value: new THREE.Color(1, 1, 1) } };
    const mat = new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
  }
  get object3d() { return this.points; }
  update(t, energy, beat) { this.uniforms.uTime.value = t; this.uniforms.uEnergy.value = energy; this.uniforms.uBeat.value = beat; }
  /** Radio palette shift: lerp the tint toward a hue (or toward neutral white). */
  tintToward(color, k) { this.uniforms.uTint.value.lerp(color, k); }
  dispose() { this.points.geometry.dispose(); this.points.material.dispose(); }
}
