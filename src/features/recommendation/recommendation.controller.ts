import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler';
import { sendSuccess } from '@shared/utils/response-formatter';

export const recommendationController = {
  generate: asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, [], 'generate — not yet implemented'); }),
  getAll:   asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, [], 'getAll — not yet implemented'); }),
  dismiss:  asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, null, 'dismiss — not yet implemented'); }),
};
