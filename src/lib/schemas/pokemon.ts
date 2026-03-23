import { z } from 'zod';

export const pokemonSearchSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  idealHabitat: z.string().optional(),
  specialty: z.string().optional(),
  rarity: z.string().optional(),
  flavor: z.string().optional(),
});

export const pokemonByIdSchema = z.object({
  id: z.string(),
});
