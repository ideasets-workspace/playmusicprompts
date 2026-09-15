/** A self-contained kinetic instrument. The owner supplies the Three.js namespace. */
export function createOrbitalAsset(THREE) {
  const TAU = Math.PI * 2;
  const group = new THREE.Group();
  group.name = 'Orbital instrument';
  group.scale.y = .82;
  const ownedGeometries = new Set();
  const ownedMaterials = new Set();
  const ownGeometry = geometry => (ownedGeometries.add(geometry), geometry);
  const ownMaterial = material => (ownedMaterials.add(material), material);
  const clamp = value => Math.max(0, Math.min(1, Number(value) || 0));
  const chrome = ownMaterial(new THREE.MeshStandardMaterial({color: 0x9babc6, metalness: 1, roughness: .22}));
  const polished = ownMaterial(new THREE.MeshStandardMaterial({color: 0xe0e5ee, metalness: .96, roughness: .16}));
  const luminous = ownMaterial(new THREE.MeshStandardMaterial({color: 0xb998ee, emissive: 0xb56aff, emissiveIntensity: 1.2, metalness: .36, roughness: .25}));
  const rim = ownMaterial(new THREE.MeshStandardMaterial({color: 0xb5d7e3, emissive: 0x58cced, emissiveIntensity: .9, metalness: .44, roughness: .2}));
  const crystalMaterial = ownMaterial(new THREE.MeshPhysicalMaterial({color: 0x9c8fc6, emissive: 0xb56aff, emissiveIntensity: .11, metalness: .58, roughness: .13, clearcoat: 1, clearcoatRoughness: .1, flatShading: true}));
  const crystalEdges = ownMaterial(new THREE.LineBasicMaterial({color: 0xcfb8f5, transparent: true, opacity: .44}));
  const dummy = new THREE.Object3D();

  // A closed, bevelled metal band, rather than a wire torus. Its flat faces catch the shared room lights.
  function arcBand(radius, sweep) {
    const steps = 76;
    const profile = [[-.046,-.026],[-.029,-.057],[.029,-.057],[.046,-.026],[.046,.026],[.029,.057],[-.029,.057],[-.046,.026]];
    const positions = [], indices = [];
    for (let i = 0; i <= steps; i++) {
      const a = sweep * i / steps;
      for (const [radial, z] of profile) positions.push(Math.cos(a) * (radius + radial), Math.sin(a) * (radius + radial), z);
    }
    for (let i = 0; i < steps; i++) for (let j = 0; j < 8; j++) {
      const a = i * 8 + j, b = i * 8 + (j + 1) % 8, c = (i + 1) * 8 + j, d = (i + 1) * 8 + (j + 1) % 8;
      indices.push(a, c, b, b, c, d);
    }
    const startCenter = positions.length / 3; positions.push(radius, 0, 0);
    const endCenter = positions.length / 3; positions.push(Math.cos(sweep) * radius, Math.sin(sweep) * radius, 0);
    for (let j = 0; j < 8; j++) {
      indices.push(startCenter, j, (j + 1) % 8);
      indices.push(endCenter, steps * 8 + (j + 1) % 8, steps * 8 + j);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices); geometry.computeVertexNormals(); geometry.computeBoundingSphere();
    return ownGeometry(geometry);
  }

  const sweep = TAU / 3 - .34;
  const tickGeometry = ownGeometry(new THREE.BoxGeometry(.018, .086, .015));
  const claspGeometry = ownGeometry(new THREE.BoxGeometry(.092, .047, .132));
  const orbitSpecs = [
    {radius: 1.57, tilt: [.66, -.31, .32], speed: .29, sign: 1},
    {radius: 1.99, tilt: [-.88, .46, -.65], speed: -.20, sign: -1},
    {radius: 2.38, tilt: [.36, -.66, 1.13], speed: .13, sign: 1}
  ];
  const orbits = orbitSpecs.map((spec, index) => {
    const orbit = new THREE.Group(); orbit.name = `Gimbal ${index + 1}`;
    orbit.rotation.set(...spec.tilt); group.add(orbit);
    const gimbal = new THREE.Group(); orbit.add(gimbal);
    const metal = new THREE.InstancedMesh(arcBand(spec.radius, sweep), chrome, 3);
    const lightTrack = new THREE.InstancedMesh(ownGeometry(new THREE.TorusGeometry(spec.radius - .032, .009, 6, 88, sweep)), index === 1 ? rim : luminous, 3);
    for (let i = 0; i < 3; i++) {
      dummy.position.set(0, 0, 0); dummy.rotation.set(0, 0, i * TAU / 3); dummy.scale.setScalar(1); dummy.updateMatrix();
      metal.setMatrixAt(i, dummy.matrix);
      dummy.position.z = .059; dummy.updateMatrix(); lightTrack.setMatrixAt(i, dummy.matrix);
    }
    gimbal.add(metal, lightTrack);
    const ticks = new THREE.InstancedMesh(tickGeometry, polished, 33);
    for (let i = 0; i < 33; i++) {
      const section = Math.floor(i / 11), step = i % 11;
      const a = section * TAU / 3 + .1 + (sweep - .2) * step / 10;
      dummy.position.set(Math.cos(a) * spec.radius, Math.sin(a) * spec.radius, .069);
      dummy.rotation.set(0, 0, a - Math.PI / 2); dummy.scale.set(1, step % 5 === 0 ? 1 : .44, 1); dummy.updateMatrix(); ticks.setMatrixAt(i, dummy.matrix);
    }
    gimbal.add(ticks);
    const clasps = new THREE.InstancedMesh(claspGeometry, index === 1 ? luminous : rim, 6);
    for (let i = 0; i < 6; i++) {
      const a = Math.floor(i / 2) * TAU / 3 + (i % 2 ? sweep - .023 : .023);
      dummy.position.set(Math.cos(a) * spec.radius, Math.sin(a) * spec.radius, 0);
      dummy.rotation.set(0, 0, a); dummy.scale.setScalar(1); dummy.updateMatrix(); clasps.setMatrixAt(i, dummy.matrix);
    }
    gimbal.add(clasps);
    return {...spec, orbit, gimbal};
  });

  const core = new THREE.Group(); group.add(core);
  const crystalGeometry = ownGeometry(new THREE.OctahedronGeometry(.61, 0));
  const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial); crystal.scale.set(.78, 1.25, .78); core.add(crystal);
  const facets = new THREE.LineSegments(ownGeometry(new THREE.EdgesGeometry(crystalGeometry)), crystalEdges); facets.scale.copy(crystal.scale); core.add(facets);
  const inner = new THREE.Mesh(ownGeometry(new THREE.IcosahedronGeometry(.21, 1)), rim); inner.position.set(0, .96, 0); core.add(inner);
  const shards = new THREE.InstancedMesh(ownGeometry(new THREE.OctahedronGeometry(.15, 0)), polished, 8); core.add(shards);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU;
    dummy.position.set(Math.cos(a) * .88, Math.sin(a * 2) * .23, Math.sin(a) * .88);
    dummy.rotation.set(.2, a, .35); dummy.scale.set(.55, 1.25 + (i % 2) * .6, .55); dummy.updateMatrix(); shards.setMatrixAt(i, dummy.matrix);
  }

  const satelliteGeometry = ownGeometry(new THREE.IcosahedronGeometry(.113, 0));
  const satellites = new THREE.InstancedMesh(satelliteGeometry, crystalMaterial, 6);
  const satelliteLights = new THREE.InstancedMesh(ownGeometry(new THREE.OctahedronGeometry(.042, 0)), rim, 6);
  satellites.instanceMatrix.setUsage(THREE.DynamicDrawUsage); satelliteLights.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  satellites.frustumCulled = false; satelliteLights.frustumCulled = false; group.add(satellites, satelliteLights);
  let phase = 0, rotation = 0, motionInitialized = false;
  const satellitePoint = new THREE.Vector3();
  const diagnostics = {drawCalls: 18, phase: 0, updates: 0};

  function setPalette(world = {}) {
    const light = world.light ?? 0xb56aff, edge = world.rim ?? 0x58cced, tint = world.tint ?? 0xa79cc1;
    luminous.emissive.setHex(light); luminous.color.setHex(light).lerp(new THREE.Color(0xe6e5ee), .36);
    rim.emissive.setHex(edge); rim.color.setHex(edge).lerp(new THREE.Color(0xecf5ff), .48);
    crystalMaterial.color.setHex(tint); crystalMaterial.emissive.setHex(light); crystalEdges.color.setHex(light).lerp(new THREE.Color(0xffffff), .4);
  }

  function update({dt = 0, bass = 0, mid = 0, treble = 0, energy = 0, motion = true, intensity = .65, active = false, spinVelocity = 0} = {}) {
    // Complete geometric/material freeze when the owner disables motion. Palette changes remain explicit.
    if (!motion && motionInitialized) return;
    const step = motion ? Math.max(0, Math.min(.1, Number(dt) || 0)) : 0;
    const low = motion ? clamp(bass) : 0, middle = motion ? clamp(mid) : 0, high = motion ? clamp(treble) : 0;
    const drive = motion ? clamp(energy) : 0;
    const velocity = motion ? Math.max(0, Number(spinVelocity) || 0) : 0;
    const running = active ? 1 : Math.min(1, velocity);
    phase += step * (.18 + running * .82 + velocity * .12);
    rotation += step * (.12 + velocity * .34);
    group.rotation.y = Math.sin(phase * .12) * .16;
    for (let i = 0; i < orbits.length; i++) {
      const orbital = orbits[i];
      orbital.orbit.rotation.set(orbital.tilt[0] + Math.sin(phase * .16 + i) * .10, orbital.tilt[1] + Math.cos(phase * .11 + i) * .13, orbital.tilt[2]);
      orbital.gimbal.rotation.z = phase * orbital.speed;
      orbital.gimbal.scale.setScalar(1 + low * (.011 + i * .006));
      orbital.orbit.updateMatrix(); orbital.gimbal.updateMatrix();
      for (let j = 0; j < 2; j++) {
        const id = i * 2 + j, a = phase * (orbital.speed + .18 * orbital.sign) + i * 1.8 + j * Math.PI;
        satellitePoint.set(Math.cos(a) * orbital.radius, Math.sin(a) * orbital.radius, .14 + high * .05);
        satellitePoint.applyMatrix4(orbital.gimbal.matrix).applyMatrix4(orbital.orbit.matrix);
        dummy.position.copy(satellitePoint); dummy.rotation.set(phase * .31, a, phase * .23); dummy.scale.setScalar(1 + high * .30); dummy.updateMatrix(); satellites.setMatrixAt(id, dummy.matrix);
        dummy.scale.setScalar(1); dummy.position.y += .07; dummy.updateMatrix(); satelliteLights.setMatrixAt(id, dummy.matrix);
      }
    }
    core.rotation.set(Math.sin(phase * .19) * .18, rotation, -.13);
    core.scale.setScalar(1 + low * .10);
    shards.rotation.y = -rotation * .65;
    shards.rotation.z = Math.sin(phase * .21) * .18;
    inner.position.y = .93 + middle * .10 + Math.sin(phase * .8) * .025;
    inner.scale.setScalar(.82 + middle * .28);
    luminous.emissiveIntensity = .55 + clamp(intensity) * .85 + middle * .50;
    rim.emissiveIntensity = .45 + clamp(intensity) * .6 + high * .32;
    crystalMaterial.emissiveIntensity = .045 + drive * .16;
    satellites.instanceMatrix.needsUpdate = true; satelliteLights.instanceMatrix.needsUpdate = true;
    diagnostics.phase = phase; diagnostics.updates++; motionInitialized = true;
  }

  setPalette(); update({motion: false});
  return {group, update, setPalette, diagnostics, dispose() {
    for (const geometry of ownedGeometries) geometry.dispose();
    for (const material of ownedMaterials) material.dispose();
  }};
}
