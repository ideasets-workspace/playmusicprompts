import {problem} from './store.mjs';
import {validateRequest} from './validation.mjs';
import {planAdaptiveRequest} from './adaptive-policy.mjs';
import {SIGNED_IN_DAILY_LIMIT} from './admission-limits.mjs';

const identifier=/^[a-zA-Z0-9_-]{8,160}$/;
const copy=value=>JSON.parse(JSON.stringify(value));

// A website Create operation has a visible default of three takes only when
// neither output control was selected. Exact API admissions remain separate.
// The omitted-output website default admits three deliberately different briefs.
// Explicit native output choices retain the API's exact package semantics.
export function createInitialCreation({store,capabilities,config,deliveryReady=async()=>{}}){
  if(typeof store?.admit!=='function'||typeof capabilities!=='function'||!config)throw new TypeError('Initial creation needs the application store and capability contract.');
  async function admit({owner,ipKey,idem,payload}){
    if(!identifier.test(idem||''))throw problem(400,'IDEMPOTENCY_REQUIRED','A unique creation request ID is required.');
    const caps=await capabilities(),request=validateRequest(payload,caps,{webhookUrl:config.webhookUrl});
    if(request.dry_run===true||request.capabilities===true)throw problem(400,'CONTROL_MODE_UNSUPPORTED','Preview mode cannot start a music creation.');
    if(request.async===undefined)request.async=true;
    if(!store.db.prepare('SELECT 1 FROM jobs WHERE owner=? AND idem=?').get(owner,idem))await deliveryReady();
    const wire=copy(request),defaultApplied=!Object.hasOwn(request,'output_package')&&!Object.hasOwn(request,'variation_count');
    const limits={daily:config.dailyAdmissionLimit,owner:owner.startsWith('guest:')?config.guestDailyLimit:SIGNED_IN_DAILY_LIMIT,ip:config.ipDailyLimit};
    if(defaultApplied){
      const plans=['faithful','neighbour','explore'].map(role=>{
        const planned=planAdaptiveRequest({request,strategy:role});
        // Omitted package stays omitted: each child's native default must be
        // one track. Never strip an explicitly selected value to form a seed.
        const payload=validateRequest(planned.request,caps,{webhookUrl:config.webhookUrl});
        return {role,payload};
      });
      const nativeDefault=caps.parameters.find(parameter=>parameter.name==='output_package')?.default?.value;
      if(nativeDefault!=='single_track')throw problem(503,'INITIAL_OUTPUT_CONTRACT_CHANGED','The music service’s default output changed. Choose an explicit output before creating.');
      return store.admitCreationGroup({owner,ipKey,idem,request,plans,limits});
    }
    // Revalidate the actual body before any quota or durable admission. If the
    // live API no longer accepts this default, do not silently downgrade it.
    const validated=validateRequest(wire,caps,{webhookUrl:config.webhookUrl});
    const value=name=>caps.parameters.find(parameter=>parameter.name===name)?.default?.value;
    const output=validated.output_package??value('output_package');
    const count=output==='variations'?(validated.variation_count??value('variation_count')):['single_track','stems_bundle'].includes(output)?1:null;
    const policy={version:1,mode:defaultApplied?'default-three':'selected-output',defaultApplied,
      requestedTakes:Number.isSafeInteger(count)&&count>=1&&count<=4?count:null};
    return store.admit({owner,ipKey,idem,payload:validated,generationIntent:{request,policy},
      limits});
  }
  return Object.freeze({admit});
}
