/* PasswordPolicy — the NIST SP 800-63B-4 Sec. 3.1.1.2 verifier rules for the PlayMusicPrompts website.
 *
 * WHAT IT DOES
 *   `evaluate(password, context)` returns `{ok:true}` or `{ok:false, code, message}` where `message` is the
 *   reason the person sees (NIST: "SHALL provide the reason for rejection"). Checks, in order:
 *     1. length in Unicode code points is within [PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH]
 *        (NIST: each code point counts once; minimum 15 for single-factor; at least 64 permitted);
 *     2. the ENTIRE password is not on the blocklist of commonly used / compromised passwords
 *        (NIST: "The entire password SHALL be subject to comparison, not substrings");
 *     3. the entire password is not a context-specific value — the service name or the account's own
 *        e-mail address / its local part (NIST: "Context-specific words, such as the name of the service,
 *        the username, and derivatives thereof").
 *   Nothing else is checked: NIST forbids composition rules, hints and periodic rotation, and this class
 *   deliberately has no method for any of them.
 *
 * WHERE THE LIST COMES FROM
 *   server/data/password-blocklist-min15.txt — SecLists xato-net 1M, entries of 15+ characters, MIT licence;
 *   see server/data/password-blocklist-PROVENANCE.txt. Loaded once, kept as a Set of exact strings.
 *   Comparison is case-sensitive on purpose: NIST speaks of the entire password; a variant that differs only
 *   in case is a different password (the guessing budget is spent on it separately).
 *
 * Callers: server/accounts.mjs (register, reset, change password). Constants: server/account-constants.mjs.
 */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {ACCOUNT_MESSAGES, PASSWORD_BLOCKLIST_FILE, PASSWORD_CONTEXT_WORDS, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH} from './account-constants.mjs';

export class PasswordPolicy {
  /** @param {{blocklistPath?: string, contextWords?: string[]}} [options] — defaults come from the constants module. */
  constructor(options = {}) {
    const blocklistPath = options.blocklistPath || resolve(import.meta.dirname, PASSWORD_BLOCKLIST_FILE);
    this.blocklist = new Set(readFileSync(blocklistPath, 'utf8').split(/\r?\n/).filter(Boolean));
    this.contextWords = (options.contextWords || PASSWORD_CONTEXT_WORDS).map(word => word.toLowerCase());
    this.minLength = PASSWORD_MIN_LENGTH;
    this.maxLength = PASSWORD_MAX_LENGTH;
  }

  /** Number of Unicode code points (NIST: "Each Unicode code point SHALL be counted as a single character"). */
  static codePointLength(text) { return Array.from(text).length; }

  /**
   * @param {string} password — exactly what the person typed (no trimming: spaces are legal characters).
   * @param {{email?: string}} [context] — the account's e-mail, so it and its local part are refused as passwords.
   * @returns {{ok: true} | {ok: false, code: string, message: string}}
   */
  evaluate(password, context = {}) {
    if (typeof password !== 'string') return {ok: false, code: 'PASSWORD_TOO_SHORT', message: ACCOUNT_MESSAGES.passwordTooShort};
    const length = PasswordPolicy.codePointLength(password);
    if (length < this.minLength) return {ok: false, code: 'PASSWORD_TOO_SHORT', message: ACCOUNT_MESSAGES.passwordTooShort};
    if (length > this.maxLength) return {ok: false, code: 'PASSWORD_TOO_LONG', message: ACCOUNT_MESSAGES.passwordTooLong};
    if (this.blocklist.has(password)) return {ok: false, code: 'PASSWORD_BLOCKLISTED', message: ACCOUNT_MESSAGES.passwordBlocklisted};
    const lowered = password.toLowerCase();
    const contextual = [...this.contextWords];
    if (typeof context.email === 'string' && context.email) {
      const email = context.email.toLowerCase();
      contextual.push(email, email.split('@')[0]);
    }
    if (contextual.some(word => word && word === lowered)) return {ok: false, code: 'PASSWORD_CONTEXTUAL', message: ACCOUNT_MESSAGES.passwordContextual};
    return {ok: true};
  }
}
