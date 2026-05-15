export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ITaskAssigneeAPIService {
    assignUser(taskId: number, userId: number): Promise<ApiResponse<void>>;
    unassignUser(taskId: number, userId: number): Promise<ApiResponse<void>>;
}