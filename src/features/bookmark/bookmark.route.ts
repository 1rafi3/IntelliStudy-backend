import { Router } from 'express';
import { bookmarkController } from './bookmark.controller';
import { authenticate } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { addBookmarkSchema, deleteBookmarkSchema, listBookmarksSchema } from './bookmark.validation';

const router = Router();

// Protect all bookmark routes
router.use(authenticate);

// List bookmarks (supports search, filter, pagination)
router.get('/', validate(listBookmarksSchema), bookmarkController.getAll);

// Add a bookmark
router.post('/', validate(addBookmarkSchema), bookmarkController.add);

// Delete by reference details (easy toggle on card UI)
router.delete('/by-reference/:type/:referencedId', bookmarkController.removeByReference);

// Delete by bookmark ID
router.delete('/:id', validate(deleteBookmarkSchema), bookmarkController.remove);

export { router as bookmarkRouter };
export default router;
