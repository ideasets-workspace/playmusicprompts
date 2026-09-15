/** A continuous, lit liquid-metal sculpture. Uses the host renderer and animation clock. */
export function createLiquidAsset(THREE) {
  const group = new THREE.Group();
  group.name = 'liquid-chrome-sculpture';
  const width = 128, height = 80, stride = width + 1;
  const bodyGeometry = new THREE.SphereGeometry(1, width, height);
  const directions = new Float32Array(bodyGeometry.attributes.position.array);
  bodyGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
  bodyGeometry.attributes.normal.setUsage(THREE.DynamicDrawUsage);
  // Neutral silver retains the environment's tonal detail rather than becoming an emissive blob.
  const chrome = new THREE.MeshPhysicalMaterial({
    color: 0xc9ccd5, metalness: 1, roughness: .17,
    clearcoat: 1, clearcoatRoughness: .11, envMapIntensity: 1.45
  });
  const dropletMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xbac5d5, metalness: .97, roughness: .12,
    clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.55
  });
  const seamMaterials = [0xb56aff, 0x58cced].map(color => new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: .62, metalness: .55, roughness: .26
  }));
  const body = new THREE.Mesh(bodyGeometry, chrome);
  body.name = 'continuous-fluid-body';
  body.frustumCulled = false;
  group.add(body);

  const traceSegments = 128, traceSides = 5;
  const traceCenters = Array.from({length: traceSegments + 1}, () => new THREE.Vector3());
  const tangent = new THREE.Vector3(), outward = new THREE.Vector3(), lateral = new THREE.Vector3();
  const scratch = new THREE.Vector3();
  const traces = [];
  for (let j = 0; j < 3; j++) {
    const geometry = new THREE.BufferGeometry();
    const count = (traceSegments + 1) * (traceSides + 1);
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage));
    const indices = [];
    for (let i = 0; i < traceSegments; i++) for (let k = 0; k < traceSides; k++) {
      const a = i * (traceSides + 1) + k, b = a + traceSides + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
    geometry.setIndex(indices);
    const mesh = new THREE.Mesh(geometry, seamMaterials[j % 2]);
    mesh.name = `surface-current-${j + 1}`;
    mesh.frustumCulled = false;
    group.add(mesh);
    traces.push(mesh);
  }
  const dropletGeometry = new THREE.SphereGeometry(1, 32, 24);
  const droplets = Array.from({length: 4}, (_, i) => {
    const mesh = new THREE.Mesh(dropletGeometry, dropletMaterial);
    mesh.name = `mercury-droplet-${i + 1}`;
    group.add(mesh);
    return mesh;
  });
  let elapsed = 0, turn = 0, geometryClock = 1, initialized = false;
  let smoothBass = 0, smoothMid = 0, smoothTreble = 0;
  const diagnostics = { vertices: 0, triangles: 0, drawCalls: 8, deformationRevision: 0 };

  // Direction-space harmonics give one watertight, asymmetric body, with no intersecting blobs.
  function surface(nx, ny, nz, time, bass, mid, treble, target) {
    const equator = Math.max(0, 1 - ny * ny);
    const angle = Math.atan2(nz, nx);
    const lobe = Math.sin(angle * 3 + ny * 2.1 + time * .19);
    const fold = Math.cos(angle * 2 - ny * 4.3 - time * .14);
    const ripple = Math.sin(nx * 7.2 + nz * 5.1 - ny * 4.4 + time * 1.05);
    const radius = 1.43
      + (.31 + bass * .09) * lobe * Math.pow(equator, 1.2)
      + (.19 + mid * .055) * fold * equator
      + .14 * Math.sin(ny * 4.8 + time * .33)
      + (.008 + treble * .027) * ripple * equator;
    const breath = 1 + bass * .028;
    target.set(
      (nx * radius + .24 * Math.sin(ny * 2.5 + time * .18)) * breath,
      (ny * radius * 1.13 + .08 * Math.sin(nx * 3 + time * .1) * equator) * breath,
      (nz * radius * .97 + .09 * Math.sin(ny * 3 - time * .13)) * breath
    );
    return target;
  }

  function smoothSeamNormals() {
    const normals = bodyGeometry.attributes.normal;
    // SphereGeometry duplicates its seam and pole vertices. Weld their normal values after deformation.
    for (let row = 1; row < height; row++) {
      const a = row * stride, b = a + width;
      scratch.set(normals.getX(a) + normals.getX(b), normals.getY(a) + normals.getY(b), normals.getZ(a) + normals.getZ(b)).normalize();
      normals.setXYZ(a, scratch.x, scratch.y, scratch.z);
      normals.setXYZ(b, scratch.x, scratch.y, scratch.z);
    }
    for (const row of [0, height]) {
      scratch.set(0, 0, 0);
      for (let col = 0; col <= width; col++) {
        const i = row * stride + col;
        scratch.x += normals.getX(i); scratch.y += normals.getY(i); scratch.z += normals.getZ(i);
      }
      scratch.normalize();
      for (let col = 0; col <= width; col++) normals.setXYZ(row * stride + col, scratch.x, scratch.y, scratch.z);
    }
    normals.needsUpdate = true;
  }

  function deform(time, bass, mid, treble) {
    const positions = bodyGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const offset = i * 3;
      surface(directions[offset], directions[offset + 1], directions[offset + 2], time, bass, mid, treble, scratch);
      positions.setXYZ(i, scratch.x, scratch.y, scratch.z);
    }
    positions.needsUpdate = true;
    bodyGeometry.computeVertexNormals();
    smoothSeamNormals();
    for (let j = 0; j < traces.length; j++) {
      for (let i = 0; i <= traceSegments; i++) {
        const angle = i / traceSegments * Math.PI * 2;
        const polar = (.32 + j * .175 + .038 * Math.sin(angle * 2 + j * 1.3 + time * .12)) * Math.PI;
        surface(Math.cos(angle) * Math.sin(polar), Math.cos(polar), Math.sin(angle) * Math.sin(polar), time, bass, mid, treble, traceCenters[i]);
        traceCenters[i].multiplyScalar(1.0045);
      }
      const positions = traces[j].geometry.attributes.position, normals = traces[j].geometry.attributes.normal;
      for (let i = 0; i <= traceSegments; i++) {
        const current = traceCenters[i];
        tangent.subVectors(traceCenters[(i + 1) % traceSegments], traceCenters[(i + traceSegments - 1) % traceSegments]).normalize();
        outward.copy(current).normalize();
        lateral.crossVectors(tangent, outward).normalize();
        outward.crossVectors(lateral, tangent).normalize();
        const thickness = .0048 + treble * .0013;
        for (let k = 0; k <= traceSides; k++) {
          const angle = k / traceSides * Math.PI * 2, index = i * (traceSides + 1) + k;
          const cosine = Math.cos(angle), sine = Math.sin(angle);
          const x = outward.x * cosine + lateral.x * sine;
          const y = outward.y * cosine + lateral.y * sine;
          const z = outward.z * cosine + lateral.z * sine;
          positions.setXYZ(index, current.x + x * thickness, current.y + y * thickness, current.z + z * thickness);
          normals.setXYZ(index, x, y, z);
        }
      }
      positions.needsUpdate = true; normals.needsUpdate = true;
    }
    diagnostics.deformationRevision++;
  }

  function update({time = 0, dt = 0, bass = 0, mid = 0, treble = 0, energy = 0, motion = true, intensity = .65, active = false, spinVelocity = 0} = {}) {
    const delta = Math.max(0, Math.min(.1, Number(dt) || 0));
    const enabled = !!motion, sounding = enabled && active;
    const easing = 1 - Math.exp(-delta * 7);
    const bounded = value => Math.max(0, Math.min(1.8, Number(value) || 0));
    if (enabled) {
      smoothBass += ((sounding ? bounded(bass) : 0) - smoothBass) * easing;
      smoothMid += ((sounding ? bounded(mid) : 0) - smoothMid) * easing;
      smoothTreble += ((sounding ? bounded(treble) : 0) - smoothTreble) * easing;
      // Increment only the selected, moving asset. A host clock jump cannot skip its fluid pose.
      elapsed += delta;
      turn += (Number(spinVelocity) || 0) * delta * .22;
      geometryClock += delta;
    }
    if (enabled || !initialized) {
      group.rotation.set(Math.sin(elapsed * .16) * .075, turn + .2, -.1);
      if (geometryClock >= 1 / 40 || !initialized) {
        deform(elapsed, smoothBass, smoothMid, smoothTreble);
        geometryClock = 0;
      }
      for (let i = 0; i < droplets.length; i++) {
        const orbit = elapsed * (.075 + i * .013) + i * 2.18;
        const radius = 2.03 + (i % 2) * .19;
        droplets[i].position.set(Math.cos(orbit) * radius, Math.sin(orbit * 1.13 + i) * 1.24, Math.sin(orbit) * radius * .7);
        const size = [.16, .105, .19, .085][i] * (1 + smoothBass * .13);
        droplets[i].scale.set(size * .87, size * (1.3 + smoothMid * .25), size * .87);
        droplets[i].rotation.set(Math.sin(orbit) * .5, 0, orbit * .4);
      }
      initialized = true;
    }
    const brightness = .4 + Math.max(0, Math.min(1, Number(intensity) || 0)) * .38;
    seamMaterials[0].emissiveIntensity = brightness + smoothTreble * .32;
    seamMaterials[1].emissiveIntensity = brightness * .85 + smoothMid * .22;
    diagnostics.initialized = initialized;
  }

  function setPalette(world = {}) {
    const light = world.light ?? 0xb56aff, rim = world.rim ?? 0x58cced;
    seamMaterials[0].color.setHex(light); seamMaterials[0].emissive.setHex(light);
    seamMaterials[1].color.setHex(rim); seamMaterials[1].emissive.setHex(rim);
    chrome.color.setHex(0xd0d2da).lerp(new THREE.Color(world.tint ?? 0xa79cc1), .14);
    dropletMaterial.color.setHex(0xc5ceda).lerp(new THREE.Color(rim), .12);
  }

  update({motion: false});
  for (const mesh of group.children) {
    diagnostics.vertices += mesh.geometry.attributes.position.count;
    diagnostics.triangles += mesh.geometry.index.count / 3;
  }
  group.userData.liquid = diagnostics;
  return {group, update, setPalette, diagnostics, dispose() {
    bodyGeometry.dispose(); dropletGeometry.dispose();
    for (const mesh of traces) mesh.geometry.dispose();
    chrome.dispose(); dropletMaterial.dispose(); seamMaterials.forEach(material => material.dispose());
  }};
}
