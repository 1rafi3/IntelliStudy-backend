export interface Review { id: string; userId: string; targetId: string; targetType: 'roadmap' | 'recommendation'; rating: number; comment?: string; createdAt: Date; }
export interface CreateReviewDto { targetId: string; targetType: 'roadmap' | 'recommendation'; rating: number; comment?: string; }
