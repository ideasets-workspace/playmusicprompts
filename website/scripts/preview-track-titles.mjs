/* Read-only preview of the titles TrackTitleComposer would give the songs already in .state/website.sqlite.
 * Writes nothing. Used to judge the derivation against real creator prompts before wiring it in.
 * Run from the website directory: node scripts/preview-track-titles.mjs
 */
import {DatabaseSync} from 'node:sqlite';
import {TrackTitleComposer} from '../server/track-title.mjs';

const db = new DatabaseSync('.state/website.sqlite', {readOnly: true});
const rows = db.prepare('SELECT t.id, t.job_id, t.public, j.payload FROM tracks t JOIN jobs j ON j.id = t.job_id ORDER BY t.rowid ASC').all();
const seen = new Map();
for (const row of rows) {
  const current = JSON.parse(row.public), payload = JSON.parse(row.payload);
  const {base, source} = TrackTitleComposer.baseTitle(payload);
  const ordinal = (seen.get(base) || 0) + 1; seen.set(base, ordinal);
  console.log(JSON.stringify({old: current.title, new: TrackTitleComposer.titleFor({base, ordinal, takeNumber: current.take, multiple: false}), source, prompt: (payload.prompt || '').split('\n')[0].slice(0, 70)}));
}
