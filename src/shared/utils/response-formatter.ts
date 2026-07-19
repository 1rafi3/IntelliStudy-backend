import { Response } from 'express';
import { ApiResponse } from '@shared/types';
import { HTTP_STATUS } from '@shared/constants';

// ─── Response Formatter ───────────────────────────────────────────────────────
// Centralizes all API response formatting.
// Every controller must use these helpers — never call res.json() directly.

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode: number = HTTP_STATUS.OK,
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Resource created successfully',
): Response => {
  return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
};

export const sendNoContent = (res: Response): Response => {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  error?: string | Record<string, unknown>,
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(error !== undefined && { error }),
  };
  return res.status(statusCode).json(response);
};

export const sendNotFound = (res: Response, message = 'Resource not found'): Response => {
  return sendError(res, message, HTTP_STATUS.NOT_FOUND);
};

export const sendUnauthorized = (res: Response, message = 'Authentication required'): Response => {
  return sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
};

export const sendForbidden = (
  res: Response,
  message = 'You do not have permission to perform this action',
): Response => {
  return sendError(res, message, HTTP_STATUS.FORBIDDEN);
};

export const sendBadRequest = (
  res: Response,
  message = 'Invalid request',
  error?: string | Record<string, unknown>,
): Response => {
  return sendError(res, message, HTTP_STATUS.BAD_REQUEST, error);
};
