export interface DashboardStats {
  totalRoadmaps: number;
  completedTasks: number;
  pendingTasks: number;
  totalBookmarks: number;
  studyStreakDays: number;
  recentActivity: ActivityItem[];
}
export interface ActivityItem { type: string; title: string; timestamp: Date; }
