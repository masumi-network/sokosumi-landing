#!/usr/bin/env bash
# Uploads the brand gradient set (scripts/gradients-src/g1..g10.jpg) to the
# Payload CMS media library so editors can use them in blocks later.
# The same images ship on the site as assets/gradients/g1..g10.webp.
#
# Usage: CMS_EMAIL=you@x CMS_PASSWORD=... bash apps/sokosumi/scripts/upload-gradients.sh
set -euo pipefail
BASE=${CMS_URL:-https://payload-production-6f43.up.railway.app}/api
DIR="$(cd "$(dirname "$0")" && pwd)/gradients-src"
[ -n "${CMS_EMAIL:-}" ] && [ -n "${CMS_PASSWORD:-}" ] || { echo "Set CMS_EMAIL and CMS_PASSWORD"; exit 1; }
TOKEN=$(curl -s -X POST "$BASE/users/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$CMS_EMAIL\",\"password\":\"$CMS_PASSWORD\"}" | python3 -c "import json,sys;print(json.load(sys.stdin)['token'])")
for f in "$DIR"/g*.jpg; do
  n=$(basename "$f" .jpg)
  # skip if already uploaded (filename match)
  hit=$(curl -s "$BASE/media?where[filename][equals]=sokosumi-gradient-$n.jpg&limit=1" | python3 -c "import json,sys;print(json.load(sys.stdin)['totalDocs'])")
  if [ "$hit" != "0" ]; then echo "skip $n (exists)"; continue; fi
  cp "$f" "/tmp/sokosumi-gradient-$n.jpg"
  curl -s -X POST "$BASE/media" -H "Authorization: JWT $TOKEN" \
    -F "file=@/tmp/sokosumi-gradient-$n.jpg" \
    -F "_payload={\"alt\":\"Sokosumi brand gradient $n (generated, wisteria palette)\"}" \
    | python3 -c "import json,sys;d=json.load(sys.stdin);print('uploaded', d.get('doc',{}).get('filename') or d)"
  rm -f "/tmp/sokosumi-gradient-$n.jpg"
done
echo "done — files serve at \$BASE/media/file/sokosumi-gradient-gN.jpg"
