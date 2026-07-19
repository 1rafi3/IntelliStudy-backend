import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler';
import { sendSuccess, sendCreated } from '@shared/utils/response-formatter';

export const bookmarkController = {
  add:    asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendCreated(res, null, 'add — not yet implemented'); }),
  remove: asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, null, 'remove — not yet implemented'); }),
  getAll: asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, [], 'getAll — not yet implemented'); }),
};
