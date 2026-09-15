/**
 * package.mjs — build the deployable archive of website/ and upload it to the deploy bucket (deploy 2026-09-15).
 *
 * Contents: public/, server/, scripts/, test/, package.json, package-lock.json, README.md, AGENTS.md. Excluded on
 * purpose: node_modules (rebuilt on the host with `npm ci` from the lock file), .state (private runtime data),
 * .secrets-owner (owner-only), .claude. The archive's SHA-256 is printed and written next to it so the host-side
 * script can refuse a corrupted or tampered download. Upload target: s3://playmusicprompts-deploy-376210053952/
 * website/<stamp>.tar.gz (profile geomagics_production). Usage: node deploy-20260915/package.mjs
 */
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root = resolve(import.meta.dirname, '..');
const site = resolve(root, 'website');
const out = resolve(root, 'deploy-20260915', 'artifacts'); mkdirSync(out, {recursive: true});
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const archive = resolve(out, `website-${stamp}.tar.gz`);
const members = ['public', 'server', 'scripts', 'test', 'package.json', 'package-lock.json', 'README.md', 'AGENTS.md'];

execFileSync('tar', ['-czf', archive, '-C', site, ...members], {stdio: 'inherit'});
const bytes = readFileSync(archive);
const sha256 = createHash('sha256').update(bytes).digest('hex');
writeFileSync(`${archive}.sha256`, `${sha256}  ${archive.split(/[\\/]/).pop()}\n`);
const key = `website/${archive.split(/[\\/]/).pop()}`;
execFileSync('aws', ['s3', 'cp', archive, `s3://playmusicprompts-deploy-376210053952/${key}`, '--profile', 'geomagics_production', '--only-show-errors'], {stdio: 'inherit'});
const listing = execFileSync('tar', ['-tzf', archive], {encoding: 'utf8'}).trim().split('\n');
console.log(JSON.stringify({archive: key, bytes: bytes.length, sha256, entries: listing.length, topLevel: [...new Set(listing.map(l => l.replace(/\r$/, '').split('/')[0]))]}, null, 1));

// Verification bundle: the same website tree plus the test fixtures the suite reads from the PROJECT docs tree
// (test/*.mjs open ../../docs/implementation/2026-09-12-website-api/* and one docs/api/_captures file). The host
// runs `npm test` from this bundle in a throwaway directory, so /opt/pmp-website stays a pure runtime install.
const verify = resolve(out, `verify-${stamp}.tar.gz`);
execFileSync('tar', ['-czf', verify, '-C', root,
  ...members.map(m => `website/${m}`),
  'docs/implementation/2026-09-12-website-api/live-capabilities.json',
  'docs/implementation/2026-09-12-website-api/parameter-gap-audit.json',
  'docs/api/_captures/2026-09-05-job-cmtot1xn-sung-envelope.json'], {stdio: 'inherit'});
const verifyBytes = readFileSync(verify);
const verifySha = createHash('sha256').update(verifyBytes).digest('hex');
const verifyKey = `verify/${verify.split(/[\\/]/).pop()}`;
execFileSync('aws', ['s3', 'cp', verify, `s3://playmusicprompts-deploy-376210053952/${verifyKey}`, '--profile', 'geomagics_production', '--only-show-errors'], {stdio: 'inherit'});
console.log(JSON.stringify({verifyArchive: verifyKey, bytes: verifyBytes.length, sha256: verifySha}, null, 1));
