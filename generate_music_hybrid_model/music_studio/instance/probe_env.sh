#!/usr/bin/env bash
# Environment probe for the music-studio instance — dependency presence is MEASURED, never assumed.
# Shipped as a FILE via GCS because two shells (cmd.exe 2026-08-12, PowerShell twice today) have
# rewritten inline SSH payloads on this project (sakarperi/remote.py records the class).
set -u
PY=/opt/conda/bin/python3
echo "== python =="
$PY -c 'import sys; print(sys.version.split()[0])'
echo "== torch =="
$PY - <<'EOF'
try:
    import torch
    print("torch", torch.__version__, "cuda_available", torch.cuda.is_available(),
          "device", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "none")
except Exception as exc:
    print("torch MISSING:", exc)
EOF
echo "== separator dependencies (ZFTurbo requirements, inference subset) =="
for m in librosa einops rotary_embedding_torch beartype omegaconf ml_collections soundfile tqdm numpy scipy torchaudio pandas; do
  if $PY -c "import $m" 2>/dev/null; then echo "$m OK"; else echo "$m MISSING"; fi
done
echo "== pip can reach an index? (expected NO on this no-public-IP machine) =="
timeout 15 $PY -m pip download --no-deps -d /tmp/_piptest ml_collections >/dev/null 2>&1 && echo "PIP-REACHES-INDEX" || echo "PIP-UNREACHABLE-OR-TIMEOUT"
echo "PROBE-DONE"
