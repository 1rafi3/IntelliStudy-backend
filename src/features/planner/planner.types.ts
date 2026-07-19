export interface PlannerTask { id: string; userId: string; title: string; dueDate: Date; completed: boolean; roadmapId?: string; }
export interface CreateTaskDto { title: string; dueDate: string; roadmapId?: string; }
