/* Browser verification of the 2026-09-15 changes against the running local website (http://127.0.0.1:4177).
 * Read-only against the server: no creation is submitted, no account is touched. Measures, per viewport
 * (375 / 768 / 1440): console + page errors, horizontal overflow, that the Create & Play row sits directly
 * under the prompt box (DOM order + geometry), that the Open 3D control is present, and (1440 only) that
 * pressing Play then "Open 3D" navigates into player-three.html carrying the same song.
 * Screenshots and report.json are written under .state/verification/2026-09-15/.
 * Uses the Playwright installed for the design mockups (docs/design/2026-09-09-html-mockups/tools/node_modules).
 * Run from the website directory: node scripts/verify-20260915.mjs
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';

const require = createRequire('c:/Berk/PlayMusicPrompts/docs/design/2026-09-09-html-mockups/tools/package.json');
const {chromium} = require('playwright');
const base = 'http://127.0.0.1:4177';
const outDir = '.state/verification/2026-09-15';
mkdirSync(outDir, {recursive: true});
const widths = [375, 768, 1440];
const report = [];

const browser = await chromium.launch();
for (const width of widths) {
  const page = await browser.newPage({viewport: {width, height: 900}});
  const consoleErrors = [], pageErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => pageErrors.push(String(e).slice(0, 200)));
  await page.goto(`${base}/index.html`, {waitUntil: 'networkidle'});
  await page.waitForTimeout(1500);
  const geometry = await page.evaluate(() => {
    const rect = sel => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return {top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height), display: getComputedStyle(el).display}; };
    const form = document.querySelector('#composer');
    const order = [...form.children].map(el => el.className || el.id || el.tagName.toLowerCase());
    return {
      overflowPx: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      promptWrap: rect('.prompt-wrap'), creationActions: rect('.creation-actions'), quickControls: rect('.quick-controls'),
      createButton: rect('#create-button'), open3dBar: rect('.open-3d-button'),
      formOrder: order,
      titleCount: document.querySelectorAll('[data-action="open-3d"]').length,
    };
  });
  await page.screenshot({path: `${outDir}/index-${width}.png`, fullPage: false});
  const entry = {width, consoleErrors, pageErrors, ...geometry,
    createRowDirectlyUnderPrompt: !!(geometry.promptWrap && geometry.creationActions && geometry.creationActions.top >= geometry.promptWrap.bottom && geometry.creationActions.top - geometry.promptWrap.bottom <= 24 && geometry.quickControls && geometry.quickControls.top >= geometry.creationActions.bottom)};
  if (width === 1440) {
    // Real interaction: play the first catalogue song via the transport, then open it in 3D.
    await page.click('[data-action="play"]');
    await page.waitForTimeout(2500);
    const before = await page.evaluate(() => ({title: document.querySelector('#track-title')?.textContent, paused: document.querySelector('#audio')?.paused, src: document.querySelector('#audio')?.currentSrc}));
    entry.playedTitle = before.title; entry.audioPaused = before.paused; entry.audioSrc = before.src;
    await page.click('.open-3d-button');
    await page.waitForURL(/player-three\.html/, {timeout: 15000}).catch(() => {});
    await page.waitForTimeout(4000);
    const room = await page.evaluate(() => ({url: location.pathname, roomTitle: document.querySelector('#title, .now-title, [data-room-title]')?.textContent?.trim() || null, bodyText: document.body.innerText.slice(0, 400)}));
    entry.afterOpen3d = room;
    entry.roomCarriesSong = room.url.endsWith('/player-three.html') && typeof before.title === 'string' && room.bodyText.includes(before.title);
    await page.screenshot({path: `${outDir}/room-after-open-3d-${width}.png`, fullPage: false});
  }
  report.push(entry);
  await page.close();
}
await browser.close();
writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 2));
for (const r of report) console.log(JSON.stringify({width: r.width, consoleErrors: r.consoleErrors.length, pageErrors: r.pageErrors.length, overflowPx: r.overflowPx, createRowDirectlyUnderPrompt: r.createRowDirectlyUnderPrompt, open3dBar: r.open3dBar && r.open3dBar.display, open3dCount: r.titleCount, formOrder: r.formOrder, playedTitle: r.playedTitle, audioPaused: r.audioPaused, roomCarriesSong: r.roomCarriesSong, roomUrl: r.afterOpen3d?.url}));
