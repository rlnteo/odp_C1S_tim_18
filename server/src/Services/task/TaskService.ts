import { ITaskService } from "../../Domain/services/task/ITaskService";
import { ITaskRepository } from "../../Domain/repositories/task/ITaskRepository";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { TaskDto } from "../../Domain/DTOs/task/TaskDto";
import { CreateTaskDto } from "../../Domain/DTOs/task/CreateTaskDto";
import { CommentDto } from "../../Domain/DTOs/task/CommentDto";
import { TaskStatus } from "../../Domain/enums/TaskStatus";

export class TaskService implements ITaskService {
    public constructor(
        private readonly taskRepo: ITaskRepository,
        private readonly userRepo: IUserRepository,
    ) { }

    async createTask(dto: CreateTaskDto): Promise<TaskDto | null> {
        const task = await this.taskRepo.create(dto);
        if (task.id === 0) return null;
        return this.taskRepo.findById(task.id);
    }

    async getTasksByProject(projectId: number): Promise<TaskDto[]> {
        return this.taskRepo.findByProjectId(projectId);
    }

    async getMyTasks(userId: number): Promise<TaskDto[]> {
        return this.taskRepo.findAssignedToUser(userId);
    }

    async getTaskById(id: number): Promise<TaskDto | null> {
        return this.taskRepo.findById(id);
    }

    async updateTask(id: number, fields: Partial<CreateTaskDto>, requesterId: number): Promise<boolean> {
        const isOwner = await this.taskRepo.isOwnerOfTeam(id, requesterId);
        const isCreator = await this.taskRepo.isCreator(id, requesterId);
        if (!isOwner && !isCreator) return false;
        return this.taskRepo.update(id, fields);
    }

    async updateStatus(id: number, status: TaskStatus, requesterId: number): Promise<boolean> {
        const isAssigned = await this.taskRepo.isAssigned(id, requesterId);
        const isOwner = await this.taskRepo.isOwnerOfTeam(id, requesterId);
        if (!isAssigned && !isOwner) return false;
        return this.taskRepo.updateStatus(id, status);
    }

    async deleteTask(id: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.taskRepo.isOwnerOfTeam(id, requesterId);
        const isCreator = await this.taskRepo.isCreator(id, requesterId);
        if (!isOwner && !isCreator) return false;
        return this.taskRepo.delete(id);
    }

    async assignUser(taskId: number, userId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.taskRepo.isOwnerOfTeam(taskId, requesterId);
        if (!isOwner) return false;
        const user = await this.userRepo.findById(userId);
        if (user.id === 0) return false;
        return this.taskRepo.assignUser(taskId, userId, requesterId);
    }

    async unassignUser(taskId: number, userId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.taskRepo.isOwnerOfTeam(taskId, requesterId);
        if (!isOwner) return false;
        return this.taskRepo.unassignUser(taskId, userId);
    }

    async addComment(taskId: number, userId: number, content: string): Promise<CommentDto | null> {
        const isAssigned = await this.taskRepo.isAssigned(taskId, userId);
        if (!isAssigned) return null;
        return this.taskRepo.addComment(taskId, userId, content);
    }

    async deleteComment(commentId: number, taskId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.taskRepo.isOwnerOfTeam(taskId, requesterId);
        const isCommentOwner = await this.taskRepo.isCommentOwner(commentId, requesterId);
        if (!isOwner && !isCommentOwner) return false;
        return this.taskRepo.deleteComment(commentId);
    }
}