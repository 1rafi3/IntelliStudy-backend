import { Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler';
import { sendSuccess } from '@shared/utils/response-formatter';
import { profileService } from './profile.service';
import { AuthenticatedRequest } from '@shared/types';
import { ApiError } from '@shared/utils/api-error';

export const profileController = {
  getProfile: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const data = await profileService.getProfile(req.user.id);
    sendSuccess(res, data, 'Profile retrieved successfully');
  }),

  updateProfile: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const data = await profileService.updateProfile(req.user.id, req.body);
    sendSuccess(res, data, 'Profile updated successfully');
  }),

  changePassword: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const { currentPassword, newPassword } = req.body;
    await profileService.changePassword(req.user.id, currentPassword, newPassword);
    sendSuccess(res, null, 'Password changed successfully');
  }),

  uploadAvatar: asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const data = await profileService.uploadAvatar(req.user.id, req.body.avatar);
    sendSuccess(res, data, 'Avatar updated successfully');
  }),
};
