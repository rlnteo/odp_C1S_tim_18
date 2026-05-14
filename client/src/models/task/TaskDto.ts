export interface TaskDto {
  id: number;
  projectId: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "todo" | "in_progress" | "done";
  estimatedHours: number;
  dueDate: string | null;
  createdBy: number;
  createdAt: string;
  assignees: AssigneeDto[];
  comments: CommentDto[];
}

export interface AssigneeDto {
  userId: number;
  username: string;
  assignedAt: string;
}

export interface CommentDto {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}