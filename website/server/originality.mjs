// Independent read-only analysis worker. Generation delivery remains ready even
// when the optional upstream analysis fails or takes longer than media ingest.
const object = value => value && typeof value==='object' && !Array.isArray(value);
// UUIDv4 is the current documented request_id contract (docs/api/06, §request_id).
const idValid = value => typeof value==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const pending = new Set(['pending','queued','processing','running']);

export function createOriginality({store,engine,onError=()=>{},now=Date.now,tickIntervalMs=1000}){
  if(!store||typeof engine?.originality!=='function'||typeof now!=='function'||!Number.isSafeInteger(tickIntervalMs)||tickIntervalMs<1)
    throw new TypeError('Originality worker dependencies are incomplete.');
  let running=false,stopped=true,timer;
  const notice=(jobId,code)=>{try{onError({jobId,code});}catch{/* Reporting must not change the persisted result. */}};
  function finish(record,change){return store.finishOriginality(record,change,now());}
  async function process(record){
    if(!idValid(record.request_id)){
      finish(record,{status:'unavailable',errorCode:'ORIGINALITY_ID_INVALID'});return;
    }
    let response;
    try{response=await engine.originality(record.request_id);}
    catch(error){
      const status=Number.isInteger(error?.upstreamStatus)?error.upstreamStatus:null;
      const state=status===404?'no-record':[401,403].includes(status)?'unavailable':'pending';
      const code=status===404?'ORIGINALITY_NO_RECORD':state==='unavailable'?'ORIGINALITY_ACCESS_UNAVAILABLE':'ORIGINALITY_POLL_UNAVAILABLE';
      finish(record,{status:state,...(state==='no-record'?{result:error.upstreamBody}:{errorResponse:error?.upstreamBody}),errorCode:code,httpStatus:status});
      notice(record.job_id,code);return;
    }
    // HTTP200 + success:true + status:failed is an analysis failure, not a
    // successful gate and never a reason to resubmit a song.
    if(object(response)&&response.success===true&&response.status==='failed'){
      finish(record,{status:'failed',result:response,httpStatus:200});return;
    }
    if(object(response)&&response.success===true&&response.status==='complete'&&object(response.verdict)){
      finish(record,{status:'complete',result:response,httpStatus:200});return;
    }
    if(object(response)&&response.success===true&&pending.has(response.status)){
      finish(record,{status:'pending',result:response,httpStatus:200});return;
    }
    if(object(response)&&response.success===true&&response.status==='unavailable'){
      finish(record,{status:'unavailable',result:response,errorCode:'ORIGINALITY_UNAVAILABLE',httpStatus:200});return;
    }
    // Preserve malformed replies for diagnosis without calling them complete.
    finish(record,{status:'pending',errorResponse:response,errorCode:'ORIGINALITY_RESPONSE_INVALID',httpStatus:200});
    notice(record.job_id,'ORIGINALITY_RESPONSE_INVALID');
  }
  async function tick(){
    if(running||stopped)return;running=true;
    try{
      store.discoverOriginality(now());
      for(const candidate of store.dueOriginality(now())){
        if(stopped)break;
        const record=store.claimOriginality(candidate,now());if(record)await process(record);
      }
    }catch{notice(null,'ORIGINALITY_WORKER_UNAVAILABLE');}
    finally{running=false;if(!stopped){timer=setTimeout(tick,tickIntervalMs);timer.unref?.();}}
  }
  return {
    start(){stopped=false;clearTimeout(timer);return tick();},
    wake(){clearTimeout(timer);return tick();},
    stop(){stopped=true;clearTimeout(timer);},
    get running(){return running;},
  };
}
