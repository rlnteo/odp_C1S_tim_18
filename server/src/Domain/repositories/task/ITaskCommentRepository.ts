import { Comment } from "../../models/Comment";

export interface ITaskCommentRepository {
    getComments(taskId: number): Promise<Comment[]>;
    addComment(taskId: number, userId: number, content: string): Promise<Comment | null>;
    deleteComment(commentId: number): Promise<boolean>;
    isCommentOwner(commentId: number, userId: number): Promise<boolean>;
}