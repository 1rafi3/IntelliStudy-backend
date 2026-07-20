import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '@shared/utils/logger';

// ─── DNS Workaround ──────────────────────────────────────────────────────────
// Node.js v24's c-ares DNS resolver on Windows can fail to read the system's
// configured DNS servers from the registry, falling back to 127.0.0.1.
// This causes all dns.resolve* calls (including MongoDB SRV lookups) to fail
// with ECONNREFUSED. Explicitly setting DNS servers before connecting fixes it.
dns.setServers(['1.1.1.1', '8.8.8.8', '8.8.4.4']);

// ─── Connection Cache ─────────────────────────────────────────────────────────
// Reuse the same connection across serverless warm invocations.
let cachedConnection: typeof mongoose | null = null;

// ─── MongoDB Connection ───────────────────────────────────────────────────────
// Establishes a mongoose connection to MongoDB Atlas.
// Uses a cached connection for serverless environments (Vercel).
export const connectDB = async (): Promise<void> => {
  if (cachedConnection && mongoose.connection.readyState === 1) return;

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = conn;
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    // In serverless, don't crash — let the request fail gracefully
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

// ─── Disconnect (for graceful shutdown / tests) ───────────────────────────────
export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  cachedConnection = null;
  logger.info('🔌 MongoDB disconnected');
};

// ─── Connection Event Listeners ───────────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
  cachedConnection = null;
  logger.warn('⚠️  MongoDB disconnected — attempting reconnect...');
});

mongoose.connection.on('error', (err) => {
  logger.error('❌ MongoDB error:', err);
});
