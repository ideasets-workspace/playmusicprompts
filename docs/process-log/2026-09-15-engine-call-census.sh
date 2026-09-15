#!/bin/bash
# 2026-09-15-engine-call-census.sh — READ-ONLY census of today's engine traffic from the production host, run to answer
# Berk's "emin misin" honestly: the application writes no per-call engine log, so upper bounds are reconstructed
# from the gateway log (site routes that reach the engine on a cache miss) and from the store (import + generations).
set -u
export PATH="/opt/node24/bin:$PATH"
echo "== today, gateway hits on engine-touching site routes =="
sudo journalctl -u pmp-gateway --since 'today' --no-pager -o cat | grep '"event":"gateway"' | grep -E '"path":"/api/(controls-schema|capabilities|connection|previews|enhancements)"' | sed -E 's/.*"path":"([^"]*)","status":([0-9]+).*/\1 \2/' | sort | uniq -c
echo "== distinct 5-min windows with a controls-schema hit (upper bound of capabilities calls) =="
sudo journalctl -u pmp-gateway --since 'today' --no-pager -o short-iso | grep '"path":"/api/controls-schema"' | cut -c1-16 | awk -F: '{ printf "%s:%02d\n", $1, int($2/5)*5 }' | sort -u | wc -l
echo "== distinct 30-s windows with a /api/connection hit (upper bound of health calls) =="
sudo journalctl -u pmp-gateway --since 'today' --no-pager -o short-iso | grep '"path":"/api/connection"' | cut -c1-19 | awk -F: '{ printf "%s:%s:%02d\n", $1, $2, int($3/30)*30 }' | sort -u | wc -l
sudo -u pmpweb env PATH="$PATH" node --input-type=module -e "
const {Store}=await import('/opt/pmp-website/server/store.mjs');const fs=await import('node:fs');const s=new Store('/var/lib/pmp-website/website.sqlite');
console.log('legacy jobs', s.db.prepare(\"select count(*) n from jobs where owner='legacy-catalogue'\").get().n);
console.log('media files on disk (each downloaded via one delivery-url call)', fs.readdirSync('/var/lib/pmp-website/media',{recursive:true}).filter(f=>/\.(mp3|wav|flac|m4a|ogg)$/i.test(String(f))).length);
console.log('visitor submits', s.db.prepare(\"select count(*) n from jobs where owner<>'legacy-catalogue'\").get().n);
try { console.log('originality records', s.db.prepare('select count(*) n from originality').get().n); } catch (e) { console.log('originality table:', e.message); }
s.close();" 2>/dev/null
