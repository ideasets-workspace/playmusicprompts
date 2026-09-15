#!/bin/bash
# 03b-test-failures.sh — read-only: print the failing tests and their first error lines from the host test log.
set -u
LOG=/tmp/pmp-install/test.log
echo "== failing test names =="; grep -E '^not ok' "$LOG" | head -40
echo "== error excerpts =="; grep -n -E 'error:|Error|failureType|code:' "$LOG" | grep -v -E 'request_error|expected error|handles error|error path|_error' | head -60
echo "== files loaded =="; grep -c '^# Subtest' "$LOG" || true
echo "== permission / platform hints =="; grep -n -i -E 'EACCES|EPERM|ENOENT|powershell|sqlite|spawn|EADDRINUSE|tmp' "$LOG" | head -30
