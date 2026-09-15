/* Focused probe for the Open 3D hand-over (owner order 2026-09-15): on the running local website, start the
 * catalogue song from the bottom bar, press "Open 3D", and measure inside player-three.html whether the room
 * resumed the SAME song (#track-title, <audio>.currentSrc, paused state). Headless Chromium has no GPU, so
 * WebGL-context console errors are counted separately from every other console error.
 * Read-only against the server. Run from the website directory: node scripts/probe-open-3d.mjs
 */
import {createRequire} from 'node:module';
const require = createRequire('c:/Berk/PlayMusicPrompts/docs/design/2026-09-09-html-mockups/tools/package.json');
const {chromium} = require('playwright');
const base = 'http://127.0.0.1:4177';

const browser = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader']});
const page = await browser.newPage({viewport: {width: 1440, height: 900}});
const webgl = [], other = [];
page.on('console', m => { if (m.type() !== 'error') return; (/WebGL/i.test(m.text()) ? webgl : other).push(m.text().slice(0, 160)); });
page.on('pageerror', e => other.push('pageerror: ' + String(e).slice(0, 160)));
await page.goto(`${base}/index.html`, {waitUntil: 'networkidle'});
await page.waitForTimeout(1200);
await page.click('[data-action="play"]');
await page.waitForFunction(() => { const a = document.querySelector('#audio'); return a && a.currentSrc && !a.paused; }, null, {timeout: 10000});
const before = await page.evaluate(() => ({title: document.querySelector('#track-title').textContent, src: document.querySelector('#audio').currentSrc, time: document.querySelector('#audio').currentTime}));
await page.click('.open-3d-button');
await page.waitForURL(/player-three\.html/, {timeout: 15000});
await page.waitForFunction(() => document.querySelector('#track-title') && !/Every world starts/.test(document.querySelector('#track-title').textContent), null, {timeout: 15000}).catch(() => {});
await page.waitForTimeout(1500);
const after = await page.evaluate(() => { const a = document.querySelector('audio'); return {url: location.pathname, title: document.querySelector('#track-title')?.textContent, src: a?.currentSrc || null, paused: a ? a.paused : null, time: a ? a.currentTime : null}; });
await page.screenshot({path: '.state/verification/2026-09-15/room-open-3d-1440.png'});
await browser.close();
console.log(JSON.stringify({before, after, sameSong: before.title === after.title && !!after.src && after.src === before.src, webglConsoleErrors: webgl.length, otherConsoleErrors: other}, null, 2));
