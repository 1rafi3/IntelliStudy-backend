import { Router } from 'express';
import { bookmarkController } from './bookmark.controller';

const router = Router();
router.post('/', bookmarkController.add);
router.get('/', bookmarkController.getAll);
router.delete('/:id', bookmarkController.remove);

export { router as bookmarkRouter };
