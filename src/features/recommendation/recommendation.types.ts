export interface Recommendation { id: string; userId: string; title: string; type: 'video' | 'article' | 'course'; url: string; relevanceScore: number; }
