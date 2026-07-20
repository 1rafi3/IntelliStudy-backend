export interface BookmarkResponse {
  id: string;
  user: string;
  type: 'ai-roadmap' | 'manual-roadmap' | 'chat-response' | 'recommendation';
  referencedId: string;
  title: string;
  description?: string;
  preview?: string;
  createdAt: string;
  updatedAt: string;
}
