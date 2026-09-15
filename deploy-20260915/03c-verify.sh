#!/bin/bash
# 03c-verify.sh — run the website's own test suite on the production host from a THROWAWAY tree (/tmp/pmp-verify)
# that carries the test fixtures from the project docs tree, with the host's ffmpeg/ffprobe. /opt/pmp-website is
# not touched. Substituted by ssm-run.mjs: VERIFY_KEY, SHA256.
set -euo pipefail
VERIFY_KEY="__VERIFY_KEY__"; EXPECTED_SHA="__SHA256__"; BUCKET="playmusicprompts-deploy-376210053952"
export PATH="/opt/node24/bin:$PATH" AWS_REGION=eu-central-1 AWS_DEFAULT_REGION=eu-central-1
export PMP_FFMPEG=/opt/ffmpeg/ffmpeg PMP_FFPROBE=/opt/ffmpeg/ffprobe
WORK=/tmp/pmp-verify; rm -rf "$WORK"; mkdir -p "$WORK"; cd "$WORK"
aws s3 cp "s3://${BUCKET}/${VERIFY_KEY}" ./verify.tar.gz --only-show-errors --region eu-central-1
echo "${EXPECTED_SHA}  verify.tar.gz" | sha256sum -c -
tar -xzf verify.tar.gz
cd website
npm ci --no-audit --no-fund 2>&1 | tail -1
echo "== npm test on host (Node $(node -v), ffmpeg $(/opt/ffmpeg/ffmpeg -version | head -1 | cut -d' ' -f3)) =="
npm test > "$WORK/test.log" 2>&1 || true
grep -E '^. (tests|pass|fail|cancelled|skipped) [0-9]+' "$WORK/test.log"
echo "== failures (if any) =="; grep -n -E '^not ok|^  not ok' "$WORK/test.log" | head -30 || true
grep -n -B2 -A12 'failureType' "$WORK/test.log" | head -80 || true
