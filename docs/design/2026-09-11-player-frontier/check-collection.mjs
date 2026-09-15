import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from '../../../website_html_templates/vendor/three/build/three.module.js';
const root=new URL('../../../website_html_templates/',import.meta.url);
let source=fs.readFileSync(new URL('player-three-models.js',root),'utf8');
source=source.replace("from 'three'",()=>`from '${new URL('vendor/three/build/three.module.js',root).href}'`);
source=source.replaceAll(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL(path,root).href}'`);
const {createSceneCollection}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const scene=new THREE.Scene(),collection=createSceneCollection(scene),checks=[];
const world={light:0xb56aff,rim:0x58cced,tint:0xa79cc1};
collection.setPalette(world);
assert.equal(collection.select('record'),'record');assert.equal(scene.children.length,0);checks.push('Accepted Record creates no alternative geometry');
for(const id of ['aurora','orbital','liquid']){
 assert.equal(collection.select(id),id);assert.ok(collection.view);
 assert.equal(scene.children.filter(g=>g.visible).length,1);
 collection.update({motion:true,active:true,dt:1/60,bass:.4,energy:.4,onset:true,pulse:.8,spectrum:new Float32Array(64).fill(.3)});
}
assert.equal(scene.children.length,3);checks.push('All three production assets lazily instantiate with camera profiles and a single visible world');
const objects=[...scene.children];for(let i=0;i<30;i++)collection.select(['record','aurora','orbital','liquid'][i%4]);assert.deepEqual(scene.children,objects);checks.push('Repeated selection reuses GPU assets rather than accumulating worlds');
collection.select('record');assert.equal(scene.children.filter(g=>g.visible).length,0);assert.equal(collection.view,null);checks.push('Returning to Record hides every alternative and clears bespoke camera profile');
collection.dispose();assert.equal(scene.children.length,0);collection.dispose();checks.push('Collection disposal removes all lazily loaded worlds and is idempotent');
console.log(JSON.stringify({passed:checks.length,checks,scope:'Actual production collection and Three classes; module resolution alone adapted for Node. Browser rendering separately inspected.'},null,2));
