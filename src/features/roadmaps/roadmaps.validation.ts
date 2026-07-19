import { z } from 'zod';

// ─── Roadmap Validation Schemas (Zod) ────────────────────────────────────────

const tagsArray = z
  .array(z.string().max(30, 'Each tag must be under 30 characters').trim())
  .max(10, 'Maximum 10 tags allowed')
  .default([]);

export const createRoadmapSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(3, 'Title must be at least 3 characters')
      .max(120, 'Title must be under 120 characters')
      .trim(),
    subject: z
      .string({ required_error: 'Subject is required' })
      .min(2, 'Subject must be at least 2 characters')
      .max(80, 'Subject must be under 80 characters')
      .trim(),
    description: z
      .string()
      .max(1000, 'Description must be under 1000 characters')
      .trim()
      .optional(),
    goal: z
      .string()
      .max(500, 'Goal must be under 500 characters')
      .trim()
      .optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
      required_error: 'Difficulty is required',
      invalid_type_error: 'Difficulty must be beginner, intermediate, or advanced',
    }),
    estimatedDuration: z
      .number({ invalid_type_error: 'Estimated duration must be a number' })
      .int('Duration must be a whole number')
      .min(1, 'Duration must be at least 1 week')
      .max(104, 'Duration cannot exceed 104 weeks')
      .optional(),
    tags: tagsArray,
  }),
});

export const updateRoadmapSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Roadmap ID is required'),
  }),
  body: z.object({
    title: z.string().min(3).max(120).trim().optional(),
    subject: z.string().min(2).max(80).trim().optional(),
    description: z.string().max(1000).trim().optional(),
    goal: z.string().max(500).trim().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    estimatedDuration: z.number().int().min(1).max(104).optional(),
    progress: z.number().min(0).max(100).optional(),
    status: z.enum(['not-started', 'in-progress', 'completed', 'paused']).optional(),
    tags: tagsArray.optional(),
  }),
});

export const roadmapIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Roadmap ID is required'),
  }),
});

export const listRoadmapsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    search: z.string().trim().optional(),
    status: z.enum(['not-started', 'in-progress', 'completed', 'paused']).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    archived: z
        .string()
        .optional()
        .transform((val) => {
          if (val === 'true') return true;
          if (val === 'false') return false;
          return undefined;
        })
        .pipe(z.boolean().optional()),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'progress']).default('updatedAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────
export type CreateRoadmapDto = z.infer<typeof createRoadmapSchema>['body'];
export type UpdateRoadmapDto = z.infer<typeof updateRoadmapSchema>['body'];
export type ListRoadmapsQuery = z.infer<typeof listRoadmapsSchema>['query'];
