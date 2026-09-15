/**
 * read-transcript-tail.mjs — operator utility (not part of the site).
 *
 * Purpose: after a context compaction, recover the agent's own last messages from the Cursor transcript
 * (a JSONL file, one event per line) so that the plan the owner approved is re-read from disk rather than
 * recalled. Prints the text parts of the last N message events. Usage:
 *   node scripts/read-transcript-tail.mjs <transcript.jsonl> [count=6] [maxChars=8000]
 */
import {readFileSync} from 'node:fs';

const [file, countArg = '6', maxArg = '8000'] = process.argv.slice(2);
if (!file) throw new Error('transcript path required');
const count = Number(countArg);
const maxChars = Number(maxArg);
const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);

/** Collect every string under a `text` key, recursively, in document order. */
function texts(node, out = []) {
  if (Array.isArray(node)) node.forEach((n) => texts(n, out));
  else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'text' && typeof value === 'string') out.push(value);
      else texts(value, out);
    }
  }
  return out;
}

for (const line of lines.slice(-count)) {
  let event;
  try { event = JSON.parse(line); } catch { console.log('=== unparseable line'); continue; }
  const role = event.role || event.type || event.message?.role || '?';
  const body = texts(event).join('\n---\n');
  console.log(`\n=== ${role} (${body.length} chars)`);
  console.log(body.slice(0, maxChars));
}
