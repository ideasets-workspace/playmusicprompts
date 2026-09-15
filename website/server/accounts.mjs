/* AccountService — the use-cases of e-mail + password accounts for the PlayMusicPrompts website.
 *
 * register → verifyEmail → signIn → requestPasswordReset → resetPassword → changePassword → deleteAccount, plus
 * resendVerification. Every method validates its input against server/account-constants.mjs, enforces the
 * NIST password policy (PasswordPolicy), hashes with scrypt (PasswordHasher), persists through
 * AccountRepository, sends e-mail through Mailer, and throttles online guessing with the Store's admission
 * counters (NIST 800-63B-4 3.2.2 requires rate limiting). Errors are `problem(status, code, message)` objects
 * from store.mjs so http.mjs renders them like every other API error.
 *
 * Honesty rules built in: sign-in never reveals whether the e-mail exists (one message for both cases);
 * password-reset requests always answer "if that account exists we sent a link"; a mail-transport failure at
 * registration is reported as such (the account exists, the mail did not go out) — never as success.
 *
 * Callers: server/http.mjs (account routes). Wiring: server/main.mjs.
 */
import {randomBytes} from 'node:crypto';
import {problem} from './store.mjs';
import {AccountRepository} from './account-repository.mjs';
import {PasswordPolicy} from './password-policy.mjs';
import {PasswordHasher} from './password-hash.mjs';
import {ACCOUNT_MESSAGES, ACCOUNT_TOKEN_BYTES, DEFAULT_EMAIL_VERIFICATION, EMAIL_MAX_LENGTH, EMAIL_PATTERN, EMAIL_VERIFICATION_OFF, EMAIL_VERIFICATION_REQUIRED,
  EMAIL_VERIFICATION_TTL_MS, FIFTEEN_MINUTES_MS, NAME_MAX_LENGTH, ONE_HOUR_MS,
  PASSWORD_RESET_TTL_MS, REGISTRATIONS_PER_IP_PER_HOUR, RESET_PASSWORD_PATH, RESET_REQUESTS_PER_ACCOUNT_PER_HOUR, RESET_REQUESTS_PER_IP_PER_HOUR,
  SIGN_IN_ATTEMPTS_PER_ACCOUNT_PER_15_MIN, SIGN_IN_ATTEMPTS_PER_IP_PER_15_MIN, TOKEN_KIND_RESET, TOKEN_KIND_VERIFY, VERIFY_EMAIL_PATH} from './account-constants.mjs';

/** Lower-cases and trims; the address itself is otherwise kept as typed (RFC 5321 local parts are case-sensitive in theory, universally case-insensitive in practice). */
export function normaliseEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email) ? email : null;
}

export class AccountService {
  /**
   * @param {{store: import('./store.mjs').Store, mailer: import('./mailer.mjs').Mailer|null, origin: string,
   *   emailVerification?: string, onError?: Function}} deps
   * `emailVerification` is one of EMAIL_VERIFICATION_REQUIRED | EMAIL_VERIFICATION_OFF (account-constants.mjs).
   * In OFF mode no confirmation mail is sent at registration, the account is fully usable at once, and the
   * profile reports `emailVerificationRequired:false` so the pages never show "confirm your e-mail" copy.
   */
  constructor({store, mailer, origin, emailVerification = DEFAULT_EMAIL_VERIFICATION, onError = () => {}}) {
    if (![EMAIL_VERIFICATION_REQUIRED, EMAIL_VERIFICATION_OFF].includes(emailVerification)) throw new TypeError('Unknown e-mail verification mode');
    this.store = store; this.mailer = mailer; this.origin = origin; this.onError = onError; this.emailVerification = emailVerification;
    this.repository = new AccountRepository(store);
    this.policy = new PasswordPolicy();
    this.hasher = new PasswordHasher();
  }
  get mailAvailable() { return !!this.mailer; }
  get verificationRequired() { return this.emailVerification === EMAIL_VERIFICATION_REQUIRED; }
  static token() { return randomBytes(ACCOUNT_TOKEN_BYTES).toString('base64url'); }
  throttle(key, limit, period, message) { try { this.store.transaction(() => this.store.consume(key, limit, period)); } catch (error) { if (error.code === 'RATE_LIMITED') throw problem(429, 'RATE_LIMITED', message); throw error; } }

