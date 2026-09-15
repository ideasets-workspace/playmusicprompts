import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {motionPreference,motionEnabled} from '../player-three-motion.js';
const checks=[];
const check=(name,actual,expected)=>{assert.equal(actual,expected,name);checks.push({name,pass:true});};
check('Fresh reduced-motion default is still',motionEnabled(motionPreference({}),true),false);
check('Fresh ordinary default animates',motionEnabled(motionPreference({}),false),true);
for(const reduced of [true,false]){
 check('Explicit on survives system preference '+reduced,motionEnabled(motionPreference(JSON.parse(JSON.stringify({motionPreference:'on'}))),reduced),true);
 check('Explicit off survives system preference '+reduced,motionEnabled(motionPreference(JSON.parse(JSON.stringify({motionPreference:'off'}))),reduced),false);
}
check('Legacy computed false cannot become sticky after device setting changes',motionEnabled(motionPreference({motion:false}),false),true);
check('Legacy computed true does not bypass device reduced motion',motionEnabled(motionPreference({motion:true}),true),false);
check('Malformed preference defaults to system',motionPreference({motionPreference:'invalid'}),'system');
check('System-following preference disables when system changes',motionEnabled('system',true),false);
check('System-following preference enables when system changes back',motionEnabled('system',false),true);
writeFileSync(new URL('../verification/motion-preference-checks.json',import.meta.url),JSON.stringify({date:new Date().toISOString(),checks,pass:true},null,2));
console.log(JSON.stringify({pass:true,checks:checks.length}));
