/**
 * js/world/terrain-mesh.js — station 2 of THE WORLD: the frequency terrain as a scene object
 * (same algorithm as js/fx/visualizer.js, without its own renderer, so it lives inside the
 * shared world scene). Rows of spectrum roll toward the camera; height → brand colour.
 * Production: pushSpectrum(Uint8Array) from AnalyserNode.getByteFrequencyData every frame.
 */
import * as THREE from "three";
import { VISUALIZER, SCENE3D } from "../constants.js";

export class TerrainMesh {
  constructor({ bpm = 100 } = {}) {
    const { columns: C, rows: R, cellSize: S } = VISUALIZER;
    this.bpm = bpm; this.acc = 0;
    const geo = new THREE.PlaneGeometry(C * S * 1.6, R * S * 1.6, C - 1, R - 1); geo.rotateX(-Math.PI / 2);
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
    this.heights = new Float32Array(C * R);
    this.group = new THREE.Group();
    this.mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, wireframe: true, transparent: true, opacity: 0.95 }));
    this.group.add(this.mesh);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x050308, roughness: 0.2, metalness: 0.85 }));
    floor.rotateX(-Math.PI / 2); floor.position.y = -0.02; this.group.add(floor);
    this.near = new THREE.Color(SCENE3D.colors.near); this.mid = new THREE.Color(SCENE3D.colors.mid); this.far = new THREE.Color(SCENE3D.colors.far);
    for (let i = 0; i < R; i++) this.pushSpectrum(this.#demoSpectrum(i * 0.07));
    this.#apply();
  }
  get object3d() { return this.group; }
  pushSpectrum(bins) { const { columns: C, rows: R } = VISUALIZER; this.heights.copyWithin(C, 0, C * (R - 1)); for (let c = 0; c < C; c++) this.heights[c] = (bins[Math.floor((c / C) * bins.length)] ?? 0) / 255; }
  #demoSpectrum(t) {
    const bins = new Uint8Array(VISUALIZER.demoBins), beat = Math.exp(-(((t * this.bpm) / 60) % 1) * 5);
    for (let i = 0; i < bins.length; i++) { const f = i / bins.length; bins[i] = Math.min(255, (Math.exp(-f * 9) * (0.55 + 0.45 * beat) + Math.exp(-Math.pow((f - 0.3) * 6, 2)) * (0.35 + 0.25 * Math.sin(t * 2.1 + i * 0.3)) + Math.exp(-Math.pow((f - 0.7) * 5, 2)) * 0.2 * (0.5 + 0.5 * Math.sin(t * 5 + i)) + Math.random() * 0.05) * 255); }
    return bins;
  }
  #apply() {
    const { columns: C, rows: R, heightScale } = VISUALIZER, pos = this.mesh.geometry.attributes.position, col = this.mesh.geometry.attributes.color;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const i = r * C + c, h = this.heights[i], fade = 1 - r / R;
      pos.setY(i, h * heightScale * 1.4 * (0.35 + 0.65 * fade));
      const k = Math.min(1, h * 1.6), color = k < 0.5 ? this.near.clone().lerp(this.mid, k * 2) : this.mid.clone().lerp(this.far, (k - 0.5) * 2), b = 0.35 + 0.65 * fade;
      col.setXYZ(i, color.r * b, color.g * b, color.b * b);
    }
    pos.needsUpdate = true; col.needsUpdate = true;
  }
  update(t, dt) { this.acc += dt * VISUALIZER.speedRowsPerSec; while (this.acc >= 1) { this.pushSpectrum(this.#demoSpectrum(t)); this.acc -= 1; } if (dt > 0) this.#apply(); }
}
