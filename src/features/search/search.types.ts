export interface SearchResultItem {
  id: string;
  type: 'manual-roadmap' | 'ai-roadmap' | 'chat-session' | 'recommendation' | 'bookmark';
  title: string;
  description: string;
  route: string;
  createdAt: string;
}

export interface SearchGroup {
  type: string;
  label: string;
  items: SearchResultItem[];
}

export interface GlobalSearchResponse {
  query: string;
  groups: SearchGroup[];
  total: number;
}
