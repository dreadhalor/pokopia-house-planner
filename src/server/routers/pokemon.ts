import { router, publicProcedure } from '../trpc';
import { pokemonSearchSchema, pokemonByIdSchema } from '@/lib/schemas/pokemon';
import { pokemon, type Pokemon, getSpriteUrl } from '@/data';

function getRankedRoommates(target: Pokemon, allPokemon: Pokemon[]) {
  const candidates = allPokemon.filter(
    (p) => p.id !== target.id && p.idealHabitat === target.idealHabitat,
  );

  const targetFavorites = target.favorites.slice(0, 5);

  const scored = candidates.map((candidate) => {
    const candidateFavorites = candidate.favorites.slice(0, 5);
    const shared = targetFavorites.filter((fav) =>
      candidateFavorites.includes(fav),
    );
    return {
      id: candidate.id,
      name: candidate.name,
      number: candidate.number,
      score: shared.length,
      sharedFavorites: shared,
      idealHabitat: candidate.idealHabitat,
      sprite: getSpriteUrl(candidate.name),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 20);
}

export const pokemonRouter = router({
  search: publicProcedure.input(pokemonSearchSchema).query(({ input }) => {
    let results = [...pokemon];

    if (input.query) {
      const q = input.query.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (input.location) {
      results = results.filter((p) => p.location === input.location);
    }

    if (input.idealHabitat) {
      results = results.filter((p) => p.idealHabitat === input.idealHabitat);
    }

    if (input.specialty) {
      results = results.filter((p) => p.specialties.includes(input.specialty!));
    }

    if (input.rarity) {
      results = results.filter((p) =>
        p.habitats.some((h) => h.rarity === input.rarity),
      );
    }

    if (input.flavor) {
      results = results.filter((p) => p.flavor === input.flavor);
    }

    results.sort(
      (a, b) => parseInt(a.number.slice(1)) - parseInt(b.number.slice(1)),
    );

    return results.map((p) => ({
      ...p,
      sprite: getSpriteUrl(p.name),
    }));
  }),

  getById: publicProcedure.input(pokemonByIdSchema).query(({ input }) => {
    const target = pokemon.find((p) => p.id === input.id);
    if (!target) {
      return null;
    }

    const roommates = getRankedRoommates(target, pokemon);
    return { ...target, sprite: getSpriteUrl(target.name), roommates };
  }),

  getRoommates: publicProcedure.input(pokemonByIdSchema).query(({ input }) => {
    const target = pokemon.find((p) => p.id === input.id);
    if (!target) {
      return [];
    }

    return getRankedRoommates(target, pokemon);
  }),
});
