#!/bin/bash
# 03-install.sh — fetch the packaged website from the deploy bucket, verify its SHA-256, unpack into /opt/pmp-website,
# install the locked dependencies with Node 24, and run the site's OWN test suite and syntax check on the host.
# The old application is not touched. Arguments are substituted by the sender (see ssm-run.mjs call): ARCHIVE_KEY, SHA256.
set -euo pipefail
ARCHIVE_KEY="__ARCHIVE_KEY__"
EXPECTED_SHA="__SHA256__"
BUCKET="playmusicprompts-deploy-376210053952"
export PATH="/opt/node24/bin:$PATH"
# Istanbul Local Zone: IMDS reports eu-central-1-ist-1 and the CLI then builds a non-existent S3 endpoint
# (measured 2026-09-15: "Could not connect to ...s3.eu-central-1-ist-1.amazonaws.com"); pin the parent region.
export AWS_REGION=eu-central-1 AWS_DEFAULT_REGION=eu-central-1
WORK=/tmp/pmp-install; rm -rf "$WORK"; mkdir -p "$WORK"; cd "$WORK"
aws s3 cp "s3://${BUCKET}/${ARCHIVE_KEY}" ./website.tar.gz --only-show-errors --region eu-central-1
echo "${EXPECTED_SHA}  website.tar.gz" | sha256sum -c -
sudo rm -rf /opt/pmp-website/* /opt/pmp-website/.[!.]* 2>/dev/null || true
sudo tar -xzf website.tar.gz -C /opt/pmp-website
sudo chown -R root:root /opt/pmp-website
cd /opt/pmp-website
echo "== node/npm used =="; node -v; npm -v
echo "== npm ci =="; sudo env PATH="$PATH" npm ci --no-audit --no-fund 2>&1 | tail -5
echo "== npm run check =="; npm run check 2>&1 | tail -3
echo "== npm test (on the production host, Node 24) =="
npm test > "$WORK/test.log" 2>&1 || true
grep -E '^. (tests|pass|fail|cancelled|skipped) [0-9]+' "$WORK/test.log" || tail -30 "$WORK/test.log"
grep -E '^(not ok|.{1,3} .*failing)' "$WORK/test.log" | head -20 || true
echo "== tree =="; ls -la /opt/pmp-website | head -20; du -sh /opt/pmp-website
