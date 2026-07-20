import { Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler';
import { sendSuccess } from '@shared/utils/response-formatter';
import { analyticsService } from './analytics.service';
import { AuthenticatedRequest } from '@shared/types';
import { ApiError } from '@shared/utils/api-error';

export const analyticsController = {
  getAnalytics: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const data = await analyticsService.getAnalytics(req.user.id);
    sendSuccess(res, data, 'Analytics retrieved successfully');
  }),
};
