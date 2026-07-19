import { z } from 'zod';
export const generateRecommendationSchema = z.object({ body: z.object({ topic: z.string().min(1).optional(), limit: z.number().int().min(1).max(20).optional() }) });
