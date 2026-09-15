#!/usr/bin/env bash
# Stage 6 separation, PARAMETERISED — vocal separation with Mel-Band RoFormer (Kim Vocal, MIT,
# D-SSM-26) inside Google's own DL container, on the GPU instance (Clause 20).
#
# Usage: run_separation.sh <input-gcs-uri> <output-gcs-prefix>
# The input and output are ARGUMENTS, not constants: the first version hardcoded the stage-3 take,
# and a second material (the sung take needed for the separator's POSITIVE control leg) would have
# meant editing the engine to change data — the class this project bans by name (D-SSM-5: data is
# never compiled into the engine).
#
# Everything arrives via GCS (the instance has no public IP: apt and PyPI are unreachable, measured
# this session). pip runs --no-index against the staged wheels so a missing dependency fails LOUDLY
# rather than silently resolving from a network that does not exist here.
set -eu

IN_URI="${1:?usage: run_separation.sh <input-gcs-uri> <output-gcs-prefix>}"
OUT_PREFIX="${2:?usage: run_separation.sh <input-gcs-uri> <output-gcs-prefix>}"
WS=~/music_studio_ws
IN_NAME="$(basename "$IN_URI")"

cd ~
mkdir -p $WS/separator $WS/wheels $WS/in $WS/out
# The container writes its outputs — and creates its bind-mounted directories — as ROOT, so on a
# SECOND run this user can neither delete the old files nor write new inputs ("Permission denied"
# on rm, then on gcloud's .gstmp), and `set -e` aborts. Measured twice on the second material,
# which is exactly when a single-input hardcoded script first got reused. Cleanup AND ownership are
# therefore repaired with sudo before anything else touches the workspace.
sudo rm -rf $WS/in/* $WS/out/*
sudo chown -R "$(id -u):$(id -g)" $WS

echo "== pull artefacts from GCS (instance's own SA) =="
gcloud storage cp 'gs://contentanalyticsplatform-video-staging/tools/music_studio/wheels/*' $WS/wheels/ -q
gcloud storage cp gs://contentanalyticsplatform-video-staging/tools/music_studio/separator/mss-training-v1.0.21.zip $WS/separator/ -q
gcloud storage cp gs://contentanalyticsplatform-video-staging/tools/music_studio/separator/config_vocals_mel_band_roformer_kj.yaml $WS/separator/ -q
gcloud storage cp gs://contentanalyticsplatform-video-staging/tools/music_studio/separator/MelBandRoformer.ckpt $WS/separator/ -q
gcloud storage cp "$IN_URI" $WS/in/ -q

echo "== checkpoint hash verified ON THIS MACHINE (never trusted from the label) =="
echo "87201f4d31afb5bc79993230fc49446918425574db48c01c405e44f365c7559e  $WS/separator/MelBandRoformer.ckpt" | sha256sum -c -

cd $WS/separator && rm -rf Music-Source-Separation-Training-1.0.21 && python3 -c "import zipfile; zipfile.ZipFile('mss-training-v1.0.21.zip').extractall()"

echo "== run separation INSIDE the Google DL container, GPU attached =="
sudo docker run --rm -i --gpus all \
  -v $WS:/ws \
  us-docker.pkg.dev/deeplearning-platform-release/gcr.io/pytorch-cu121.2-2.py310:latest \
  bash -c '
    set -eu
    # DEPENDENCY CONTROL, every clause measured this session:
    #  * the container carries torch 2.2.0+cu121 built against its own CUDA. A pip run that resolves
    #    `torch` from the staged wheels replaces it with a generic build whose nvidia-cuda-* wheels
    #    are NOT staged, and the install dies (measured, runs 2 and 3). The torch wheel is therefore
    #    REMOVED from the staged set so an accidental torch install cannot even resolve.
    #  * `hyper_connections==0.1.11` declares `torch>=2.3` while this container has 2.2.0. Installed
    #    with --no-deps and then EXERCISED below: a declared floor is the authors claim; a successful
    #    import + model load on THIS torch is the evidence.
    #  * soundfile must come from the MANYLINUX wheel: the pure-python wheel installs cleanly and
    #    then dies on `libsndfile.so` at import (measured, run 4). The import check below prints the
    #    linked libsndfile version, so a clean install can never again be mistaken for a working one.
    pip install --no-index --find-links /ws/wheels --quiet \
      librosa soundfile ml_collections omegaconf==2.2.3 einops==0.8.1 beartype==0.14.1 matplotlib
    pip install --no-index --find-links /ws/wheels --quiet --no-deps \
      rotary-embedding-torch==0.3.5 hyper_connections==0.1.11 loralib wandb
    python3 -c "import torch, hyper_connections, librosa, soundfile, omegaconf, ml_collections; \
print(\"torch\", torch.__version__, \"cuda\", torch.cuda.is_available(), \
\"soundfile\", soundfile.__libsndfile_version__)"
    cd /ws/separator/Music-Source-Separation-Training-1.0.21
    python3 inference.py \
      --model_type mel_band_roformer \
      --config_path ../config_vocals_mel_band_roformer_kj.yaml \
      --start_check_point ../MelBandRoformer.ckpt \
      --input_folder /ws/in \
      --store_dir /ws/out \
      --extract_instrumental
  '

echo "== measure the delivered stems with ffprobe (the instrument, not the label) =="
find $WS/out -type f | while read -r f; do
  echo "FILE: $f ($(stat -c%s "$f") B)"
  ffprobe -v error -show_entries stream=codec_name,sample_rate,channels -show_entries format=duration -of default=nw=1 "$f"
done

echo "== push stems to GCS, then VERIFY the objects exist (a cp that printed Copying has lied here) =="
gcloud storage cp -r $WS/out/* "$OUT_PREFIX" -q
gcloud storage ls -l "$OUT_PREFIX**"
echo "SEPARATION-RUN-DONE input=$IN_NAME"
