/* gateway-constants.mjs — every fixed value of the PlayMusicPrompts edge gateway (server/gateway.mjs).
 *
 * The gateway is the single process that faces CloudFront on the production host. It exists because the
 * application (server/main.mjs) deliberately listens on loopback only and, in production, refuses any API
 * request that does not carry the private `X-PMP-Proxy-Secret` and a verified `X-PMP-Client-IP` (see
 * server/security.mjs `ipKey`). Nothing here is a tunable guess: each value is either an HTTP-standard name, a
 * CloudFront-documented header, or a limit chosen from a measured constraint that is named in its comment.
 *
 * No nginx: the owner's order of 2026-09-01 ("nginx istemiyorum", recorded in .claude/memory/infra.md) stands, so
 * the gateway is Node, lives in this repository, and is covered by test/gateway.test.mjs like every other module.
 */

/** Environment variable names read by server/gateway-main.mjs. */
export const GATEWAY_ENV = Object.freeze({
  /** Public port the gateway binds (CloudFront's origin port). Cutover plan: 8080 first, 80 after the old app stops. */
  port: 'PMP_GATEWAY_PORT',
  /** Address to bind; default every interface because CloudFront connects from the public internet. */
  bind: 'PMP_GATEWAY_BIND',
  /** Loopback port of the application (server/main.mjs `PORT`). */
  upstreamPort: 'PMP_PORT',
  /** Secret CloudFront sends in the custom origin header `X-Origin-Verify`; the only proof a request came through the CDN. */
  originVerifySecret: 'PMP_ORIGIN_VERIFY_SECRET',
  /** Private shared secret the application requires in `X-PMP-Proxy-Secret` (server/config.mjs `proxySecret`). */
  proxySecret: 'PMP_PROXY_SECRET',
});

export const GATEWAY_DEFAULT_PORT = 8080;
export const GATEWAY_DEFAULT_BIND = '0.0.0.0';
export const UPSTREAM_HOST = '127.0.0.1';
export const UPSTREAM_DEFAULT_PORT = 4177; // the application's own default (server/config.mjs)

/** Minimum length of either secret; matches the application's own rule for PMP_PROXY_SECRET (config.mjs line "length<32"). */
export const SECRET_MIN_LENGTH = 32;

/** Header names, lower-case as Node presents them. */
export const ORIGIN_VERIFY_HEADER = 'x-origin-verify';
export const PROXY_SECRET_HEADER = 'x-pmp-proxy-secret';
export const CLIENT_IP_HEADER = 'x-pmp-client-ip';
/** CloudFront adds this only when the origin request policy includes it (AWS docs "Add CloudFront request headers"): value "ip:port". */
export const VIEWER_ADDRESS_HEADER = 'cloudfront-viewer-address';
/** CloudFront always appends the connecting viewer's address as the LAST element; earlier elements are viewer-supplied and untrusted. */
export const FORWARDED_FOR_HEADER = 'x-forwarded-for';

/**
 * Inbound headers never forwarded to the application: the two contract headers (the gateway alone may set them),
 * the CDN secret (it must not leak into application logs), and the RFC 9110 §7.6.1 hop-by-hop set.
 */
export const STRIPPED_REQUEST_HEADERS = Object.freeze([
  PROXY_SECRET_HEADER, CLIENT_IP_HEADER, ORIGIN_VERIFY_HEADER,
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade',
]);
/** Hop-by-hop response headers that describe the upstream connection, not the resource. */
export const STRIPPED_RESPONSE_HEADERS = Object.freeze(['connection', 'keep-alive', 'transfer-encoding', 'upgrade']);

/** Loopback-only liveness path answered by the gateway itself (systemd / SSM smoke); never reachable through CloudFront's secret check. */
export const GATEWAY_HEALTH_PATH = '/gateway-healthz';
export const LOOPBACK_ADDRESSES = Object.freeze(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

/**
 * Timeouts. CloudFront's origin response timeout is 30 s by default and its origin keep-alive timeout 5 s; the
 * gateway keeps client connections longer than the CDN does so the CDN, never the gateway, decides to close.
 * Audio is streamed with Range requests (server/http.mjs serveAudio), so the response body has no fixed deadline;
 * only idle sockets are cut.
 */
export const GATEWAY_TIMEOUTS_MS = Object.freeze({
  headers: 30_000,       // a client that has not finished its request headers in 30 s is dropped
  keepAlive: 65_000,     // idle keep-alive on the CloudFront side
  upstreamConnect: 5_000, // the application is on loopback; more than 5 s means it is not there
  upstreamIdle: 120_000, // matches the application's own longest synchronous wait (media processTimeoutMs)
});
/** Upstream keep-alive pool: CloudFront fans in from many edges; 256 sockets is far above the 2-vCPU host's useful concurrency. */
export const UPSTREAM_MAX_SOCKETS = 256;

/** Response bodies the gateway writes itself (JSON, same problem shape as the application's `problem()` errors). */
export const GATEWAY_PROBLEMS = Object.freeze({
  forbidden: {status: 403, code: 'ORIGIN_UNVERIFIED', message: 'Requests must arrive through the content delivery network.'},
  badAddress: {status: 400, code: 'INVALID_CLIENT_ADDRESS', message: 'The viewer address could not be determined.'},
  upstreamDown: {status: 502, code: 'UPSTREAM_UNAVAILABLE', message: 'The application is not reachable right now.'},
  upstreamTimeout: {status: 504, code: 'UPSTREAM_TIMEOUT', message: 'The application did not answer in time.'},
});
