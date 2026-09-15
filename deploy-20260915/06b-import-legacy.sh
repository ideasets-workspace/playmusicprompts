#!/bin/bash
# 06b-import-legacy.sh — export the public legacy catalogue from Postgres as JSON (read-only on Postgres), fetch the
# import tool from the deploy bucket (SHA-256 checked), and run it against the new site's SQLite.
# MODE=__MODE__ : "dry-run" prints the plan and writes nothing; "apply" stops pmp-website, inserts the jobs in the
# `ingesting` state, restarts pmp-website (whose own worker then ingests through the engine's delivery path).
set -euo pipefail
MODE="__MODE__"; TOOL_KEY="__TOOL_KEY__"; TOOL_SHA="__TOOL_SHA__"
export PATH="/opt/node24/bin:$PATH" AWS_REGION=eu-central-1 AWS_DEFAULT_REGION=eu-central-1
WORK=/tmp/pmp-legacy; sudo rm -rf "$WORK"; sudo mkdir -p "$WORK"; sudo chown pmpweb:pmpweb "$WORK"; sudo chmod 750 "$WORK"
DBURL=$(sudo grep '^DATABASE_URL=' /opt/playmusicprompts/.env | cut -d= -f2- | tr -d '"')
psql "$DBURL" -Atc "
  select json_agg(j order by j.created_at) from (
    select mj.id as job_id, mj.\"requestBody\" as request, mj.\"responseBody\" as response, mj.\"createdAt\" as created_at,
           (select json_agg(json_build_object('id',t.id,'take',t.take,'genres',t.genres,'moods',t.moods,'plays',t.\"playCount\",'likes',t.\"likeCount\")) from music_tracks t where t.\"jobId\"=mj.id and t.\"isPublic\") as tracks
    from music_jobs mj where exists (select 1 from music_tracks t where t.\"jobId\"=mj.id and t.\"isPublic\")
  ) j;" | sudo tee "$WORK/legacy.json" >/dev/null
sudo chown pmpweb:pmpweb "$WORK/legacy.json"; sudo chmod 640 "$WORK/legacy.json"
echo "legacy.json: $(stat -c %s "$WORK/legacy.json") bytes, jobs: $(node -e "console.log(JSON.parse(require('fs').readFileSync('$WORK/legacy.json','utf8')).length)")"
aws s3 cp "s3://playmusicprompts-deploy-376210053952/${TOOL_KEY}" "$WORK/import-legacy-catalogue.mjs" --only-show-errors --region eu-central-1
echo "${TOOL_SHA}  $WORK/import-legacy-catalogue.mjs" | sha256sum -c -
sudo chown pmpweb:pmpweb "$WORK/import-legacy-catalogue.mjs"
if [ "$MODE" = "apply" ]; then
  sudo systemctl stop pmp-website.service; sleep 1
  sudo -u pmpweb env PATH="$PATH" node "$WORK/import-legacy-catalogue.mjs" "$WORK/legacy.json" /var/lib/pmp-website --apply
  sudo systemctl start pmp-website.service; sleep 3; systemctl is-active pmp-website
  echo "== worker progress (first 60 s) =="
  for i in 1 2 3 4 5 6; do sleep 10; sudo -u pmpweb env PATH="$PATH" node -e "
    const {Store}=await import('/opt/pmp-website/server/store.mjs');const s=new Store('/var/lib/pmp-website/website.sqlite');
    console.log(new Date().toISOString(), JSON.stringify(s.db.prepare('select status, count(*) n from jobs group by status').all()), 'tracks', s.db.prepare('select count(*) n from tracks').get().n);s.close();" --input-type=module; done
  echo "== app log (errors) =="; sudo journalctl -u pmp-website --since '-3 min' --no-pager -o cat | grep -i -E 'notice|error|fail' | head -20 || true
else
  sudo -u pmpweb env PATH="$PATH" node "$WORK/import-legacy-catalogue.mjs" "$WORK/legacy.json" /var/lib/pmp-website
fi
