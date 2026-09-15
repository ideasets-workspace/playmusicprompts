/**
 * cf-update-orp.mjs — switch the www distribution's DEFAULT behaviour to the managed origin request policy
 * "AllViewerAndCloudFrontHeaders-2022-06" so the origin receives CloudFront-Viewer-Address (the gateway's primary
 * source of the viewer IP; X-Forwarded-For's last element remains its fallback). Nothing else in the distribution
 * changes; the exact pre-change config was saved by cf-inspect.mjs and is saved again here with the ETag used.
 * Usage: node deploy-20260915/cf-update-orp.mjs <distributionId> <profile> <newOriginRequestPolicyId>
 */
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const [id, profile, newPolicyId] = process.argv.slice(2);
if (!id || !profile || !newPolicyId) throw new Error('usage: cf-update-orp.mjs <distributionId> <profile> <newOriginRequestPolicyId>');
const env = {...process.env, PYTHONUTF8: '1'};
const aws = (args, input) => execFileSync('aws', [...args, '--profile', profile, '--output', 'json'], {encoding: 'utf8', input, env, maxBuffer: 16 * 1024 * 1024});

const current = JSON.parse(aws(['cloudfront', 'get-distribution-config', '--id', id]));
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
writeFileSync(resolve(import.meta.dirname, `cf-www-config-before-orp-${stamp}.json`), JSON.stringify(current, null, 2));
const config = current.DistributionConfig;
const before = config.DefaultCacheBehavior.OriginRequestPolicyId;
if (before === newPolicyId) { console.log(JSON.stringify({unchanged: true, originRequestPolicyId: before})); process.exit(0); }
config.DefaultCacheBehavior.OriginRequestPolicyId = newPolicyId;
const configPath = resolve(import.meta.dirname, `cf-www-config-after-orp-${stamp}.json`);
writeFileSync(configPath, JSON.stringify(config));
const updated = JSON.parse(aws(['cloudfront', 'update-distribution', '--id', id, '--if-match', current.ETag, '--distribution-config', `file://${configPath.replace(/\\/g, '/')}`]));
console.log(JSON.stringify({before, after: updated.Distribution.DistributionConfig.DefaultCacheBehavior.OriginRequestPolicyId, status: updated.Distribution.Status, etagBefore: current.ETag, etagAfter: updated.ETag}, null, 1));
