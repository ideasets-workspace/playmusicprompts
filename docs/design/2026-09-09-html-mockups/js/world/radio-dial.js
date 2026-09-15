/**
 * js/world/radio-dial.js — station 4 of THE WORLD: the RADIO DIAL. Six radios are glowing orbs
 * on a ring around the camera path; each orb carries its name as a canvas-texture label sprite
 * and a halo ring. The dial has its own rotation: DRAG turns it (world.js forwards the drag
 * delta), and the orb nearest the front is the "tuned" radio — it brightens, its halo opens,
 * and the World is told to shift palette + tempo to that radio. CLICK on an orb snaps the dial
 * to it. Production: onTune(radio) starts that radio's continuous queue (catalogue + freshly
 * generated takes for the radio's brief) in the single player queue (D-PMP-05, R2 stations).
 */
import * as THREE from "three";
import { RADIOS, WORLD } from "../constants.js";

function labelTexture(text, hex) {
  const s = WORLD.dial.labelPx, c = document.createElement("canvas"); c.width = s; c.height = s / 4;
  const ctx = c.getContext("2d"); ctx.clearRect(0, 0, c.width, c.height);
  ctx.font = `800 ${s / 7}px Manrope, system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.shadowColor = `#${hex.toString(16).padStart(6, "0")}`; ctx.shadowBlur = 24; ctx.fillStyle = "#F4F1FA";
  ctx.fillText(text.toUpperCase(), c.width / 2, c.height / 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export class RadioDial {
  constructor(centerZ, { onTune }) {
    this.group = new THREE.Group(); this.group.position.set(0, 0.6, centerZ);
    this.onTune = onTune; this.rotation = 0; this.rotationTarget = 0; this.tuned = null; this.items = [];
    const { radius, orbRadius } = WORLD.dial;
    RADIOS.forEach((radio, i) => {
      const a = (i / RADIOS.length) * Math.PI * 2;
      const holder = new THREE.Group(); holder.userData = { radio, i, angle: a };
      const orb = new THREE.Mesh(new THREE.SphereGeometry(orbRadius, 48, 48), new THREE.MeshPhysicalMaterial({ color: radio.hue, emissive: radio.hue, emissiveIntensity: 0.6, roughness: 0.15, metalness: 0.1, transmission: 0.55, thickness: 1.0, clearcoat: 1 }));
      const halo = new THREE.Mesh(new THREE.RingGeometry(orbRadius * 1.35, orbRadius * 1.5, 72), new THREE.MeshBasicMaterial({ color: radio.hue, transparent: true, opacity: 0.15, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture(radio.name, radio.hue), transparent: true, depthWrite: false, color: 0x9A93B5 /* dimmed so bloom does not blow the text out */ }));
      label.scale.set(4.2, 1.05, 1); label.position.y = -orbRadius * 2.1;
      const light = new THREE.PointLight(radio.hue, 8, 10, 2);
      holder.add(orb, halo, label, light); holder.position.set(Math.sin(a) * radius, 0, Math.cos(a) * radius);
      holder.userData.orb = orb; holder.userData.halo = halo;
      this.group.add(holder); this.items.push(holder);
    });
    this.snapTo(0);
  }
  get object3d() { return this.group; }
  /** drag delta (radians) from the World while the camera is at this station */
  turn(delta) { this.rotationTarget += delta; }
  snapTo(i) { const n = RADIOS.length; const k = ((i % n) + n) % n; this.rotationTarget = -this.items[k].userData.angle; }
  pick(raycaster) { const hits = raycaster.intersectObjects(this.items.map((h) => h.userData.orb), false); if (!hits.length) return null; const holder = hits[0].object.parent; return holder.userData; }
  update(t, dt, beat, camera, active = true) {
    this.rotation += (this.rotationTarget - this.rotation) * (1 - Math.exp(-dt * WORLD.dial.tuneSnapRatePerSec));
    this.group.rotation.y = this.rotation;
    // the tuned radio is the one whose world angle is closest to "front" (facing +Z toward the camera)
    let best = null, bestScore = -Infinity;
    for (const h of this.items) {
      const world = new THREE.Vector3(); h.getWorldPosition(world);
      const toCam = camera.position.clone().sub(world); const score = -toCam.length();
      const front = (Math.cos(h.userData.angle + this.rotation) + 1) / 2;            // 1 = nearest camera
      h.userData.orb.material.emissiveIntensity = 0.35 + front * 1.6 + (front > 0.97 ? beat * 1.2 : 0);
      h.userData.halo.material.opacity = 0.1 + front * 0.55 + (front > 0.97 ? beat * 0.3 : 0);
      h.userData.halo.rotation.z = t * 0.4 * (h.userData.i % 2 ? 1 : -1);
      h.userData.halo.scale.setScalar(1 + (front > 0.97 ? beat * 0.12 : 0));
      h.children[2].lookAt(camera.position);
      h.position.y = Math.sin(t * 0.9 + h.userData.i) * 0.25;
      if (score > bestScore) { bestScore = score; best = h; }
    }
    // tuning only fires while the camera is AT the dial: arriving at the station tunes the front radio
    if (active && best && best.userData.radio !== this.tuned && Math.abs(this.rotationTarget - this.rotation) < 0.03) {
      this.tuned = best.userData.radio; this.onTune?.(this.tuned);
    }
  }
}
