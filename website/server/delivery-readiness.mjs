import {problem} from './store.mjs';

// Check the actual media adapter before admitting paid work. A short shared
// cache avoids launching native tools once for each child in a three-song group.
export function createDeliveryReadiness(media,{now=Date.now,ttl=5000}={}){
  let cached=null,at=0,pending=null;
  async function status(){
    if(cached&&now()-at<ttl)return cached;
    if(!pending)pending=(async()=>{let healthy=false;try{healthy=(await media.health()).configured===true;}catch{}
      cached={available:healthy,...(healthy?{}:{code:'DELIVERY_UNAVAILABLE',message:'Song delivery is temporarily unavailable. Your brief is saved. Existing songs and Enhance remain available.'})};at=now();return cached;
    })().finally(()=>pending=null);
    return pending;
  }
  async function assertReady(){const value=await status();if(!value.available)throw problem(503,value.code,value.message);}
  return Object.freeze({status,assertReady});
}
