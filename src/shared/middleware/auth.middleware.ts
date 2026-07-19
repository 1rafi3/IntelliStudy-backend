import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@shared/types';
import { ApiError } from '@shared/utils/api-error';
import { authUtils } from '@features/auth/auth.utils';

// ─── Authentication Middleware ────────────────────────────────────────────────
// Extracts access token from Authorization header (Bearer <token>)
// and verifies JWT validity, attaching payload to req.user.
export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('No authorization token provided'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(ApiError.unauthorized('Invalid authorization token format'));
  }

  try {
    const decoded = authUtils.verifyAccessToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return next(ApiError.unauthorized('Authorization token is invalid or expired'));
  }
};

// ─── Role Middleware ──────────────────────────────────────────────────────────
// Restricts route access to specific roles. Use after authenticate middleware.
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to access this resource'));
    }

    next();
  };
};
export default authenticate;