  /** Sends the verification link; returns {sent:true} or {sent:false, reason} — never throws for a mail failure. */
  async sendVerification(user, email) {
    const token = AccountService.token();
    this.repository.issueToken(user.id, TOKEN_KIND_VERIFY, token, EMAIL_VERIFICATION_TTL_MS);
    return this.deliver(email, 'Confirm your PlayMusicPrompts e-mail', `Hello ${user.name},\n\nConfirm your e-mail address to finish creating your PlayMusicPrompts account:\n${this.origin}${VERIFY_EMAIL_PATH}${token}\n\nThe link works for 24 hours. If you did not create this account, ignore this message.`);
  }
  async deliver(to, subject, text) {
    if (!this.mailer) return {sent: false, reason: 'MAIL_NOT_CONFIGURED'};
    const html = `<p>${text.split('\n').map(l => l.replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c])).replace(/(https?:\/\/\S+)/g, '<a href="$1">$1</a>')).join('<br>')}</p>`;
    try { const receipt = await this.mailer.send({to, subject, text, html}); return {sent: true, transport: receipt.transport}; }
    catch (error) { this.onError({event: 'mail_failed', code: error.code || 'MAIL_TRANSPORT_FAILED'}); return {sent: false, reason: error.code || 'MAIL_TRANSPORT_FAILED'}; }
  }

