import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env';
import { logger } from '@shared/utils/logger';

// Initialize the Google Gemini client with the API key
export const geminiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Define default model from environment
export const DEFAULT_MODEL = env.GEMINI_MODEL;

// Helper to verify connectivity with Gemini API on startup
export const verifyGemini = async (): Promise<void> => {
  try {
    // Generate a simple response to verify the API key is active
    const model = geminiClient.getGenerativeModel({ model: DEFAULT_MODEL });
    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'ping' }] }] });
    const response = await result.response;
    const text = response.text();
    if (text) {
      logger.info(`✅ Gemini connected — model: ${DEFAULT_MODEL}`);
    } else {
      throw new Error('Received empty text response from Gemini');
    }
  } catch (error: any) {
    logger.error('❌ Gemini connection failed:', error.message || error);
    // Non-fatal warning at startup to support graceful degradation
  }
};
export default geminiClient;
