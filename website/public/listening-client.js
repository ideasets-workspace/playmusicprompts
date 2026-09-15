/* Continuous listening uses the server's durable session and the real player.
 * GET recovery never submits music. Each POST is saved before sending and a
 * lost response is retried only under its original key and exact body.
 */
(() => {
  'use strict';
  function canonicalTrack(track) {
    if (track?.owned !== true || typeof track.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(track.id) ||
      typeof track.title !== 'string' || !track.title.trim() || typeof track.url !== 'string') return null;
    try {
      const url = new URL(track.url, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== `/api/listen/${track.id}` || url.search || url.hash || url.username || url.password) return null;
      return {...track, url: url.pathname};
    } catch { return null; }
  }
  function create(host) {
  const APP = host?.app, audio = host?.audio;
  if (!APP?.request || !audio || ['getCurrent', 'hasNext', 'appendPrepared', 'advance', 'renderStatus'].some(key => typeof host[key] !== 'function')) throw Error('A real player connection is required for continuous listening.');
  const key = 'pmp.listening.tab.v1', copy = value => JSON.parse(JSON.stringify(value));
  const scope = APP.authScope, validScope = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
  const validId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{8,160}$/.test(value);
  const owned = track => !!canonicalTrack(track), terminal = new Set(['ready', 'partial', 'failed', 'uncertain', 'ingest_failed']);
  const bindings = [];
  function listen(target, event, fn) { target.addEventListener(event, fn); bindings.push([target, event, fn]); }
  let saved;
  try { saved = JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { /* A damaged record cannot authorize a session. */ }
  if (!saved || !validId(saved.clientId)) saved = {clientId: crypto.randomUUID(), authScope: scope, sessionId: null, wanted: false, pendingStart: null, events: [], meter: null};
  if (!Array.isArray(saved.events)) saved.events = [];
  let session = null, intent = false, disposed = false, restored = false, blocked = false;
  let error = '', readError = false, playbackError = false, busy = null, reading = null, enabling = null, starting = false, autoNext = false, waiting = false;
  let serverPlaying = false, stalled = false, seeking = false, adWasActive = false, internalPause = false, waitReason = null, changingQueue = 0;
  const consumed = new Set();
  let authChanged = false;
  // A removal may safely run while playback is paused, but a lost receipt
  // still requires an explicit retry. These permits are never persisted.
  const safeDispatch = new Set(), settledEvents = new Map();
  const isStop = event => ['pause', 'disable'].includes(event.type);
  const isSafe = event => event.type === 'dismiss' || event.type === 'ended' && event.playing === false;
  const pendingDismissals = () => new Set(saved.events.filter(event => event.type === 'dismiss').flatMap(event => event.trackIds || []));
  function settleEvent(event, failure = null) {
    settledEvents.set(event.eventId, failure);
    if (settledEvents.size > 128) settledEvents.delete(settledEvents.keys().next().value);
  }
  let meter = {trackId: host.getCurrent()?.id || null, seconds: 0, position: finite(audio.currentTime), at: performance.now(), eligible: playbackReady(), finalized: false, announced: false};
  if (saved.meter?.trackId === meter.trackId && Number.isFinite(saved.meter.seconds)) meter.seconds = Math.max(0, saved.meter.seconds);
  function finite(value) { return Number.isFinite(value) ? Math.max(0, value) : 0; }
  function adsActive() { return window.PMPAds?.active === true; }
  function playbackReady() { return !audio.paused && !audio.ended && audio.readyState >= 3 && !audio.seeking && !seeking && !stalled && !adsActive(); }
  function persist() {
    saved.meter = {trackId: meter.trackId, seconds: meter.seconds};
    try { sessionStorage.setItem(key, JSON.stringify(saved)); return true; }
    catch { error = 'Your browser could not save this listening session. Allow site storage before creating what comes next.'; blocked = true; render(); return false; }
  }
  function notify(message) { if (typeof host.notify === 'function') host.notify(message); else APP.notify?.(message); }
  function archive(reason) {
    // Preserve old receipts for diagnosis, but they must never become requests
    // belonging to the next guest/account in this tab.
    try { sessionStorage.setItem('pmp.listening.archive.v1.' + crypto.randomUUID(), JSON.stringify({reason, state: saved})); }
    catch { blocked = true; error = 'Your prior listening session could not be archived. Allow site storage before starting another session.'; render(); return false; }
    return true;
  }
  function clearMissing(reason) {
    if (!archive(reason)) return false;
    saved = {clientId: crypto.randomUUID(), authScope: scope, sessionId: null, wanted: false, pendingStart: null, events: [], meter: null};
    session = null; blocked = false; error = ''; readError = false; waiting = false; serverPlaying = false; safeDispatch.clear(); consumed.clear();
    return persist();
  }
  async function checkScope() {
    if (authChanged) throw Error('Your account session changed. Reload this page before continuing creation.');
    const identity = await APP.request('/api/session');
    if (!validScope(scope) || !validScope(identity.authScope)) throw Error('Your account session could not be verified. Reload this page before continuing creation.');
    if (identity.authScope !== scope) {
      // Keep the old scope on disk: the next page can distinguish a migrated
      // owned session from a missing one without replaying its commands.
      authChanged = true; saved.wanted = false; waiting = false; serverPlaying = false; persist();
      throw Error('Your account session changed. Reload this page before continuing creation.');
    }
    APP.csrf = identity.csrf;
  }
  function sample() {
    const now = performance.now(), position = finite(audio.currentTime), same = meter.trackId === host.getCurrent()?.id;
    const eligible = same && playbackReady();
    if (same && meter.eligible && !audio.seeking && !seeking && !adsActive()) {
      // Position alone cannot establish listening: seeks and long suspended
      // page intervals do not count. Count real seconds, bounded by wall time.
      const wall = Math.max(0, (now - meter.at) / 1000), delta = position - meter.position;
      if (wall <= 10 && delta >= 0) meter.seconds += Math.min(delta, wall);
    }
    meter.position = position; meter.at = now; meter.eligible = eligible;
  }
  function resetMeter(trackId) {
    seeking = false; stalled = false;
    meter = {trackId, seconds: 0, position: finite(audio.currentTime), at: performance.now(), eligible: playbackReady(), finalized: false, announced: false};
  }
  async function exactRequest(track) {
    const intentOf = job => job?.workflow?.intentRequest ?? job?.workflow?.request;
    let job = (APP.jobs || []).find(job => intentOf(job) &&
      [...(job.tracks || []), ...(job.workflow.result?.tracks || [])].some(item => item.id === track.id));
    if (!job && validId(track.jobId)) {
      try {
        const result = await APP.request(`/api/jobs/${encodeURIComponent(track.jobId)}`);
        if (intentOf(result.job) && (result.job.tracks || []).some(item => item.id === track.id)) job = result.job;
      } catch (failure) { if (![403, 404].includes(failure.status)) throw Error('The original music brief could not be loaded. Check the connection before starting this session.'); }
    }
    if (job) return copy(intentOf(job));
    if (typeof host.getFallbackRequest !== 'function') throw Error('Open Create and choose the sound for this listening session.');
    const request = await host.getFallbackRequest();
    if (!request || Array.isArray(request) || typeof request !== 'object') throw Error('Open Create and choose the sound for this listening session.');
    return copy(request);
  }
  function statusText() {
    if (error) return error;
    if (saved.pendingStart) {
      if (blocked) return 'The session has not been confirmed. Check its status before trying again.';
      if (!intent && !saved.pendingStart.sent) return 'Keep it going is on. Press play to start your listening session.';
      return 'Starting your listening session…';
    }
    if (!session) return '';
    if (session.error?.message) return session.error.message;
    if (saved.events.some(event => event.type === 'dismiss')) return 'A queue removal still needs confirmation. Retry Remove to confirm the same change.';
    if (saved.events.length && !intent && saved.wanted) return 'Listening updates are saved. Press play to resume this session.';
    const count = session.queue.filter(owned).length;
    if (!saved.wanted) return session.activeJob ? 'Continuous listening is off. An accepted creation is still finishing.' : 'Continuous listening is off. Your prepared songs remain available.';
    if (session.activeJob) return `${count ? `${count} ${count === 1 ? 'song' : 'songs'} ready. ` : ''}Creating what comes next${intent ? '…' : ' · playback paused.'}`;
    if (!intent) return 'Listening session paused. Press play to continue.';
    if (waiting && !host.hasNext()) return 'Your next song is not ready yet. Following the existing request…';
    return count ? `${count} ${count === 1 ? 'song' : 'songs'} prepared for what comes next.` : 'Your listening and skips shape what comes next.';
  }
  function render() {
    host.renderStatus({enabled: !!saved.wanted, preparing: !!(saved.wanted && (starting || saved.pendingStart?.sent || session?.activeJob && !terminal.has(session.activeJob.status))),
      playing: intent, waiting, message: statusText(), attention: !!(blocked || session?.error || saved.events.some(event => event.type === 'dismiss')),
      canResume: blocked || session?.status === 'needs-attention', jobId: session?.activeJob?.id || null}, {enable: setEnabled, check: refresh});
  }
  function publishJob(job) {
    if (!job?.id || !job.workflow) return;
    const index = (APP.jobs || (APP.jobs = [])).findIndex(item => item.id === job.id);
    if (index < 0) APP.jobs.unshift(job); else APP.jobs[index] = job;
    window.dispatchEvent(new CustomEvent('pmp:jobs'));
  }
  function accept(view) {
    if (!view || !validId(view.id) || view.clientId !== saved.clientId || !Array.isArray(view.queue)) throw Error('The listening session response could not be verified.');
    if (session?.id === view.id && Number(view.updatedAt) < Number(session.updatedAt)) return;
    session = view; saved.sessionId = view.id;
    if (view.enabled === false && !enabling && !saved.events.some(event => event.type === 'resume')) saved.wanted = false;
    if (!saved.events.length) serverPlaying = view.playing === true;
    publishJob(view.activeJob);
    const dismissed = pendingDismissals();
    const tracks = view.queue.map(canonicalTrack).filter(track => track && !dismissed.has(track.id) && !consumed.has(track.id) && track.id !== host.getCurrent()?.id);
    if (tracks.length) host.appendPrepared(tracks);
    if(view.policy?.recalibration?.changed&&!saved.manualQueue&&host.manualQueue?.()!==true)host.reorderPrepared?.(tracks.map(track=>track.id));
    persist(); render();
    void maybeAdvance();
  }
  async function maybeAdvance() {
    if (disposed || !restored || changingQueue || pendingDismissals().size || autoNext || !waiting || !intent || !saved.wanted || adsActive() || !host.hasNext()) return;
    if (waitReason === 'ended' ? !audio.ended : !audio.paused) return;
    if (host.getCurrent()?.id !== meter.trackId) { waiting = false; return; }
    waiting = false; waitReason = null; autoNext = true; render();
    try { await host.advance(); } catch { error = 'Your next song is ready. Press Next to listen.'; render(); }
    finally { autoNext = false; }
  }
  function snapshot(type, trackId = meter.trackId) {
    return {eventId: crypto.randomUUID(), clientId: saved.clientId, type, trackId,
      position: Math.min(3600, finite(meter.position)), playedSeconds: Math.min(3600, finite(meter.seconds)), playing: intent,manualQueue:saved.manualQueue===true||host.manualQueue?.()===true};
  }
  function enqueue(type, {pumpNow = true} = {}) {
    if (disposed || !saved.sessionId && !saved.pendingStart) return Promise.resolve();
    const event = snapshot(type);
    if (type === 'progress' && saved.events.length) return Promise.resolve();
    saved.events.push(event);
    if (type === 'pause' || type === 'disable') serverPlaying = false;
    if (type === 'resume') serverPlaying = true;
    if (!persist()) { saved.events.pop(); return Promise.resolve(); }
    if (isSafe(event)) safeDispatch.add(event.eventId);
    if (!pumpNow) return Promise.resolve();
    const wasBusy = !!busy, result = pump();
    // A user stop may arrive while another POST is awaiting its response.
    // Send that independent stop once the in-flight request settles, even if
    // its outcome was unknown. The original event remains saved unchanged.
    return wasBusy && (isStop(event) || isSafe(event)) ? Promise.resolve(result).then(() => pump()) : result;
  }
  async function pump(retry = false) {
    if (busy) return busy;
    if (!saved.pendingStart && !saved.events.length) return;
    const independent = event => isStop(event) || isSafe(event) && safeDispatch.has(event.eventId);
    if (disposed || blocked && !retry && !saved.events.some(independent)) return;
    if (retry) { blocked = false; error = ''; for (const event of saved.events) if (isSafe(event)) safeDispatch.add(event.eventId); }
    busy = (async () => {
      try { await checkScope(); }
      catch (failure) { blocked = true; error = failure.message; render(); return; }
      if (saved.authScope !== scope) { blocked = true; error = 'Check your previous listening session before resuming.'; render(); return; }
      if (saved.pendingStart && saved.wanted && intent && playbackReady()) {
        starting = true; render();
        const pending = saved.pendingStart;
        try {
          pending.sent = true;
          if (!persist()) return;
          const {session: view} = await APP.request('/api/listening-sessions', {method: 'POST', body: copy(pending.body), headers: {'Idempotency-Key': pending.id}});
          if (disposed) return;
          accept(view); saved.pendingStart = null;
          meter.announced = meter.trackId === view.currentTrackId || saved.events.some(event => event.type === 'start' && event.trackId === meter.trackId);
          persist();
          if (!saved.wanted) await enqueue('disable', {pumpNow: false});
          else if (!intent || adsActive()) await enqueue('pause', {pumpNow: false});
        } catch (failure) {
          if (failure.status && failure.status < 500) { saved.pendingStart = null; saved.wanted = false; }
          blocked = true; error = failure.status ? failure.message : 'The session response was interrupted. Check its status; a new creation has not been requested.';
          persist(); return;
        } finally { starting = false; render(); }
      }
      while (!disposed && saved.sessionId && saved.events.length) {
        // Pause/disable are independent safety controls. They can overtake an
        // unconfirmed update, without ever changing or resending its body.
        const canContinue = saved.wanted && intent && (playbackReady() || waiting && !adsActive()) && !blocked;
        const first = saved.events[0];
        const event = canContinue && (!isSafe(first) || safeDispatch.has(first.eventId)) ? first : saved.events.find(independent);
        if (!event) break;
        safeDispatch.delete(event.eventId);
        try {
          const {session: view} = await APP.request(`/api/listening-sessions/${encodeURIComponent(saved.sessionId)}/events`, {method: 'POST', body: copy(event)});
          if (disposed) return;
          saved.events.splice(saved.events.findIndex(item => item.eventId === event.eventId), 1); persist(); accept(view); settleEvent(event);
        } catch (failure) {
          // A definite rejection did not execute the event. Unknown outcomes
          // retain the same event ID/body and block every dependent POST.
          if (failure.status && failure.status < 500) { saved.events.splice(saved.events.findIndex(item => item.eventId === event.eventId), 1); settleEvent(event, failure); }
          blocked = true; error = failure.status ? failure.message : 'Listening updates are waiting for a connection. Resume this session to confirm the same update.';
          if (event.type === 'dismiss' && !failure.status) error = 'The queue removal has not been confirmed. Retry Remove to confirm the same change; it will not create music.';
          persist(); break;
        }
      }
    })().finally(() => { busy = null; render(); });
    return busy;
  }
  async function dismissPrepared(trackIds) {
    if (disposed) throw Error('Reload this page before changing this listening queue.');
    if (!Array.isArray(trackIds) || trackIds.length > 100 || trackIds.some(id => typeof id !== 'string')) throw Error('Choose up to 100 songs to remove from this queue.');
    const requested = new Set(trackIds);
    if (!requested.size) return true;
    changingQueue++;
    try {
    await refresh();
    if (disposed) throw Error('Reload this page before changing this listening queue.');
    if (saved.sessionId && !session) throw Error(error || 'The listening queue could not be confirmed. Check its status before removing a song.');
    // First confirm any previous removal involving these rows. Never replace
    // its ID/body with a new event merely because a response was lost.
    const pending = saved.events.filter(event => event.type === 'dismiss' && event.trackIds.some(id => requested.has(id)));
    const alreadyPending = new Set(pending.flatMap(event => event.trackIds));
    const ids = (session?.queue || []).filter(track => requested.has(track.id) && !alreadyPending.has(track.id) && track.id !== host.getCurrent()?.id).map(track => track.id);
    if (ids.some(id => !/^[a-f0-9]{64}$/.test(id))) throw Error('This prepared song could not be verified. Refresh the queue before removing it.');
    if (ids.length) {
      const event = {eventId: crypto.randomUUID(), clientId: saved.clientId, type: 'dismiss', trackIds: [...new Set(ids)]};
      saved.events.push(event);
      if (!persist()) { saved.events.pop(); throw Error(error); }
      pending.push(event);
    }
    if (!pending.length) return true; // Manual/local songs are owned by the host queue.
    for (const event of pending) safeDispatch.add(event.eventId);
    const previousError = error;
    await pump();
    // A prior POST can already own the serialized transport when Remove is
    // clicked. Send this independent change only after that request settles.
    if (pending.some(event => safeDispatch.has(event.eventId))) await pump();
    for (const event of pending) {
      if (!settledEvents.has(event.eventId)) throw Error(error || 'The queue removal still needs confirmation. Retry Remove to confirm the same change.');
      const failure = settledEvents.get(event.eventId);
      if (failure) { await refresh(); throw failure; }
    }
    if (!saved.events.length && !readError && (!error || error === previousError || /queue removal/.test(error))) { blocked = false; error = ''; }
    render(); return true;
    } finally { changingQueue--; }
  }
  async function refresh() {
    if (disposed) return;
    if (reading) return reading;
    reading = (async () => {
      try {
        await checkScope();
        let view;
        if (saved.sessionId) ({session: view} = await APP.request(`/api/listening-sessions/${encodeURIComponent(saved.sessionId)}`));
        else {
          const result = await APP.request('/api/listening-sessions');
          view = (result.sessions || []).find(item => item.clientId === saved.clientId &&
            (saved.pendingStart ? item.idempotencyKey === saved.pendingStart.id : item.enabled));
        }
        if (disposed) return;
        if (saved.authScope !== scope) {
          if (view) {
            if (!archive('owner-scope-reconciled')) return;
            saved.authScope = scope; saved.events = []; saved.pendingStart = null; saved.wanted = false; safeDispatch.clear();
            accept(view); persist();
            notify('Your previous listening session is available. Turn on Keep it going to resume.');
          } else clearMissing('previous-owner-session-unavailable');
          return;
        }
        if (readError && !blocked) { error = ''; readError = false; }
        if (view) {
          const recovered = !!saved.pendingStart && view.idempotencyKey === saved.pendingStart.id;
          accept(view);
          if (recovered) { saved.pendingStart = null; blocked = false; error = ''; persist(); }
        }
      } catch (failure) {
        if (!disposed && failure.status === 404 && saved.sessionId && !authChanged) { clearMissing('owned-session-not-found'); }
        else if (!disposed && !blocked) { readError = true; error = authChanged ? failure.message : failure.status ? failure.message : 'The listening session could not be refreshed. Your current music can keep playing.'; render(); }
      }
      finally { restored = true; reading = null; render(); }
    })();
    return reading;
  }
  function setEnabled(on) {
    if (!on) return changeEnabled(false);
    if (enabling) return enabling;
    enabling = changeEnabled(true).finally(() => { enabling = null; });
    return enabling;
  }
  async function changeEnabled(on) {
    if (disposed) return false;
    // Stop autoplay intent immediately, before even a read-only refresh can
    // deliver a ready queue in response to this same click.
    if (!on) {
      saved.wanted = false; waiting = false; sample();
      if (saved.pendingStart && !saved.pendingStart.sent) { saved.pendingStart = null; saved.events = []; }
      persist(); render();
    }
    await refresh();
    if (disposed) return false;
    if (!on) {
      if (session) {
        if (saved.events.some(event => event.type === 'disable')) await pump();
        else await enqueue('disable');
      }
      return false;
    }
    const track = canonicalTrack(host.getCurrent());
    if (!owned(track)) { notify('Choose a song from our listening catalogue before turning on Keep it going.'); render(); return false; }
    saved.wanted = true; intent = !audio.paused && !audio.ended;
    if (meter.trackId !== track.id) resetMeter(track.id);
    if (session) {
      if (!persist()) return false;
      if (!intent) { blocked = false; error = ''; render(); return true; }
      await pump(true);
      if (blocked) return false;
      await onTrackStart();
      // Resuming is an explicit request. It may prepare the next take; GET
      // and the status link above never do so.
      if (!serverPlaying || !session.enabled || session.status === 'needs-attention') await enqueue('resume');
      render(); return !blocked;
    }
    if (!saved.pendingStart) {
      try {
        const request = await exactRequest(track);
        if (disposed || !saved.wanted) return false;
        saved.pendingStart = {id: crypto.randomUUID(), sent: false, body: {trackId: track.id, clientId: saved.clientId, request}};
      }
      catch (failure) { saved.wanted = false; error = failure.message; render(); return false; }
    }
    if (!persist()) { saved.wanted = false; return false; }
    await pump(true); render(); return !!saved.wanted && !blocked;
  }
  async function resetForCreation() {
    if (disposed || authChanged) throw Error('Reload this page before starting a new creation.');
    await changeEnabled(false);
    if (busy) await busy;
    // A session admission can finish while the off action is waiting. Read it
    // under its original key and disable that exact session, never replay it.
    await refresh();
    if (session?.enabled && !blocked && !saved.events.some(event => event.type === 'disable')) {
      await enqueue('disable'); await refresh();
    }
    if (saved.pendingStart) throw Error('The previous listening session has not been confirmed. Check its status before starting a new creation.');
    if (saved.sessionId && (!session || session.enabled !== false)) throw Error('The previous listening session could not be switched off. Check its status before starting a new creation.');
    // Reading enabled:false confirms the desired stop even if its POST reply
    // was lost. Every other unconfirmed event remains intact and blocks reset.
    if (saved.events.some(event => event.type !== 'disable')) throw Error('A previous listening update still needs confirmation. Resume that session to confirm it before starting a new creation.');
    saved.sessionId = null; saved.pendingStart = null; saved.events = []; saved.wanted = false;saved.manualQueue=false;
    session = null; blocked = false; error = ''; readError = false; playbackError = false;
    waiting = false; waitReason = null; serverPlaying = false; consumed.clear(); resetMeter(host.getCurrent()?.id || null);
    if (!persist()) throw Error('The old listening session could not be cleared from this browser. Allow site storage before starting a new creation.');
    render(); return true;
  }
  function onTrackStart() {
    if (disposed) return;
    const track = host.getCurrent(); if (!track) return;
    if (waiting && track.id === meter.trackId && audio.paused) return;
    if (!owned(track) && saved.wanted) { void setEnabled(false); notify('Continuous creation is off while a local audio file is playing.'); return; }
    const changed = track.id !== meter.trackId || meter.finalized && !audio.ended;
    if (changed) {
      if (saved.wanted && meter.trackId && !meter.finalized) void ending('skip');
      resetMeter(track.id); consumed.add(track.id); waiting = false; waitReason = null;
    } else sample();
    if (saved.wanted && (session || saved.pendingStart) && !meter.announced && (intent || !audio.paused)) {
      // The initial admission already identifies its first playing track.
      if (track.id !== (session?.currentTrackId || saved.pendingStart?.body.trackId) || changed || meter.finalized) void enqueue('start', {pumpNow: false});
      meter.announced = true;
    }
    if (saved.wanted && session && intent && !audio.paused && !adsActive() && !serverPlaying) void enqueue('resume', {pumpNow: false});
    persist(); render();
    return pump();
  }
  async function ending(type, {waitForNext = false} = {}) {
    if (disposed || !['skip', 'ended'].includes(type) || meter.finalized) return;
    sample(); meter.finalized = true; meter.eligible = false;
    waiting = (type === 'ended' || waitForNext) && !!saved.wanted && intent;
    waitReason = waiting ? type : null;
    if (waiting && waitForNext) {
      if (!audio.paused) { internalPause = true; audio.pause(); }
    }
    if (saved.wanted && (session || saved.pendingStart)) await enqueue(type);
    persist(); render();
  }
  function setPlayIntent(playing) {
    if (disposed) return;
    sample(); const changed = intent !== !!playing; intent = !!playing;
    if (!intent) {
      if (saved.wanted && changed && (session || saved.pendingStart)) void enqueue('pause');
    } else if (saved.wanted && !blocked) {
      void onTrackStart();
      if (waiting && session && !serverPlaying && !adsActive()) void enqueue('resume');
      void maybeAdvance();
    }
    render();
  }
  function tick() {
    if (disposed) return;
    sample();
    if (session && saved.wanted && intent && playbackReady() && !blocked) void enqueue('progress');
    if (session || saved.pendingStart) void refresh();
  }
  listen(audio, 'timeupdate', sample);
  listen(audio, 'seeking', () => { seeking = true; meter.eligible = false; sample(); });
  listen(audio, 'seeked', () => { seeking = false; meter.position = finite(audio.currentTime); meter.at = performance.now(); meter.eligible = playbackReady(); });
  for (const name of ['waiting', 'stalled']) listen(audio, name, () => { sample(); stalled = true; meter.eligible = false; });
  listen(audio, 'playing', () => { stalled = false; if (playbackError && !blocked) { error = ''; playbackError = false; } sample(); void onTrackStart(); });
  listen(audio, 'play', () => setPlayIntent(true));
  listen(audio, 'error', () => {
    if (adsActive() || disposed) return;
    setPlayIntent(false); meter.eligible = false;
    if (!blocked) { playbackError = true; error = 'This song could not start. Choose a playable song before continuing your listening session.'; }
    render();
  });
  listen(audio, 'pause', () => {
    sample();
    if (internalPause) { internalPause = false; return; }
    if (!audio.ended && !adsActive() && meter.trackId === host.getCurrent()?.id) setPlayIntent(false);
  });
  listen(document, 'pmp:ads-state', () => {
    sample(); const active = adsActive();
    if (active && !adWasActive && saved.wanted && serverPlaying) void enqueue('pause');
    if (active && window.PMPAds.getState?.().paused === true) setPlayIntent(false);
    adWasActive = active;
  });
  const timer = setInterval(tick, 3000);
  function dispose() { if (disposed) return; sample(); disposed = true; clearInterval(timer); persist(); for (const [target, event, fn] of bindings) target.removeEventListener(event, fn); }
  listen(window, 'pagehide', dispose);
  const controller = Object.freeze({setEnabled, onTrackStart, ending, setPlayIntent, refresh, resetForCreation, dismissPrepared, render, dispose,markManualQueue(){saved.manualQueue=true;persist();},
    getState: () => copy({session, enabled: !!saved.wanted, playing: intent, waiting, blocked, error, playedSeconds: meter.seconds, pendingEvents: saved.events.length, pendingStart: !!saved.pendingStart})});
  persist(); render(); void refresh();
  return controller;
  }
  function reorderAutomatic(queue,ids,{idOf=item=>item,start=0}={}){
    const order=[...new Set(ids)],wanted=new Set(order),slots=[];
    for(let i=Math.max(0,start);i<queue.length;i++)if(wanted.has(idOf(queue[i])))slots.push(i);
    const byId=new Map(slots.map(i=>[idOf(queue[i]),queue[i]])),sorted=order.filter(id=>byId.has(id)).map(id=>byId.get(id));
    // Never collapse duplicate user entries or move an unrelated manual slot.
    if(slots.length!==sorted.length)return false;
    const changed=slots.some((i,n)=>queue[i]!==sorted[n]);if(changed)slots.forEach((i,n)=>{queue[i]=sorted[n];});return changed;
  }
  window.PMPListeningFactory = Object.freeze({create, canonicalTrack,reorderAutomatic});
  // The main page's real player remains a host, not a prerequisite for rooms.
  const P = window.PMP, APP = window.PMP_APP;
  if (!P?.audio || !APP) return;
  let mainStatus;
  const controller = create({app: APP, audio: P.audio, getCurrent: () => P.state.current, hasNext: () => P.state.queue.length > 0,
    manualQueue:()=>P.state.shuffle===true,
    reorderPrepared(ids){if(reorderAutomatic(P.state.queue,ids))P.updatePlayer?.();},
    appendPrepared(tracks) { for (const track of tracks) { const item = P.registerTrack(track); if (!P.state.queue.includes(item.id)) P.state.queue.push(item.id); } P.updatePlayer?.(); },
    advance: () => P.actions.next(), notify: message => (APP.notify || P.toast)?.(message),
    getFallbackRequest() { if (!window.PMPControls?.payload) throw Error('Open Create and choose the sound for this listening session.'); return window.PMPControls.payload(P.state.draft); },
    renderStatus(model, actions) {
      P.state.continuation = model.enabled; P.state.autofilling = model.preparing;
      if (model.waiting || mainStatus?.waiting) P.state.nextWaiting = model.waiting;
      mainStatus = model;
      for (const id of ['continuation', 'expanded-continuation']) { const el = document.getElementById(id); if (el) el.checked = model.enabled; }
      P.syncKeepGoingChoice?.(model.enabled); // the Create screen's "And keep it going" Yes/No pair mirrors the same flag
      const host = document.querySelector('.player-extra') || document.querySelector('.player'); if (!host) return;
      let node = document.getElementById('listening-session-status');
      if (!node) {
        node = document.createElement('div'); node.id = 'listening-session-status'; node.className = 'listening-session-status';
        const text = document.createElement('p'); text.className = 'listening-session-copy'; text.setAttribute('role', 'status'); text.setAttribute('aria-live', 'polite');
        const job = document.createElement('button'); job.type = 'button'; job.className = 'text-button accent'; job.textContent = 'View next creation';
        job.addEventListener('click', () => { if (mainStatus?.jobId) window.PMPWorkflow?.openCreate(mainStatus.jobId); });
        const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'text-button'; retry.textContent = 'Check session'; retry.addEventListener('click', () => { void actions.check(); });
        const resume = document.createElement('button'); resume.type = 'button'; resume.className = 'text-button accent'; resume.textContent = 'Resume session'; resume.addEventListener('click', () => { void actions.enable(true); });
        node.append(text, job, retry, resume); host.append(node);
      }
      const [text, job, retry, resume] = node.children; node.hidden = !model.message;
      if (text.textContent !== model.message) text.textContent = model.message;
      job.hidden = !model.jobId; retry.hidden = !model.attention; resume.hidden = !model.canResume;
      node.dataset.state = model.attention ? 'attention' : !model.playing ? 'paused' : 'active';
    }});
  window.PMPListening = controller; P.pageHooks.push(controller.render);
})();
