import { Router } from 'express';
import { profileController } from './profile.controller';
import { authenticate } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { updateProfileSchema, changePasswordSchema, uploadAvatarSchema } from './profile.validation';

const router = Router();

router.use(authenticate);

router.get('/', profileController.getProfile);
router.put('/', validate(updateProfileSchema), profileController.updateProfile);
router.put('/password', validate(changePasswordSchema), profileController.changePassword);
router.put('/avatar', validate(uploadAvatarSchema), profileController.uploadAvatar);

export { router as profileRouter };
export default router;
