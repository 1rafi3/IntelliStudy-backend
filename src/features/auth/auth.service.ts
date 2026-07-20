import { User } from './user.model';
import { authUtils } from './auth.utils';
import { RegisterDto, LoginDto, AuthResponse, AuthTokens, JwtPayload } from './auth.types';
import { ApiError } from '@shared/utils/api-error';
import { HTTP_STATUS } from '@shared/constants';
import { OAuth2Client } from 'google-auth-library';
import { env } from '@config/env';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const authService = {
  register: async (dto: RegisterDto): Promise<{ user: AuthResponse['user']; tokens: AuthTokens }> => {
    const { name, email, password } = dto;

    if (!password) {
      throw ApiError.badRequest('Password is required for local registration');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email address is already registered');
    }

    const hashedPassword = await authUtils.hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: 'local',
      role: 'user',
    });

    const jwtPayload: JwtPayload = {
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    };

    const accessToken = authUtils.generateAccessToken(jwtPayload);
    const refreshToken = authUtils.generateRefreshToken(jwtPayload);

    return {
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  },

  login: async (dto: LoginDto): Promise<{ user: AuthResponse['user']; tokens: AuthTokens }> => {
    const { email, password } = dto;

    if (!password) {
      throw ApiError.badRequest('Password is required');
    }

    let user = await User.findOne({ email }).select('+password');

    // Auto-create demo account on first login
    if (!user && email === env.DEMO_EMAIL && password === env.DEMO_PASSWORD) {
      const hashedPassword = await authUtils.hashPassword(password);
      user = await User.create({
        name: 'Demo User',
        email,
        password: hashedPassword,
        provider: 'local',
        role: 'user',
      });
    }

    if (!user || user.provider !== 'local') {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await authUtils.comparePassword(password, user.password || '');
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const jwtPayload: JwtPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = authUtils.generateAccessToken(jwtPayload);
    const refreshToken = authUtils.generateRefreshToken(jwtPayload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  },

  loginWithGoogle: async (idToken: string): Promise<{ user: AuthResponse['user']; tokens: AuthTokens }> => {
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw ApiError.unauthorized('Invalid or expired Google token');
    }
    if (!payload) throw ApiError.unauthorized('Invalid Google token');

    const { sub, email, name, picture } = payload;
    const googleEmail = email || `${sub}@google-oauth.local`;
    const displayName = name || googleEmail.split('@')[0];

    let user = await User.findOne({ email: googleEmail });

    if (!user) {
      user = await User.create({
        name: displayName,
        email: googleEmail,
        avatar: picture || '',
        provider: 'google',
        role: 'user',
      });
    }

    const jwtPayload: JwtPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = authUtils.generateAccessToken(jwtPayload);
    const refreshToken = authUtils.generateRefreshToken(jwtPayload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      tokens: { accessToken, refreshToken },
    };
  },

  refreshToken: async (token: string): Promise<AuthTokens> => {
    try {
      const decoded = authUtils.verifyRefreshToken(token);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw ApiError.unauthorized('User not found');
      }

      const jwtPayload: JwtPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = authUtils.generateAccessToken(jwtPayload);
      const refreshToken = authUtils.generateRefreshToken(jwtPayload);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  },

  getMe: async (userId: string): Promise<AuthResponse['user']> => {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      learningGoal: user.learningGoal || '',
      currentLevel: user.currentLevel || '',
      learningStyle: user.learningStyle || '',
      preferredLanguage: user.preferredLanguage || '',
      weeklyStudyHours: user.weeklyStudyHours || 0,
    };
  },
};
export default authService;
