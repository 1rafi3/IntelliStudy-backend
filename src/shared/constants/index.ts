// ─── Shared Constants ─────────────────────────────────────────────────────────

// ─── HTTP Status Codes ────────────────────────────────────────────────────────
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ─── API Messages ─────────────────────────────────────────────────────────────
export const API_MESSAGES = {
  SUCCESS: 'Operation successful',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to perform this action',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'An unexpected error occurred',
  RATE_LIMIT: 'Too many requests — please try again later',
} as const;

// ─── User Roles ───────────────────────────────────────────────────────────────
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ─── Token Types ──────────────────────────────────────────────────────────────
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;

// ─── Cookie Names ─────────────────────────────────────────────────────────────
export const COOKIE_NAMES = {
  REFRESH_TOKEN: 'intellistudy_refresh_token',
  ACCESS_TOKEN: 'intellistudy_access_token',
} as const;

// ─── Pagination Defaults ──────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// ─── File Upload ──────────────────────────────────────────────────────────────
export const UPLOAD = {
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
