/* One-shot layout edit for public/index.html (owner order 2026-09-15 10:10, "generate butonunu prompt
 * alanının altına al"): relocates the `.creation-actions` row ("Create & Play" + "All controls") and its
 * `#creation-status` line from below the Energy slider to directly under the prompt box (`.prompt-wrap`).
 *
 * Safety: both the moved block and the insertion anchor must occur exactly once, or nothing is written.
 * The file is rewritten byte-for-byte except for the relocation (UTF-8, BOM preserved if present).
 * Run once from the website directory: node scripts/move-create-button.mjs
 */
import {readFileSync, writeFileSync} from 'node:fs';

const path = 'public/index.html';
const original = readFileSync(path);
const hasBom = original[0] === 0xEF && original[1] === 0xBB && original[2] === 0xBF;
let html = original.toString('utf8');

const blockStart = '<div class="creation-actions">';
const statusTag = '<p class="form-status" id="creation-status" role="status" hidden></p>';
const anchor = '</div></div><div class="quick-controls">';

const start = html.indexOf(blockStart);
const end = html.indexOf(statusTag) + statusTag.length;
if (start < 0 || end < statusTag.length || end <= start) throw new Error('Block boundaries not found');
const block = html.substring(start, end);
const count = needle => html.split(needle).length - 1;
if (count(block) !== 1 || count(anchor) !== 1) throw new Error(`Anchors not unique: block=${count(block)} anchor=${count(anchor)}`);
if (html.indexOf(anchor) > start) throw new Error('Anchor is not above the block; layout assumption broken');

html = html.replace(block, '');
html = html.replace(anchor, '</div></div>' + block + '<div class="quick-controls">');
writeFileSync(path, html);
console.log(JSON.stringify({bom: hasBom, bytesBefore: original.length, bytesAfter: Buffer.byteLength(html, 'utf8'), blockLength: block.length}));
