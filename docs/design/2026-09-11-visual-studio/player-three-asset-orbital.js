/** Event Horizon: a cinematic light-bending artwork, supplied with the host's Three namespace. */
export function createOrbitalAsset(THREE) {
  const group = new THREE.Group();
  group.name = 'Event Horizon · accretion space';
  const geometries = new Set(), materials = new Set();
  const geometry = value => (geometries.add(value), value);
  const material = value => (materials.add(value), value);
  const clamp = value => Math.max(0, Math.min(1, Number(value) || 0));
  const setting = (look, key, fallback, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(look?.[key]) ? look[key] : fallback));
  const uniforms = {
    uTime: {value: 0}, uAudio: {value: new THREE.Vector4()}, uPulse: {value: 0},
    uCentroid: {value: .4}, uIntensity: {value: .65}, uSteps: {value: 56},
    uGravity: {value: 1}, uDiskFlow: {value: 0}, uDetail: {value: 1}, uTilt: {value: 0},
    uParticleGlow: {value: 1}, uPulseEnabled: {value: 1},
    uLight: {value: new THREE.Color(0xb56aff)}, uRim: {value: new THREE.Color(0x58cced)},
    uWaveAges: {value: new THREE.Vector4(99, 99, 99, 99)},
    uWaveStrengths: {value: new THREE.Vector4()}
  };
  const horizonMaterial = material(new THREE.ShaderMaterial({
    name: 'Curved light paths and differential accretion', uniforms,
    transparent: true, depthWrite: false, depthTest: false,
    vertexShader: `
      varying vec2 vPlane;
      void main() {
        vPlane = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vPlane;
      uniform float uTime, uPulse, uCentroid, uIntensity;
      uniform float uGravity, uDiskFlow, uDetail, uTilt, uPulseEnabled;
      uniform int uSteps;
      uniform vec4 uAudio, uWaveAges, uWaveStrengths;
      uniform vec3 uLight, uRim;
      const float PI = 3.14159265359;
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
                   mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
      }
      float turbulence(vec2 p) {
        float n = noise(p) * .56;
        p = mat2(.8, -.6, .6, .8) * p * 2.07;
        n += noise(p) * .27;
        n += noise(p * 2.13 + 7.7) * .13;
        return n;
      }
      // Differential angular velocity winds turbulence into long, fine spiral filaments.
      vec4 accretion(vec3 p, float distanceTravelled) {
        vec3 normal = normalize(vec3(.045, .947, .32 + uTilt));
        vec3 axisX = normalize(cross(normal, vec3(0., 0., 1.)));
        vec3 axisY = cross(normal, axisX);
        vec2 disk = vec2(dot(p, axisX), dot(p, axisY));
        float r = length(disk), a = atan(disk.y, disk.x);
        float inner = 1.36, outer = 4.35;
        float edge = smoothstep(inner, inner + .15, r) * (1. - smoothstep(3.3, outer, r));
        float shear = uDiskFlow * (1.0 + uAudio.w * .26) / pow(max(r, 1.), 1.38);
        vec2 flow = vec2(a * 3.25 - shear * 4.0 + r * 1.7, r * 6.0);
        float n = turbulence(flow + vec2(0., uAudio.x * .19));
        float thread = pow(.5 + .5 * sin(r * 112. * uDetail + n * 17. + a * 3.0 - shear * 2.0), 3.0);
        float veins = pow(noise(vec2(a * 7. - shear * 5., r * 27. * uDetail + n * 4.)), 2.0);
        float brightSide = .48 + .52 * smoothstep(-1., 1., cos(a - .35));
        float temperature = pow(clamp((outer - r) / (outer - inner), 0., 1.), 1.5);
        vec3 warm = mix(vec3(.64, .17, .055), vec3(1., .62, .25), temperature);
        vec3 chroma = mix(uLight, uRim, smoothstep(1.8, 4.3, r));
        vec3 color = mix(chroma * .88, warm, .49 + temperature * .22 + uCentroid * .08);
        color = mix(color, vec3(1., .79, .47), pow(temperature, 6.) * .4);
        float textureLight = .16 + thread * .7 + veins * .9;
        float illumination = (.42 + temperature * .65) * brightSide;
        illumination *= .64 + uIntensity * .42 + uAudio.y * .24 + uPulse * uPulseEnabled * .19;
        // Longer, secondary paths are deliberately dimmer so the central void stays legible.
        illumination *= 1. / (1. + max(0., distanceTravelled - 9.) * .055);
        return vec4(color * textureLight * illumination * edge, edge * (.55 + n * .27));
      }
      float front(float age, float strength, vec2 p) {
        float radius = 1.4 + age * 2.15;
        float r = length(vec2(p.x, p.y * 1.8));
        float width = .028 + age * .075;
        float ribbon = exp(-pow((r - radius) / width, 2.));
        float breaks = .38 + .62 * pow(.5 + .5 * sin(atan(p.y, p.x) * 4. + r * 2.), 2.);
        return ribbon * exp(-age * 1.28) * strength * breaks * uPulseEnabled;
      }
      void main() {
        vec3 origin = vec3(0., 0., 9.);
        vec3 direction = normalize(vec3(vPlane, 0.) - origin);
        vec3 point = origin;
        vec3 diskNormal = normalize(vec3(.045, .947, .32 + uTilt));
        vec3 radiance = vec3(0.);
        float opacity = 0., captured = 0., travelled = 0., closest = 20.;
        // Bounded curved-ray integration. Accretion noise is evaluated only at disk crossings.
        // This is art-directed lensing, not a numerical general-relativity simulation.
        for (int i = 0; i < 56; i++) {
          if (i >= uSteps) break;
          float radius = length(point);
          closest = min(closest, radius);
          if (radius < .94) { captured = 1.; break; }
          if (travelled > 24.) break;
          float stepLength = clamp(radius * .13, .16, 1.1) * (56. / float(uSteps));
          vec3 acceleration = -point * (1.12 * uGravity / max(radius * radius * radius, .32));
          vec3 nextDirection = normalize(direction + acceleration * stepLength);
          vec3 nextPoint = point + normalize(direction + nextDirection) * stepLength;
          float before = dot(point, diskNormal), after = dot(nextPoint, diskNormal);
          if (before * after < 0.) {
            float crossing = before / (before - after);
            vec3 location = mix(point, nextPoint, crossing);
            float diskRadius = length(location);
            if (diskRadius > 1.36 && diskRadius < 4.35) {
              vec4 emission = accretion(location, travelled);
              radiance += (1. - opacity) * emission.rgb;
              opacity += (1. - opacity) * emission.a;
            }
          }
          // Thin scattering skin: volume about the disk, without multiplying procedural-noise cost.
          float diskHeight = abs(before);
          float skin = exp(-diskHeight * 19.) * smoothstep(1.5, 1.8, radius) * (1. - smoothstep(3.2, 4.55, radius));
          radiance += mix(uLight, vec3(1., .46, .12), .57) * skin * .012 * stepLength;
          travelled += stepLength;
          point = nextPoint; direction = nextDirection;
        }
        float screenRadius = length(vPlane);
        float corona = exp(-pow((closest - 1.15) / .06, 2.)) * .075 * (1. - captured);
        corona *= .5 + .5 * smoothstep(-1., 1., vPlane.x / max(screenRadius, .001));
        radiance += mix(vec3(1., .50, .16), uLight, .25) * corona;
        float haze = exp(-screenRadius * .42) * smoothstep(1.65, 3., screenRadius) * .018 * (1. - captured);
        radiance += mix(uLight, uRim, .35) * haze;
        float wave = front(uWaveAges.x, uWaveStrengths.x, vPlane)
                   + front(uWaveAges.y, uWaveStrengths.y, vPlane)
                   + front(uWaveAges.z, uWaveStrengths.z, vPlane)
                   + front(uWaveAges.w, uWaveStrengths.w, vPlane);
        radiance += mix(uRim, uLight, .4) * wave * .10 * (1. - captured);
        // Rays captured by the dark center occlude the separate star field behind this plane.
        float alpha = max(captured, clamp(opacity + corona + haze * 4. + wave * .11, 0., 1.));
        // Straight-alpha output: preserve radiance while feathering into the physical scene.
        gl_FragColor = vec4(radiance / max(alpha, .025), alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
  }));
  const horizon = new THREE.Mesh(geometry(new THREE.PlaneGeometry(14, 10)), horizonMaterial);
  horizon.name = 'Lensed accretion volume'; horizon.renderOrder = 4;
  horizon.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8.7);
  group.add(horizon);

  // Real spatial points provide a deep reference field around the central optical artwork.
  const starCount = 1152, positions = new Float32Array(starCount * 3);
  const seeds = new Float32Array(starCount), sizes = new Float32Array(starCount);
  let seed = 57392;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < starCount; i++) {
    const angle = random() * Math.PI * 2, r = 4 + Math.sqrt(random()) * 21;
    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = Math.sin(angle) * r * .65;
    positions[i * 3 + 2] = -4 - random() * 23;
    seeds[i] = random(); sizes[i] = .6 + Math.pow(random(), 4) * 2.7;
  }
  const starGeometry = geometry(new THREE.BufferGeometry());
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  starGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  starGeometry.computeBoundingSphere();
  const starMaterial = material(new THREE.ShaderMaterial({
    name: 'Accretion deep stars', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms, vertexShader: `
      attribute float aSeed, aSize;
      uniform float uTime; uniform vec4 uAudio;
      varying float vSeed, vTwinkle;
      void main() {
        vSeed = aSeed;
        vTwinkle = .52 + .18 * sin(uTime * .37 + aSeed * 71.) + uAudio.z * .12;
        vec4 mv = modelViewMatrix * vec4(position, 1.);
        gl_PointSize = clamp(aSize * 35. / max(-mv.z, 1.), .7, 3.5);
        gl_Position = projectionMatrix * mv;
      }
    `, fragmentShader: `
      uniform vec3 uLight, uRim;
      uniform float uParticleGlow;
      varying float vSeed, vTwinkle;
      void main() {
        vec2 p = gl_PointCoord - .5;
        float radial = exp(-dot(p, p) * 32.);
        float a = radial * vTwinkle * uParticleGlow;
        if (a < .012) discard;
        vec3 color = mix(mix(uLight, uRim, vSeed), vec3(.85, .86, .90), .75);
        gl_FragColor = vec4(color, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
  }));
  const stars = new THREE.Points(starGeometry, starMaterial);
  stars.name = 'Deep parallax stars'; stars.renderOrder = -3; group.add(stars);

  let waveSlot = 0, disposed = false;
  const diagnostics = {name: 'Event Horizon', drawCalls: 2, triangles: 2, points: starCount,
    maxRaySteps: 56, raySteps: 56, phase: 0, updates: 0, onsetCount: 0, disposed: false};
  function setPalette(world = {}) {
    if (disposed) return;
    uniforms.uLight.value.setHex(world.light ?? 0xb56aff);
    uniforms.uRim.value.setHex(world.rim ?? 0x58cced);
  }
  function update(frame = {}) {
    if (disposed) return;
    const look = frame.look;
    uniforms.uIntensity.value = frame.intensity == null ? .65 : clamp(frame.intensity);
    uniforms.uGravity.value = setting(look, 'horizonGravity', 1, .75, 1.25);
    uniforms.uDetail.value = setting(look, 'horizonDetail', 1, .5, 1.5);
    uniforms.uTilt.value = setting(look, 'horizonTilt', 0, -.12, .18);
    uniforms.uParticleGlow.value = setting(look, 'particleGlow', 1, .2, 2);
    uniforms.uPulseEnabled.value = setting(look, 'pulseGain', 1, 0, 2) === 0 ? 0 : 1;
    const lowQuality = frame.quality === 'low';
    uniforms.uSteps.value = lowQuality ? 32 : 56;
    starGeometry.setDrawRange(0, Math.floor((lowQuality ? 576 : starCount) * setting(look, 'particles', 1, 0, 1)));
    diagnostics.raySteps = uniforms.uSteps.value;
    diagnostics.points = starGeometry.drawRange.count;
    // No phase, audio, material-animation or pose change is permitted while motion is disabled.
    if (frame.motion === false) return;
    const dt = Math.max(0, Math.min(.05 * setting(look, 'motionSpeed', 1, .1, 2.5), Number(frame.dt) || 0));
    const bass = clamp(frame.bass), mid = clamp(frame.mid), treble = clamp(frame.treble), energy = clamp(frame.energy);
    const phaseStep = dt * (frame.active ? .46 + energy * .55 : .105);
    uniforms.uTime.value += phaseStep;
    uniforms.uDiskFlow.value += phaseStep * setting(look, 'horizonFlow', 1, 0, 2);
    const smoothing = 1 - Math.exp(-dt * 9);
    const audio = uniforms.uAudio.value;
    audio.x += (bass - audio.x) * smoothing; audio.y += (mid - audio.y) * smoothing;
    audio.z += (treble - audio.z) * smoothing; audio.w += (energy - audio.w) * smoothing;
    uniforms.uPulse.value += (clamp(frame.pulse) - uniforms.uPulse.value) * (1 - Math.exp(-dt * 18));
    uniforms.uCentroid.value = clamp(frame.centroid);
    for (let i = 0; i < 4; i++) uniforms.uWaveAges.value.setComponent(i, Math.min(99, uniforms.uWaveAges.value.getComponent(i) + dt));
    if (frame.onset === true && frame.active === true && uniforms.uPulseEnabled.value > 0) {
      uniforms.uWaveAges.value.setComponent(waveSlot, 0);
      uniforms.uWaveStrengths.value.setComponent(waveSlot, Math.max(.15, clamp(frame.pulse)));
      waveSlot = (waveSlot + 1) % 4; diagnostics.onsetCount++;
    }
    stars.rotation.z = Math.sin(uniforms.uTime.value * .025) * .012;
    diagnostics.phase = uniforms.uTime.value; diagnostics.updates++;
  }
  return {
    group, update, setPalette, diagnostics,
    view: {target: [0, 2.75, 0], direction: [0, 0, 1], distance: 11.8, fitRadius: 4.15, fitWidth: 6.2,
      minDistance: 9, maxDistance: 36, orbit: false, bloom: .3},
    dispose() {
      if (disposed) return;
      for (const item of geometries) item.dispose();
      for (const item of materials) item.dispose();
      disposed = true; diagnostics.disposed = true;
    }
  };
}
