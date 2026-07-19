import mongoose from 'mongoose';
import { geminiClient, DEFAULT_MODEL } from '@config/gemini';
import { logger } from '@shared/utils/logger';
import { ApiError } from '@shared/utils/api-error';
import { ChatSession, IMessage } from './chat.model';

export const chatService = {
  // ── Send Message & Get Gemini Response (With Context) ───────────────────────
  sendMessage: async (
    userId: string,
    messageContent: string,
    sessionId?: string
  ): Promise<{ session: any; reply: string }> => {
    try {
      let session: any;

      // 1. Resolve or Create the Chat Session
      if (sessionId) {
        session = await ChatSession.findOne({
          _id: sessionId,
          user: new mongoose.Types.ObjectId(userId),
        });
        if (!session) {
          throw ApiError.notFound('Conversation session not found');
        }
      } else {
        // Create session with temporary title (will update based on user's first message)
        const truncatedTitle = messageContent.substring(0, 45) + (messageContent.length > 45 ? '...' : '');
        session = await ChatSession.create({
          user: new mongoose.Types.ObjectId(userId),
          title: truncatedTitle,
          messages: [],
        });
      }

      // 2. Prepare Conversation History for Gemini (excluding the new message)
      const chatHistory = session.messages.map((msg: IMessage) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // 3. Initialize Gemini Chat Session with Context
      const model = geminiClient.getGenerativeModel({
        model: DEFAULT_MODEL,
        systemInstruction:
          "You are IntelliStudy's Premium AI Study Coach. Your purpose is to guide users on academic topics, coding/programming, study roadmaps, conceptual definitions, and general career advice. Keep your tone encouraging, professional, and clear. Format your output using neat Markdown with code blocks if explaining programming topics.",
      });

      const chat = model.startChat({
        history: chatHistory,
      });

      // 4. Send user's new message to Gemini
      logger.info(`Sending message to Gemini model (${DEFAULT_MODEL}) for session: ${session._id}`);
      const result = await chat.sendMessage(messageContent);
      const response = await result.response;
      
      // Safety block check
      if (response.promptFeedback?.blockReason) {
        throw ApiError.badRequest(`Message blocked by safety filters: ${response.promptFeedback.blockReason}`);
      }

      const replyContent = response.text();
      if (!replyContent) {
        throw ApiError.internal('Received empty response from study coach');
      }

      // 5. Append User and Gemini Messages to Session
      session.messages.push({
        role: 'user',
        content: messageContent,
        createdAt: new Date(),
      });
      session.messages.push({
        role: 'assistant',
        content: replyContent,
        createdAt: new Date(),
      });

      // Save changes to database
      await session.save();

      return {
        session: {
          id: session._id.toString(),
          title: session.title,
          messages: session.messages,
          updatedAt: session.updatedAt.toISOString(),
        },
        reply: replyContent,
      };
    } catch (error: any) {
      logger.error('Chat Coach message failed:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      const message: string = error.message || '';

      if (message.includes('API key not valid') || message.includes('API_KEY_INVALID')) {
        // 500 — misconfiguration on server side, not a user auth issue
        throw ApiError.internal('AI service is misconfigured. Please contact support.');
      }
      if (
        message.includes('quota') ||
        message.includes('Quota exceeded') ||
        message.includes('RESOURCE_EXHAUSTED') ||
        message.includes('429')
      ) {
        throw ApiError.forbidden('Gemini API quota exceeded. Please try again later.');
      }

      throw ApiError.internal(`AI Coach Error: ${message || 'Unknown error from AI service'}`);
    }
  },

  // ── Get Single Session Message History ──────────────────────────────────────
  getHistory: async (userId: string, sessionId: string): Promise<IMessage[]> => {
    const session = await ChatSession.findOne({
      _id: sessionId,
      user: new mongoose.Types.ObjectId(userId),
    });

    if (!session) {
      throw ApiError.notFound('Conversation session not found');
    }

    return session.messages;
  },

  // ── List All User Chat Sessions (Sidebar) ────────────────────────────────────
  getSessions: async (userId: string): Promise<any[]> => {
    const sessions = await ChatSession.find({
      user: new mongoose.Types.ObjectId(userId),
    })
      .select('title updatedAt messages')
      .sort({ updatedAt: -1 });

    return sessions.map((s) => ({
      id: s._id.toString(),
      title: s.title,
      updatedAt: s.updatedAt.toISOString(),
      messageCount: s.messages.length,
    }));
  },

  // ── Rename Chat Session Title ───────────────────────────────────────────────
  renameSession: async (userId: string, sessionId: string, title: string): Promise<any> => {
    const session = await ChatSession.findOneAndUpdate(
      {
        _id: sessionId,
        user: new mongoose.Types.ObjectId(userId),
      },
      { title },
      { new: true }
    );

    if (!session) {
      throw ApiError.notFound('Conversation session not found');
    }

    return {
      id: session._id.toString(),
      title: session.title,
      updatedAt: session.updatedAt.toISOString(),
    };
  },

  // ── Delete Chat Session ─────────────────────────────────────────────────────
  deleteSession: async (userId: string, sessionId: string): Promise<void> => {
    const result = await ChatSession.deleteOne({
      _id: sessionId,
      user: new mongoose.Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw ApiError.notFound('Conversation session not found');
    }
  },
};
export default chatService;
