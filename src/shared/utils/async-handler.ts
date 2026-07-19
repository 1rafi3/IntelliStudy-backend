import { Request, Response, NextFunction } from 'express';
import { AsyncHandler } from '@shared/types';

// ─── Async Handler Wrapper ────────────────────────────────────────────────────
// Wraps async route handlers to automatically catch rejected promises
// and pass errors to Express's global error middleware.
// Use this for every controller method to avoid try/catch boilerplate.
//
// Usage:
//   router.get('/path', asyncHandler(myController.getAll));

export const asyncHandler =
  (fn: AsyncHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
