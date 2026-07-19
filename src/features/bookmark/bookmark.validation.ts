import { z } from 'zod';
export const addBookmarkSchema = z.object({ body: z.object({ resourceId: z.string().min(1), resourceType: z.enum(['roadmap', 'recommendation', 'article']) }) });
