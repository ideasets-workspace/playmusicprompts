/**
 * import-legacy-catalogue.mjs — move the public legacy catalogue into the new website THROUGH ITS OWN INGEST PATH.
 *
 * Background (measured 2026-09-15 on i-0c52f530769d1ac88): the old Next.js site kept 23 public tracks (21 jobs) in
 * Postgres; `music_jobs.responseBody` is the music engine's raw completed-job result — the exact object the new
 * site's `media.ingest(jobId, result)` consumes — and `requestBody` is the request that produced it. So no audio
 * is copied by hand and no metadata is invented: this tool inserts each legacy job into the new SQLite store in the
 * `ingesting` state with that stored result, and the running application's own worker (server/jobs.mjs line
 * "if(job.status==='ingesting'&&job.result) await ingest(...)") downloads the masters through the engine's
 * delivery-url endpoint, probes and transcodes them with ffmpeg, derives titles with TrackTitleComposer and
 * publishes the tracks — identically to a freshly created song. Nothing is generated, so nothing is billed.
 *
 * Inputs : a JSON file produced by psql on the host (see 06b-import-legacy.sh) — one row per legacy job with its
 *          public tracks' genres/moods (the old request body carried none).
 * Runs as: the website user, with pmp-website.service STOPPED (single SQLite writer). Idempotent: a job id that
 *          already exists is skipped and reported.
 * Usage  : node import-legacy-catalogue.mjs <legacy.json> <stateDir> [--apply]   (without --apply: dry run)
 */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {Store, stable} from '/opt/pmp-website/server/store.mjs';

const [file, stateDir, ...rest] = process.argv.slice(2);
if (!file || !stateDir) throw new Error('usage: import-legacy-catalogue.mjs <legacy.json> <stateDir> [--apply]');
const apply = rest.includes('--apply');
const LEGACY_OWNER = 'legacy-catalogue'; // never a real session owner: these songs belong to the site, not to a visitor
const rows = JSON.parse(readFileSync(file, 'utf8'));
if (!Array.isArray(rows) || !rows.length) throw new Error('legacy.json holds no rows');

const store = new Store(resolve(stateDir, 'website.sqlite'));
const exists = store.db.prepare('SELECT status FROM jobs WHERE id=?');
const insert = store.db.prepare('INSERT INTO jobs (id,owner,idem,fingerprint,payload,status,result,created,updated) VALUES (?,?,?,?,?,?,?,?,?)');
const report = {mode: apply ? 'apply' : 'dry-run', jobs: rows.length, tracksExpected: 0, inserted: 0, skipped: [], invalid: []};

for (const row of rows) {
  const {job_id: id, request, response, created_at: createdAt, tracks} = row;
  report.tracksExpected += tracks.length;
  if (!response || response.success !== true || !Array.isArray(response.tracks) || !response.tracks.length) { report.invalid.push({id, reason: 'response without delivered tracks'}); continue; }
  if (exists.get(id)) { report.skipped.push({id, reason: 'already present', status: exists.get(id).status}); continue; }
  // The new site's job payload: the original request, plus the taxonomy the catalogue had attached to its tracks.
  const genres = [...new Set(tracks.flatMap(t => t.genres || []))], moods = [...new Set(tracks.flatMap(t => t.moods || []))];
  const payload = {...request, genres, moods, eras: [], output_package: tracks.length > 1 ? 'variations' : 'single'};
  const fingerprint = createHash('sha256').update(stable(payload)).digest('hex');
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created)) { report.invalid.push({id, reason: 'bad created_at'}); continue; }
  if (apply) insert.run(id, LEGACY_OWNER, id, fingerprint, JSON.stringify(payload), 'ingesting', JSON.stringify(response), created, Date.now());
  report.inserted++;
}
store.close();
console.log(JSON.stringify(report, null, 1));
