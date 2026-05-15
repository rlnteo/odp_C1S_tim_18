import type { TaskDto } from "../../models/task/TaskDto";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ITaskAPIService {
    getByProject(projectId: number): Promise<ApiResponse<TaskDto[]>>;
    getMyTasks(): Promise<ApiResponse<TaskDto[]>>;
    getById(id: number): Promise<ApiResponse<TaskDto>>;
    create(payload: {
        projectId: number;
        title: string;
        description: string;
        priority: string;
        status: string;
        estimatedHours: number;
        dueDate?: string;
    }): Promise<ApiResponse<TaskDto>>;
    update(id: number, payload: Partial<TaskDto>): Promise<ApiResponse<void>>;
    updateStatus(id: number, status: string): Promise<ApiResponse<void>>;
    delete(id: number): Promise<ApiResponse<void>>;
}