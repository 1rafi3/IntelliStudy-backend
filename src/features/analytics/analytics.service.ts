import { Roadmap } from '@features/roadmaps/roadmaps.model';
import { ChatSession } from '@features/chat/chat.model';
import { Bookmark } from '@features/bookmark/bookmark.model';
import { Recommendation } from '@features/recommendation/recommendation.model';
import { AIHistory } from '@features/ai/ai-history.model';
import { User } from '@features/auth/user.model';
import mongoose from 'mongoose';

export interface AnalyticsResponse {
  overview: {
    totalRoadmaps: number;
    activeRoadmaps: number;
    completedRoadmaps: number;
    pausedRoadmaps: number;
    aiGeneratedRoadmaps: number;
    totalChatSessions: number;
    totalChatMessages: number;
    totalRecommendations: number;
    totalBookmarks: number;
    totalAiGenerations: number;
    averageRoadmapProgress: number;
    profileCompletion: number;
  };
  roadmapProgressDistribution: { range: string; count: number }[];
  roadmapStatusDistribution: { status: string; count: number }[];
  roadmapDifficultyDistribution: { difficulty: string; count: number }[];
  bookmarkDistribution: { type: string; count: number }[];
  recommendationCategoryDistribution: { category: string; count: number }[];
  chatActivity: { date: string; count: number }[];
  insights: Insight[];
}

export interface Insight {
  type: 'positive' | 'info' | 'warning';
  title: string;
  description: string;
}

