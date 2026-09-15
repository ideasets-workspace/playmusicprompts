const fs=require('node:fs'),crypto=require('node:crypto');
const lane='memory/lanes/beyond-living-20260912/', ledgerPath=lane+'task-ledgers/2026-09-12.json';
const id=process.argv[2], evidencePath=lane+'evidence/'+id+'.json';
if(!/^LIVE-0[23][A-D]?$/.test(id||''))throw Error('Explicit task ID required');
const evidence=JSON.parse(fs.readFileSync(evidencePath,'utf8'));
if(evidence.task_id!==id||evidence.status!=='VERIFIED_LOCAL')throw Error('Verified matching evidence required');
const ledger=JSON.parse(fs.readFileSync(ledgerPath,'utf8')),task=ledger.tasks.find(t=>t.task_id===id);
if(!task||task.status!=='OPEN')throw Error('Task must be open');
for(const dependency of task.dependencies)if(ledger.tasks.find(t=>t.task_id===dependency)?.status!=='CLOSED')throw Error('Open dependency '+dependency);
for(const source of evidence.sources||[]){const actual=crypto.createHash('sha256').update(fs.readFileSync(source.path)).digest('hex');if(actual!==source.sha256)throw Error('Source drift '+source.path);}
task.status='CLOSED';task.completion_evidence=evidencePath;task.verified_at=new Date().toISOString();task.exact_next_action='Retain verified scope and evidence; respond to owner feedback.';
task.failure_history=evidence.failure_history||[];
fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify({closed:id,evidence:evidencePath}));
