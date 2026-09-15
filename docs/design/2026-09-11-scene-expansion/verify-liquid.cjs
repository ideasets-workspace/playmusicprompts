const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const root = 'C:/Berk/PlayMusicPrompts';
const dir = path.join(root, 'docs/design/2026-09-11-scene-expansion');
(async () => {
  const THREE = await import(pathToFileURL(path.join(root, 'website_html_templates/vendor/three/build/three.module.js')));
  const {createLiquidAsset} = await import(pathToFileURL(path.join(dir, 'liquid-asset.js')));
  const asset = createLiquidAsset(THREE), checks = [];
  const check = (name, value, evidence) => { checks.push({name, passed: !!value, evidence}); if (!value) throw Error(name); };
  const body = asset.group.children[0];
  const initial = body.geometry.attributes.position.array.slice();
  check('draw call and vertex budgets', asset.diagnostics.drawCalls < 15 && asset.diagnostics.vertices < 25000, asset.diagnostics);
  for (let i = 1; i <= 80; i++) asset.update({time:i/40, dt:.025, bass:.9, mid:.55, treble:.45, energy:.7, motion:true, active:true, spinVelocity:1});
  check('actual body deformation', body.geometry.attributes.position.array.some((v,i)=>Math.abs(v-initial[i])>.05));
  check('rotation responds', Math.abs(asset.group.rotation.y-.2)>.1, asset.group.rotation.y);
  let minLength = Infinity, maxLength = 0, finite = true;
  for (const mesh of asset.group.children) for (const attribute of ['position','normal']) {
    const a = mesh.geometry.attributes[attribute];
    for (let i = 0; i < a.count; i++) {
      finite &&= Number.isFinite(a.getX(i)) && Number.isFinite(a.getY(i)) && Number.isFinite(a.getZ(i));
      if (attribute === 'normal') {const length = Math.hypot(a.getX(i),a.getY(i),a.getZ(i)); minLength = Math.min(minLength,length); maxLength=Math.max(maxLength,length);}
    }
  }
  check('finite coordinates and normalized normals', finite && minLength>.999 && maxLength<1.001, {minLength,maxLength});
  body.geometry.computeBoundingBox();
  check('body remains inside framing', Math.max(...body.geometry.boundingBox.min.toArray().map(Math.abs),...body.geometry.boundingBox.max.toArray().map(Math.abs))<2.4, body.geometry.boundingBox);
  asset.update({motion:false, dt:.03, time:100, bass:1, mid:1, treble:1, active:true});
  const rest = body.geometry.attributes.position.array.slice(), rotation = asset.group.rotation.toArray();
  for(let i=0;i<10;i++)asset.update({motion:false,dt:.03,time:200+i,bass:1,mid:1,treble:1,active:true});
  check('motion off restores exact static rest', rest.every((v,i)=>v===initial[i]) && body.geometry.attributes.position.array.every((v,i)=>v===rest[i]), rotation);
  asset.setPalette({light:0xf47645,rim:0xc4739a,tint:0xefb9a4});
  check('palette reaches actual materials', asset.group.children[1].material.emissive.getHex()===0xf47645);
  asset.dispose();
  fs.writeFileSync(path.join(dir,'liquid-geometry-checks.json'),JSON.stringify({checks},null,2));
  console.log(JSON.stringify({checks},null,2));

  const {chromium} = require(path.join(root,'docs/design/2026-09-09-html-mockups/tools/node_modules/playwright'));
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-gpu-sandbox']});
  const page = await browser.newPage({viewport:{width:1200,height:1000},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const html = `<!DOCTYPE html><html><head><style>body{margin:0;background:#09090f}canvas{display:block}</style><script type="importmap">{"imports":{"three":"/vendor/three/build/three.module.js","three/addons/":"/vendor/three/examples/jsm/"}}</script></head><body><script type="module">
import * as THREE from 'three';import{RoomEnvironment}from'three/addons/environments/RoomEnvironment.js';import{createLiquidAsset}from'/liquid-asset.js';
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1200,1000);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.append(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x09090f);scene.environmentIntensity=.38;
const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;
scene.add(new THREE.HemisphereLight(0xbcb1ef,0x100a1c,.6));const key=new THREE.DirectionalLight(0xe6dfff,1.6);key.position.set(3,8,4);scene.add(key);const purple=new THREE.PointLight(0xaf70ff,35,16,2);purple.position.set(-3,3,2);scene.add(purple);const cyan=new THREE.PointLight(0x63dfed,24,15,2);cyan.position.set(3,2,-2);scene.add(cyan);
const camera=new THREE.PerspectiveCamera(38,1.2,.1,100);camera.position.set(4.6,1.7,10).normalize().multiplyScalar(8.6);camera.lookAt(0,0,0);const asset=createLiquidAsset(THREE);scene.add(asset.group);renderer.render(scene,camera);window.ready=true;window.preview=(t)=>{asset.update({time:t,dt:.1,bass:.7,mid:.55,treble:.4,motion:true,active:true,spinVelocity:1});renderer.render(scene,camera)};
</script></body></html>`;
  await page.route('**/liquid-preview.html',route=>route.fulfill({contentType:'text/html',body:html}));
  await page.route('**/liquid-asset.js',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(dir,'liquid-asset.js'),'utf8')}));
  await page.goto('http://127.0.0.1:4173/liquid-preview.html');await page.waitForFunction(()=>window.ready===true);
  await page.screenshot({path:path.join(dir,'liquid-rest-preview.png')});
  await page.evaluate(()=>{for(let i=1;i<80;i++)window.preview(i/10)});await page.screenshot({path:path.join(dir,'liquid-reactive-preview.png')});
  fs.writeFileSync(path.join(dir,'liquid-render-errors.json'),JSON.stringify({errors},null,2));
  await browser.close();if(errors.length)throw Error(errors.join('\n'));
})();
