import {Agent,fetch as transportFetch} from 'undici';

// Server-only client. No generation retry: the upstream has no idempotency key.
const ERROR_MESSAGES = {
  INVALID_REQUEST: 'The music engine refused one or more settings.',
  CONTENT_REFUSED: 'The music request was not accepted by the content check.',
  LANGUAGE_NOT_PROVEN: 'The selected language does not meet the requested verification policy.',
  VENDOR_CONTENT_BLOCKED: 'The music provider declined this request.',
  RATE_LIMITED: 'The music service request limit has been reached.',
  BUDGET_EXHAUSTED: 'Music generation is temporarily unavailable.',
  GENERATION_FAILED: 'The music generation did not finish successfully.',
  MEASUREMENT_FAILED: 'The music service could not verify this delivery.',
  RENDER_FAILED: 'The generated music could not be prepared for delivery.',
  INTERNAL_ERROR: 'The music service encountered an error.',
  CONFIG_ERROR: 'The music service connection needs attention.',
  UNAUTHENTICATED: 'The music service connection needs attention.',
  FORBIDDEN_SCOPE: 'The music service connection needs attention.'
};

export class EngineError extends Error {
  constructor(code, message, { status = 502, upstreamStatus, upstreamBody, uncertain = false } = {}) {
    super(message); this.name = 'EngineError'; this.code = code; this.status = status; this.uncertain = uncertain;
    if (upstreamStatus !== undefined) this.upstreamStatus = upstreamStatus;
    // Explicit access for parent persistence; accidental JSON/log serialization stays safe.
    Object.defineProperty(this, 'upstreamBody', { value: upstreamBody, enumerable: false });
  }
  toJSON() { return { code: this.code, message: this.message, status: this.status, uncertain: this.uncertain }; }
}

function localError(message) { return new EngineError('INVALID_REQUEST', message, { status: 400 }); }

