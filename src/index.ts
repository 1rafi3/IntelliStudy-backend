import 'dotenv/config';
import { createApp } from './app';
import { connectDB } from '@config/db';
import { verifyCloudinary } from '@config/cloudinary';
import { verifyGemini } from '@config/gemini';
import { env } from '@config/env';
import { logger } from '@shared/utils/logger';

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const bootstrap = async (): Promise<void> => {
  // 1. Connect to MongoDB (fatal — server won't start if this fails)
  await connectDB();

  // 2. Verify third-party services (non-fatal)
  await verifyCloudinary();
  await verifyGemini();

  // 3. Create and start Express app
  const app = createApp();
  const port = parseInt(env.PORT, 10);

  const server = app.listen(port, () => {
    logger.info(`🚀 IntelliStudy AI API running on port ${port}`);
    logger.info(`📍 Environment: ${env.NODE_ENV}`);
    logger.info(`🔗 Health: http://localhost:${port}/health`);
    logger.info(`🔗 API Base: http://localhost:${port}/api/${env.API_VERSION}`);
  });

  // ─── Graceful Shutdown ──────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`\n${signal} received — shutting down gracefully`);
    server.close(async () => {
      const { disconnectDB } = await import('@config/db');
      await disconnectDB();
      logger.info('✅ Server shut down cleanly');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  // ─── Unhandled Errors ───────────────────────────────────────────────────────
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Promise Rejection:', reason);
    void shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    void shutdown('uncaughtException');
  });
};

void bootstrap();
