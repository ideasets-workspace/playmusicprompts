import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const source = new URL('./player-three-store.js', import.meta.url);
const sourceText = readFileSync(source, 'utf8');
const {createRoomStore, ROOM_STORE_KEYS: keys} = await import(`data:text/javascript;base64,${Buffer.from(sourceText).toString('base64')}`);
const passed = [];
function check(name, run) { run(); passed.push(name); }
function adapter(seed = {}) {
  const values = new Map(Object.entries(structuredClone(seed)));
  const writes = [];
  let fail = false;
  let throwing = false;
  return {
    values, writes,
    get(key, fallback) { return values.has(key) ? structuredClone(values.get(key)) : fallback; },
    set(key, value) {
      if (throwing) throw new Error('Storage denied');
      if (fail) return false;
      writes.push({key, value: structuredClone(value)});
      values.set(key, structuredClone(value));
      return true;
    },
    fail(value) { fail = value; },
    throwWrites(value) { throwing = value; }
  };
}

check('Legacy migration separates preferences and session without modifying legacy', () => {
  const legacy = {model:'aurora',world:'glow',spin:false,rpm:21,autoOrbit:true,reactivity:1.4,form:'orbit',intensity:.9,motionPreference:'on',motion:false,quality:'high',volume:.6,order:['song'],current:'song',time:94,ignored:'not a preference'};
  const storage = adapter({'pmp.room':legacy});
  const store = createRoomStore(storage, 'A');
  const {order,current,time,ignored,...preferences} = legacy;
  assert.deepEqual(store.readPreferences(), preferences);
  assert.deepEqual(store.readSession(), {order,current,time,owner:null});
  assert.deepEqual(storage.get('pmp.room'), legacy);
  assert.equal(storage.writes.length, 2);
});

check('Empty migration keeps preference defaults absent and uses null session order', () => {
  const store = createRoomStore(adapter(), 'A');
  assert.deepEqual(store.readPreferences(), {});
  assert.deepEqual(store.readSession(), {order:null,current:null,time:0,owner:null});
});

check('Two tabs merge only changed preference fields into latest preferences', () => {
  const storage = adapter();
  const a = createRoomStore(storage, 'A'), b = createRoomStore(storage, 'B');
  assert.equal(a.savePreference('world', 'glow'), true);
  assert.equal(b.savePreference('volume', .4), true);
  assert.equal(a.savePreference('model', 'liquid'), true);
  assert.equal(b.savePreference('motionPreference', 'on'), true);
  assert.deepEqual(a.readPreferences(), {world:'glow',volume:.4,model:'liquid',motionPreference:'on'});
  assert.deepEqual(a.readSession(), {order:null,current:null,time:0,owner:null});
});

check('Stale empty pagehide cannot erase the owned song or position', () => {
  const storage = adapter();
  const a = createRoomStore(storage, 'A'), b = createRoomStore(storage, 'B');
  a.claimSession({order:['song'],current:'song',time:94});
  assert.equal(b.savePosition(null, 0), false);
  assert.equal(b.updateSession({order:[],current:null,time:0}), false);
  assert.deepEqual(a.readSession(), {order:['song'],current:'song',time:94,owner:'A'});
});

check('Explicit user takeover and clear retain current:null and empty queue', () => {
  const storage = adapter();
  const a = createRoomStore(storage, 'A'), b = createRoomStore(storage, 'B');
  a.claimSession({order:['song'],current:'song',time:94});
  assert.equal(b.claimSession({order:[],current:null,time:0}), true);
  assert.deepEqual(a.readSession(), {order:[],current:null,time:0,owner:'B'});
  assert.equal(a.savePosition('song', 100), false);
});

check('Automatic next song saves for owner and cannot reclaim after takeover', () => {
  const storage = adapter();
  const a = createRoomStore(storage, 'A'), b = createRoomStore(storage, 'B');
  a.claimSession({order:['one','two'],current:'one',time:94});
  assert.equal(a.updateSession({current:'two',time:0}), true);
  assert.deepEqual(a.readSession(), {order:['one','two'],current:'two',time:0,owner:'A'});
  b.claimSession({order:['other'],current:'other',time:3});
  assert.equal(a.updateSession({current:'one',time:0}), false);
  assert.deepEqual(a.readSession(), {order:['other'],current:'other',time:3,owner:'B'});
});

check('Position writes require both owner and the selected song', () => {
  const storage = adapter();
  const a = createRoomStore(storage, 'A'), b = createRoomStore(storage, 'B');
  a.claimSession({order:['one','two'],current:'two',time:3});
  assert.equal(b.savePosition('two', 42), false);
  assert.equal(a.savePosition('one', 42), false);
  assert.equal(a.savePosition('two', 42.25), true);
  assert.deepEqual(a.readSession(), {order:['one','two'],current:'two',time:42.25,owner:'A'});
});

