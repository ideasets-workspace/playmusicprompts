/* A new creation arms its own first song. Only decoded playback starts the
 * existing listening controller; merely receiving a result cannot submit work. */
(() => {
  'use strict';
  const key = 'pmp.website.creation-continuation.v1';
  function create({app, player, storage, document, window}) {
    const audio = player.audio, valid = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
    let pending = null, disposed = false, observedSource = null;
    const notify = message => (app.notify || player.toast)?.(message);
    function write(value) {
      try { storage.setItem(key, JSON.stringify(value)); pending = value; return true; }
      catch { notify('Your song is ready. Allow site storage, then turn on Keep it going to continue creating.'); return false; }
    }
    function primary(trackId, jobId) {
      const job = (app.jobs || []).find(item => item.id === jobId && item.tracks?.some(track => track.id === trackId));
      if (!job || (job.creation ? job.creation.primaryTrackId !== trackId || !['ready', 'partial'].includes(job.creation.primaryStatus) : job.tracks[0]?.id !== trackId || !['ready', 'partial'].includes(job.status))) return null;
      const track = job.tracks.find(item => item.id === trackId);
      return track.owned === true && !track.local && valid(track.id) && track.url === '/api/listen/' + track.id ? track : null;
    }
    try {
      const value = JSON.parse(storage.getItem(key) || 'null');
      if (value?.version === 1 && valid(app.authScope) && value.scope === app.authScope && valid(value.trackId) && typeof value.jobId === 'string') pending = value;
      else if (value) write(null);
    } catch { /* A malformed target never authorizes continuation. */ }
    function clear() { return write(null); }
    function arm(track) {
      if (disposed || !valid(app.authScope) || !track) return false;
      const job = (app.jobs || []).find(item => primary(track.id, item.id));
      if (!job) { notify('Your song is ready. Open its creation record before starting continuous listening.'); return false; }
      const written = write({version: 1, scope: app.authScope, trackId: track.id, jobId: job.id});
      // The worker popup may have started this exact song before its Create
      // waiter settles. Reuse that observed playing event, not a guessed state.
      if (written && observedSource === audio.currentSrc) playing();
      return written;
    }
    function playing() {
      if (disposed || !pending || pending.scope !== app.authScope || audio.paused || audio.ended || audio.readyState < 3 || window.PMPAds?.active) return;
      const track = primary(pending.trackId, pending.jobId), current = player.state.current;
      if (!track || current?.id !== track.id || current.local || current.owned !== true) return;
      let source; try { source = new URL(audio.currentSrc, window.location.href); } catch { return; }
      if (source.origin !== window.location.origin || source.pathname !== track.url || source.search || source.hash || source.username || source.password) return;
      if (!window.PMPListening?.setEnabled) return;
      // Consume before the asynchronous call. A failed/uncertain response is
      // owned by that controller's durable idempotent recovery, never this arm.
      if (!clear()) return;
      Promise.resolve(window.PMPListening.setEnabled(true)).catch(error => notify(error.message || 'Continuous listening needs attention. Check the listening session.'));
    }
    function change(event) { if (['continuation', 'expanded-continuation'].includes(event.target?.id) && !event.target.checked) clear(); }
    function observedPlaying() { observedSource = audio.currentSrc; playing(); }
    function dispose() { disposed = true; audio.removeEventListener('playing', observedPlaying); document.removeEventListener('change', change); window.removeEventListener('pagehide', dispose); }
    audio.addEventListener('playing', observedPlaying); document.addEventListener('change', change); window.addEventListener('pagehide', dispose);
    return Object.freeze({arm, clear, dispose});
  }
  window.PMPCreationContinuationFactory = Object.freeze({create});
  if (window.PMP?.audio && window.PMP_APP) window.PMPCreationContinuation = create({app: window.PMP_APP, player: window.PMP, storage: sessionStorage, document, window});
})();
