/**
 * ssm-run.mjs — run a shell script on the production host through AWS Systems Manager and print its output.
 *
 * Why a tool and not an inline command: PowerShell mangles quoting and writes UTF-16 by default; this file sends
 * the script bytes verbatim (as one `commands` array element per line), waits for completion, and prints stdout,
 * stderr and the exit status, so every deploy step's evidence lands in the transcript exactly as the host wrote it.
 *
 * Usage: node deploy-20260915/ssm-run.mjs <scriptFile> [--timeout <seconds>] [--comment <text>]
 * Fixed target (owner-named host): instance i-0c52f530769d1ac88, profile geomagics_production, region eu-central-1.
 * Nothing here is destructive by itself; the script file decides what runs, and every script is kept in this folder.
 */
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const INSTANCE_ID = 'i-0c52f530769d1ac88';
const PROFILE = 'geomagics_production';
const REGION = 'eu-central-1';
const POLL_MS = 3000;

const args = process.argv.slice(2);
const scriptFile = args[0];
if (!scriptFile) throw new Error('usage: ssm-run.mjs <scriptFile> [--timeout <seconds>] [--comment <text>]');
const flag = (name, fallback) => { const i = args.indexOf(name); return i > 0 && args[i + 1] ? args[i + 1] : fallback; };
const timeoutSeconds = Number(flag('--timeout', '600'));
const comment = flag('--comment', `deploy-20260915 ${scriptFile}`).slice(0, 100);
// --set NAME=VALUE (repeatable) replaces the literal token __NAME__ in the script before sending, so archive keys,
// digests and other run-specific values never have to be hand-edited into the committed script files.
const substitutions = args.flatMap((a, i) => a === '--set' && args[i + 1] ? [args[i + 1]] : []).map(pair => { const eq = pair.indexOf('='); return [pair.slice(0, eq), pair.slice(eq + 1)]; });

let script = readFileSync(scriptFile, 'utf8').replace(/\r\n/g, '\n');
for (const [name, value] of substitutions) script = script.split(`__${name}__`).join(value);
const unresolved = script.match(/__[A-Z0-9_]+__/g);
if (unresolved) throw new Error(`unresolved placeholders in ${scriptFile}: ${[...new Set(unresolved)].join(', ')}`);
// PYTHONUTF8: the AWS CLI is Python; on a Windows console it otherwise dies with a 'charmap' encode error the
// moment a command or its echo carries a non-ASCII byte (measured 2026-09-15 with U+2139 in a grep pattern).
const aws = (...cli) => execFileSync('aws', [...cli, '--profile', PROFILE, '--region', REGION, '--output', 'json'], {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, env: {...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8'}});

// --resume <commandId>: only poll an invocation that was already sent (used when the sender crashed after sending).
const resumeId = flag('--resume', '');

let commandId = resumeId;
if (!commandId) {
  const parameters = JSON.stringify({commands: script.split('\n'), executionTimeout: [String(timeoutSeconds)]});
  const sent = JSON.parse(aws('ssm', 'send-command', '--instance-ids', INSTANCE_ID, '--document-name', 'AWS-RunShellScript', '--comment', comment, '--parameters', parameters));
  commandId = sent.Command.CommandId;
  console.log(`[ssm] command ${commandId} sent (${script.split('\n').length} lines, timeout ${timeoutSeconds}s)`);
} else console.log(`[ssm] resuming command ${commandId}`);

const deadline = Date.now() + (timeoutSeconds + 60) * 1000;
let result;
while (Date.now() < deadline) {
  await new Promise(r => setTimeout(r, POLL_MS));
  try { result = JSON.parse(aws('ssm', 'get-command-invocation', '--command-id', commandId, '--instance-id', INSTANCE_ID)); }
  catch (error) { if (!/InvocationDoesNotExist/.test(String(error.stderr || error.message))) throw error; continue; }
  if (!['Pending', 'InProgress', 'Delayed'].includes(result.Status)) break;
}
if (!result) throw new Error('no invocation result before the deadline');
console.log(`[ssm] status ${result.Status} code ${result.ResponseCode} (${result.ExecutionElapsedTime || '?'})`);
console.log('----- stdout -----'); console.log(result.StandardOutputContent || '');
if (result.StandardErrorContent) { console.log('----- stderr -----'); console.log(result.StandardErrorContent); }
process.exitCode = result.Status === 'Success' ? 0 : 1;