  /** Creates the account and signs the visitor in. REQUIRED mode also sends the confirmation link; OFF mode sends nothing and reports why. */
  async register({email: rawEmail, name: rawName, password, ipKey, session}) {
    this.throttle(`register:ip:${ipKey}`, REGISTRATIONS_PER_IP_PER_HOUR, ONE_HOUR_MS, ACCOUNT_MESSAGES.registrationThrottled);
    const email = normaliseEmail(rawEmail); if (!email) throw problem(400, 'EMAIL_INVALID', ACCOUNT_MESSAGES.emailInvalid);
    const name = typeof rawName === 'string' ? rawName.trim().slice(0, NAME_MAX_LENGTH) : ''; if (!name) throw problem(400, 'NAME_REQUIRED', ACCOUNT_MESSAGES.nameRequired);
    const verdict = this.policy.evaluate(password, {email}); if (!verdict.ok) throw problem(400, verdict.code, verdict.message);
    if (this.repository.byEmail(email)) throw problem(409, 'EMAIL_TAKEN', ACCOUNT_MESSAGES.emailTaken);
    const passwordHash = await this.hasher.hash(password);
    let user; try { user = this.repository.create({email, name, passwordHash}); } catch (error) { if (/UNIQUE/.test(error.message)) throw problem(409, 'EMAIL_TAKEN', ACCOUNT_MESSAGES.emailTaken); throw error; }
    const mail = this.verificationRequired ? await this.sendVerification(user, email) : {sent: false, reason: 'VERIFICATION_OFF'};
    const signed = this.store.newSession(user, session);
    return {...signed, user, emailVerified: false, emailVerificationRequired: this.verificationRequired, mail};
  }
  async resendVerification({userId}) {
    if (!this.verificationRequired) return {sent: false, reason: 'VERIFICATION_OFF'};
    const account = this.repository.byUserId(userId); if (!account) throw problem(404, 'NOT_FOUND', ACCOUNT_MESSAGES.tokenInvalid);
    if (account.email_verified_at) return {sent: false, reason: 'ALREADY_VERIFIED'};
    this.throttle(`verify-resend:${userId}`, RESET_REQUESTS_PER_ACCOUNT_PER_HOUR, ONE_HOUR_MS, ACCOUNT_MESSAGES.resetThrottled);
    return this.sendVerification({id: account.user_id, name: account.name}, account.email);
  }
  verifyEmail({token}) {
    const userId = this.repository.consumeToken(token, TOKEN_KIND_VERIFY); if (!userId) throw problem(400, 'TOKEN_INVALID', ACCOUNT_MESSAGES.tokenInvalid);
    this.repository.markVerified(userId); return {verified: true};
  }
  /** Constant response shape for wrong e-mail and wrong password; hashing cost is paid on both paths. */
  async signIn({email: rawEmail, password, ipKey, session}) {
    this.throttle(`signin:ip:${ipKey}`, SIGN_IN_ATTEMPTS_PER_IP_PER_15_MIN, FIFTEEN_MINUTES_MS, ACCOUNT_MESSAGES.signInThrottled);
    const email = normaliseEmail(rawEmail);
    const account = email ? this.repository.byEmail(email) : null;
    if (account) this.throttle(`signin:account:${account.user_id}`, SIGN_IN_ATTEMPTS_PER_ACCOUNT_PER_15_MIN, FIFTEEN_MINUTES_MS, ACCOUNT_MESSAGES.signInThrottled);
    // Same work on both paths (one scrypt derivation), so response time does not reveal whether the e-mail exists.
    const ok = account ? await this.hasher.verify(password, account.password_hash) : (await this.hasher.hash(String(password ?? '')), false);
    if (!ok) throw problem(401, 'SIGN_IN_FAILED', ACCOUNT_MESSAGES.signInFailed);
    if (this.hasher.needsRehash(account.password_hash)) this.repository.setPasswordHash(account.user_id, await this.hasher.hash(password));
    const user = {id: account.user_id, name: account.name};
    return {...this.store.newSession(user, session), user, emailVerified: !!account.email_verified_at};
  }
  async requestPasswordReset({email: rawEmail, ipKey}) {
    // Without a mail transport a reset link can never arrive; saying "we sent it" would be a lie, so refuse honestly.
    if (!this.mailer) throw problem(503, 'MAIL_NOT_CONFIGURED', ACCOUNT_MESSAGES.resetUnavailable);
    this.throttle(`reset:ip:${ipKey}`, RESET_REQUESTS_PER_IP_PER_HOUR, ONE_HOUR_MS, ACCOUNT_MESSAGES.resetThrottled);
    const email = normaliseEmail(rawEmail); const account = email ? this.repository.byEmail(email) : null;
    if (!account) return {accepted: true}; // same answer as for a real account: existence is never revealed
    this.throttle(`reset:account:${account.user_id}`, RESET_REQUESTS_PER_ACCOUNT_PER_HOUR, ONE_HOUR_MS, ACCOUNT_MESSAGES.resetThrottled);
    const token = AccountService.token();
    this.repository.issueToken(account.user_id, TOKEN_KIND_RESET, token, PASSWORD_RESET_TTL_MS);
    const mail = await this.deliver(email, 'Reset your PlayMusicPrompts password', `Hello ${account.name},\n\nSomeone asked to reset the password of your PlayMusicPrompts account. Choose a new one here:\n${this.origin}${RESET_PASSWORD_PATH}${token}\n\nThe link works for one hour and once. If this was not you, you can ignore this message; your password stays as it is.`);
    return {accepted: true, mail};
  }
  async resetPassword({token, password}) {
    // Validate the new password BEFORE the single-use link is consumed, so a typo does not burn the link.
    const peeked = this.repository.peekToken(token, TOKEN_KIND_RESET); if (!peeked) throw problem(400, 'TOKEN_INVALID', ACCOUNT_MESSAGES.tokenInvalid);
    const account = this.repository.byUserId(peeked); if (!account) throw problem(400, 'TOKEN_INVALID', ACCOUNT_MESSAGES.tokenInvalid);
    const verdict = this.policy.evaluate(password, {email: account.email}); if (!verdict.ok) throw problem(400, verdict.code, verdict.message);
    const passwordHash = await this.hasher.hash(password);
    const userId = this.repository.consumeToken(token, TOKEN_KIND_RESET); if (!userId) throw problem(400, 'TOKEN_INVALID', ACCOUNT_MESSAGES.tokenInvalid);
    this.repository.setPasswordHash(userId, passwordHash);
    this.repository.markVerified(userId); // proving control of the mailbox verifies the address too
    this.repository.revokeSessions(userId);
    return {reset: true};
  }
  async changePassword({userId, currentPassword, password, session}) {
    const account = this.repository.byUserId(userId); if (!account) throw problem(404, 'NOT_FOUND', 'This account has no password sign-in.');
    if (!await this.hasher.verify(currentPassword, account.password_hash)) throw problem(403, 'CURRENT_PASSWORD_WRONG', ACCOUNT_MESSAGES.currentPasswordWrong);
    const verdict = this.policy.evaluate(password, {email: account.email}); if (!verdict.ok) throw problem(400, verdict.code, verdict.message);
    this.repository.setPasswordHash(userId, await this.hasher.hash(password));
    this.repository.revokeSessions(userId); // every other device signs out; this browser gets a fresh session
    const user = {id: account.user_id, name: account.name};
    return {...this.store.newSession(user, null), user, changed: true};
  }
  async deleteAccount({userId, password}) {
    const account = this.repository.byUserId(userId);
    if (account && !await this.hasher.verify(password, account.password_hash)) throw problem(403, 'CURRENT_PASSWORD_WRONG', ACCOUNT_MESSAGES.currentPasswordWrong);
    this.repository.deleteAccount(userId); return {deleted: true, message: ACCOUNT_MESSAGES.accountDeleted};
  }
  profile(userId) {
    const a = this.repository.byUserId(userId);
    return a ? {email: a.email, emailVerified: !!a.email_verified_at, emailVerificationRequired: this.verificationRequired, mailAvailable: this.mailAvailable, passwordAccount: true} : {passwordAccount: false};
  }
}
