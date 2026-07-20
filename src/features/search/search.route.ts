import { Router } from 'express';
import { searchController } from './search.controller';
import { authenticate } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { globalSearchSchema } from './search.validation';

const router = Router();

router.use(authenticate);

router.get('/', validate(globalSearchSchema), searchController.globalSearch);

export { router as searchRouter };
export default router;
