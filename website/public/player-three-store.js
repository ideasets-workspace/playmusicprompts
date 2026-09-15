export const ROOM_STORE_KEYS = Object.freeze({
  preferences: 'pmp.website.room.preferences.v2',
  session: 'pmp.website.room.session.v2'
});

const preferenceKeys = new Set([
  'model', 'world', 'spin', 'rpm', 'autoOrbit', 'reactivity', 'form',
  'intensity', 'motionPreference', 'quality', 'volume'
]);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const owns = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const copy = value => structuredClone(value);
const preferenceShape = value => {
  const preferences = {};
  for (const key of [...preferenceKeys, 'motion']) {
    if (owns(value, key)) preferences[key] = copy(value[key]);
  }
  return preferences;
};
const sessionShape = value => ({
  order: Array.isArray(value?.order) ? [...value.order] : null,
  current: value?.current ?? null,
  time: Number.isFinite(value?.time) ? value.time : 0,
  owner: value?.owner ?? null
});

// The adapter uses get(key, fallback) and set(key, value) -> boolean.
// Values are validated by the player; this layer controls write scope and ownership.
export function createRoomStore(storage, tabId) {
  if (typeof tabId !== 'string' || !tabId) throw new TypeError('A unique tab ID is required.');
  const read = key => {
    try { const value = storage.get(key, null); return record(value) ? value : null; }
    catch { return null; }
  };
  const write = (key, value) => {
    try { return storage.set(key, copy(value)) === true; }
    catch { return false; }
  };

  const storedPreferences = read(ROOM_STORE_KEYS.preferences);
  const storedSession = read(ROOM_STORE_KEYS.session);
  // Legacy is inspected only when a v2 record does not yet exist. Old pages can
  // keep writing pmp.website.room without changing either migrated v2 record.
  const legacy = !storedPreferences || !storedSession ? read('pmp.website.room') || {} : {};
  const initialPreferences = preferenceShape(storedPreferences || legacy);
  if (!storedPreferences) {
    write(ROOM_STORE_KEYS.preferences, initialPreferences);
  }
  const initialSession = sessionShape(storedSession || {...legacy, owner: null});
  if (!storedSession) write(ROOM_STORE_KEYS.session, initialSession);

  // The initial snapshot permits reading if browser storage is unavailable.
  // Failed writes never grant ownership or report a successful durable save.
  function readPreferences() {
    return preferenceShape(read(ROOM_STORE_KEYS.preferences) || initialPreferences);
  }
  function readSession() {
    return sessionShape(read(ROOM_STORE_KEYS.session) || initialSession);
  }
  function sessionPatch(value) {
    const patch = {};
    for (const key of ['order', 'current', 'time']) {
      if (owns(value, key) && value[key] !== undefined) patch[key] = copy(value[key]);
    }
    return patch;
  }

  return {
    readPreferences,
    readSession,
    savePreference(key, value) {
      if (!preferenceKeys.has(key)) return false;
      return write(ROOM_STORE_KEYS.preferences, {...readPreferences(), [key]: value});
    },
    claimSession(value) {
      return write(ROOM_STORE_KEYS.session, {
        ...readSession(), ...sessionPatch(value), owner: tabId
      });
    },
    updateSession(value) {
      const latest = readSession();
      if (latest.owner !== tabId) return false;
      return write(ROOM_STORE_KEYS.session, {...latest, ...sessionPatch(value)});
    },
    savePosition(currentId, time) {
      const latest = readSession();
      if (currentId == null || latest.owner !== tabId || latest.current !== currentId) return false;
      return write(ROOM_STORE_KEYS.session, {...latest, time});
    }
  };
}
