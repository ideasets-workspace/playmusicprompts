import {DatabaseSync} from 'node:sqlite';
import {randomUUID, randomBytes, createHash} from 'node:crypto';
import {summarizeResult,summarizeAssets} from './result-summary.mjs';
import {publicGenerationWorkflow,requestSnapshot} from './workflow-state.mjs';
import {ADMISSION_SCOPE_MESSAGES,GENERIC_LIMIT_MESSAGE,IP_MINUTE_LIMIT,ADMISSION_DAY_MS,ADMISSION_MINUTE_MS} from './admission-limits.mjs';
import {TrackTitleComposer} from './track-title.mjs';

export const sha = value => createHash('sha256').update(value).digest('hex');
export const nonce = () => randomBytes(32).toString('base64url');
// docs/api/06-response-envelope.md defines request_id as UUIDv4 and identifies
// it as the originality poll key. A transport-safe token is not sufficient.
const originalityRequestId = value => typeof value==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const ORIGINALITY_DELAYS = [5000,8000,12000,20000,30000];
const ANALYSIS_STATES = new Set(['pending','complete','failed','no-record','unavailable']);
function publicInitialPolicy(policy){
  if(policy?.version===2&&policy.mode==='directed-three'&&['faithful','neighbour','explore'].includes(policy.role))return {version:2,mode:'directed-three',defaultApplied:true,requestedTakes:3,role:policy.role};
  if(!policy||policy.version!==1||!['default-three','selected-output'].includes(policy.mode)||typeof policy.defaultApplied!=='boolean')return null;
  return {version:1,mode:policy.mode,defaultApplied:policy.defaultApplied,
    requestedTakes:Number.isSafeInteger(policy.requestedTakes)&&policy.requestedTakes>=1&&policy.requestedTakes<=4?policy.requestedTakes:null};
}
export function problem(status,code,message) {return Object.assign(new Error(message),{status,code});}
export function stable(value) {return JSON.stringify(sort(value));}
function sort(v){if(Array.isArray(v))return v.map(sort);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])]));return v;}

