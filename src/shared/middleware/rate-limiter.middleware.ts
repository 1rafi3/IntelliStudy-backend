import rateLimit from 'express-rate-limit';
import { HTTP_STATUS, API_MESSAGES } from '@shared/constants';

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
// Applied to all routes by default.
// Prevents brute force and DDoS attacks.
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: API_MESSAGES.RATE_LIMIT,
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

// ─── Auth Rate Limiter ────────────────────────────────────────────────────────
// Stricter limit applied specifically to auth routes (login, register).
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 auth attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts — please try again in 15 minutes',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

// ─── AI Rate Limiter ──────────────────────────────────────────────────────────
// Protects Gemini API usage from being exhausted by a single user.
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,             // max 20 AI requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI request limit reached — please wait before sending more requests',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});
