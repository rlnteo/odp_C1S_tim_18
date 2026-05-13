import { ITaskCommentService } from "../../Domain/services/task/ITaskCommentService";
import { ITaskCommentRepository } from "../../Domain/repositories/task/ITaskCommentRepository";
import { ITaskPermissionRepository } from "../../Domain/repositories/task/ITaskPermissionRepository";
import { ITaskAssigneeRepository } from "../../Domain/repositories/task/ITaskAssigneeRepository";
import { Comment } from "../../Domain/models/Comment";
import { CommentDto } from "../../Domain/DTOs/task/CommentDto";

export class TaskCommentService implements ITaskCommentService {
    public constructor(
        private readonly commentRepo: ITaskCommentRepository,
        private readonly assigneeRepo: ITaskAssigneeRepository,
        private readonly permRepo: ITaskPermissionRepository,
    ) { }

    private toDto(comment: Comment): CommentDto {
        return new CommentDto(comment.id, comment.taskId, comment.userId, comment.username, comment.content, comment.createdAt);
    }

    async addComment(taskId: number, userId: number, content: string): Promise<CommentDto> {
        const isAssigned = await this.assigneeRepo.isAssigned(taskId, userId);
        if (!isAssigned) return new CommentDto();
        const comment = await this.commentRepo.addComment(taskId, userId, content);
        if (!comment || comment.id === 0) return new CommentDto();
        return this.toDto(comment);
    }

    async deleteComment(commentId: number, taskId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(taskId, requesterId);
        const isCommentOwner = await this.commentRepo.isCommentOwner(commentId, requesterId);
        if (!isOwner && !isCommentOwner) return false;
        return this.commentRepo.deleteComment(commentId);
    }
}