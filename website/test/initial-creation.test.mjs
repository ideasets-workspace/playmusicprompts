import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {Store,sha,stable} from '../server/store.mjs';
import {createInitialCreation} from '../server/initial-creation.mjs';
import {createJobs} from '../server/jobs.mjs';

// Real SQLite admission, policy and worker integration; upstream replies and
// owned-media metadata below are explicit test fixtures. No live music calls.
const caps=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json',import.meta.url),'utf8'));
const candidate=JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/parameter-gap-audit.json',import.meta.url),'utf8')).dry_run_candidate.payload;
const clone=value=>JSON.parse(JSON.stringify(value));
const selected={prompt:'Hopeful piano. 星空',vocal:{mode:'instrumental'},duration:{target_seconds:30},prompt_enhance:{enabled:false},normalize_output:false};
const owner='guest:initial-fixture',ipKey='initial-fixture-ip',idem='initial-fixture-request';
const limits={daily:100,owner:100,ip:100};
function fixture(t,{capabilities=caps,webhookUrl=null,...limitsOverride}={}){
  const store=new Store(':memory:');t.after(()=>store.close());
  const config={dailyAdmissionLimit:100,guestDailyLimit:100,ipDailyLimit:100,webhookUrl,...limitsOverride};
  const initial=createInitialCreation({store,capabilities:async()=>capabilities,config});
  return {store,initial,admit:(payload=clone(selected),extra={})=>initial.admit({owner,ipKey,idem,payload,...extra}),
    count:table=>store.db.prepare('SELECT count(*) AS n FROM '+table).get().n};
}
const wireOf=job=>JSON.parse(job.payload);

test('initial creation: omitted outputs atomically reserve faithful, neighbour and explore with exact selected fields',async t=>{
  const f=fixture(t),input=clone(selected),before=clone(input),a=await f.admit(input);
  assert.equal(a.existing,false);assert.equal(a.job.status,'queued');assert.equal(f.count('jobs'),3);assert.equal(f.count('generation_intents'),3);
  assert.deepEqual(input,before);assert.deepEqual(wireOf(a.job),{...selected,async:true});
  const group=f.store.creationGroup(a.job.id);assert.deepEqual(group.children.map(child=>child.role),['faithful','neighbour','explore']);
  const prompts=group.children.map(child=>wireOf(child).prompt);assert.equal(new Set(prompts).size,3);assert.equal(prompts[0],selected.prompt);assert.match(prompts[1],/neighbouring/);assert.match(prompts[2],/contrasting/);
  for(const child of group.children){const {prompt,...settings}=wireOf(child),{prompt:original,...expected}=selected;assert.deepEqual(settings,{...expected,async:true});assert.deepEqual(f.store.generationIntent(child.id).request,{...selected,async:true});}
  const intent=f.store.generationIntent(a.job.id);assert.deepEqual(intent.request,{...selected,async:true});
  assert.deepEqual(intent.policy,{version:2,mode:'directed-three',defaultApplied:true,requestedTakes:3,role:'faithful'});
  const b=await f.admit();assert.equal(b.existing,true);assert.equal(b.job.id,a.job.id);
  assert.equal(f.store.db.prepare("SELECT count FROM counters WHERE key LIKE 'generation:global:%'").get().count,3);
  assert.equal(f.store.db.prepare("SELECT count FROM counters WHERE key LIKE 'generation:minute:%'").get().count,1);
  assert.equal(f.store.jobs(owner).length,1,'The UI list has one aggregate creation, not three duplicate activities.');
  assert.equal(a.job.fingerprint,sha(stable(wireOf(a.job))),'The existing fingerprint remains the actual wire hash for worker recovery.');
});

test('initial creation: explicit single, stems and two/four takes are preserved exactly',async t=>{
  const options=[
    [{output_package:'single_track'},1],
    [{output_package:'stems_bundle'},1],
    [{output_package:'variations',variation_count:2},2],
    [{output_package:'variations',variation_count:4},4],
    [{output_package:'variations'},2],
  ];
  for(const [fields,count] of options){
    const f=fixture(t),payload={...clone(selected),...fields,async:false},a=await f.admit(payload);
    assert.deepEqual(wireOf(a.job),payload);assert.deepEqual(f.store.generationIntent(a.job.id).request,payload);
    assert.deepEqual(f.store.generationIntent(a.job.id).policy,{version:1,mode:'selected-output',defaultApplied:false,requestedTakes:count});
  }
});

