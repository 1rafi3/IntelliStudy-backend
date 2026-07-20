import 'dotenv/config';
import { createApp } from './app';
import { connectDB, disconnectDB } from '@config/db';
import { verifyGemini } from '@config/gemini';
import { env } from '@config/env';
import { logger } from '@shared/utils/logger';

// ─── Create Express App ────────────────────────────────────────────────────────
const app = createApp();

// Export for Vercel serverless (default export = Express app handled by @vercel/node)
export default app;

// ─── Bootstrap (local / non‑Vercel only) ──────────────────────────────────────
const isVercel = !!process.env.VERCEL;

if (!isVercel) {
  const bootstrap = async (): Promise<void> => {
    // 1. Connect to MongoDB (fatal — server won't start if this fails)
    await connectDB();

    // 2. Verify third-party services (non-fatal)
    await verifyGemini();

    // 3. Start Express app
    const port = parseInt(env.PORT, 10);

    const server = app.listen(port, () => {
      logger.info(`🚀 IntelliStudy AI API running on port ${port}`);
      logger.info(`📍 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Health: http://localhost:${port}/health`);
      logger.info(`🔗 API Base: http://localhost:${port}/api/${env.API_VERSION}`);
    });

    // ─── Graceful Shutdown ────────────────────────────────────────────────────
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`\n${signal} received — shutting down gracefully`);
      server.close(async () => {
        await disconnectDB();
        logger.info('✅ Server shut down cleanly');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));

    // ─── Unhandled Errors ─────────────────────────────────────────────────────
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
} else {
  // Vercel: fire‑and‑forget DB connect on cold start
  connectDB().catch((err) => logger.error('MongoDB init failed:', err));
}
