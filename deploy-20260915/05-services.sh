#!/bin/bash
# 05-services.sh — install and start the two systemd units, then smoke-test through the gateway on :8080 with the
# real CloudFront secret (read from the host env file, never printed). The old app on :80 keeps running.
#   pmp-website.service : node server/main.mjs as pmpweb, loopback 4177, state in /var/lib/pmp-website
#   pmp-gateway.service : node server/gateway-main.mjs as pmpweb, :8080 now (:80 at cutover, CAP_NET_BIND_SERVICE)
set -euo pipefail
sudo tee /etc/systemd/system/pmp-website.service >/dev/null <<'EOF'
[Unit]
Description=PlayMusicPrompts website application (loopback 4177; reached only through pmp-gateway)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pmpweb
Group=pmpweb
WorkingDirectory=/opt/pmp-website
EnvironmentFile=/etc/pmp-website.env
ExecStart=/opt/node24/bin/node server/main.mjs
Restart=always
RestartSec=3
KillSignal=SIGTERM
TimeoutStopSec=30
# Hardening: the process needs only its state directory for writes.
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/pmp-website
PrivateTmp=true
ProtectKernelTunables=true
ProtectControlGroups=true
RestrictSUIDSGID=true
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/pmp-gateway.service >/dev/null <<'EOF'
[Unit]
Description=PlayMusicPrompts edge gateway (CloudFront -> loopback application)
After=network-online.target pmp-website.service
Wants=network-online.target

[Service]
Type=simple
User=pmpweb
Group=pmpweb
WorkingDirectory=/opt/pmp-website
EnvironmentFile=/etc/pmp-gateway.env
ExecStart=/opt/node24/bin/node server/gateway-main.mjs
Restart=always
RestartSec=3
KillSignal=SIGTERM
TimeoutStopSec=30
# Binds a privileged port at cutover (:80) without root.
AmbientCapabilities=CAP_NET_BIND_SERVICE
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
ProtectKernelTunables=true
ProtectControlGroups=true
RestrictSUIDSGID=true
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now pmp-website.service
sleep 4
sudo systemctl enable --now pmp-gateway.service
sleep 2
echo "== units =="; systemctl is-active pmp-website pmp-gateway; ss -ltnp | awk '/:4177 |:8080 |:80 /'
echo "== app log (last 15) =="; sudo journalctl -u pmp-website -n 15 --no-pager -o cat
echo "== gateway log (last 5) =="; sudo journalctl -u pmp-gateway -n 5 --no-pager -o cat

OV="$(sudo grep '^PMP_ORIGIN_VERIFY_SECRET=' /etc/pmp-gateway.env | cut -d= -f2-)"
H="www.playmusicprompts.com"
echo "== smoke via gateway :8080 =="
echo -n "no secret -> "; curl -s -o /dev/null -w '%{http_code}\n' -H "Host: $H" http://127.0.0.1:8080/api/session
echo -n "healthz -> "; curl -s -w ' %{http_code}\n' -H "Host: $H" -H "X-Origin-Verify: $OV" -H "X-Forwarded-For: 203.0.113.9" http://127.0.0.1:8080/healthz
echo -n "index -> "; curl -s -o /dev/null -w '%{http_code} %{size_download}B %{content_type}\n' -H "Host: $H" -H "X-Origin-Verify: $OV" -H "X-Forwarded-For: 203.0.113.9" http://127.0.0.1:8080/index.html
echo -n "login -> "; curl -s -o /dev/null -w '%{http_code} %{size_download}B\n' -H "Host: $H" -H "X-Origin-Verify: $OV" -H "X-Forwarded-For: 203.0.113.9" http://127.0.0.1:8080/login.html
echo -n "account -> "; curl -s -o /dev/null -w '%{http_code} %{size_download}B\n' -H "Host: $H" -H "X-Origin-Verify: $OV" -H "X-Forwarded-For: 203.0.113.9" http://127.0.0.1:8080/account.html
echo -n "session -> "; curl -s -w ' %{http_code}\n' -H "Host: $H" -H "X-Origin-Verify: $OV" -H "X-Forwarded-For: 203.0.113.9" http://127.0.0.1:8080/api/session | cut -c1-400
echo -n "catalog -> "; curl -s -w ' %{http_code}\n' -H "Host: $H" -H "X-Origin-Verify: $OV" -H "X-Forwarded-For: 203.0.113.9" http://127.0.0.1:8080/api/catalog | cut -c1-200
echo -n "connection (real WIF + Secrets Manager + engine) -> "; curl -s -w ' %{http_code}\n' -H "Host: $H" -H "X-Origin-Verify: $OV" -H "X-Forwarded-For: 203.0.113.9" http://127.0.0.1:8080/api/connection | cut -c1-600
echo -n "wrong host -> "; curl -s -o /dev/null -w '%{http_code}\n' -H "Host: evil.example" -H "X-Origin-Verify: $OV" -H "X-Forwarded-For: 203.0.113.9" http://127.0.0.1:8080/api/session
echo "== app log after smoke (errors only) =="; sudo journalctl -u pmp-website -n 40 --no-pager -o cat | grep -i -E 'error|warn|unavailable' | head -10 || true
