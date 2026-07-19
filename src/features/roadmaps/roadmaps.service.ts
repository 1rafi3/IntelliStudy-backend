import mongoose from 'mongoose';
import { Roadmap } from './roadmaps.model';
import { serializeRoadmap } from './roadmaps.utils';
import { ApiError } from '@shared/utils/api-error';
import {
  CreateRoadmapDto,
  UpdateRoadmapDto,
  ListRoadmapsQuery,
  PaginatedRoadmapsResponse,
  RoadmapResponse,
} from './roadmaps.types';

// ─── Roadmaps Service ─────────────────────────────────────────────────────────
// All business logic lives here. Controllers must stay thin.
export const roadmapsService = {

  // ── List (with search, filter, sort, pagination) ──────────────────────────
  list: async (
    userId: string,
    query: ListRoadmapsQuery,
  ): Promise<PaginatedRoadmapsResponse> => {
    const {
      page,
      limit,
      search,
      status,
      difficulty,
      archived,
      sortBy,
      sortOrder,
    } = query;

    const filter: mongoose.FilterQuery<typeof Roadmap> = {
      createdBy: new mongoose.Types.ObjectId(userId),
    };

    // Filter by archived (default: show non-archived)
    if (archived !== undefined) {
      filter.archived = archived;
    } else {
      filter.archived = false;
    }

    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;

    // Full-text search on title/subject/description via MongoDB text index
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const sortSpec: { [key: string]: mongoose.SortOrder } = { [sortBy]: sortDir };

    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      Roadmap.find(filter).sort(sortSpec).skip(skip).limit(limit).lean(),
      Roadmap.countDocuments(filter),
    ]);

    return {
      roadmaps: docs.map((d) => serializeRoadmap(d as any)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // ── Get Single Roadmap ─────────────────────────────────────────────────────
  getById: async (roadmapId: string, userId: string): Promise<RoadmapResponse> => {
    const roadmap = await Roadmap.findOne({
      _id: roadmapId,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    if (!roadmap) {
      throw ApiError.notFound('Roadmap not found');
    }

    return serializeRoadmap(roadmap);
  },

  // ── Create ─────────────────────────────────────────────────────────────────
  create: async (userId: string, dto: CreateRoadmapDto): Promise<RoadmapResponse> => {
    const roadmap = await Roadmap.create({
      ...dto,
      createdBy: new mongoose.Types.ObjectId(userId),
      status: 'not-started',
      progress: 0,
    });

    return serializeRoadmap(roadmap);
  },

  // ── Update ─────────────────────────────────────────────────────────────────
  update: async (
    roadmapId: string,
    userId: string,
    dto: UpdateRoadmapDto,
  ): Promise<RoadmapResponse> => {
    const roadmap = await Roadmap.findOneAndUpdate(
      { _id: roadmapId, createdBy: new mongoose.Types.ObjectId(userId) },
      { $set: dto },
      { new: true, runValidators: true },
    );

    if (!roadmap) {
      throw ApiError.notFound('Roadmap not found');
    }

    return serializeRoadmap(roadmap);
  },

  // ── Archive / Unarchive ────────────────────────────────────────────────────
  toggleArchive: async (
    roadmapId: string,
    userId: string,
  ): Promise<RoadmapResponse> => {
    const existing = await Roadmap.findOne({
      _id: roadmapId,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    if (!existing) {
      throw ApiError.notFound('Roadmap not found');
    }

    existing.archived = !existing.archived;
    await existing.save();

    return serializeRoadmap(existing);
  },

  // ── Delete ─────────────────────────────────────────────────────────────────
  delete: async (roadmapId: string, userId: string): Promise<void> => {
    const result = await Roadmap.findOneAndDelete({
      _id: roadmapId,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    if (!result) {
      throw ApiError.notFound('Roadmap not found');
    }
  },
};
