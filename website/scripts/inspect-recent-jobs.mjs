/* Read-only inspection: which generation jobs, listening sessions and admission counters were created in the
 * last N minutes. Used on 2026-09-15 to establish whether a browser verification run ("Keep it going" = continuous
 * creation) submitted any billed engine request. Writes nothing.
 * Run from the website directory: node scripts/inspect-recent-jobs.mjs [minutes]
 */
import {DatabaseSync} from 'node:sqlite';
const minutes = Number(process.argv[2] || 60);
const db = new DatabaseSync('.state/website.sqlite', {readOnly: true});
const since = Date.now() - minutes * 60000;
const jobs = db.prepare('SELECT id, owner, status, upstream_id, created, updated, substr(payload, 1, 100) AS payload, error FROM jobs WHERE created > ? ORDER BY created').all(since);
console.log(`jobs created in last ${minutes} min: ${jobs.length}`);
for (const j of jobs) console.log(JSON.stringify({id: j.id, status: j.status, upstream: j.upstream_id, created: new Date(j.created).toISOString(), owner: j.owner.slice(0, 14), payload: j.payload, error: j.error ? j.error.slice(0, 120) : null}));
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%listening%'").all().map(r => r.name);
console.log('listening tables:', tables.join(', '));
for (const t of tables) {
  const cols = db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name);
  const timeCol = cols.find(c => /created|updated|started/.test(c));
  if (!timeCol) continue;
  const rows = db.prepare(`SELECT * FROM ${t} WHERE ${timeCol} > ? ORDER BY ${timeCol}`).all(since);
  console.log(`${t}: ${rows.length} rows in window`);
  for (const r of rows.slice(0, 5)) console.log('  ' + JSON.stringify(r).slice(0, 300));
}
const counters = db.prepare("SELECT key, count FROM counters WHERE key LIKE 'generation:%' AND expires > ?").all(Date.now());
console.log('active generation counters:', JSON.stringify(counters.map(c => ({key: c.key.replace(/[A-Za-z0-9_-]{20,}/g, '[id]'), count: c.count}))));
