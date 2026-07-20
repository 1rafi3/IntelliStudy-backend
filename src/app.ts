import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

import { env, allowedOrigins } from '@config/env';
import { requestLogger } from '@shared/middleware/request-logger.middleware';
import { globalRateLimiter } from '@shared/middleware/rate-limiter.middleware';
import { errorMiddleware, notFoundMiddleware } from '@shared/middleware/error.middleware';

import { authRouter } from '@features/auth/auth.route';
import { roadmapsRouter } from '@features/roadmaps/roadmaps.route';
import { chatRouter } from '@features/chat/chat.route';
import { recommendationRouter } from '@features/recommendation/recommendation.route';
import { dashboardRouter } from '@features/dashboard/dashboard.route';
import { plannerRouter } from '@features/planner/planner.route';
import { bookmarkRouter } from '@features/bookmark/bookmark.route';
import { profileRouter } from '@features/profile/profile.route';
import { analyticsRouter } from '@features/analytics/analytics.route';
import { reviewRouter } from '@features/review/review.route';
import { aiRouter } from '@features/ai/ai.route';

// ─── Application Factory ──────────────────────────────────────────────────────
export const createApp = (): Application => {
  const app = express();

  // ── Security Headers ────────────────────────────────────────────────────────
  app.use(helmet());

  // ── CORS ────────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked: origin ${origin} is not allowed`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
  );

  // ── Body Parsing ────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── Cookie Parsing ──────────────────────────────────────────────────────────
  app.use(cookieParser(env.COOKIE_SECRET));

  // ── Compression ─────────────────────────────────────────────────────────────
  app.use(compression());

  // ── NoSQL Injection Protection ──────────────────────────────────────────────
  app.use(mongoSanitize());

  // ── HTTP Parameter Pollution Prevention ─────────────────────────────────────
  app.use(hpp());

  // ── Request Logging ─────────────────────────────────────────────────────────
  app.use(requestLogger);

  // ── Global Rate Limiting ────────────────────────────────────────────────────
  app.use(globalRateLimiter);

  // ── Health Check ────────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'IntelliStudy AI API is running',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // ── API Routes ───────────────────────────────────────────────────────────────
  const apiPrefix = `/api/${env.API_VERSION}`;

  app.use(`${apiPrefix}/auth`, authRouter);
  app.use(`${apiPrefix}/roadmaps`, roadmapsRouter);
  app.use(`${apiPrefix}/chat`, chatRouter);
  app.use(`${apiPrefix}/recommendations`, recommendationRouter);
  app.use(`${apiPrefix}/dashboard`, dashboardRouter);
  app.use(`${apiPrefix}/planner`, plannerRouter);
  app.use(`${apiPrefix}/bookmarks`, bookmarkRouter);
  app.use(`${apiPrefix}/reviews`, reviewRouter);
  app.use(`${apiPrefix}/ai`, aiRouter);
  app.use(`${apiPrefix}/profile`, profileRouter);
  app.use(`${apiPrefix}/analytics`, analyticsRouter);

  // ── 404 Handler ─────────────────────────────────────────────────────────────
  app.use(notFoundMiddleware);

  // ── Global Error Handler ─────────────────────────────────────────────────────
  app.use(errorMiddleware);

  return app;
};
