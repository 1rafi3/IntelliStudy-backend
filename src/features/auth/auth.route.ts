import { Router } from 'express';
import { authController } from './auth.controller';
import { authRateLimiter } from '@shared/middleware/rate-limiter.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { authenticate } from '@shared/middleware/auth.middleware';
import { registerSchema, loginSchema, googleOAuthSchema } from './auth.validation';

// ─── Auth Router ──────────────────────────────────────────────────────────────
// Mounted at: /api/v1/auth
const router = Router();

// Public routes
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/google', authRateLimiter, validate(googleOAuthSchema), authController.loginWithGoogle);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

export { router as authRouter };
