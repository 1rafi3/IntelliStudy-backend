import { Router } from 'express';
import { recommendationController } from './recommendation.controller';
import { authenticate } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { aiRateLimiter } from '@shared/middleware/rate-limiter.middleware';
import { recommendationIdSchema } from './recommendation.validation';

const router = Router();

// Protect all recommendation endpoints
router.use(authenticate);

router.get('/', recommendationController.getAll);

router.post('/refresh', aiRateLimiter, recommendationController.refresh);

router.patch(
  '/:id/read',
  validate(recommendationIdSchema),
  recommendationController.markAsRead
);

router.delete(
  '/:id',
  validate(recommendationIdSchema),
  recommendationController.dismiss
);

export { router as recommendationRouter };
export default router;
