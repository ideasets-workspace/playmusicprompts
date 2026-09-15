/**
 * live-verify.mjs — post-cutover verification of https://www.playmusicprompts.com from outside AWS (deploy 2026-09-15).
 * Pure HTTP evidence: status, byte size, key headers, identity flags, catalogue count, one audio Range request,
 * and the direct-IP probe that must now be refused by the gateway (403) instead of reaching an application.
 * Usage: node deploy-20260915/live-verify.mjs
 */
const base = 'https://www.playmusicprompts.com';
const out = {};
const get = async (path, init = {}) => { const r = await fetch(base + path, {redirect: 'manual', ...init}); return r; };

for (const path of ['/', '/index.html', '/login.html', '/account.html', '/explore.html', '/library.html', '/radio.html', '/healthz', '/robots.txt', '/sitemap.xml']) {
  const r = await get(path); const body = await r.arrayBuffer();
  out[path] = {status: r.status, bytes: body.byteLength, type: r.headers.get('content-type'), via: r.headers.get('via')?.slice(0, 40), cache: r.headers.get('x-cache'), csp: !!r.headers.get('content-security-policy'), hsts: r.headers.get('strict-transport-security')};
}
const session = await (await get('/api/session')).json();
out.identity = session.config.identity; out.generation = session.config.generation;
const catalog = await (await get('/api/catalog')).json();
out.catalog = {count: catalog.tracks.length, first: catalog.tracks[0]?.title, last: catalog.tracks.at(-1)?.title, sample: catalog.tracks.slice(0, 3).map(t => ({title: t.title, genre: t.genre, duration: t.duration, url: t.url}))};
const connection = await (await get('/api/connection')).json(); out.connection = connection;
if (catalog.tracks[0]) {
  const audio = await get(catalog.tracks[0].url, {headers: {Range: 'bytes=0-1023'}}); await audio.arrayBuffer();
  out.audioRange = {status: audio.status, type: audio.headers.get('content-type'), range: audio.headers.get('content-range'), accept: audio.headers.get('accept-ranges')};
}
// Direct-IP probe: with the Host header of the site but no CloudFront secret, the gateway must answer 403.
try { const direct = await fetch('http://83.119.137.232/', {headers: {Host: 'www.playmusicprompts.com'}, redirect: 'manual', signal: AbortSignal.timeout(8000)}); out.directIp = {status: direct.status, body: (await direct.text()).slice(0, 120)}; }
catch (error) { out.directIp = {error: String(error).slice(0, 120)}; }
// Apex and bare-CloudFront behaviour are recorded, not judged (owner-side DNS).
try { const apex = await fetch('https://playmusicprompts.com/', {redirect: 'manual', signal: AbortSignal.timeout(8000)}); out.apex = {status: apex.status, location: apex.headers.get('location')}; } catch (error) { out.apex = {error: String(error).slice(0, 120)}; }
console.log(JSON.stringify(out, null, 1));
