/* Account-system constants for the PlayMusicPrompts website server.
 *
 * WHAT THIS FILE IS
 *   Every fixed value of the e-mail + password account system (server/password-policy.mjs,
 *   server/password-hash.mjs, server/mailer.mjs, server/accounts.mjs, the account routes in server/http.mjs).
 *   No module carries a literal of its own; each value below names the primary source that fixes it.
 *
 * SOURCES (downloaded 2026-09-15, kept on disk, read this session — never recalled)
 *   NIST SP 800-63B-4, Sec. 3.1.1.2 "Password Verifiers"
 *     docs/research/_sources/2026-09-15-accounts/nist-sp800-63b-4.html
 *     - single-factor passwords: minimum 15 characters (SHALL); maximum permitted at least 64 (SHOULD);
 *     - all printing ASCII + space and Unicode accepted, each code point counted once (SHOULD/SHALL);
 *     - NO other composition rules, NO periodic change, NO hints (SHALL NOT);
 *     - a blocklist of commonly used / compromised values compared against the ENTIRE password, with the
 *       reason for rejection given to the subscriber (SHALL); context-specific words (service name, username)
 *       belong on it; the list need not be excessively large because online attempts are rate-limited.
 *   OWASP Password Storage Cheat Sheet (docs/research/_sources/2026-09-15-accounts/owasp-password-storage.html)
 *     - "If Argon2id is not available, use scrypt with a minimum CPU/memory cost parameter of (2^17), a minimum
 *       block size of 8 (1024 bytes), and a parallelization parameter of 1." Node ships scrypt, not Argon2id.
 *   Node.js v24 crypto (docs/research/_sources/2026-09-15-accounts/node-v24-crypto.html)
 *     - crypto.scryptSync options cost/blockSize/parallelization; "It is an error when (approximately)
 *       128 * N * r > maxmem. Default: 32 * 1024 * 1024" — 128 * 2^17 * 8 = 128 MiB, so maxmem MUST be raised;
 *     - "It is recommended that a salt is random and at least 16 bytes long" (NIST SP 800-132).
 *   Amazon SES API v2 (docs/external-api/aws-sesv2/README.md) — field names of SendEmail, sender must be verified.
 */

/** Minimum password length in Unicode code points (NIST 800-63B-4 3.1.1.2, single-factor SHALL). */
export const PASSWORD_MIN_LENGTH = 15;

/** Maximum password length the verifier accepts (NIST: at least 64 SHOULD be permitted; 128 leaves headroom). */
export const PASSWORD_MAX_LENGTH = 128;

/** Blocklist of commonly used / compromised passwords of 15+ characters (provenance beside the file). */
export const PASSWORD_BLOCKLIST_FILE = 'data/password-blocklist-min15.txt';

/** Context-specific words that may never be the whole password (NIST: "the name of the service"). */
export const PASSWORD_CONTEXT_WORDS = Object.freeze(['playmusicprompts', 'play music prompts', 'playmusicprompts.com']);

/** scrypt parameters (OWASP minimum: N = 2^17, r = 8, p = 1); keylen 32 bytes; salt 16 bytes (NIST SP 800-132). */
export const SCRYPT_COST = 2 ** 17;
export const SCRYPT_BLOCK_SIZE = 8;
export const SCRYPT_PARALLELIZATION = 1;
export const SCRYPT_KEY_LENGTH = 32;
export const SCRYPT_SALT_BYTES = 16;
/** Node: error when 128 * N * r > maxmem (default 32 MiB); 128 * 2^17 * 8 = 128 MiB, so allow 256 MiB. */
export const SCRYPT_MAX_MEMORY_BYTES = 256 * 1024 * 1024;
/** Stored-hash format identifier, so parameters can be raised later and old hashes re-derived on next sign-in. */
export const PASSWORD_HASH_SCHEME = 'scrypt';

/** E-mail address bounds (RFC 5321 local part ≤ 64, whole address ≤ 254 octets in practice). */
export const EMAIL_MAX_LENGTH = 254;
export const EMAIL_PATTERN = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

