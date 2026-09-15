/* Diagnostic: what does login.html look like in the browser 1.5 s after load? Prints URL, main[data-page], the
 * count of #auth-form / provider buttons, the first 600 chars of main's text and any page/console errors. Read-only.
 * Run from the website directory: node scripts/diagnose-login-page.mjs */
import {createRequire} from 'node:module';
const require = createRequire('c:/Berk/PlayMusicPrompts/docs/design/2026-09-09-html-mockups/tools/package.json');
const {chromium} = require('playwright');
const browser = await chromium.launch(); const page = await browser.newPage({viewport: {width: 1440, height: 900}});
const logs = []; page.on('console', m => logs.push(m.type() + ': ' + m.text().slice(0, 160))); page.on('pageerror', e => logs.push('pageerror: ' + String(e).slice(0, 200)));
const nav = []; page.on('framenavigated', f => { if (f === page.mainFrame()) nav.push(f.url()); });
await page.goto('http://127.0.0.1:4177/login.html', {waitUntil: 'networkidle'}); await page.waitForTimeout(1500);
const state = await page.evaluate(() => ({url: location.href, page: document.querySelector('main')?.dataset.page, authForm: document.querySelectorAll('#auth-form').length, providers: document.querySelectorAll('[data-action=provider]').length, mainText: (document.querySelector('main')?.innerText || '').slice(0, 600)}));
await page.screenshot({path: '.state/verification/2026-09-15/login-diagnose.png'});
await browser.close();
console.log(JSON.stringify({state, nav, logs: logs.filter(l => !/WebGL/i.test(l))}, null, 1));
