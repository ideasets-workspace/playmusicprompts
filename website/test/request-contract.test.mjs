import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {projectControlsSchema,validateRequest} from '../server/validation.mjs';

const read=name=>readFileSync(new URL('../public/'+name,import.meta.url),'utf8');
const source=read('request-contract.js'),controls=read('controls.js');
const caps=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json',import.meta.url),'utf8'));
const candidate=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/parameter-gap-audit.json',import.meta.url),'utf8')).dry_run_candidate.payload;
const clone=value=>JSON.parse(JSON.stringify(value));
function room(schema=projectControlsSchema(caps)){
  // There is deliberately no PMP player, document, DOM or storage dependency.
  const context=vm.createContext({window:{},URL});vm.runInContext(source,context);
  return {context,factory:context.window.PMPRequestContract,contract:context.window.PMPRequestContract.create(clone(schema))};
}

test('shared request contract loads without a player or DOM and exposes the complete pure interface',()=>{
  const h=room();assert.equal(h.context.window.PMP,undefined);assert.equal(h.context.document,undefined);
  assert.deepEqual(Object.keys(h.contract).sort(),['active','blockedOption','label','payload','unavailable','validateNode']);
  assert.ok(Object.isFrozen(h.factory));assert.ok(Object.isFrozen(h.contract));
  for(const invalid of [null,{}, {parameters:[]}])assert.throws(()=>h.factory.create(invalid),/not available/);
});

test('main controls bind directly to factory functions instead of retaining a second serializer or label implementation',()=>{
  const schema=projectControlsSchema(caps),h=room(schema),created=[];
  // A load-only main-module collaborator; no fake player is installed in the
  // room context. Actual editor behavior remains covered by controls-contract.
  const window={PMP:{},PMP_SCHEMA:clone(schema),PMPRequestContract:{create(s){const api=h.factory.create(s);created.push(api);return api;}}};
  const context=vm.createContext({window});vm.runInContext(controls,context);
  assert.equal(created.length,1);assert.equal(window.PMPControls.payload,created[0].payload);assert.equal(window.PMPControls.label,created[0].label);
  for(const name of ['payload','validateNode','active','label','blockedOption','unavailable'])assert.doesNotMatch(controls,new RegExp('function\\s+'+name+'\\s*\\('));
  assert.doesNotMatch(controls,/const LABELS=/);
});

test('room native draft preserves all100 request fields exactly and agrees with the server contract',()=>{
  const schema=projectControlsSchema(caps,{webhookUrl:candidate.webhook_url}),h=room(schema),draft={...clone(candidate),_scene:'Saved scene',_quickLines:{scene:'Saved descriptive line'}};
  const before=clone(draft),request=clone(h.contract.payload(draft));assert.deepEqual(draft,before);
  assert.equal(Object.keys(request).length,100);assert.deepEqual(request,candidate);
  assert.deepEqual(validateRequest(request,caps,{webhookUrl:candidate.webhook_url}),candidate);
});

test('room serialization preserves nested false, empty collections, labels and exact Unicode while stripping only known UI metadata',()=>{
  const h=room(),selected={prompt:'  Exact words.\n星空 🎵  ',genres:[],mood_orbit:{axes:{}},energy_curve:{points:[]},
    labels:{'':'',' line\nbreak ':'Value, punctuation\nand spaces '},prompt_enhance:{enabled:false},normalize_output:false,async:false,capabilities:false,
    vocal:{mode:'female',language:'en'},lyrics:{mode:'custom',text:'My exact lyrics\n🎵',verify:false},duration:{target_seconds:30,tolerance_seconds:0,on_miss:'accept'}};
  const draft={...clone(selected),_scene:'Night',_quickLines:{scene:'Earlier scene text'}};
  assert.deepEqual(clone(h.contract.payload(draft)),selected);assert.deepEqual(validateRequest(selected,caps),selected);
  const a=h.contract.payload(draft),b=h.contract.payload(draft);a.lyrics.text='Changed copy';assert.equal(b.lyrics.text,selected.lyrics.text);assert.equal(draft.lyrics.text,selected.lyrics.text);
  assert.deepEqual(clone(h.contract.payload({prompt:'Music',loop_ready:false,normalize_output:false})),{prompt:'Music',normalize_output:false});
});

test('room rejects old template metadata and malformed/inactive settings instead of guessing a weaker fallback request',()=>{
  const h=room();
  for(const old of [{prompt:'Old brief',genre:'Jazz'},{prompt:'Old brief',mood:'Calm'},{prompt:'Old brief',duration:30},{prompt:'Old brief',advanced:{bpm:120}},{prompt:'Old brief',_oldTemplate:true}])assert.throws(()=>h.contract.payload(old));
  const invalid=[
    [{prompt:'Music',variation_count:3},'variation_count'],
    [{prompt:'Music',vocal:{mode:'female'},lyrics:{mode:'ai_write',text:'Inactive words'}},'lyrics.text'],
    [{prompt:'Music',references:[{kind:'midi'}]},'references[0].kind'],
    [{prompt:'Music',webhook_url:'https://example.invalid/callback'},'webhook_url'],
    [{prompt:'Music',normalize_output:'false'},'normalize_output'],
    [{prompt:'Music',project:{track_id:'forged'}},'project.track_id'],
  ];
  for(const [draft,path]of invalid)assert.throws(()=>h.contract.payload(draft),error=>error.path===path);
  assert.throws(()=>h.contract.payload(JSON.parse('{"prompt":"Music","labels":{"__proto__":"bad"}}')),/cannot be used/);
});

test('room shared conditions, availability and wording preserve indexed references and schema defaults',()=>{
  const schema=projectControlsSchema(caps),h=room(schema),reference=schema.parameters.find(n=>n.key==='references'),kind=reference.items.fields.find(n=>n.key==='kind');
  const draft={references:[{kind:'descriptor',text:'Piano'},{kind:'midi'}]};
  assert.equal(h.contract.active({path:'references[].kind',equals:'descriptor'},draft,'references[0].text'),true);
  assert.equal(h.contract.active({path:'references[].kind',equals:'descriptor'},draft,'references[1].text'),false);
  assert.equal(h.contract.blockedOption(kind,'descriptor'),false);assert.equal(h.contract.blockedOption(kind,'midi'),true);
  assert.equal(h.contract.unavailable(schema.parameters.find(n=>n.key==='webhook_url')),true);
  assert.equal(h.contract.label(schema.parameters.find(n=>n.key==='duration')),'Duration');
  assert.equal(h.contract.label(schema.parameters.find(n=>n.key==='vocal')),'Vocals');
  assert.equal(h.contract.active({path:'vocal.mode',equals:'instrumental'},{},'lyrics.text'),true);
});

test('room honors the same Unicode cap, preview mode, lyrics/voice and short-model refusal rules',()=>{
  const h=room(),limit='🎵'.repeat(5000);assert.equal(h.contract.payload({prompt:limit}).prompt,limit);
  assert.throws(()=>h.contract.payload({prompt:limit+'🎵'}),/5000 characters/);
  assert.deepEqual(clone(h.contract.payload({capabilities:true,prompt:''})),{capabilities:true});
  assert.throws(()=>h.contract.payload({prompt:'Music',vocal:{mode:'instrumental'},lyrics:{mode:'custom',text:'Words'}}),/Choose a voice/);
  assert.throws(()=>h.contract.payload({prompt:'Music',route:'lyria-3-clip-preview',duration:{target_seconds:31}}),/30 seconds/);
});
