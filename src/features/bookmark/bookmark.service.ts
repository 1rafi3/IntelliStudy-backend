import mongoose from 'mongoose';
import { Bookmark } from './bookmark.model';
import { bookmarkUtils } from './bookmark.utils';
import { ApiError } from '@shared/utils/api-error';
import { BookmarkResponse } from './bookmark.types';

export interface ListBookmarksQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'ai-roadmap' | 'manual-roadmap' | 'chat-response' | 'recommendation';
}

export interface PaginatedBookmarksResponse {
  items: BookmarkResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const bookmarkService = {
  /**
   * Add a new bookmark. Prevents duplicates.
   */
  add: async (
    userId: string,
    dto: {
      type: 'ai-roadmap' | 'manual-roadmap' | 'chat-response' | 'recommendation';
      referencedId: string;
      title: string;
      description?: string;
      preview?: string;
    }
  ): Promise<BookmarkResponse> => {
    // Prevent duplicate bookmarks
    const exists = await Bookmark.findOne({
      user: new mongoose.Types.ObjectId(userId),
      type: dto.type,
      referencedId: dto.referencedId,
    });

    if (exists) {
      throw ApiError.conflict('This item is already bookmarked');
    }

    const bookmark = await Bookmark.create({
      user: new mongoose.Types.ObjectId(userId),
      type: dto.type,
      referencedId: dto.referencedId,
      title: dto.title,
      description: dto.description || '',
      preview: dto.preview || '',
    });

    return bookmarkUtils.serialize(bookmark);
  },

  /**
   * Remove a bookmark by its ID. Checks ownership.
   */
  remove: async (id: string, userId: string): Promise<void> => {
    const bookmark = await Bookmark.findOne({
      _id: id,
      user: new mongoose.Types.ObjectId(userId),
    });

    if (!bookmark) {
      throw ApiError.notFound('Bookmark not found or not owned by user');
    }

    await Bookmark.deleteOne({ _id: id });
  },

  /**
   * Remove a bookmark by its referenced ID and type. Checks ownership.
   * Useful for direct toggling on roadmap or recommendation cards.
   */
  removeByReference: async (
    userId: string,
    type: 'ai-roadmap' | 'manual-roadmap' | 'chat-response' | 'recommendation',
    referencedId: string
  ): Promise<void> => {
    const bookmark = await Bookmark.findOne({
      user: new mongoose.Types.ObjectId(userId),
      type,
      referencedId,
    });

    if (!bookmark) {
      throw ApiError.notFound('Bookmark not found');
    }

    await Bookmark.deleteOne({ _id: bookmark._id });
  },

  /**
   * List paginated bookmarks with search & type filters.
   */
  getAll: async (userId: string, query: ListBookmarksQuery): Promise<PaginatedBookmarksResponse> => {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: mongoose.FilterQuery<typeof Bookmark> = {
      user: new mongoose.Types.ObjectId(userId),
    };

    if (query.type) {
      filter.type = query.type;
    }

    if (query.search && query.search.trim()) {
      filter.$text = { $search: query.search.trim() };
    }

    const [docs, total] = await Promise.all([
      Bookmark.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Bookmark.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: docs.map(bookmarkUtils.serialize),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  },
};
