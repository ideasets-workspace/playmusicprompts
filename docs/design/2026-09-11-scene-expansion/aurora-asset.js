/* Aurora Veil: procedural geometry and light, supplied with the host's Three.js instance.
   The host owns time, audio analysis, rendering, camera and bloom. */
export function createAuroraAsset(THREE) {
  const group = new THREE.Group();
  group.name = 'Aurora Veil';
  const clamp = (value, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number(value) || 0));
  const materials = [];
  const geometries = [];
  let disposed = false;

  // A parameter grid makes every fold genuinely three-dimensional. Filaments are
  // shaded inside each curtain, avoiding hundreds of overlapping line objects.
  const columns = 144, rows = 24;
  const positions = new Float32Array((columns + 1) * (rows + 1) * 3);
  const uvs = new Float32Array((columns + 1) * (rows + 1) * 2);
  const indices = [];
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= columns; i++) {
      const index = j * (columns + 1) + i;
      positions[index * 3] = i / columns;
      positions[index * 3 + 1] = j / rows;
      uvs[index * 2] = i / columns;
      uvs[index * 2 + 1] = j / rows;
      if (i < columns && j < rows) {
        const next = index + columns + 1;
        indices.push(index, next, index + 1, index + 1, next, next + 1);
      }
    }
  }
  const curtainGeometry = new THREE.BufferGeometry();
  curtainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  curtainGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  curtainGeometry.setIndex(indices);
  // Actual positions live in the shader. Explicit bounds prevent parameter-space
  // culling from hiding a curtain when the listener rotates the camera.
  curtainGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3.3);
  curtainGeometry.boundingBox = new THREE.Box3(new THREE.Vector3(-2.7, -2.1, -1.4), new THREE.Vector3(2.7, 2.1, 1.4));
  geometries.push(curtainGeometry);

  const curveCode = /* glsl */`
    const float PI = 3.14159265359;
    const float TAU = 6.28318530718;
    vec3 curtain(float u, float v, float layer) {
      float taper = pow(max(sin(u * PI), 0.0), 0.56);
      float drift = uTime * 0.19;
      float longWave = sin(u * TAU - layer * 0.73 + drift);
      float detail = sin(u * 13.0 + layer * 1.51 - drift * 0.81);
      float crown = 0.5 + 0.5 * sin(u * 8.8 + layer * 0.9 + drift * 0.5);
      float height = taper * (1.23 + crown * 0.85 + uBass * 0.30);
      float centre = longWave * 0.38 + detail * 0.12;
      float x = (u - 0.5) * 4.40 + sin(v * PI) * taper * 0.11;
      float y = centre + (v - 0.43) * height;
      y += sin(u * 18.0 + layer + uTime * 0.60) * uMid * 0.10 * taper;
      float z = sin(u * 7.1 + layer * 1.36 + drift) * 0.57;
      z += sin(u * 13.0 - layer * 0.65 + drift * 0.8) * taper * 0.31;
      z += (v - 0.5) * sin(u * 12.0 - drift) * 0.40;
      z += sin(u * 24.0 + v * 3.0 + uTime * 0.4) * uTreble * 0.065 * taper;
      return vec3(x, y, z);
    }
  `;
  const ribbonVertex = /* glsl */`
    uniform float uTime;
    uniform float uBass;
    uniform float uMid;
    uniform float uTreble;
    uniform float uLayer;
    varying vec2 vRibbon;
    varying float vFold;
    ${curveCode}
    void main() {
      vRibbon = uv;
      vec3 p = curtain(uv.x, uv.y, uLayer);
      vFold = p.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `;
  const ribbonFragment = /* glsl */`
    uniform float uTime;
    uniform float uEnergy;
    uniform float uTreble;
    uniform float uIntensity;
    uniform float uLayer;
    uniform vec3 uMint;
    uniform vec3 uBlue;
    uniform vec3 uViolet;
    varying vec2 vRibbon;
    varying float vFold;
    void main() {
      float u = vRibbon.x;
      float v = vRibbon.y;
      float ends = smoothstep(0.0, 0.09, u) * (1.0 - smoothstep(0.89, 1.0, u));
      float fibres = sin(u * 580.0 + sin(u * 22.0 + uTime * 0.10) * 2.0 + uLayer * 6.0);
      fibres = pow(0.5 + 0.5 * fibres, 13.0);
      float micro = pow(0.5 + 0.5 * sin(u * 1170.0 + uLayer * 13.0), 22.0);
      micro *= 1.0 - smoothstep(0.35, 1.3, fwidth(u) * 1170.0);
      float strands = 0.14 + 0.64 * fibres + 0.20 * micro;
      float curtain = pow(max(1.0 - v, 0.0), 0.70);
      float lowerEdge = exp(-pow((v - 0.085) * 31.0, 2.0));
      float upperFade = 1.0 - smoothstep(0.66, 1.0, v);
      float verticalFade = smoothstep(0.0, 0.045, v) * upperFade;
      float caustic = pow(0.5 + 0.5 * sin(u * 15.0 + v * 5.0 - uTime * 0.32 + uLayer), 8.0);
      float glow = (strands * curtain + lowerEdge * 0.74 + caustic * 0.13) * verticalFade;
      float colourFlow = 0.5 + 0.5 * sin(u * 4.6 + uLayer * 0.9 + vFold * 0.9);
      vec3 colour = mix(uMint, uBlue, colourFlow * 0.80);
      colour = mix(colour, uViolet, smoothstep(0.08, 0.76, v) * 0.90);
      float highlight = (0.88 + uIntensity * 0.62 + uEnergy * 0.24);
      colour *= highlight * (0.73 + lowerEdge * 0.75 + fibres * 0.33);
      float alpha = ends * glow * (0.47 + uIntensity * 0.14 + uTreble * 0.06);
      gl_FragColor = vec4(colour, alpha);
    }
  `;
  const ribbonUniforms = [];
  const arrangements = [
    { position: [-0.06, -0.27, 0.36], rotation: [-0.08, -0.11, -0.15], scale: 1 },
    { position: [0.04, 0.17, -0.14], rotation: [0.09, 0.23, 0.13], scale: 0.97 },
    { position: [0.10, 0.47, -0.46], rotation: [-0.11, -0.29, 0.22], scale: 0.82 },
    { position: [-0.13, -0.47, -0.42], rotation: [0.09, 0.12, -0.26], scale: 0.82 }
  ];
  for (let layer = 0; layer < arrangements.length; layer++) {
    const uniforms = {
      uTime: { value: 0 }, uBass: { value: 0 }, uMid: { value: 0 }, uTreble: { value: 0 },
      uEnergy: { value: 0 }, uIntensity: { value: 0.65 }, uLayer: { value: layer },
      uMint: { value: new THREE.Color(0x56e5ad) },
      uBlue: { value: new THREE.Color(0x4daecf) },
      uViolet: { value: new THREE.Color(0xa17be8) }
    };
    const material = new THREE.ShaderMaterial({
      uniforms, vertexShader: ribbonVertex, fragmentShader: ribbonFragment,
      side: THREE.DoubleSide, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, toneMapped: false
    });
    // Both sides are additive; rendering each twice would unnecessarily brighten
    // the veil and double the work on small devices.
    material.forceSinglePass = true;
    materials.push(material);
    ribbonUniforms.push(uniforms);
    const curtain = new THREE.Mesh(curtainGeometry, material);
    const arrangement = arrangements[layer];
    curtain.position.fromArray(arrangement.position);
    curtain.rotation.fromArray([...arrangement.rotation, 'XYZ']);
    curtain.scale.setScalar(arrangement.scale);
    curtain.name = `Aurora curtain ${layer + 1}`;
    group.add(curtain);
  }

  // A sparse, deterministic constellation gives the floating sculpture scale.
  // One point draw; no textures and no global random state.
  let seed = 7319;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const count = 150;
  const sparksPosition = new Float32Array(count * 3);
  const sparkSeeds = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const a = random() * Math.PI * 2;
    const r = Math.sqrt(random()) * 2.15;
    sparksPosition[i * 3] = Math.cos(a) * r;
    sparksPosition[i * 3 + 1] = (random() - 0.5) * 3.25;
    sparksPosition[i * 3 + 2] = Math.sin(a) * r * 0.51;
    sparkSeeds[i * 2] = random();
    sparkSeeds[i * 2 + 1] = random();
  }
  const sparkGeometry = new THREE.BufferGeometry();
  sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparksPosition, 3));
  sparkGeometry.setAttribute('aSeed', new THREE.BufferAttribute(sparkSeeds, 2));
  sparkGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2.8);
  geometries.push(sparkGeometry);
  const sparkUniforms = {
    uTime: { value: 0 }, uEnergy: { value: 0 }, uIntensity: { value: 0.65 },
    uColour: { value: new THREE.Color(0x77e8c5) }
  };
  const sparkMaterial = new THREE.ShaderMaterial({
    uniforms: sparkUniforms,
    vertexShader: /* glsl */`
      uniform float uTime;
      uniform float uEnergy;
      attribute vec2 aSeed;
      varying float vGlow;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.23 + aSeed.x * 6.28318) * 0.10;
        p.x += sin(uTime * 0.14 + aSeed.y * 6.28318) * 0.035;
        vec4 view = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * view;
        gl_PointSize = clamp((1.0 + aSeed.y * 1.4 + uEnergy) * 15.0 / max(-view.z, 1.0), 1.0, 6.0);
        vGlow = (0.22 + aSeed.y * 0.39) * (0.7 + 0.3 * sin(uTime * 0.41 + aSeed.x * 21.0));
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uColour;
      uniform float uIntensity;
      varying float vGlow;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float falloff = exp(-r * r * 4.0) * (1.0 - smoothstep(0.7, 1.0, r));
        gl_FragColor = vec4(uColour * (0.75 + uIntensity * 0.35), falloff * vGlow);
      }
    `,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false
  });
  materials.push(sparkMaterial);
  const sparks = new THREE.Points(sparkGeometry, sparkMaterial);
  sparks.name = 'Aurora suspended light';
  group.add(sparks);

  function update({ time = 0, bass = 0, mid = 0, treble = 0, energy = 0, motion = true, intensity = 0.65 } = {}) {
    if (disposed) return;
    // Do not even change audio uniforms while motion is disabled. A stopped
    // animation must remain visually still, including its brightness and particles.
    const amount = clamp(intensity);
    if (motion) {
      const phase = Number.isFinite(time) ? time : 0;
      for (const uniforms of ribbonUniforms) {
        uniforms.uTime.value = phase;
        uniforms.uBass.value = clamp(bass);
        uniforms.uMid.value = clamp(mid);
        uniforms.uTreble.value = clamp(treble);
        uniforms.uEnergy.value = clamp(energy);
        uniforms.uIntensity.value = amount;
      }
      sparkUniforms.uTime.value = phase;
      sparkUniforms.uEnergy.value = clamp(energy);
      sparkUniforms.uIntensity.value = amount;
    } else {
      // Keep the exact last frame when switching motion off. On initial disabled
      // creation the initialized uniforms already provide the still composition.
      for (const uniforms of ribbonUniforms) uniforms.uIntensity.value = amount;
      sparkUniforms.uIntensity.value = amount;
    }
  }

  function setPalette(world = {}) {
    if (disposed) return;
    const light = new THREE.Color(world.light ?? 0x56e5ad);
    const rim = new THREE.Color(world.rim ?? 0x4daecf);
    const tint = new THREE.Color(world.tint ?? 0xa17be8);
    // Keep the aurora's chromatic separation even in warm atmospheres. The world
    // supplies the dominant hue; mint and violet remain quiet secondary tones.
    for (const uniforms of ribbonUniforms) {
      uniforms.uMint.value.copy(light).lerp(new THREE.Color(0x59e4b5), 0.27);
      uniforms.uBlue.value.copy(rim).lerp(new THREE.Color(0x5aacd5), 0.15);
      uniforms.uViolet.value.copy(tint).lerp(new THREE.Color(0x9165da), 0.47);
    }
    sparkUniforms.uColour.value.copy(light).lerp(rim, 0.4);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    group.clear();
  }

  return { group, update, setPalette, dispose };
}
