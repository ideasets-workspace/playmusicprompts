/**
 * js/fx/ribbons-and-core.js — the two hero objects that sit inside the particle field:
 *
 *   Ribbons  — SCENE3D.ribbonCount luminous tubes whose spine is a travelling waveform
 *              (amplitude follows audio energy). Emissive so bloom turns them into neon.
 *   Core     — an iridescent glass torus-knot (MeshPhysicalMaterial: transmission, thin-film
 *              iridescence, clearcoat) that slowly turns and swells on the beat. It is the
 *              "composer" — the object the prompt speaks to.
 *
 * Both expose update(t, energy, beat). Geometry for the ribbons is rebuilt per frame from a
 * CatmullRom spine (220 segments × 3 tubes ≈ cheap; measured OK in the first build).
 */
import * as THREE from "three";
import { SCENE3D } from "../constants.js";

export class Ribbons {
  constructor() {
    this.group = new THREE.Group();
    this.items = [];
    const hues = [SCENE3D.colors.mid, SCENE3D.colors.near, SCENE3D.colors.far];
    for (let k = 0; k < SCENE3D.ribbonCount; k++) {
      const pts = Array.from({ length: SCENE3D.ribbonSegments + 1 }, (_, i) => new THREE.Vector3((i / SCENE3D.ribbonSegments - 0.5) * 16, 0, 0));
      const curve = new THREE.CatmullRomCurve3(pts);
      const mat = new THREE.MeshStandardMaterial({ color: hues[k % hues.length], emissive: hues[k % hues.length], emissiveIntensity: 2.2, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, SCENE3D.ribbonSegments, SCENE3D.ribbonRadius, 8, false), mat);
      mesh.position.y = 0.3 + k * 0.25;
      this.group.add(mesh);
      this.items.push({ pts, curve, mesh, phase: k * 1.7, speed: 0.8 + k * 0.25 });
    }
  }
  get object3d() { return this.group; }
  update(t, energy, beat) {
    for (const it of this.items) {
      for (let i = 0; i < it.pts.length; i++) {
        const u = i / SCENE3D.ribbonSegments;
        const x = (u - 0.5) * 16;
        const y = (Math.sin(u * 18 - t * 2.6 * it.speed + it.phase) * 0.35 + Math.sin(u * 6.5 - t * 1.1 * it.speed) * 0.55) * SCENE3D.ribbonAmplitude * (0.45 + energy);
        const z = Math.cos(u * 4.2 + t * 0.5 + it.phase) * 0.9;
        it.pts[i].set(x, y, z);
      }
      it.curve.points = it.pts;
      it.mesh.geometry.dispose();
      it.mesh.geometry = new THREE.TubeGeometry(it.curve, SCENE3D.ribbonSegments, SCENE3D.ribbonRadius * (1 + beat * 0.6), 8, false);
      it.mesh.material.emissiveIntensity = 1.6 + energy * 1.6 + beat * 1.2;
    }
  }
}

export class ComposerCore {
  constructor() {
    const geo = new THREE.TorusKnotGeometry(SCENE3D.coreRadius, SCENE3D.coreTube, 220, 32, 2, 3);
    this.material = new THREE.MeshPhysicalMaterial({
      color: 0x1a0b2e, metalness: 0.1, roughness: 0.08,
      transmission: 0.85, thickness: 1.2, ior: 1.45,
      iridescence: 1.0, iridescenceIOR: 1.6, iridescenceThicknessRange: [120, 640],
      clearcoat: 1.0, clearcoatRoughness: 0.05,
      emissive: SCENE3D.colors.core, emissiveIntensity: 0.25,
      transparent: true, opacity: 0.98,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    // the core sits right of centre: the hero's text scrim owns the left third, the object owns the right
    this.mesh.position.set(3.2, 0.9, 0.5);
    // a hot inner light so the glass glows from inside under bloom
    this.light = new THREE.PointLight(SCENE3D.colors.core, 30, 12, 2);
    this.mesh.add(this.light);
  }
  get object3d() { return this.mesh; }
  update(t, energy, beat) {
    this.mesh.rotation.x = t * 0.35; this.mesh.rotation.y = t * 0.55;
    const s = 1 + beat * 0.08 + energy * 0.04;
    this.mesh.scale.setScalar(s);
    this.material.emissiveIntensity = 0.2 + beat * 1.4 + energy * 0.3;
    this.light.intensity = 20 + beat * 60;
  }
}
