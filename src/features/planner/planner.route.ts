import { Router } from 'express';
import { plannerController } from './planner.controller';

const router = Router();
router.post('/', plannerController.create);
router.get('/', plannerController.getAll);
router.patch('/:id', plannerController.update);
router.patch('/:id/toggle', plannerController.toggleComplete);
router.delete('/:id', plannerController.delete);

export { router as plannerRouter };
