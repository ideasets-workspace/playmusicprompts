/* Unit tests for the account primitives: PasswordPolicy (NIST SP 800-63B-4 3.1.1.2) and PasswordHasher (scrypt).
 * Every expectation below is traceable to the downloaded sources named in server/account-constants.mjs. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {PasswordPolicy} from '../server/password-policy.mjs';
import {PasswordHasher} from '../server/password-hash.mjs';
import {PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, SCRYPT_COST} from '../server/account-constants.mjs';

test('policy: 15-code-point minimum, 128 maximum, Unicode counted per code point, no composition rules', () => {
  const policy = new PasswordPolicy();
  assert.equal(policy.blocklist.size > 10000, true, 'blocklist loaded');
  assert.equal(policy.evaluate('short password').ok, false);
  assert.equal(policy.evaluate('short password').code, 'PASSWORD_TOO_SHORT');
  assert.equal(policy.evaluate('aaaaaaaaaaaaaaa').code, 'PASSWORD_BLOCKLISTED', '15 identical letters is a real leaked password (on the list), refused for that reason and not for composition');
  assert.equal(policy.evaluate('quietviolinriver').ok, true, '16 plain lower-case letters pass: no composition rule');
  assert.equal(policy.evaluate('correct horse battery staple').ok, true, 'spaces are legal characters');
  assert.equal(policy.evaluate('🎵'.repeat(15)).ok, true, '15 emoji = 15 code points (30 UTF-16 units) pass');
  assert.equal(policy.evaluate('🎵'.repeat(14)).code, 'PASSWORD_TOO_SHORT');
  assert.equal(policy.evaluate('x'.repeat(PASSWORD_MAX_LENGTH)).ok, true);
  assert.equal(policy.evaluate('x'.repeat(PASSWORD_MAX_LENGTH + 1)).code, 'PASSWORD_TOO_LONG');
});

test('policy: the ENTIRE password is compared against the blocklist and context words; substrings are not', () => {
  const policy = new PasswordPolicy();
  const listed = [...policy.blocklist][0];
  assert.equal(policy.evaluate(listed).code, 'PASSWORD_BLOCKLISTED');
  assert.equal(policy.evaluate(listed + ' plus more words').ok, true, 'a listed value inside a longer password is not the same password');
  assert.equal(policy.evaluate('PlayMusicPrompts.com').code, 'PASSWORD_CONTEXTUAL');
  assert.equal(policy.evaluate('someone@example.com', {email: 'Someone@Example.com'}).code, 'PASSWORD_CONTEXTUAL');
  assert.equal(policy.evaluate('averyveryverylonglocalpart', {email: 'averyveryverylonglocalpart@example.com'}).code, 'PASSWORD_CONTEXTUAL');
  assert.equal(policy.evaluate('a genuinely different phrase', {email: 'someone@example.com'}).ok, true);
});

test('hasher: scrypt round-trip with OWASP parameters, constant-time verify, self-describing format, rehash detection', async () => {
  const hasher = new PasswordHasher();
  const started = Date.now();
  const stored = await hasher.hash('correct horse battery staple');
  const elapsed = Date.now() - started;
  const parsed = PasswordHasher.parse(stored);
  assert.equal(parsed.cost, SCRYPT_COST); assert.equal(parsed.blockSize, 8); assert.equal(parsed.parallelization, 1);
  assert.equal(parsed.salt.length, 16); assert.equal(parsed.key.length, 32);
  assert.equal(await hasher.verify('correct horse battery staple', stored), true);
  assert.equal(await hasher.verify('correct horse battery stapl3', stored), false);
  assert.equal(await hasher.verify('correct horse battery staple', 'garbage'), false);
  assert.equal(hasher.needsRehash(stored), false);
  assert.equal(hasher.needsRehash('scrypt$16384$8$1$' + parsed.salt.toString('base64url') + '$' + parsed.key.toString('base64url')), true, 'a weaker legacy cost is flagged for rehash');
  const again = await hasher.hash('correct horse battery staple');
  assert.notEqual(again, stored, 'fresh salt every time');
  console.log(`scrypt N=2^17 r=8 p=1 took ${elapsed} ms on this machine`);
});
