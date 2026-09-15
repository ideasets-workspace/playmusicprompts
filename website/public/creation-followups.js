/* Follow only creation groups this player explicitly accepted. This module
 * consumes already fetched job records; it never makes a network request or
 * starts music/generation. Records are scoped to this browser tab, not the room.
 */
(() => {
  'use strict';
  const key = 'pmp.website.creation-followups.v1', roles = ['faithful', 'neighbour', 'explore'];
  const id = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{8,160}$/.test(value);
  const trackId = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
  const copy = value => JSON.parse(JSON.stringify(value));
  function create(host) {
    if (!host?.storage || ['jobs', 'catalog', 'current', 'queue', 'register', 'append', 'remove', 'changed', 'notify'].some(name => typeof host[name] !== 'function')) throw Error('The creation queue needs its actual player.');
    let state = {version: 1, groups: [], order: []}, disposed = false, writable = true;
    const canonical = track => track?.owned === true && trackId(track.id) && id(track.creationId) && roles.includes(track.seedRole) && typeof track.title === 'string' && track.title.trim() && track.url === '/api/listen/' + track.id ? track : null;
    try {
      const saved = JSON.parse(host.storage.getItem(key) || 'null');
      if (saved?.version === 1 && Array.isArray(saved.groups) && saved.groups.length <= 200 && Array.isArray(saved.order)) {
        const seenGroups = new Set();
        state.groups = saved.groups.filter(group => group && id(group.id) && !seenGroups.has(group.id) && (seenGroups.add(group.id), true) && Number.isInteger(group.floor) && group.floor >= 0 && group.floor <= 2 && typeof group.active === 'boolean' && Array.isArray(group.seen) && group.seen.length <= 96 && group.seen.every(trackId)).map(group => ({id: group.id, floor: group.floor, active: group.active, seen: [...new Set(group.seen)]}));
        const known = new Set(state.groups.flatMap(group => group.seen));state.order = [...new Set(saved.order.filter(value => trackId(value) && known.has(value)))];
      }
    } catch { /* Damaged state cannot authorize following a creation. */ }
    // A saved queued ID still needs current server metadata before restoration.
    // Keep that pending receipt through a temporarily unavailable catalog.
    const pendingRestore = new Set(state.order);
    function forgetPending(values) { for (const value of values) pendingRestore.delete(value); }
    function save() {
      try { host.storage.setItem(key, JSON.stringify(state)); writable = true; return true; }
      catch { writable = false; host.notify('Your browser could not save this creation queue. Newly ready songs remain available in Creation activity.'); return false; }
    }
    function groupJob(groupId) {
      return host.jobs().find(job => job?.id === groupId && job.creation?.id === groupId && job.creation.mode === 'directed-three' && Array.isArray(job.tracks));
    }
    function actualTracks(groupId) { return (groupJob(groupId)?.tracks || []).filter(track => canonical(track) && track.creationId === groupId); }
    function knownTrack(value) {
      const candidate = [...host.jobs().flatMap(job => job.tracks || []), ...host.catalog()].find(track => track.id === value && canonical(track));
      return candidate || null;
    }
    function retire(group, selected) {
      const selectedRank = roles.indexOf(selected.seedRole);group.floor = Math.max(group.floor, selectedRank);
      const obsolete = actualTracks(group.id).filter(track => roles.indexOf(track.seedRole) < group.floor).map(track => track.id);
      for (const value of obsolete) if (!group.seen.includes(value)) group.seen.push(value);
      const automatic = new Set(state.order);host.remove(obsolete.filter(value => automatic.has(value)));
      state.order = state.order.filter(value => !obsolete.includes(value));forgetPending(obsolete);
    }
    function queueChanged() {
      if (disposed) return;
      const automatic = new Set(state.order);state.order = [...new Set([...host.queue().filter(value => automatic.has(value)), ...state.order.filter(value => pendingRestore.has(value))])];save();
    }
    function accept(result, {includePrimary = false} = {}) {
      if (disposed || !result.creationId) return null;
      const selected = canonical(result), job = selected && groupJob(selected.creationId);
      if (!job || !actualTracks(selected.creationId).some(track => track.id === selected.id)) throw Error('The creation’s verified track record is not available yet. Refresh Creation activity before adding its queue.');
      if (host.isLocal?.(selected.id)) throw Error('A device file already uses this track entry. Play the saved device file or choose a different creation.');
      let group = state.groups.find(item => item.id === selected.creationId);
      if (!group) {
        if (state.groups.length >= 200) throw Error('This tab’s creation queue history is full. Open a new tab to start another listening queue.');
        group = {id: selected.creationId, floor: 0, active: true, seen: []};state.groups.push(group);
      }
      group.active = true;retire(group, selected);
      if (!includePrimary) { if (!group.seen.includes(selected.id)) group.seen.push(selected.id);state.order = state.order.filter(value => value !== selected.id);forgetPending([selected.id]); }
      const available = new Map(actualTracks(group.id).map(track => [track.id, track])), added = [];
      for (const supplied of [...(includePrimary ? [selected] : []), ...(result.preparedTracks || [])]) {
        const track = available.get(supplied?.id);
        if (!track || !canonical(supplied) || roles.indexOf(track.seedRole) < group.floor || group.seen.includes(track.id) || track.id === host.current()?.id || host.isLocal?.(track.id)) continue;
        group.seen.push(track.id);state.order.push(track.id);added.push(track);
      }
      save();return added;
    }
    function selected(track, {queueAdvance = false} = {}) {
      if (disposed || !canonical(track)) return;
      const group = state.groups.find(item => item.id === track.creationId);if (!group) return;
      // Playing a user-chosen sibling supersedes earlier directions. Advancing
      // a reordered listening queue consumes only the actual selected song.
      if (!queueAdvance) retire(group, track);if (!group.seen.includes(track.id)) group.seen.push(track.id);
      state.order = state.order.filter(value => value !== track.id);forgetPending([track.id]);host.remove([track.id]);save();
    }
    function dismiss(values) {
      if (disposed) return;
      for (const group of state.groups) for (const value of values) if (actualTracks(group.id).some(track => track.id === value) && !group.seen.includes(value)) group.seen.push(value);
      state.order = state.order.filter(value => !values.includes(value));forgetPending(values);save();
    }
    function manual(values) { if (disposed) return;state.order = state.order.filter(value => !values.includes(value));forgetPending(values);save(); }
    function replaceQueue() {
      if (disposed) return;
      for (const group of state.groups) group.active = false;state.order = [];pendingRestore.clear();save();
    }
    function refresh({restore = false} = {}) {
      if (disposed || !writable) return;
      if (!restore) queueChanged();
      if (!writable) return;
      let changed = false;
      for (const value of [...pendingRestore]) {
        const track = knownTrack(value), group = track && state.groups.find(group => group.id === track.creationId);
        if (!track) continue;
        pendingRestore.delete(value);
        if (!group?.active || roles.indexOf(track.seedRole) < group.floor || value === host.current()?.id || host.isLocal?.(value)) { state.order = state.order.filter(id => id !== value);continue; }
        if (!host.queue().includes(value)) { host.register(track);host.append(value);changed = true; }
      }
      for (const group of state.groups) {
        if (!group.active) continue;
        for (const track of actualTracks(group.id)) {
          if (group.seen.includes(track.id)) continue;
          group.seen.push(track.id);
          if (roles.indexOf(track.seedRole) < group.floor || track.id === host.current()?.id || host.queue().includes(track.id)) continue;
          // Existing local tracks always win a collision with public metadata.
          if (host.isLocal?.(track.id)) continue;
          state.order.push(track.id);
          // Persist the receipt before touching the visible queue. A duplicate
          // update or reload cannot turn a delivered peer into another entry.
          if (!save()) return;
          host.register(track);host.append(track.id);changed = true;
        }
      }
      save();if (changed) host.changed();
    }
    return Object.freeze({accept, selected, dismiss, manual, replaceQueue, queueChanged, refresh, dispose() { disposed = true; }, getState: () => copy(state)});
  }
  window.PMPCreationFollowupsFactory = Object.freeze({create});
  const P = window.PMP, APP = window.PMP_APP;if (!P?.queueCreation || !APP) return;
  const followups = create({storage: sessionStorage, jobs: () => APP.jobs || [], catalog: () => APP.catalog || [], current: () => P.state.current, queue: () => P.state.queue,
    isLocal: value => P.song(value)?.local === true, register: track => P.registerTrack(track), append: value => P.state.queue.push(value), remove: values => { const removed = new Set(values);P.state.queue = P.state.queue.filter(value => !removed.has(value)); }, changed: () => P.updatePlayer(), notify: message => (APP.notify || P.toast)(message)});
  window.PMPCreationFollowups = followups;
  const refresh = () => followups.refresh(), dispose = () => { followups.queueChanged();window.removeEventListener('pmp:jobs', refresh);followups.dispose(); };
  window.addEventListener('pmp:jobs', refresh);window.addEventListener('pagehide', dispose, {once: true});
  followups.refresh({restore: true});
})();
