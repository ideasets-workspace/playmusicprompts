#!/bin/bash
# 10-rate-limit-diagnosis.sh — read-only: which jobs failed with the engine's RATE_LIMITED, what the engine's raw body
# said (limits / retry-after), how many generation requests the tenant sent today, and the engine's capabilities view.
set -u
export PATH="/opt/node24/bin:$PATH"
sudo -u pmpweb env PATH="$PATH" node --input-type=module -e "
const {Store}=await import('/opt/pmp-website/server/store.mjs');const s=new Store('/var/lib/pmp-website/website.sqlite');
const dayStart=new Date();dayStart.setUTCHours(0,0,0,0);
console.log('jobs today by status', JSON.stringify(s.db.prepare('select status, count(*) n from jobs where created>=? group by status').all(dayStart.getTime())));
console.log('visitor jobs total', s.db.prepare(\"select count(*) n from jobs where owner<>'legacy-catalogue'\").get().n, 'distinct owners', s.db.prepare(\"select count(distinct owner) n from jobs where owner<>'legacy-catalogue'\").get().n);
for (const j of s.db.prepare(\"select id, status, created, error, result from jobs where owner<>'legacy-catalogue' order by created desc limit 12\").all()) {
  const e=j.error?JSON.parse(j.error):null; let body=null; try{ body=j.result?JSON.parse(j.result):null; }catch{}
  const raw = body && (body.error||body.error_code||body.message||body.detail) ? JSON.stringify({error_code:body.error_code, error:body.error, message:body.message, detail:body.detail, retry_after:body.retry_after, limit:body.limit, quota:body.quota, remaining:body.remaining}).slice(0,400) : (body&&body.status?('status:'+body.status):'');
  console.log(new Date(j.created).toISOString(), j.status, e?.code||'-', raw);
}
console.log('counters', JSON.stringify(s.db.prepare(\"select key, count, window_start from counters where key like 'generation%' or key like 'creation%' or key like 'admission%' order by window_start desc limit 12\").all()).slice(0,1500));
s.close();" 2>/dev/null
echo "== app log: engine errors (last 2h) =="; sudo journalctl -u pmp-website --since '-2 hours' --no-pager -o cat | grep -E 'RATE_LIMITED|429|job_notice|request_error' | tail -25
