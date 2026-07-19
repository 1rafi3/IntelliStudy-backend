import { Router } from 'express';
import { recommendationController } from './recommendation.controller';
import { aiRateLimiter } from '@shared/middleware/rate-limiter.middleware';

const router = Router();
router.post('/generate', aiRateLimiter, recommendationController.generate);
router.get('/', recommendationController.getAll);
router.delete('/:id', recommendationController.dismiss);

export { router as recommendationRouter };
