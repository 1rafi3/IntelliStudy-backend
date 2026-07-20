export interface RecommendationResponse {
  id: string;
  title: string;
  description: string;
  reason: string;
  category: 'next-study-step' | 'suggested-resource' | 'practice-project' | 'skill-gap' | 'revision-reminder';
  priority: 'low' | 'medium' | 'high';
  relatedRoadmap?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
