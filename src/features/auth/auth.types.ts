import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar: string;
  provider: 'local' | 'google';
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterDto {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  provider?: 'local' | 'google';
}

export interface LoginDto {
  email: string;
  password?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
  };
  accessToken: string;
}
