#!/bin/bash
# 06d-partial-job.sh — read-only: why is legacy job __JOB__ partial? Shows the engine result's takes and the owned
# media manifest's per-take status/errors (no URLs printed).
set -u
export PATH="/opt/node24/bin:$PATH"
JOB="__JOB__"
echo "== media dir =="; sudo find /var/lib/pmp-website/media -path "*${JOB}*" -maxdepth 3 | head -20
sudo -u pmpweb env PATH="$PATH" node --input-type=module -e "
const {Store}=await import('/opt/pmp-website/server/store.mjs');const s=new Store('/var/lib/pmp-website/website.sqlite');
const j=s.db.prepare('select payload,result from jobs where id=?').get('${JOB}');const r=JSON.parse(j.result);
console.log('takes_delivered', r.takes_delivered, 'takes_requested', r.takes_requested, 'tracks', (r.tracks||[]).map(t=>({take:t.take,kind:t.kind,uri_bucket:String(t.gcs_uri||'').split('/')[2],has_uri:!!t.gcs_uri})), 'source_take', (r.source_take||[]).map(t=>({take:t.take,has_uri:!!t.gcs_uri})));
console.log('render_plan.processed', !!r.render_plan?.processed_gcs_uri, 'shortfall', JSON.stringify(r.generation_shortfall||null).slice(0,300));
const ms=s.db.prepare('select summary from media_summaries where job_id=?').get('${JOB}');console.log('media_summary', (ms?.summary||'').slice(0,1200));
s.close();" 2>/dev/null
for f in $(sudo find /var/lib/pmp-website/media -path "*${JOB}*" -name '*.json' | head -3); do echo "== $f =="; sudo sed -E 's/"(url|signed_url|delivery_url)":"[^"]*"/"\1":"<omitted>"/g' "$f" | head -c 2500; echo; done
echo "== legacy side: tracks of this job =="; DBURL=$(sudo grep '^DATABASE_URL=' /opt/playmusicprompts/.env | cut -d= -f2- | tr -d '"'); psql "$DBURL" -Atc "select id, take, \"isPublic\", \"durationSeconds\", \"storageKey\" from music_tracks where \"jobId\"='${JOB}' order by take;"
