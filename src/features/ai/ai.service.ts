import mongoose from 'mongoose';
import { geminiClient, DEFAULT_MODEL } from '@config/gemini';
import { logger } from '@shared/utils/logger';
import { ApiError } from '@shared/utils/api-error';
import { AIHistory } from './ai-history.model';
import { Roadmap } from '@features/roadmaps/roadmaps.model';
import { STUDY_PROMPTS } from './prompts/study-prompts';
import { GenerateRoadmapDto, SaveRoadmapDto, AIHistoryResponse } from './ai.types';

// Helper to serialize an AIHistory document to clean API response
const serializeHistory = (doc: any): AIHistoryResponse => ({
  id: doc._id.toString(),
  prompt: {
    learningGoal: doc.prompt.learningGoal,
    currentLevel: doc.prompt.currentLevel,
    duration: doc.prompt.duration,
    weeklyHours: doc.prompt.weeklyHours,
    learningStyle: doc.prompt.learningStyle,
    language: doc.prompt.language,
  },
  generatedRoadmap: doc.generatedRoadmap,
  createdAt: doc.createdAt.toISOString(),
});

export const aiService = {
  // ── Generate AI Roadmap with Google Gemini ──────────────────────────────────
  generateRoadmap: async (userId: string, dto: GenerateRoadmapDto): Promise<Record<string, any>> => {
    try {
      const systemPrompt = STUDY_PROMPTS.ROADMAP_GENERATOR_SYSTEM;
      const userPrompt = STUDY_PROMPTS.ROADMAP_GENERATOR_USER(dto);

      logger.info(`Sending roadmap generation prompt to Google Gemini for user: ${userId}`);

      // Get the generative model
      const model = geminiClient.getGenerativeModel({
        model: DEFAULT_MODEL,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      // Execute request to Gemini
      const promptText = `${systemPrompt}\n\nUser Input:\n${userPrompt}`;
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
      });

      const response = await result.response;
      
      // Safety block check
      if (response.promptFeedback?.blockReason) {
        throw ApiError.badRequest(`Generation blocked by Gemini safety filters: ${response.promptFeedback.blockReason}`);
      }

      const rawContent = response.text() || '';
      if (!rawContent || rawContent.trim() === '') {
        throw ApiError.internal('Received empty response from Gemini API');
      }

      let parsedRoadmap: Record<string, any>;
      try {
        parsedRoadmap = JSON.parse(rawContent);
      } catch (err) {
        logger.error('Failed to parse Gemini response as JSON:', rawContent);
        throw ApiError.internal('AI model generated malformed output. Please try again.');
      }

      // Validate required high-level JSON structure keys (compatibility with frontend)
      const requiredKeys = ['title', 'goal', 'difficulty', 'estimatedDuration', 'weeklyHours', 'phases'];
      const missingKeys = requiredKeys.filter((key) => !(key in parsedRoadmap));
      
      if (missingKeys.length > 0) {
        logger.warn(`Gemini output missing required keys: ${missingKeys.join(', ')}`);
        // Fill defaults if some minor fields are missing instead of failing immediately
        if (!parsedRoadmap.title) parsedRoadmap.title = dto.learningGoal;
        if (!parsedRoadmap.goal) parsedRoadmap.goal = dto.learningGoal;
        if (!parsedRoadmap.difficulty) parsedRoadmap.difficulty = dto.currentLevel;
        if (!parsedRoadmap.estimatedDuration) parsedRoadmap.estimatedDuration = `${dto.duration} weeks`;
        if (!parsedRoadmap.weeklyHours) parsedRoadmap.weeklyHours = `${dto.weeklyHours} hours/week`;
        if (!parsedRoadmap.phases) parsedRoadmap.phases = [];
      }

      // Log generation run into DB history
      await AIHistory.create({
        user: new mongoose.Types.ObjectId(userId),
        prompt: dto,
        generatedRoadmap: parsedRoadmap,
      });

      return parsedRoadmap;
    } catch (error: any) {
      logger.error('AI Study Roadmap Generation failed:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }

      const message = error.message || '';
      
      // Map Gemini specific exceptions to clean API Errors
      if (message.includes('API key not valid') || message.includes('API_KEY_INVALID')) {
        throw ApiError.unauthorized('Invalid Google Gemini API Key configured');
      }
      if (message.includes('quota') || message.includes('Quota exceeded') || message.includes('RESOURCE_EXHAUSTED')) {
        throw ApiError.forbidden('Google Gemini API quota exceeded or exhausted. Please try again later.');
      }
      if (message.includes('safety') || message.includes('blocked')) {
        throw ApiError.badRequest('The prompt or generation violated Gemini safety policies.');
      }
      if (message.includes('fetch') || message.includes('network') || error.code === 'ENOTFOUND') {
        throw ApiError.internal('Network timeout connecting to Gemini API server.');
      }

      throw ApiError.internal(`Gemini generation error: ${message || 'Unknown network error'}`);
    }
  },

  // ── List User Generation History ─────────────────────────────────────────
  listHistory: async (userId: string): Promise<AIHistoryResponse[]> => {
    const docs = await AIHistory.find({
      user: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });

    return docs.map(serializeHistory);
  },

  // ── Delete History Record ────────────────────────────────────────────────
  deleteHistory: async (id: string, userId: string): Promise<void> => {
    const doc = await AIHistory.findOneAndDelete({
      _id: id,
      user: new mongoose.Types.ObjectId(userId),
    });

    if (!doc) {
      throw ApiError.notFound('History record not found');
    }
  },

  // ── Save Generated Roadmap to active lists ────────────────────────────────
  saveRoadmap: async (userId: string, dto: SaveRoadmapDto): Promise<Record<string, any>> => {
    const roadmap = await Roadmap.create({
      title: dto.title,
      subject: dto.subject,
      description: dto.description || '',
      goal: dto.goal || '',
      difficulty: dto.difficulty,
      estimatedDuration: dto.estimatedDuration || 1,
      tags: dto.tags || [],
      createdBy: new mongoose.Types.ObjectId(userId),
      progress: 0,
      status: 'not-started',
      archived: false,
    });

    return {
      id: roadmap._id.toString(),
      title: roadmap.title,
      subject: roadmap.subject,
      difficulty: roadmap.difficulty,
      progress: roadmap.progress,
      status: roadmap.status,
    };
  },
};
export default aiService;
