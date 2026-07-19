import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '@shared/utils/api-error';
import { logger } from '@shared/utils/logger';
import { env } from '@config/env';
import { HTTP_STATUS } from '@shared/constants';
import { ApiResponse } from '@shared/types';

// ─── Global Error Middleware ──────────────────────────────────────────────────
// Must be the LAST middleware registered in app.ts.
// Catches all errors forwarded via next(error) or thrown in asyncHandler.
export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  // ─── Operational API Errors ──────────────────────────────────────────────
  if (err instanceof ApiError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
      ...(err.errors !== undefined && { error: err.errors as Record<string, unknown> }),
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // ─── Zod Validation Errors ───────────────────────────────────────────────
  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      error: err.flatten().fieldErrors as Record<string, unknown>,
    };
    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json(response);
    return;
  }

  // ─── Mongoose Duplicate Key Error ────────────────────────────────────────
  if ((err as NodeJS.ErrnoException).name === 'MongoServerError') {
    const mongoErr = err as NodeJS.ErrnoException & { code?: number };
    if (mongoErr.code === 11000) {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'A resource with this value already exists',
      });
      return;
    }
  }

  // ─── Mongoose Cast Error (invalid ObjectId) ──────────────────────────────
  if (err.name === 'CastError') {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Invalid ID format',
    });
    return;
  }

  // ─── JWT Errors ──────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Token expired',
    });
    return;
  }

  // ─── Unknown / Programming Errors ────────────────────────────────────────
  logger.error('Unhandled error:', err);

  const response: ApiResponse = {
    success: false,
    message: 'An unexpected error occurred',
    ...(env.NODE_ENV === 'development' && { error: err.message }),
  };

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
};

// ─── 404 Not Found Handler ────────────────────────────────────────────────────
// Register this BEFORE errorMiddleware but AFTER all routes.
export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};
