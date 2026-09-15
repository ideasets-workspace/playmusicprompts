import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const exec=promisify(execFile);
const report=[];
for(const [name,file] of [['key','read-key.ps1'],['identity','identity-token.ps1']]){
  try{const r=await exec('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',resolve('scripts',file)],{env:{...process.env,PSModulePath:`${process.env.SystemRoot}\\System32\\WindowsPowerShell\\v1.0\\Modules`},windowsHide:true,timeout:55000,maxBuffer:32768});const value=r.stdout.trim();
    report.push({stage:name,ok:true,length:value.length,format:name==='key'?/^pmp_[A-Za-z0-9_-]{43}$/.test(value):/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value),...(name==='key'?{keyId:createHash('sha256').update(value).digest('hex').slice(0,12)}:{})});
  }catch(e){const err=String(e.stderr||'');report.push({stage:name,ok:false,code:e.code,accessDenied:/denied|unauthoriz|permission/i.test(err),executionPolicy:/execution.polic|scripts is disabled/i.test(err),dpapi:/key not valid|decrypt|ConvertTo-SecureString/i.test(err),sdkUnavailable:/identity refresh unavailable/i.test(err),timedOut:!!e.killed,errorSummary:err.split('\n').filter(l=>/^(ConvertTo-SecureString|Exception|Identity refresh|Cannot|Key not valid|The system)/.test(l)).map(l=>l.replace(/pmp_[A-Za-z0-9_-]+/g,'[redacted]').replace(/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+/g,'[redacted]')).slice(0,3)});}
}
console.log(JSON.stringify(report));
