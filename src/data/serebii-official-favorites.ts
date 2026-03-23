// server-only — reads fixture built by scripts/build-serebii-favorite-map.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Pokemon } from './pokemon';
import { getFavoriteCategoryByName } from './favorite-categories';

type ByPageKey = Record<string, string[]>;

const jsonPath = join(
  process.cwd(),
  'src/data/raw/serebii-favorite-items-by-category.json',
);

let byPageKey: ByPageKey | null = null;
function getByPageKey(): ByPageKey {
  if (!byPageKey) {
    byPageKey = JSON.parse(readFileSync(jsonPath, 'utf-8')) as ByPageKey;
  }
  return byPageKey;
}

function pageKeyForFavoriteName(name: string): string | null {
  const cat = getFavoriteCategoryByName(name);
  if (!cat || cat.id.endsWith('-flavors')) return null;
  return cat.id.replace(/-/g, '');
}

/**
 * Names of favorite categories (from this house’s Pokémon) for which Serebii’s
 * category page lists this item. Empty when the item is not on any relevant
 * Serebii list — ranking then relies only on keyword heuristics.
 */
export function serebiiDocumentedFavoritesForItem(
  itemSlug: string,
  members: Pokemon[],
): string[] {
  const hits = new Set<string>();
  for (const p of members) {
    const favs = [...p.favorites.slice(0, 5)];
    if (p.flavor) favs.push(p.flavor);
    for (const f of favs) {
      const key = pageKeyForFavoriteName(f);
      if (!key) continue;
      const slugs = getByPageKey()[key];
      if (!slugs?.includes(itemSlug)) continue;
      const cat = getFavoriteCategoryByName(f);
      if (cat) hits.add(cat.name);
    }
  }
  return [...hits].sort((a, b) => a.localeCompare(b));
}
