import { Router } from 'express';
import { dashboardController } from './dashboard.controller';

const router = Router();
router.get('/stats', dashboardController.getStats);
router.get('/activity', dashboardController.getActivity);
router.get('/progress', dashboardController.getProgress);

export { router as dashboardRouter };
