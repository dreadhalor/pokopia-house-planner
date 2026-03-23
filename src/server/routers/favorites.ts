import { router, publicProcedure } from '../trpc';
import { favoriteCategoryBySlugSchema } from '@/lib/schemas/items';
import {
  favoriteCategories,
  getFavoriteCategoryById,
  pokemon,
  items,
  getItemImagePath,
  getSpriteUrl,
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
});
