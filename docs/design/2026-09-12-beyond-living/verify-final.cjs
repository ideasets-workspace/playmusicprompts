'use strict';
// LIVE-03 bounded verification: inspect the seven harnesses; select production
// modules; run every suite; syntax-check application JS; verify both protected
// file sets/hashes; reject source drift; record evidence and explicit limits.
// This runner only writes its own result files in this design directory.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawn} = require('node:child_process');
const {pathToFileURL} = require('node:url');
const dir = __dirname, root = path.resolve(dir, '../../..');
const site = path.join(root, 'website_html_templates_beyond');
const baselinePath = path.join(dir, 'accepted-manifests.json');
const expectedAtmosphereSHA = '6368af266ecab0f881ee6d01fc48481309215d09f1be4995f657498f57028015';
const definitions = [
  {name: 'host', expected: 81},
  {name: 'lab-controls', expected: 45},
  {name: 'touch', expected: 16},
  {name: 'tidal', expected: 19, asset: 'lab-tidal.js'},
  {name: 'monolith', expected: 22, asset: 'lab-monolith.js'},
  {name: 'particle', expected: 30, asset: 'lab-aether.js'},
  {name: 'atmosphere', expected: 16, asset: 'lab-aether-atmosphere.js'}
];
const excluded = new Set(['scripts', 'verification', 'captures']);
const slash = value => value.split(path.sep).join('/');
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const hashValue = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
function files(folder, skip = new Set()) {
  const found = [];
  function walk(relative = '') {
    for (const item of fs.readdirSync(path.join(folder, relative), {withFileTypes: true})) {
      if (!relative && skip.has(item.name)) continue;
      const name = path.join(relative, item.name);
      if (item.isDirectory()) walk(name);
      else if (item.isFile()) found.push(slash(name));
      else throw new Error(`Unsupported filesystem entry: ${path.join(folder, name)}`);
    }
  }
  walk(); return found.sort();
}
function sourceManifest() {
  return files(site, excluded).filter(file => /\.(?:js|mjs|cjs|css|html|cmd|md|json)$/i.test(file))
    .map(file => ({file, sha256: sha(path.join(site, file))}));
}
function compareManifests(before, after) {
  const left = new Map(before.map(row => [row.file, row.sha256]));
  const right = new Map(after.map(row => [row.file, row.sha256]));
  return {
    added: [...right.keys()].filter(file => !left.has(file)),
    missing: [...left.keys()].filter(file => !right.has(file)),
    changed: [...left.keys()].filter(file => right.has(file) && left.get(file) !== right.get(file))
  };
}
function hasChanges(diff) {return Object.values(diff).some(list => list.length);}
function protectedTrees() {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  return [['original', 'website_html_templates', 227], ['accepted', 'website_html_templates_lab', 242]].map(([key, folder, count]) => {
    const raw = baseline[key];
    if (!Array.isArray(raw) || raw.length !== count) throw new Error(`Invalid ${key} baseline count`);
    // The copy manifest uses native Windows separators; compare normalized names.
    const expected = raw.map(row => ({...row, file: typeof row.file === 'string' ? row.file.replaceAll('\\', '/') : row.file}));
    const names = new Set();
    for (const row of expected) {
      if (typeof row.file !== 'string' || row.file.includes(':') || path.isAbsolute(row.file) || row.file.split('/').some(part => !part || part === '..' || part === '.') || !/^[a-f0-9]{64}$/i.test(row.sha256) || names.has(row.file)) throw new Error(`Invalid ${key} baseline row`);
      names.add(row.file);
    }
    const actual = files(path.join(root, folder)).map(file => ({file, sha256: sha(path.join(root, folder, file))}));
    const differences = compareManifests(expected, actual);
    return {key, folder, expectedFiles: count, actualFiles: actual.length, unchanged: !hasChanges(differences), differences, manifestSHA256: hashValue(actual)};
  });
}
function run(args) {
  return new Promise(resolve => {
    const began = Date.now(), child = spawn(process.execPath, args, {cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});
    let stdout = '', stderr = '', error = null, timedOut = false;
    const timer = setTimeout(() => {timedOut = true; child.kill();}, 60000);
    child.stdout.on('data', data => {stdout += data;});
    child.stderr.on('data', data => {stderr += data;});
    child.on('error', value => {error = value.message;});
    child.on('close', (exitCode, signal) => {
      clearTimeout(timer);
      resolve({exitCode, signal, timedOut, error, elapsedMs: Date.now() - began, stdout, stderr});
    });
  });
}
function parseOutput(text) {
  const trimmed = text.trim();
  try {return JSON.parse(trimmed);} catch {}
  // The particle harness emits individual PASS lines before one final JSON line.
  const lines = trimmed.split(/\r?\n/), final = lines.pop();
  if (!lines.length || lines.some(line => !line.startsWith('PASS '))) throw new Error('Unexpected non-JSON harness output');
  const report = JSON.parse(final);
  if (report.checks !== lines.length) throw new Error('Particle PASS lines disagree with final count');
  return report;
}
async function suite(definition, sources) {
  const script = path.join(dir, `${definition.name}-check.mjs`);
  const args = [script, ...(definition.asset ? [path.join(site, definition.asset)] : [])];
  const execution = await run(args), problems = [];
  let report = null, count = null;
  if (execution.exitCode !== 0 || execution.error || execution.timedOut) problems.push('Harness process did not complete successfully');
  try {
    report = parseOutput(execution.stdout);
    count = typeof report.passed === 'number' ? report.passed : report.checks;
    if (count !== definition.expected) problems.push(`Expected ${definition.expected} checks; received ${count}`);
    if ((report.failed ?? 0) !== 0 || (report.failures?.length ?? 0) !== 0) problems.push('Harness reports failed checks');
    for (const field of ['checks', 'names', 'results']) if (Array.isArray(report[field]) && report[field].length !== count) problems.push(`${field} length does not match passing count`);
    const expectedHash = definition.asset && sources.find(row => row.file === definition.asset)?.sha256;
    const reportedHash = report.sha256 || report.moduleSHA256;
    if (reportedHash && reportedHash !== expectedHash) problems.push('Reported module hash differs from selected production source');
    if (report.module) {
      const expectedURL = pathToFileURL(path.join(site, definition.asset));
      if (![expectedURL.href, expectedURL.pathname].includes(report.module)) problems.push('Reported module path is outside selected production source');
    }
    if (definition.name === 'host' && report.hostSHA256 !== sources.find(row => row.file === 'player-three-scene.js').sha256) problems.push('Host source hash mismatch');
    if (definition.name === 'atmosphere') {
      if (report.particleModule !== pathToFileURL(path.join(site, 'lab-aether.js')).pathname || report.particleSHA256 !== sources.find(row => row.file === 'lab-aether.js').sha256) problems.push('Atmosphere cross-module checks did not select the production particle source');
    }
  } catch (error) {problems.push(error.message);}
  return {name: definition.name, expectedChecks: definition.expected, passedChecks: count, passed: problems.length === 0, problems, script: slash(path.relative(root, script)), scriptSHA256: sha(script), args, productionAsset: definition.asset || null, report, execution};
}
async function main() {
  const previousPath = path.join(dir, 'integrated-results.json');
  const previous = fs.existsSync(previousPath) ? JSON.parse(fs.readFileSync(previousPath, 'utf8')) : null;
  const result = {
    startedAt: new Date().toISOString(), status: 'running', node: process.version,
    site: slash(path.relative(root, site)), runnerSHA256: sha(__filename),
    baselineSHA256: sha(baselinePath), expectedAtmosphereSHA256: expectedAtmosphereSHA,
    atomicScope: ['Run all seven existing suites against successor production modules', 'Syntax-check successor application JavaScript', 'Verify exact protected file sets and SHA256 hashes', 'Reject source or harness drift during verification', 'Write suite evidence and report verification limits'],
    limits: 'Actual production source, numeric behavior and lifecycle evidence with the explicit renderer/DOM boundaries described by each suite. No GPU shader compilation, rendered artistic quality, browser-device behavior, audio output or performance claim. Actual browser QA is separate.',
    sourceManifestExclusions: [...excluded],
    syntaxExclusions: [...excluded, 'vendor'],
    harnessCorrection: 'atmosphere-check now resolves its particle dependency beside the selected volume module, so production cross-module checks cannot silently use the docs asset. Assertions are unchanged.',
    previousFailures: [...(previous?.previousFailures || []), ...(previous?.status === 'failed' ? [{startedAt: previous.startedAt, sourceManifestSHA256: previous.sourceManifestSHA256, errors: previous.errors}] : [])],
    errors: []
  };
  try {
    result.sourceManifest = sourceManifest();
    result.sourceManifestSHA256 = hashValue(result.sourceManifest);
    result.harnessManifest = definitions.map(item => ({file: `${item.name}-check.mjs`, sha256: sha(path.join(dir, `${item.name}-check.mjs`))}));
    result.protectedBefore = protectedTrees();
    if (result.protectedBefore.some(item => !item.unchanged)) result.errors.push('A protected source tree differs before verification');
    if (sha(path.join(site, 'lab-aether-atmosphere.js')) !== expectedAtmosphereSHA) result.errors.push('Final atmosphere hash differs from parent-approved source');
    result.suites = await Promise.all(definitions.map(definition => suite(definition, result.sourceManifest)));
    for (const item of result.suites) fs.writeFileSync(path.join(dir, `${item.name}-results.json`), JSON.stringify(item, null, 2) + '\n');
    const scripts = files(site, new Set([...excluded, 'vendor'])).filter(file => /\.(?:js|mjs|cjs)$/i.test(file));
    result.syntax = [];
    // Keep process count bounded; each parser is independent and writes nothing.
    for (let i = 0; i < scripts.length; i += 4) {
      const chunk = await Promise.all(scripts.slice(i, i + 4).map(async file => {
        const execution = await run(['--check', path.join(site, file)]);
        return {file, sha256: sha(path.join(site, file)), passed: execution.exitCode === 0 && !execution.error && !execution.timedOut, ...execution};
      }));
      result.syntax.push(...chunk);
    }
    result.protectedAfter = protectedTrees();
    result.sourceDrift = compareManifests(result.sourceManifest, sourceManifest());
    result.harnessDrift = compareManifests(result.harnessManifest, definitions.map(item => ({file: `${item.name}-check.mjs`, sha256: sha(path.join(dir, `${item.name}-check.mjs`))})));
    if (result.suites.some(item => !item.passed)) result.errors.push('One or more suites failed');
    if (result.syntax.some(item => !item.passed)) result.errors.push('One or more JavaScript syntax checks failed');
    if (result.protectedAfter.some(item => !item.unchanged)) result.errors.push('A protected source tree differs after verification');
    if (hasChanges(result.sourceDrift)) result.errors.push('Successor source changed during verification');
    if (hasChanges(result.harnessDrift)) result.errors.push('A test harness changed during verification');
    if (sha(baselinePath) !== result.baselineSHA256 || sha(__filename) !== result.runnerSHA256) result.errors.push('Verification baseline or runner changed during verification');
    result.totalPassingChecks = result.suites.reduce((sum, item) => sum + (Number.isFinite(item.passedChecks) ? item.passedChecks : 0), 0);
  } catch (error) {result.errors.push(error.stack || error.message);}
  result.finishedAt = new Date().toISOString();
  result.status = result.errors.length ? 'failed' : 'passed';
  fs.writeFileSync(path.join(dir, 'integrated-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({status: result.status, suites: result.suites?.map(item => ({name: item.name, passed: item.passed, checks: item.passedChecks, problems: item.problems})), totalPassingChecks: result.totalPassingChecks, syntaxFiles: result.syntax?.length, protectedTrees: result.protectedAfter, sourceManifestSHA256: result.sourceManifestSHA256, errors: result.errors}, null, 2));
  if (result.errors.length) process.exitCode = 1;
}
main().catch(error => {console.error(error); process.exitCode = 1;});
