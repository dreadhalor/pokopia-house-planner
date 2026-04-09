import { router, publicProcedure } from '../trpc';
import { favoriteCategoryBySlugSchema } from '@/lib/schemas/items';
import {
  favoriteCategories,
  getFavoriteCategoryById,
  pokemon,
  items,
  getItemImagePath,
  getSpriteUrl,
  pageKeyForCategoryId,
  serebiiFavoritesPageUrl,
  getSerebiiSlugsForCategoryId,
  resolveSerebiiSlugsToItems,
  listSerebiiFavoriteCategoryIds,
} from '@/data';

function pokemonMatchesCategory(
  p: (typeof pokemon)[number],
  categoryName: string,
): boolean {
  const name = categoryName.toLowerCase();
  return (
    p.favorites.some((f) => f.toLowerCase() === name) ||
    p.flavor.toLowerCase() === name
  );
}

export const favoritesRouter = router({
  list: publicProcedure.query(() => {
    return favoriteCategories.map((cat) => {
      const pokemonCount = pokemon.filter((p) =>
        pokemonMatchesCategory(p, cat.name),
      ).length;
      const itemCount = items.filter((i) => cat.itemScorer(i) > 0).length;
      return {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        examples: cat.examples,
        pokemonCount,
        itemCount,
      };
    });
  }),

  getBySlug: publicProcedure
    .input(favoriteCategoryBySlugSchema)
    .query(({ input }) => {
      const category = getFavoriteCategoryById(input.slug);
      if (!category) return null;

      const matchingPokemon = pokemon
        .filter((p) => pokemonMatchesCategory(p, category.name))
        .sort(
          (a, b) => parseInt(a.number.slice(1)) - parseInt(b.number.slice(1)),
        )
        .map((p) => ({
          id: p.id,
          number: p.number,
          name: p.name,
          idealHabitat: p.idealHabitat,
          sprite: getSpriteUrl(p.name),
        }));

      const matchingItems = items
        .map((i) => ({ item: i, score: category.itemScorer(i) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ item: i, score }) => ({
          name: i.name,
          slug: i.slug,
          description: i.description,
          category: i.category,
          tag: i.tag,
          image: getItemImagePath(i),
          confidence: score,
        }));

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        examples: category.examples,
        pokemon: matchingPokemon,
        pokemonCount: matchingPokemon.length,
        items: matchingItems,
        itemCount: matchingItems.length,
      };
    }),

  /** Serebii-scraped favorite lists: one row per object category with counts. */
  serebiiIndex: publicProcedure.query(() => {
    const ids = listSerebiiFavoriteCategoryIds();
    return ids.map((id) => {
      const cat = getFavoriteCategoryById(id);
      const pageKey = pageKeyForCategoryId(id);
      const slugs = pageKey ? getSerebiiSlugsForCategoryId(id) : [];
      const resolved = resolveSerebiiSlugsToItems(slugs);
      return {
        id,
        name: cat?.name ?? id,
        description: cat?.description ?? '',
        serebiiItemCount: slugs.length,
        resolvedItemCount: resolved.length,
        serebiiUrl: pageKey ? serebiiFavoritesPageUrl(pageKey) : null,
      };
    });
  }),

  serebiiCategory: publicProcedure
    .input(favoriteCategoryBySlugSchema)
    .query(({ input }) => {
      const category = getFavoriteCategoryById(input.slug);
      if (!category || category.id.endsWith('-flavors')) return null;

      const pageKey = pageKeyForCategoryId(category.id);
      if (!pageKey) return null;

      const slugs = getSerebiiSlugsForCategoryId(category.id);
      const itemsResolved = resolveSerebiiSlugsToItems(slugs);

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        examples: category.examples,
        serebiiUrl: serebiiFavoritesPageUrl(pageKey),
        pageKey,
        slugsOnSerebii: slugs.length,
        items: itemsResolved,
      };
    }),
});
