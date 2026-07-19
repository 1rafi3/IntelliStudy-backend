import { CreateRoadmapDto, UpdateRoadmapDto, ListRoadmapsQuery } from './roadmaps.validation';

// ─── Roadmap DTOs (re-exported from validation for convenience) ───────────────
export type { CreateRoadmapDto, UpdateRoadmapDto, ListRoadmapsQuery };

// ─── Roadmap Status & Difficulty ─────────────────────────────────────────────
export type RoadmapStatus = 'not-started' | 'in-progress' | 'completed' | 'paused';
export type RoadmapDifficulty = 'beginner' | 'intermediate' | 'advanced';

// ─── Serialized Roadmap (returned from API) ───────────────────────────────────
export interface RoadmapResponse {
  id: string;
  title: string;
  subject: string;
  description?: string;
  goal?: string;
  difficulty: RoadmapDifficulty;
  estimatedDuration?: number;
  progress: number;
  status: RoadmapStatus;
  tags: string[];
  archived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Paginated List Response ──────────────────────────────────────────────────
export interface PaginatedRoadmapsResponse {
  roadmaps: RoadmapResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
