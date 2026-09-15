/**
 * responsive-audit.mjs — measurement (not judgement) of the live site's adaptive/responsive state, ordered by Berk on
 * 2026-09-15 14:59 ("sayfalar mobil cihaz, tablet ve web için adaptive responsive değil hala olması gereken 100%
 * seviyesinde"). For every public page and four viewports (375 phone, 768 tablet portrait, 1024 tablet landscape,
 * 1440 desktop) in real Chromium it records: horizontal overflow, every element wider than the viewport, tap
 * targets under 44x44 CSS px, text under 12px, fixed player/header heights, and a screenshot. Output feeds the
 * repeat-back; nothing here changes the site. Usage (from website/): node ../deploy-20260915/responsive-audit.mjs
 */
import {createRequire} from 'node:module';
import {mkdirSync, writeFileSync} from 'node:fs';
const require = createRequire('c:/Berk/PlayMusicPrompts/docs/design/2026-09-09-html-mockups/tools/package.json');
const {chromium} = require('playwright');
const base = 'https://www.playmusicprompts.com', outDir = '.state/verification/2026-09-15/responsive';
mkdirSync(outDir, {recursive: true});
const pages = ['/', '/explore.html', '/radio.html', '/library.html', '/login.html', '/account.html', '/player-launch.html', '/player-three.html'];
const viewports = [[375, 812], [768, 1024], [1024, 768], [1440, 900]];
const browser = await chromium.launch();
const report = {};
for (const path of pages) {
  report[path] = {};
  for (const [w, h] of viewports) {
    const context = await browser.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 1, hasTouch: w < 1024, isMobile: w < 768});
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(String(e).slice(0, 120)));
    try { await page.goto(base + path, {waitUntil: 'networkidle', timeout: 45000}); } catch (e) { errors.push('goto: ' + String(e).slice(0, 100)); }
    await page.waitForTimeout(1800);
    const m = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const wide = [...document.querySelectorAll('body *')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > vw + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed'; })
        .slice(0, 12).map(el => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''} w=${Math.round(el.getBoundingClientRect().width)} r=${Math.round(el.getBoundingClientRect().right)}`);
      const small = [...document.querySelectorAll('button, a, input[type=checkbox], input[type=range], [role=button]')].filter(el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && (r.width < 44 || r.height < 44); })
        .map(el => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.dataset.action ? '[' + el.dataset.action + ']' : ''} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);
      const tiny = [...document.querySelectorAll('body *')].filter(el => el.children.length === 0 && el.textContent.trim() && parseFloat(getComputedStyle(el).fontSize) < 12 && el.getBoundingClientRect().height > 0).slice(0, 10).map(el => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''} ${getComputedStyle(el).fontSize}`);
      const player = document.querySelector('footer.player, .player'), header = document.querySelector('header');
      return {viewportWidth: vw, scrollWidth: document.documentElement.scrollWidth, overflowX: document.documentElement.scrollWidth - vw,
        wideElements: wide, smallTapTargets: {count: small.length, sample: small.slice(0, 10)}, tinyText: tiny,
        playerHeight: player ? Math.round(player.getBoundingClientRect().height) : null, headerHeight: header ? Math.round(header.getBoundingClientRect().height) : null,
        h1: document.querySelector('h1')?.textContent?.trim().slice(0, 60) ?? null, bodyFont: getComputedStyle(document.body).fontSize};
    });
    await page.screenshot({path: `${outDir}/${path === '/' ? 'index' : path.replace(/[\/.]/g, '_').replace(/^_/, '')}-${w}.png`, fullPage: true});
    report[path][w] = {...m, errors};
    await context.close();
  }
}
await browser.close();
writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 2));
// Compact console summary: one line per page x viewport.
for (const [path, byWidth] of Object.entries(report)) for (const [w, r] of Object.entries(byWidth))
  console.log(`${path.padEnd(20)} ${String(w).padStart(4)}  overflowX=${String(r.overflowX).padStart(4)}  wide=${r.wideElements.length}  smallTap=${r.smallTapTargets.count}  tinyText=${r.tinyText.length}  player=${r.playerHeight}  header=${r.headerHeight}  err=${r.errors.length}`);
