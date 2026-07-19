import { Router } from 'express';
import { roadmapsController } from './roadmaps.controller';
import { authenticate } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import {
  createRoadmapSchema,
  updateRoadmapSchema,
  roadmapIdSchema,
  listRoadmapsSchema,
} from './roadmaps.validation';

// ─── Roadmaps Router ──────────────────────────────────────────────────────────
// Mounted at: /api/v1/roadmaps
const router = Router();

// Protect all routes with authentication middleware
router.use(authenticate);

router.get('/', validate(listRoadmapsSchema), roadmapsController.list);
router.post('/', validate(createRoadmapSchema), roadmapsController.create);

router.get('/:id', validate(roadmapIdSchema), roadmapsController.getById);
router.patch('/:id', validate(updateRoadmapSchema), roadmapsController.update);
router.delete('/:id', validate(roadmapIdSchema), roadmapsController.delete);
router.patch('/:id/archive', validate(roadmapIdSchema), roadmapsController.toggleArchive);

export { router as roadmapsRouter };
export default router;
