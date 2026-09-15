/**
 * live-page-open-proof.mjs — post-fix proof for the owner rule "engine only at generate" (deploy 2026-09-15).
 * Opens the live site as a fresh visitor in real Chromium at 375 / 768 / 1440, waits for the app to be ready,
 * records: the controls schema present, the Create button state, any notification text shown at load, console errors,
 * and the exact set of /api/* requests the page made. The engine-side proof (0 engine_call lines in that window) is
 * read from the host log by deploy-20260915/12-engine-calls-window.sh right after this run.
 * Usage (from website/): node ../deploy-20260915/live-page-open-proof.mjs
 */
import {createRequire} from 'node:module';
import {mkdirSync, writeFileSync} from 'node:fs';
const require = createRequire('c:/Berk/PlayMusicPrompts/docs/design/2026-09-09-html-mockups/tools/package.json');
const {chromium} = require('playwright');
const base = 'https://www.playmusicprompts.com', outDir = '.state/verification/2026-09-15/live-open';
mkdirSync(outDir, {recursive: true});
const startedAt = new Date().toISOString();
const browser = await chromium.launch();
const report = {startedAt, widths: {}};
for (const width of [375, 768, 1440]) {
  const context = await browser.newContext({viewport: {width, height: width < 800 ? 812 : 900}});
  const page = await context.newPage();
  const api = new Set(), errors = [];
  page.on('request', r => { const u = new URL(r.url()); if (u.origin === base && u.pathname.startsWith('/api/')) api.add(`${r.method()} ${u.pathname}`); });
  page.on('pageerror', e => errors.push(String(e).slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error' && !/WebGL/i.test(m.text())) errors.push(m.text().slice(0, 160)); });
  await page.goto(base + '/', {waitUntil: 'networkidle'}); await page.waitForTimeout(2500);
  const state = await page.evaluate(() => ({
    schemaAvailable: window.PMP_APP?.schemaAvailable ?? null,
    connection: window.PMP_APP?.connection ?? null,
    createDisabled: document.querySelector('#create-button')?.disabled ?? null,
    createLabel: document.querySelector('#create-button')?.textContent?.trim() ?? null,
    toast: document.querySelector('#toast')?.hidden === false ? document.querySelector('#toast').textContent.trim() : '',
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    catalogCards: document.querySelectorAll('[data-track-id], .track-card, .song-card').length,
  }));
  await page.screenshot({path: `${outDir}/open-${width}.png`, fullPage: false});
  report.widths[width] = {...state, apiRequests: [...api].sort(), errors};
  await context.close();
}
await browser.close();
report.finishedAt = new Date().toISOString();
writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 1));
