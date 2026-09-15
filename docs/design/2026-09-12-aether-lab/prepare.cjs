const fs=require('fs'),path=require('path'),crypto=require('crypto');
const lane='memory/lanes/three-lab-20260912/',docs='docs/design/2026-09-12-aether-lab/';
fs.mkdirSync(lane+'task-ledgers',{recursive:true});fs.mkdirSync(lane+'evidence',{recursive:true});
const tasks=[
 {task_id:'LAB-01',objective:'Create verified independent copy of accepted player',scope:'Full sourcehash/copy, scopednamespace/port/entry, exact contracts',dependencies:[],status:'OPEN',exact_next_action:'Hash and copy originalfolder; verify independent runtime',completion_evidence:null},
 {task_id:'LAB-02',objective:'Build and integrate advanced Aether experience',scope:'GPU particles, volume, three forms, actual audio, connected controls and camera',dependencies:['LAB-01'],status:'OPEN',exact_next_action:'Delegate boundedassets; parent integrates copy and first realrenders',completion_evidence:null},
 {task_id:'LAB-03',objective:'Verify and hand off independent lab',scope:'Actualvisual/UI/audio/capture/motion/quality/persistence and originalimmutability',dependencies:['LAB-02'],status:'OPEN',exact_next_action:'Reconcile full request using rendered and runtime evidence',completion_evidence:null}
];
fs.writeFileSync(lane+'task-ledgers/2026-09-12.json',JSON.stringify({project_id:'PLAY-MUSIC-PROMPTS',lane_id:'three-lab-20260912',source_request:'Advance3D substantially in a copy; leave current unchanged.',tasks,reconciliation_complete:false},null,2));
fs.writeFileSync(lane+'CURRENT.json',JSON.stringify({schema_version:1,project_id:'PLAY-MUSIC-PROMPTS',lane_id:'three-lab-20260912',current_task_id:'LAB-01',current_ledger_path:lane+'task-ledgers/2026-09-12.json',status:'IN_PROGRESS',scope:'Only sibling website_html_templates_lab; originalreadonly'},null,2));
fs.appendFileSync('memory/REQUIREMENTS.md','\nREQ-AETHER-LAB-20260912 — OPEN. Advance3D in full independent copy, preserve currentplayer unchanged. LAB-01through03, three-lab-20260912. Contract:docs/design/2026-09-12-aether-lab/brief.md.\n');
fs.appendFileSync('memory/LANES.md','\nthree-lab-20260912 ACTIVE: parent owns website_html_templates_lab and lane records; website_html_templates/** strictlyread-only. Assetdelegates named files under docs/design/2026-09-12-aether-lab only. Existingplayerlane preserved.\n');
fs.appendFileSync('memory/STATE.md','\nLatestrequest2026-09-12: advance3D in independentcopy. LAB-01 three-lab-20260912 current; existingplayer4173 unchanged.\n');
if(fs.existsSync('website_html_templates_lab'))throw Error('Destination already exists; refuse overwrite');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const files=fs.readdirSync('website_html_templates',{recursive:true}).filter(p=>fs.statSync(path.join('website_html_templates',p)).isFile()).map(file=>({file,sha256:hash(path.join('website_html_templates',file))}));
fs.writeFileSync(docs+'original-manifest.json',JSON.stringify(files,null,2));fs.cpSync('website_html_templates','website_html_templates_lab',{recursive:true,errorOnExist:true,force:false});
for(const f of files)if(hash(path.join('website_html_templates_lab',f.file))!==f.sha256)throw Error('Copy mismatch '+f.file);
fs.writeFileSync(docs+'copy-result.json',JSON.stringify({at:new Date().toISOString(),files:files.length,exact:true,source:'website_html_templates',copy:'website_html_templates_lab'},null,2));console.log(JSON.stringify({copied:files.length,exact:true}));
