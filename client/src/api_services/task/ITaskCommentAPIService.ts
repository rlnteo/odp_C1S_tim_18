import type { CommentDto } from "../../models/task/TaskDto";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ITaskCommentAPIService {
    addComment(taskId: number, content: string): Promise<ApiResponse<CommentDto>>;
    deleteComment(taskId: number, commentId: number): Promise<ApiResponse<void>>;
}