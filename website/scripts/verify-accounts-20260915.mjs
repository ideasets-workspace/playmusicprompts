/* End-to-end browser proof of the account system against the running local website (owner order 2026-09-15).
 * Real Chromium, real HTTP, real SQLite, real on-disk outbox (the e-mail transport in development). Steps:
 *   1 login.html: Amazon/Apple gone, Google present but marked unavailable (no OIDC configured), form in sign-in mode
 *   2 switch to Create account → NIST meter reacts → register a fresh account → redirected to account.html signed in
 *   3 read the confirmation e-mail from .state/outbox → open its link → "confirmed"
 *   4 sign out → sign in with wrong password (server verdict shown) → sign in correctly → library.html
 *   5 Forgot password → request reset → read reset mail → open link → weak password refused with NIST reason →
 *     strong password accepted → sign in with the new password
 *   6 change password on account.html → delete account with the new password → account gone (sign-in fails)
 * The engine is never touched (no Create, no Keep it going, no Enhance). Cleans nothing else up: the test account
 * is deleted by the flow itself. Report + screenshots: .state/verification/2026-09-15/accounts-*.
 * Run from the website directory: node scripts/verify-accounts-20260915.mjs
 */
import {mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require = createRequire('c:/Berk/PlayMusicPrompts/docs/design/2026-09-09-html-mockups/tools/package.json');
const {chromium} = require('playwright');
const base = process.env.PMP_VERIFY_BASE || 'http://127.0.0.1:4177', outDir = `.state/verification/2026-09-15${process.env.PMP_VERIFY_BASE ? '/live' : ''}`, outbox = '.state/outbox';
mkdirSync(outDir, {recursive: true});
const email = `proof-${Date.now()}@example.invalid`, name = 'Proof Person', pw1 = 'copper kettles at dawn', pw2 = 'green lanterns on the pier', pw3 = 'silver rivers under moonlight';
const mailsFor = (to, subjectPart) => readdirSync(outbox).map(f => JSON.parse(readFileSync(`${outbox}/${f}`, 'utf8'))).filter(m => m.to === to && m.subject.includes(subjectPart)).sort((a, b) => a.at.localeCompare(b.at));
const linkFrom = (mail, key) => new RegExp(`account\\.html\\?${key}=([A-Za-z0-9_-]{43})`).exec(mail.text)?.[1];
const report = {email};
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1440, height: 900}});
const errors = []; page.on('pageerror', e => errors.push(String(e).slice(0, 160))); page.on('console', m => { if (m.type() === 'error' && !/WebGL/i.test(m.text())) errors.push(m.text().slice(0, 160)); });
const statusText = async sel => (await page.locator(sel).textContent().catch(() => '') || '').trim();
try {
  // 1
  await page.goto(`${base}/login.html`, {waitUntil: 'networkidle'}); await page.waitForTimeout(800);
  report.providers = await page.evaluate(() => [...document.querySelectorAll('[data-action=provider]')].map(b => ({provider: b.dataset.provider, disabled: b.disabled})));
  report.initialMode = await page.getAttribute('#auth-form', 'data-mode');
  // 2
  await page.click('#signup-switch'); await page.waitForTimeout(200);
  report.signUpMode = await page.getAttribute('#auth-form', 'data-mode');
  await page.fill('[name=name]', name); await page.fill('[name=email]', email);
  await page.fill('[name=password]', 'short'); report.meterShort = await statusText('#password-meter');
  await page.fill('[name=password]', pw1); report.meterOk = await statusText('#password-meter');
  await page.click('.auth-submit'); await page.waitForTimeout(1500);
  report.registerStatus = await statusText('#auth-status');
  await page.waitForURL(/account\.html/, {timeout: 8000}); await page.waitForTimeout(1200);
  report.accountAfterRegister = {name: await statusText('#account-name'), email: await statusText('#account-email'), status: await statusText('#account-verified'), resendVisible: await page.isVisible('#resend-verification')};
  await page.screenshot({path: `${outDir}/accounts-registered.png`});
  // 3 — mode-aware: in verification-OFF mode (owner order 2026-09-15 12:41) no confirmation mail may exist and the
  //     account page must say so; in REQUIRED mode the link from the outbox confirms the address.
  const identity = await page.evaluate(() => fetch('/api/session').then(r => r.json()).then(s => s.config.identity));
  report.identity = identity;
  if (identity.emailVerificationRequired) {
    const verifyMail = mailsFor(email, 'Confirm')[0]; report.verifyMailFound = !!verifyMail;
    await page.goto(`${base}/account.html?verify=${linkFrom(verifyMail, 'verify')}`, {waitUntil: 'networkidle'}); await page.waitForTimeout(1500);
    report.verifyStatus = await statusText('#account-status'); report.verifiedLabel = await statusText('#account-verified');
  } else {
    report.verifyMailFound = mailsFor(email, 'Confirm').length > 0; // must be false: nothing may be sent in OFF mode
    report.verifiedLabel = await statusText('#account-verified');
  }
  // 4
  await page.click('[data-action=connected-sign-out]'); await page.waitForURL(/login\.html/, {timeout: 8000}); await page.waitForTimeout(800);
  await page.fill('[name=email]', email); await page.fill('[name=password]', 'definitely the wrong one'); await page.click('.auth-submit'); await page.waitForTimeout(1500);
  report.wrongPasswordStatus = await statusText('#auth-status');
  await page.fill('[name=password]', pw1); await page.click('.auth-submit'); await page.waitForURL(/library\.html/, {timeout: 8000}); report.signedInLandsOn = new URL(page.url()).pathname;
  // 5 — only when the server has a mail transport; without one the page shows the "opens once e-mail is connected"
  //     note instead of a link, which is recorded here.
  let current = pw1;
  await page.goto(`${base}/login.html`, {waitUntil: 'networkidle'}); await page.waitForTimeout(600);
  await page.click('[data-action=connected-sign-out]').catch(() => {}); await page.waitForTimeout(600);
  await page.goto(`${base}/login.html`, {waitUntil: 'networkidle'}); await page.waitForTimeout(600);
  report.recoveryLinkVisible = await page.isVisible('[data-action=reset-password]'); report.recoveryNote = await statusText('.recovery-note');
  if (identity.mail) {
    await page.click('[data-action=reset-password]'); await page.fill('[name=email]', email); await page.click('.auth-submit'); await page.waitForTimeout(1500);
    report.resetRequestStatus = await statusText('#auth-status');
    const resetMail = mailsFor(email, 'Reset')[0]; report.resetMailFound = !!resetMail;
    await page.goto(`${base}/account.html?reset=${linkFrom(resetMail, 'reset')}`, {waitUntil: 'networkidle'}); await page.waitForTimeout(800);
    await page.fill('#reset-form [name=password]', 'aaaaaaaaaaaaaaa'); await page.click('#reset-form button[type=submit]'); await page.waitForTimeout(1200);
    report.resetWeakStatus = await statusText('#reset-status');
    await page.fill('#reset-form [name=password]', pw2); await page.click('#reset-form button[type=submit]'); await page.waitForTimeout(1500);
    report.resetOkStatus = await statusText('#reset-status'); current = pw2;
    await page.goto(`${base}/login.html`, {waitUntil: 'networkidle'}); await page.waitForTimeout(600);
    await page.fill('[name=email]', email); await page.fill('[name=password]', pw2); await page.click('.auth-submit'); await page.waitForURL(/library\.html/, {timeout: 8000}); report.signInWithNewPassword = true;
  } else {
    report.resetSkipped = 'no mail transport on this server (identity.mail=false)';
    await page.fill('[name=email]', email); await page.fill('[name=password]', pw1); await page.click('.auth-submit'); await page.waitForURL(/library\.html/, {timeout: 8000});
  }
  // 6
  await page.goto(`${base}/account.html`, {waitUntil: 'networkidle'}); await page.waitForTimeout(1000);
  await page.fill('#change-password-form [name=currentPassword]', current); await page.fill('#change-password-form [name=password]', pw3); await page.click('#change-password-form button[type=submit]'); await page.waitForTimeout(1500);
  report.changeStatus = await statusText('#change-status');
  page.once('dialog', d => d.accept());
  await page.fill('#delete-form [name=password]', pw3); await page.click('#delete-form button[type=submit]'); await page.waitForTimeout(1500);
  report.deleteStatus = await statusText('#delete-status');
  await page.goto(`${base}/login.html`, {waitUntil: 'networkidle'}); await page.waitForTimeout(600);
  await page.fill('[name=email]', email); await page.fill('[name=password]', pw3); await page.click('.auth-submit'); await page.waitForTimeout(1500);
  report.signInAfterDelete = await statusText('#auth-status');
} catch (error) { report.failure = String(error).slice(0, 300); await page.screenshot({path: `${outDir}/accounts-failure.png`}).catch(() => {}); }
report.pageErrors = errors;
await browser.close();
writeFileSync(`${outDir}/accounts-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 1));
