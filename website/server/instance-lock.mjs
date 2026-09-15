import { createServer } from 'node:net';
import { createHash } from 'node:crypto';
import { realpath, stat } from 'node:fs/promises';

export class InstanceLockError extends Error {
  constructor(code, port) {
    super(code === 'INSTANCE_ALREADY_RUNNING'
      ? 'The application state is already guarded by another process, or its guard port is occupied. Stop the existing application before restarting; no lock was removed.'
      : 'The application could not acquire its exclusive state guard.');
    this.name = 'InstanceLockError'; this.code = code;
    if (port !== undefined) this.port = port;
  }
}

/** One application per canonical state directory, on one host/network namespace.
 * An exclusive OS socket is released by the kernel even on forced termination.
 * No PID-file deletion, PID-reuse assumption or stale-file race is involved.
 * A hash collision with another guard/service fails closed; never try another
 * port, since a per-process fallback would permit duplicate database recovery.
 * Containers with different network namespaces need a distributed lease.
 */
export async function acquireInstanceLock(stateRoot) {
  let canonical;
  try {
    canonical = await realpath(stateRoot);
    if (!(await stat(canonical)).isDirectory()) throw new Error();
  } catch { throw new InstanceLockError('INSTANCE_LOCK_UNAVAILABLE'); }
  if (process.platform === 'win32') canonical = canonical.toLowerCase();
  const digest = createHash('sha256').update('pmp-state-guard-v1\0').update(canonical).digest();
  // Outside the application ports and the usual Windows/Linux ephemeral ranges.
  const port = 20000 + digest.readUInt32BE(0) % 10000;
  const server = createServer(socket => socket.destroy());
  server.maxConnections = 1;
  await new Promise((accept, reject) => {
    const failed = error => {
      server.removeListener('listening', listening);
      reject(new InstanceLockError(error.code === 'EADDRINUSE' ? 'INSTANCE_ALREADY_RUNNING' : 'INSTANCE_LOCK_UNAVAILABLE', port));
    };
    const listening = () => { server.removeListener('error', failed); accept(); };
    server.once('error', failed); server.once('listening', listening);
    server.listen({ host: '127.0.0.1', port, exclusive: true, backlog: 1 });
  });
  server.unref();
  let releasePromise;
  const release = () => releasePromise ??= new Promise((accept, reject) => {
    server.close(error => error ? reject(new InstanceLockError('INSTANCE_LOCK_UNAVAILABLE', port)) : accept());
  });
  // Only this closure owns the actual server handle; callers cannot close a
  // different process's guard or reclaim an occupied port.
  return Object.freeze({ port, release });
}