// docs/api/09-limits-and-timeouts.md recommendations. Unspecified long sync
// variation combinations use the engine's documented request ceiling, not an
// invented latency promise; explicit async:false remains explicit.
export function requestTimeout(path,payload){
  if(path==='/health'||path.startsWith('/v1/music/originality/')||path.startsWith('/v1/music/jobs/'))return 15000;
  if(path==='/v1/music/capabilities'||path==='/v1/music/delivery-url')return 30000;
  if(payload?.dry_run===true||payload?.capabilities===true||payload?.async===true)return 360000;
  const sung=payload?.vocal?.mode&&payload.vocal.mode!=='instrumental';
  if(payload?.output_package==='variations')return !sung&&payload.variation_count===3?500000:3600000;
  return sung?320000:180000;
}
export function createEngine({ baseUrl, credentials, fetchImpl = transportFetch, timeoutMs, maxResponseBytes = 8 * 1024 * 1024 } = {}) {
  let base;
  try { base = new URL(baseUrl); } catch { throw new EngineError('CONFIG_ERROR', ERROR_MESSAGES.CONFIG_ERROR, { status: 503 }); }
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || !['', '/'].includes(base.pathname)
      || typeof credentials !== 'function' || typeof fetchImpl !== 'function'
      || (timeoutMs!==undefined&&(!Number.isFinite(timeoutMs)||timeoutMs<1)) || !Number.isSafeInteger(maxResponseBytes) || maxResponseBytes < 1)
    throw new EngineError('CONFIG_ERROR', ERROR_MESSAGES.CONFIG_ERROR, { status: 503 });
  const origin = base.origin;
  let transport,closing=false,closePromise;
  const active=new Set();
  // Use the same pinned Undici version for fetch and its private dispatcher;
  // the runtime's bundled fetch can have an older handler interface. Default
  // parser deadlines
  // are 300s, shorter than valid synchronous music requests. Disable only those
  // secondary deadlines: every request below still has a finite total deadline
  // covering credentials, headers and body. Keep TLS verification and the
  // connect timeout; never replace the process-wide dispatcher.
  // https://nodejs.org/api/globals.html#custom-dispatcher
  // https://github.com/nodejs/undici/blob/v8.10.2/docs/docs/api/Client.md
  const dispatcher=()=>transport??=new Agent({headersTimeout:0,bodyTimeout:0,allowH2:false});
  function close(){
    if(!closePromise){
      closing=true;
      closePromise=(async()=>{await Promise.allSettled([...active]);await transport?.close();})();
    }
    return closePromise;
  }

  async function request(path, payload, generation = false) {
    if(closing)throw new EngineError('ENGINE_CLOSED','The music service connection is shutting down.',{status:503});
    // Freeze the exact wire body before awaiting credentials: later UI/session
    // mutations must not change a request the parent already persisted.
    let body;
    try { body = payload === undefined ? undefined : JSON.stringify(payload); }
    catch { throw localError('Expected a serializable JSON music request.'); }
    const expectsJob = generation && payload?.async === true;
    const controller = new AbortController();
    let finish;const done=new Promise(resolve=>finish=resolve);active.add(done);
    let started = false;
    let timer;
    const work = async () => {
      let auth;
      try { auth = await credentials(); } catch { throw new EngineError('CONFIG_ERROR', ERROR_MESSAGES.CONFIG_ERROR, { status: 503 }); }
      if (!auth || ['identityToken', 'apiKey'].some(key => typeof auth[key] !== 'string' || !auth[key] || /[\r\n]/.test(auth[key])))
        throw new EngineError('CONFIG_ERROR', ERROR_MESSAGES.CONFIG_ERROR, { status: 503 });
      if (controller.signal.aborted) throw new EngineError('ENGINE_TIMEOUT', 'The music service did not respond in time.', { status: 504 });
      started = true;
      const response = await fetchImpl(`${origin}${path}`, { method: body === undefined ? 'GET' : 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${auth.identityToken}`, 'x-api-key': auth.apiKey,
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) }, body, signal: controller.signal, redirect: 'error',dispatcher:dispatcher() });
      const chunks = [];
      let size = 0;
      if (response.body) {
        const reader = response.body.getReader();
        try {
          for (;;) {
            const { done, value } = await reader.read(); if (done) break;
            size += value.byteLength;
            if (size > maxResponseBytes) {
              await reader.cancel();
              throw new EngineError('ENGINE_RESPONSE_INVALID', 'The music service returned an unreadable response.',
                { upstreamStatus: response.status, uncertain: generation });
            }
            chunks.push(Buffer.from(value));
          }
        } finally { reader.releaseLock(); }
      }
      const text = Buffer.concat(chunks).toString('utf8');
      let data;
      try { data = JSON.parse(text); } catch { /* Edge IAM failures can be HTML. */ }
      if (!response.ok || data?.success === false) {
        const code = Object.hasOwn(ERROR_MESSAGES, data?.error_code ?? '') ? data.error_code : 'ENGINE_UPSTREAM_ERROR';
        const upstreamStatus = response.status;
        const status = [400, 404, 422, 429].includes(upstreamStatus) ? upstreamStatus : 502;
        throw new EngineError(code, ERROR_MESSAGES[code] ?? 'The music service could not complete this request.',
          { status, upstreamStatus, upstreamBody: data ?? text,
            uncertain: generation && (upstreamStatus >= 500 || (upstreamStatus < 400 && !data)) });
      }
      if (!data || typeof data !== 'object' || Array.isArray(data))
        throw new EngineError('ENGINE_RESPONSE_INVALID', 'The music service returned an unreadable response.',
          { upstreamStatus: response.status, upstreamBody: data ?? text, uncertain: generation });
      if (expectsJob && (!['queued', 'processing', 'complete'].includes(data.status)
        || typeof data.job_id !== 'string' || !/^[a-zA-Z0-9_-]{1,160}$/.test(data.job_id)))
        throw new EngineError('ENGINE_RESPONSE_INVALID', 'The music service did not return a recoverable job identifier.',
          { upstreamStatus: response.status, upstreamBody: data, uncertain: true });
      return data;
    };
    const timeout = new Promise((_, reject) => { timer = setTimeout(() => {
      controller.abort();
      reject(new EngineError('ENGINE_TIMEOUT', 'The music service did not respond in time.', { status: 504, uncertain: generation && started }));
    }, timeoutMs??requestTimeout(path,payload)); });
    try { return await Promise.race([work(), timeout]); }
    catch (error) {
      if (error instanceof EngineError) throw error;
      throw new EngineError(controller.signal.aborted ? 'ENGINE_TIMEOUT' : 'ENGINE_CONNECTION_ERROR',
        controller.signal.aborted ? 'The music service did not respond in time.' : 'The connection to the music service was interrupted.',
        { status: controller.signal.aborted ? 504 : 502, uncertain: generation && started });
    } finally { clearTimeout(timer);active.delete(done);finish(); }
  }

  return Object.freeze({
    close,
    health: () => request('/health'),
    capabilities: () => request('/v1/music/capabilities'),
    submit(payload) {
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw localError('Expected a music request object.');
      return request('/v1/music', payload, payload.capabilities !== true && payload.dry_run !== true);
    },
    job(id) {
      if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,160}$/.test(id)) throw localError('Invalid music job identifier.');
      return request(`/v1/music/jobs/${encodeURIComponent(id)}`);
    },
    originality(id) {
      if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,160}$/.test(id)) throw localError('Invalid originality request identifier.');
      return request(`/v1/music/originality/${encodeURIComponent(id)}`);
    },
    delivery(gcsUri) {
      if (typeof gcsUri !== 'string' || gcsUri.length > 4096 || !/^gs:\/\/[a-z0-9][a-z0-9._-]{1,221}[a-z0-9]\/.+/.test(gcsUri)
        || /[\u0000-\u001f\u007f]/.test(gcsUri)) throw localError('Invalid stored music identifier.');
      // The parent must authorize this exact identifier against its persisted delivery.
      return request('/v1/music/delivery-url', { gcs_uri: gcsUri });
    }
  });
}