test('initial creation: every selected API field, nested false, custom text and explicit async:false survives unchanged',async t=>{
  const payload={...clone(candidate),dry_run:false,capabilities:false,async:false};
  const f=fixture(t,{webhookUrl:payload.webhook_url}),a=await f.admit(payload);
  assert.equal(Object.keys(payload).length,100);assert.deepEqual(wireOf(a.job),payload);
  assert.deepEqual(f.store.generationIntent(a.job.id).request,payload);assert.deepEqual(f.store.publicJob(a.job).workflow.request,payload);
  assert.deepEqual(f.store.publicJob(a.job).workflow.intentRequest,payload);assert.equal(f.count('jobs'),1);
});

test('initial creation: preview and invalid schema cannot reserve a job or quota',async t=>{
  const f=fixture(t);
  for(const payload of [{...selected,dry_run:true},{...selected,capabilities:true}])await assert.rejects(f.admit(payload),{status:400,code:'CONTROL_MODE_UNSUPPORTED'});
  for(const payload of [{prompt:''},{...selected,unknown:true},{...selected,variation_count:5}])await assert.rejects(f.admit(payload),{status:400,code:'INVALID_REQUEST'});
  for(const fields of [{variation_count:4},{output_package:'single_track',variation_count:4}])await assert.rejects(f.admit({...selected,...fields}),error=>error.issues?.some(issue=>issue.path==='variation_count'&&issue.code==='INACTIVE_FIELD'));
  await assert.rejects(f.admit(selected,{idem:'bad'}),{status:400,code:'IDEMPOTENCY_REQUIRED'});
  assert.equal(f.count('jobs'),0);assert.equal(f.count('generation_intents'),0);assert.equal(f.count('counters'),0);
});

test('initial creation: the actual default is revalidated against capabilities before any admission',async t=>{
  const contract=clone(caps);contract.parameters.find(x=>x.name==='output_package').default.value='variations';
  const f=fixture(t,{capabilities:contract});await assert.rejects(f.admit(),{status:503,code:'INITIAL_OUTPUT_CONTRACT_CHANGED'});
  assert.equal(f.count('jobs'),0);assert.equal(f.count('generation_intents'),0);assert.equal(f.count('counters'),0);
});

test('initial creation: a failed intent write rolls back job and every quota mutation, then the same request can succeed',async t=>{
  const f=fixture(t);
  f.store.db.exec("CREATE TRIGGER deny_initial_intent BEFORE INSERT ON generation_intents WHEN json_extract(NEW.policy,'$.role')='explore' BEGIN SELECT RAISE(ABORT,'Explicit fixture storage failure'); END;");
  await assert.rejects(f.admit(),/Explicit fixture storage failure/);
  for(const table of ['jobs','generation_intents','creation_groups','creation_children','counters'])assert.equal(f.count(table),0,table);
  f.store.db.exec('DROP TRIGGER deny_initial_intent');const a=await f.admit();assert.equal(a.job.status,'queued');assert.equal(f.count('jobs'),3);
  assert.equal(f.count('generation_intents'),3);assert.equal(f.store.db.prepare("SELECT count FROM counters WHERE key LIKE 'generation:global:%'").get().count,3);
});

test('initial creation: identical wire cannot alias different selected intent, changed policy, or the exact API route',async t=>{
  const f=fixture(t),a=await f.admit(),wire=wireOf(a.job),intent=f.store.generationIntent(a.job.id);
  await assert.rejects(f.admit({...selected,output_package:'variations',variation_count:3}),{status:409,code:'IDEMPOTENCY_CONFLICT'});
  assert.throws(()=>f.store.admit({owner,ipKey,idem,payload:wire,limits}),{status:409,code:'IDEMPOTENCY_CONFLICT'});
  assert.throws(()=>f.store.admit({owner,ipKey,idem,payload:wire,limits,generationIntent:{...intent,policy:{...intent.policy,requestedTakes:2}}}),{status:409,code:'IDEMPOTENCY_CONFLICT'});
  assert.deepEqual(f.store.generationIntent(a.job.id),intent);assert.equal(f.count('jobs'),3);
  const direct=fixture(t);direct.store.admit({owner,ipKey,idem,payload:wire,limits});
  await assert.rejects(direct.admit(),{status:409,code:'IDEMPOTENCY_CONFLICT'});assert.equal(direct.count('generation_intents'),0);
});

