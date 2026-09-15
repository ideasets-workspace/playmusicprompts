/* Browser proof for the first-screen hero actions (owner order 2026-09-15 10:59, approved 11:10).
 * Against the running local website: at 375 / 768 / 1440 measures horizontal overflow, that the two large
 * buttons sit directly under the prompt box (side by side at >=768, stacked at 375), their heights (>=44px),
 * that no "listen-link" remains, and console/page errors (WebGL ones counted separately — headless has no GPU).
 * At 1440 it also proves "Play something for me" really starts a catalogue song and that pressing "Yes" before
 * any song arms the intent (pair shows Yes, server flag untouched).
 *
 * PAID-ACTION GUARD (incident 2026-09-15 11:19–11:21, recorded in DECISIONS.md D-PMP-18): enabling "Keep it going"
 * while a catalogue song plays starts CONTINUOUS CREATION — a real, billed engine generation. An earlier version of
 * this script did exactly that twice without the owner's allowance. The server-flag synchronisation branch below
 * therefore runs ONLY when PMP_ALLOW_PAID_PROBE=1 is set explicitly by the owner for that run; by default the script
 * never turns continuation on while a song is current and never leaves the pair on "Yes" with a song playing.
 * Screenshots under .state/verification/2026-09-15/. Run from the website directory: node scripts/verify-hero-20260915.mjs
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require = createRequire('c:/Berk/PlayMusicPrompts/docs/design/2026-09-09-html-mockups/tools/package.json');
const {chromium} = require('playwright');
const base = 'http://127.0.0.1:4177', outDir = '.state/verification/2026-09-15';
mkdirSync(outDir, {recursive: true});
const browser = await chromium.launch();
const report = [];
for (const width of [375, 768, 1440]) {
  const page = await browser.newPage({viewport: {width, height: 900}});
  const webgl = [], other = [], failedResponses = [];
  page.on('response', r => { if (r.status() >= 400) failedResponses.push(r.status() + ' ' + r.request().method() + ' ' + r.url()); });
  page.on('console', m => { if (m.type() !== 'error') return; (/WebGL/i.test(m.text()) ? webgl : other).push(m.text().slice(0, 160)); });
  page.on('pageerror', e => other.push('pageerror: ' + String(e).slice(0, 160)));
  await page.goto(`${base}/index.html`, {waitUntil: 'networkidle'});
  await page.waitForTimeout(1500);
  const g = await page.evaluate(() => {
    const r = sel => { const el = document.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return {top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right), h: Math.round(b.height), w: Math.round(b.width)}; };
    return {overflowPx: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth), prompt: r('.prompt-wrap'), create: r('#create-button'), listen: r('.hero-button-listen'), keep: r('.keep-going'), yes: r('[data-action="keep-going"][data-value="yes"]'), no: r('[data-action="keep-going"][data-value="no"]'), quick: r('.quick-controls'), listenLinks: document.querySelectorAll('.listen-link').length, createText: document.querySelector('#create-button')?.textContent.trim(), listenText: document.querySelector('.hero-button-listen')?.textContent.trim(), keepLabel: document.querySelector('.keep-going-label')?.textContent};
  });
  const sideBySide = g.create && g.listen && Math.abs(g.create.top - g.listen.top) <= 4 && g.listen.left >= g.create.right;
  const stacked = g.create && g.listen && g.listen.top >= g.create.bottom;
  const entry = {width, overflowPx: g.overflowPx, underPrompt: g.create.top >= g.prompt.bottom && g.create.top - g.prompt.bottom <= 30, layout: sideBySide ? 'side-by-side' : stacked ? 'stacked' : 'unexpected', createH: g.create.h, listenH: g.listen.h, yesH: g.yes.h, noH: g.no.h, keepUnderListen: g.keep.top >= g.listen.bottom, quickBelow: g.quick.top >= g.keep.bottom, listenLinksLeft: g.listenLinks, createText: g.createText, listenText: g.listenText, keepLabel: g.keepLabel, webglErrors: webgl.length, otherErrors: other, failedResponses};
  await page.screenshot({path: `${outDir}/hero-${width}.png`});
  if (width === 1440) {
    const state = () => page.evaluate(() => ({yes: document.querySelector('[data-value="yes"]').getAttribute('aria-pressed'), no: document.querySelector('[data-value="no"]').getAttribute('aria-pressed'), bar: document.querySelector('#continuation').checked, serverFlag: window.PMP?.state?.continuation ?? null}));
    entry.initial = await state();
    // Intent only: "Yes" before any song must show Yes on the pair and leave the server flag untouched (no creation).
    await page.click('[data-action="keep-going"][data-value="yes"]'); await page.waitForTimeout(800);
    entry.afterYesNoSong = await state();
    // Disarm before any song starts, so "Play something for me" below is a plain $0 catalogue play.
    await page.click('[data-action="keep-going"][data-value="no"]'); await page.waitForTimeout(500);
    entry.afterNoNoSong = await state();
    await page.click('.hero-button-listen');
    await page.waitForFunction(() => { const a = document.querySelector('#audio'); return a && a.currentSrc && !a.paused; }, null, {timeout: 10000}).catch(() => {});
    await page.waitForTimeout(1500);
    entry.afterPlaySomething = await page.evaluate(() => ({title: document.querySelector('#track-title').textContent, src: document.querySelector('#audio').currentSrc, paused: document.querySelector('#audio').paused}));
    entry.afterPlayState = await state();
    entry.intentProven = entry.afterYesNoSong.yes === 'true' && entry.afterYesNoSong.serverFlag === false && entry.afterNoNoSong.no === 'true' && entry.afterPlayState.serverFlag === false && entry.afterPlayState.no === 'true';
    if (process.env.PMP_ALLOW_PAID_PROBE === '1') {
      // OWNER-ALLOWED PAID PROBE ONLY: enabling continuation with a song current submits a real engine generation.
      await page.click('[data-action="keep-going"][data-value="yes"]'); await page.waitForFunction(() => document.querySelector('#continuation')?.checked === true, null, {timeout: 15000}).catch(() => {}); await page.waitForTimeout(800);
      entry.afterYesPlaying = await state();
      await page.click('#continuation + span'); await page.waitForFunction(() => document.querySelector('#continuation')?.checked === false, null, {timeout: 15000}).catch(() => {}); await page.waitForTimeout(800);
      entry.afterBarOff = await state();
      entry.syncProven = entry.afterYesPlaying.bar === true && entry.afterYesPlaying.yes === 'true' && entry.afterBarOff.bar === false && entry.afterBarOff.no === 'true';
    } else entry.syncProven = 'skipped: paid probe not allowed (set PMP_ALLOW_PAID_PROBE=1); proven once on 2026-09-15 11:19 (D-PMP-18)';
    await page.screenshot({path: `${outDir}/hero-1440-playing.png`});
  }
  report.push(entry); await page.close();
}
await browser.close();
writeFileSync(`${outDir}/hero-report.json`, JSON.stringify(report, null, 2));
for (const r of report) console.log(JSON.stringify(r));
