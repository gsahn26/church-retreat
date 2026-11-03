#!/usr/bin/env bash
# Deploys the static export (out/) to the gh-pages branch.
#
# Merges the new build into the EXISTING gh-pages history instead of force-
# pushing a freshly-initialized branch, and never deletes old files under
# _next/static. Next.js renames JS chunks on every build; if a visitor has
# an old page cached and we delete the chunks it references, they hit
# ChunkLoadError/404s until the page is fully reloaded. Keeping old chunks
# around (they're small and content-hashed, so they never change) avoids
# that class of bug entirely.
#
# Usage: npm run build && bash scripts/deploy-gh-pages.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$REPO_ROOT/out"
REMOTE="https://github.com/gsahn26/church-retreat.git"
WORKDIR="$(mktemp -d /tmp/church-retreat-deploy.XXXXXX)"

if [ ! -d "$OUT_DIR" ]; then
  echo "out/ not found - run 'npm run build' first." >&2
  exit 1
fi

if git ls-remote --exit-code --heads "$REMOTE" gh-pages > /dev/null 2>&1; then
  git clone --branch gh-pages --single-branch "$REMOTE" "$WORKDIR"
else
  echo "No gh-pages branch yet - creating it."
  git init -q "$WORKDIR"
  git -C "$WORKDIR" checkout -q -b gh-pages
  git -C "$WORKDIR" remote add origin "$REMOTE"
fi

# Replace everything except _next/static, deleting pages that no longer exist.
# (.git is excluded too: --delete would otherwise wipe the clone we just made,
# since the build output never contains a .git directory of its own.)
rsync -a --delete --exclude='_next/static' --exclude='.git' "$OUT_DIR"/ "$WORKDIR"/

# Merge _next/static additively: never delete old chunk/font/media files.
mkdir -p "$WORKDIR/_next/static"
rsync -a "$OUT_DIR/_next/static"/ "$WORKDIR/_next/static"/

touch "$WORKDIR/.nojekyll"

cd "$WORKDIR"
git add -A
if git diff --cached --quiet; then
  echo "Nothing changed; gh-pages is already up to date."
  exit 0
fi

git commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push origin gh-pages

echo "Deployed. Cleaning up $WORKDIR"
rm -rf "$WORKDIR"