/** Display-name bounds (matches the `users.name` column usage elsewhere: sliced to 100). */
export const NAME_MAX_LENGTH = 100;

/** Verification / reset tokens: 32 random bytes (base64url, 43 chars); stored only as SHA-256; single use. */
export const ACCOUNT_TOKEN_BYTES = 32;
export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

/** Token kinds persisted in account_tokens.kind. */
export const TOKEN_KIND_VERIFY = 'verify';
export const TOKEN_KIND_RESET = 'reset';

/** Online-guessing throttles (NIST 3.2.2 requires rate limiting; the exact numbers are this website's policy). */
export const SIGN_IN_ATTEMPTS_PER_ACCOUNT_PER_15_MIN = 10;
export const SIGN_IN_ATTEMPTS_PER_IP_PER_15_MIN = 30;
export const REGISTRATIONS_PER_IP_PER_HOUR = 10;
export const RESET_REQUESTS_PER_IP_PER_HOUR = 10;
export const RESET_REQUESTS_PER_ACCOUNT_PER_HOUR = 3;
export const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
export const ONE_HOUR_MS = 60 * 60 * 1000;

/** Issuer recorded in users.issuer for password accounts (external OIDC accounts keep their issuer URL). */
export const LOCAL_ISSUER = 'local';

/** Mail transports: SES in production; a private on-disk outbox for local development (never a fake success). */
export const MAIL_TRANSPORT_SES = 'ses';
export const MAIL_TRANSPORT_FILE = 'file';
export const MAIL_OUTBOX_DIRECTORY = 'outbox';

/**
 * E-mail verification modes. `off` (owner order 2026-09-15 12:41, "email verification olmadan yap şimdilik"): an
 * account is fully usable the moment it is created, no confirmation mail is sent, and mail-dependent features
 * (password reset by e-mail) are shown as "not available yet" until a mail transport exists. `required`: the
 * pre-existing behaviour — a confirmation link is sent and the account page shows its state.
 */
export const EMAIL_VERIFICATION_REQUIRED = 'required';
export const EMAIL_VERIFICATION_OFF = 'off';
export const DEFAULT_EMAIL_VERIFICATION = EMAIL_VERIFICATION_OFF;

/** Public paths the e-mails link to (relative to PMP_ORIGIN). */
export const VERIFY_EMAIL_PATH = '/account.html?verify=';
export const RESET_PASSWORD_PATH = '/account.html?reset=';

/** Messages shown to people. Stable wording; never echoes secrets or internal identifiers. */
export const ACCOUNT_MESSAGES = Object.freeze({
  passwordTooShort: `Use at least ${PASSWORD_MIN_LENGTH} characters. Length matters more than symbols — a phrase you will remember works well.`,
  passwordTooLong: `Passwords can be up to ${PASSWORD_MAX_LENGTH} characters.`,
  passwordBlocklisted: 'That password appears on lists of commonly used or leaked passwords. Please choose a different one.',
  passwordContextual: 'A password should not be the name of this service or your own e-mail address.',
  emailInvalid: 'Enter a valid e-mail address.',
  emailTaken: 'An account with this e-mail already exists. Sign in, or reset your password.',
  nameRequired: 'Tell us what to call you.',
  signInFailed: 'That e-mail and password do not match.',
  signInThrottled: 'Too many sign-in attempts. Please wait a few minutes and try again.',
  registrationThrottled: 'Too many accounts were created from this network recently. Please try again later.',
  resetThrottled: 'Too many reset requests. Please wait before requesting another.',
  tokenInvalid: 'This link is not valid any more. Request a new one.',
  emailNotVerified: 'Please confirm your e-mail address first — we sent you a link.',
  mailUnavailable: 'Your account was created, but the confirmation e-mail could not be sent right now. Use "Resend confirmation" in a moment.',
  identityUnavailable: 'Account sign-in is not connected yet. You can still create and listen.',
  currentPasswordWrong: 'Your current password is not correct.',
  accountDeleted: 'Your account and its saved collections were deleted.',
  resetUnavailable: 'Password reset by e-mail is not available yet. If you are signed in, you can change your password from your account page.',
});
