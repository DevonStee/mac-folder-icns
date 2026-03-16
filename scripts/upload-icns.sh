#!/usr/bin/env bash
#
# Upload .icns files to S3-compatible storage (Cloudflare R2, AWS S3, etc.)
#
# Prerequisites:
#   brew install awscli   (or apt-get install awscli)
#   aws configure         (set access key, secret, region)
#
# Usage:
#   ./scripts/upload-icns.sh <bucket-name> [endpoint-url]
#
# Examples:
#   # Cloudflare R2
#   ./scripts/upload-icns.sh my-icns-bucket https://<account-id>.r2.cloudflarestorage.com
#
#   # AWS S3
#   ./scripts/upload-icns.sh my-icns-bucket
#
# After uploading, set NEXT_PUBLIC_ICNS_BASE_URL to the bucket's public URL:
#   NEXT_PUBLIC_ICNS_BASE_URL=https://icns.example.com

set -euo pipefail

BUCKET="${1:?Usage: $0 <bucket-name> [endpoint-url]}"
ENDPOINT="${2:-}"
SRC_DIR="public/icns"

if [ ! -d "$SRC_DIR" ]; then
  echo "Error: $SRC_DIR not found. Run 'npm run generate' first." >&2
  exit 1
fi

COUNT=$(find "$SRC_DIR" -name '*.icns' | wc -l | tr -d ' ')
echo "Uploading $COUNT .icns files to s3://$BUCKET/ ..."

ENDPOINT_FLAG=""
if [ -n "$ENDPOINT" ]; then
  ENDPOINT_FLAG="--endpoint-url $ENDPOINT"
fi

aws s3 sync "$SRC_DIR" "s3://$BUCKET/" \
  $ENDPOINT_FLAG \
  --content-type "application/octet-stream" \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*" \
  --include "*.icns"

echo "Done. $COUNT files uploaded."
echo ""
echo "Next steps:"
echo "  1. Make the bucket publicly readable (or add a CDN/custom domain)"
echo "  2. Set NEXT_PUBLIC_ICNS_BASE_URL to the bucket's public URL"
echo "     e.g. NEXT_PUBLIC_ICNS_BASE_URL=https://icns.example.com"
