/* One-shot markup edit for the account pages (owner order 2026-09-15 10:30 "login i de tamamla sign in sign up
 * herşey eksizsiz tamamlanmalı", approved 11:10 "başla").
 *   login.html — keeps ONE external provider button (Google; enabled only when the server reports an OIDC issuer),
 *   REMOVES the Amazon and Apple buttons (no developer credentials exist for either, so they could only be fake),
 *   gives the form the ids/fields account-client.js drives (title, intro, name field, password meter, mode switch).
 *   account.html — created from login.html's shell (same head, nav, player bar, sprite) with a new <main>: the
 *   e-mail confirmation / password reset landing plus the signed-in account panel (resend confirmation, change
 *   password, delete account). Also adds the Open-3D-era sprite so icon() keeps working.
 * Anchors must be unique or nothing is written. UTF-8 without BOM. Run once: node scripts/account-pages.mjs
 */
import {readFileSync, writeFileSync, existsSync} from 'node:fs';

const path = 'public/login.html';
const before = readFileSync(path, 'utf8');
const count = (hay, needle) => hay.split(needle).length - 1;
const must = (needle, n = 1) => { if (count(before, needle) !== n) throw new Error(`anchor count ${count(before, needle)} != ${n}: ${needle.slice(0, 60)}`); };

const amazon = /<button class="provider" data-action="provider" data-provider="amazon">[\s\S]*?<\/button>/;
const apple = /<button class="provider" data-action="provider" data-provider="apple">[\s\S]*?<\/button>/;
if (!amazon.test(before) || !apple.test(before)) throw new Error('provider buttons not found');
must('<h2>Welcome back.</h2>'); must('<p class="auth-intro">Sign in to save and revisit your music.</p>');
must('<label class="field"><span>Email</span>'); must('<label class="field"><span>Password</span><span class="password-field">');
must('<p class="signup-link">New here?\n<button class="accent" data-action="sign-up">Create an account</button></p>', 0);
must('<p class="signup-link">New here?'); must('<button class="accent" data-action="sign-up">Create an account</button>');
must('<button class="primary auth-submit" type="submit">Sign in</button>');
must('<div class="divider"><span>or use your email</span></div>');

let html = before.replace(amazon, '').replace(apple, '')
  .replace('<h2>Welcome back.</h2>', '<h2 id="auth-title">Welcome back.</h2>')
  .replace('<p class="auth-intro">Sign in to save and revisit your music.</p>', '<p class="auth-intro" id="auth-intro">Sign in to save and revisit your music.</p>')
  .replace('<div class="divider"><span>or use your email</span></div>', '<div class="divider"><span>or use your e-mail</span></div>')
  .replace('<label class="field"><span>Email</span>', '<label class="field" data-field="name" hidden><span>Name</span><input type="text" name="name" autocomplete="name" placeholder="What should we call you?" maxlength="100" disabled></label><label class="field"><span>E-mail</span>')
  .replace('<label class="field"><span>Password</span><span class="password-field">', '<label class="field" data-field="password"><span>Password</span><span class="password-field">')
  .replace('<button class="accent" data-action="sign-up">Create an account</button>', '<button class="accent" data-action="sign-up" id="signup-switch" data-target="sign-up">Create an account</button>');
// password meter right after the password label (the label closes with </span></label> after the eye button)
const eyeClose = /(<button type="button" data-action="password" aria-label="Show password">[\s\S]*?<\/button><\/span><\/label>)/;
if (!eyeClose.test(html)) throw new Error('password label close not found');
html = html.replace(eyeClose, '$1<p id="password-meter" class="password-meter" hidden aria-live="polite"></p>');
writeFileSync(path, html);

// account.html from the finished login shell
const mainOpen = html.indexOf('<main'), mainClose = html.indexOf('</main>') + 7;
if (mainOpen < 0 || mainClose < 7) throw new Error('main not found');
const accountMain = '<main id="main" data-page="account" tabindex="-1"><section class="account-page glass" id="account-panel">' +
  '<h1>Your account</h1><p id="account-status" class="form-status" role="status" hidden></p>' +
  '<form id="reset-form" class="account-form" hidden><h2>Choose a new password</h2><label class="field"><span>New password</span><input type="password" name="password" required autocomplete="new-password" minlength="15" maxlength="128"></label><p id="reset-meter" class="password-meter" aria-live="polite"></p><p id="reset-status" class="form-status" role="status" hidden></p><button class="primary" type="submit">Set new password</button></form>' +
  '<div id="account-signin-prompt" hidden><p>Sign in to manage your account.</p><a class="primary account-link-button" href="login.html?next=account" data-route>Sign in</a></div>' +
  '<div id="account-manage" hidden><dl class="account-facts"><dt>Name</dt><dd id="account-name"></dd><dt>E-mail</dt><dd id="account-email"></dd><dt>Status</dt><dd id="account-verified"></dd></dl>' +
  '<button type="button" class="text-button accent" id="resend-verification" hidden>Resend confirmation e-mail</button>' +
  '<form id="change-password-form" class="account-form" hidden><h2>Change password</h2><label class="field"><span>Current password</span><input type="password" name="currentPassword" required autocomplete="current-password"></label><label class="field"><span>New password</span><input type="password" name="password" required autocomplete="new-password" minlength="15" maxlength="128"></label><p id="change-meter" class="password-meter" aria-live="polite"></p><p id="change-status" class="form-status" role="status" hidden></p><button class="primary" type="submit">Change password</button></form>' +
  '<form id="delete-form" class="account-form account-form-danger" hidden><h2>Delete account</h2><p class="account-hint">Deletes your account, saved songs and playlists. Music you created stays in the catalogue as anonymous history.</p><label class="field"><span>Password</span><input type="password" name="password" required autocomplete="current-password"></label><p id="delete-status" class="form-status" role="status" hidden></p><button class="danger" type="submit">Delete my account</button></form>' +
  '<button type="button" class="text-button" data-action="connected-sign-out">Sign out</button></div></section></main>';
let account = html.slice(0, mainOpen) + accountMain + html.slice(mainClose);
account = account.replace('<title>Sign in · PlayMusicPrompts</title>', '<title>Your account · PlayMusicPrompts</title>').replace('<body data-page="login"', '<body data-page="account"');
if (count(account, '<title>Your account') !== 1) throw new Error('title not replaced');
writeFileSync('public/account.html', account);
console.log(JSON.stringify({loginBytes: Buffer.byteLength(html, 'utf8'), providers: count(html, 'data-action="provider"'), meter: count(html, 'id="password-meter"'), nameField: count(html, 'data-field="name"'), accountBytes: Buffer.byteLength(account, 'utf8'), accountPanel: count(account, 'id="account-panel"'), accountExists: existsSync('public/account.html')}));
