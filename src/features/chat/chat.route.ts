import { Router } from 'express';
import { chatController } from './chat.controller';
import { authenticate } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validate.middleware';
import { aiRateLimiter } from '@shared/middleware/rate-limiter.middleware';
import {
  sendMessageSchema,
  renameSessionSchema,
  sessionIdSchema,
} from './chat.validation';

const router = Router();

// Secure all chat endpoints with auth middleware
router.use(authenticate);

// ── Messages ──
router.post(
  '/message',
  aiRateLimiter, // Protect AI tokens from abuse
  validate(sendMessageSchema),
  chatController.sendMessage
);

// ── Sessions CRUD ──
router.get('/sessions', chatController.getSessions);

router.get(
  '/sessions/:sessionId',
  validate(sessionIdSchema),
  chatController.getHistory
);

router.patch(
  '/sessions/:sessionId',
  validate(renameSessionSchema),
  chatController.renameSession
);

router.delete(
  '/sessions/:sessionId',
  validate(sessionIdSchema),
  chatController.deleteSession
);

export { router as chatRouter };
export default router;
