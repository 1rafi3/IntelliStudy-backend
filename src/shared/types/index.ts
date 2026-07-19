import { Request, Response, NextFunction } from 'express';

// ─── ApiResponse ──────────────────────────────────────────────────────────────
// The standard shape for every response sent from this API.
// All controllers must use this — never send raw res.json().
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | Record<string, unknown>;
}

// ─── Paginated Data ───────────────────────────────────────────────────────────
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Pagination Query ─────────────────────────────────────────────────────────
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ─── Authenticated Request ────────────────────────────────────────────────────
// Extended Express Request that includes the decoded JWT payload.
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// ─── Express Handler Types ────────────────────────────────────────────────────
export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export type AuthHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => Promise<void>;

// ─── Service Result ───────────────────────────────────────────────────────────
// Used to pass structured results between service and controller layers.
export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}
