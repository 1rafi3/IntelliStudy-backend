import morgan from 'morgan';
import { logger } from '@shared/utils/logger';
import { env } from '@config/env';

// ─── Request Logger Middleware ────────────────────────────────────────────────
// Uses Morgan to log incoming HTTP requests.
// In development: concise colored output.
// In production: structured JSON-compatible format.

// Route Morgan's stream through Winston
const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export const requestLogger = morgan(
  env.NODE_ENV === 'production'
    ? ':remote-addr :method :url :status :res[content-length] - :response-time ms'
    : ':method :url :status :response-time ms',
  { stream: morganStream },
);
