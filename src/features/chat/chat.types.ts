export interface ChatMessage { role: 'user' | 'assistant'; content: string; timestamp: Date; }
export interface CreateChatDto { message: string; sessionId?: string; }
export interface ChatSession { id: string; userId: string; messages: ChatMessage[]; createdAt: Date; }
