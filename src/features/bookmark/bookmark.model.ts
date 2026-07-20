import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  type: 'ai-roadmap' | 'manual-roadmap' | 'chat-response' | 'recommendation';
  referencedId: string;
  title: string;
  description?: string;
  preview?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['ai-roadmap', 'manual-roadmap', 'chat-response', 'recommendation'],
      required: [true, 'Bookmark type is required'],
    },
    referencedId: {
      type: String,
      required: [true, 'Referenced item ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Bookmark title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    preview: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bookmarks for the same user and referenced item
bookmarkSchema.index({ user: 1, type: 1, referencedId: 1 }, { unique: true });

// Index for pagination and sorting
bookmarkSchema.index({ user: 1, type: 1, createdAt: -1 });
bookmarkSchema.index({ user: 1, createdAt: -1 });

// Text index for search functionality
bookmarkSchema.index({ title: 'text', description: 'text', preview: 'text' });

export const Bookmark: Model<IBookmark> = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
