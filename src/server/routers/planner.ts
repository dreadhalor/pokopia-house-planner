import { router, publicProcedure } from '../trpc';
import { housePlannerSchema, partitionTownSchema } from '@/lib/schemas/planner';
import { pokemon, getSpriteUrl } from '@/data';
import {
  computePairwiseOverlap,
  compatibilityScoreForGroup,
  sharedFavoritesForGroup,
  buildHouseCapsFromMaxes,
  optimizeTownHousing,
  houseFurnishingSuggestions,
} from '../housing';

export const plannerRouter = router({
  analyze: publicProcedure.input(housePlannerSchema).query(({ input }) => {
    const selected = input.pokemonIds
      .map((id) => pokemon.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p != null);

    if (selected.length === 0) {
      return {
        pokemon: [] as (typeof selected[number] & { sprite: string })[],
        habitatConflicts: [] as {
          id: string;
          name: string;
          idealHabitat: string;
        }[],
        sharedFavorites: [] as string[],
        compatibilityScore: 0,
        suggestedFurnitureCategories: [] as string[],
      };
    }

    const habitatTypes = [...new Set(selected.map((p) => p.idealHabitat))];
    const habitatConflicts =
      habitatTypes.length > 1
        ? selected.map((p) => ({
            id: p.id,
            name: p.name,
            idealHabitat: p.idealHabitat,
          }))
        : [];

    const sharedFavorites = sharedFavoritesForGroup(selected);
    const compatibilityScore = compatibilityScoreForGroup(selected);

    const allFavorites = [
      ...new Set(selected.flatMap((p) => p.favorites.slice(0, 5))),
    ];
    const suggestedFurnitureCategories =
      sharedFavorites.length > 0
        ? sharedFavorites
        : allFavorites.slice(0, 5);

    const pokemonWithSprites = selected.map((p) => ({
      ...p,
      sprite: getSpriteUrl(p.name),
    }));

    return {
      pokemon: pokemonWithSprites,
      habitatConflicts,
      sharedFavorites,
      compatibilityScore,
      suggestedFurnitureCategories,
    };
  }),

  recommend: publicProcedure.input(housePlannerSchema).query(({ input }) => {
    const selected = input.pokemonIds
      .map((id) => pokemon.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p != null);

    if (selected.length === 0) return [];

    const selectedIds = new Set(input.pokemonIds);
    const dominantHabitat = (() => {
      const counts: Record<string, number> = {};
      for (const p of selected) {
        counts[p.idealHabitat] = (counts[p.idealHabitat] ?? 0) + 1;
      }
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]![0];
    })();

    const selectedFavs = selected.map((p) => p.favorites.slice(0, 5));

    const candidates = pokemon
      .filter((p) => !selectedIds.has(p.id))
      .map((candidate) => {
        const candFavs = candidate.favorites.slice(0, 5);

        let totalOverlap = 0;
        for (const favs of selectedFavs) {
          totalOverlap += computePairwiseOverlap(favs, candFavs);
        }
        const avgOverlap = totalOverlap / selected.length;
        const favoriteScore = (avgOverlap / 5) * 70;

        const habitatScore =
          candidate.idealHabitat === dominantHabitat ? 30 : 0;

        const score = Math.round(favoriteScore + habitatScore);

        const sharedWith = [
          ...new Set(selectedFavs.flat().filter((f) => candFavs.includes(f))),
        ];

        return {
          id: candidate.id,
          number: candidate.number,
          name: candidate.name,
          idealHabitat: candidate.idealHabitat,
          sprite: getSpriteUrl(candidate.name),
          score,
          habitatMatch: candidate.idealHabitat === dominantHabitat,
          sharedFavorites: sharedWith,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    return candidates;
  }),

  partitionTown: publicProcedure
    .input(partitionTownSchema)
    .query(({ input }) => {
      const mons = input.pokemonIds
        .map((id) => pokemon.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => p != null);

      if (mons.length !== input.pokemonIds.length) {
        return {
          ok: false as const,
          error: 'One or more Pokémon could not be found.',
        };
      }

      const built = buildHouseCapsFromMaxes(mons, input.housesOf4, input.housesOf2);
      if (!built.ok) {
        return { ok: false as const, error: built.error };
      }
      const opt = optimizeTownHousing(mons, built.caps, {
        deepOptimize: input.deepOptimize,
      });

      if (!opt.ok) {
        return { ok: false as const, error: opt.error };
      }

      const houses = opt.result.houses.map((h) => {
        const { suggestedItems, furnishingByCategory } =
          houseFurnishingSuggestions(h.members, 12);
        return {
          index: h.index,
          capacity: h.capacity,
          idealHabitat: h.idealHabitat,
          compatibilityScore: h.compatibilityScore,
          sharedFavorites: h.sharedFavorites,
          pokemon: h.members.map((p) => ({
            ...p,
            sprite: getSpriteUrl(p.name),
          })),
          suggestedItems,
          furnishingByCategory,
        };
      });

      return {
        ok: true as const,
        sumHouseCompatibility: opt.result.sumHouseCompatibility,
        averageHouseCompatibility: opt.result.averageHouseCompatibility,
        houses,
      };
    }),
});
