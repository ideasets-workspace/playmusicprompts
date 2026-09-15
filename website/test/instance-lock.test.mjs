import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, symlink, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, basename, sep } from 'node:path';
import { createServer, createConnection } from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { DatabaseSync } from 'node:sqlite';
import { acquireInstanceLock } from '../server/instance-lock.mjs';

async function folder(t) {
  const root = await mkdtemp(join(tmpdir(), 'pmp-instance-review-'));
  t.after(async () => {
    const target = resolve(root), parent = resolve(tmpdir());
    assert.ok(target.startsWith(parent + sep) && basename(target).startsWith('pmp-instance-review-'));
    await rm(target, { recursive: true, force: true });
  });
  return root;
}
const lockModule = new URL('../server/instance-lock.mjs', import.meta.url).href;
const childSource = `
  import { acquireInstanceLock } from ${JSON.stringify(lockModule)};
  try {
    const guard = await acquireInstanceLock(process.argv[1]);
    process.send({ event: 'locked', port: guard.port });
    process.on('message', async message => { if(message === 'release') { await guard.release(); process.exit(0); } });
  } catch(error) { process.send({ event: 'rejected', code: error.code }); process.exitCode = 2; }
`;
function launch(t, root, source = childSource, env) {
  const child = spawn(process.execPath, ['--input-type=module', '-e', source, root], {
    windowsHide: true, stdio: ['ignore', 'pipe', 'pipe', 'ipc'], env: env ?? process.env
  });
  let stderr = ''; child.stderr.on('data', data => { stderr += data; }); child.stdout.resume();
  t.after(async () => { if (child.exitCode === null && child.signalCode === null) { child.kill('SIGKILL'); await once(child, 'exit'); } });
  const outcome = new Promise((accept, reject) => {
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(Error('Lock fixture timed out: ' + stderr)); }, 7000);
    child.once('message', message => { clearTimeout(timer); accept(message); });
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => { clearTimeout(timer); if(code !== 0 && !child.killed) reject(Error('Unexpected fixture exit: ' + stderr)); });
  });
  return { child, outcome };
}

test('state guard rejects a second owner, canonical aliases, and Windows case aliases', async t => {
  const root = await folder(t); const guard = await acquireInstanceLock(root); t.after(() => guard.release());
  await assert.rejects(acquireInstanceLock(join(root, '.')), { code: 'INSTANCE_ALREADY_RUNNING' });
  if (process.platform === 'win32') await assert.rejects(acquireInstanceLock(root.toUpperCase()), { code: 'INSTANCE_ALREADY_RUNNING' });
  const alias = root + '-alias';
  try {
    await symlink(root, alias, process.platform === 'win32' ? 'junction' : 'dir');
    await assert.rejects(acquireInstanceLock(alias), { code: 'INSTANCE_ALREADY_RUNNING' });
  } finally { await rm(alias, { force: true }); }
  await guard.release(); await guard.release();
  const next = await acquireInstanceLock(root); await next.release();
});

test('separate simultaneous processes permit exactly one owner and recover after forced crash', async t => {
  const root = await folder(t);
  const children = [launch(t, root), launch(t, root)];
  const outcomes = await Promise.all(children.map(x => x.outcome));
  assert.equal(outcomes.filter(x => x.event === 'locked').length, 1);
  assert.equal(outcomes.filter(x => x.code === 'INSTANCE_ALREADY_RUNNING').length, 1);
  const owner = children[outcomes.findIndex(x => x.event === 'locked')].child;
  owner.kill('SIGKILL'); await once(owner, 'exit');
  const recovered = await acquireInstanceLock(root); await recovered.release();
});

