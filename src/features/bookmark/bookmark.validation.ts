import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

export const addBookmarkSchema = z.object({
  body: z.object({
    type: z.enum(['ai-roadmap', 'manual-roadmap', 'chat-response', 'recommendation'], {
      required_error: 'Bookmark type is required',
      invalid_type_error: 'Invalid bookmark type',
    }),
    referencedId: z.string().min(1, 'Referenced item ID is required'),
    title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
    preview: z.string().max(5000, 'Preview cannot exceed 5000 characters').optional(),
  }),
});

export const deleteBookmarkSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const listBookmarksSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    type: z.enum(['ai-roadmap', 'manual-roadmap', 'chat-response', 'recommendation']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
