import { IRoadmap } from './roadmaps.model';
import { RoadmapResponse } from './roadmaps.types';

// ─── Roadmap Serializer ───────────────────────────────────────────────────────
// Converts a Mongoose document to a clean API response object.
// Keeps all controllers free of serialization logic.
export const serializeRoadmap = (doc: IRoadmap): RoadmapResponse => ({
  id: doc._id.toString(),
  title: doc.title,
  subject: doc.subject,
  description: doc.description,
  goal: doc.goal,
  difficulty: doc.difficulty,
  estimatedDuration: doc.estimatedDuration,
  progress: doc.progress,
  status: doc.status,
  tags: doc.tags,
  archived: doc.archived,
  createdBy: doc.createdBy.toString(),
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});
