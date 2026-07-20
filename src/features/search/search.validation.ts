import { z } from 'zod';

export const globalSearchSchema = z.object({
  query: z.object({
    q: z.string().trim().min(1, 'Search query is required').max(200),
  }),
});
