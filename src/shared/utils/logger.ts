import winston from 'winston';
import { env } from '@config/env';

// ─── Custom Log Format ────────────────────────────────────────────────────────
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const base = `[${String(timestamp)}] ${level.toUpperCase()}: ${String(message)}`;
    return stack ? `${base}\n${String(stack)}` : base;
  }),
);

// ─── Console Format (colored for development) ─────────────────────────────────
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const base = `[${String(timestamp)}] ${level}: ${String(message)}`;
    return stack ? `${base}\n${String(stack)}` : base;
  }),
);

// ─── Logger Instance ──────────────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'warn' : 'debug',
  transports: [
    // Always log to console
    new winston.transports.Console({
      format: env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    }),

    // In production, also write errors to a file
    ...(env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: logFormat,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: logFormat,
          }),
        ]
      : []),
  ],
});
