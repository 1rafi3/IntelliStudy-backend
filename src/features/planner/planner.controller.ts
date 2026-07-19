import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler';
import { sendSuccess, sendCreated } from '@shared/utils/response-formatter';

export const plannerController = {
  create:         asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendCreated(res, null, 'create — not yet implemented'); }),
  getAll:         asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, [], 'getAll — not yet implemented'); }),
  update:         asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, null, 'update — not yet implemented'); }),
  delete:         asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, null, 'delete — not yet implemented'); }),
  toggleComplete: asyncHandler(async (_req: Request, res: Response): Promise<void> => { sendSuccess(res, null, 'toggleComplete — not yet implemented'); }),
};
