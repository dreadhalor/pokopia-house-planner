import { router, publicProcedure } from '../trpc';
import { habitatSearchSchema, habitatByIdSchema } from '@/lib/schemas/habitat';
import { habitats, pokemon, getSpriteUrl } from '@/data';

export const habitatRouter = router({
  search: publicProcedure.input(habitatSearchSchema).query(({ input }) => {
    let results = [...habitats];

    if (input.query) {
      const q = input.query.toLowerCase();
      results = results.filter((h) => h.name.toLowerCase().includes(q));
    }

    if (input.isEvent !== undefined) {
      results = results.filter((h) => h.isEvent === input.isEvent);
    }

    return results;
  }),

  getById: publicProcedure.input(habitatByIdSchema).query(({ input }) => {
    const habitat = habitats.find((h) => h.id === input.id);
    if (!habitat) {
      return null;
    }

    const residents = pokemon.filter((p) =>
      p.habitats.some((h) => h.name === habitat.name),
    );

    residents.sort(
      (a, b) => parseInt(a.number.slice(1)) - parseInt(b.number.slice(1)),
    );

    const residentsWithSprites = residents.map((p) => ({
      ...p,
      sprite: getSpriteUrl(p.name),
    }));
    return { ...habitat, pokemon: residentsWithSprites };
  }),
});
