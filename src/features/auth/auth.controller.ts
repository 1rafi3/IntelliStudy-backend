import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler';
import { sendSuccess, sendCreated } from '@shared/utils/response-formatter';
import { authService } from './auth.service';
import { authUtils } from './auth.utils';
import { COOKIE_NAMES } from '@shared/constants';
import { AuthenticatedRequest } from '@shared/types';
import { ApiError } from '@shared/utils/api-error';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { user, tokens } = await authService.register(req.body);
    authUtils.setRefreshTokenCookie(res, tokens.refreshToken);
    sendCreated(res, { user, accessToken: tokens.accessToken }, 'Registration successful');
  }),

  login: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { user, tokens } = await authService.login(req.body);
    authUtils.setRefreshTokenCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Login successful');
  }),

  loginWithGoogle: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { idToken } = req.body;
    const { user, tokens } = await authService.loginWithGoogle(idToken);
    authUtils.setRefreshTokenCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Google login successful');
  }),

  refreshToken: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Extract signed cookie refresh token
    const token = req.signedCookies[COOKIE_NAMES.REFRESH_TOKEN] as string;
    if (!token) {
      throw ApiError.unauthorized('No refresh token provided');
    }

    const tokens = await authService.refreshToken(token);
    authUtils.setRefreshTokenCookie(res, tokens.refreshToken);
    sendSuccess(res, { accessToken: tokens.accessToken }, 'Token refreshed successfully');
  }),

  logout: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    authUtils.clearAuthCookies(res);
    sendSuccess(res, null, 'Logged out successfully');
  }),

  getMe: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized();
    }

    const user = await authService.getMe(authReq.user.id);
    sendSuccess(res, { user }, 'Current user profile retrieved');
  }),
};
export default authController;
