/* AccountRepository — persistence for e-mail + password accounts (SQLite, via the website's Store connection).
 *
 * Tables (created here, idempotently):
 *   credentials(user_id PK -> users.id, email UNIQUE, password_hash, email_verified_at, created, updated)
 *   account_tokens(token_hash PK, user_id -> users.id, kind 'verify'|'reset', expires, used_at, created)
 * A password account is a row in the existing `users` table with issuer 'local' and subject = normalised
 * e-mail, plus one `credentials` row. External OIDC accounts (Google) keep their issuer URL and have no
 * credentials row. Tokens are stored ONLY as SHA-256 digests; the raw token exists in the e-mail alone.
 *
 * SQLite has no stored procedures; the repository class is this codebase's established data boundary
 * (see server/store.mjs) — no SQL appears outside repository classes.
 * Callers: server/accounts.mjs. Constants: server/account-constants.mjs.
 */
import {randomUUID} from 'node:crypto';
import {sha} from './store.mjs';
import {LOCAL_ISSUER, TOKEN_KIND_RESET, TOKEN_KIND_VERIFY} from './account-constants.mjs';

export class AccountRepository {
  constructor(store) {
    this.store = store; this.db = store.db;
    this.db.exec(`CREATE TABLE IF NOT EXISTS credentials (user_id TEXT PRIMARY KEY REFERENCES users(id), email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, email_verified_at INTEGER, created INTEGER NOT NULL, updated INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS account_tokens (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), kind TEXT NOT NULL CHECK(kind IN ('${TOKEN_KIND_VERIFY}','${TOKEN_KIND_RESET}')), expires INTEGER NOT NULL, used_at INTEGER, created INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS account_tokens_user ON account_tokens(user_id,kind);`);
  }
  byEmail(email) { return this.db.prepare('SELECT c.*, u.name FROM credentials c JOIN users u ON u.id=c.user_id WHERE c.email=?').get(email) || null; }
  byUserId(userId) { return this.db.prepare('SELECT c.*, u.name FROM credentials c JOIN users u ON u.id=c.user_id WHERE c.user_id=?').get(userId) || null; }
  /** Creates users + credentials rows atomically; returns the user {id,name}. Throws on a duplicate e-mail. */
  create({email, name, passwordHash}) {
    const user = {id: randomUUID(), name};
    const now = Date.now();
    this.store.transaction(() => {
      this.db.prepare('INSERT INTO users VALUES (?,?,?,?)').run(user.id, LOCAL_ISSUER, email, name);
      this.db.prepare('INSERT INTO credentials VALUES (?,?,?,NULL,?,?)').run(user.id, email, passwordHash, now, now);
    });
    return user;
  }
  setPasswordHash(userId, passwordHash) { this.db.prepare('UPDATE credentials SET password_hash=?, updated=? WHERE user_id=?').run(passwordHash, Date.now(), userId); }
  markVerified(userId) { this.db.prepare('UPDATE credentials SET email_verified_at=?, updated=? WHERE user_id=? AND email_verified_at IS NULL').run(Date.now(), Date.now(), userId); }
  /** Stores a token digest; earlier unused tokens of the same kind for the user are invalidated (one live link at a time). */
  issueToken(userId, kind, rawToken, ttlMs) {
    const now = Date.now();
    this.store.transaction(() => {
      this.db.prepare('UPDATE account_tokens SET used_at=? WHERE user_id=? AND kind=? AND used_at IS NULL').run(now, userId, kind);
      this.db.prepare('INSERT INTO account_tokens VALUES (?,?,?,?,NULL,?)').run(sha(rawToken), userId, kind, now + ttlMs, now);
    });
  }
  /** Looks a live token up WITHOUT consuming it (used to validate the rest of a request before burning the link). */
  peekToken(rawToken, kind) {
    if (typeof rawToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(rawToken)) return null;
    return this.db.prepare('SELECT user_id FROM account_tokens WHERE token_hash=? AND kind=? AND used_at IS NULL AND expires>?').get(sha(rawToken), kind, Date.now())?.user_id ?? null;
  }
  /** Consumes a live token atomically (single use); returns the user_id or null. */
  consumeToken(rawToken, kind) {
    if (typeof rawToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(rawToken)) return null;
    const digest = sha(rawToken), now = Date.now();
    return this.store.transaction(() => {
      const row = this.db.prepare('SELECT user_id FROM account_tokens WHERE token_hash=? AND kind=? AND used_at IS NULL AND expires>?').get(digest, kind, now);
      if (!row) return null;
      this.db.prepare('UPDATE account_tokens SET used_at=? WHERE token_hash=?').run(now, digest);
      return row.user_id;
    });
  }
  /** Ends every session of the user (after a password change or reset, and on deletion). */
  revokeSessions(userId) { this.db.prepare('DELETE FROM sessions WHERE user_id=?').run(userId); }
  /** Deletes the account and everything that references it; jobs/tracks the user created stay in the catalogue as owned-by-service history. */
  deleteAccount(userId) {
    this.store.transaction(() => {
      this.db.prepare('DELETE FROM account_tokens WHERE user_id=?').run(userId);
      this.db.prepare('DELETE FROM sessions WHERE user_id=?').run(userId);
      this.db.prepare('DELETE FROM favorites WHERE owner=?').run(userId);
      this.db.prepare('DELETE FROM playlists WHERE owner=?').run(userId);
      this.db.prepare('DELETE FROM credentials WHERE user_id=?').run(userId);
      this.db.prepare('DELETE FROM users WHERE id=?').run(userId);
    });
  }
  purgeExpiredTokens() { return this.db.prepare('DELETE FROM account_tokens WHERE expires<=? OR used_at IS NOT NULL AND used_at<=?').run(Date.now(), Date.now() - 86400000).changes; }
}
