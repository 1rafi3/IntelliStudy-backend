import { Schema, model, Document, Types } from 'mongoose';

// ─── Individual Message Schema ────────────────────────────────────────────────
export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // No separate ObjectId for messages in the array to keep subdocs small
);

// ─── Chat Session Document Interface ──────────────────────────────────────────
export interface IChatSession extends Document {
  user: Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Chat Session Schema ──────────────────────────────────────────────────────
const chatSessionSchema = new Schema<IChatSession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Session owner user ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Auto-manages createdAt and updatedAt
  }
);

// Add index to query sessions of a user quickly
chatSessionSchema.index({ user: 1, updatedAt: -1 });

export const ChatSession = model<IChatSession>('ChatSession', chatSessionSchema);
export default ChatSession;
