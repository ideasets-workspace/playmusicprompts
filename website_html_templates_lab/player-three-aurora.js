/* Neural Bloom. A single rooted, three-dimensional nervous canopy.
 * The host owns Three, rendering, audio analysis, camera and animation scheduling.
 * All electrical fronts originate in real analyser onset events supplied by it. */
export function createAuroraAsset(THREE) {
  const group = new THREE.Group();
  group.name = 'Neural Bloom';
  const geometries = [], materials = [];
  const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
  const setting = (look, key, fallback, lo, hi) => clamp(Number.isFinite(look?.[key]) ? look[key] : fallback, lo, hi);
  let disposed = false, elapsed = 0, flow = 0, drive = 0, eventIndex = 0, branches = 0;
  let seed = 319071;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const TAU = Math.PI * 2;
  const spectrum = new Float32Array(64);
  const eventTimes = new Float32Array(8).fill(-100);
  const eventPower = new Float32Array(8);
  const uniforms = {
    uTime: { value: 0 }, uBass: { value: 0 }, uMid: { value: 0 }, uTreble: { value: 0 },
    uEnergy: { value: 0 }, uIntensity: { value: .65 }, uCentroid: { value: .4 },
    uDrive: { value: 0 }, uFlow: { value: 0 },
    uSway: { value: 1 }, uTrail: { value: 1 }, uParticleGlow: { value: 1 }, uPulseEnabled: { value: 1 },
    uSpectrum: { value: spectrum }, uEvents: { value: eventTimes }, uPowers: { value: eventPower },
    uPrimary: { value: new THREE.Color(0xa076ed) }, uSecondary: { value: new THREE.Color(0x4bd8d6) },
    uPearl: { value: new THREE.Color(0xdbd9f5) }
  };

  const positions = [], normals = [], metadata = [], indices = [], cells = [];
  const p = new THREE.Vector3(), tangent = new THREE.Vector3(), normal = new THREE.Vector3();
  const binormal = new THREE.Vector3(), axis = new THREE.Vector3(0, 0, 1), offset = new THREE.Vector3();
  let strandCount = 0;
  function strand(curve, { radius = .009, segments = 24, sides = 5, band = 0, start = 0, end = 1, braid = 0, phase = 0, faint = 0 } = {}) {
    const base = positions.length / 3;
    strandCount++;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      curve.getPoint(t, p);
      curve.getTangent(t, tangent).normalize();
      axis.set(Math.abs(tangent.z) > .9 ? 1 : 0, 0, Math.abs(tangent.z) > .9 ? 0 : 1);
      normal.crossVectors(tangent, axis).normalize();
      binormal.crossVectors(tangent, normal).normalize();
      // Parallel fibres share the same endpoints, preserving branch junctions.
      const braidRadius = braid * Math.pow(Math.sin(Math.PI * t), .7);
      offset.copy(normal).multiplyScalar(Math.cos(t * TAU * 1.5 + phase) * braidRadius);
      offset.addScaledVector(binormal, Math.sin(t * TAU * 1.5 + phase) * braidRadius);
      p.add(offset);
      const taper = radius * (1 - t * .45);
      for (let j = 0; j <= sides; j++) {
        const a = j / sides * TAU, ca = Math.cos(a), sa = Math.sin(a);
        const nx = normal.x * ca + binormal.x * sa, ny = normal.y * ca + binormal.y * sa, nz = normal.z * ca + binormal.z * sa;
        positions.push(p.x + nx * taper, p.y + ny * taper, p.z + nz * taper);
        normals.push(nx, ny, nz);
        metadata.push(start + (end - start) * t, band, phase, faint);
        if (i < segments && j < sides) {
          const a0 = base + i * (sides + 1) + j, b = a0 + sides + 1;
          indices.push(a0, b, a0 + 1, a0 + 1, b, b + 1);
        }
      }
    }
  }

  const root = new THREE.Vector3(.06, -2.45, .05);
  const crown = new THREE.Vector3(-.16, -.65, -.04);
  const trunk = new THREE.CubicBezierCurve3(root, new THREE.Vector3(-.35, -1.85, .24), new THREE.Vector3(.22, -1.18, -.21), crown);
  for (let i = 0; i < 18; i++) strand(trunk, { radius: .014, segments: 48, sides: 6, start: 0, end: .31, braid: .18, phase: i / 18 * TAU, band: i % 9 });

  // Exposed capillary roots make the canopy feel suspended rather than planted
  // on an invisible floor. The long arcs are deliberately asymmetric in depth.
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * TAU + random() * .25;
    const reach = .7 + random() * 1.0;
    const end = new THREE.Vector3(Math.cos(a) * reach, -2.45 + random() * .4, Math.sin(a) * reach * .72);
    const curve = new THREE.CubicBezierCurve3(root, new THREE.Vector3(Math.cos(a) * .22, -2.0, Math.sin(a) * .22), end.clone().multiply(new THREE.Vector3(.55, 1, .55)).add(new THREE.Vector3(0, -.16, 0)), end);
    strand(curve, { radius: .012, segments: 32, band: i * 4, start: .07, end: .01, phase: a, faint: .3 });
  }

  const tips = [];
  function grow(from, direction, length, level, family, progress) {
    branches++;
    const aim = direction.clone().normalize();
    const end = from.clone().addScaledVector(aim, length);
    end.y += .10 * Math.sin(family * 1.6 + level);
    const bend = new THREE.Vector3(-aim.z, .12, aim.x).multiplyScalar((random() - .5) * length * .6);
    const c1 = from.clone().addScaledVector(aim, length * .3).addScaledVector(bend, .5);
    const c2 = end.clone().addScaledVector(aim, -length * .27).add(bend);
    const curve = new THREE.CubicBezierCurve3(from, c1, c2, end);
    const next = Math.min(1, progress + [.24, .20, .15, .1][level]);
    const count = [5, 3, 2, 1][level];
    for (let n = 0; n < count; n++) strand(curve, {
      radius: [.011, .0095, .008, .0065][level], segments: [32, 24, 18, 14][level], sides: level < 2 ? 5 : 4,
      band: (family * 7 + level * 11) % 64, start: progress, end: next,
      braid: [.067, .034, .018, 0][level], phase: n / count * TAU + family * .51,
      faint: level === 3 ? .14 : 0
    });
    cells.push({ point: end.clone(), progress: next, band: (family * 7 + level * 11) % 64, seed: random(), size: level === 0 ? 1.3 : level === 1 ? 1.05 : .65 });
    if (level === 3) { tips.push({ point: end, progress: next, family }); return; }
    const children = level === 0 ? 3 : 2;
    for (let k = 0; k < children; k++) {
      const spread = (k - (children - 1) * .5) * (level === 0 ? .50 : .61);
      const childDirection = aim.clone();
      childDirection.x += spread * Math.cos(family * .31) + (random() - .5) * .22;
      childDirection.z += spread * Math.sin(family * .71 + .7) + (random() - .5) * .45;
      childDirection.y += .14 + (random() - .5) * .24;
      grow(end, childDirection.normalize(), length * (.62 + random() * .13), level + 1, family + k * 9, next);
    }
  }
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * TAU + .24;
    const direction = new THREE.Vector3(Math.cos(a) * 1.12, .56 + random() * .29, Math.sin(a) * .67);
    grow(crown, direction, 1.30 + random() * .30, 0, i, .31);
  }

  // Occasional long-range neural connections knit the canopy together without
  // turning its delicate negative spaces into a solid luminous volume.
  for (let i = 0; i < tips.length; i += 4) {
    const a = tips[i], b = tips[(i + 13) % tips.length];
    if (a.point.distanceTo(b.point) > 1.3) continue;
    const middle = a.point.clone().lerp(b.point, .5).add(new THREE.Vector3(0, -.15, .12));
    const curve = new THREE.QuadraticBezierCurve3(a.point, middle, b.point);
    strand(curve, { radius: .005, segments: 16, sides: 4, band: a.family % 64, start: .87, end: .96, phase: i * .13, faint: .58 });
  }

  const fiberGeometry = new THREE.BufferGeometry();
  fiberGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  fiberGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  fiberGeometry.setAttribute('aMeta', new THREE.Float32BufferAttribute(metadata, 4));
  fiberGeometry.setIndex(indices);
  fiberGeometry.computeBoundingBox();
  // Cover the full 2x sound-driven sway before Three performs CPU culling.
  fiberGeometry.boundingBox.expandByScalar(1.4);
  fiberGeometry.boundingSphere = new THREE.Sphere();
  fiberGeometry.boundingBox.getBoundingSphere(fiberGeometry.boundingSphere);
  geometries.push(fiberGeometry);

  const common = /* glsl */`
    uniform float uTime, uBass, uMid, uTreble, uEnergy, uIntensity, uCentroid, uDrive, uFlow;
    uniform float uSway, uTrail, uParticleGlow, uPulseEnabled;
    uniform float uSpectrum[64];
    uniform float uEvents[8];
    uniform float uPowers[8];
    uniform vec3 uPrimary, uSecondary, uPearl;
    vec3 breathe(vec3 p) {
      // One continuous displacement field keeps every joined fibre and its cell
      // connected. The root stays anchored as sound opens the higher branches.
      float freedom = smoothstep(-2.3, 1.2, p.y);
      float motionDrive = uDrive * uSway;
      p.x *= 1. + freedom * motionDrive * .09;
      p.z *= 1. + freedom * motionDrive * .14;
      p.x += sin(p.y * 1.17 + p.z * .57 + uFlow) * freedom * (.030 + motionDrive * .15);
      p.z += sin(p.x * .8 + p.y * .63 + uFlow * .79) * freedom * (.040 + motionDrive * .22);
      p.y += freedom * motionDrive * .10;
      p.y += sin(p.z * .86 + uFlow * .71) * freedom * (.018 + motionDrive * .065);
      return p;
    }
    float electricalFront(float progress) {
      float light = 0.;
      for (int i = 0; i < 8; i++) {
        float age = uTime - uEvents[i];
        float front = age * .62;
        float delta = (progress - front) * 34. / uTrail;
        light += exp(-delta * delta) * uPowers[i] * step(0., age) * (1. - smoothstep(1.3, 1.9 + (uTrail - 1.) * .6, age));
      }
      return min(light, 1.8) * uPulseEnabled;
    }
  `;
  const fiberMaterial = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      ${common}
      attribute vec4 aMeta;
      varying vec4 vMeta;
      varying float vFacing;
      void main() {
        vec3 p = breathe(position);
        vec4 view = modelViewMatrix * vec4(p, 1.);
        vMeta = aMeta;
        vFacing = abs(dot(normalize(normalMatrix * normal), normalize(-view.xyz)));
        gl_Position = projectionMatrix * view;
      }
    `,
    fragmentShader: /* glsl */`
      ${common}
      varying vec4 vMeta;
      varying float vFacing;
      void main() {
        int band = int(clamp(vMeta.y, 0., 63.));
        float response = uSpectrum[band];
        float impulse = electricalFront(vMeta.x);
        float colourPosition = .5 + .5 * sin(vMeta.z * 1.7 + vMeta.x * 3.8);
        vec3 colour = mix(uPrimary, uSecondary, colourPosition);
        float sheen = pow(vFacing, 3.);
        colour = mix(colour, uPearl, .08 * sheen + impulse * .32);
        float strength = (.50 + uIntensity * .60 + response * .70 + uEnergy * .14) * (.45 + .55 * sheen);
        strength += impulse * (2.3 + uIntensity * 1.25);
        float alpha = (1. - vMeta.w * .68) * (.57 + .40 * vFacing);
        gl_FragColor = vec4(colour * strength, alpha);
      }
    `,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false
  });
  materials.push(fiberMaterial);
  const fibers = new THREE.Mesh(fiberGeometry, fiberMaterial);
  fibers.name = 'Braided dendrites and capillary roots';
  group.add(fibers);

  function createPoints(name, points, meta, type) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geometry.setAttribute('aMeta', new THREE.Float32BufferAttribute(meta, 4));
    geometry.computeBoundingBox();
    geometry.boundingBox.expandByScalar(type === 'cells' ? 1.4 : .6);
    geometry.boundingSphere = new THREE.Sphere();
    geometry.boundingBox.getBoundingSphere(geometry.boundingSphere);
    geometries.push(geometry);
    const material = new THREE.ShaderMaterial({
      uniforms,
      defines: { CELLULAR: type === 'cells' ? 1 : 0 },
      vertexShader: /* glsl */`
        ${common}
        attribute vec4 aMeta;
        varying float vLight, vColour, vDepth;
        void main() {
          vec3 p = position;
          float impulse = electricalFront(aMeta.x);
          #if CELLULAR == 1
            p = breathe(position);
          #else
            p.x += sin(uTime * .047 + aMeta.y * 4.) * .18;
            p.y += sin(uTime * .061 + aMeta.z * 21.) * .20;
          #endif
          vec4 view = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * view;
          #if CELLULAR == 1
            gl_PointSize = clamp((aMeta.w * 5.5 + impulse * 5.5 + uTreble * 1.5) * 12. / max(-view.z, 1.), 2., 21.);
            vLight = .37 + impulse * 1.3 + uSpectrum[int(clamp(aMeta.y, 0., 63.))] * .55;
          #else
            gl_PointSize = clamp((.75 + aMeta.w * 1.7) * 12. / max(-view.z, 1.), 1., 5.);
            vLight = (.10 + aMeta.w * .27) * (.85 + .15 * sin(uTime * .14 + aMeta.z * 51.));
          #endif
          vColour = aMeta.z;
          vDepth = clamp(1. - max(-view.z - 13., 0.) / 11., .1, 1.);
        }
      `,
      fragmentShader: /* glsl */`
        ${common}
        varying float vLight, vColour, vDepth;
        void main() {
          vec2 p = gl_PointCoord * 2. - 1.;
          float r = length(p);
          if (r > 1.) discard;
          float core = exp(-r * r * 18.);
          float halo = exp(-r * r * 3.7) * (1. - smoothstep(.65, 1., r));
          vec3 colour = mix(uPrimary, uSecondary, vColour);
          #if CELLULAR == 1
            float membrane = exp(-pow((r - .46) * 19., 2.));
            colour = mix(colour, uPearl, core * .72);
            gl_FragColor = vec4(colour * (1. + core * .55 + uIntensity * .4), (core + halo * .36 + membrane * .16) * vLight * vDepth);
          #else
            gl_FragColor = vec4(colour, halo * vLight * vDepth * (.7 + uIntensity * .5) * uParticleGlow);
          #endif
        }
      `,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false
    });
    materials.push(material);
    const object = new THREE.Points(geometry, material);
    object.name = name;
    group.add(object);
    return object;
  }
  const cellPositions = [], cellMetadata = [];
  for (const cell of cells) {
    cellPositions.push(...cell.point.toArray());
    cellMetadata.push(cell.progress, cell.band, cell.seed, cell.size);
  }
  const cellPoints = createPoints('Living synaptic junctions', cellPositions, cellMetadata, 'cells');
  const dustPositions = [], dustMetadata = [];
  const dustCount = 1050;
  for (let i = 0; i < dustCount; i++) {
    // Stratified depth keeps both near and far particles; no billboard backdrop.
    dustPositions.push((random() - .5) * 11.5, (random() - .5) * 7.8, -1.2 - random() * 8.4);
    dustMetadata.push(random(), random(), random(), Math.pow(random(), 2));
  }
  const dust = createPoints('Suspended neural atmosphere', dustPositions, dustMetadata, 'dust');
  dust.geometry.setDrawRange(0, dustCount);

  function updatePose() {
    // Use the retained drive and phase so explicit tuning remains available
    // while Motion is off without sampling fresh audio or advancing a clock.
    group.rotation.y = Math.sin(flow * .20) * (.10 + drive * uniforms.uSway.value * .10);
    group.rotation.x = Math.sin(flow * .27) * drive * uniforms.uSway.value * .025;
  }

  function update(frame = {}) {
    if (disposed) return;
    const look = frame.look;
    uniforms.uIntensity.value = clamp(frame.intensity ?? .65);
    uniforms.uSway.value = setting(look, 'neuralSway', 1, 0, 2);
    uniforms.uTrail.value = setting(look, 'neuralTrail', 1, .4, 2);
    uniforms.uParticleGlow.value = setting(look, 'particleGlow', 1, .2, 2);
    uniforms.uPulseEnabled.value = setting(look, 'pulseGain', 1, 0, 2) === 0 ? 0 : 1;
    const spread = setting(look, 'neuralSpread', 1, .7, 1.2);
    fibers.scale.set(spread, 1, spread);
    cellPoints.scale.set(spread, 1, spread);
    dust.geometry.setDrawRange(0, Math.floor((frame.quality === 'low' ? 480 : dustCount) * setting(look, 'particles', 1, 0, 1)));
    if (frame.motion === false) { updatePose(); return; }
    const dt = clamp(frame.dt ?? 1 / 60, 0, .05 * setting(look, 'motionSpeed', 1, .1, 2.5));
    elapsed += dt;
    uniforms.uTime.value = elapsed;
    uniforms.uBass.value = clamp(frame.bass ?? 0);
    uniforms.uMid.value = clamp(frame.mid ?? 0);
    uniforms.uTreble.value = clamp(frame.treble ?? 0);
    uniforms.uEnergy.value = clamp(frame.energy ?? 0);
    uniforms.uCentroid.value = clamp(frame.centroid ?? .4);
    const source = frame.spectrum;
    let squaredEnergy = 0;
    for (let i = 0; i < 64; i++) {
      spectrum[i] = clamp(source?.[i] ?? (i < 18 ? frame.bass ?? 0 : i < 43 ? frame.mid ?? 0 : frame.treble ?? 0));
      squaredEnergy += spectrum[i] * spectrum[i];
    }
    // RMS retains narrow-band sound that a broad-band arithmetic mean dilutes.
    // This is a bounded animation envelope, not an invented beat or audio meter.
    const targetDrive = frame.active === true ? clamp(Math.max(Math.sqrt(squaredEnergy / 64) * 2.2, uniforms.uBass.value * 1.8, uniforms.uEnergy.value * 2)) : 0;
    drive += (targetDrive - drive) * (1 - Math.exp(-dt * (targetDrive > drive ? 7 : 3.8)));
    flow += dt * (.18 + drive * 1.9);
    uniforms.uDrive.value = drive;
    uniforms.uFlow.value = flow;
    if (frame.onset === true && frame.active === true && uniforms.uPulseEnabled.value > 0) {
      eventTimes[eventIndex] = elapsed;
      eventPower[eventIndex] = clamp(frame.pulse ?? frame.energy ?? 0);
      eventIndex = (eventIndex + 1) % 8;
    }
    // Slow turning exposes the real branch depth. It is ambient, not a fake beat.
    updatePose();
  }

  const primaryBase = new THREE.Color(0x906ee2), secondaryBase = new THREE.Color(0x52d9cc), pearlBase = new THREE.Color(0xe0dff2);
  function setPalette(world = {}) {
    if (disposed) return;
    uniforms.uPrimary.value.set(world.light ?? 0xa076ed).lerp(primaryBase, .22);
    uniforms.uSecondary.value.set(world.rim ?? 0x4bd8d6).lerp(secondaryBase, .18);
    uniforms.uPearl.value.set(world.tint ?? 0xdbd9f5).lerp(pearlBase, .73);
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    group.clear();
  }
  function diagnostics() {
    return { name: group.name, branches, strands: strandCount, cells: cells.length, particles: dust.geometry.drawRange.count, triangles: indices.length / 3, draws: 3, elapsed, eventCount: Array.from(eventTimes).filter(t => t >= 0).length, bounds: fiberGeometry.boundingBox.toArray ? fiberGeometry.boundingBox.toArray() : { min: fiberGeometry.boundingBox.min.toArray(), max: fiberGeometry.boundingBox.max.toArray() }, disposed };
  }
  return {
    group, update, setPalette, dispose, diagnostics,
    view: { target: [0, 2.83, 0], direction: [.10, .04, 1], distance: 11.4, fitRadius: 3.5, minDistance: 6.5, maxDistance: 17, orbit: true, bloom: .48 }
  };
}
