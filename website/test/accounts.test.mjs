/* Service-level tests for AccountService with a real Store (in-memory SQLite) and the real file mail transport
 * (temporary outbox). The verification and reset links are read back from the written mail files exactly as a
 * person would read them from an inbox â€” no token is taken from internals. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readdir, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../server/store.mjs';
import {Mailer} from '../server/mailer.mjs';
import {AccountService, normaliseEmail} from '../server/accounts.mjs';

async function fixture(t, {emailVerification = 'required', withMailer = true} = {}) {
  const stateRoot = await mkdtemp(join(tmpdir(), 'pmp-accounts-'));
  const store = new Store(':memory:');
  const mailer = withMailer ? new Mailer({transport: 'file', from: 'no-reply@playmusicprompts.com', stateRoot}) : null;
  const service = new AccountService({store, mailer, origin: 'http://127.0.0.1:1', emailVerification});
  t.after(async () => { store.close(); await rm(stateRoot, {recursive: true, force: true}); });
  const outbox = async () => { const dir = join(stateRoot, 'outbox'); const files = (await readdir(dir)).sort(); return Promise.all(files.map(async f => JSON.parse(await readFile(join(dir, f), 'utf8')))); };
  const linkToken = (mail, path) => { const m = new RegExp(path.replace(/[?]/g, '\\?') + '([A-Za-z0-9_-]{43})').exec(mail.text); assert.ok(m, 'mail carries the link'); return m[1]; };
  return {store, service, outbox, linkToken};
}

test('normaliseEmail: trims, lower-cases, refuses malformed and overlong addresses', () => {
  assert.equal(normaliseEmail('  Berk@Example.COM '), 'berk@example.com');
  assert.equal(normaliseEmail('not an email'), null); assert.equal(normaliseEmail('a@b'), null); assert.equal(normaliseEmail('x'.repeat(250) + '@e.com'), null);
});

test('register â†’ verify â†’ sign in: real session, real mail, unverified until the link is used', async t => {
  const {store, service, outbox, linkToken} = await fixture(t);
  const guest = store.newSession();
  const registered = await service.register({email: 'Nina@Example.com', name: 'Nina', password: 'quiet violin over the river', ipKey: 'ip-1', session: guest.row});
  assert.equal(registered.user.name, 'Nina'); assert.equal(registered.emailVerified, false); assert.equal(registered.mail.sent, true); assert.equal(registered.mail.transport, 'file');
  assert.ok(store.session(registered.token)?.user_id === registered.user.id, 'signed in immediately with a real session');
  assert.equal(store.session(guest.token) ?? null, null, 'the guest session was replaced');
  const mails = await outbox(); assert.equal(mails.length, 1); assert.equal(mails[0].to, 'nina@example.com');
  const token = linkToken(mails[0], '/account.html?verify=');
  assert.deepEqual(service.verifyEmail({token}), {verified: true});
  assert.throws(() => service.verifyEmail({token}), {code: 'TOKEN_INVALID'}, 'single use');
  assert.equal(service.profile(registered.user.id).emailVerified, true);
  await assert.rejects(service.register({email: 'nina@example.com', name: 'Again', password: 'another long enough phrase', ipKey: 'ip-2', session: null}), {code: 'EMAIL_TAKEN'});
  const signed = await service.signIn({email: 'NINA@example.com', password: 'quiet violin over the river', ipKey: 'ip-3', session: null});
  assert.equal(signed.user.id, registered.user.id); assert.equal(signed.emailVerified, true);
  await assert.rejects(service.signIn({email: 'nina@example.com', password: 'wrong password entirely', ipKey: 'ip-3', session: null}), {code: 'SIGN_IN_FAILED'});
  await assert.rejects(service.signIn({email: 'nobody@example.com', password: 'wrong password entirely', ipKey: 'ip-3', session: null}), {code: 'SIGN_IN_FAILED', message: registered.mail ? 'That e-mail and password do not match.' : ''});
});

test('policy is enforced at registration with the NIST reason; listed and contextual passwords are refused', async t => {
  const {service} = await fixture(t);
  await assert.rejects(service.register({email: 'a@example.com', name: 'A', password: 'too short', ipKey: 'ip', session: null}), {code: 'PASSWORD_TOO_SHORT'});
  await assert.rejects(service.register({email: 'a@example.com', name: 'A', password: 'aaaaaaaaaaaaaaa', ipKey: 'ip', session: null}), {code: 'PASSWORD_BLOCKLISTED'});
  await assert.rejects(service.register({email: 'longer.person@example.com', name: 'A', password: 'longer.person@example.com', ipKey: 'ip', session: null}), {code: 'PASSWORD_CONTEXTUAL'});
  await assert.rejects(service.register({email: 'a@example.com', name: '  ', password: 'a perfectly fine phrase', ipKey: 'ip', session: null}), {code: 'NAME_REQUIRED'});
  await assert.rejects(service.register({email: 'bad', name: 'A', password: 'a perfectly fine phrase', ipKey: 'ip', session: null}), {code: 'EMAIL_INVALID'});
});

test('password reset: unknown e-mail gets the same answer; the link is single-use, verifies the address and signs every session out', async t => {
  const {store, service, outbox, linkToken} = await fixture(t);
  const r = await service.register({email: 'kai@example.com', name: 'Kai', password: 'blue lanterns on the pier', ipKey: 'ip', session: null});
  assert.deepEqual(await service.requestPasswordReset({email: 'nobody@example.com', ipKey: 'ip-r'}), {accepted: true});
  const asked = await service.requestPasswordReset({email: 'KAI@example.com', ipKey: 'ip-r'});
  assert.equal(asked.accepted, true); assert.equal(asked.mail.sent, true);
  const mails = await outbox(); const resetMail = mails.find(m => /Reset your/.test(m.subject)); assert.ok(resetMail);
  const token = linkToken(resetMail, '/account.html?reset=');
  await assert.rejects(service.resetPassword({token, password: 'short'}), {code: 'PASSWORD_TOO_SHORT'});
  assert.throws(() => service.verifyEmail({token}), {code: 'TOKEN_INVALID'}, 'a reset token is not a verify token');
  assert.deepEqual(await service.resetPassword({token, password: 'green lanterns on the pier'}), {reset: true});
  assert.equal(store.session(r.token) ?? null, null, 'old session revoked');
  await assert.rejects(service.resetPassword({token, password: 'green lanterns on the pier'}), {code: 'TOKEN_INVALID'}, 'single use');
  await assert.rejects(service.signIn({email: 'kai@example.com', password: 'blue lanterns on the pier', ipKey: 'ip-s', session: null}), {code: 'SIGN_IN_FAILED'});
  const signed = await service.signIn({email: 'kai@example.com', password: 'green lanterns on the pier', ipKey: 'ip-s', session: null});
  assert.equal(signed.emailVerified, true, 'proving mailbox control verified the address');
});

test('change password requires the current one; delete removes the account and its sessions', async t => {
  const {store, service} = await fixture(t);
  const r = await service.register({email: 'lu@example.com', name: 'Lu', password: 'copper kettles at dawn', ipKey: 'ip', session: null});
  await assert.rejects(service.changePassword({userId: r.user.id, currentPassword: 'wrong', password: 'silver kettles at dawn', session: null}), {code: 'CURRENT_PASSWORD_WRONG'});
  const changed = await service.changePassword({userId: r.user.id, currentPassword: 'copper kettles at dawn', password: 'silver kettles at dawn', session: null});
  assert.equal(changed.changed, true); assert.equal(store.session(r.token) ?? null, null); assert.ok(store.session(changed.token));
  await assert.rejects(service.deleteAccount({userId: r.user.id, password: 'nope not it at all'}), {code: 'CURRENT_PASSWORD_WRONG'});
  assert.equal((await service.deleteAccount({userId: r.user.id, password: 'silver kettles at dawn'})).deleted, true);
  assert.equal(store.session(changed.token) ?? null, null); assert.equal(store.user(r.user.id) ?? null, null); assert.equal(service.profile(r.user.id).passwordAccount, false);
});

test('throttles: sign-in attempts per IP and registrations per IP are bounded', async t => {
  const {service} = await fixture(t);
  for (let i = 0; i < 30; i++) await assert.rejects(service.signIn({email: 'ghost@example.com', password: 'whatever long phrase here', ipKey: 'flood', session: null}), {code: 'SIGN_IN_FAILED'});
  await assert.rejects(service.signIn({email: 'ghost@example.com', password: 'whatever long phrase here', ipKey: 'flood', session: null}), {code: 'RATE_LIMITED'});
  for (let i = 0; i < 10; i++) await service.register({email: `u${i}@example.com`, name: 'U', password: 'registration flood phrase ' + i, ipKey: 'reg', session: null});
  await assert.rejects(service.register({email: 'u10@example.com', name: 'U', password: 'registration flood phrase 10', ipKey: 'reg', session: null}), {code: 'RATE_LIMITED'});
});

test('verification OFF without a mail transport: account usable at once, nothing sent, reset-by-mail refused honestly', async t => {
  const {store, service} = await fixture(t, {emailVerification: 'off', withMailer: false});
  assert.equal(service.mailAvailable, false); assert.equal(service.verificationRequired, false);
  const r = await service.register({email: 'Ozan@Example.com', name: 'Ozan', password: 'a long walk along the bosphorus', ipKey: 'ip-off', session: null});
  assert.equal(r.emailVerificationRequired, false); assert.deepEqual(r.mail, {sent: false, reason: 'VERIFICATION_OFF'});
  assert.ok(store.session(r.token)?.user_id === r.user.id, 'signed in with a real session immediately');
  assert.deepEqual(await service.resendVerification({userId: r.user.id}), {sent: false, reason: 'VERIFICATION_OFF'});
  const profile = service.profile(r.user.id);
  assert.equal(profile.emailVerificationRequired, false); assert.equal(profile.mailAvailable, false); assert.equal(profile.emailVerified, false); assert.equal(profile.passwordAccount, true);
  await assert.rejects(service.requestPasswordReset({email: 'ozan@example.com', ipKey: 'ip-off'}), {status: 503, code: 'MAIL_NOT_CONFIGURED'});
  const signed = await service.signIn({email: 'ozan@example.com', password: 'a long walk along the bosphorus', ipKey: 'ip-off', session: null});
  assert.equal(signed.user.id, r.user.id, 'sign-in never depended on verification');
  const changed = await service.changePassword({userId: r.user.id, currentPassword: 'a long walk along the bosphorus', password: 'a longer walk along the bosphorus', session: null});
  assert.equal(changed.changed, true, 'password change works without any mail transport');
});

test('AccountService refuses an unknown e-mail verification mode', async t => {
  await assert.rejects(fixture(t, {emailVerification: 'maybe'}), TypeError);
});
