/* test/gateway.test.mjs — behaviour of the edge gateway (server/gateway.mjs) against a real upstream HTTP server.
 *
 * The upstream is a tiny echo server on an ephemeral loopback port that reports the headers it received and can
 * answer Range requests with 206, so each test proves the contract the application relies on:
 * origin secret enforced, viewer address resolved from CDN evidence only, contract headers set by the gateway
 * alone (client-supplied copies stripped), bodies streamed both ways, honest 502/504/400 on failure.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {ClientAddressResolver, Gateway, loadGatewayConfig} from '../server/gateway.mjs';
import {GATEWAY_HEALTH_PATH, GATEWAY_TIMEOUTS_MS} from '../server/gateway-constants.mjs';

const ORIGIN_SECRET = 'origin-verify-fixture-secret-0123456789abcdef';
const PROXY_SECRET = 'proxy-secret-fixture-value-0123456789abcdef';

async function upstreamFixture(t) {
  const received = [];
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8');
      received.push({method: req.method, url: req.url, headers: req.headers, body});
      if (req.url.startsWith('/audio')) { // Range → 206 like server/http.mjs serveAudio
        const payload = Buffer.from('0123456789');
        const m = /bytes=(\d+)-(\d+)/.exec(req.headers.range || '');
        if (m) { const s = Number(m[1]), e = Number(m[2]); res.writeHead(206, {'Content-Type': 'audio/mpeg', 'Content-Range': `bytes ${s}-${e}/10`, 'Accept-Ranges': 'bytes', 'Content-Length': e - s + 1}); res.end(payload.subarray(s, e + 1)); return; }
        res.writeHead(200, {'Content-Type': 'audio/mpeg', 'Content-Length': 10}); res.end(payload); return;
      }
      if (req.url === '/slow') { setTimeout(() => { res.writeHead(200); res.end('late'); }, GATEWAY_TIMEOUTS_MS.upstreamConnect + 500); return; }
      res.writeHead(200, {'Content-Type': 'application/json', 'X-Upstream': 'yes', Connection: 'keep-alive'});
      res.end(JSON.stringify({ok: true, echo: body}));
    });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  t.after(() => new Promise(r => server.close(r)));
  return {server, port: server.address().port, received};
}

async function gatewayFixture(t, upstreamPort, extraEnv = {}) {
  const logs = [];
  // loadGatewayConfig accepts ports 1..65535 only; the tests need an ephemeral port, so the validated config is
  // built with the default and the port alone is overridden to 0 for the listener.
  const config = loadGatewayConfig({PMP_GATEWAY_BIND: '127.0.0.1', PMP_PORT: String(upstreamPort), PMP_ORIGIN_VERIFY_SECRET: ORIGIN_SECRET, PMP_PROXY_SECRET: PROXY_SECRET, ...extraEnv});
  const gateway = new Gateway({...config, port: 0}, {log: line => logs.push(line)});
  const address = await gateway.listen();
  t.after(() => gateway.close());
  const base = `http://127.0.0.1:${address.port}`;
  // node:http rather than fetch: fetch silently drops a caller-set Host header (forbidden header name), and the
  // Host-preservation contract is exactly what the tests must prove.
  const call = (path, {method = 'GET', headers = {}, body} = {}) => new Promise((resolve, reject) => {
    const req = http.request(`${base}${path}`, {method, headers}, res => {
      const chunks = []; res.on('data', c => chunks.push(c));
      res.on('end', () => { const text = Buffer.concat(chunks).toString('utf8'); resolve({status: res.statusCode, headers: {get: n => res.headers[n.toLowerCase()] ?? null}, text: async () => text, json: async () => JSON.parse(text)}); });
    });
    req.on('error', reject); if (body) req.write(body); req.end();
  });
  return {gateway, base, call, logs};
}

const cdn = extra => ({'x-origin-verify': ORIGIN_SECRET, 'cloudfront-viewer-address': '198.51.100.10:46532', host: 'www.playmusicprompts.com', ...extra});

test('gateway config: secrets mandatory and ≥32 chars, ports validated, shared port refused', () => {
  assert.throws(() => loadGatewayConfig({PMP_PROXY_SECRET: PROXY_SECRET}), /PMP_ORIGIN_VERIFY_SECRET/);
  assert.throws(() => loadGatewayConfig({PMP_ORIGIN_VERIFY_SECRET: 'short', PMP_PROXY_SECRET: PROXY_SECRET}), /at least 32/);
  assert.throws(() => loadGatewayConfig({PMP_ORIGIN_VERIFY_SECRET: ORIGIN_SECRET, PMP_PROXY_SECRET: PROXY_SECRET, PMP_GATEWAY_PORT: '70000'}), /Invalid gateway port/);
  assert.throws(() => loadGatewayConfig({PMP_ORIGIN_VERIFY_SECRET: ORIGIN_SECRET, PMP_PROXY_SECRET: PROXY_SECRET, PMP_GATEWAY_PORT: '4177'}), /share a port/);
  const c = loadGatewayConfig({PMP_ORIGIN_VERIFY_SECRET: ORIGIN_SECRET, PMP_PROXY_SECRET: PROXY_SECRET});
  assert.equal(c.port, 8080); assert.equal(c.upstreamPort, 4177); assert.equal(c.upstreamHost, '127.0.0.1'); assert.equal(c.bind, '0.0.0.0');
});

test('viewer address: CloudFront-Viewer-Address (v4 and v6 with port) wins; X-Forwarded-For LAST element is the fallback; garbage → null', () => {
  const r = new ClientAddressResolver();
  assert.equal(r.resolve({'cloudfront-viewer-address': '198.51.100.10:46532'}), '198.51.100.10');
  assert.equal(r.resolve({'cloudfront-viewer-address': '2001:db8::1:46532'}), '2001:db8::1');
  assert.equal(r.resolve({'x-forwarded-for': '10.0.0.1, 203.0.113.9'}), '203.0.113.9', 'viewer-supplied first element ignored');
  assert.equal(r.resolve({'cloudfront-viewer-address': 'nonsense', 'x-forwarded-for': '203.0.113.9'}), '203.0.113.9');
  assert.equal(r.resolve({'x-forwarded-for': 'evil, also-evil'}), null);
  assert.equal(r.resolve({}), null);
});

test('gateway: missing or wrong X-Origin-Verify → 403 JSON problem and nothing reaches the application', async t => {
  const up = await upstreamFixture(t); const g = await gatewayFixture(t, up.port);
  for (const headers of [{}, {'x-origin-verify': 'wrong'}, {'x-origin-verify': ORIGIN_SECRET.slice(0, -1)}]) {
    const r = await g.call('/api/session', {headers}); assert.equal(r.status, 403);
    const body = await r.json(); assert.equal(body.error.code, 'ORIGIN_UNVERIFIED');
  }
  assert.equal(up.received.length, 0);
});

test('gateway: verified request is forwarded with X-PMP-Proxy-Secret + X-PMP-Client-IP set by the gateway, client copies and CDN secret stripped, Host preserved', async t => {
  const up = await upstreamFixture(t); const g = await gatewayFixture(t, up.port);
  const r = await g.call('/api/session?x=1', {headers: cdn({'x-pmp-proxy-secret': 'forged', 'x-pmp-client-ip': '1.1.1.1', 'x-custom': 'kept'})});
  assert.equal(r.status, 200); assert.equal(r.headers.get('x-upstream'), 'yes');
  assert.equal(up.received.length, 1);
  const seen = up.received[0];
  assert.equal(seen.url, '/api/session?x=1');
  assert.equal(seen.headers['x-pmp-proxy-secret'], PROXY_SECRET, 'gateway value, not the forged one');
  assert.equal(seen.headers['x-pmp-client-ip'], '198.51.100.10', 'from CloudFront-Viewer-Address, not the forged header');
  assert.equal(seen.headers['x-origin-verify'], undefined, 'CDN secret never forwarded');
  assert.equal(seen.headers.host, 'www.playmusicprompts.com'); assert.equal(seen.headers['x-custom'], 'kept');
  assert.ok(g.logs.some(l => l.event === 'gateway' && l.path === '/api/session' && l.status === 200 && typeof l.ms === 'number'), 'one log line without the viewer address');
  assert.ok(!JSON.stringify(g.logs).includes('198.51.100.10'), 'viewer address is not logged');
});

test('gateway: verified request without any CDN address evidence → 400 INVALID_CLIENT_ADDRESS', async t => {
  const up = await upstreamFixture(t); const g = await gatewayFixture(t, up.port);
  const r = await g.call('/api/session', {headers: {'x-origin-verify': ORIGIN_SECRET}});
  assert.equal(r.status, 400); assert.equal((await r.json()).error.code, 'INVALID_CLIENT_ADDRESS'); assert.equal(up.received.length, 0);
});

test('gateway: POST bodies stream through unchanged and Range audio requests come back as 206 with the exact bytes', async t => {
  const up = await upstreamFixture(t); const g = await gatewayFixture(t, up.port);
  const body = JSON.stringify({prompt: 'a quiet violin', n: 3});
  const r = await g.call('/api/jobs', {method: 'POST', headers: cdn({'content-type': 'application/json'}), body});
  assert.equal(r.status, 200); assert.equal((await r.json()).echo, body); assert.equal(up.received.at(-1).body, body);
  const audio = await g.call('/audio/x', {headers: cdn({range: 'bytes=2-5'})});
  assert.equal(audio.status, 206); assert.equal(audio.headers.get('content-range'), 'bytes 2-5/10'); assert.equal(await audio.text(), '2345');
});

test('gateway: application down → 502 UPSTREAM_UNAVAILABLE; loopback health answers without the CDN secret', async t => {
  const up = await upstreamFixture(t); const g = await gatewayFixture(t, up.port);
  await new Promise(r => up.server.close(r));
  const r = await g.call('/api/session', {headers: cdn()}); assert.equal(r.status, 502); assert.equal((await r.json()).error.code, 'UPSTREAM_UNAVAILABLE');
  const h = await g.call(GATEWAY_HEALTH_PATH); assert.equal(h.status, 200); assert.equal((await h.json()).gateway, 'PlayMusicPrompts');
});
