import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '@shared/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', analyticsController.getAnalytics);

export { router as analyticsRouter };
export default router;
