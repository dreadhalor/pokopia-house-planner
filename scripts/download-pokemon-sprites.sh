#!/usr/bin/env bash
set -euo pipefail

DEST="public/images/pokemon"
mkdir -p "$DEST"

BASE_URL="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork"

# Extract all National Dex IDs from pokemon-sprites.ts using sed
IDS=$(sed -n 's/.*: *\([0-9][0-9]*\),*/\1/p' src/data/pokemon-sprites.ts | sort -un)

TOTAL=$(echo "$IDS" | wc -l | tr -d ' ')
COUNT=0

for id in $IDS; do
  COUNT=$((COUNT + 1))
  FILE="$DEST/$id.png"
  if [ -f "$FILE" ]; then
    echo "[$COUNT/$TOTAL] Skip $id (exists)"
    continue
  fi
  echo "[$COUNT/$TOTAL] Downloading $id.png..."
  curl -sL "$BASE_URL/$id.png" -o "$FILE" || echo "  WARN: Failed to download $id"
  sleep 0.1
done

echo "Done! Downloaded sprites to $DEST"
