import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

export const recommendationIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