test('initial creation: exact API Store admissions remain unchanged without an initial policy',t=>{
  const f=fixture(t),payload={...selected,async:false};const a=f.store.admit({owner,ipKey,idem,payload,limits});
  assert.deepEqual(wireOf(a.job),payload);assert.equal(f.store.generationIntent(a.job.id),null);
  const visible=f.store.publicJob(a.job);assert.ok(!Object.hasOwn(visible.workflow,'intentRequest'));assert.ok(!Object.hasOwn(visible.workflow,'initialPolicy'));
  assert.equal(f.store.admit({owner,ipKey,idem,payload,limits}).existing,true);
});

test('initial creation: an identical pre-upgrade default-three receipt resumes its original native job without directed replacements',async t=>{
  const f=fixture(t),request={...selected,async:true},payload={...request,output_package:'variations',variation_count:3};
  const original=f.store.admit({owner,ipKey,idem,payload,limits,generationIntent:{request,policy:{version:1,mode:'default-three',defaultApplied:true,requestedTakes:3}}});
  const resumed=await f.admit();assert.equal(resumed.existing,true);assert.equal(resumed.job.id,original.job.id);assert.equal(f.count('jobs'),1);assert.equal(f.count('creation_groups'),0);assert.deepEqual(wireOf(resumed.job),payload);
  assert.equal(f.store.publicJob(resumed.job).workflow.initialPolicy.mode,'default-three');assert.equal(f.store.db.prepare("SELECT count FROM counters WHERE key LIKE 'generation:global:%'").get().count,1);
  await assert.rejects(f.admit({...selected,normalize_output:true}),{code:'IDEMPOTENCY_CONFLICT'});
});

test('initial creation: owner scoping and public projections do not expose private metadata or arbitrary policy fields',async t=>{
  const f=fixture(t),a=await f.admit(),b=await f.admit({...selected,output_package:'single_track'},{owner:'guest:other-fixture',ipKey:'other-fixture-ip'});
  assert.notEqual(a.job.id,b.job.id);assert.throws(()=>f.store.ownJob(a.job.id,'guest:other-fixture'),{status:404});
  const intent=f.store.generationIntent(a.job.id),marker='PRIVATE_INITIAL_FIXTURE';
  f.store.updateJob(a.job.id,{result:{success:true,auth:{token:marker},prompt_sent:marker,delivery_url:'https://private.fixture.invalid/'+marker}});
  f.store.db.prepare('UPDATE generation_intents SET request=?,policy=? WHERE job_id=?').run(JSON.stringify({...intent.request,arbitrary_secret:marker}),JSON.stringify({...intent.policy,raw_response:marker}),a.job.id);
  const visible=f.store.publicJob(f.store.ownJob(a.job.id,owner));
  assert.deepEqual(visible.workflow.intentRequest,intent.request);assert.deepEqual(visible.workflow.initialPolicy,intent.policy);
  assert.deepEqual(visible.workflow.request,wireOf(a.job));assert.ok(!JSON.stringify(visible).includes(marker));
  assert.equal(f.store.jobs('guest:other-fixture').length,1);
});

test('initial creation: three ordered child POSTs are each sent once, with repeated worker wakes reusing saved admissions',async t=>{
  const f=fixture(t),a=await f.admit(),submissions=[];
  const jobs=createJobs({store:f.store,engine:{async submit(payload){submissions.push(clone(payload));return {success:true,status:'queued',job_id:'fixture-initial-upstream-'+submissions.length};},async job(){return {success:true,status:'processing'};}},media:{async ingest(){assert.fail('No fixture media was returned.');}}});
  // Stop before the Store's earlier cleanup callback closes SQLite.
  try{
    jobs.start();while(jobs.running)await new Promise(resolve=>setImmediate(resolve));
    jobs.wake();while(jobs.running)await new Promise(resolve=>setImmediate(resolve));
    assert.equal(submissions.length,3);assert.deepEqual(submissions,f.store.creationGroup(a.job.id).children.map(wireOf));assert.equal(f.count('jobs'),3);
    assert.equal(f.store.job(a.job.id).status,'pending');
  }finally{jobs.stop();}
});

