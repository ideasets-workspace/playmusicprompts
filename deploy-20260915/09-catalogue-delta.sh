#!/bin/bash
# 09-catalogue-delta.sh — read-only: who created the tracks beyond the 21 legacy ones? Jobs by owner class and time.
set -u
export PATH="/opt/node24/bin:$PATH"
sudo -u pmpweb env PATH="$PATH" node --input-type=module -e "
const {Store}=await import('/opt/pmp-website/server/store.mjs');const s=new Store('/var/lib/pmp-website/website.sqlite');
console.log('jobs by owner class', JSON.stringify(s.db.prepare(\"select case when owner='legacy-catalogue' then 'legacy' else 'visitor' end k, status, count(*) n from jobs group by 1,2\").all()));
for (const j of s.db.prepare(\"select id, status, created, updated, substr(payload,1,160) p from jobs where owner<>'legacy-catalogue' order by created\").all()) console.log('VISITOR JOB', j.id.slice(0,8), j.status, new Date(j.created).toISOString(), j.p);
console.log('tracks per job', JSON.stringify(s.db.prepare('select job_id, count(*) n from tracks group by job_id having n>1').all()));
console.log('tracks total', s.db.prepare('select count(*) n from tracks').get().n, 'distinct listening ids', s.db.prepare('select count(distinct listening_id) n from tracks').get().n);
console.log('sessions', s.db.prepare('select count(*) n from sessions').get().n, 'users', s.db.prepare('select count(*) n from users').get().n);
s.close();" 2>/dev/null
echo "== gateway requests last 30 min (method path status) =="; sudo journalctl -u pmp-gateway --since '-30 min' --no-pager -o cat | grep '"event":"gateway"' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const m={};for(const l of d.trim().split('\n')){try{const j=JSON.parse(l);const k=j.method+' '+j.path+' '+j.status;m[k]=(m[k]||0)+1}catch{}}console.log(Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,25).map(e=>e[1]+' '+e[0]).join('\n'))})"
