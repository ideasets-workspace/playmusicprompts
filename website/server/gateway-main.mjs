/* gateway-main.mjs — systemd entry point of the edge gateway (server/gateway.mjs).
 *
 * Reads its configuration from the environment (names in server/gateway-constants.mjs GATEWAY_ENV), refuses to
 * start on a missing or short secret, binds the public port, and exits cleanly on SIGTERM/SIGINT so systemd
 * restarts are graceful. Run in production as `node server/gateway-main.mjs` by pmp-gateway.service; the
 * application itself is a separate unit (pmp-website.service) on loopback.
 */
import {Gateway, loadGatewayConfig} from './gateway.mjs';

const gateway = new Gateway(loadGatewayConfig(process.env));
const address = await gateway.listen();
console.log(JSON.stringify({event: 'gateway_listening', bind: address.address, port: address.port, upstream: `${gateway.config.upstreamHost}:${gateway.config.upstreamPort}`}));

let closing = false;
async function shutdown(signal) {
  if (closing) return; closing = true;
  console.log(JSON.stringify({event: 'gateway_stopping', signal}));
  await gateway.close();
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
