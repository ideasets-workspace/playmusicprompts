import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const a=source.indexOf('function reconcileDraft('),b=source.indexOf('\nfunction draftVersion',a);
const reconcile=vm.runInNewContext('('+source.slice(a,b)+')');
const clone=v=>JSON.parse(JSON.stringify(v));
test('stale tab keeps newer remote prompt when only an unrelated setting changed locally',()=>{
 const base={prompt:'Original',tempo_bpm:100,lyrics:{mode:'custom',text:'Original words'}};
 const local={...base,tempo_bpm:110},remote={...base,prompt:'New writing'};
 assert.deepEqual(clone(reconcile(base,local,remote)),{...remote,tempo_bpm:110});
});
test('conflicting description edits cannot silently overwrite the latest tab or be sent',()=>{
 assert.throws(()=>reconcile({prompt:'Base'},{prompt:'Stale tab edit'},{prompt:'Latest writing'}),/changed in another tab/);
});
test('new tab removals and explicit false survive draft reconciliation',()=>{
 const base={prompt:'Music',lyrics:{mode:'custom',text:'Old lyrics'},async:true};
 assert.deepEqual(clone(reconcile(base,base,{prompt:'Music',async:false})),{prompt:'Music',async:false});
 assert.deepEqual(clone(reconcile(base,{prompt:'Music',async:false},base)),{prompt:'Music',async:false});
});
test('conflicting nested lyrics are rejected as one coherent user setting',()=>{
 assert.throws(()=>reconcile({lyrics:{mode:'none'}},{lyrics:{mode:'custom',text:'A'}},{lyrics:{mode:'custom',text:'B'}}),/lyrics changed/);
});
