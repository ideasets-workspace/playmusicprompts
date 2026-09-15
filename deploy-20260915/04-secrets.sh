#!/bin/bash
# 04-secrets.sh — secrets and environment for the new website, all produced ON the host (no secret value ever
# leaves the machine or appears in this output):
#   1. the engine API key is read from the old app's /opt/playmusicprompts/.env (PMP_API_KEY), validated against the
#      application's own pattern, and stored in Secrets Manager as playmusicprompts/website/engine-api-key;
#   2. PMP_PROXY_SECRET is generated here (48 random bytes, base64) and shared by the app and the gateway;
#   3. the CloudFront X-Origin-Verify value is taken from the old .env (ORIGIN_VERIFY_SECRET) and its sha256 is
#      printed so the sender can compare it with the hash of the value in the CloudFront config (never the value);
#   4. /etc/pmp-website.env and /etc/pmp-gateway.env are written root:root 0600 for systemd EnvironmentFile=.
set -euo pipefail
export AWS_REGION=eu-central-1 AWS_DEFAULT_REGION=eu-central-1
SECRET_NAME="playmusicprompts/website/engine-api-key"
OLD_ENV=/opt/playmusicprompts/.env

value_of() { sudo grep -E "^$1=" "$OLD_ENV" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' | tr -d '\r\n'; }

echo "== 1 engine key -> Secrets Manager =="
KEY="$(value_of PMP_API_KEY)"
if ! [[ "$KEY" =~ ^pmp_[A-Za-z0-9_-]{43}$ ]]; then echo "PMP_API_KEY in old .env does not match the application's pattern (len ${#KEY})"; exit 2; fi
if aws secretsmanager describe-secret --secret-id "$SECRET_NAME" >/dev/null 2>&1; then
  aws secretsmanager put-secret-value --secret-id "$SECRET_NAME" --secret-string "$KEY" --query VersionId --output text >/dev/null && echo "existing secret updated"
else
  aws secretsmanager create-secret --name "$SECRET_NAME" --description "PlayMusicPrompts website: music engine tenant API key (moved from /opt/playmusicprompts/.env on 2026-09-15)" --secret-string "$KEY" --tags Key=project,Value=playmusicprompts --query ARN --output text
fi
READBACK="$(aws secretsmanager get-secret-value --secret-id "$SECRET_NAME" --query SecretString --output text)"
[ "$READBACK" = "$KEY" ] && echo "read-back equals source: yes (sha256 $(printf %s "$KEY" | sha256sum | cut -c1-16)...)"
unset READBACK

echo "== 2 proxy secret =="
PROXY_SECRET="$(openssl rand -base64 48 | tr -d '\n')"; echo "generated len ${#PROXY_SECRET}"

echo "== 3 origin verify (from old .env) =="
ORIGIN_VERIFY="$(value_of ORIGIN_VERIFY_SECRET)"
echo "origin-verify len ${#ORIGIN_VERIFY} sha256 $(printf %s "$ORIGIN_VERIFY" | sha256sum | cut -d' ' -f1)"

echo "== 4 env files =="
sudo install -m 0600 -o root -g root /dev/null /etc/pmp-website.env
sudo tee /etc/pmp-website.env >/dev/null <<EOF
NODE_ENV=production
PORT=4177
PMP_ORIGIN=https://www.playmusicprompts.com
PMP_STATE_DIR=/var/lib/pmp-website
PMP_PROXY_SECRET=${PROXY_SECRET}
PMP_CREDENTIAL_MODE=aws-wif
PMP_API_KEY_SECRET_ID=${SECRET_NAME}
GOOGLE_APPLICATION_CREDENTIALS=/opt/playmusicprompts/website-wif-config.json
AWS_REGION=eu-central-1
AWS_DEFAULT_REGION=eu-central-1
PMP_FFMPEG=/opt/ffmpeg/ffmpeg
PMP_FFPROBE=/opt/ffmpeg/ffprobe
PMP_ACCOUNT_EMAIL_VERIFICATION=off
EOF
sudo install -m 0600 -o root -g root /dev/null /etc/pmp-gateway.env
sudo tee /etc/pmp-gateway.env >/dev/null <<EOF
PMP_GATEWAY_PORT=8080
PMP_GATEWAY_BIND=0.0.0.0
PMP_PORT=4177
PMP_ORIGIN_VERIFY_SECRET=${ORIGIN_VERIFY}
PMP_PROXY_SECRET=${PROXY_SECRET}
EOF
ls -l /etc/pmp-website.env /etc/pmp-gateway.env
echo "website env keys:"; sudo cut -d= -f1 /etc/pmp-website.env | tr '\n' ' '; echo
echo "gateway env keys:"; sudo cut -d= -f1 /etc/pmp-gateway.env | tr '\n' ' '; echo
