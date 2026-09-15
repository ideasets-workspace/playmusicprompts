#!/bin/bash
# 12-engine-calls-window.sh — read-only: every engine_call line the application logged since __SINCE__ (ISO-8601 UTC),
# and the gateway hits in the same window, so "0 engine calls at page open" is a measurement, not a claim.
set -u
SINCE="__SINCE__"
echo "== engine_call lines since $SINCE =="
sudo journalctl -u pmp-website --since "$SINCE" --no-pager -o cat | grep -E '"event":"engine_call"|engine_capabilities_refresh' || echo "(none)"
echo "== gateway requests since $SINCE (method path status) =="
sudo journalctl -u pmp-gateway --since "$SINCE" --no-pager -o cat | grep '"event":"gateway"' | sed -E 's/.*"method":"([A-Z]+)","path":"([^"]*)","status":([0-9]+).*/\1 \2 \3/' | sort | uniq -c | sort -rn | head -30
echo "== cache file =="; sudo ls -l /var/lib/pmp-website/capabilities.cache.json
