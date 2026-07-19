import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '@shared/utils/response-formatter';
import { chatService } from './chat.service';
import { AuthenticatedRequest } from '@shared/types';
import { ApiError } from '@shared/utils/api-error';

export const chatController = {
  // ── Send message ───────────────────────────────────────────────────────────
  sendMessage: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw ApiError.unauthorized();
    const userId = authReq.user.id;
    const { message, sessionId } = req.body;

    const data = await chatService.sendMessage(userId, message, sessionId);
    sendCreated(res, data, 'Message processed successfully');
  }),

  // ── Get messages history of a session ──────────────────────────────────────
  getHistory: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw ApiError.unauthorized();
    const userId = authReq.user.id;
    const { sessionId } = req.params;

    const data = await chatService.getHistory(userId, sessionId);
    sendSuccess(res, data, 'Message history loaded successfully');
  }),

  // ── List all sessions ──────────────────────────────────────────────────────
  getSessions: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw ApiError.unauthorized();
    const userId = authReq.user.id;

    const data = await chatService.getSessions(userId);
    sendSuccess(res, data, 'Chat sessions retrieved successfully');
  }),

  // ── Rename a session ───────────────────────────────────────────────────────
  renameSession: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw ApiError.unauthorized();
    const userId = authReq.user.id;
    const { sessionId } = req.params;
    const { title } = req.body;

    const data = await chatService.renameSession(userId, sessionId, title);
    sendSuccess(res, data, 'Session renamed successfully');
  }),

  // ── Delete a session ───────────────────────────────────────────────────────
  deleteSession: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw ApiError.unauthorized();
    const userId = authReq.user.id;
    const { sessionId } = req.params;

    await chatService.deleteSession(userId, sessionId);
    sendNoContent(res);
  }),
};
export default chatController;
