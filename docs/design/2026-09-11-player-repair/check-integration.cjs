const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync(path.resolve(__dirname,'../../../website_html_templates/player-three.js'),'utf8');
const start=source.indexOf('function persist('),end=source.indexOf('\nfunction seekTo(',start);
assert.ok(start>0&&end>start);
const writes=[];
const context={restoring:true,queue:[],current:null,audio:{currentTime:0},volume:.4,visualState:{motionPreference:'on'},roomStore:{
  savePreference:(...args)=>{writes.push(['preference',...args]);return true;},
  claimSession:value=>{writes.push(['claim',value]);return true;},
  updateSession:()=>{throw Error('Restoration must not save an automatic session');},
  savePosition:()=>{throw Error('Restoration must not save a position');}
}};
vm.createContext(context);vm.runInContext(source.slice(start,end),context);
assert.equal(vm.runInContext("persist('motionPreference')",context),true);
assert.deepEqual(writes,[['preference','motionPreference','on']]);
for(const scope of ['session','advance','position'])assert.equal(vm.runInContext(`persist('${scope}')`,context),false);
assert.equal(writes.length,1);
context.restoring=false;assert.equal(vm.runInContext("persist('session')",context),true);
assert.deepEqual(JSON.parse(JSON.stringify(writes[1])),['claim',{order:[],current:null,time:0}]);
const report={passed:3,scope:'Extracted production persist dispatch, not browser playback',checks:['Explicit motion choice saves while audio restoration is pending','Restoration cannot claim or overwrite session/position','Explicit empty queue stores current:null']};
fs.writeFileSync(path.join(__dirname,'integration-checks.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
