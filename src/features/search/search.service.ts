import { Roadmap } from '@features/roadmaps/roadmaps.model';
import { AIHistory } from '@features/ai/ai-history.model';
import { ChatSession } from '@features/chat/chat.model';
import { Recommendation } from '@features/recommendation/recommendation.model';
import { Bookmark } from '@features/bookmark/bookmark.model';
import { SearchResultItem, SearchGroup, GlobalSearchResponse } from './search.types';

const escapeRegex = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const searchService = {
  globalSearch: async (userId: string, query: string): Promise<GlobalSearchResponse> => {
    const pattern = escapeRegex(query);
    const regex = new RegExp(pattern, 'i');
    const limit = 10;

    const [manualRoadmaps, aiRoadmaps, chatSessions, recommendations, bookmarks] =
      await Promise.all([
        Roadmap.find({
          createdBy: userId,
          archived: false,
          $or: [
            { title: regex },
            { subject: regex },
            { description: regex },
            { tags: regex },
          ],
        })
          .sort({ updatedAt: -1 })
          .limit(limit)
          .lean(),

        AIHistory.find({
          user: userId,
          $or: [
            { 'prompt.learningGoal': regex },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),

        ChatSession.find({
          user: userId,
          title: regex,
        })
          .sort({ updatedAt: -1 })
          .limit(limit)
          .lean(),

        Recommendation.find({
          user: userId,
          $or: [
            { title: regex },
            { description: regex },
            { reason: regex },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),

        Bookmark.find({
          user: userId,
          $or: [
            { title: regex },
            { description: regex },
            { preview: regex },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),
      ]);

    const groups: SearchGroup[] = [];

    if (manualRoadmaps.length > 0) {
      groups.push({
        type: 'manual-roadmap',
        label: 'Manual Roadmaps',
        items: manualRoadmaps.map((r) => {
          const item: SearchResultItem = {
            id: String(r._id),
            type: 'manual-roadmap',
            title: r.title,
            description: r.description || r.subject,
            route: `/dashboard/roadmaps/${String(r._id)}`,
            createdAt: r.createdAt?.toISOString?.() ?? '',
          };
          return item;
        }),
      });
    }

    if (aiRoadmaps.length > 0) {
      groups.push({
        type: 'ai-roadmap',
        label: 'AI Roadmaps',
        items: aiRoadmaps.map((r) => {
          const item: SearchResultItem = {
            id: String(r._id),
            type: 'ai-roadmap',
            title: r.prompt?.learningGoal ?? 'AI Roadmap',
            description: `Level: ${r.prompt?.currentLevel ?? 'N/A'} · Style: ${r.prompt?.learningStyle ?? 'N/A'}`,
            route: `/dashboard/ai-generator`,
            createdAt: r.createdAt?.toISOString?.() ?? '',
          };
          return item;
        }),
      });
    }

    if (chatSessions.length > 0) {
      groups.push({
        type: 'chat-session',
        label: 'Chat Sessions',
        items: chatSessions.map((s) => {
          const item: SearchResultItem = {
            id: String(s._id),
            type: 'chat-session',
            title: s.title,
            description: `${s.messages?.length ?? 0} messages`,
            route: `/dashboard/chat`,
            createdAt: s.createdAt?.toISOString?.() ?? '',
          };
          return item;
        }),
      });
    }

    if (recommendations.length > 0) {
      groups.push({
        type: 'recommendation',
        label: 'Recommendations',
        items: recommendations.map((r) => {
          const item: SearchResultItem = {
            id: String(r._id),
            type: 'recommendation',
            title: r.title,
            description: r.description,
            route: `/dashboard/recommendations`,
            createdAt: r.createdAt?.toISOString?.() ?? '',
          };
          return item;
        }),
      });
    }

    if (bookmarks.length > 0) {
      groups.push({
        type: 'bookmark',
        label: 'Bookmarks',
        items: bookmarks.map((b) => {
          const item: SearchResultItem = {
            id: String(b._id),
            type: 'bookmark',
            title: b.title,
            description: b.description || b.preview || '',
            route: `/dashboard/bookmarks`,
            createdAt: b.createdAt?.toISOString?.() ?? '',
          };
          return item;
        }),
      });
    }

    const total = groups.reduce((sum, g) => sum + g.items.length, 0);

    return { query, groups, total };
  },
};
