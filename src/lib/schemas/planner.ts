import { z } from 'zod';

export const housePlannerSchema = z.object({
  pokemonIds: z.array(z.string()).min(1).max(4),
});

export const partitionTownSchema = z
  .object({
    pokemonIds: z.array(z.string()).min(1).max(48),
    housesOf2: z.number().int().min(0).max(24),
    housesOf4: z.number().int().min(0).max(24),
    /** Extra local search (swaps / moves) to raise favorite-overlap scores; slower. */
    deepOptimize: z.boolean().optional().default(false),
  })
  .refine((d) => d.housesOf2 + d.housesOf4 > 0, {
    message: 'Add at least one house.',
  })
  .refine((d) => new Set(d.pokemonIds).size === d.pokemonIds.length, {
    message: 'Each Pokémon can only appear once.',
  })
  .refine(
    (d) => d.housesOf2 * 2 + d.housesOf4 * 4 >= d.pokemonIds.length,
    {
      message: 'Not enough bed slots for this many Pokémon.',
    },
  );
