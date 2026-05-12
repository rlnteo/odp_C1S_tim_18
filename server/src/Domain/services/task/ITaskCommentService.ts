import { CommentDto } from "../../DTOs/task/CommentDto";

export interface ITaskCommentService {
    addComment(taskId: number, userId: number, content: string): Promise<CommentDto | null>;
    deleteComment(commentId: number, taskId: number, requesterId: number): Promise<boolean>;
}