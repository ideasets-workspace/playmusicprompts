import test from 'node:test';
import assert from 'node:assert/strict';
import {createDeliveryReadiness} from '../server/delivery-readiness.mjs';
import {Store} from '../server/store.mjs';
import {createJobs} from '../server/jobs.mjs';
test('readiness coalesces native probes, exposes no tool paths and refreshes after recovery',async()=>{
 let calls=0,time=0,configured=false;const media={async health(){calls++;return {configured,ffprobe:'PRIVATE PATH',error:{message:'PRIVATE DETAIL'}};}};
 const ready=createDeliveryReadiness(media,{now:()=>time,ttl:5});const values=await Promise.all([ready.status(),ready.status()]);assert.equal(calls,1);assert.equal(values[0].available,false);assert.doesNotMatch(JSON.stringify(values),/PRIVATE/);
 await assert.rejects(ready.assertReady(),e=>e.status===503&&e.code==='DELIVERY_UNAVAILABLE');configured=true;time=6;await ready.assertReady();assert.equal(calls,2);
});
test('missing or crashing media health fails closed',async()=>{for(const media of [{},{async health(){throw Error('private failure');}}])await assert.rejects(createDeliveryReadiness(media).assertReady(),{code:'DELIVERY_UNAVAILABLE'});});
test('a queued worker cannot submit paid work while media is blocked; recovery uses the same accepted job',async t=>{
 const store=new Store(':memory:');let available=false,submits=0;const ready=createDeliveryReadiness({async health(){return {configured:available};}},{ttl:0});
 const worker=createJobs({store,engine:{async submit(){submits++;return {success:true,status:'queued',job_id:'readiness-fixture-upstream'};},async job(){return {success:true,status:'processing'};}},media:{},deliveryReady:ready.assertReady});
 const idle=async()=>{while(worker.running)await new Promise(r=>setImmediate(r));};t.after(async()=>{worker.stop();await idle();store.close();});
 const job=store.admit({owner:'guest:fixture',ipKey:'fixture',idem:'readiness-fixture',payload:{prompt:'An already admitted fixture'},limits:{daily:100,owner:100,ip:100}}).job;
 worker.wake();await idle();assert.equal(submits,0);assert.equal(store.job(job.id).status,'queued');assert.equal(JSON.parse(store.job(job.id).error).code,'DELIVERY_UNAVAILABLE');
 available=true;worker.wake();await idle();assert.equal(submits,1);assert.equal(store.job(job.id).status,'pending');worker.wake();await idle();assert.equal(submits,1);
});
