import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '@shared/utils/response-formatter';
import { roadmapsService } from './roadmaps.service';
import { AuthenticatedRequest } from '@shared/types';
import { ApiError } from '@shared/utils/api-error';
import { recommendationService } from '@features/recommendation/recommendation.service';
import { logger } from '@shared/utils/logger';

// ─── Roadmaps Controller ──────────────────────────────────────────────────────
// Thin delivery wrapper. Calls service layer to perform all business logic.
export const roadmapsController = {
  list: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized();
    }
    const result = await roadmapsService.list(authReq.user.id, req.query as any);
    sendSuccess(res, result, 'Roadmaps retrieved successfully');
  }),

  getById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized();
    }
    const result = await roadmapsService.getById(req.params.id, authReq.user.id);
    sendSuccess(res, result, 'Roadmap retrieved successfully');
  }),

  create: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized();
    }
    const result = await roadmapsService.create(authReq.user.id, req.body);
    
    // Background refresh recommendations
    recommendationService.generate(authReq.user.id).catch((err) => {
      logger.error('Failed to trigger background recommendation refresh after roadmap create:', err);
    });

    sendCreated(res, result, 'Roadmap created successfully');
  }),

  update: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized();
    }
    const result = await roadmapsService.update(req.params.id, authReq.user.id, req.body);

    // Background refresh recommendations
    recommendationService.generate(authReq.user.id).catch((err) => {
      logger.error('Failed to trigger background recommendation refresh after roadmap update:', err);
    });

    sendSuccess(res, result, 'Roadmap updated successfully');
  }),

  toggleArchive: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized();
    }
    const result = await roadmapsService.toggleArchive(req.params.id, authReq.user.id);

    // Background refresh recommendations
    recommendationService.generate(authReq.user.id).catch((err) => {
      logger.error('Failed to trigger background recommendation refresh after roadmap toggleArchive:', err);
    });

    sendSuccess(res, result, result.archived ? 'Roadmap archived successfully' : 'Roadmap unarchived successfully');
  }),

  delete: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized();
    }
    await roadmapsService.delete(req.params.id, authReq.user.id);
    sendNoContent(res);
  }),
};
export default roadmapsController;
