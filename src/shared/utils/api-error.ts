// ─── ApiError ─────────────────────────────────────────────────────────────────
// Custom error class for all application errors.
// Throw this from any service or controller layer.
// The global error middleware catches it and formats the response correctly.
//
// Usage:
//   throw new ApiError(404, 'User not found');
//   throw new ApiError(400, 'Validation failed', validationErrors);

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: unknown;

  constructor(
    statusCode: number,
    message: string,
    errors?: unknown,
    isOperational = true,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  // ─── Factory Methods ────────────────────────────────────────────────────────
  static badRequest(message: string, errors?: unknown): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Access denied'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static tooManyRequests(message = 'Too many requests'): ApiError {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, undefined, false);
  }
}
