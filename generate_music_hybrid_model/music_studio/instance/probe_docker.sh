#!/usr/bin/env bash
# Probe 2: is Docker present, and can this no-public-IP instance pull Google's own DL container
# (Artifact Registry rides Private Google Access, unlike Debian mirrors — MEASURE, don't assume)?
set -u
echo "== docker =="
if command -v docker >/dev/null 2>&1; then docker --version; else echo DOCKER-ABSENT; fi
echo "== local images =="
sudo docker images --format '{{.Repository}}:{{.Tag}} {{.Size}}' 2>/dev/null | head -10 || echo NO-IMAGES
echo "== pull test: Google DL container (pytorch, from Google's own registry) =="
sudo timeout 600 docker pull us-docker.pkg.dev/deeplearning-platform-release/gcr.io/pytorch-cu121.2-2.py310 2>&1 | tail -3
echo "== after pull =="
sudo docker images --format '{{.Repository}}:{{.Tag}} {{.Size}}' | head -10
echo "PROBE2-DONE"