test('initial creation: three requested remains distinct from one verified delivered take on partial success',async t=>{
  const f=fixture(t),a=await f.admit(),id=a.job.id;
  f.store.updateJob(id,{status:'ingesting',result:{success:true,tracks:[{take:1}]}});
  const asset=kind=>({id:sha(id+kind),kind,measured:true,durationSeconds:30,codec:kind==='master'?'pcm_s24le':'aac',sampleRate:48000,channels:2});
  f.store.publish(f.store.job(id),{jobId:id,status:'partial',takes:[{id:sha(id+'take'),take:1,kind:'delivered-master',status:'ready',master:asset('master'),listening:asset('listening')}]});
  f.store.updateJob(id,{status:'partial',error:{code:'INGEST_PARTIAL',message:'Explicit partial fixture.'}});
  for(const child of f.store.creationGroup(id).children.slice(1))f.store.updateJob(child.id,{status:'failed',error:{code:'GENERATION_FAILED',message:'Explicit missing direction fixture.'}});
  const out=f.store.publicJob(f.store.job(id));assert.equal(out.workflow.initialPolicy.requestedTakes,3);assert.equal(out.tracks.length,1);
  assert.equal(out.workflow.status,'partial');assert.equal(out.workflow.result.tracks.length,1);assert.match(out.workflow.message,/1 song is saved/);
  assert.doesNotMatch(out.workflow.message,/3 songs.*(saved|ready)/);
});

test('initial creation: concurrent duplicate actions produce only one durable group and three children',async t=>{
  const f=fixture(t),[a,b,c]=await Promise.all([f.admit(),f.admit(),f.admit()]);assert.equal(a.job.id,b.job.id);assert.equal(b.job.id,c.job.id);
  assert.equal([a,b,c].filter(result=>!result.existing).length,1);assert.equal(f.count('jobs'),3);assert.equal(f.count('creation_groups'),1);
  await assert.rejects(f.admit(undefined,{idem:'another-create-fixture'}),{code:'JOB_IN_PROGRESS'});
  assert.equal(f.store.db.prepare("SELECT count FROM counters WHERE key LIKE 'generation:global:%'").get().count,3);
});

test('initial creation: owner/global/IP quota or global capacity cannot admit a partial group',async t=>{
  for(const override of [{dailyAdmissionLimit:2},{guestDailyLimit:2},{ipDailyLimit:2}]){
    const f=fixture(t,override);await assert.rejects(f.admit(),{code:'RATE_LIMITED'});for(const table of ['jobs','counters','creation_groups','creation_children'])assert.equal(f.count(table),0,table);
  }
  const f=fixture(t);for(let i=0;i<2;i++)f.store.admit({owner:'guest:capacity-'+i,ipKey:'capacity-'+i,idem:'capacity-fixture-'+i,payload:selected,limits});
  const counters=clone(f.store.db.prepare('SELECT * FROM counters ORDER BY key').all());await assert.rejects(f.admit(),{code:'SERVICE_BUSY'});
  assert.equal(f.count('jobs'),2);assert.equal(f.count('creation_groups'),0);assert.deepEqual(clone(f.store.db.prepare('SELECT * FROM counters ORDER BY key').all()),counters);
});

test('initial creation: all selected nested fields survive in each directed request without a disguised native variation',async t=>{
  const input={...clone(candidate),dry_run:false,capabilities:false,async:false};delete input.output_package;delete input.variation_count;
  const f=fixture(t,{webhookUrl:input.webhook_url}),created=await f.admit(input),group=f.store.creationGroup(created.job.id);
  for(const child of group.children){const {prompt,...actual}=wireOf(child),{prompt:original,...expected}=input;assert.deepEqual(actual,expected);assert.ok(prompt.startsWith(original));assert.deepEqual(f.store.generationIntent(child.id).request,input);}
});

function publishTake(store,id){
  store.updateJob(id,{status:'ingesting',result:{success:true,tracks:[{take:1}]}});
  const asset=kind=>({id:sha(id+kind),kind,measured:true,durationSeconds:30,codec:kind==='master'?'pcm_s24le':'aac',sampleRate:48000,channels:2});
  store.publish(store.job(id),{jobId:id,status:'ready',takes:[{id:sha(id+'one'),take:1,status:'ready',master:asset('master'),listening:asset('listening')}]});store.updateJob(id,{status:'ready'});
  return store.publicJob(store.job(id),{aggregate:false}).tracks[0];
}
test('initial creation: progressive output keeps the faithful primary identity even when explore finishes first',async t=>{
  const f=fixture(t),a=await f.admit(),group=f.store.creationGroup(a.job.id);
  const explore=publishTake(f.store,group.children[2].id);let visible=f.store.publicJob(f.store.job(a.job.id));
  assert.equal(visible.creation.primaryTrackId,null);assert.equal(visible.creation.primaryStatus,'queued');assert.equal(visible.creation.deliveredTakes,1);assert.equal(visible.status,'queued');assert.equal(visible.tracks[0].id,explore.id);
  const faithful=publishTake(f.store,group.children[0].id);visible=f.store.publicJob(f.store.job(a.job.id));assert.equal(visible.creation.primaryTrackId,faithful.id);assert.equal(visible.creation.primaryStatus,'ready');assert.equal(visible.status,'queued');assert.deepEqual(visible.tracks.map(track=>track.seedRole),['faithful','explore']);
  const neighbour=publishTake(f.store,group.children[1].id);visible=f.store.publicJob(f.store.job(a.job.id));assert.equal(visible.status,'ready');assert.deepEqual(visible.tracks.map(track=>track.id),[faithful.id,neighbour.id,explore.id]);assert.equal(visible.creation.children.length,3);
  assert.deepEqual(visible.creation.children.map(child=>child.job.workflow.status),['ready','ready','ready']);
  assert.equal(f.store.publicJob(f.store.job(a.job.id),{aggregate:false}).tracks.length,1,'Worker per-child view never borrows sibling delivery.');
});

