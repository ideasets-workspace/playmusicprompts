/* One-shot markup edit for the five shell pages (owner order 2026-09-15 10:16: "open 3D diyip sayfaya da
 * navigate ettir ve o player a geçir kullanıcıyı"). For each of index/explore/radio/library/login.html:
 *   1. adds an `i-cube` symbol to the inline icon sprite (after `i-globe`), so both the bottom bar and the
 *      expanded player dialog can render the same 3D glyph through the existing `icon()` helper;
 *   2. inserts an "Open 3D" button into the persistent bottom player bar (`.player-extra`), right after the
 *      "Up next" queue button. Its behaviour lives in public/connected.js (`open-3d` action), which carries the
 *      current song into the beyond-edition listening room through the server navigation handle
 *      (`APP.enterRoom`), never by URL parameters.
 *
 * Safety: every anchor must occur exactly once per file and the button must not already exist, or the file
 * is left untouched. UTF-8 without BOM is preserved (measured on index.html this session: bom=false).
 * Run once from the website directory: node scripts/add-open-3d-button.mjs
 */
import {readFileSync, writeFileSync} from 'node:fs';

const pages = ['index', 'explore', 'radio', 'library', 'login'];
const globeSymbol = '<symbol id="i-globe" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM2 12h20M12 2a20 20 0 0 0 0 20 20 20 0 0 0 0-20Z"/></symbol>';
const cubeSymbol = '<symbol id="i-cube" viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 9 8-4.5M12 12v9m0-9L4 7.5"/></symbol>';
const queueButton = '<button class="icon-button" data-action="queue" aria-label="Up next"><svg class="icon " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h8m7-2v9m-4-4h8"/></svg></button>';
const openButton = '<button class="icon-button open-3d-button" data-action="open-3d" aria-label="Open this song in the 3D listening room"><svg class="icon " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 9 8-4.5M12 12v9m0-9L4 7.5"/></svg><span>3D</span></button>';

const report = [];
for (const page of pages) {
  const path = `public/${page}.html`;
  const before = readFileSync(path, 'utf8');
  const count = needle => before.split(needle).length - 1;
  if (count(globeSymbol) !== 1 || count(queueButton) !== 1) throw new Error(`${path}: anchors not unique (globe=${count(globeSymbol)} queue=${count(queueButton)})`);
  if (count('data-action="open-3d"') !== 0 || count('id="i-cube"') !== 0) throw new Error(`${path}: already contains the Open 3D markup`);
  const after = before.replace(globeSymbol, globeSymbol + cubeSymbol).replace(queueButton, queueButton + openButton);
  writeFileSync(path, after);
  report.push({page, bytesBefore: Buffer.byteLength(before, 'utf8'), bytesAfter: Buffer.byteLength(after, 'utf8')});
}
console.log(JSON.stringify(report));
