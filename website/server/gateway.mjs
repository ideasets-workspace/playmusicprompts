/* gateway.mjs — the PlayMusicPrompts edge gateway: CloudFront → (this process, public port) → application on loopback.
 *
 * WHY IT EXISTS. The application (server/main.mjs) binds 127.0.0.1 only and, in production, `security.ipKey`
 * refuses any API request whose socket is not loopback or whose `X-PMP-Proxy-Secret` does not match, and it
 * derives every rate-limit and admission key from `X-PMP-Client-IP`. Someone therefore has to (1) prove that a
 * request came through the CDN, (2) determine the real viewer address from CDN-provided evidence, (3) stamp the
 * two contract headers, and (4) stream the request and response through without buffering audio. That someone
 * is this module. It is Node rather than nginx by the owner's order of 2026-09-01 ("nginx istemiyorum").
 *
 * WHAT IT DOES, per request:
 *   1. `OriginVerifier`   — `X-Origin-Verify` must equal the private value CloudFront is configured to send
 *                           (timing-safe compare). Anything else is answered 403 and the connection is closed:
 *                           a direct hit on the public IP never reaches the application.
 *   2. `ClientAddressResolver` — the viewer IP comes from `CloudFront-Viewer-Address` ("ip:port", added by the
 *                           origin request policy) or, failing that, from the LAST element of `X-Forwarded-For`,
 *                           which CloudFront appends itself; viewer-supplied earlier elements are never trusted.
 *                           No valid address → 400.
 *   3. `Gateway.forward`  — copies the request to 127.0.0.1:<app port> with the hop-by-hop and contract headers
 *                           removed, `X-PMP-Proxy-Secret` / `X-PMP-Client-IP` set by the gateway alone, and the
 *                           viewer `Host` preserved (the application enforces Host === its public origin). Bodies
 *                           are piped both ways; Range/206 audio streaming passes through untouched.
 *   4. Failures are honest: upstream refused → 502, upstream idle timeout → 504, client abort → upstream destroyed.
 *
 * WHAT IT DOES NOT DO: no TLS (CloudFront terminates it), no caching, no rewriting of bodies, no logging of
 * viewer addresses (one JSON line per request with method, path, status and duration only).
 *
 * Callers: server/gateway-main.mjs (the systemd entry) and test/gateway.test.mjs. Constants: gateway-constants.mjs.
 */
import http from 'node:http';
import {timingSafeEqual} from 'node:crypto';
import {isIP} from 'node:net';
import {
  CLIENT_IP_HEADER, FORWARDED_FOR_HEADER, GATEWAY_DEFAULT_BIND, GATEWAY_DEFAULT_PORT, GATEWAY_ENV, GATEWAY_HEALTH_PATH,
  GATEWAY_PROBLEMS, GATEWAY_TIMEOUTS_MS, LOOPBACK_ADDRESSES, ORIGIN_VERIFY_HEADER, PROXY_SECRET_HEADER, SECRET_MIN_LENGTH,
  STRIPPED_REQUEST_HEADERS, STRIPPED_RESPONSE_HEADERS, UPSTREAM_DEFAULT_PORT, UPSTREAM_HOST, UPSTREAM_MAX_SOCKETS, VIEWER_ADDRESS_HEADER,
} from './gateway-constants.mjs';

/** Reads and validates the gateway's configuration from the environment; refuses to start on any unsafe value. */
export function loadGatewayConfig(env = process.env) {
  const port = integer(env[GATEWAY_ENV.port], GATEWAY_DEFAULT_PORT, 'gateway port');
  const upstreamPort = integer(env[GATEWAY_ENV.upstreamPort], UPSTREAM_DEFAULT_PORT, 'upstream port');
  const bind = env[GATEWAY_ENV.bind] || GATEWAY_DEFAULT_BIND;
  const originVerifySecret = secret(env[GATEWAY_ENV.originVerifySecret], GATEWAY_ENV.originVerifySecret);
  const proxySecret = secret(env[GATEWAY_ENV.proxySecret], GATEWAY_ENV.proxySecret);
  if (port === upstreamPort) throw new Error('The gateway and the application cannot share a port');
  return Object.freeze({port, bind, upstreamHost: UPSTREAM_HOST, upstreamPort, originVerifySecret, proxySecret});
}
function integer(raw, fallback, label) {
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 65535) throw new Error(`Invalid ${label}: ${raw}`);
  return n;
}
function secret(value, name) {
  if (typeof value !== 'string' || value.length < SECRET_MIN_LENGTH) throw new Error(`${name} must be set and at least ${SECRET_MIN_LENGTH} characters`);
  return value;
}

/** Constant-time equality of two header-sized strings; false for anything that is not a string. */
export function equalSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Step 1 — is this request from our CloudFront distribution? */
export class OriginVerifier {
  constructor(secretValue) { this.secret = secretValue; }
  verify(headers) {
    const presented = headers[ORIGIN_VERIFY_HEADER];
    return typeof presented === 'string' && equalSecret(presented, this.secret);
  }
}

