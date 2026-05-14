export interface ProjectDto {
  id: number;
  teamId: number;
  name: string;
  description: string;
  deadline: string;
  status: "planning" | "active" | "on_hold" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  createdBy: number;
  createdAt: string;
  tags: TagDto[];
}

export interface TagDto {
  id: number;
  name: string;
}