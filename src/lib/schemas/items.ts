import { z } from 'zod';

export const itemSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
});

export const itemBySlugSchema = z.object({
  slug: z.string(),
});

export const favoriteCategoryBySlugSchema = z.object({
  slug: z.string(),
});
