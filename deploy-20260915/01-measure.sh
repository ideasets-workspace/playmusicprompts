#!/bin/bash
# 01-measure.sh — READ-ONLY inventory of the production host before any change (deploy 2026-09-15).
# Prints versions, services, ports, directories, env variable NAMES (never values), disk and memory.
set -u
echo "== os ==";      cat /etc/os-release | head -2; uname -r; nproc; free -m | head -2; df -h / | tail -1
echo "== node ==";    command -v node && node -v; command -v npm && npm -v
echo "== tools ==";   for t in nginx ffmpeg ffprobe psql git tar curl; do printf '%s: ' "$t"; command -v "$t" || echo absent; done
echo "== dnf node repos =="; ls /etc/yum.repos.d/ | grep -i -E 'node|nodesource' || echo "no nodesource repo"
echo "== services =="; systemctl list-units --type=service --all --no-pager --no-legend | grep -E 'playmusic|hydra|pmp|nginx|postgres' || true
echo "== listening =="; ss -ltnp 2>/dev/null | awk 'NR==1 || /:80 |:8080 |:4177 |:3000 |:4444 |:4445 |:5432 /'
echo "== /opt =="; ls -la /opt/ 2>/dev/null; ls -la /opt/playmusicprompts/ 2>/dev/null | head -40
echo "== old unit =="; systemctl cat playmusicprompts.service 2>/dev/null | sed -e 's/\(Environment=[A-Z_]*=\).*/\1<redacted>/' | head -60
echo "== old env NAMES =="; if [ -f /opt/playmusicprompts/.env ]; then sudo cut -d= -f1 /opt/playmusicprompts/.env; else echo "no .env"; fi
echo "== wif file =="; ls -la /opt/playmusicprompts/website-wif-config.json 2>/dev/null && sudo head -c 400 /opt/playmusicprompts/website-wif-config.json | tr -d '\n' | sed -e 's/"[^"]*private[^"]*"[^,]*//g'; echo
echo "== users =="; id ec2-user; id pmpweb 2>/dev/null || echo "pmpweb absent"
echo "== existing new dirs =="; ls -la /opt/pmp-website /var/lib/pmp-website /etc/pmp-website.env 2>&1 | head -5
echo "== instance identity =="; TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60"); curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/info | head -5; echo
echo "== postgres catalogue count =="; if [ -f /opt/playmusicprompts/.env ]; then DBURL=$(sudo grep '^DATABASE_URL=' /opt/playmusicprompts/.env | cut -d= -f2- | tr -d '"'); psql "$DBURL" -Atc "select count(*) filter (where \"isPublic\"), count(*) from music_tracks;" 2>&1 | head -3; fi