export const analyticsService = {
  getAnalytics: async (userId: string): Promise<AnalyticsResponse> => {
    const uid = new mongoose.Types.ObjectId(userId);

    const [
      roadmaps,
      roadmapStatusAgg,
      roadmapDifficultyAgg,
      roadmapProgressAgg,
      chatSessions,
      bookmarks,
      bookmarkTypeAgg,
      recommendations,
      recommendationCategoryAgg,
      aiHistories,
      user,
    ] = await Promise.all([
      Roadmap.find({ createdBy: uid, archived: false }).lean(),
      Roadmap.aggregate([
        { $match: { createdBy: uid, archived: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Roadmap.aggregate([
        { $match: { createdBy: uid, archived: false } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]),
      Roadmap.aggregate([
        { $match: { createdBy: uid, archived: false } },
        {
          $bucket: {
            groupBy: '$progress',
            boundaries: [0, 25, 50, 75, 100],
            default: '100',
            output: { count: { $sum: 1 } },
          },
        },
      ]),
      ChatSession.find({ user: uid }).lean(),
      Bookmark.find({ user: uid }).lean(),
      Bookmark.aggregate([
        { $match: { user: uid } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Recommendation.find({ user: uid }).lean(),
      Recommendation.aggregate([
        { $match: { user: uid } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      AIHistory.find({ user: uid }).lean(),
      User.findById(uid).lean(),
    ]);

    const totalRoadmaps = roadmaps.length;
    const activeRoadmaps = roadmaps.filter((r) => r.status === 'in-progress').length;
    const completedRoadmaps = roadmaps.filter((r) => r.status === 'completed').length;
    const pausedRoadmaps = roadmaps.filter((r) => r.status === 'paused').length;
    const totalProgress = roadmaps.reduce((sum, r) => sum + (r.progress || 0), 0);
    const averageRoadmapProgress = totalRoadmaps > 0 ? Math.round(totalProgress / totalRoadmaps) : 0;

    const totalChatMessages = chatSessions.reduce((sum, s) => sum + (s.messages?.length || 0), 0);

    const profileFields = user
      ? ['name', 'email', 'avatar', 'learningGoal', 'currentLevel', 'learningStyle', 'preferredLanguage', 'weeklyStudyHours']
      : [];
    const filledFields = user ? profileFields.filter((f) => (user as any)[f]) : [];
    const profileCompletion = profileFields.length > 0 ? Math.round((filledFields.length / profileFields.length) * 100) : 0;

    const statusMap: Record<string, number> = {};
    roadmapStatusAgg.forEach((item: any) => { statusMap[item._id] = item.count; });

    const difficultyMap: Record<string, number> = {};
    roadmapDifficultyAgg.forEach((item: any) => { difficultyMap[item._id] = item.count; });

    const progressLabels = ['0-24%', '25-49%', '50-74%', '75-99%', '100%'];
    const progressBuckets: Record<string, number> = {};
    roadmapProgressAgg.forEach((item: any) => {
      const idx = item._id === 0 ? '0-24%' :
                  item._id === 25 ? '25-49%' :
                  item._id === 50 ? '50-74%' :
                  item._id === 75 ? '75-99%' : '100%';
      progressBuckets[idx] = item.count;
    });
    const roadmapProgressDistribution = progressLabels.map((range) => ({
      range,
      count: progressBuckets[range] || 0,
    }));

    const allStatuses = ['not-started', 'in-progress', 'completed', 'paused'];
    const roadmapStatusDistribution = allStatuses.map((status) => ({
      status,
      count: statusMap[status] || 0,
    }));

    const allDifficulties = ['beginner', 'intermediate', 'advanced'];
    const roadmapDifficultyDistribution = allDifficulties.map((difficulty) => ({
      difficulty,
      count: difficultyMap[difficulty] || 0,
    }));

    const bookmarkTypeMap: Record<string, number> = {};
    bookmarkTypeAgg.forEach((item: any) => { bookmarkTypeMap[item._id] = item.count; });
    const allBookmarkTypes = ['ai-roadmap', 'manual-roadmap', 'chat-response', 'recommendation'];
    const bookmarkDistribution = allBookmarkTypes.map((type) => ({
      type,
      count: bookmarkTypeMap[type] || 0,
    }));

    const categoryMap: Record<string, number> = {};
    recommendationCategoryAgg.forEach((item: any) => { categoryMap[item._id] = item.count; });
    const allCategories = ['next-study-step', 'suggested-resource', 'practice-project', 'skill-gap', 'revision-reminder'];
    const recommendationCategoryDistribution = allCategories.map((category) => ({
      category,
      count: categoryMap[category] || 0,
    }));

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dayLabels: string[] = [];
    const dayCounts: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      dayLabels.push(label);
      dayCounts[label] = 0;
    }
    chatSessions.forEach((s) => {
      const created = new Date(s.createdAt);
      if (created >= sevenDaysAgo) {
        const label = created.toLocaleDateString('en-US', { weekday: 'short' });
        if (dayCounts[label] !== undefined) {
          dayCounts[label] += s.messages?.length || 0;
        }
      }
    });
    const chatActivity = dayLabels.map((date) => ({ date, count: dayCounts[date] }));

    const insights: Insight[] = [];

    if (completedRoadmaps > 0) {
      insights.push({
        type: 'positive',
        title: 'Completing Roadmaps',
        description: `You have completed ${completedRoadmaps} roadmap${completedRoadmaps > 1 ? 's' : ''}. Keep up the momentum!`,
      });
    }

    const totalChats = chatSessions.length;
    if (totalChats >= 5) {
      insights.push({
        type: 'positive',
        title: 'Active AI Coach User',
        description: `You've had ${totalChats} chat sessions with the AI Coach. Regular practice reinforces learning.`,
      });
    } else if (totalChats > 0) {
      insights.push({
        type: 'info',
        title: 'Try AI Coach Chat',
        description: `You've started ${totalChats} chat session${totalChats > 1 ? 's' : ''}. Try asking questions about your roadmaps for deeper understanding.`,
      });
    }

    const totalRecs = recommendations.length;
    if (totalRecs > 0) {
      insights.push({
        type: 'info',
        title: 'Recommendations Available',
        description: `You have ${totalRecs} recommendation${totalRecs > 1 ? 's' : ''}. Review them to discover new learning opportunities.`,
      });
    }

    const totalBookmarked = bookmarks.length;
    if (totalBookmarked > 0) {
      insights.push({
        type: 'info',
        title: 'Bookmarked Resources',
        description: `You have saved ${totalBookmarked} item${totalBookmarked > 1 ? 's' : ''} to your bookmarks for quick access.`,
      });
    }

    const notStarted = roadmaps.filter((r) => r.status === 'not-started').length;
    if (notStarted > 0) {
      insights.push({
        type: 'warning',
        title: 'Unstarted Roadmaps',
        description: `${notStarted} roadmap${notStarted > 1 ? 's are' : ' is'} waiting to begin. Pick one to get started today.`,
      });
    }

    if (activeRoadmaps === 0 && totalRoadmaps > 0) {
      insights.push({
        type: 'warning',
        title: 'No Active Roadmaps',
        description: 'All your roadmaps are completed or paused. Consider starting a new one.',
      });
    }

    if (totalRoadmaps === 0) {
      insights.push({
        type: 'info',
        title: 'Create Your First Roadmap',
        description: 'Generate an AI-powered study roadmap to start your personalized learning journey.',
      });
    }

    const totalAiGens = aiHistories.length;
    if (totalAiGens > 0) {
      insights.push({
        type: 'info',
        title: 'AI Roadmap Generator',
        description: `You have generated ${totalAiGens} AI roadmap${totalAiGens > 1 ? 's' : ''}. Use the generator to explore new subjects.`,
      });
    }

    const topSubject = roadmaps.length > 0
      ? roadmaps.sort((a, b) => (b.progress || 0) - (a.progress || 0))[0]?.subject
      : null;
    if (topSubject) {
      insights.push({
        type: 'info',
        title: 'Most Active Subject',
        description: `Your most advanced roadmap is in "${topSubject}". Consider diving deeper into related topics.`,
      });
    }

    return {
      overview: {
        totalRoadmaps,
        activeRoadmaps,
        completedRoadmaps,
        pausedRoadmaps,
        aiGeneratedRoadmaps: totalAiGens,
        totalChatSessions: totalChats,
        totalChatMessages,
        totalRecommendations: totalRecs,
        totalBookmarks: totalBookmarked,
        totalAiGenerations: totalAiGens,
        averageRoadmapProgress,
        profileCompletion,
      },
      roadmapProgressDistribution,
      roadmapStatusDistribution,
      roadmapDifficultyDistribution,
      bookmarkDistribution,
      recommendationCategoryDistribution,
      chatActivity,
      insights,
    };
  },
};
