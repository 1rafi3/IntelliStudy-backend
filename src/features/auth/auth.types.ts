import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar: string;
  provider: 'local' | 'google';
  role: 'user' | 'admin';
  learningGoal?: string;
  currentLevel?: 'beginner' | 'intermediate' | 'advanced';
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  preferredLanguage?: string;
  weeklyStudyHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  provider: string;
  learningGoal?: string;
  currentLevel?: string;
  learningStyle?: string;
  preferredLanguage?: string;
  weeklyStudyHours?: number;
  createdAt: string;
  updatedAt: string;
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
    learningGoal?: string;
    currentLevel?: string;
    learningStyle?: string;
    preferredLanguage?: string;
    weeklyStudyHours?: number;
  };
  accessToken: string;
}
