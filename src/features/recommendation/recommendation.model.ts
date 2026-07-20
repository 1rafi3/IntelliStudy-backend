import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecommendation extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  reason: string;
  category: 'next-study-step' | 'suggested-resource' | 'practice-project' | 'skill-gap' | 'revision-reminder';
  priority: 'low' | 'medium' | 'high';
  relatedRoadmap?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const recommendationSchema = new Schema<IRecommendation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Recommendation title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Recommendation description is required'],
      trim: true,
    },
    reason: {
      type: String,
      required: [true, 'Recommendation reason is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['next-study-step', 'suggested-resource', 'practice-project', 'skill-gap', 'revision-reminder'],
      required: [true, 'Recommendation category is required'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: [true, 'Recommendation priority is required'],
    },
    relatedRoadmap: {
      type: Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index to list unread recommendations quickly
recommendationSchema.index({ user: 1, read: 1, createdAt: -1 });

export const Recommendation: Model<IRecommendation> = mongoose.model<IRecommendation>(
  'Recommendation',
  recommendationSchema
);
