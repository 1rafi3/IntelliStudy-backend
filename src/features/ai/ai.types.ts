import { GenerateRoadmapDto, SaveRoadmapDto } from './ai.validation';

export type { GenerateRoadmapDto, SaveRoadmapDto };

export interface AIHistoryResponse {
  id: string;
  prompt: {
    learningGoal: string;
    currentLevel: string;
    duration: number;
    weeklyHours: number;
    learningStyle: string;
    language: string;
  };
  generatedRoadmap: Record<string, any>;
  createdAt: string;
}
