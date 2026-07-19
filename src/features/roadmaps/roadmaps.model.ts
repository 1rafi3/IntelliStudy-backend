import mongoose, { Schema, Document, Model } from 'mongoose';
import { RoadmapStatus, RoadmapDifficulty } from './roadmaps.types';

// ─── Roadmap Document Interface ───────────────────────────────────────────────
export interface IRoadmap extends Document {
  title: string;
  subject: string;
  description?: string;
  goal?: string;
  difficulty: RoadmapDifficulty;
  estimatedDuration?: number;
  progress: number;
  status: RoadmapStatus;
  tags: string[];
  archived: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Roadmap Schema ───────────────────────────────────────────────────────────
const roadmapSchema = new Schema<IRoadmap>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title must be under 120 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [2, 'Subject must be at least 2 characters'],
      maxlength: [80, 'Subject must be under 80 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must be under 1000 characters'],
    },
    goal: {
      type: String,
      trim: true,
      maxlength: [500, 'Goal must be under 500 characters'],
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Difficulty is required'],
    },
    estimatedDuration: {
      type: Number,
      min: [1, 'Duration must be at least 1 week'],
      max: [104, 'Duration cannot exceed 104 weeks'],
    },
    progress: {
      type: Number,
      min: [0, 'Progress cannot be below 0'],
      max: [100, 'Progress cannot exceed 100'],
      default: 0,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'paused'],
      default: 'not-started',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 10,
        message: 'Maximum 10 tags allowed',
      },
    },
    archived: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner reference is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Compound index for fast user-scoped listing with sort
roadmapSchema.index({ createdBy: 1, updatedAt: -1 });
// Text index for search across title and subject
roadmapSchema.index({ title: 'text', subject: 'text', description: 'text' });
// Compound for filtered queries
roadmapSchema.index({ createdBy: 1, status: 1, archived: 1 });

// ─── Model Export ─────────────────────────────────────────────────────────────
export const Roadmap: Model<IRoadmap> = mongoose.model<IRoadmap>('Roadmap', roadmapSchema);
