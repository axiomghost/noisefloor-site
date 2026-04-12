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
STAGING_DIR="$SITE_ROOT/staging"
FILENAME="$(basename "$SRC")"
DEST="$STAGING_DIR/$FILENAME"
WARNINGS_FILE="$STAGING_DIR/${FILENAME%.md}.warnings.txt"

mkdir -p "$STAGING_DIR"
cp "$SRC" "$DEST"

: > "$WARNINGS_FILE"

check_pattern() {
  local label="$1"
  local pattern="$2"
  if grep -En "$pattern" "$DEST" >/dev/null 2>&1; then
    echo "[$label]" >> "$WARNINGS_FILE"
    grep -En "$pattern" "$DEST" >> "$WARNINGS_FILE" || true
    echo >> "$WARNINGS_FILE"
  fi
}

check_pattern "email" '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
check_pattern "phone" '(\+?[0-9][0-9() -]{7,}[0-9])'
check_pattern "home-path" '/home/[A-Za-z0-9._-]+'
check_pattern "windows-path" '[A-Za-z]:\\[^ ]+'
check_pattern "private-url" 'https?://[^ ]+'
check_pattern "api-key-like" '(api[_-]?key|token|secret|authorization|bearer)'
check_pattern "internal-host-like" '(localhost|127\.0\.0\.1|\.local|\.internal)'

sed -i -E 's/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/[redacted-email]/g' "$DEST"
sed -i -E 's#(/home/[A-Za-z0-9._/-]+)#[redacted-path]#g' "$DEST"
sed -i -E 's#([A-Za-z]:\\[^ ]+)#[redacted-path]#g' "$DEST"

cat <<EOF
Prepared staging file:
  $DEST

Warnings report:
  $WARNINGS_FILE

Notes:
- This script performs deterministic detection and light masking only.
- Tone softening, legal/ethical compliance review, and nuanced editorial cleanup are NOT automated here.
- Review the staged file manually before publication.
EOF
