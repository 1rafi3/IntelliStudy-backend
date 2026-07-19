import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '@shared/utils/response-formatter';
import { aiService } from './ai.service';
import { AuthenticatedRequest } from '@shared/types';
import { ApiError } from '@shared/utils/api-error';

export const aiController = {
  // ── AI Roadmap Generation ──────────────────────────────────────────────────
  generateRoadmap: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized();
    }
    const result = await aiService.generateRoadmap(authReq.user.id, req.body);
    sendSuccess(res, result, 'AI Study Roadmap generated successfully');
  }),

  // ── History Listing ────────────────────────────────────────────────────────
  getHistory: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized();
    }
    const history = await aiService.listHistory(authReq.user.id);
    sendSuccess(res, history, 'AI history retrieved successfully');
  }),

  // ── Delete History ─────────────────────────────────────────────────────────
  deleteHistory: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized();
    }
    await aiService.deleteHistory(req.params.id, authReq.user.id);
    sendNoContent(res);
  }),

  // ── Save Roadmap ───────────────────────────────────────────────────────────
  saveRoadmap: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized();
    }
    const result = await aiService.saveRoadmap(authReq.user.id, req.body);
    sendCreated(res, result, 'Roadmap saved to your dashboard successfully');
  }),
};
export default aiController;
