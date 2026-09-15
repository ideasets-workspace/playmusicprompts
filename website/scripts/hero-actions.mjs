/* One-shot markup edit for public/index.html (owner order 2026-09-15 10:59, approved 11:10 "başla"):
 * the first screen of Create gets TWO large primary actions side by side directly under the prompt box —
 * "Create & Play" and "Play something for me" — and, under the second one, the "And keep it going" Yes / No
 * choice. The old small "Play something for me" text link at the bottom of the form is removed (it would
 * duplicate the new button). Nothing else in the form changes.
 *
 * Behaviour wiring lives elsewhere: `#create-button` keeps its id (experience.js drives it), `random` is the
 * existing player action, and `keep-going` is added to player.js and synchronised from the server-side
 * listening session in listening-client.js — the Yes/No buttons never hold a state of their own.
 *
 * Safety: every anchor must occur exactly once and the new markup must not already exist, or nothing is
 * written. UTF-8 without BOM preserved (measured bom=false on 2026-09-15).
 * Run once from the website directory: node scripts/hero-actions.mjs
 */
import {readFileSync, writeFileSync} from 'node:fs';

const path = 'public/index.html';
const before = readFileSync(path, 'utf8');
const count = needle => before.split(needle).length - 1;

const sparkIcon = '<svg class="icon " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/></svg>';
const oldActionsStart = '<div class="creation-actions"><button class="primary" type="submit" id="create-button">' + sparkIcon + 'Create &amp; Play</button><button class="text-button" type="button" data-action="controls">';
const oldActionsEnd = 'All controls</button></div>';
const startIndex = before.indexOf(oldActionsStart);
const endIndex = before.indexOf(oldActionsEnd, startIndex);
if (startIndex < 0 || endIndex < 0) throw new Error('creation-actions block not found');
const oldActions = before.slice(startIndex, endIndex + oldActionsEnd.length);
const controlsIcon = oldActions.slice(oldActionsStart.length, oldActions.length - oldActionsEnd.length); // the sliders <svg> used by "All controls"

const listenLinkStart = '<button type="button" class="listen-link" data-action="random">';
const listenLinkEnd = 'Play something for me</button>';
const linkStart = before.indexOf(listenLinkStart);
const linkEnd = before.indexOf(listenLinkEnd, linkStart);
if (linkStart < 0 || linkEnd < 0) throw new Error('listen-link block not found');
const oldListenLink = before.slice(linkStart, linkEnd + listenLinkEnd.length);
const playIcon = oldListenLink.slice(listenLinkStart.length, oldListenLink.length - listenLinkEnd.length); // the play <svg> of the old link

if (count(oldActions) !== 1 || count(oldListenLink) !== 1) throw new Error(`anchors not unique: actions=${count(oldActions)} link=${count(oldListenLink)}`);
if (count('hero-actions') !== 0 || count('data-action="keep-going"') !== 0) throw new Error('hero markup already present');

const heroActions =
  '<div class="creation-actions hero-actions">' +
    '<div class="hero-action hero-action-create">' +
      '<button class="primary hero-button" type="submit" id="create-button">' + sparkIcon + 'Create &amp; Play</button>' +
      '<button class="text-button hero-secondary" type="button" data-action="controls">' + controlsIcon + 'All controls</button>' +
    '</div>' +
    '<div class="hero-action hero-action-listen">' +
      '<button class="hero-button hero-button-listen" type="button" data-action="random">' + playIcon + 'Play something for me</button>' +
      '<div class="keep-going" role="group" aria-labelledby="keep-going-label">' +
        '<span id="keep-going-label" class="keep-going-label">And keep it going</span>' +
        '<div class="keep-going-choice">' +
          '<button type="button" class="keep-going-option" data-action="keep-going" data-value="yes" aria-pressed="false">Yes</button>' +
          '<button type="button" class="keep-going-option" data-action="keep-going" data-value="no" aria-pressed="true">No</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';

let after = before.replace(oldActions, heroActions).replace(oldListenLink, '');
writeFileSync(path, after);
console.log(JSON.stringify({bytesBefore: Buffer.byteLength(before, 'utf8'), bytesAfter: Buffer.byteLength(after, 'utf8'), heroActions: after.split('hero-actions').length - 1, keepGoingButtons: after.split('data-action="keep-going"').length - 1, listenLinkLeft: after.split('listen-link').length - 1, createButton: after.split('id="create-button"').length - 1}));
