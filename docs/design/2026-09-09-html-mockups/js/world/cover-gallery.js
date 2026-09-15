/**
 * js/world/cover-gallery.js — station 3 of THE WORLD: the catalogue as floating 3D covers.
 * Each track is a glass-framed plane textured with its cover (CanvasTexture from js/cover-art.js),
 * arranged on a rising spiral around the camera path. Planes face the camera (billboard with a
 * damped tilt), hover-raycast lifts one, click selects it (the World calls onPlay). The selected
 * cover gets an emissive ring and the others dim — the "markers you click to explore" pattern.
 */
import * as THREE from "three";
import { SCENE3D, WORLD } from "../constants.js";
import { CoverArt } from "../cover-art.js";

export class CoverGallery {
  constructor(tracks, centerZ) {
    const { count, radius, rise, coverSize } = WORLD.gallery;
    this.group = new THREE.Group(); this.items = []; this.selected = null;
    const loader = new THREE.TextureLoader();
    const list = Array.from({ length: count }, (_, i) => tracks[i % tracks.length]);
    list.forEach((track, i) => {
      const a = (i / count) * Math.PI * 2 * 1.5;                 // 1.5 turns
      const pos = new THREE.Vector3(Math.cos(a) * radius, -rise + (i / count) * rise * 2, centerZ + Math.sin(a) * radius * 0.55 - 8 + i * 0.4);
      const tex = loader.load(CoverArt.src(track, 512)); tex.colorSpace = THREE.SRGBColorSpace;
      // unlit: the cover shows at its own brightness regardless of scene lights; selection/dim is done via color
      const mat = new THREE.MeshBasicMaterial({ map: tex, color: 0xffffff, toneMapped: false });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(coverSize, coverSize), mat);
      mesh.position.copy(pos);
      // glass frame
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(coverSize * 1.08, coverSize * 1.08), new THREE.MeshPhysicalMaterial({ color: 0x150c24, roughness: 0.1, metalness: 0.3, transmission: 0.4, thickness: 0.3, transparent: true, opacity: 0.85 }));
      frame.position.z = -0.03; mesh.add(frame);
      const ring = new THREE.Mesh(new THREE.RingGeometry(coverSize * 0.62, coverSize * 0.66, 64), new THREE.MeshBasicMaterial({ color: SCENE3D.colors.far, transparent: true, opacity: 0, side: THREE.DoubleSide }));
      ring.position.z = 0.02; mesh.add(ring);
      mesh.userData = { track, i, base: pos.clone(), ring };
      this.group.add(mesh); this.items.push(mesh);
    });
  }
  get object3d() { return this.group; }
  pick(raycaster) { const hits = raycaster.intersectObjects(this.items, false); return hits.length ? { track: hits[0].object.userData.track, mesh: hits[0].object } : null; }
  select(track) { this.selected = track; }
  update(t, camera, beat) {
    for (const m of this.items) {
      const { base, i, ring, track } = m.userData;
      m.position.set(base.x, base.y + Math.sin(t * 0.8 + i) * 0.18, base.z);
      m.lookAt(camera.position);
      const sel = this.selected && this.selected.id === track.id;
      const target = sel ? 1.18 + beat * 0.05 : 1;
      m.scale.lerp(new THREE.Vector3(target, target, 1), 0.08);
      const bright = sel ? 1.0 + beat * 0.3 : this.selected ? 0.45 : 0.9;
      m.material.color.lerp(new THREE.Color(bright, bright, bright), 0.08);
      ring.material.opacity += ((sel ? 0.85 * (0.6 + 0.4 * beat) : 0) - ring.material.opacity) * 0.1;
    }
  }
}
