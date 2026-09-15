// A device-derived value is not an explicit choice. Legacy `motion` booleans
// mixed the two, so only the new preference is authoritative when restoring.
export function motionPreference(prefs={}) {
  return ['system','on','off'].includes(prefs?.motionPreference)?prefs.motionPreference:'system';
}
export function motionEnabled(preference,reduced) {
  return preference==='on'||preference!=='off'&&!reduced;
}
