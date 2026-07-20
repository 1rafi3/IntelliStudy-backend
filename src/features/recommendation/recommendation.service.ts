import { geminiClient, DEFAULT_MODEL } from '@config/gemini';
import { Recommendation } from './recommendation.model';
import { Roadmap } from '@features/roadmaps/roadmaps.model';
import { AIHistory } from '@features/ai/ai-history.model';
import { ChatSession } from '@features/chat/chat.model';
import { ApiError } from '@shared/utils/api-error';
import { logger } from '@shared/utils/logger';
import { recommendationUtils } from './recommendation.utils';
import mongoose from 'mongoose';

export const recommendationService = {
  /**
   * Get all unread recommendations for the user.
   * If they are empty or older than 24 hours, automatically triggers a regeneration.
   */
  getAll: async (userId: string): Promise<any[]> => {
    let recommendations = await Recommendation.find({ user: userId, read: false })
      .populate('relatedRoadmap', 'title subject progress status')
      .sort({ createdAt: -1 });

    let shouldRegenerate = false;
    if (recommendations.length === 0) {
      shouldRegenerate = true;
    } else {
      const oldest = recommendations[recommendations.length - 1];
      const ageInMs = Date.now() - new Date(oldest.createdAt).getTime();
      if (ageInMs > 24 * 60 * 60 * 1000) {
        shouldRegenerate = true;
      }
    }

    if (shouldRegenerate) {
      try {
        logger.info(`Auto-regenerating recommendations for user ${userId} (reason: stale/empty)`);
        await recommendationService.generate(userId);
        recommendations = await Recommendation.find({ user: userId, read: false })
          .populate('relatedRoadmap', 'title subject progress status')
          .sort({ createdAt: -1 });
      } catch (error) {
        logger.error('Failed to auto-regenerate recommendations:', error);
      }
    }

    return recommendations.map(recommendationUtils.serialize);
  },

  /**
   * Generate new recommendations based on user profile and cache them in MongoDB.
   */
  generate: async (userId: string): Promise<any[]> => {
    // 1. Gather user profile data
    const activeRoadmaps = await Roadmap.find({ createdBy: userId, archived: false });
    const recentAIHistory = await AIHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(3);
    const recentChats = await ChatSession.find({ user: userId }).sort({ updatedAt: -1 }).limit(3);

    // Keep payload concise to minimize tokens
    const roadmapsSummary = activeRoadmaps.map((r, idx) => ({
      index: idx,
      title: r.title,
      subject: r.subject,
      progress: r.progress,
      status: r.status,
      difficulty: r.difficulty,
    }));

    const aiHistorySummary = recentAIHistory.map((h) => ({
      learningGoal: h.prompt.learningGoal,
      currentLevel: h.prompt.currentLevel,
    }));

    const chatsSummary = recentChats.map((c) => c.title);

    // 2. Query Gemini
    try {
      const model = geminiClient.getGenerativeModel({
        model: DEFAULT_MODEL,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const prompt = `
You are an expert learning advisor. Analyze the following user learning profile:
Active Roadmaps: ${JSON.stringify(roadmapsSummary)}
AI Roadmap Request History: ${JSON.stringify(aiHistorySummary)}
Recent Chat Topics: ${JSON.stringify(chatsSummary)}

Generate exactly 3 to 5 highly personalized recommendations to help this user succeed. 
Provide a mix of categories:
- 'next-study-step' (actions to progress on active roadmaps)
- 'suggested-resource' (specific books, courses, or guides they should consult next)
- 'practice-project' (concrete mini-projects to build)
- 'skill-gap' (topics they need to learn given their goals)
- 'revision-reminder' (specific concepts they should review)

You MUST respond ONLY with a JSON array matching the following schema:
[
  {
    "title": "string",
    "description": "string",
    "reason": "string (explaining why this is recommended based on their active roadmaps or recent chats)",
    "category": "next-study-step" | "suggested-resource" | "practice-project" | "skill-gap" | "revision-reminder",
    "priority": "low" | "medium" | "high",
    "relatedRoadmapIndex": number (optional, the index of the roadmap from the input array if applicable, otherwise omit or set null)
  }
]
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const generatedList = JSON.parse(responseText);

      if (!Array.isArray(generatedList)) {
        throw new Error('Gemini did not return an array');
      }

      // 3. Clear existing unread recommendations to keep it fresh
      await Recommendation.deleteMany({ user: userId, read: false });

      // 4. Save new recommendations to MongoDB
      const docsToInsert = generatedList.map((item: any) => {
        let roadmapId: string | undefined = undefined;
        if (
          typeof item.relatedRoadmapIndex === 'number' &&
          item.relatedRoadmapIndex >= 0 &&
          item.relatedRoadmapIndex < activeRoadmaps.length
        ) {
          roadmapId = activeRoadmaps[item.relatedRoadmapIndex].id;
        }

        return {
          user: new mongoose.Types.ObjectId(userId),
          title: item.title,
          description: item.description,
          reason: item.reason,
          category: item.category,
          priority: item.priority || 'medium',
          relatedRoadmap: roadmapId ? new mongoose.Types.ObjectId(roadmapId) : undefined,
          read: false,
        };
      });

      if (docsToInsert.length > 0) {
        await Recommendation.insertMany(docsToInsert);
      }

      const freshDocs = await Recommendation.find({ user: userId, read: false })
        .populate('relatedRoadmap', 'title subject progress status')
        .sort({ createdAt: -1 });

      return freshDocs.map(recommendationUtils.serialize);
    } catch (error: any) {
      logger.error('Gemini Recommendation generation failed:', error);
      throw ApiError.internal(`AI Recommendation Engine Error: ${error.message || 'Unknown error'}`);
    }
  },

  /**
   * Mark a recommendation as read.
   */
  markAsRead: async (id: string, userId: string): Promise<any> => {
    const updated = await Recommendation.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    ).populate('relatedRoadmap', 'title subject progress status');
    
    if (!updated) {
      throw ApiError.notFound('Recommendation not found or not owned by user');
    }
    return recommendationUtils.serialize(updated);
  },

  /**
   * Get a single recommendation by ID regardless of read status.
   */
  getById: async (id: string, userId: string): Promise<any> => {
    const doc = await Recommendation.findOne({ _id: id, user: userId })
      .populate('relatedRoadmap', 'title subject progress status');
    if (!doc) {
      throw ApiError.notFound('Recommendation not found');
    }
    return recommendationUtils.serialize(doc);
  },

  /**
   * Delete a recommendation.
   */
  dismiss: async (id: string, userId: string): Promise<void> => {
    const deleted = await Recommendation.findOneAndDelete({ _id: id, user: userId });
    if (!deleted) {
      throw ApiError.notFound('Recommendation not found or not owned by user');
    }
  },
};
