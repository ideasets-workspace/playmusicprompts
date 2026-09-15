/**
 * wire-adaptive-css.mjs — one-shot: add <link rel="stylesheet" href="adaptive.css"> as the LAST stylesheet in <head>
 * of every shell page (the adaptive layer must win the cascade). Idempotent: a page that already links it is skipped.
 * Pages: the seven that share the shell (index, explore, radio, library, login, account, player-three).
 * Usage (from website/): node scripts/wire-adaptive-css.mjs
 */
import {readFileSync, writeFileSync} from 'node:fs';
const pages = ['index.html', 'explore.html', 'radio.html', 'library.html', 'login.html', 'account.html', 'player-three.html'];
const tag = '<link rel="stylesheet" href="adaptive.css">';
const report = [];
for (const page of pages) {
  const path = `public/${page}`; const html = readFileSync(path, 'utf8');
  if (html.includes(tag)) { report.push(`${page}: already wired`); continue; }
  const at = html.indexOf('</head>'); if (at < 0) throw new Error(`${page}: no </head>`);
  writeFileSync(path, html.slice(0, at) + tag + html.slice(at));
  report.push(`${page}: wired (${readFileSync(path, 'utf8').split(tag).length - 1} tag)`);
}
console.log(report.join('\n'));
