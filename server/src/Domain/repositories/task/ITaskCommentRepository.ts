import { CommentDto } from "../../DTOs/task/CommentDto";

export interface ITaskCommentRepository {
    getComments(taskId: number): Promise<CommentDto[]>;
    addComment(taskId: number, userId: number, content: string): Promise<CommentDto | null>;
    deleteComment(commentId: number): Promise<boolean>;
    isCommentOwner(commentId: number, userId: number): Promise<boolean>;
}