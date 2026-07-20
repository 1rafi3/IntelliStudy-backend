import { Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler';
import { sendSuccess } from '@shared/utils/response-formatter';
import { searchService } from './search.service';
import { AuthenticatedRequest } from '@shared/types';
import { ApiError } from '@shared/utils/api-error';

export const searchController = {
  globalSearch: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const q = (req.query.q as string) || '';
    const data = await searchService.globalSearch(req.user.id, q);
    sendSuccess(res, data, 'Search results retrieved successfully');
  }),
};
