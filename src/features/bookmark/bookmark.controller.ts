import { Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '@shared/utils/response-formatter';
import { bookmarkService } from './bookmark.service';
import { AuthenticatedRequest } from '@shared/types';
import { ApiError } from '@shared/utils/api-error';

export const bookmarkController = {
  /**
   * Add a new bookmark for the authenticated user.
   */
  add: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const result = await bookmarkService.add(req.user.id, req.body);
    sendCreated(res, result, 'Resource bookmarked successfully');
  }),

  /**
   * Remove a bookmark by ID.
   */
  remove: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    await bookmarkService.remove(req.params.id, req.user.id);
    sendNoContent(res);
  }),

  /**
   * Remove a bookmark by referenced item details.
   */
  removeByReference: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const { type, referencedId } = req.params;
    if (!type || !referencedId) {
      throw ApiError.badRequest('Bookmark type and referenced ID are required');
    }
    
    // Quick validation of the type
    const validTypes = ['ai-roadmap', 'manual-roadmap', 'chat-response', 'recommendation'];
    if (!validTypes.includes(type)) {
      throw ApiError.badRequest('Invalid bookmark type');
    }

    await bookmarkService.removeByReference(
      req.user.id,
      type as any,
      referencedId
    );
    sendNoContent(res);
  }),

  /**
   * Get all bookmarks for the user with filters, search, and pagination.
   */
  getAll: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    // Extract query values with defaults
    const search = req.query.search as string | undefined;
    const type = req.query.type as any | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const data = await bookmarkService.getAll(req.user.id, {
      page,
      limit,
      search,
      type,
    });

    sendSuccess(res, data, 'Bookmarks retrieved successfully');
  }),
};
export default bookmarkController;