/** Step 2 — the viewer's IP address from CDN evidence only. Returns an IP string or null. */
export class ClientAddressResolver {
  /**
   * `CloudFront-Viewer-Address` is "ip:port". IPv4 has one colon; IPv6 has many, so the port is whatever follows the
   * LAST colon and the address is everything before it (CloudFront does not bracket IPv6 here). If that yields a
   * valid IP it wins; otherwise the LAST `X-Forwarded-For` element (appended by CloudFront) is used.
   */
  resolve(headers) {
    const viewer = ClientAddressResolver.fromViewerAddress(headers[VIEWER_ADDRESS_HEADER]);
    if (viewer) return viewer;
    return ClientAddressResolver.fromForwardedFor(headers[FORWARDED_FOR_HEADER]);
  }
  static fromViewerAddress(value) {
    if (typeof value !== 'string' || value.length > 64) return null;
    const cut = value.lastIndexOf(':');
    const address = cut > 0 ? value.slice(0, cut) : value;
    return isIP(address) ? address : null;
  }
  static fromForwardedFor(value) {
    if (typeof value !== 'string' || value.length > 512) return null;
    const parts = value.split(',').map(p => p.trim()).filter(Boolean);
    const last = parts.at(-1);
    return last && isIP(last) ? last : null;
  }
}

/** Steps 3–4, plus the server itself. */
export class Gateway {
  /** @param {ReturnType<typeof loadGatewayConfig>} config @param {{log?: (line: object) => void}} [options] */
  constructor(config, {log = line => console.log(JSON.stringify(line))} = {}) {
    this.config = config; this.log = log;
    this.verifier = new OriginVerifier(config.originVerifySecret);
    this.resolver = new ClientAddressResolver();
    this.agent = new http.Agent({keepAlive: true, maxSockets: UPSTREAM_MAX_SOCKETS, timeout: GATEWAY_TIMEOUTS_MS.upstreamIdle});
    this.server = http.createServer({requestTimeout: 0, headersTimeout: GATEWAY_TIMEOUTS_MS.headers}, (req, res) => this.handle(req, res));
    this.server.keepAliveTimeout = GATEWAY_TIMEOUTS_MS.keepAlive;
    this.server.on('clientError', (error, socket) => { if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n'); });
  }

  /** Writes a JSON problem the way server/store.mjs `problem()` errors reach clients, so the front end can parse it. */
  static problem(res, {status, code, message}) {
    const body = JSON.stringify({error: {code, message}});
    res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body), 'Cache-Control': 'no-store', Connection: 'close'});
    res.end(body);
  }

  handle(req, res) {
    const started = process.hrtime.bigint();
    const finish = status => this.log({event: 'gateway', method: req.method, path: (req.url || '').split('?')[0].slice(0, 200), status, ms: Number(process.hrtime.bigint() - started) / 1e6});
    res.on('finish', () => finish(res.statusCode));
    if (req.url === GATEWAY_HEALTH_PATH && LOOPBACK_ADDRESSES.includes(req.socket.remoteAddress)) {
      const body = JSON.stringify({ok: true, gateway: 'PlayMusicPrompts', upstream: `${this.config.upstreamHost}:${this.config.upstreamPort}`});
      res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body), 'Cache-Control': 'no-store'});
      res.end(body); return;
    }
    if (!this.verifier.verify(req.headers)) { req.resume(); Gateway.problem(res, GATEWAY_PROBLEMS.forbidden); return; }
    const clientIp = this.resolver.resolve(req.headers);
    if (!clientIp) { req.resume(); Gateway.problem(res, GATEWAY_PROBLEMS.badAddress); return; }
    this.forward(req, res, clientIp);
  }

  /** Builds the upstream header set: everything the viewer sent minus stripped names, plus the two contract headers. */
  upstreamHeaders(req, clientIp) {
    const headers = {};
    for (const [name, value] of Object.entries(req.headers)) if (!STRIPPED_REQUEST_HEADERS.includes(name)) headers[name] = value;
    headers[PROXY_SECRET_HEADER] = this.config.proxySecret;
    headers[CLIENT_IP_HEADER] = clientIp;
    headers.connection = 'keep-alive';
    return headers;
  }

  forward(req, res, clientIp) {
    const upstream = http.request({
      host: this.config.upstreamHost, port: this.config.upstreamPort, method: req.method, path: req.url,
      headers: this.upstreamHeaders(req, clientIp), agent: this.agent, timeout: GATEWAY_TIMEOUTS_MS.upstreamConnect,
    });
    let answered = false;
    upstream.on('timeout', () => { // fires for connect-phase inactivity before a response exists (agent timeout covers idle later)
      if (!answered) { answered = true; upstream.destroy(); Gateway.problem(res, GATEWAY_PROBLEMS.upstreamTimeout); }
    });
    upstream.on('error', error => {
      if (answered) { res.destroy(); return; }
      answered = true;
      this.log({event: 'gateway_upstream_error', code: error.code || 'UPSTREAM_ERROR'});
      Gateway.problem(res, error.code === 'ETIMEDOUT' ? GATEWAY_PROBLEMS.upstreamTimeout : GATEWAY_PROBLEMS.upstreamDown);
    });
    upstream.on('response', response => {
      answered = true;
      const headers = {};
      for (const [name, value] of Object.entries(response.headers)) if (!STRIPPED_RESPONSE_HEADERS.includes(name)) headers[name] = value;
      res.writeHead(response.statusCode, response.statusMessage, headers);
      response.on('error', () => res.destroy());
      response.pipe(res);
    });
    // The viewer left: stop reading from the application so a long audio stream does not run to completion for nobody.
    res.on('close', () => { if (!res.writableFinished) upstream.destroy(); });
    req.on('error', () => upstream.destroy());
    req.pipe(upstream);
  }

  listen() {
    return new Promise((resolve, reject) => {
      this.server.once('error', reject);
      this.server.listen(this.config.port, this.config.bind, () => { this.server.off('error', reject); resolve(this.server.address()); });
    });
  }
  close() {
    this.agent.destroy();
    return new Promise(resolve => { this.server.closeIdleConnections?.(); this.server.close(() => resolve()); });
  }
}