test('an unrelated service occupying the derived port is never reclaimed', async t => {
  const root = await folder(t); const initial = await acquireInstanceLock(root); const port = initial.port; await initial.release();
  const service = createServer(socket => socket.end('still-owned')); service.listen({ host: '127.0.0.1', port, exclusive: true }); await once(service, 'listening');
  t.after(() => new Promise(resolve => service.close(resolve)));
  await assert.rejects(acquireInstanceLock(root), { code: 'INSTANCE_ALREADY_RUNNING' });
  const socket = createConnection({ host: '127.0.0.1', port }); let data = ''; socket.on('data', chunk => { data += chunk; }); await once(socket, 'end');
  assert.equal(data, 'still-owned');
});

test('main acquires guard before SQLite recovery, and a rejected second startup leaves submitting rows untouched', async t => {
  const root = await folder(t); const guard = await acquireInstanceLock(root); t.after(() => guard.release());
  const file = join(root, 'website.sqlite'); const db = new DatabaseSync(file);
  db.exec("CREATE TABLE jobs (id TEXT PRIMARY KEY, status TEXT); INSERT INTO jobs VALUES ('fixture-in-flight','submitting');"); db.close();
  const main = new URL('../server/main.mjs', import.meta.url).href;
  const before = await readFile(file);
  const child = launch(t, root, `try { await import(${JSON.stringify(main)}); process.send({event:'unexpected-start'}); } catch(error) { process.send({event:'rejected',code:error.code}); process.exitCode=2; }`,
    { ...process.env, NODE_ENV: 'development', PMP_STATE_DIR: root, PORT: '4199', PMP_ORIGIN: 'http://127.0.0.1:4199' });
  assert.deepEqual(await child.outcome, { event: 'rejected', code: 'INSTANCE_ALREADY_RUNNING' });
  assert.deepEqual(await readFile(file), before, 'The rejected startup must not even open/recover SQLite.');
});

test('failed HTTP listen releases the guard and exits without touching another listener', async t => {
  const root = await folder(t); const occupied = createServer(socket => socket.end('original-listener'));
  occupied.listen(0, '127.0.0.1'); await once(occupied, 'listening'); t.after(() => new Promise(resolve => occupied.close(resolve)));
  const port = occupied.address().port;
  const main = new URL('../server/main.mjs', import.meta.url).href;
  // Import actual startup against an empty isolated database. No queued jobs,
  // capability calls, credentials, media downloads or external requests occur.
  const child = spawn(process.execPath, ['--input-type=module', '-e', `await import(${JSON.stringify(main)});`], {
    windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, NODE_ENV: 'development', PMP_STATE_DIR: root, PORT: String(port), PMP_ORIGIN: `http://127.0.0.1:${port}` }
  });
  child.stdout.resume(); child.stderr.resume();
  const timer = setTimeout(() => child.kill('SIGKILL'), 7000); t.after(() => { clearTimeout(timer); if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL'); });
  const [code, signal] = await once(child, 'exit'); clearTimeout(timer);
  assert.equal(signal, null); assert.equal(code, 1);
  const next = await acquireInstanceLock(root); await next.release(); assert.equal(occupied.listening, true);
});

test('actual main graceful shutdown releases its own state guard after its HTTP server closes', async t => {
  const root = await folder(t); const reservation = createServer();
  reservation.listen(0, '127.0.0.1'); await once(reservation, 'listening'); const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const main = new URL('../server/main.mjs', import.meta.url).href;
  const source = `await import(${JSON.stringify(main)});
    process.on('message', message => { if(message==='shutdown')process.emit('SIGTERM'); });
    setTimeout(()=>process.send({event:'started'}),150);`;
  const started = launch(t, root, source, { ...process.env, NODE_ENV: 'development', PMP_STATE_DIR: root, PORT: String(port), PMP_ORIGIN: `http://127.0.0.1:${port}` });
  assert.deepEqual(await started.outcome, { event: 'started' });
  await assert.rejects(acquireInstanceLock(root), { code: 'INSTANCE_ALREADY_RUNNING' });
  const exited = once(started.child, 'exit'); started.child.send('shutdown');
  const [code, signal] = await exited; assert.equal(code, 0); assert.equal(signal, null);
  const next = await acquireInstanceLock(root); await next.release();
});
