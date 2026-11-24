#!/usr/bin/env bash
# noise-floor publishing pipeline. Run it in WSL.
#
# The repository stays on the Windows side. Builds run in a Linux mirror
# (default ~/nf-build) with its own node_modules, so nothing here depends on
# Windows npm or the old Windows node_modules. GitHub Actions builds the live
# site from package-lock.json, exactly as the mirror does.
#
#   site.sh sync              copy the repo into the mirror; npm ci when the lockfile changed
#   site.sh check  <post.md>  lint a post (front matter, links, media, privacy patterns)
#   site.sh preview <post.md> sync, add the post to the mirror as published, build, check
#   site.sh build             sync, build the site as committed, check every page
#   site.sh serve             serve the mirror's last build at http://localhost:$PORT/noisefloor-site/
#   site.sh stage  <post.md>  copy the post into the repo's content/log/ ready to commit
#
# Post paths may be Windows paths (C:\...) or WSL paths.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIRROR="${NF_MIRROR:-$HOME/nf-build}"
PORT="${NF_PORT:-4329}"

die() { echo "site.sh: $*" >&2; exit 1; }

to_wsl_path() {
  case "$1" in
    [A-Za-z]:[\\/]*) wslpath -u "$1" ;;
    *) printf '%s\n' "$1" ;;
  esac
}

post_arg() {
  [ "$#" -ge 1 ] || die "give the post's path"
  local p; p="$(to_wsl_path "$1")"
  [ -f "$p" ] || die "post not found: $p"
  printf '%s\n' "$p"
}

front_value() { # front_value <file> <key>: first matching front-matter value, unquoted
  awk -v key="$2" '
    NR == 1 && $0 != "---" { exit }
    NR > 1 && $0 == "---" { exit }
    index($0, key ":") == 1 { v = substr($0, length(key) + 2); gsub(/^[ \t]+|[ \t\r]+$/, "", v); gsub(/^"|"$/, "", v); print v; exit }
  ' "$1"
}

sync_mirror() {
  mkdir -p "$MIRROR"
  rsync -a --delete \
    --exclude node_modules --exclude dist --exclude .astro --exclude .git \
    "$REPO/" "$MIRROR/"
  local stamp="$MIRROR/node_modules/.lock-sha" sha
  sha="$(sha256sum "$MIRROR/package-lock.json" | cut -d' ' -f1)"
  if [ ! -f "$stamp" ] || [ "$(cat "$stamp")" != "$sha" ]; then
    echo "== npm ci (lockfile changed)"
    (cd "$MIRROR" && npm ci --no-audit --no-fund)
    echo "$sha" > "$stamp"
  fi
}

build_mirror() {
  echo "== build"
  local log="$MIRROR/.build.log"
  if ! (cd "$MIRROR" && npm run build > "$log" 2>&1); then
    tail -40 "$log"; die "build failed (full log: $log)"
  fi
  grep -iE 'warn|error|page\(s\) built' "$log" | grep -v 'glob-loader' || true
}

# Rewrite only the front matter's published line, so the body is never touched.
set_published() { # set_published <src> <dest> <published_at or empty>
  awk -v at="$3" '
    NR == 1 { print; infm = 1; next }
    infm && $0 == "---" {
      if (!seen_pub) print "published: true"
      if (!seen_at && at != "") print "published_at: " at
      infm = 0; print; next
    }
    infm && /^published:/ { print "published: true"; seen_pub = 1; next }
    infm && /^published_at:/ { seen_at = 1; if (at != "") { print "published_at: " at; next } }
    { print }
  ' "$1" > "$2"
}

cmd="${1:-}"; shift || true
case "$cmd" in
  sync)
    sync_mirror
    ;;
  check)
    post="$(post_arg "$@")"
    node "$REPO/scripts/check-post.mjs" "$post" "$REPO"
    ;;
  preview)
    post="$(post_arg "$@")"
    node "$REPO/scripts/check-post.mjs" "$post" "$REPO"
    sync_mirror
    slug="$(front_value "$post" slug)"; [ -n "$slug" ] || slug="$(basename "$post" .md)"
    at="$(front_value "$post" published_at)"
    [ -n "$at" ] || at="$(date -u +%Y-%m-%dT00:00:00.000Z)"
    set_published "$post" "$MIRROR/content/log/$slug.md" "$at"
    build_mirror
    node "$MIRROR/scripts/check-dist.mjs" "$MIRROR/dist" "$slug"
    echo "== preview ready: run 'site.sh serve', then open http://localhost:$PORT/noisefloor-site/log/$slug/"
    ;;
  build)
    sync_mirror
    build_mirror
    node "$MIRROR/scripts/check-dist.mjs" "$MIRROR/dist"
    ;;
  serve)
    [ -d "$MIRROR/dist" ] || die "nothing built yet; run preview or build first"
    cd "$MIRROR" && exec npx astro preview --port "$PORT"
    ;;
  stage)
    post="$(post_arg "$@")"
    node "$REPO/scripts/check-post.mjs" "$post" "$REPO"
    slug="$(front_value "$post" slug)"; [ -n "$slug" ] || slug="$(basename "$post" .md)"
    dest="$REPO/content/log/$slug.md"
    at="$(front_value "$post" published_at)"
    if [ -f "$dest" ]; then
      # An update keeps the first publication date.
      at="$(front_value "$dest" published_at)"
      echo "== updating existing post $slug (published_at kept: $at)"
    else
      [ -n "$at" ] || at="$(date -u +%Y-%m-%dT00:00:00.000Z)"
      echo "== new post $slug (published_at: $at)"
    fi
    set_published "$post" "$dest" "$at"
    echo "== staged: content/log/$slug.md"
    ;;
  *)
    sed -n '2,17p' "$0" | sed 's/^# \{0,1\}//'
    [ -z "$cmd" ] || exit 1
    ;;
esac
