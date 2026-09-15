/**
 * cf-inspect.mjs — read-only inspector for a CloudFront distribution (operator tool, deploy of 2026-09-15).
 *
 * Runs `aws cloudfront get-distribution-config` with the named profile, writes the raw JSON (UTF-8) to the given
 * file so the exact pre-change configuration is kept as a backup, and prints the facts the cutover needs:
 * origins with their custom headers (names only — the X-Origin-Verify VALUE is never printed), the default and
 * per-path behaviours with their cache / origin-request / response-headers policy ids, aliases and HTTP version.
 * Usage: node deploy-20260915/cf-inspect.mjs <distributionId> <profile> <backupFile>
 */
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';

const [id, profile, backupFile] = process.argv.slice(2);
if (!id || !profile || !backupFile) throw new Error('usage: cf-inspect.mjs <distributionId> <profile> <backupFile>');
const raw = execFileSync('aws', ['cloudfront', 'get-distribution-config', '--id', id, '--profile', profile, '--output', 'json'], {encoding: 'utf8', maxBuffer: 16 * 1024 * 1024});
writeFileSync(backupFile, raw, 'utf8');
const {ETag, DistributionConfig: d} = JSON.parse(raw);
console.log('ETag', ETag);
for (const o of d.Origins.Items) console.log('ORIGIN', o.Id, o.DomainName, JSON.stringify(o.CustomOriginConfig ?? {}), 'customHeaders:', JSON.stringify((o.CustomHeaders?.Items ?? []).map(h => h.HeaderName)));
const b = d.DefaultCacheBehavior;
console.log('DEFAULT', b.TargetOriginId, 'cache', b.CachePolicyId, 'orp', b.OriginRequestPolicyId, 'rhp', b.ResponseHeadersPolicyId ?? '-', 'methods', JSON.stringify(b.AllowedMethods.Items), b.ViewerProtocolPolicy, 'compress', b.Compress);
for (const c of d.CacheBehaviors?.Items ?? []) console.log('BEHAVIOR', c.PathPattern, c.TargetOriginId, 'cache', c.CachePolicyId, 'orp', c.OriginRequestPolicyId, 'methods', JSON.stringify(c.AllowedMethods.Items));
console.log('aliases', JSON.stringify(d.Aliases.Items), 'enabled', d.Enabled, 'http', d.HttpVersion, 'ipv6', d.IsIPV6Enabled, 'root', JSON.stringify(d.DefaultRootObject));
