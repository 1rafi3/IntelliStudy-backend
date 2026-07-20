import { Schema, model } from 'mongoose';
import { IUser } from './auth.types';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be under 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.provider === 'local';
      },
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    learningGoal: {
      type: String,
      trim: true,
      default: '',
    },
    currentLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', ''],
      default: '',
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'reading', 'kinesthetic', ''],
      default: '',
    },
    preferredLanguage: {
      type: String,
      trim: true,
      default: '',
    },
    weeklyStudyHours: {
      type: Number,
      min: 0,
      max: 168,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', userSchema);
export default User;
