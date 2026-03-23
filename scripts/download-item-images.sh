#!/usr/bin/env bash
set -euo pipefail

DEST="public/images/items"
mkdir -p "$DEST"

BASE_URL="https://www.serebii.net/pokemonpokopia/items"

# Start the Next.js server temporarily to get the item list via the tRPC endpoint,
# or just extract slugs from the ItemList.txt. We'll use a node script approach.
node -e "
const fs = require('fs');
const content = fs.readFileSync('src/data/raw/ItemList.txt', 'utf-8');
const lines = content.split('\n');
const names = new Set();
let inCategory = false;
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('List of ')) {
    const cat = trimmed.replace('List of ', '');
    inCategory = !cat.includes('Lost Relics') && cat !== 'Fossils';
    continue;
  }
  if (!inCategory) continue;
  if (trimmed.startsWith('Picture') && trimmed.includes('Name')) continue;
  if (trimmed.includes('\t')) {
    const parts = trimmed.split('\t');
    if (parts.length >= 2) {
      const name = (parts[1] || parts[0]).trim();
      if (name && name !== 'Name') names.add(name);
    }
  }
}
const slugs = [...names].map(n =>
  n.toLowerCase().replace(/[''é ]/g, ch => ch === 'é' ? 'e' : '').replace(/[^a-z0-9]/g, '')
);
slugs.forEach(s => console.log(s));
" | sort -u > /tmp/pokopia-house-planner-item-slugs.txt

TOTAL=$(wc -l < /tmp/pokopia-house-planner-item-slugs.txt | tr -d ' ')
COUNT=0

while IFS= read -r slug; do
  COUNT=$((COUNT + 1))
  FILE="$DEST/$slug.png"
  if [ -f "$FILE" ]; then
    echo "[$COUNT/$TOTAL] Skip $slug (exists)"
    continue
  fi
  echo "[$COUNT/$TOTAL] Downloading $slug.png..."
  HTTP_CODE=$(curl -sL -o "$FILE" -w '%{http_code}' "$BASE_URL/$slug.png")
  if [ "$HTTP_CODE" != "200" ]; then
    rm -f "$FILE"
    echo "  WARN: Failed ($HTTP_CODE) for $slug"
  fi
  sleep 0.15
done < /tmp/pokopia-house-planner-item-slugs.txt

echo "Done! Downloaded item images to $DEST"
