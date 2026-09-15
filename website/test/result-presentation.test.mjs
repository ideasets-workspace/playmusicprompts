import test from 'node:test';
import assert from 'node:assert/strict';
import {publicFailure} from '../server/jobs.mjs';
import {publicGenerationWorkflow} from '../server/workflow-state.mjs';
import {summarizeResult} from '../server/result-summary.mjs';
import {resultRows,render,renderCreation,failureLines} from '../public/result-presentation.js';

test('content categories and service quota survive actual error→workflow→visible copy without private text',()=>{
  const error=publicFailure({upstreamBody:{error_code:'CONTENT_REFUSED',content_safety:{instrument_failure:false,reason:'PRIVATE_REASON',refused_categories:[{id:'violence',en:'PRIVATE_LABEL'},{id:'violence'},{id:'politics'},{id:'PRIVATE_ID'}]},auth:{limit:{daily_quota:100,used_today:3,remaining_today:97,secret:'PRIVATE_SECRET'}}}});
  const workflow=publicGenerationWorkflow({id:'safe-fixture',status:'failed',error},{prompt:'The owner description'});
  const lines=failureLines(workflow.error).join(' ');
  assert.match(lines,/Violence, Politics/);assert.match(lines,/97 remaining of 100/);assert.ok(!lines.includes('PRIVATE_'));assert.equal(workflow.error.contentSafety.categories.length,2);
});
test('failed classifier never blames the writing even when a contradictory category was supplied',()=>{
  const error=publicFailure({upstreamBody:{error_code:'CONTENT_REFUSED',content_safety:{instrument_failure:true,refused_categories:[{id:'violence'}]}}});
  const lines=failureLines(error).join(' ');assert.match(lines,/temporarily unavailable/);assert.match(lines,/not a judgement/);assert.doesNotMatch(lines,/Review these categories|Violence/);
});
test('invalid or inherited quota and category data do not become displayed allowance or categories',()=>{
  const raw={error_code:'CONTENT_REFUSED',content_safety:{refused_categories:[Object.create({id:'politics'})]},auth:{limit:{daily_quota:'100',remaining_today:-1,used_today:Infinity}}};
  const error=publicFailure({upstreamBody:raw});assert.equal(error.quota,undefined);assert.deepEqual(error.contentSafety.categories,[]);
});
test('result projection and actual HTML preserve negative measurements, untrusted credentials and unknown states',()=>{
  const summary=summarizeResult({prompt:'PRIVATE_PROMPT',seed:0},{success:true,tracks:[{take:1,kind:'delivered master'}],takes_delivered:1,takes_requested:1,route:{model:'lyria-3-pro-preview',delegate_reported:{model:'lyria-3-clip-preview'}},seed:{value:0,sent_to_model:false},language_fallback:{requested:'tr',delivered:'en'},compliance:{c2pa:{state:'signed',validation_state:'Valid',trust:'untrusted_own_ca'},synthid:{state:'vendor_stated_not_verified'}},measured:{tempo:{state:'NOT_MEASURABLE',tempo_bpm_estimated:null}},duration_regeneration:{private:'PRIVATE_NESTED'},rights:{commercial_use:true,sync:false,copyright_warranted:false}});
  const html=render(summary);assert.match(html,/selected and reported models differ/);assert.match(html,/TR → EN/);assert.match(html,/Not measurable/);assert.match(html,/Own certificate authority; not independently trusted/);assert.match(html,/Provider statement; not independently verified/);assert.match(html,/listening copy have not been verified/);assert.match(html,/detailed attempt results were not supplied/);assert.doesNotMatch(html,/PRIVATE_|null BPM/);assert.ok(resultRows(summary).some(([key,value])=>key==='Seed sent to model'&&value==='No'));
});
test('directed creation details show each real child status without hiding a failed direction',()=>{
  const job={creation:{deliveredTakes:1,children:[{role:'faithful',job:{status:'ready',workflow:{title:'Your music is ready'},summary:{state:'available',takes:{requested:1,delivered:1}}}},{role:'neighbour',job:{status:'pending',workflow:{title:'Waiting for music worker'}}},{role:'explore',job:{status:'failed',error:{message:'A transfer needs <review>'}}}]}};
  const html=renderCreation(job);assert.match(html,/1 of 3 directions ready/);assert.match(html,/Your original idea/);assert.match(html,/A different angle/);assert.match(html,/Further exploration/);assert.match(html,/Waiting for music worker/);assert.match(html,/A transfer needs &lt;review&gt;/);
});