export class Store {
  constructor(path) {
    this.db=new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, owner TEXT NOT NULL, user_id TEXT, csrf TEXT NOT NULL, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS owner_claims (old_owner TEXT PRIMARY KEY, owner TEXT NOT NULL, claimed_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, issuer TEXT NOT NULL, subject TEXT NOT NULL, name TEXT NOT NULL, UNIQUE(issuer,subject));
      CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, owner TEXT NOT NULL, idem TEXT NOT NULL, fingerprint TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL, upstream_id TEXT, result TEXT, error TEXT, created INTEGER NOT NULL, updated INTEGER NOT NULL, UNIQUE(owner,idem));
      CREATE TABLE IF NOT EXISTS generation_intents (job_id TEXT PRIMARY KEY REFERENCES jobs(id), request TEXT NOT NULL, policy TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS creation_groups (id TEXT PRIMARY KEY REFERENCES jobs(id), owner TEXT NOT NULL, idem TEXT NOT NULL, fingerprint TEXT NOT NULL, request TEXT NOT NULL, created INTEGER NOT NULL, UNIQUE(owner,idem));
      CREATE TABLE IF NOT EXISTS creation_children (group_id TEXT NOT NULL REFERENCES creation_groups(id), job_id TEXT NOT NULL UNIQUE REFERENCES jobs(id), position INTEGER NOT NULL CHECK(position BETWEEN 0 AND 2), role TEXT NOT NULL CHECK(role IN ('faithful','neighbour','explore')), PRIMARY KEY(group_id,position), UNIQUE(group_id,role));
      CREATE TABLE IF NOT EXISTS tracks (id TEXT PRIMARY KEY, job_id TEXT NOT NULL REFERENCES jobs(id), take_number INTEGER NOT NULL, public TEXT NOT NULL, listening_id TEXT NOT NULL, master_id TEXT NOT NULL, UNIQUE(job_id,take_number));
      CREATE TABLE IF NOT EXISTS analysis_records (job_id TEXT NOT NULL REFERENCES jobs(id), kind TEXT NOT NULL CHECK(kind='originality'), request_id TEXT,
        status TEXT NOT NULL CHECK(status IN ('pending','complete','failed','no-record','unavailable')), poll_count INTEGER NOT NULL DEFAULT 0,
        next_poll_at INTEGER, result TEXT, error_response TEXT, error_code TEXT, http_status INTEGER, created INTEGER NOT NULL, updated INTEGER NOT NULL,
        PRIMARY KEY(job_id,kind));
      CREATE INDEX IF NOT EXISTS analysis_due ON analysis_records(status,next_poll_at);
      CREATE TABLE IF NOT EXISTS media_summaries (job_id TEXT PRIMARY KEY REFERENCES jobs(id), summary TEXT NOT NULL, updated INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS playlists (id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES users(id), name TEXT NOT NULL, created INTEGER NOT NULL, revision INTEGER NOT NULL DEFAULT 1);
      CREATE TABLE IF NOT EXISTS playlist_items (playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE, track_id TEXT NOT NULL REFERENCES tracks(id), position INTEGER NOT NULL, PRIMARY KEY(playlist_id,track_id));
      CREATE TABLE IF NOT EXISTS favorites (owner TEXT NOT NULL REFERENCES users(id), track_id TEXT NOT NULL REFERENCES tracks(id), created INTEGER NOT NULL, PRIMARY KEY(owner,track_id));
      CREATE TABLE IF NOT EXISTS counters (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS oidc_attempts (state TEXT PRIMARY KEY, session_hash TEXT NOT NULL, verifier TEXT NOT NULL, nonce TEXT NOT NULL, expires INTEGER NOT NULL);
    `);
    if(!this.db.prepare('PRAGMA table_info(playlists)').all().some(column=>column.name==='revision'))this.db.exec('ALTER TABLE playlists ADD COLUMN revision INTEGER NOT NULL DEFAULT 1');
    this.retitleLegacyTracks();
    // Admission may have reached the engine. Never replay a POST whose outcome was lost.
    this.db.prepare("UPDATE jobs SET status='uncertain',error=?,updated=? WHERE status='submitting'")
      .run(JSON.stringify({code:'ADMISSION_UNCERTAIN',message:'The connection ended during submission. This request will not be submitted again automatically.'}),Date.now());
  }
  close(){this.db.close();}
  transaction(fn){this.db.exec('BEGIN IMMEDIATE');try{const r=fn();this.db.exec('COMMIT');return r;}catch(e){this.db.exec('ROLLBACK');throw e;}}
  session(token){if(!/^[A-Za-z0-9_-]{43}$/.test(token||''))return null;return this.db.prepare('SELECT * FROM sessions WHERE token_hash=? AND expires>?').get(sha(token),Date.now());}
  newSession(user=null,old=null){
    const token=nonce(),row={token_hash:sha(token),owner:user?.id||`guest:${randomUUID()}`,user_id:user?.id||null,csrf:nonce(),expires:Date.now()+(user?7:2)*86400000};
    this.transaction(()=>{this.db.prepare('INSERT INTO sessions VALUES (?,?,?,?,?)').run(row.token_hash,row.owner,row.user_id,row.csrf,row.expires);
      if(old){this.db.prepare('DELETE FROM sessions WHERE token_hash=?').run(old.token_hash);
        if(!old.user_id && user){
          const hasListening=this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='listening_sessions'").get();
          const listeningRows=hasListening?this.db.prepare('SELECT * FROM listening_sessions WHERE owner=?').all(old.owner):[];
          const guestJobs=this.db.prepare('SELECT id,idem FROM jobs WHERE owner=?').all(old.owner);
          const movedJobs=new Map();
          for(const guestJob of guestJobs){const collision=this.db.prepare('SELECT id FROM jobs WHERE owner=? AND idem=?').get(user.id,guestJob.idem);
            const idem=collision?randomUUID():guestJob.idem;
            this.db.prepare('UPDATE jobs SET owner=?,idem=? WHERE id=? AND owner=?').run(user.id,idem,guestJob.id,old.owner);
            movedJobs.set(guestJob.idem,{id:guestJob.id,idem});
          }
          for(const group of this.db.prepare('SELECT id FROM creation_groups WHERE owner=?').all(old.owner)){
            const primary=this.job(group.id);this.db.prepare('UPDATE creation_groups SET owner=?,idem=? WHERE id=?').run(user.id,primary.idem,group.id);
          }
          for(const listeningRow of listeningRows){
            const listening=JSON.parse(listeningRow.data);
            if(listening.owner!==old.owner||listening.id!==listeningRow.id)throw problem(409,'ACCOUNT_CLAIM_CONFLICT','Your listening session could not be safely transferred. Your guest session remains available.');
            for(const id of [listening.activeJobId,listening.blockedJobId].filter(Boolean)){
              if(!guestJobs.some(job=>job.id===id)||this.job(id)?.owner!==user.id)throw problem(409,'ACCOUNT_CLAIM_CONFLICT','Your listening session could not be safely transferred. Your guest session remains available.');
            }
            if(listening.admission){
              const moved=movedJobs.get(listening.admission.id);
              if(moved){
                if(this.job(moved.id).fingerprint!==sha(stable(listening.admission.payload)))throw problem(409,'ACCOUNT_CLAIM_CONFLICT','Your pending listening request could not be safely transferred. Your guest session remains available.');
                listening.admission.id=moved.idem;
              }else if(this.db.prepare('SELECT id FROM jobs WHERE owner=? AND idem=?').get(user.id,listening.admission.id)){
                // No guest job was admitted under this key, so no generation
                // could have started. Isolate it from an unrelated account job.
                listening.admission.id=randomUUID();
              }
            }
            const collision=this.db.prepare('SELECT id FROM listening_sessions WHERE owner=? AND idem=?').get(user.id,listeningRow.idem);
            const alias=this.db.prepare('SELECT session_id FROM listening_admission_aliases WHERE owner=? AND idem=? AND fingerprint=?').get(user.id,listeningRow.idem,listeningRow.fingerprint);
            if(alias&&alias.session_id!==listening.id)throw problem(409,'ACCOUNT_CLAIM_CONFLICT','Your listening request needs reconciliation before account transfer. Your guest session remains available.');
            // Preserve the original admission receipt even if its SQL key
            // collides. A missed response can recover the same paused session.
            this.db.prepare('INSERT OR IGNORE INTO listening_admission_aliases VALUES (?,?,?,?)').run(user.id,listeningRow.idem,listeningRow.fingerprint,listening.id);
            listening.owner=user.id;listening.enabled=false;listening.playing=false;
            listening.updatedAt=Date.now();listening.lastEventAt=listening.updatedAt;
            if(listening.status!=='needs-attention')listening.status='paused';
            this.db.prepare('UPDATE listening_sessions SET owner=?,idem=?,data=?,updated=? WHERE id=? AND owner=?')
              .run(user.id,collision?randomUUID():listeningRow.idem,JSON.stringify(listening),listening.updatedAt,listening.id,old.owner);
          }
          // In-flight guest requests may be awaiting capabilities when login
          // completes. They must not create orphaned work under the old owner.
          this.db.prepare('INSERT INTO owner_claims VALUES (?,?,?)').run(old.owner,user.id,Date.now());
          if(this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='enhancement_jobs'").get()){
            for(const operation of this.db.prepare('SELECT id,idem FROM enhancement_jobs WHERE owner=?').all(old.owner)){
              const collision=this.db.prepare('SELECT id FROM enhancement_jobs WHERE owner=? AND idem=?').get(user.id,operation.idem);
              this.db.prepare('UPDATE enhancement_jobs SET owner=?,idem=? WHERE id=? AND owner=?').run(user.id,collision?randomUUID():operation.idem,operation.id,old.owner);
            }
          }
        }}
    });return {token,row};
  }
  deleteSession(session){this.db.prepare('DELETE FROM sessions WHERE token_hash=?').run(session.token_hash);}
  assertOwnerCurrent(owner){if(this.db.prepare('SELECT 1 FROM owner_claims WHERE old_owner=?').get(owner))throw problem(409,'SESSION_CHANGED','Your account session changed. Refresh this page before continuing.');}
  user(id){return id?this.db.prepare('SELECT id,name FROM users WHERE id=?').get(id):null;}
  identity(issuer,subject,name){
    if(typeof subject!=='string'||!subject||subject.length>255)throw problem(401,'IDENTITY_INVALID','Sign-in could not be verified.');
    const old=this.db.prepare('SELECT id,name FROM users WHERE issuer=? AND subject=?').get(issuer,subject);if(old)return old;
    const user={id:randomUUID(),name:String(name||'Music lover').slice(0,100)};
    this.db.prepare('INSERT INTO users VALUES (?,?,?,?)').run(user.id,issuer,subject,user.name);return user;
  }
  // `scope` names the admission bucket (global | guest | signedIn | ip | minute) so the 429 body
  // tells the caller WHICH limit stopped them; callers without a scope keep the generic sentence.
  consume(key,limit,period,scope=null){const now=Date.now(),bucket=Math.floor(now/period),k=`${key}:${bucket}`;
    const row=this.db.prepare('SELECT count FROM counters WHERE key=?').get(k);
    if((row?.count??0)>=limit)throw problem(429,'RATE_LIMITED',ADMISSION_SCOPE_MESSAGES[scope]||GENERIC_LIMIT_MESSAGE);
    this.db.prepare('INSERT INTO counters VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(k,(bucket+1)*period);
  }
  // One creation admission = one count in each daily scope plus the per-minute burst guard.
  consumeCreation(owner,ipKey,limits){
    const ownerScope=owner.startsWith('guest:')?'guest':'signedIn';
    this.consume('generation:global',limits.daily,ADMISSION_DAY_MS,'global');this.consume(`generation:${owner}`,limits.owner,ADMISSION_DAY_MS,ownerScope);
    this.consume(`generation:ip:${ipKey}`,limits.ip,ADMISSION_DAY_MS,'ip');
  }
  admit({owner,ipKey,idem,payload,limits,generationIntent=null}){
    const fingerprint=sha(stable(payload));
    return this.transaction(()=>{
      this.assertOwnerCurrent(owner);
      const prior=this.db.prepare('SELECT * FROM jobs WHERE owner=? AND idem=?').get(owner,idem);
      if(prior){
        // Equal engine bodies can have different original selections (an
        // explicit three versus the visible website default). Never alias them,
        // or alias the exact-API route with a website initial-creation policy.
        if(prior.fingerprint!==fingerprint||stable(this.generationIntent(prior.id))!==stable(generationIntent))throw problem(409,'IDEMPOTENCY_CONFLICT','This request ID belongs to a different music brief.');
        return {job:prior,existing:true};
      }
      const active=this.db.prepare("SELECT count(*) AS n FROM jobs WHERE owner=? AND status IN ('queued','submitting','pending','ingesting')").get(owner).n;
      if(active>=1)throw problem(429,'JOB_IN_PROGRESS','Your current creation is still in progress.');
      const globalActive=this.db.prepare("SELECT count(*) AS n FROM jobs WHERE status IN ('queued','submitting','pending','ingesting')").get().n;
      if(globalActive>=4)throw problem(429,'SERVICE_BUSY','All creation spaces are in use. Please try again shortly.');
      this.consumeCreation(owner,ipKey,limits);this.consume(`generation:minute:${ipKey}`,IP_MINUTE_LIMIT,ADMISSION_MINUTE_MS,'minute');
      const now=Date.now(),id=randomUUID();this.db.prepare('INSERT INTO jobs (id,owner,idem,fingerprint,payload,status,created,updated) VALUES (?,?,?,?,?,?,?,?)')
        .run(id,owner,idem,fingerprint,JSON.stringify(payload),'queued',now,now);
      if(generationIntent)this.db.prepare('INSERT INTO generation_intents VALUES (?,?,?)').run(id,JSON.stringify(generationIntent.request),JSON.stringify(generationIntent.policy));
      return {job:this.job(id),existing:false};
    });
  }
  admitCreationGroup({owner,ipKey,idem,request,plans,limits}){
    const roles=['faithful','neighbour','explore'];
    if(!Array.isArray(plans)||plans.length!==3||plans.some((plan,i)=>plan.role!==roles[i]||!plan.payload))throw problem(400,'INVALID_SEED_PLAN','A creation needs three ordered music directions.');
    const fingerprint=sha(stable({version:2,request,plans}));
    return this.transaction(()=>{
      this.assertOwnerCurrent(owner);
      const prior=this.db.prepare('SELECT * FROM creation_groups WHERE owner=? AND idem=?').get(owner,idem);
      if(prior){if(prior.fingerprint!==fingerprint)throw problem(409,'IDEMPOTENCY_CONFLICT','This request ID belongs to a different music brief.');return {job:this.job(prior.id),existing:true};}
      const legacy=this.db.prepare('SELECT * FROM jobs WHERE owner=? AND idem=?').get(owner,idem);
      if(legacy){
        const intent=this.generationIntent(legacy.id),expectedLegacy={...request,output_package:'variations',variation_count:3};
        // A response may have been lost before upgrading from native default3.
        // Its already accepted work remains the only work under that ID. This
        // does not reinterpret or replace it as a newly directed creation.
        if(intent?.policy?.version===1&&intent.policy.mode==='default-three'&&intent.policy.defaultApplied===true&&stable(intent.request)===stable(request)&&legacy.fingerprint===sha(stable(expectedLegacy)))return {job:legacy,existing:true};
        throw problem(409,'IDEMPOTENCY_CONFLICT','This request ID belongs to a different music brief.');
      }
      const active="status IN ('queued','submitting','pending','ingesting')";
      if(this.db.prepare(`SELECT count(*) AS n FROM jobs WHERE owner=? AND ${active}`).get(owner).n)throw problem(429,'JOB_IN_PROGRESS','Your current creation is still in progress.');
      if(this.db.prepare(`SELECT count(*) AS n FROM jobs WHERE ${active}`).get().n+plans.length>4)throw problem(429,'SERVICE_BUSY','Three creation spaces are needed for this listening start. Please try again shortly.');
      // Daily limits account for every actual engine admission. The minute
      // limit measures the single user Create action. The entire reservation
      // rolls back if even the last child, intent or quota cannot be recorded.
      for(const plan of plans)this.consumeCreation(owner,ipKey,limits);
      this.consume(`generation:minute:${ipKey}`,IP_MINUTE_LIMIT,ADMISSION_MINUTE_MS,'minute');
      const now=Date.now(),groupId=randomUUID();
      for(const [position,plan] of plans.entries()){
        const id=position===0?groupId:randomUUID(),childIdem=position===0?idem:`seed-${groupId}-${plan.role}`;
        this.db.prepare('INSERT INTO jobs (id,owner,idem,fingerprint,payload,status,created,updated) VALUES (?,?,?,?,?,?,?,?)').run(id,owner,childIdem,sha(stable(plan.payload)),JSON.stringify(plan.payload),'queued',now,now);
        if(position===0)this.db.prepare('INSERT INTO creation_groups VALUES (?,?,?,?,?,?)').run(groupId,owner,idem,fingerprint,JSON.stringify(request),now);
        this.db.prepare('INSERT INTO creation_children VALUES (?,?,?,?)').run(groupId,id,position,plan.role);
        this.db.prepare('INSERT INTO generation_intents VALUES (?,?,?)').run(id,JSON.stringify(request),JSON.stringify({version:2,mode:'directed-three',defaultApplied:true,requestedTakes:3,role:plan.role}));
      }
      return {job:this.job(groupId),existing:false};
    });
  }
  creationGroup(jobId){const row=this.db.prepare('SELECT g.*,c.role,c.position FROM creation_groups g JOIN creation_children c ON c.group_id=g.id WHERE c.job_id=?').get(jobId);return row?{...row,request:JSON.parse(row.request),children:this.db.prepare('SELECT j.*,c.role,c.position FROM creation_children c JOIN jobs j ON j.id=c.job_id WHERE c.group_id=? ORDER BY c.position').all(row.id)}:null;}
  job(id){return this.db.prepare('SELECT * FROM jobs WHERE id=?').get(id);}
  generationIntent(jobId){const row=this.db.prepare('SELECT request,policy FROM generation_intents WHERE job_id=?').get(jobId);return row?{request:JSON.parse(row.request),policy:JSON.parse(row.policy)}:null;}
  claimSubmission(id){return this.db.prepare("UPDATE jobs SET status='submitting',updated=? WHERE id=? AND status='queued'").run(Date.now(),id).changes===1;}
  ownJob(id,owner){const job=this.job(id);if(!job||job.owner!==owner)throw problem(404,'NOT_FOUND','Creation not found.');return job;}
  jobs(owner){return this.db.prepare('SELECT j.* FROM jobs j WHERE owner=? AND NOT EXISTS (SELECT 1 FROM creation_children c WHERE c.job_id=j.id AND c.position>0) ORDER BY created DESC LIMIT 100').all(owner);}
  activeJobs(){return this.db.prepare("SELECT * FROM jobs WHERE status IN ('queued','pending','ingesting') ORDER BY created").all();}
  updateJob(id,{status,upstreamId,result,error}){
    const old=this.job(id);if(!old)throw Error('Unknown job');
    this.db.prepare('UPDATE jobs SET status=?,upstream_id=?,result=?,error=?,updated=? WHERE id=?')
      .run(status??old.status,upstreamId??old.upstream_id,result===undefined?old.result:JSON.stringify(result),error===undefined?old.error:JSON.stringify(error),Date.now(),id);
    return this.job(id);
  }
  originality(jobId){return this.db.prepare("SELECT * FROM analysis_records WHERE job_id=? AND kind='originality'").get(jobId);}
  registerOriginality(jobId,now=Date.now()){
    const job=this.job(jobId);if(!job?.result)return null;
    const payload=JSON.parse(job.payload),result=JSON.parse(job.result);
    // An opt-in instruction in the response is not execution. Only the exact
    // accepted request plus an actual pending record authorizes this GET loop.
    if(payload?.run_originality_gate!==true||result?.success!==true||result?.originality_gate?.status!=='pending')return null;
    const valid=originalityRequestId(result.request_id);
    this.db.prepare("INSERT OR IGNORE INTO analysis_records (job_id,kind,request_id,status,next_poll_at,error_code,created,updated) VALUES (?,'originality',?,?,?,?,?,?)")
      .run(jobId,valid?result.request_id:null,valid?'pending':'unavailable',valid?now+ORIGINALITY_DELAYS[0]:null,valid?null:'ORIGINALITY_ID_INVALID',now,now);
    return this.originality(jobId);
  }
  discoverOriginality(now=Date.now()){
    // Find older ready/partial/ingest-failed deliveries after restart too. The
    // response's poll URL is never followed or used to derive an identifier.
    const rows=this.db.prepare(`SELECT j.id FROM jobs j WHERE j.result IS NOT NULL
      AND json_type(j.payload,'$.run_originality_gate')='true' AND json_type(j.result,'$.success')='true'
      AND json_extract(j.result,'$.originality_gate.status')='pending'
      AND NOT EXISTS (SELECT 1 FROM analysis_records a WHERE a.job_id=j.id AND a.kind='originality') ORDER BY j.created LIMIT 100`).all();
    for(const row of rows)this.registerOriginality(row.id,now);
    return rows.length;
  }
  dueOriginality(now=Date.now()){
    return this.db.prepare("SELECT * FROM analysis_records WHERE kind='originality' AND status='pending' AND next_poll_at<=? ORDER BY next_poll_at LIMIT 20").all(now);
  }
  claimOriginality(record,now=Date.now()){
    // Persist the next delay BEFORE the read request. A process restart cannot
    // create a hot loop; competing snapshots cannot claim the same attempt.
    const next=now+ORIGINALITY_DELAYS[Math.min(record.poll_count+1,ORIGINALITY_DELAYS.length-1)];
    const claim=this.db.prepare("UPDATE analysis_records SET poll_count=poll_count+1,next_poll_at=?,updated=? WHERE job_id=? AND kind='originality' AND status='pending' AND poll_count=? AND next_poll_at<=?")
      .run(next,now,record.job_id,record.poll_count,now);
    return claim.changes===1?this.originality(record.job_id):null;
  }
  finishOriginality(record,{status,result,errorResponse,errorCode=null,httpStatus=null},now=Date.now()){
    if(!ANALYSIS_STATES.has(status))throw Error('Invalid analysis state');
    const old=this.originality(record.job_id);if(!old||old.poll_count!==record.poll_count||old.status!=='pending')return false;
    return this.db.prepare("UPDATE analysis_records SET status=?,next_poll_at=?,result=?,error_response=?,error_code=?,http_status=?,updated=? WHERE job_id=? AND kind='originality' AND status='pending' AND poll_count=?")
      .run(status,status==='pending'?Math.max(old.next_poll_at,now+ORIGINALITY_DELAYS[Math.min(record.poll_count,ORIGINALITY_DELAYS.length-1)]):null,result===undefined?old.result:JSON.stringify(result),errorResponse===undefined?null:JSON.stringify(errorResponse),errorCode,httpStatus,now,record.job_id,record.poll_count).changes===1;
  }
  // One-time repair of the automatic names issued before 2026-09-15 ("Original <6 hex> · Take N"): each such
  // song is re-titled from its creator's own request with the same composer new songs use, in creation
  // (rowid) order so ordinals follow real chronology. Songs whose creator typed a Track title, and songs
  // already carrying a titleBase, are never touched. Idempotent: a second start-up finds nothing to do.
  retitleLegacyTracks(){
    const rows=this.db.prepare("SELECT t.id,t.job_id,t.public,j.payload FROM tracks t JOIN jobs j ON j.id=t.job_id WHERE json_extract(t.public,'$.titleBase') IS NULL ORDER BY t.rowid ASC").all();
    if(!rows.length)return 0;
    const byJob=new Map();
    for(const row of rows){
      const track=JSON.parse(row.public);
      if(!TrackTitleComposer.isLegacyAutomaticTitle(track.title))continue;
      if(!byJob.has(row.job_id))byJob.set(row.job_id,{payload:JSON.parse(row.payload),takes:[]});
      byJob.get(row.job_id).takes.push({id:row.id,track});
    }
    let updated=0;
    const write=this.db.prepare('UPDATE tracks SET public=? WHERE id=?');
    this.transaction(()=>{
      for(const [jobId,{payload,takes}] of byJob){
        const {base:titleBase,source:titleSource}=TrackTitleComposer.baseTitle(payload);
        const titleOrdinal=this.titleOrdinalFor(jobId,titleBase);
        const multiple=takes.length>1||payload.output_package==='variations';
        for(const {id,track} of takes){
          const title=TrackTitleComposer.titleFor({base:titleBase,ordinal:titleOrdinal,takeNumber:track.take,multiple});
          write.run(JSON.stringify({...track,title,titleBase,titleOrdinal,titleSource}),id);updated++;
        }
      }
    });
    return updated;
  }
  // Ordinal for a creation whose derived base title is already used by earlier creations (creation order).
  // A job that was published before keeps the ordinal it received, so republishing never renumbers.
  titleOrdinalFor(jobId,base){
    const previous=this.db.prepare("SELECT json_extract(public,'$.titleOrdinal') AS ordinal FROM tracks WHERE job_id=? AND json_extract(public,'$.titleBase')=? LIMIT 1").get(jobId,base);
    if(Number.isSafeInteger(previous?.ordinal)&&previous.ordinal>=1)return previous.ordinal;
    return this.db.prepare("SELECT count(DISTINCT job_id) AS n FROM tracks WHERE job_id<>? AND json_extract(public,'$.titleBase')=?").get(jobId,base).n+1;
  }
  publish(job,manifest){
    this.transaction(()=>{this.recordMediaSummary(job,manifest);
      const payload=JSON.parse(job.payload);
      const {base:titleBase,source:titleSource}=TrackTitleComposer.baseTitle(payload);
      const titleOrdinal=this.titleOrdinalFor(job.id,titleBase);
      const multiple=manifest.takes.length>1||payload.output_package==='variations';
      for(const take of manifest.takes||[]){if(!take.master||!take.listening)continue;
      const title=TrackTitleComposer.titleFor({base:titleBase,ordinal:titleOrdinal,takeNumber:take.take,multiple});
      const track={id:take.id,title,titleBase,titleOrdinal,titleSource,url:`/api/listen/${take.id}`,art:'night',origin:'Created with PlayMusicPrompts',created:true,owned:true,take:take.take,jobId:job.id,
        genre:payload.genres?.[0]||'',mood:payload.moods?.[0]||'',era:payload.eras?.[0]||'',duration:take.listening.durationSeconds??null,deliveryStatus:take.status,deliveryNotices:take.errors||[],listening:{codec:take.listening.codec,sampleRate:take.listening.sampleRate,channels:take.listening.channels},master:{codec:take.master.codec,sampleRate:take.master.sampleRate,channels:take.master.channels}};
      this.db.prepare('INSERT INTO tracks VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET public=excluded.public,listening_id=excluded.listening_id,master_id=excluded.master_id').run(take.id,job.id,take.take,JSON.stringify(track),take.listening.id,take.master.id);
    }});
  }
  recordMediaSummary(job,manifest){
    if(manifest?.jobId!==undefined&&manifest.jobId!==job.id)throw Error('Media summary belongs to another job');
    const summary=summarizeAssets(JSON.parse(job.payload),job.result?JSON.parse(job.result):null,manifest);
    if(summary)this.db.prepare('INSERT INTO media_summaries VALUES (?,?,?) ON CONFLICT(job_id) DO UPDATE SET summary=excluded.summary,updated=excluded.updated').run(job.id,JSON.stringify(summary),Date.now());
  }
  jobsMissingMediaSummary(){return this.db.prepare("SELECT j.* FROM jobs j WHERE j.status IN ('ready','partial') AND NOT EXISTS (SELECT 1 FROM media_summaries m WHERE m.job_id=j.id) ORDER BY j.created DESC LIMIT 50").all();}
  decorateTrack(track){const child=this.db.prepare('SELECT group_id,role FROM creation_children WHERE job_id=?').get(track.jobId);if(child)return {...track,creationId:child.group_id,seedRole:child.role};const intent=this.generationIntent(track.jobId);return intent?.policy?.mode==='adaptive'&&['faithful','neighbour','explore'].includes(intent.policy.role)?{...track,seedRole:intent.policy.role}:track;}
  catalog(){return this.db.prepare('SELECT public FROM tracks ORDER BY rowid DESC LIMIT 500').all().map(r=>this.decorateTrack(JSON.parse(r.public)));}
  track(id){const row=this.db.prepare('SELECT public FROM tracks WHERE id=?').get(id);return row?this.decorateTrack(JSON.parse(row.public)):null;}
  listeningId(id){return this.db.prepare('SELECT listening_id FROM tracks WHERE id=?').get(id)?.listening_id;}
  publicJob(job,{aggregate=true}={}){
    const analysis=this.originality(job.id);
    const summary=summarizeResult(JSON.parse(job.payload),job.result?JSON.parse(job.result):null,analysis?.result?JSON.parse(analysis.result):null);
    if(analysis){
      // Transport status is not inside the raw JSON: only our recorded HTTP404
      // can mean no-record. Keep the exact engine envelope private and intact.
      if(['no-record','unavailable'].includes(analysis.status))summary.originality.state=analysis.status;
      summary.originality.polling={state:analysis.status,attempts:analysis.poll_count,nextPollAt:analysis.next_poll_at,lastHttpStatus:analysis.http_status};
    }
    const media=this.db.prepare('SELECT summary,updated FROM media_summaries WHERE job_id=?').get(job.id);
    const visible={id:job.id,idempotencyKey:job.idem,status:job.status,createdAt:job.created,updatedAt:Math.max(job.updated,analysis?.updated??0,media?.updated??0),error:job.error?JSON.parse(job.error):null,summary,assetsSummary:media?JSON.parse(media.summary):null,tracks:this.db.prepare('SELECT public FROM tracks WHERE job_id=? ORDER BY take_number').all(job.id).map(r=>this.decorateTrack(JSON.parse(r.public)))};
    visible.canRetryStatus=job.status==='uncertain'&&!!job.upstream_id;
    visible.workflow=publicGenerationWorkflow(visible,JSON.parse(job.payload),job.result?JSON.parse(job.result).status:null);
    const intent=this.generationIntent(job.id);
    if(intent){visible.workflow.intentRequest=requestSnapshot(intent.request);visible.workflow.initialPolicy=publicInitialPolicy(intent.policy);
      if(intent.policy?.version===2&&intent.policy.mode==='adaptive'&&['faithful','neighbour','explore'].includes(intent.policy.role))visible.workflow.adaptivePolicy={version:2,role:intent.policy.role};}
    const group=this.creationGroup(job.id);
    if(group){
      visible.creationId=group.id;
      if(aggregate&&group.id===job.id){
        const children=group.children.map(child=>({role:child.role,job:this.publicJob(child,{aggregate:false})})),primary=children[0].job;
        const pending=children.filter(child=>['queued','submitting','pending','ingesting'].includes(child.job.status));
        visible.tracks=children.flatMap(child=>child.job.tracks);
        visible.status=pending.length?(pending.some(child=>child.job.status==='ingesting')?'ingesting':pending.some(child=>child.job.status==='pending')?'pending':pending.some(child=>child.job.status==='submitting')?'submitting':'queued'):children.every(child=>child.job.status==='ready'&&child.job.tracks.length)?'ready':visible.tracks.length?'partial':children.some(child=>child.job.status==='uncertain')?'uncertain':'failed';
        visible.updatedAt=Math.max(...children.map(child=>child.job.updatedAt));
        const failures=children.filter(child=>['failed','partial','uncertain','ingest_failed'].includes(child.job.status));
        visible.error=primary.error||(!pending.length&&failures.length?{code:'INITIAL_CREATION_PARTIAL',message:'Some music directions need attention. Delivered songs are saved; no generation has been repeated.'}:null);
        visible.creation={id:group.id,mode:'directed-three',primaryJobId:group.id,primaryTrackId:primary.tracks[0]?.id||null,primaryStatus:primary.status,requestedTakes:3,deliveredTakes:visible.tracks.length,children};
        // Overall worker state may still be pending while the faithful primary
        // already plays. Each child retains its own actual workflow below.
        visible.workflow=publicGenerationWorkflow(visible,JSON.parse(job.payload),null);
        visible.workflow.intentRequest=requestSnapshot(group.request);visible.workflow.initialPolicy=publicInitialPolicy(intent?.policy);
        visible.workflow.steps=visible.workflow.steps.map(step=>{
          const actual=children.map(child=>child.job.workflow.steps.find(item=>item.id===step.id)?.state||'pending'),completed=actual.filter(state=>state==='complete').length;
          const state=completed===3?'complete':actual.includes('active')?'active':actual.includes('failed')?'failed':actual.includes('unavailable')?'unavailable':'pending';
          return {...step,state,detail:`${completed} of 3 music directions have completed this step.`};
        });
        if(pending.length){visible.workflow.title='Preparing your three music directions';visible.workflow.message=`${visible.tracks.length} ${visible.tracks.length===1?'song is':'songs are'} saved. ${pending.length} ${pending.length===1?'direction is':'directions are'} still in progress.`;}
      }
    }
    return visible;
  }
  playlists(owner){return this.db.prepare('SELECT * FROM playlists WHERE owner=? ORDER BY created DESC').all(owner).map(p=>({id:p.id,name:p.name,createdAt:p.created,revision:p.revision,songs:this.db.prepare('SELECT track_id FROM playlist_items WHERE playlist_id=? ORDER BY position').all(p.id).map(i=>i.track_id)}));}
  playlist(id,owner){const p=this.db.prepare('SELECT * FROM playlists WHERE id=? AND owner=?').get(id,owner);if(!p)throw problem(404,'NOT_FOUND','Playlist not found.');return p;}
  createPlaylist(owner,name){const id=randomUUID();this.db.prepare('INSERT INTO playlists (id,owner,name,created) VALUES (?,?,?,?)').run(id,owner,name,Date.now());return this.playlists(owner).find(p=>p.id===id);}
  changePlaylist(id,owner,body){return this.transaction(()=>{const current=this.playlist(id,owner);if(body.revision!==current.revision)throw problem(409,'PLAYLIST_CHANGED','This playlist changed on another device. Review the latest version and try again.');if(body.name!==undefined)this.db.prepare('UPDATE playlists SET name=? WHERE id=?').run(body.name,id);
    if(body.songs!==undefined){if(body.songs.some(t=>!this.track(t)))throw problem(400,'INVALID_TRACK','Only available songs can be added.');this.db.prepare('DELETE FROM playlist_items WHERE playlist_id=?').run(id);for(const [i,t] of [...new Set(body.songs)].entries())this.db.prepare('INSERT INTO playlist_items VALUES (?,?,?)').run(id,t,i);}
    this.db.prepare('UPDATE playlists SET revision=revision+1 WHERE id=?').run(id);return this.playlists(owner).find(p=>p.id===id);});}
  deletePlaylist(id,owner){this.playlist(id,owner);this.db.prepare('DELETE FROM playlists WHERE id=? AND owner=?').run(id,owner);}
  favorites(owner){return this.db.prepare('SELECT track_id AS id,created AS savedAt FROM favorites WHERE owner=? ORDER BY created DESC').all(owner);}
  favorite(owner,id,save){if(!this.track(id))throw problem(404,'NOT_FOUND','Song not found.');if(save)this.db.prepare('INSERT OR IGNORE INTO favorites VALUES (?,?,?)').run(owner,id,Date.now());else this.db.prepare('DELETE FROM favorites WHERE owner=? AND track_id=?').run(owner,id);return this.favorites(owner);}
  cleanup(){const now=Date.now();this.db.prepare('DELETE FROM sessions WHERE expires<?').run(now);this.db.prepare('DELETE FROM counters WHERE expires<?').run(now-86400000);this.db.prepare('DELETE FROM oidc_attempts WHERE expires<?').run(now);}
}
