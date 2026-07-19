import { z } from 'zod';

export const generateRoadmapSchema = z.object({
  body: z.object({
    learningGoal: z
      .string({ required_error: 'Learning goal is required' })
      .min(5, 'Learning goal must be at least 5 characters')
      .max(300, 'Learning goal cannot exceed 300 characters')
      .trim(),
    currentLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
      required_error: 'Current level is required',
    }),
    duration: z
      .number({ required_error: 'Duration is required' })
      .int()
      .min(1, 'Duration must be at least 1 week')
      .max(52, 'Duration cannot exceed 52 weeks'),
    weeklyHours: z
      .number({ required_error: 'Weekly hours commitment is required' })
      .int()
      .min(1, 'Weekly commitment must be at least 1 hour')
      .max(168, 'Weekly commitment cannot exceed 168 hours'),
    learningStyle: z
      .string({ required_error: 'Learning style is required' })
      .min(2)
      .max(50)
      .trim(),
    language: z
      .string({ required_error: 'Preferred language is required' })
      .min(2)
      .max(50)
      .trim(),
  }),
});

export const saveRoadmapSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    subject: z.string().min(2).max(80),
    description: z.string().max(1000).optional(),
    goal: z.string().max(500).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedDuration: z.number().int().min(1).max(104).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const historyIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'History ID is required'),
  }),
});

export type GenerateRoadmapDto = z.infer<typeof generateRoadmapSchema>['body'];
export type SaveRoadmapDto = z.infer<typeof saveRoadmapSchema>['body'];
