import { z } from 'zod';
export const createTaskSchema = z.object({ body: z.object({ title: z.string().min(1).max(200), dueDate: z.string().datetime(), roadmapId: z.string().optional() }) });
