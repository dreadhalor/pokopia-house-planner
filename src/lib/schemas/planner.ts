import { z } from 'zod';

export const housePlannerSchema = z.object({
  pokemonIds: z.array(z.string()).min(1).max(4),
});

const houseMaxSchema = z.union([
  z.number().int().min(0).max(99),
  z.null(),
]);

export const partitionTownSchema = z
  .object({
    pokemonIds: z.array(z.string()).min(1).max(2000),
    /** Maximum count of each house size; null = no limit (auto-build, preferring 4-bed). */
    housesOf2: houseMaxSchema,
    housesOf4: houseMaxSchema,
    /** Extra local search (swaps / moves) to raise favorite-overlap scores; slower. */
    deepOptimize: z.boolean().optional().default(false),
  })
  .refine(
    (d) =>
      d.housesOf2 !== 0 ||
      d.housesOf4 !== 0 ||
      d.housesOf2 === null ||
      d.housesOf4 === null,
    {
      message:
        'Allow at least one house type (or leave a field blank for unlimited).',
    },
  )
  .refine((d) => new Set(d.pokemonIds).size === d.pokemonIds.length, {
    message: 'Each Pokémon can only appear once.',
  });
