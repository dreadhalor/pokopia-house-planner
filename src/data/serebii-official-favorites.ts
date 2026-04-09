// Fixture built by scripts/build-serebii-favorite-map.ts
import type { Pokemon } from './pokemon';
import serebiiFavoriteItemsByCategory from './raw/serebii-favorite-items-by-category.json';
import {
  favoriteCategories,
  getFavoriteCategoryByName,
} from './favorite-categories';
import { getItemBySlug, getItemImagePath } from './items';

type ByPageKey = Record<string, string[]>;

const byPageKey = serebiiFavoriteItemsByCategory as ByPageKey;

/** Serebii favorites URL path segment (e.g. strangestuff) for a category id. */
export function pageKeyForCategoryId(categoryId: string): string | null {
  if (categoryId.endsWith('-flavors')) return null;
  return categoryId.replace(/-/g, '');
}

export function serebiiFavoritesPageUrl(pageKey: string): string {
  return `https://www.serebii.net/pokemonpokopia/favorites/${pageKey}.shtml`;
}

/** Item slugs Serebii lists for this category page (empty if unknown page). */
export function getSerebiiSlugsForPageKey(pageKey: string): string[] {
  const list = byPageKey[pageKey];
  return list ? [...list] : [];
}

export function getSerebiiSlugsForCategoryId(categoryId: string): string[] {
  const key = pageKeyForCategoryId(categoryId);
  if (!key) return [];
  return getSerebiiSlugsForPageKey(key);
}

export type SerebiiResolvedItem = {
  slug: string;
  name: string;
  description: string;
  category: string;
  tag: string;
  image: string;
};

/** Resolve Serebii slugs to app items (skips unknown slugs). */
export function resolveSerebiiSlugsToItems(slugs: string[]): SerebiiResolvedItem[] {
  const out: SerebiiResolvedItem[] = [];
  for (const slug of slugs) {
    const item = getItemBySlug(slug);
    if (!item) continue;
    out.push({
      slug: item.slug,
      name: item.name,
      description: item.description,
      category: item.category,
      tag: item.tag,
      image: getItemImagePath(item),
    });
  }
  return out;
}

/** Categories that map to a Serebii favorites page (excludes flavor-only rows). */
export function listSerebiiFavoriteCategoryIds(): string[] {
  return favoriteCategories
    .filter((c) => !c.id.endsWith('-flavors'))
    .map((c) => c.id);
}

function pageKeyForFavoriteName(name: string): string | null {
  const cat = getFavoriteCategoryByName(name);
  if (!cat || cat.id.endsWith('-flavors')) return null;
  return pageKeyForCategoryId(cat.id);
}

/**
 * Names of favorite categories (from this house’s Pokémon) for which Serebii’s
 * category page lists this item. Empty when the item is not on any relevant list.
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
      const slugs = byPageKey[key];
      if (!slugs?.includes(itemSlug)) continue;
      const cat = getFavoriteCategoryByName(f);
      if (cat) hits.add(cat.name);
    }
  }
  return [...hits].sort((a, b) => a.localeCompare(b));
}
