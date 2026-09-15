/* TV input adapter. Integration: attach({play,pause,toggle,next,previous,seek,
 * stop,back,getAudio,mode?}); seek receives a delta in seconds. back returns true
 * ONLY when the app handled Back, so native TV exit remains available at root.
 * refresh() after route changes; setMode('auto'|'tv'|'desktop') for explicit QA.
 * Events: pmp:platform-state {enabled,platform,registration}; pmp:platform-error
 * {action,message}; cancelable pmp:platform-back lets the app handle custom layers.
 * Official sources checked 2026-09-12:
 * https://developer.samsung.com/smarttv/develop/guides/user-interaction/remote-control.html
 * https://developer.samsung.com/smarttv/develop/api-references/tizen-web-device-api-references/tvinputdevice-api.html
 * https://webostv.developer.lge.com/develop/guides/magic-remote
 * Samsung media registration needs packaged-app tv.inputdevice privilege.
 * Magic Remote has no conventional media keys; all transport stays focusable.
 */
(function (global) {
  'use strict';
  const doc = global.document;
  const FOCUSABLE = 'a[href],button,summary,input:not([type="hidden"]),select,textarea,[tabindex],[contenteditable="true"],[role="button"]';
  const names = {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',Enter:'ok',Accept:'ok',Back:'back',BrowserBack:'back',Escape:'back',MediaPlay:'play',MediaPause:'pause',MediaPlayPause:'toggle',MediaStop:'stop',MediaRewind:'rewind',MediaFastForward:'forward',MediaTrackPrevious:'previous',MediaTrackNext:'next'};
  const codes = {13:'ok',37:'left',38:'up',39:'right',40:'down',10009:'back',461:'back',27:'back',415:'play',19:'pause',413:'stop',412:'rewind',417:'forward',10252:'toggle',10232:'previous',10233:'next'};
  const mediaNames = ['MediaPlay','MediaPause','MediaPlayPause','MediaStop','MediaRewind','MediaFastForward','MediaTrackPrevious','MediaTrackNext'];
  let adapter = {}, mode = 'auto', enabled = false, registered = [], registration = 'not-required';
  let installed = false, observer, scheduled = false, lastKey = '', lastAt = 0, held = new Set(), previousFocus = null, lastScope = null, backHandled = false;
  const dynamicCodes = {};
  function platform() {
    const ua = global.navigator?.userAgent || '';
    if (global.tizen?.tvinputdevice || /Tizen/i.test(ua)) return 'samsung';
    if (/web0s|webos|NetCast/i.test(ua)) return 'lg';
    if (/SmartTV|Smart-TV|HbbTV|Android.+TV/i.test(ua)) return 'tv';
    return 'desktop';
  }
  function emit(name, detail, cancelable = false) {
    return doc.dispatchEvent(new global.CustomEvent(name, {detail,cancelable}));
  }
  function command(event) { return dynamicCodes[event.keyCode] || names[event.key] || codes[event.keyCode || event.which] || null; }
  function visible(el) {
    if (!el || !el.isConnected || el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
    const style = global.getComputedStyle(el);
    return style.visibility !== 'hidden' && style.display !== 'none' && el.getClientRects().length > 0;
  }
  function focusables(root) {
    return [...root.querySelectorAll(FOCUSABLE)].filter(el => visible(el) && el.tabIndex >= 0);
  }
  function scope() {
    const layers = [...doc.querySelectorAll('dialog[open],[role="dialog"][aria-modal="true"]')].filter(visible);
    return layers[layers.length - 1] || doc.body;
  }
  function focus(el) {
    if (!el) return false;
    el.focus({preventScroll:true});
    el.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'auto'});
    return doc.activeElement === el;
  }
  // Beam overlap takes priority over diagonal proximity; candidates must actually
  // lie ahead of the current centre. Stable input order breaks geometrical ties.
  function directionalIndex(origin, rectangles, direction) {
    const horizontal = direction === 'left' || direction === 'right';
    const sign = direction === 'left' || direction === 'up' ? -1 : 1;
    const axis = r => horizontal ? (r.left + r.right) / 2 : (r.top + r.bottom) / 2;
    const cross = r => horizontal ? (r.top + r.bottom) / 2 : (r.left + r.right) / 2;
    let best = -1, bestScore = Infinity;
    rectangles.forEach((r, i) => {
      const forward = (axis(r) - axis(origin)) * sign;
      if (forward <= 1) return;
      const overlap = horizontal ? Math.min(origin.bottom,r.bottom) - Math.max(origin.top,r.top) : Math.min(origin.right,r.right) - Math.max(origin.left,r.left);
      const lateral = Math.abs(cross(r) - cross(origin));
      const score = (overlap > 0 ? 0 : 1e7) + forward * forward + 3 * lateral * lateral;
      if (score < bestScore) { bestScore = score; best = i; }
    });
    return best;
  }
  function editing(el) { return !!el?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'); }
  function refresh() {
    if (!enabled || !doc.body) return;
    const root = scope();
    if (lastScope !== root) {
      if (root !== doc.body && lastScope === doc.body) previousFocus = doc.activeElement;
      if (root === doc.body && previousFocus && visible(previousFocus)) focus(previousFocus);
      lastScope = root;
    }
    if (!root.contains(doc.activeElement) || !visible(doc.activeElement) || doc.activeElement === doc.body) {
      focus(focusables(root)[0]);
    }
  }
  function scheduleRefresh() {
    if (scheduled) return;
    scheduled = true;
    global.requestAnimationFrame(() => { scheduled = false; refresh(); });
  }
  function swallow(event) { event.preventDefault(); event.stopImmediatePropagation(); }
  function run(action, ...args) {
    try { Promise.resolve(adapter[action]?.(...args)).catch(() => emit('pmp:platform-error',{action,message:'This control could not finish. Try again.'})); }
    catch { emit('pmp:platform-error',{action,message:'This control is unavailable.'}); }
  }
  function onBack(event) {
    const active = doc.activeElement;
    if (editing(active)) { active.blur(); swallow(event); return; }
    const root = scope();
    if (root !== doc.body) {
      swallow(event);
      const close = root.querySelector('[data-action="close"],.close-panel,[data-platform-close]');
      if (close) close.click();
      else if (typeof root.close === 'function') root.close();
      else emit('pmp:platform-back',{scope:root},true);
      refresh(); return;
    }
    if (!emit('pmp:platform-back',{scope:root},true)) { swallow(event); return; }
    try { if (adapter.back?.() === true) swallow(event); }
    catch { emit('pmp:platform-error',{action:'back',message:'Navigation is unavailable.'}); }
    // Unhandled Back and Exit are left to the TV/browser, including long press.
  }
  function keydown(event) {
    if (!enabled || event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || event.isComposing) return;
    const action = command(event);
    if (!action) return;
    if (editing(event.target) && action !== 'back') return;
    const repeatable = ['left','right','up','down','rewind','forward'].includes(action);
    const now = Date.now();
    if (action==='back' && (event.repeat || held.has(action))) { if(backHandled) swallow(event); return; }
    if ((event.repeat || held.has(action)) && (!repeatable || (action === lastKey && now-lastAt < 110))) { swallow(event); return; }
    held.add(action); lastKey = action; lastAt = now;
    if (action === 'back') { onBack(event); backHandled=event.defaultPrevented===true; return; }
    if (['left','right','up','down'].includes(action)) {
      swallow(event); refresh();
      const root = scope(), current = doc.activeElement, list = focusables(root).filter(el => el !== current);
      if (!current || current === doc.body) { focus(list[0]); return; }
      const index = directionalIndex(current.getBoundingClientRect(),list.map(el=>el.getBoundingClientRect()),action);
      if (index >= 0) focus(list[index]);
      return;
    }
    if (action === 'ok') {
      const active = doc.activeElement;
      if (visible(active) && active.matches(FOCUSABLE)) {
        swallow(event);
        global.PMPAds?.userGesture(adapter.getAudio?.());
        active.click();
      }
      return;
    }
    if (!adapter[action] && !(['forward','rewind'].includes(action) && adapter.seek)) return;
    swallow(event);
    if (action === 'play' || action === 'toggle') global.PMPAds?.userGesture(adapter.getAudio?.());
    if (action === 'forward' || action === 'rewind') run('seek',action === 'forward' ? 10 : -10);
    else run(action);
  }
  function unregister() {
    const input = global.tizen?.tvinputdevice;
    for (const name of registered) { try { input?.unregisterKey(name); } catch { /* App lifecycle owns final cleanup. */ } }
    registered = [];
    Object.keys(dynamicCodes).forEach(k=>delete dynamicCodes[k]);
  }
  function register() {
    const input = global.tizen?.tvinputdevice;
    if (!input) { registration = platform() === 'samsung' ? 'packaged-api-unavailable' : 'not-required'; return; }
    try {
      const supported = input.getSupportedKeys();
      for (const key of supported) {
        if (!mediaNames.includes(key.name)) continue;
        try { input.registerKey(key.name); registered.push(key.name); dynamicCodes[key.code] = names[key.name]; }
        catch { registration = 'partial'; }
      }
      if (registration !== 'partial') registration = 'registered';
    } catch { registration = 'permission-unavailable'; }
  }
  function setMode(value = 'auto') {
    if (!['auto','tv','desktop'].includes(value)) throw new TypeError('Unknown input mode');
    mode = value; const next = mode === 'tv' || (mode === 'auto' && platform() !== 'desktop');
    if (next !== enabled) { unregister(); enabled = next; if (enabled) register(); }
    doc.documentElement.classList.toggle('pmp-tv',enabled);
    held.clear(); backHandled=false; lastScope = null; refresh();
    emit('pmp:platform-state',getState());
  }
  function getState() { return {enabled,mode,platform:platform(),registration}; }
  function attach(handlers = {}) {
    adapter = handlers;
    if (!installed) {
      doc.addEventListener('keydown',keydown,true);
      doc.addEventListener('keyup',event=>held.delete(command(event)),true);
      global.addEventListener('blur',()=>held.clear());
      doc.addEventListener('focusin',()=>{ if(enabled) scheduleRefresh(); });
      observer = new global.MutationObserver(scheduleRefresh);
      observer.observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open','inert','aria-hidden']});
      installed = true;
    }
    setMode(handlers.mode || global.PMP_APP?.config?.platform?.inputMode || 'auto');
    return () => { if (adapter === handlers) { adapter = {}; setMode('desktop'); } };
  }
  global.PMPPlatform = Object.freeze({attach,setMode,refresh,getState,directionalIndex,keyCommand:command});
})(window);
