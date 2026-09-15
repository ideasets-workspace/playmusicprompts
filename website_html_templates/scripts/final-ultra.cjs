const {chromium}=require('../../docs/design/2026-09-09-html-mockups/tools/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});
const checks=[],errors=[],out=path.resolve(__dirname,'../verification'),base='http://127.0.0.1:4173/player-three.html';
const check=(name,pass,detail)=>{checks.push({name,pass,detail});if(!pass)throw Error(name);};
try{for(const[width,height]of[[320,850],[390,844],[820,1180],[1504,1048],[1920,1080]]){
 const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.evaluate(()=>PMP_PLAYER.ready);await page.waitForFunction(()=>window.PMP_ROOM?.diagnostics.frames>35);await page.evaluate(()=>document.fonts.ready);
 check(`Clean ${width}px layout and actual scene`,await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth&&PMP_ROOM.diagnostics.webgl&&document.querySelector('#scene canvas').getBoundingClientRect().width>200));
 await page.screenshot({path:path.join(out,`ultra-final-${width}.png`),fullPage:true});
 if([320,390,1504].includes(width)){
  await page.locator('#sound-toggle').click();
  for(const tab of ['tone','space','dynamics','saved']){await page.locator('#tab-'+tab).click();check(`${width}px ${tab} panel fits`,await page.locator('#sound-panel').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&el.scrollWidth<=el.clientWidth;}));await page.screenshot({path:path.join(out,`ultra-final-sound-${tab}-${width}.png`),fullPage:true});}
  await page.keyboard.press('Escape');check(`${width}px modal returns focus`,await page.locator('#sound-toggle').evaluate(el=>el===document.activeElement));
  await page.locator('#worlds-toggle').click();await page.screenshot({path:path.join(out,`ultra-final-worlds-${width}.png`),fullPage:true});check(`${width}px nine world choices`,await page.locator('#worlds-panel .world-card').count()===9);await page.locator('#worlds-panel .world-card[data-world=aurora]').click();await page.keyboard.press('Escape');await page.waitForTimeout(400);await page.screenshot({path:path.join(out,`ultra-final-aurora-${width}.png`),fullPage:true});
  await page.locator('#session-toggle').click();await page.screenshot({path:path.join(out,`ultra-final-session-${width}.png`),fullPage:true});await page.keyboard.press('Escape');
 }
 await page.close();
}
const vendor=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../vendor/three/manifest.json')));check('Bundled Three.js hashes match',vendor.files.every(f=>crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../vendor/three',f.file))).digest('hex')===f.sha256));
const original=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../docs/research/_sources/2026-09-05-apis-S15-npm-three.json')));check('Pinned official package integrity matches','sha512-'+crypto.createHash('sha512').update(fs.readFileSync(path.resolve(__dirname,'three-package/three.tgz'))).digest('base64')===original.dist.integrity);
}catch(e){errors.push(e.stack);process.exitCode=1;}finally{const report={checks,errors,pass:!errors.length&&checks.every(c=>c.pass),date:new Date().toISOString()};fs.writeFileSync(path.join(out,'ultra-final-checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();}})();
