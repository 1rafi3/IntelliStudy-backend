import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { env } from '@config/env';
import { JwtPayload } from './auth.types';
import { COOKIE_NAMES } from '@shared/constants';

export const authUtils = {
  hashPassword: async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  comparePassword: async (plain: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(plain, hash);
  },

  generateAccessToken: (payload: JwtPayload): string => {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  },

  generateRefreshToken: (payload: JwtPayload): string => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });
  },

  verifyAccessToken: (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  },

  verifyRefreshToken: (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  },

  setRefreshTokenCookie: (res: Response, token: string): void => {
    const cookieOptions = {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      signed: true,
    };
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, cookieOptions);
  },

  clearAuthCookies: (res: Response): void => {
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      signed: true,
    });
  },
};
