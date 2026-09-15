/* Account collections and creation history. The server remains the authority. */
(() => {
  'use strict';
  const P = window.PMP, APP = window.PMP_APP;
  if (!P || !APP) throw Error('The account and music connection is not ready.');
  const { $, $$, esc, icon, art, state } = P;
  const pending = new Map();
  let collectionsLoading = false, collectionErrors = [], refreshPromise;
  let modalVersion = 0, modalMarker, jobSignature = '';
  const activeStatuses = new Set(['queued', 'submitting', 'pending', 'ingesting']);
  const jobCopy = {
    queued: ['Queued', 'Your creation is saved and waiting to start.'],
    submitting: ['Starting your music', 'Your request is being sent to the music service.'],
    pending: ['Creating your music', 'The music service is working on this creation.'],
    ingesting: ['Preparing your music', 'Saving the generated files and preparing them for listening.'],
    ready: ['Ready to play', 'Your available takes are saved and ready to listen to.'],
    partial: ['Some takes are ready', 'Available takes can play now. Retry the transfer to recover remaining outputs.'],
    ingest_failed: ['Transfer needs attention', 'The generated result is saved. Retry its transfer without generating again.'],
    failed: ['Creation needs attention', 'This creation could not finish. It has not been submitted again.'],
    uncertain: ['Confirmation needed', 'The service has not confirmed this request. It will not be submitted again automatically.']
  };
  const idPath = id => encodeURIComponent(String(id));
  const notice = message => `<p class="connected-notice">${esc(message)}</p>`;
  const action = (name, label, id, css = 'secondary') => `<button type="button" class="${css}" data-action="${name}"${id == null ? '' : ` data-id="${esc(id)}"`}>${esc(label)}</button>`;
  const signInButton = () => APP.config.identity?.available ? action('connected-sign-in', 'Continue securely', null, 'primary') : '';
  const signedIn = () => !!APP.user;
  const playlist = id => state.playlists.find(item => item.id === id);
  function modal(title, body, footer = '') {
    const version = ++modalVersion;
    P.dialog(title, `${body}<p id="connected-error" class="connected-error" role="alert" hidden></p>`, footer);
    modalMarker = $('#connected-error');
    return version;
  }
  const sameModal = version => version === modalVersion && modalMarker && modalMarker === $('#connected-error') && $('#modal')?.open;
  function report(error, version) {
    const message = error?.message || 'The request could not be completed. Please try again.';
    const target = $('#connected-error');
    if (target && sameModal(version)) { target.textContent = message; target.hidden = false; }
    P.toast(message);
  }
  // Serialize account writes. No optimistic success, local playlist copy or browser entitlement.
  function operation(key, button, task) {
    if (pending.has(key)) return pending.get(key);
    const version = modalVersion;
    if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); }
    const promise = Promise.resolve().then(task).catch(async error => {
      if (error?.status === 409 && key.startsWith('playlist:')) {
        try {
          const result = await APP.request('/api/playlists'); APP.playlists = result.playlists; applyCollections();
          report(Error('This playlist changed since you opened it. Your collection has been refreshed. Review it and try again.'), version);
        } catch { report(Error('This playlist changed, and the latest version could not be loaded. Refresh your collection before trying again.'), version); }
      } else report(error, version);
      return null;
    }).finally(() => {
      pending.delete(key);
      if (button?.isConnected) { button.disabled = false; button.removeAttribute('aria-busy'); }
    });
    pending.set(key, promise);
    return promise;
  }
  function gate(purpose = 'keep your music close') {
    if (signedIn()) return true;
    const available = APP.config.identity?.available;
    modal('Your music, together.', notice(`Sign in to ${purpose}. Creating and listening are available without an account.`) +
      (available ? notice('Continue to the connected identity service to sign in or create your account securely.') : notice('Account sign-in is not connected yet.')),
      `${action('close', 'Keep listening')}${signInButton()}`);
    return false;
  }
  function ownedSong(id) {
    const track = P.song(id);
    if (!track) { P.toast('This song is not available in the catalogue.'); return null; }
    if (!track.owned) { P.toast('Account collections can contain songs from the service catalogue. Local audio stays on this device.'); return null; }
    return track;
  }
  function applyCollections() {
    state.saved = Array.isArray(APP.saved) ? APP.saved : [];
    state.playlists = Array.isArray(APP.playlists) ? APP.playlists : [];
    state.session = APP.user;
    P.syncSaved();
    P.renderLibrary();
  }
  function updatePlaylist(value) {
    APP.playlists = [value, ...APP.playlists.filter(item => item.id !== value.id)].sort((a, b) => b.createdAt - a.createdAt);
    applyCollections();
  }
  async function refreshCollections() {
    if (refreshPromise) return refreshPromise;
    if ([...pending.keys()].some(key => key.startsWith('playlist:') || key.startsWith('favorite:'))) { P.toast('Your collection is being updated. Refresh again in a moment.'); return; }
    if (!signedIn()) { APP.saved = []; APP.playlists = []; collectionErrors = []; applyCollections(); return; }
    collectionsLoading = true;
    collectionErrors = [];
    renderLibraryConnection();
    refreshPromise = Promise.allSettled([APP.request('/api/favorites'), APP.request('/api/playlists')]).then(results => {
      for (const [index, result] of results.entries()) {
        if (result.status === 'fulfilled') APP[index ? 'playlists' : 'saved'] = result.value[index ? 'playlists' : 'saved'];
        else collectionErrors.push(`${index ? 'Playlists' : 'Saved songs'}: ${result.reason?.message || 'Could not load. Please try again.'}`);
      }
      applyCollections();
    }).finally(() => { collectionsLoading = false; refreshPromise = null; renderLibraryConnection(); });
    return refreshPromise;
  }
  function renderLibraryConnection() {
    const content = $('#library-content');
    if (!content) return;
    let target = $('#connected-library-status');
    if (!target) { target = document.createElement('div'); target.id = 'connected-library-status'; target.className = 'connected-library-status'; content.before(target); }
    const accountTab = state.libraryTab !== 'creations';
    content.hidden = accountTab && !signedIn();
    target.hidden = !accountTab;
    if (!accountTab) return;
    if (!signedIn()) {
      target.innerHTML = `<div><strong>Make it your collection.</strong><p>Sign in to save songs and build playlists. You can create and listen as a guest.</p></div><div class="connected-actions">${signInButton()}${!APP.config.identity?.available ? '<span class="connected-unavailable">Account sign-in is not connected yet.</span>' : ''}</div>`;
      content.hidden = true;
    } else {
      content.hidden = false;
      target.hidden = !collectionsLoading && !collectionErrors.length;
      target.innerHTML = collectionsLoading ? '<p role="status">Loading your account collection…</p>' : `<div role="status">${collectionErrors.map(message => `<p>${esc(message)}</p>`).join('')}</div>${action('connected-refresh', 'Try again')}`;
    }
  }
  const originalRenderLibrary = P.renderLibrary;
  P.renderLibrary = () => { originalRenderLibrary(); renderLibraryConnection(); };
  function toggleSave(id, button) {
    if (!gate('save your favorite songs') || !ownedSong(id)) return;
    return operation(`favorite:${id}`, button, async () => {
      if (refreshPromise) await refreshPromise;
      const desired = !APP.saved.some(item => item.id === id);
      const result = await APP.request(`/api/favorites/${idPath(id)}`, {method: 'PUT', body: {saved: desired}});
      APP.saved = result.saved;
      applyCollections();
      window.dispatchEvent(new CustomEvent('pmp:saved'));
      P.toast(desired ? 'Saved to your library.' : 'Removed from your saved songs.');
      for (const item of $$('[data-action="save"]')) {
        if (item.dataset.id === id && item.classList.contains('option-row')) item.querySelector('span').lastChild.textContent = desired ? 'Remove from library' : 'Save song';
      }
    });
  }
  function playlistForm(id, addSong) {
    if (!gate('create and manage playlists')) return;
    const item = id ? playlist(id) : null;
    if (id && !item) return P.toast('This playlist is no longer available. Refresh your collection.');
    const version = modal(item ? 'Rename playlist' : 'Name your next soundtrack.',
      `<form id="connected-playlist-form"><label class="field"><span>Playlist name</span><input name="name" maxlength="100" required value="${esc(item?.name || '')}" placeholder="A soundtrack for…" autocomplete="off"></label><div class="connected-actions"><button type="submit" class="primary">${item ? 'Save changes' : 'Create playlist'}</button>${action('close', 'Cancel')}</div></form>`);
    const form = $('#connected-playlist-form');
    form.onsubmit = event => {
      event.preventDefault();
      const name = form.elements.name.value.trim();
      form.elements.name.setCustomValidity(name ? '' : 'Give your playlist a name.');
      if (!form.reportValidity()) return;
      const button = form.querySelector('[type="submit"]');
      operation(item ? `playlist:${id}` : 'playlist:create', button, async () => {
        if (refreshPromise) await refreshPromise;
        const result = await APP.request(item ? `/api/playlists/${idPath(id)}` : '/api/playlists', {method: item ? 'PATCH' : 'POST', body: item ? {name, revision: playlist(id)?.revision} : {name}});
        updatePlaylist(result.playlist);
        state.libraryTab = 'playlists'; P.renderLibrary();
        if (sameModal(version)) P.closeDialog();
        P.toast(item ? 'Playlist renamed.' : 'Playlist created.');
        // Creation and adding a song are separate confirmed operations. Keep the created playlist on failure.
        if (addSong) {
          try {
            const updated = await APP.request(`/api/playlists/${idPath(result.playlist.id)}`, {method: 'PATCH', body: {songs: [addSong], revision: result.playlist.revision}});
            updatePlaylist(updated.playlist); P.toast(`Added to ${updated.playlist.name}.`);
          } catch (error) {
            P.toast(`Your playlist was created, but the song was not added. ${error.message}`);
          }
        }
      });
    };
    form.elements.name.oninput = event => event.target.setCustomValidity('');
  }
  async function addToPlaylist(id) {
    if (!gate('add songs to playlists') || !ownedSong(id)) return;
    if (refreshPromise) await refreshPromise;
    modal('Find a home for this song.',
      `<div class="option-list">${state.playlists.map(item => `<button class="option-row" data-action="connected-playlist-add" data-id="${esc(item.id)}" data-song="${esc(id)}" ${item.songs.includes(id) ? 'disabled' : ''}><span>${esc(item.name)}</span>${icon(item.songs.includes(id) ? 'check' : 'plus')}<span class="sr-only">${item.songs.includes(id) ? 'Already added' : 'Add song'}</span></button>`).join('') || notice('Create your first playlist to keep this song close.')}</div>`,
      `<button type="button" class="primary" data-action="connected-new-with-song" data-id="${esc(id)}">${icon('plus')}New playlist</button>`);
  }
  function playlistOpen(id, focusSong) {
    if (!gate('open your playlists')) return;
    const item = playlist(id);
    if (!item) return P.toast('This playlist is no longer available. Refresh your collection.');
    modal(item.name,
      `<p class="connected-caption">${item.songs.length} ${item.songs.length === 1 ? 'song' : 'songs'} · Saved to your account</p><div class="connected-playlist-rows">${item.songs.map((songId, index) => {
        const track = P.song(songId);
        return `<div class="track-row connected-playlist-row" data-playlist-song="${esc(songId)}">${track ? `<button class="row-art" data-action="track" data-id="${esc(songId)}" aria-label="Play ${esc(track.title)}">${art(track.art)}</button>` : '<span class="row-art connected-missing" aria-hidden="true">♫</span>'}<div><strong>${esc(track?.title || 'Song currently unavailable')}</strong><small>${esc(track?.origin || 'You can remove this song from the playlist.')}</small></div><div class="connected-row-actions"><button class="icon-button" data-action="connected-playlist-move" data-id="${esc(id)}" data-song="${esc(songId)}" data-offset="-1" aria-label="Move ${esc(track?.title || 'song')} earlier" ${index === 0 ? 'disabled' : ''}>↑</button><button class="icon-button" data-action="connected-playlist-move" data-id="${esc(id)}" data-song="${esc(songId)}" data-offset="1" aria-label="Move ${esc(track?.title || 'song')} later" ${index === item.songs.length - 1 ? 'disabled' : ''}>↓</button><button class="icon-button" data-action="connected-playlist-remove" data-id="${esc(id)}" data-song="${esc(songId)}" aria-label="Remove ${esc(track?.title || 'song')} from playlist">${icon('close')}</button></div></div>`;
      }).join('') || `<div class="empty-state"><h3>A place for your favorites.</h3><p>Add songs from their song menu.</p><a class="primary" href="explore.html" data-route>Explore music</a></div>`}</div>`,
      `${action('playlist-rename', 'Rename playlist', id)}${item.songs.some(songId => P.song(songId)) ? action('playlist-play', 'Play playlist', id, 'primary') : ''}`);
    if (focusSong) {
      const row = $$('[data-playlist-song]').find(element => element.dataset.playlistSong === focusSong);
      row?.querySelector('button:not(:disabled)')?.focus();
    }
  }
  function modifySongs(button, change, message, reopen = false) {
    if (!gate('manage your playlists')) return;
    const id = button.dataset.id, version = modalVersion;
    return operation(`playlist:${id}`, button, async () => {
      if (refreshPromise) await refreshPromise;
      const item = playlist(id);
      if (!item) throw Error('This playlist is no longer available. Refresh your collection.');
      const songs = change([...item.songs]);
      if (songs.length > 500) throw Error('This playlist has reached 500 songs. Create another playlist to add more.');
      const result = await APP.request(`/api/playlists/${idPath(id)}`, {method: 'PATCH', body: {songs, revision: item.revision}});
      updatePlaylist(result.playlist);
      if (sameModal(version)) {
        if (reopen) playlistOpen(id, button.dataset.song);
        else P.closeDialog();
      }
      P.toast(message);
    });
  }
  function playlistMenu(id) {
    if (!gate('manage your playlists')) return;
    const item = playlist(id); if (!item) return;
    modal(item.name, `<div class="option-list">${[['playlist-open', 'Open playlist'], ['playlist-play', 'Play playlist'], ['playlist-rename', 'Rename playlist'], ['playlist-delete', 'Delete playlist']].map(([key, label]) => action(key, label, id, 'option-row')).join('')}</div>`);
  }
  function deletePlaylist(id) {
    if (!gate('manage your playlists')) return;
    const item = playlist(id); if (!item) return;
    modal('Delete this playlist?', notice(`“${item.name}” will be removed from your account. Its songs will remain available in the catalogue.`),
      `${action('close', 'Keep playlist')}${action('connected-playlist-delete', 'Delete playlist', id, 'primary connected-danger')}`);
  }
  function songMenu(id) {
    const track = P.song(id); if (!track) return;
    const saved = state.saved.some(item => item.id === id);
    const entries = [['track', 'play', 'Play song'], ['play-next', 'queue', 'Play next'], ['playlist-add', 'plus', 'Add to playlist'], ['save', 'heart', saved ? 'Remove from library' : 'Save song'], ['song-details', 'sliders', 'Song details']];
    if (track.owned) entries.push(['connected-room', 'wave', 'Enter the listening room'], ['connected-download', 'down', 'Download music']);
    if (track.owned || track.shareUrl) entries.push(['share', 'arrow', 'Share song']);
    modal(track.title, `<div class="song-menu">${entries.map(([key, glyph, label]) => `<button type="button" class="option-row" data-action="${key}" data-id="${esc(id)}"><span>${icon(glyph)}${esc(label)}</span>${icon('chevron')}</button>`).join('')}</div>`);
  }
  function details(id) {
    const track = P.song(id); if (!track) return;
    const fields = [['Origin', track.origin], ['Genre', track.genre], ['Mood', track.mood], ['Era', track.era], ['Take', track.take], ['Description', track.prompt]];
    modal(track.title, `<div class="unavailable-art">${art(track.art)}</div><dl class="details-list">${fields.filter(([, value]) => value !== undefined && value !== null && value !== '').map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>` +
      (track.owned ? notice('This song is served from the music catalogue. Official downloads require an account and a qualifying rewarded ad; availability is checked before a download.') : notice('This audio file is stored in this browser on this device.')),
      track.owned ? action('connected-download', 'Download music', id, 'primary') : '');
  }
  function renderIdentity() {
    state.session = APP.user;
    const link = $('.account-link');
    if (link) {
      link.href = 'login.html'; link.removeAttribute('data-route'); link.dataset.action = 'connected-account';
      link.setAttribute('aria-label', signedIn() ? 'Your account' : 'Sign in');
      link.innerHTML = `${icon('user')}<span>${signedIn() ? 'Your account' : 'Sign in'}</span>`;
    }
    const card = $('#main .auth-card');
    if (!card) return;
    // With e-mail + password accounts available (2026-09-15) the page's own form is the sign-in surface; only a
    // signed-in visitor gets the replacement card. The OIDC-only replacement below stays for deployments without accounts.
    if (!signedIn() && APP.config.identity?.password) return;
    const signature = `${APP.user?.id || ''}:${!!APP.config.identity?.available}`;
    if (card.dataset.connectedIdentity === signature) return;
    card.dataset.connectedIdentity = signature;
    card.innerHTML = signedIn() ? `<h2>Your music lives here.</h2><p class="auth-intro">${esc(APP.user.name || 'You are signed in.')} — your account is connected.</p><div class="connected-account-actions"><a href="library.html" data-route class="primary">Open your library</a><a href="account.html" data-route class="text-button">Your account</a>${action('connected-sign-out', 'Sign out')}</div>` :
      `<h2>Your music. Your account.</h2><p class="auth-intro">Save the songs you love. Build playlists for every part of your day.</p><div class="connected-sign-in">${APP.config.identity?.available ? `${signInButton()}${notice('Sign in or create your account with the connected identity service. Your password is entered there.')}` : `<div class="connected-unavailable-card">${icon('user')}<strong>Account sign-in is not connected yet.</strong><p>You can still create music, explore the catalogue and listen without an account.</p></div>`}</div><a class="guest-link" href="index.html" data-route>Continue to music</a>`;
    card.insertAdjacentHTML('beforeend', '<footer class="auth-footer"><button data-action="legal" data-key="privacy">Privacy</button><span>·</span><button data-action="legal" data-key="terms">Terms</button><span>·</span><button data-action="legal" data-key="help">Help</button></footer>');
  }
  function account() {
    if (!signedIn()) return gate('save songs and build playlists');
    modal('Your account', notice(APP.user.name || 'You are signed in.') + notice('Your saved songs and playlists belong to this account.'), `${action('connected-sign-out', 'Sign out')}<a href="library.html" class="primary" data-route>Open your library</a>`);
  }
  function legal(key) {
    const configured = P.cfg.links?.[key];
    if (configured) {
      try { const url = new URL(configured, location.href); if (['https:', 'http:'].includes(url.protocol)) { window.open(url.href, '_blank', 'noopener'); return; } } catch {}
    }
    const pages = {
      privacy: ['How this connection works', ['When you create music, your brief and selected controls are sent to our server and the connected music generation service. The server keeps your creation record and the generated music.', 'Saved songs and playlists are stored with your signed-in account. Audio you import locally remains in this browser unless an upload feature explicitly says otherwise.', 'A published privacy policy has not been connected yet. This is an operational explanation, not a substitute for that policy.']],
      terms: ['About music and downloads', ['Create and listen without an account. Sign in to save songs and manage playlists. Official file downloads also require a qualifying rewarded ad.', 'Rewarded music downloads are not available until publisher eligibility and secure reward verification are in place. Playing a song does not create a download entitlement.', 'Published terms and music usage rights have not been connected yet. This page does not grant a commercial-use licence or promise exclusive rights.']],
      help: ['Find your sound. Keep it moving.', ['Describe your music on Create, then shape it with the available controls. Your creation appears in Creation activity while the music service works and the audio is prepared.', 'If you stop waiting, your creation continues on the server. Resume waiting follows the same request. Retry transfer only moves and prepares the existing generated files; it does not create another song.', 'Use a song’s menu to save it, add it to a playlist or check download availability. Press / to search, Space to play or pause outside an input, and Escape to close a panel.']]
    };
    const [title, paragraphs] = pages[key] || pages.help;
    modal(title, `<div class="connected-explanation">${paragraphs.map(notice).join('')}</div>`);
  }
  const resultDetails=(summary,assets)=>window.PMPResultPresentation.render(summary,assets);
  function renderJobs() {
    const main = $('#main'); if (!main || main.dataset.page === 'login') return;
    const jobs = Array.isArray(APP.jobs) ? APP.jobs : [];
    let panel = $('#connected-jobs');
    if (!panel) {
      panel = document.createElement('section'); panel.id = 'connected-jobs'; panel.className = 'connected-jobs';
      panel.setAttribute('aria-labelledby', 'connected-jobs-title');
      panel.innerHTML = `<header class="connected-jobs-heading"><div><p class="connected-eyebrow">Your music, in motion</p><h2 id="connected-jobs-title">Creation activity</h2></div><button type="button" class="text-button" data-action="connected-jobs-refresh">Refresh activity</button></header><p class="connected-jobs-live sr-only" role="status" aria-live="polite" aria-atomic="true"></p><div class="connected-job-list"></div>`;
      main.append(panel);
    }
    panel.hidden = !jobs.length;
    if (!jobs.length) return;
    const signature = JSON.stringify(jobs.map(job => [job.id, job.status, job.error, job.summary, job.assetsSummary, job.tracks?.map(track => track.id)]));
    if (signature === panel.dataset.signature) return;
    panel.dataset.signature = signature;
    const list = panel.querySelector('.connected-job-list'), existing = new Map([...list.children].map(row => [row.dataset.job, row]));
    const focus = document.activeElement;
    const focused = panel.contains(focus) && focus.dataset.action ? {action: focus.dataset.action, id: focus.dataset.id} : null;
    for (const job of jobs) {
      let row = existing.get(job.id);
      if (!row) { row = document.createElement('article'); row.className = 'connected-job'; row.dataset.job = job.id; }
      existing.delete(job.id);
      const copy = jobCopy[job.status] || ['Checking this creation', 'Refresh activity to see the latest state.'];
      const date = new Date(job.createdAt), validDate = Number.isFinite(date.getTime());
      const stamp = validDate ? date.toLocaleString('en', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'Creation record';
      const tracks = Array.isArray(job.tracks) ? job.tracks : [];
      const recovery=(job.creation?.children||[{job}]).map(child=>{
        const prefix=child.role?window.PMPResultPresentation.directionLabel(child.role)+' · ':'';
        return (child.job.canRetryStatus?action('connected-job-status-retry',prefix+'Check generation status',child.job.id):'')+(['partial','ingest_failed'].includes(child.job.status)?action('connected-job-retry',prefix+'Retry transfer',child.job.id):'');
      }).join('');
      row.dataset.status = job.status;
      row.innerHTML = `<div class="connected-job-top"><span class="connected-job-dot" aria-hidden="true"></span><div><h3>${esc(copy[0])}</h3>${validDate ? `<time datetime="${date.toISOString()}">${esc(stamp)}</time>` : `<small>${esc(stamp)}</small>`}</div><span class="connected-job-number">${esc(job.id.slice(0, 6))}</span></div><p class="connected-job-description">${esc(copy[1])}</p>${job.error?.message ? `<p class="connected-job-error">${esc(window.PMPResultPresentation.failureLines(job.error).join(' '))}</p>` : ''}${window.PMPResultPresentation.renderCreation(job)}${tracks.length ? `<div class="connected-job-takes">${tracks.map(track => `<button type="button" class="secondary" data-action="track" data-id="${esc(track.id)}">${icon('play')}<span>${esc(track.title || `Take ${track.take || ''}`)}</span></button>`).join('')}</div>` : ''}<div class="connected-actions">${action('workflow-create-open', 'View creation progress', job.id)}${activeStatuses.has(job.status) ? action('connected-job-resume', 'Resume waiting', job.id) : ''}${recovery}</div>`;
      list.append(row);
    }
    existing.forEach(row => row.remove());
    if (focused) [...panel.querySelectorAll('[data-action]')].find(button => button.dataset.action === focused.action && button.dataset.id === focused.id)?.focus({preventScroll: true});
    if (signature !== jobSignature) {
      jobSignature = signature;
      const running = jobs.filter(job => activeStatuses.has(job.status)).length;
      const attention = jobs.filter(job => ['failed', 'uncertain', 'partial', 'ingest_failed'].includes(job.status)).length;
      panel.querySelector('.connected-jobs-live').textContent = `${running} ${running === 1 ? 'creation is' : 'creations are'} in progress.${attention ? ` ${attention} ${attention === 1 ? 'creation needs' : 'creations need'} attention.` : ''}`;
    }
    window.PMPPlatform?.refresh();
  }
  function renderDiscovery() {
    const grid = $('#owned-discovery'); if (!grid) return;
    const tracks = state.songs.filter(track => track.owned).slice(0, 5);
    const signature = JSON.stringify(tracks.map(track => [track.id, track.title, track.art, track.origin]));
    if (grid.dataset.connectedCatalogue === signature) { P.syncSaved(); return; }
    grid.dataset.connectedCatalogue = signature;
    const focused = grid.contains(document.activeElement) ? {id: document.activeElement.dataset.id, action: document.activeElement.dataset.action} : null;
    grid.innerHTML = tracks.length ? tracks.map(track => P.card(track)).join('') : '<div class="empty-state full-row"><h3>Your next sound starts here.</h3><p>Create a song to bring the catalogue to life.</p><a href="index.html" data-route class="primary">Create a song</a></div>';
    P.syncSaved();
    if (focused) [...grid.querySelectorAll('[data-action]')].find(button => button.dataset.action === focused.action && button.dataset.id === focused.id)?.focus({preventScroll: true});
  }
  Object.assign(P.actions, {
    save: button => toggleSave(button.dataset.id, button),
    'save-current': button => state.current ? toggleSave(state.current.id, button) : P.toast('Choose a song to save.'),
    'new-playlist': () => playlistForm(), 'playlist-add': button => addToPlaylist(button.dataset.id),
    'playlist-open': button => playlistOpen(button.dataset.id), 'playlist-rename': button => playlistForm(button.dataset.id),
    'playlist-menu': button => playlistMenu(button.dataset.id), 'playlist-delete': button => deletePlaylist(button.dataset.id),
    'playlist-play': button => { if (!gate('play your playlists')) return; const item = playlist(button.dataset.id); if (item?.songs.some(id => P.song(id))) { P.closeDialog(); P.playCollection(item.songs); } else P.toast('Add an available song to this playlist first.'); },
    'play-saved': () => { if (gate('play your saved songs')) P.playCollection(state.saved.map(item => item.id)); },
    'connected-new-with-song': button => playlistForm(null, button.dataset.id),
    'connected-playlist-add': button => modifySongs(button, songs => [...new Set([...songs, button.dataset.song])], 'Song added to playlist.'),
    'connected-playlist-remove': button => modifySongs(button, songs => songs.filter(id => id !== button.dataset.song), 'Song removed from playlist.', true),
    'connected-playlist-move': button => modifySongs(button, songs => { const from = songs.indexOf(button.dataset.song), to = from + Number(button.dataset.offset); if (from >= 0 && to >= 0 && to < songs.length) [songs[from], songs[to]] = [songs[to], songs[from]]; return songs; }, 'Playlist order saved.', true),
    'connected-playlist-delete': button => operation(`playlist:${button.dataset.id}`, button, async () => { const version = modalVersion; if (refreshPromise) await refreshPromise; await APP.request(`/api/playlists/${idPath(button.dataset.id)}`, {method: 'DELETE', body: {}}); APP.playlists = APP.playlists.filter(item => item.id !== button.dataset.id); applyCollections(); if (sameModal(version)) P.closeDialog(); P.toast('Playlist deleted.'); }),
    'song-menu': button => songMenu(button.dataset.id), 'song-details': button => details(button.dataset.id),
    'connected-download': button => { if (ownedSong(button.dataset.id)) return operation(`download:${button.dataset.id}`, button, () => APP.download(button.dataset.id)); },
    'connected-room': button => { if(ownedSong(button.dataset.id))return operation('room-navigation',button,()=>APP.enterRoom(button.dataset.id)); },
    // "Open 3D" (bottom bar + expanded player): carries the song that is playing NOW into the beyond-edition
    // listening room through the same one-time server navigation handle used by the song menu, so the room
    // resumes that exact song. Local device files never enter the room (they are not in the service catalogue).
    'open-3d': button => {
      const current = P.state?.current;
      if (!current) { P.toast('Start a song, then open it in the 3D listening room.'); return; }
      if (ownedSong(current.id)) return operation('room-navigation', button, () => APP.enterRoom(current.id));
    },
    'connected-sign-in': button => operation('sign-in', button, () => APP.signIn()),
    'connected-account': (_button, event) => { event?.preventDefault(); account(); },
    'connected-sign-out': button => operation('sign-out', button, async () => { await APP.request('/api/auth/logout', {method: 'POST', body: {}}); APP.user = null; APP.saved = []; APP.playlists = []; applyCollections(); P.closeDialog(); location.assign('/login.html'); }),
    provider: () => gate('save songs and build playlists'), 'sign-up': () => gate('create your account'), 'reset-password': () => gate('manage your account'),
    legal: button => legal(button.dataset.key), 'connected-refresh': () => refreshCollections(),
    'connected-jobs-refresh': button => operation('jobs:refresh', button, async () => { await APP.refreshJobs(); await APP.refreshCatalog(); P.toast('Creation activity updated.'); }),
    'connected-job-resume': button => operation(`job:${button.dataset.id}`, button, () => APP.resume(button.dataset.id)),
    'connected-job-status-retry': button => operation(`job:${button.dataset.id}`,button,async()=>{const {job}=await APP.request(`/api/jobs/${idPath(button.dataset.id)}/retry-status`,{method:'POST',body:{}});await APP.refreshJobs();await window.PMPWorkflow.openCreate(job.creationId||job.id);P.toast('Checking the existing generation. No new music request was sent.');}),
    'connected-job-retry': button => operation(`job:${button.dataset.id}`,button,async()=>{const {job}=await APP.request(`/api/jobs/${idPath(button.dataset.id)}/retry-ingest`,{method:'POST',body:{}});await APP.refreshJobs();await window.PMPWorkflow.openCreate(job.creationId||job.id);P.toast('Retrying this direction’s saved audio transfer. Your current song keeps playing. No new generation was requested.');})
  });
  P.toggleSave = toggleSave;
  for (const key of ['library-tab', 'clear-library-search']) {
    const original = P.actions[key];
    P.actions[key] = (button, event) => { original(button, event); renderLibraryConnection(); };
  }
  P.onInput.push(element => { if (element.id === 'library-search') renderLibraryConnection(); });
  P.onChange.push(element => { if (element.id === 'library-sort') renderLibraryConnection(); });
  function renderConnection(){
    const composer=$('#composer');if(!composer)return;
    let notice=$('#creation-connection');
    if(APP.schemaAvailable&&APP.generationAvailable!==false){notice?.remove();return;}
    if(!notice){notice=document.createElement('div');notice.id='creation-connection';notice.className='notice creation-connection';notice.setAttribute('role','status');notice.innerHTML='<p>Music creation is temporarily unavailable. Your music brief is saved, and your existing songs can still play.</p><button type="button" class="secondary" data-action="connected-reconnect">Check connection</button>';composer.prepend(notice);}
  }
  P.actions['connected-reconnect']=()=>{P.saveDraft();location.reload();};
  const page = () => { renderIdentity(); renderLibraryConnection(); renderJobs(); renderDiscovery(); renderConnection(); };
  P.pageHooks.push(page);
  window.addEventListener('pmp:jobs', renderJobs);
  window.addEventListener('pmp:connection', renderConnection);
  window.addEventListener('pmp:saved', () => { state.saved = APP.saved; P.syncSaved(); P.renderLibrary(); });
  window.addEventListener('pmp:session', () => { state.session = APP.user; refreshCollections(); page(); });
  window.PMPConnected = Object.freeze({refreshCollections, renderJobs, renderIdentity});
  state.saved = []; state.playlists = []; state.session = APP.user;
  applyCollections(); page(); refreshCollections();
})();
