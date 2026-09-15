#!/bin/bash
# 10b-429-trace.sh — read-only: every gateway request that ended 429 or 503 in the last 3 hours (method, path, time),
# and the application's own error log lines around them.
set -u
echo "== gateway 4xx/5xx (last 3h) =="; sudo journalctl -u pmp-gateway --since '-3 hours' --no-pager -o short-iso | grep '"event":"gateway"' | grep -E '"status":(429|5[0-9][0-9]|4(0[0-9]|1[0-9]|2[0-9]))' | sed -E 's/.*(T[0-9:]+).*"method":"([A-Z]+)","path":"([^"]*)","status":([0-9]+).*/\1 \2 \3 \4/' | sort | uniq -c | sort -k2 | tail -40
echo "== app log lines with error codes (last 3h) =="; sudo journalctl -u pmp-website --since '-3 hours' --no-pager -o short-iso | grep -v -E 'Experimental|trace-warnings' | grep -E '"code"|error' | tail -30
