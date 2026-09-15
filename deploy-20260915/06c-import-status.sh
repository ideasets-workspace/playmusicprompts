#!/bin/bash
# 06c-import-status.sh — read-only: job statuses, track count, titles, and the detail of any non-ready job.
set -u
export PATH="/opt/node24/bin:$PATH"
sudo -u pmpweb env PATH="$PATH" node --input-type=module -e "
const {Store}=await import('/opt/pmp-website/server/store.mjs');const s=new Store('/var/lib/pmp-website/website.sqlite');
console.log('statuses', JSON.stringify(s.db.prepare('select status, count(*) n from jobs group by status').all()));
console.log('tracks', s.db.prepare('select count(*) n from tracks').get().n);
for (const r of s.db.prepare('select id,status,error from jobs where status<>\'ready\'').all()) {
  console.log('NOT READY', r.id, r.status, (r.error||'').slice(0,300));
  for (const t of s.db.prepare('select public from tracks where job_id=?').all(r.id)) { const p=JSON.parse(t.public); console.log('   take', p.take, p.deliveryStatus, JSON.stringify(p.deliveryNotices).slice(0,300)); }
}
for (const t of s.db.prepare('select public from tracks order by rowid').all()) { const p=JSON.parse(t.public); console.log('TRACK', p.take, JSON.stringify(p.title), p.genre||'-', p.duration); }
s.close();" 2>/dev/null
echo "== media on disk =="; sudo du -sh /var/lib/pmp-website/media 2>/dev/null; sudo find /var/lib/pmp-website/media -type f | wc -l
echo "== notices in log =="; sudo journalctl -u pmp-website --since '-10 min' --no-pager -o cat | grep -E '_notice|error' | grep -v ExperimentalWarning | head -20 || true
