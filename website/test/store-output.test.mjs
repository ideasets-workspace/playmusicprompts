import test from 'node:test';
import assert from 'node:assert/strict';
import {Store} from '../server/store.mjs';
import {createJobs} from '../server/jobs.mjs';

// Explicit local fixtures for publishing metadata; not generated music.
let sequence=0;
function job(store,payload={}){const n=++sequence;return store.admit({owner:'owner-'+n,ipKey:'ip-'+n,idem:'request-'+n,payload:{prompt:'Test fixture',...payload},limits:{daily:1000,owner:100,ip:100}}).job;}
const asset=(kind,letter)=>({kind,id:letter.repeat(64),measured:true,codec:kind==='listening'?'mp3':'pcm_s24le',durationSeconds:30,sampleRate:48000,channels:2,size:3456,path:'PRIVATE_PATH'});
const take=(n=1)=>({take:n,id:String(n).repeat(64),status:'ready',kind:'delivered-master',master:asset('master','a'),listening:asset('listening','b'),source:asset('source','c'),stems:[]});
const flush=async worker=>{worker.wake();while(worker.running)await new Promise(resolve=>setImmediate(resolve));};

test('validated project name becomes exact single-take title; variations retain name plus take number',t=>{
  const store=new Store(':memory:');t.after(()=>store.close());
  const one=job(store,{project:{name:'My <night> & its stars'}});
  store.publish(one,{status:'ready',takes:[take()]});
  assert.equal(store.publicJob(one).tracks[0].title,'My <night> & its stars');
  store.updateJob(one.id,{status:'ready'});
  const many=job(store,{project:{name:'Many stars'},output_package:'variations'});
  store.publish(many,{status:'ready',takes:[take(2),take(3)]});
  assert.deepEqual(store.publicJob(many).tracks.map(t=>t.title),['Many stars · Take 2','Many stars · Take 3']);
  store.updateJob(many.id,{status:'ready'});
  const unnamed=job(store);store.publish(unnamed,{status:'ready',takes:[take(4)]});
  // Since 2026-09-15 an unnamed single-take creation is titled from its own prompt (here 'Test fixture'),
  // never from the job id; the take number is appended only when several takes were delivered.
  assert.equal(store.publicJob(unnamed).tracks[0].title,'Test Fixture');
});

test('source-only take and named stem states persist safely beside public playable tracks',t=>{
  const store=new Store(':memory:');t.after(()=>store.close());
  const admitted=job(store,{stems:['drums']});
  const current=store.updateJob(admitted.id,{result:{success:true,tracks:[{take:1,kind:'delivered master'}]}});
  const first=take();first.stems=[{name:'drums',upstream:{state:'REFUSED_LICENCE',origin:'separated',reason:'PRIVATE_REASON'}}];
  store.publish(current,{jobId:current.id,status:'partial',takes:[first,{take:2,id:'2'.repeat(64),status:'failed',kind:'raw',source:asset('source','d'),stems:[]}]});
  const pub=store.publicJob(current);
  assert.equal(pub.tracks.length,1);assert.equal(pub.assetsSummary.takes.length,2);
  assert.equal(pub.assetsSummary.takes[1].source.owned,true);assert.equal(pub.assetsSummary.takes[1].master.owned,false);
  assert.equal(pub.assetsSummary.takes[0].stems[0].state,'REFUSED_LICENCE');assert.ok(!JSON.stringify(pub).includes('PRIVATE_'));
  assert.throws(()=>store.recordMediaSummary(current,{jobId:'someone-else',takes:[]}),/another job/);
});

test('older ready jobs backfill from local manifests without a paid request or media ingest',async t=>{
  const store=new Store(':memory:');t.after(()=>store.close());
  const admitted=job(store);const current=store.updateJob(admitted.id,{status:'ready',result:{success:true}});
  assert.equal(store.publicJob(current).assetsSummary,null);let reads=0;
  const worker=createJobs({store,engine:{submit(){assert.fail('No generation');},job(){assert.fail('No upstream poll');}},media:{
    async read(id){reads++;assert.equal(id,current.id);return {jobId:id,status:'ready',takes:[take()]};},ingest(){assert.fail('No transfer or transcode');}}});
  t.after(()=>worker.stop());await flush(worker);await flush(worker);
  assert.equal(reads,1);assert.equal(store.publicJob(store.job(current.id)).assetsSummary.takes[0].master.owned,true);
  assert.equal(store.job(current.id).result,current.result);assert.equal(store.job(current.id).status,'ready');
});

test('fresh generation summary uses the final result, not the earlier queued envelope',async t=>{
  const store=new Store(':memory:');t.after(()=>store.close());
  const admitted=job(store);const current=store.updateJob(admitted.id,{status:'pending',upstreamId:'existing-job',result:{success:true,status:'queued'}});
  const delivery={success:true,tracks:[{take:1,kind:'delivered master'}],render_plan:{stages:{stems:{requested:['music'],stems:{music:{state:'NOT_AVAILABLE',origin:'separated'}}}}}};
  const worker=createJobs({store,engine:{async job(){return {success:true,status:'complete',response:delivery};}},media:{async ingest(){return {status:'ready',takes:[take()]};}}});
  t.after(()=>worker.stop());await flush(worker);
  const stem=store.publicJob(store.job(current.id)).assetsSummary.takes[0].stems[0];
  assert.equal(stem.name,'music');assert.equal(stem.requested,true);assert.equal(stem.state,'NOT_AVAILABLE');
});
