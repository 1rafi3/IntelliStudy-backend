import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler';
import { sendSuccess, sendCreated } from '@shared/utils/response-formatter';

export const reviewController = {
  create:       asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendCreated(res, null, 'create — not yet implemented'); }),
  getForTarget: asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, [], 'getForTarget — not yet implemented'); }),
  update:       asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, null, 'update — not yet implemented'); }),
  delete:       asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, null, 'delete — not yet implemented'); }),
};
