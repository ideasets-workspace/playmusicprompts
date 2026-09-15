#!/usr/bin/env bash
# Probe 3: dependency presence INSIDE the Google DL pytorch container (the separator's runtime).
set -u
IMG=us-docker.pkg.dev/deeplearning-platform-release/gcr.io/pytorch-cu121.2-2.py310:latest
# -i is REQUIRED: a heredoc rides stdin, and docker run without -i does not attach it (measured:
# the first run of this probe printed nothing for the whole dependency block).
sudo docker run --rm -i $IMG python3 - <<'EOF'
import importlib, sys
print("python", sys.version.split()[0])
for m in ("torch", "torchaudio", "numpy", "scipy", "pandas", "librosa", "soundfile", "tqdm",
          "einops", "rotary_embedding_torch", "beartype", "omegaconf", "ml_collections"):
    try:
        mod = importlib.import_module(m)
        print(m, "OK", getattr(mod, "__version__", "?"))
    except Exception as exc:
        print(m, "MISSING", str(exc)[:60])
import torch
print("cuda_available", torch.cuda.is_available())
EOF
echo "== GPU visible to a container run with --gpus all? =="
sudo docker run --rm --gpus all $IMG python3 -c "import torch; print('gpu', torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'none')" 2>&1 | tail -1
echo "PROBE3-DONE"
