import { z } from 'zod';
export const createReviewSchema = z.object({
  body: z.object({
    targetId: z.string().min(1),
    targetType: z.enum(['roadmap', 'recommendation']),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
  }),
});
