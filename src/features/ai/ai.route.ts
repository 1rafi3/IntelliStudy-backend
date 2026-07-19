import { Router } from 'express';
import { aiController } from './ai.controller';
import { aiRateLimiter } from '@shared/middleware/rate-limiter.middleware';
import { authenticate } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { generateRoadmapSchema, saveRoadmapSchema, historyIdSchema } from './ai.validation';

// ─── AI Router ────────────────────────────────────────────────────────────────
// Mounted at: /api/v1/ai
const router = Router();

// Protect all AI routes with authentication middleware
router.use(authenticate);

// ── Generation Endpoints ──
// Use aiRateLimiter for generation to prevent Gemini API abuse
router.post(
  '/generate-roadmap',
  aiRateLimiter,
  validate(generateRoadmapSchema),
  aiController.generateRoadmap
);

// ── Save to Dashboard ──
router.post(
  '/save-roadmap',
  validate(saveRoadmapSchema),
  aiController.saveRoadmap
);

// ── History Management ──
router.get('/history', aiController.getHistory);
router.delete('/history/:id', validate(historyIdSchema), aiController.deleteHistory);

export { router as aiRouter };
export default router;
