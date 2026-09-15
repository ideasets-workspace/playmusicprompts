/* Real listening-room host for the shared durable listening controller.
 * Call create only after the room has restored its actual selected track.
 * queue retains its current/past tracks; only the room knows its next target.
 */
(() => {
  'use strict';
  function create(options) {
    const factory = window.PMPListeningFactory, app = options?.app || window.PMP_APP;
    if (!factory || !options?.audio || !Array.isArray(options.queue) || !Array.isArray(options.available) ||
      ['getCurrent', 'hasNext', 'advance', 'renderQueue', 'persistQueue'].some(name => typeof options[name] !== 'function') || !options.statusHost?.append) {
      throw Error('The listening room is not ready to connect its session.');
    }
    const {queue, available, statusHost} = options;
    const section = document.createElement('section'); section.id = 'room-listening-session'; section.setAttribute('aria-labelledby', 'room-listening-heading');
    const heading = document.createElement('div'); heading.className = 'setting-heading';
    const title = document.createElement('h3'); title.id = 'room-listening-heading'; title.textContent = 'Keep it going';
    const label = document.createElement('label'); label.className = 'switch';
    const toggle = document.createElement('input'); toggle.type = 'checkbox'; toggle.id = 'room-listening-enabled'; toggle.setAttribute('aria-label', 'Keep creating music as I listen'); toggle.setAttribute('aria-describedby', 'room-listening-description');
    const mark = document.createElement('span'); mark.setAttribute('aria-hidden', 'true'); label.append(toggle, mark); heading.append(title, label);
    const description = document.createElement('p'); description.id = 'room-listening-description'; description.className = 'drawer-note';
    description.textContent = 'Create new songs as you listen. What you play and skip shapes the next one.';
    const status = document.createElement('p'); status.id = 'room-listening-status'; status.className = 'drawer-note'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const buttons = document.createElement('div'); buttons.className = 'queue-tools';
    const progress = document.createElement('a'); progress.className = 'secondary'; progress.textContent = 'View creation progress'; progress.target = '_blank'; progress.rel = 'noopener'; progress.setAttribute('aria-label', 'View creation progress (opens in a new tab)');
    const check = document.createElement('button'); check.type = 'button'; check.className = 'secondary'; check.textContent = 'Check session';
    const resume = document.createElement('button'); resume.type = 'button'; resume.className = 'secondary'; resume.textContent = 'Resume session';
    buttons.append(progress, check, resume); section.append(heading, description, status, buttons); statusHost.append(section);
    let actions;
    toggle.addEventListener('change', () => { void actions?.enable(toggle.checked); });
    check.addEventListener('click', () => { void actions?.check(); });
    resume.addEventListener('click', () => { void actions?.enable(true); });
    return factory.create({app, audio: options.audio, getCurrent: options.getCurrent, hasNext: options.hasNext, advance: options.advance,
      manualQueue:options.manualQueue,
      reorderPrepared(ids){const start=queue.findIndex(track=>track.id===options.getCurrent()?.id)+1;if(factory.reorderAutomatic(queue,ids,{idOf:track=>track.id,start})){options.renderQueue();options.persistQueue();}},
      notify: options.notify,
      getFallbackRequest: async () => {
        if (typeof options.getDraftRequest === 'function') return options.getDraftRequest();
        if (typeof app?.getDraftRequest === 'function') return app.getDraftRequest();
        throw Error('Open Create and choose the sound for this listening session. Your current song can keep playing.');
      },
      appendPrepared(tracks) {
        let changed = false;
        for (const incoming of tracks) {
          const track = factory.canonicalTrack(incoming); if (!track) continue;
          // A device upload is never replaced with a catalogue entry sharing
          // its ID. Genuine server tracks retain the real room object/order.
          if (queue.some(item => item.id === track.id && item.local) || available.some(item => item.id === track.id && item.local)) continue;
          let item = available.find(item => item.id === track.id);
          if (!item) { item = track; available.push(item); }
          if (!queue.some(queued => queued.id === item.id)) { queue.push(item); changed = true; }
        }
        if (changed) { options.renderQueue(); options.persistQueue(); }
      },
      renderStatus(model, commands) {
        actions = commands; toggle.checked = model.enabled;
        const message = model.message || 'Choose a song from the listening catalogue, then turn this on when you want new music.';
        if (status.textContent !== message) status.textContent = message;
        section.dataset.state = model.attention ? 'attention' : model.playing ? 'active' : 'paused';
        progress.hidden = !model.jobId;
        if (model.jobId) progress.href = `/index.html?job=${encodeURIComponent(model.jobId)}`; else progress.removeAttribute('href');
        check.hidden = !model.attention; resume.hidden = !model.canResume;
        buttons.hidden = progress.hidden && check.hidden && resume.hidden;
        options.onState?.(model);
      }});
  }
  window.PMPListeningRoom = Object.freeze({create});
})();
