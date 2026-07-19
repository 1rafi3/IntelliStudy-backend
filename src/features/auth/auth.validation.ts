import { z } from 'zod';

// ─── Auth Validation Schemas ──────────────────────────────────────────────────

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be under 50 characters')
      .trim(),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .toLowerCase()
      .trim(),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export const googleOAuthSchema = z.object({
  body: z.object({
    idToken: z.string({ required_error: 'Google ID token is required' }).min(1),
  }),
});

export const refreshTokenSchema = z.object({
  cookies: z.object({
    intellistudy_refresh_token: z.string({ required_error: 'Refresh token is required' }),
  }),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────
export type RegisterSchema = z.infer<typeof registerSchema>['body'];
export type LoginSchema = z.infer<typeof loginSchema>['body'];
