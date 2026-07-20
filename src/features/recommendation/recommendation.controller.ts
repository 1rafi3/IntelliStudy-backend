import { Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler';
import { sendSuccess } from '@shared/utils/response-formatter';
import { recommendationService } from './recommendation.service';
import { AuthenticatedRequest } from '@shared/types';
import { ApiError } from '@shared/utils/api-error';

export const recommendationController = {
  /**
   * Get all recommendations for the authenticated user.
   */
  getAll: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const data = await recommendationService.getAll(req.user.id);
    sendSuccess(res, data, 'Recommendations retrieved successfully');
  }),

  /**
   * Manually trigger re-generation of recommendations using Gemini.
   */
  refresh: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const data = await recommendationService.generate(req.user.id);
    sendSuccess(res, data, 'Recommendations regenerated successfully');
  }),

  /**
   * Get a single recommendation by ID.
   */
  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const data = await recommendationService.getById(req.params.id, req.user.id);
    sendSuccess(res, data, 'Recommendation retrieved successfully');
  }),

  /**
   * Mark a specific recommendation as read.
   */
  markAsRead: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const data = await recommendationService.markAsRead(req.params.id, req.user.id);
    sendSuccess(res, data, 'Recommendation marked as read');
  }),

  /**
   * Dismiss/Delete a recommendation.
   */
  dismiss: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    await recommendationService.dismiss(req.params.id, req.user.id);
    sendSuccess(res, null, 'Recommendation dismissed');
  }),
};
