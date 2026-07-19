import { z } from 'zod';
import mongoose from 'mongoose';

// Custom validator for Mongoose ObjectId
const objectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid session ID format',
});

// ─── Chat Validation Schemas ──────────────────────────────────────────────────

export const sendMessageSchema = z.object({
  body: z.object({
    message: z
      .string({ required_error: 'Message content is required' })
      .min(1, 'Message cannot be empty')
      .max(4000, 'Message cannot exceed 4000 characters')
      .trim(),
    sessionId: z
      .string()
      .optional()
      .refine((val) => !val || mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid session ID format',
      }),
  }),
});

export const renameSessionSchema = z.object({
  params: z.object({
    sessionId: objectId,
  }),
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(1, 'Title cannot be empty')
      .max(100, 'Title cannot exceed 100 characters')
      .trim(),
  }),
});

export const sessionIdSchema = z.object({
  params: z.object({
    sessionId: objectId,
  }),
});
