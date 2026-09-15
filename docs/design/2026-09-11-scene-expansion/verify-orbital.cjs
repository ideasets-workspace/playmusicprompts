const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const assert = require('node:assert/strict');
(async () => {
  const root = 'C:/Berk/PlayMusicPrompts';
  const THREE = await import(pathToFileURL(path.join(root, 'website_html_templates/vendor/three/build/three.module.js')));
  const {createOrbitalAsset} = await import(pathToFileURL(path.join(__dirname, 'orbital-asset.js')));
  const asset = createOrbitalAsset(THREE);
  const checks = [], record = (name, evidence) => checks.push({name, passed:true, evidence});
  let drawCalls = 0, triangleCount = 0;
  asset.group.traverse(object => {
    if (object.isMesh || object.isLine || object.isPoints) drawCalls++;
    if (object.geometry) {
      for (const [name, attribute] of Object.entries(object.geometry.attributes)) assert(Array.from(attribute.array).every(Number.isFinite), name + ' finite');
      if (object.isMesh) triangleCount += (object.geometry.index?.count || object.geometry.attributes.position.count) / 3 * (object.isInstancedMesh ? object.count : 1);
    }
  });
  assert.equal(drawCalls,18); record('Geometry uses 18 draw calls with finite buffer attributes', {drawCalls, triangleCount});
  const metal = asset.group.children[0].children[0].children[0], normals = metal.geometry.attributes.normal;
  const outerNormal = new THREE.Vector3().fromBufferAttribute(normals, 30 * 8 + 3);
  const outerPos = new THREE.Vector3().fromBufferAttribute(metal.geometry.attributes.position, 30 * 8 + 3); outerPos.z=0; outerPos.normalize();
  assert(outerNormal.dot(outerPos)>.6); record('Metal band outer normals face outward', outerNormal.dot(outerPos));
  const vec = new THREE.Vector3(), matrix = new THREE.Matrix4(), combined = new THREE.Matrix4();
  function bounds() {
    asset.group.updateMatrixWorld(true); const box = new THREE.Box3();
    asset.group.traverse(object => {
      if (!object.geometry) return;
      const positions = object.geometry.attributes.position;
      for (let instance=0; instance<(object.isInstancedMesh ? object.count : 1); instance++) {
        if (object.isInstancedMesh) {object.getMatrixAt(instance,matrix); combined.multiplyMatrices(object.matrixWorld,matrix);} else combined.copy(object.matrixWorld);
        for (let i=0;i<positions.count;i++) box.expandByPoint(vec.fromBufferAttribute(positions,i).applyMatrix4(combined));
      }
    }); return box;
  }
  const union = new THREE.Box3();
  for(let i=0;i<240;i++) {
    asset.update({dt:1/30, motion:true, active:true, spinVelocity:4.7, bass:1, mid:1, treble:1, energy:1});
    if(i%8===0) union.union(bounds());
  }
  assert(union.max.x<2.7&&union.min.x>-2.7&&union.max.z<2.7&&union.min.z>-2.7);
  assert(union.max.y<2.15&&union.min.y>-2.15); record('Maximum audio and fast motion fit the integration envelope', {min:union.min.toArray(), max:union.max.toArray()});
  function fingerprint() {
    const data=[]; asset.group.updateMatrixWorld(true);
    asset.group.traverse(object=>{data.push(...object.matrix.elements); if(object.isInstancedMesh)data.push(...object.instanceMatrix.array); if(object.material){const material=object.material;data.push(material.emissiveIntensity||0,material.opacity||0);}});
    return JSON.stringify(data);
  }
  const before=fingerprint();
  for(let i=0;i<90;i++)asset.update({dt:1/30,time:i,motion:false,active:true,bass:i/90,mid:1,treble:1,energy:1,intensity:i/90,spinVelocity:4});
  assert.equal(fingerprint(),before); record('Motion off freezes all transforms, instances and reactive materials', '90 changing input frames; exact numeric state unchanged');
  asset.setPalette({light:0xf47645,rim:0xc4739a,tint:0xefb9a4});
  assert.equal(metal.material.color.getHex(),0x9babc6); assert.notEqual(fingerprint(),undefined);
  const coreMaterial=asset.group.children[3].children[0].material;
  assert.equal(coreMaterial.emissive.getHex(),0xf47645); record('Palette changes the luminous/core materials and preserves neutral chrome','Ember palette applied');
  asset.update({dt:1/30,motion:true,active:true,bass:.5,mid:.4,treble:.3,energy:.5,spinVelocity:1});
  assert.notEqual(fingerprint(),before); record('Motion resumes after a full freeze','Numeric transforms and instances change');
  const report={threeRevision:THREE.REVISION,checks,passed:checks.length,limitations:'Geometry and update contract verified in actual local Three.js. Parent must assess rendered appearance in the integrated player.'};
  fs.writeFileSync(path.join(__dirname,'orbital-verification.json'),JSON.stringify(report,null,2)+'\n');
  asset.dispose();console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
