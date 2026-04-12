#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <source-markdown-file>"
  exit 1
fi

SRC="$1"

if [ ! -f "$SRC" ]; then
  echo "Error: source file not found: $SRC"
  exit 1
fi

SITE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BLOG_DIR="$SITE_ROOT/src/content/blog"
FILENAME="$(basename "$SRC")"
DEST="$BLOG_DIR/$FILENAME"

mkdir -p "$BLOG_DIR"

cp "$SRC" "$DEST"

cd "$SITE_ROOT"

npm run build

git add "$DEST"
git commit -m "Publish post: ${FILENAME%.md}" || echo "Nothing to commit"
git push

echo "Published to site repo: $DEST"
