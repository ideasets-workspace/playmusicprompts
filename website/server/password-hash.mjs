/* PasswordHasher — scrypt password hashing for the PlayMusicPrompts website (OWASP parameters, Node crypto).
 *
 * WHAT IT DOES
 *   `hash(password)` derives a 32-byte key with scrypt (N = 2^17, r = 8, p = 1 — the OWASP Password Storage
 *   Cheat Sheet minimum when Argon2id is unavailable) over a fresh 16-byte random salt, and returns a
 *   self-describing string `scrypt$N$r$p$<salt-b64url>$<key-b64url>` so that the parameters travel with the
 *   hash and can be raised later. `verify(password, stored)` re-derives with the stored parameters and compares
 *   in constant time (`crypto.timingSafeEqual`). `needsRehash(stored)` says whether a stored hash was made with
 *   weaker parameters than the current constants, so sign-in can transparently upgrade it.
 *
 * WHY THESE CHOICES (read from the downloaded primary sources this session)
 *   - Node's scryptSync raises an error when 128 * N * r exceeds `maxmem` (default 32 MiB); with N = 2^17 and
 *     r = 8 the derivation needs 128 MiB, so SCRYPT_MAX_MEMORY_BYTES (256 MiB) is passed explicitly.
 *   - The salt is 16 random bytes ("random and at least 16 bytes long", Node docs citing NIST SP 800-132).
 *   - The derivation is run asynchronously (`crypto.scrypt`) in the libuv threadpool so a sign-in never blocks
 *     the single HTTP thread for the ~100 ms a 128 MiB scrypt takes.
 *
 * Callers: server/accounts.mjs. Constants: server/account-constants.mjs.
 */
import {randomBytes, scrypt, timingSafeEqual} from 'node:crypto';
import {PASSWORD_HASH_SCHEME, SCRYPT_BLOCK_SIZE, SCRYPT_COST, SCRYPT_KEY_LENGTH, SCRYPT_MAX_MEMORY_BYTES, SCRYPT_PARALLELIZATION, SCRYPT_SALT_BYTES} from './account-constants.mjs';

const derive = (password, salt, params) => new Promise((resolvePromise, reject) => {
  scrypt(Buffer.from(password, 'utf8'), salt, SCRYPT_KEY_LENGTH, {cost: params.cost, blockSize: params.blockSize, parallelization: params.parallelization, maxmem: SCRYPT_MAX_MEMORY_BYTES},
    (error, key) => error ? reject(error) : resolvePromise(key));
});

export class PasswordHasher {
  constructor() { this.params = {cost: SCRYPT_COST, blockSize: SCRYPT_BLOCK_SIZE, parallelization: SCRYPT_PARALLELIZATION}; }

  /** Parses `scrypt$N$r$p$salt$key`; returns null for anything malformed (never throws on stored data). */
  static parse(stored) {
    if (typeof stored !== 'string') return null;
    const parts = stored.split('$');
    if (parts.length !== 6 || parts[0] !== PASSWORD_HASH_SCHEME) return null;
    const [cost, blockSize, parallelization] = parts.slice(1, 4).map(Number);
    if (![cost, blockSize, parallelization].every(n => Number.isSafeInteger(n) && n > 0)) return null;
    try {
      const salt = Buffer.from(parts[4], 'base64url'), key = Buffer.from(parts[5], 'base64url');
      if (!salt.length || !key.length) return null;
      return {cost, blockSize, parallelization, salt, key};
    } catch { return null; }
  }

  /** @returns {Promise<string>} the self-describing hash string. */
  async hash(password) {
    const salt = randomBytes(SCRYPT_SALT_BYTES);
    const key = await derive(password, salt, this.params);
    return [PASSWORD_HASH_SCHEME, this.params.cost, this.params.blockSize, this.params.parallelization, salt.toString('base64url'), key.toString('base64url')].join('$');
  }

  /** Constant-time comparison after re-deriving with the STORED parameters. Malformed stored data verifies false. */
  async verify(password, stored) {
    const parsed = PasswordHasher.parse(stored);
    if (!parsed || typeof password !== 'string') return false;
    const key = await derive(password, parsed.salt, parsed);
    return key.length === parsed.key.length && timingSafeEqual(key, parsed.key);
  }

  /** True when the stored hash was produced with weaker parameters than the current constants. */
  needsRehash(stored) {
    const parsed = PasswordHasher.parse(stored);
    return !parsed || parsed.cost < this.params.cost || parsed.blockSize < this.params.blockSize || parsed.parallelization < this.params.parallelization || parsed.key.length < SCRYPT_KEY_LENGTH;
  }
}
