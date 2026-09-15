#!/bin/bash
# 02-prepare.sh — production host preparation for the new website (deploy 2026-09-15). Touches NOTHING of the
# running Next.js app: Node 24 is installed side-by-side under /opt/node24 (the system /usr/bin/node v20 that the
# old service uses is left as it is), ffmpeg/ffprobe go under /opt/ffmpeg, a dedicated system user and the two
# directories are created. Every download is checked against the publisher's checksum before it is unpacked.
set -euo pipefail
NODE_VERSION="v24.13.1"                 # same release as the developer machine that ran the 629-test suite
NODE_DIST="https://nodejs.org/dist/${NODE_VERSION}"
FFMPEG_URL="https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz"
WORK=/tmp/pmp-prepare; mkdir -p "$WORK"; cd "$WORK"

echo "== node ${NODE_VERSION} (side-by-side) =="
if [ ! -x "/opt/node-${NODE_VERSION}/bin/node" ]; then
  curl -fsSLO "${NODE_DIST}/node-${NODE_VERSION}-linux-x64.tar.xz"
  curl -fsSLO "${NODE_DIST}/SHASUMS256.txt"
  grep " node-${NODE_VERSION}-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c -
  sudo mkdir -p "/opt/node-${NODE_VERSION}"
  sudo tar -xJf "node-${NODE_VERSION}-linux-x64.tar.xz" -C "/opt/node-${NODE_VERSION}" --strip-components=1
fi
sudo ln -sfn "/opt/node-${NODE_VERSION}" /opt/node24
/opt/node24/bin/node -v; /opt/node24/bin/npm -v
echo "system node untouched: $(/usr/bin/node -v)"

echo "== ffmpeg / ffprobe (static build, publisher md5 + recorded sha256) =="
if [ ! -x /opt/ffmpeg/ffmpeg ]; then
  curl -fsSLO "$FFMPEG_URL"; curl -fsSLO "${FFMPEG_URL}.md5"
  md5sum -c ffmpeg-release-amd64-static.tar.xz.md5
  echo "sha256 (record for future pinning): $(sha256sum ffmpeg-release-amd64-static.tar.xz)"
  sudo mkdir -p /opt/ffmpeg-static && sudo tar -xJf ffmpeg-release-amd64-static.tar.xz -C /opt/ffmpeg-static --strip-components=1
  sudo ln -sfn /opt/ffmpeg-static /opt/ffmpeg
fi
/opt/ffmpeg/ffmpeg -version | head -1; /opt/ffmpeg/ffprobe -version | head -1

echo "== user and directories =="
id pmpweb 2>/dev/null || sudo useradd --system --shell /sbin/nologin --home-dir /var/lib/pmp-website --no-create-home pmpweb
sudo mkdir -p /opt/pmp-website /var/lib/pmp-website
sudo chown root:root /opt/pmp-website && sudo chmod 755 /opt/pmp-website
sudo chown pmpweb:pmpweb /var/lib/pmp-website && sudo chmod 700 /var/lib/pmp-website
ls -ld /opt/pmp-website /var/lib/pmp-website /opt/node24 /opt/ffmpeg
echo "== wif file readable by pmpweb? =="; sudo -u pmpweb head -c 40 /opt/playmusicprompts/website-wif-config.json >/dev/null && echo "yes"
echo "== aws cli on host? =="; command -v aws && aws --version || echo "aws cli absent (Node SDK will be used instead)"
df -h / | tail -1