check('Old legacy writers cannot affect v2 reads or a newly opened v2 tab', () => {
  const storage = adapter({'pmp.room':{world:'glow',motionPreference:'on',order:['song'],current:'song',time:94}});
  const a = createRoomStore(storage, 'A');
  a.claimSession({order:['song'],current:'song',time:98});
  storage.set('pmp.room', {world:'night',motionPreference:'system',order:[],time:0});
  const b = createRoomStore(storage, 'B');
  assert.deepEqual(b.readPreferences(), {world:'glow',motionPreference:'on'});
  assert.deepEqual(b.readSession(), {order:['song'],current:'song',time:98,owner:'A'});
  assert.equal(a.savePosition('song', 99), true);
  assert.equal(b.readSession().time, 99);
});

check('Existing v2 records are not migrated or overwritten on store creation', () => {
  const storage = adapter({[keys.preferences]:{world:'ember'},[keys.session]:{order:[],current:null,time:0,owner:'existing'},'pmp.room':{world:'night',order:['stale']}});
  const store = createRoomStore(storage, 'new');
  assert.deepEqual(store.readPreferences(), {world:'ember'});
  assert.deepEqual(store.readSession(), {order:[],current:null,time:0,owner:'existing'});
  assert.equal(storage.writes.length, 0);
});

check('Partial migration preserves the existing v2 record', () => {
  const storage = adapter({[keys.preferences]:{world:'ember'},'pmp.room':{world:'night',order:['song'],current:'song',time:5}});
  const store = createRoomStore(storage, 'A');
  assert.deepEqual(store.readPreferences(), {world:'ember'});
  assert.deepEqual(store.readSession(), {order:['song'],current:'song',time:5,owner:null});
  assert.deepEqual(storage.writes.map(write=>write.key), [keys.session]);
});

check('Returned session and preferences cannot mutate adapter data', () => {
  const storage = adapter({'pmp.room':{world:'glow',order:['song']}});
  const store = createRoomStore(storage, 'A');
  store.readSession().order.push('unpersisted');
  store.readPreferences().world = 'changed';
  assert.deepEqual(store.readSession().order, ['song']);
  assert.equal(store.readPreferences().world, 'glow');
});

check('Failed and thrown writes report false without granting ownership or changing saved values', () => {
  const storage = adapter();
  const a = createRoomStore(storage, 'A'), b = createRoomStore(storage, 'B');
  a.claimSession({order:['song'],current:'song',time:10});
  a.savePreference('world', 'glow');
  storage.fail(true);
  assert.equal(b.claimSession({order:[],current:null,time:0}), false);
  assert.equal(a.savePreference('world', 'night'), false);
  assert.equal(a.savePosition('song', 11), false);
  assert.equal(a.updateSession({current:null}), false);
  assert.deepEqual(b.readSession(), {order:['song'],current:'song',time:10,owner:'A'});
  assert.equal(b.readPreferences().world, 'glow');
  storage.throwWrites(true);
  assert.equal(b.claimSession({order:[],current:null,time:0}), false);
  assert.equal(a.savePreference('world', 'night'), false);
});

check('Failed migration retains only its initial snapshot and never reports a successful save', () => {
  const storage = adapter({'pmp.room':{world:'glow',order:['song'],current:'song',time:8}});
  storage.fail(true);
  const store = createRoomStore(storage, 'A');
  storage.values.set('pmp.room', {world:'night',order:[]});
  assert.equal(store.readPreferences().world, 'glow');
  assert.deepEqual(store.readSession(), {order:['song'],current:'song',time:8,owner:null});
  assert.equal(store.claimSession({order:['song'],current:'song',time:9}), false);
  assert.equal(store.savePosition('song', 10), false);
});

check('Preference API rejects playback keys and legacy-only motion writes', () => {
  const storage = adapter();
  const store = createRoomStore(storage, 'A');
  assert.equal(store.savePreference('order', []), false);
  assert.equal(store.savePreference('owner', 'B'), false);
  assert.equal(store.savePreference('motion', true), false);
  assert.deepEqual(store.readPreferences(), {});
});

check('Unknown existing v2 fields cannot enter a preference save', () => {
  const storage = adapter({[keys.preferences]:{world:'glow',order:['foreign'],owner:'foreign',unknown:{nested:'value'}}});
  const store = createRoomStore(storage, 'A');
  assert.deepEqual(store.readPreferences(), {world:'glow'});
  store.savePreference('volume', .5);
  assert.deepEqual(storage.get(keys.preferences), {world:'glow',volume:.5});
});

const report = {scope:'Exported storage module only; browser integration is not covered',source:'player-three-store.js',sourceSha256:createHash('sha256').update(sourceText).digest('hex'),passed:passed.length,checks:passed};
writeFileSync(new URL('./room-store-checks.json', import.meta.url), JSON.stringify(report, null, 2)+'\n');
console.log(JSON.stringify(report, null, 2));
