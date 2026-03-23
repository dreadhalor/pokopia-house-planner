import { z } from 'zod';

export const habitatSearchSchema = z.object({
  query: z.string().optional(),
  isEvent: z.boolean().optional(),
});

export const habitatByIdSchema = z.object({
  id: z.string(),
});
