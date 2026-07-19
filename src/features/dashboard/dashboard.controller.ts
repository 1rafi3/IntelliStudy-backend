import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler';
import { sendSuccess } from '@shared/utils/response-formatter';

export const dashboardController = {
  getStats:    asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, null, 'getStats — not yet implemented'); }),
  getActivity: asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, [], 'getActivity — not yet implemented'); }),
  getProgress: asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, null, 'getProgress — not yet implemented'); }),
};
