#!/bin/bash
# 07-cutover.sh — the switch: stop and disable the old Next.js unit (kept on disk, restorable with one command),
# move the gateway to :80, and verify on the host through the gateway with the real CloudFront secret.
# Rollback (seconds): sudo sed -i 's/^PMP_GATEWAY_PORT=80$/PMP_GATEWAY_PORT=8080/' /etc/pmp-gateway.env &&
#   sudo systemctl restart pmp-gateway && sudo systemctl enable --now playmusicprompts.service
set -euo pipefail
echo "== before =="; systemctl is-active playmusicprompts pmp-website pmp-gateway; ss -ltnp | awk '/:80 |:8080 |:4177 /'
sudo systemctl disable --now playmusicprompts.service
sudo sed -i 's/^PMP_GATEWAY_PORT=8080$/PMP_GATEWAY_PORT=80/' /etc/pmp-gateway.env
sudo grep -c '^PMP_GATEWAY_PORT=80$' /etc/pmp-gateway.env
sudo systemctl restart pmp-gateway.service; sleep 2
echo "== after =="; systemctl is-active playmusicprompts || true; systemctl is-active pmp-website pmp-gateway; ss -ltnp | awk '/:80 |:8080 |:4177 /'
sudo journalctl -u pmp-gateway -n 3 --no-pager -o cat
OV="$(sudo grep '^PMP_ORIGIN_VERIFY_SECRET=' /etc/pmp-gateway.env | cut -d= -f2-)"; H="www.playmusicprompts.com"
echo -n "direct (no secret) -> "; curl -s -o /dev/null -w '%{http_code}\n' -H "Host: $H" http://127.0.0.1:80/
echo -n "index via :80 -> "; curl -s -o /dev/null -w '%{http_code} %{size_download}B\n' -H "Host: $H" -H "X-Origin-Verify: $OV" -H "X-Forwarded-For: 203.0.113.9" http://127.0.0.1:80/index.html
echo -n "catalog count -> "; curl -s -H "Host: $H" -H "X-Origin-Verify: $OV" -H "X-Forwarded-For: 203.0.113.9" http://127.0.0.1:80/api/catalog | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.tracks.length, JSON.stringify(j.tracks[0]?.title))})"
