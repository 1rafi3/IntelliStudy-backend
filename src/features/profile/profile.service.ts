import { User } from '@features/auth/user.model';
import { authUtils } from '@features/auth/auth.utils';
import { ApiError } from '@shared/utils/api-error';
import { UserProfileResponse } from '@features/auth/auth.types';

const serialize = (user: any): UserProfileResponse => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || '',
  provider: user.provider || 'local',
  learningGoal: user.learningGoal || '',
  currentLevel: user.currentLevel || '',
  learningStyle: user.learningStyle || '',
  preferredLanguage: user.preferredLanguage || '',
  weeklyStudyHours: user.weeklyStudyHours || 0,
  createdAt: user.createdAt?.toISOString?.() || '',
  updatedAt: user.updatedAt?.toISOString?.() || '',
});

export const profileService = {
  getProfile: async (userId: string): Promise<UserProfileResponse> => {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return serialize(user);
  },

  updateProfile: async (
    userId: string,
    dto: {
      name?: string;
      avatar?: string;
      learningGoal?: string;
      currentLevel?: string;
      learningStyle?: string;
      preferredLanguage?: string;
      weeklyStudyHours?: number;
    },
  ): Promise<UserProfileResponse> => {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.avatar !== undefined) user.avatar = dto.avatar;
    if (dto.learningGoal !== undefined) user.learningGoal = dto.learningGoal;
    if (dto.currentLevel !== undefined) user.currentLevel = dto.currentLevel as any;
    if (dto.learningStyle !== undefined) user.learningStyle = dto.learningStyle as any;
    if (dto.preferredLanguage !== undefined) user.preferredLanguage = dto.preferredLanguage;
    if (dto.weeklyStudyHours !== undefined) user.weeklyStudyHours = dto.weeklyStudyHours;

    await user.save();
    return serialize(user);
  },

  changePassword: async (
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.provider !== 'local') {
      throw ApiError.badRequest('Cannot change password for OAuth accounts');
    }

    if (!user.password) {
      throw ApiError.badRequest('No password set for this account');
    }

    const isMatch = await authUtils.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    user.password = await authUtils.hashPassword(newPassword);
    await user.save();
  },

  uploadAvatar: async (userId: string, avatarUrl: string): Promise<UserProfileResponse> => {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    user.avatar = avatarUrl;
    await user.save();
    return serialize(user);
  },
};