test('initial creation: a failed primary is never promoted from a ready neighbouring take',async t=>{
  const f=fixture(t),a=await f.admit(),group=f.store.creationGroup(a.job.id);f.store.updateJob(a.job.id,{status:'failed',error:{code:'GENERATION_FAILED',message:'Explicit primary failure.'}});
  publishTake(f.store,group.children[1].id);publishTake(f.store,group.children[2].id);
  const visible=f.store.publicJob(f.store.job(a.job.id));assert.equal(visible.status,'partial');assert.equal(visible.creation.primaryTrackId,null);assert.equal(visible.creation.primaryStatus,'failed');assert.equal(visible.tracks.length,2);assert.equal(visible.error.code,'GENERATION_FAILED');
});

test('initial creation: verified account claim transfers the group and every child without leaking it to a different account',async t=>{
  const f=fixture(t),guest=f.store.newSession(),user=f.store.identity('https://identity.fixture.invalid','group-owner','Fixture owner');
  const created=await f.admit(selected,{owner:guest.row.owner}),group=f.store.creationGroup(created.job.id),session=f.store.newSession(user,guest.row);
  assert.equal(session.row.owner,user.id);assert.equal(f.store.creationGroup(created.job.id).owner,user.id);assert.equal(f.store.jobs(user.id).length,1);assert.equal(f.store.jobs(guest.row.owner).length,0);
  for(const child of group.children){assert.equal(f.store.ownJob(child.id,user.id).owner,user.id);assert.throws(()=>f.store.ownJob(child.id,guest.row.owner),{status:404});}
  const again=await f.admit(selected,{owner:user.id});assert.equal(again.existing,true);assert.equal(again.job.id,created.job.id);
});

test('initial creation: restart preserves child admissions and never replays a child whose submission outcome was lost',async t=>{
  const directory=mkdtempSync(join(tmpdir(),'pmp-directed-fixture-')),path=join(directory,'store.sqlite');let store=new Store(path),worker;
  t.after(async()=>{worker?.stop();while(worker?.running)await new Promise(resolve=>setImmediate(resolve));store.close();assert.ok(resolve(directory).startsWith(resolve(tmpdir())+'\\')||resolve(directory).startsWith(resolve(tmpdir())+'/'));rmSync(directory,{recursive:true,force:true});});
  const make=()=>createInitialCreation({store,capabilities:async()=>caps,config:{dailyAdmissionLimit:100,guestDailyLimit:100,ipDailyLimit:100}});
  const first=await make().admit({owner,ipKey,idem,payload:selected}),group=store.creationGroup(first.job.id);store.claimSubmission(group.children[1].id);store.close();store=new Store(path);
  const again=await make().admit({owner,ipKey,idem,payload:selected});assert.equal(again.existing,true);assert.equal(again.job.id,first.job.id);assert.equal(store.job(group.children[1].id).status,'uncertain');
  const requests=[];worker=createJobs({store,engine:{async submit(body){requests.push(body);return{success:true,status:'queued',job_id:'restart-fixture-'+requests.length};},async job(){return{success:true,status:'processing'};}},media:{async ingest(){assert.fail('No fixture output.');}}});
  worker.start();while(worker.running)await new Promise(resolve=>setImmediate(resolve));worker.wake();while(worker.running)await new Promise(resolve=>setImmediate(resolve));
  assert.equal(requests.length,2);assert.deepEqual(requests.map(body=>body.prompt),[wireOf(group.children[0]).prompt,wireOf(group.children[2]).prompt]);assert.equal(store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,3);
});
