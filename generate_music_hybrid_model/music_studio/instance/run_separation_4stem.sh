#!/usr/bin/env bash
# Stage 6, FOUR-STEM separation — the shape the architecture actually specifies.
#
# THE REQUIREMENT, quoted from `docs/music-studio-single-endpoint-architecture.md` (read this session):
#   line 44: "| Vocals, Drums, Bass | `separated` | from the delivered mix by a 4-stem separator |"
#   line 45: "| Music | `separated` (the separator's \"Other\") | renamed for the product, same signal |"
# So the panel's four separated stems come from ONE 4-stem model, and `Music` IS the model's `other`
# output under the product's name. A 2-stem vocals/instrumental model — which is what ran on
# 2026-08-14 — satisfies exactly ONE of the four. That gap was in the document before it was in my
# report (D-SSM-28).
#
# MODEL: SCNet XL IHF, chosen from the registry `music_studio/data/separators.json`, whose SDR values
# were read IN FULL from ZFTurbo's own pretrained_models.md this session (Multisong avg 9.92: bass
# 11.94, drums 11.58, vocals 9.68, other 6.48 — the best 4-stem entry in that table). Its config's own
# `instruments: ['drums','bass','other','vocals']` was READ before this script was written, so the
# stem set is verified from the artefact, not assumed from the table.
#
# Usage: run_separation_4stem.sh <input-gcs-uri> <output-gcs-prefix>
set -eu

IN_URI="${1:?usage: run_separation_4stem.sh <input-gcs-uri> <output-gcs-prefix>}"
OUT_PREFIX="${2:?usage: run_separation_4stem.sh <input-gcs-uri> <output-gcs-prefix>}"
WS=~/music_studio_ws
BASE=gs://contentanalyticsplatform-video-staging/tools/music_studio

cd ~
mkdir -p $WS/separator $WS/wheels $WS/in4 $WS/out4
# The container writes as ROOT, so a second run cannot clean or write without this (measured twice).
sudo rm -rf $WS/in4/* $WS/out4/*
sudo chown -R "$(id -u):$(id -g)" $WS

echo "== pull artefacts (instance's own SA; no public IP on this machine) =="
gcloud storage cp "$BASE/wheels/*" $WS/wheels/ -q
gcloud storage cp "$BASE/separator/mss-training-v1.0.21.zip" $WS/separator/ -q
gcloud storage cp "$BASE/separator/config_scnet_xl_ihf.yaml" $WS/separator/ -q
gcloud storage cp "$BASE/separator/scnet_xl_ihf.ckpt" $WS/separator/ -q
gcloud storage cp "$IN_URI" $WS/in4/ -q

echo "== checkpoint hash verified ON THIS MACHINE (the label is never the evidence) =="
gcloud storage cp "$BASE/separator/scnet_xl_ihf.sha256" $WS/separator/ -q
( cd $WS/separator && sha256sum -c scnet_xl_ihf.sha256 )

echo "== the config's OWN stem list, printed so the four stems are proven before the run =="
grep -E "^instruments:|^ *instruments:" $WS/separator/config_scnet_xl_ihf.yaml || true

cd $WS/separator && rm -rf Music-Source-Separation-Training-1.0.21 && \
  python3 -c "import zipfile; zipfile.ZipFile('mss-training-v1.0.21.zip').extractall()"

echo "== separate, INSIDE Google's own DL container, GPU attached =="
sudo docker run --rm -i --gpus all -v $WS:/ws \
  us-docker.pkg.dev/deeplearning-platform-release/gcr.io/pytorch-cu121.2-2.py310:latest \
  bash -c '
    set -eu
    # Same dependency controls as the 2-stem run, each measured this session: torch is NOT in the
    # staged wheel set (a pip-resolved torch killed two runs on unstaged nvidia-cuda wheels);
    # hyper_connections declares torch>=2.3 against this container 2.2.0 so it is --no-deps and then
    # EXERCISED by import; soundfile must be the manylinux wheel or it dies on libsndfile.so.
    pip install --no-index --find-links /ws/wheels --quiet \
      librosa soundfile ml_collections omegaconf==2.2.3 einops==0.8.1 beartype==0.14.1 matplotlib
    pip install --no-index --find-links /ws/wheels --quiet --no-deps \
      rotary-embedding-torch==0.3.5 hyper_connections==0.1.11 loralib wandb
    python3 -c "import torch, soundfile, librosa; print(\"torch\", torch.__version__, \
\"cuda\", torch.cuda.is_available(), \"soundfile\", soundfile.__libsndfile_version__)"
    cd /ws/separator/Music-Source-Separation-Training-1.0.21
    python3 inference.py \
      --model_type scnet \
      --config_path ../config_scnet_xl_ihf.yaml \
      --start_check_point ../scnet_xl_ihf.ckpt \
      --input_folder /ws/in4 \
      --store_dir /ws/out4
  '

echo "== measure every delivered stem with ffprobe, and COUNT them =="
COUNT=0
find $WS/out4 -type f | while read -r f; do
  echo "FILE: $f ($(stat -c%s "$f") B)"
  ffprobe -v error -show_entries stream=codec_name,sample_rate,channels -show_entries format=duration -of default=nw=1 "$f"
done
COUNT=$(find $WS/out4 -type f | wc -l)
echo "STEM FILE COUNT: $COUNT"

echo "== push and VERIFY the objects exist (a cp that printed Copying has lied here) =="
gcloud storage cp -r $WS/out4/* "$OUT_PREFIX" -q
gcloud storage ls -l "$OUT_PREFIX**"
echo "SEPARATION-4STEM-DONE input=$(basename "$IN_URI") stems=$COUNT"
