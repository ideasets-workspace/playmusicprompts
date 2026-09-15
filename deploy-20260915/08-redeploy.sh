#!/bin/bash
# 08-redeploy.sh — zero-surprise redeploy of the runtime tree: download + SHA-256 check, unpack and `npm ci` into a
# STAGING directory, then atomically swap it into /opt/pmp-website (previous tree kept as /opt/pmp-website.prev)
# and restart the two units. The gateway keeps answering during the seconds pmp-website restarts (502 with an
# honest JSON body, never a hang). Substituted: ARCHIVE_KEY, SHA256.
set -euo pipefail
ARCHIVE_KEY="__ARCHIVE_KEY__"; EXPECTED_SHA="__SHA256__"; BUCKET="playmusicprompts-deploy-376210053952"
export PATH="/opt/node24/bin:$PATH" AWS_REGION=eu-central-1 AWS_DEFAULT_REGION=eu-central-1
STAGE=/opt/pmp-website.next; WORK=/tmp/pmp-redeploy; rm -rf "$WORK"; mkdir -p "$WORK"; cd "$WORK"
aws s3 cp "s3://${BUCKET}/${ARCHIVE_KEY}" ./website.tar.gz --only-show-errors --region eu-central-1
echo "${EXPECTED_SHA}  website.tar.gz" | sha256sum -c -
sudo rm -rf "$STAGE"; sudo mkdir -p "$STAGE"; sudo tar -xzf website.tar.gz -C "$STAGE"; sudo chown -R root:root "$STAGE"
(cd "$STAGE" && sudo env PATH="$PATH" npm ci --no-audit --no-fund 2>&1 | tail -1 && npm run check 2>&1 | tail -1)
sudo rm -rf /opt/pmp-website.prev
sudo mv /opt/pmp-website /opt/pmp-website.prev && sudo mv "$STAGE" /opt/pmp-website
sudo systemctl restart pmp-website.service; sleep 3; sudo systemctl restart pmp-gateway.service; sleep 2
systemctl is-active pmp-website pmp-gateway
sudo journalctl -u pmp-website -n 2 --no-pager -o cat | grep -v Experimental || true
OV="$(sudo grep '^PMP_ORIGIN_VERIFY_SECRET=' /etc/pmp-gateway.env | cut -d= -f2-)"; H="www.playmusicprompts.com"
for p in /robots.txt /sitemap.xml /healthz; do echo -n "$p -> "; curl -s -o /dev/null -w '%{http_code} %{content_type}\n' -H "Host: $H" -H "X-Origin-Verify: $OV" -H "X-Forwarded-For: 203.0.113.9" "http://127.0.0.1:80$p"; done
echo -n "catalog -> "; curl -s -H "Host: $H" -H "X-Origin-Verify: $OV" -H "X-Forwarded-For: 203.0.113.9" http://127.0.0.1:80/api/catalog | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).tracks.length))"
ls -ld /opt/pmp-website /opt/pmp-website.prev
