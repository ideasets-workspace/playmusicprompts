/* Tests for TrackTitleComposer and its wiring in Store (publish ordinals + legacy re-titling).
 * The prompts below are the real creator prompts found in .state/website.sqlite on 2026-09-15, so the
 * expectations document what the live catalogue now shows. Fixtures otherwise mirror store-output.test.mjs.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {Store} from '../server/store.mjs';
import {TrackTitleComposer} from '../server/track-title.mjs';
import {ADMISSION_CEILING} from '../server/admission-limits.mjs';

let sequence=0;
function job(store,payload={}){const n=++sequence;return store.admit({owner:'owner-'+n,ipKey:'ip-'+n,idem:'request-'+n,payload:{prompt:'Test fixture',...payload},limits:{daily:ADMISSION_CEILING,owner:ADMISSION_CEILING,ip:ADMISSION_CEILING}}).job;}
const asset=(kind,letter)=>({kind,id:letter.repeat(64),measured:true,codec:kind==='listening'?'mp3':'pcm_s24le',durationSeconds:30,sampleRate:48000,channels:2,size:3456,path:'PRIVATE_PATH'});
let takeSequence=0;
const take=(n=1)=>{const unique=(++takeSequence).toString(16).padStart(64,'0');return {take:n,id:unique,status:'ready',kind:'delivered-master',master:asset('master','a'),listening:asset('listening','b'),source:asset('source','c'),stems:[]};};

test('titles come from the creator\'s own prompt: first clause, openers and articles removed, title-cased, bounded', () => {
  const base = payload => TrackTitleComposer.baseTitle(payload);
  assert.deepEqual(base({prompt: 'A peaceful night drive.\nWarm \u201980s synths. No vocals.'}), {base: 'Peaceful Night Drive', source: 'prompt'});
  assert.deepEqual(base({prompt: 'make a music of happiness'}), {base: 'Happiness', source: 'prompt'});
  assert.deepEqual(base({prompt: 'Warm cinematic piano and cello, a gentle slow rise, no vocals.'}), {base: 'Warm Cinematic Piano and Cello', source: 'prompt'});
  assert.deepEqual(base({prompt: 'Warm acoustic folk ballad, gentle piano and guitar, intimate and hopeful.'}), {base: 'Warm Acoustic Folk Ballad', source: 'prompt'});
  // The adaptive policy's appended steering block is system text and never reaches the title.
  assert.equal(base({prompt: 'make a music of happiness\n\nNext-track direction:\nCreate a neighbouring interpretation'}).base, 'Happiness');
  // A long single clause is cut at a word boundary within 48 characters and never ends on a connective.
  const long = base({prompt: 'an endlessly unfolding modular synthesizer meditation for the last hour of the night and the first light'});
  assert.ok(long.base.length <= 48, long.base); assert.ok(!/ (and|of|for|the)$/i.test(long.base), long.base);
  assert.equal(long.base, 'Endlessly Unfolding Modular Synthesizer');
  // Acronyms keep their case; small words stay lower-case except at the edges.
  assert.equal(base({prompt: 'EDM anthem for the summer of love'}).base, 'EDM Anthem for the Summer of Love');
});

test('a typed Track title always wins; vocabulary and the honest untitled fallback cover empty prompts', () => {
  assert.deepEqual(TrackTitleComposer.baseTitle({project: {name: '  My <night> & its stars '}, prompt: 'ignored words'}), {base: 'My <night> & its stars', source: 'project'});
  assert.deepEqual(TrackTitleComposer.baseTitle({prompt: '...', moods: ['uplifting'], genres: ['cinematic'], eras: ['era_modifier_modern']}), {base: 'Uplifting Cinematic', source: 'vocabulary'});
  assert.deepEqual(TrackTitleComposer.baseTitle({prompt: '', creative_goal: 'calm_ambient_meditative'}), {base: 'Calm Ambient Meditative', source: 'vocabulary'});
  assert.deepEqual(TrackTitleComposer.baseTitle({prompt: '', eras: ['era_1980s']}), {base: '1980s', source: 'vocabulary'});
  assert.deepEqual(TrackTitleComposer.baseTitle({prompt: '!!'}), {base: 'Untitled Creation', source: 'untitled'});
  assert.deepEqual(TrackTitleComposer.baseTitle({}), {base: 'Untitled Creation', source: 'untitled'});
});

test('ordinals are roman numerals from the second same-titled creation on; take numbers only for multi-take deliveries', () => {
  assert.equal(TrackTitleComposer.titleFor({base: 'Night Drive', ordinal: 1, takeNumber: 1, multiple: false}), 'Night Drive');
  assert.equal(TrackTitleComposer.titleFor({base: 'Night Drive', ordinal: 2, takeNumber: 1, multiple: false}), 'Night Drive II');
  assert.equal(TrackTitleComposer.titleFor({base: 'Night Drive', ordinal: 4, takeNumber: 2, multiple: true}), 'Night Drive IV \u00b7 Take 2');
  assert.equal(TrackTitleComposer.ordinalSuffix(9), 'IX'); assert.equal(TrackTitleComposer.ordinalSuffix(14), 'XIV'); assert.equal(TrackTitleComposer.ordinalSuffix(1), '');
  assert.equal(TrackTitleComposer.isLegacyAutomaticTitle('Original b914d6 \u00b7 Take 1'), true);
  assert.equal(TrackTitleComposer.isLegacyAutomaticTitle('Peaceful Night Drive'), false);
});

test('Store.publish numbers same-titled creations in creation order and keeps a job\'s ordinal on republish', t => {
  const store=new Store(':memory:');t.after(()=>store.close());
  const first=job(store,{prompt:'A peaceful night drive.'});store.publish(first,{status:'ready',takes:[take()]});
  const second=job(store,{prompt:'A peaceful night drive.\n\nNext-track direction:\nExplore a more contrasting presence'});store.publish(second,{status:'ready',takes:[take()]});
  const other=job(store,{prompt:'make a music of happiness'});store.publish(other,{status:'ready',takes:[take()]});
  const third=job(store,{prompt:'a peaceful night drive'});store.publish(third,{status:'ready',takes:[take(1),take(2)]});
  assert.equal(store.publicJob(first).tracks[0].title,'Peaceful Night Drive');
  assert.equal(store.publicJob(second).tracks[0].title,'Peaceful Night Drive II');
  assert.equal(store.publicJob(other).tracks[0].title,'Happiness');
  assert.deepEqual(store.publicJob(third).tracks.map(x=>x.title),['Peaceful Night Drive III \u00b7 Take 1','Peaceful Night Drive III \u00b7 Take 2']);
  // Republishing the second job (e.g. after a transfer retry) must not renumber it.
  store.publish(second,{status:'ready',takes:[{...take(),id:store.publicJob(second).tracks[0].id}]});
  assert.equal(store.publicJob(second).tracks[0].title,'Peaceful Night Drive II');
  const stored=store.track(store.publicJob(first).tracks[0].id);
  assert.equal(stored.titleBase,'Peaceful Night Drive');assert.equal(stored.titleOrdinal,1);assert.equal(stored.titleSource,'prompt');
});

test('start-up re-titles only the pre-2026-09-15 automatic names, in creation order, and is idempotent', t => {
  const store=new Store(':memory:');t.after(()=>store.close());
  const legacy=[];
  for(const prompt of ['A peaceful night drive.','make a music of happiness','A peaceful night drive.\n\nNext-track direction:\nx']){
    const j=job(store,{prompt});store.publish(j,{status:'ready',takes:[take()]});legacy.push(j);
  }
  const named=job(store,{project:{name:'Kept As Typed'}});store.publish(named,{status:'ready',takes:[take()]});
  // Rewrite the stored rows into the exact pre-2026-09-15 shape (no titleBase, "Original <hex> · Take N").
  for(const j of legacy){
    const row=store.db.prepare('SELECT id,public FROM tracks WHERE job_id=?').get(j.id);const pub=JSON.parse(row.public);
    delete pub.titleBase;delete pub.titleOrdinal;delete pub.titleSource;pub.title=`Original ${j.id.slice(0,6)} \u00b7 Take 1`;
    store.db.prepare('UPDATE tracks SET public=? WHERE id=?').run(JSON.stringify(pub),row.id);
  }
  const untouched=store.db.prepare('SELECT public FROM tracks WHERE job_id=?').get(named.id).public;
  assert.equal(store.retitleLegacyTracks(),3);
  assert.deepEqual(legacy.map(j=>store.publicJob(j).tracks[0].title),['Peaceful Night Drive','Happiness','Peaceful Night Drive II']);
  assert.equal(store.db.prepare('SELECT public FROM tracks WHERE job_id=?').get(named.id).public,untouched);
  assert.equal(store.retitleLegacyTracks(),0);
});
