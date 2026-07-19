import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── AI History Document Interface ───────────────────────────────────────────
export interface IAIHistory extends Document {
  user: mongoose.Types.ObjectId;
  prompt: {
    learningGoal: string;
    currentLevel: string;
    duration: number;
    weeklyHours: number;
    learningStyle: string;
    language: string;
  };
  generatedRoadmap: Record<string, any>;
  createdAt: Date;
}

// ─── AI History Schema ────────────────────────────────────────────────────────
const aiHistorySchema = new Schema<IAIHistory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    prompt: {
      learningGoal: { type: String, required: true, trim: true },
      currentLevel: { type: String, required: true },
      duration: { type: Number, required: true },
      weeklyHours: { type: Number, required: true },
      learningStyle: { type: String, required: true },
      language: { type: String, required: true },
    },
    generatedRoadmap: {
      type: Schema.Types.Mixed,
      required: [true, 'Generated roadmap payload is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Index for fetching a user's prompt generation history sorted by date
aiHistorySchema.index({ user: 1, createdAt: -1 });

export const AIHistory: Model<IAIHistory> = mongoose.model<IAIHistory>('AIHistory', aiHistorySchema);
