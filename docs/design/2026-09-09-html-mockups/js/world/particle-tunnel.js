/**
 * js/world/particle-tunnel.js — station 1 of THE WORLD: a tunnel of particle rings the camera
 * flies through while a take is being composed. Rings rotate in alternating directions and
 * their radius breathes with energy; the ring nearest the camera flashes on the beat (the
 * "labour shown" idea, K3, rendered as space rather than as a progress bar).
 */
import * as THREE from "three";
import { SCENE3D, WORLD } from "../constants.js";

export class ParticleTunnel {
  constructor(centerZ) {
    const { rings, pointsPerRing, radius, length } = WORLD.tunnel;
    const n = rings * pointsPerRing, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), ring = new Float32Array(n);
    const a = new THREE.Color(SCENE3D.colors.near), b = new THREE.Color(SCENE3D.colors.far);
    let i = 0;
    for (let r = 0; r < rings; r++) {
      const z = centerZ + length / 2 - (r / (rings - 1)) * length;
      const c = a.clone().lerp(b, r / (rings - 1));
      for (let p = 0; p < pointsPerRing; p++, i++) {
        const ang = (p / pointsPerRing) * Math.PI * 2;
        pos[i * 3] = Math.cos(ang) * radius; pos[i * 3 + 1] = Math.sin(ang) * radius; pos[i * 3 + 2] = z;
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; ring[i] = r;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aRing", new THREE.BufferAttribute(ring, 1));
    this.uniforms = { uTime: { value: 0 }, uEnergy: { value: .5 }, uBeat: { value: 0 }, uPixelRatio: { value: Math.min(devicePixelRatio || 1, 2) }, uRings: { value: rings }, uSize: { value: WORLD.tunnel.pointSizePx } };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
      vertexShader: `uniform float uTime,uEnergy,uBeat,uPixelRatio,uRings,uSize; attribute float aRing; varying vec3 vC; varying float vA;
        void main(){ vec3 p = position; float dir = mod(aRing,2.0)<1.0?1.0:-1.0; float ang = uTime*0.25*dir + aRing*0.05; float ca=cos(ang), sa=sin(ang);
          p.xy = mat2(ca,-sa,sa,ca)*p.xy; float breathe = 1.0 + uEnergy*0.08*sin(uTime*1.6 + aRing*0.4); p.xy *= breathe;
          vec4 mv = modelViewMatrix*vec4(p,1.0); gl_Position = projectionMatrix*mv;
          float flash = uBeat * smoothstep(0.35, 0.0, abs(fract(aRing/uRings*3.0 - uTime*0.35)));
          gl_PointSize = (uSize + uSize*1.2*flash) * uPixelRatio / max(1.0,-mv.z); vC = color*(1.1+flash); vA = 0.85+0.15*flash; }`,
      fragmentShader: `varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-0.5); if(d>0.5) discard; float s=smoothstep(0.5,0.0,d); gl_FragColor=vec4(vC*(0.6+smoothstep(0.2,0.0,d)), s*vA); }`,
    });
    this.points = new THREE.Points(geo, mat); this.points.frustumCulled = false;
  }
  get object3d() { return this.points; }
  update(t, energy, beat) { this.uniforms.uTime.value = t; this.uniforms.uEnergy.value = energy; this.uniforms.uBeat.value = beat; }
}
