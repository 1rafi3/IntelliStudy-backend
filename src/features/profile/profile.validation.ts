import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be under 50 characters')
      .trim()
      .optional(),
    avatar: z.string().max(500, 'Avatar URL is too long').optional(),
    learningGoal: z.string().max(500, 'Learning goal is too long').trim().optional(),
    currentLevel: z.enum(['beginner', 'intermediate', 'advanced', '']).optional(),
    learningStyle: z.enum(['visual', 'auditory', 'reading', 'kinesthetic', '']).optional(),
    preferredLanguage: z.string().max(50, 'Language is too long').trim().optional(),
    weeklyStudyHours: z.number().min(0).max(168).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({ required_error: 'Current password is required' }).min(1),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  }),
});

export const uploadAvatarSchema = z.object({
  body: z.object({
    avatar: z.string({ required_error: 'Avatar data URL is required' }).min(1),
  }),
});
