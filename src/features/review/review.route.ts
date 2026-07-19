import { Router } from 'express';
import { reviewController } from './review.controller';

const router = Router();
router.post('/', reviewController.create);
router.get('/:targetId', reviewController.getForTarget);
router.patch('/:id', reviewController.update);
router.delete('/:id', reviewController.delete);

export { router as reviewRouter };
