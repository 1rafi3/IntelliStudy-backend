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

// ─── MongoDB Connection ───────────────────────────────────────────────────────
// Establishes a single connection to MongoDB Atlas.
// Called once at server startup in src/index.ts.
export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// ─── Disconnect (for graceful shutdown / tests) ───────────────────────────────
export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('🔌 MongoDB disconnected');
};

// ─── Connection Event Listeners ───────────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  MongoDB disconnected — attempting reconnect...');
});

mongoose.connection.on('error', (err) => {
  logger.error('❌ MongoDB error:', err);
});
