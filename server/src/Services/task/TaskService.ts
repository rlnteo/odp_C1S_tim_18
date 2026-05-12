import { ITaskService } from "../../Domain/services/task/ITaskService";
import { ITaskAssigneeService } from "../../Domain/services/task/ITaskAssigneeService";
import { ITaskCommentService } from "../../Domain/services/task/ITaskCommentService";
import { ITaskRepository } from "../../Domain/repositories/task/ITaskRepository";
import { ITaskAssigneeRepository } from "../../Domain/repositories/task/ITaskAssigneeRepository";
import { ITaskCommentRepository } from "../../Domain/repositories/task/ITaskCommentRepository";
import { ITaskPermissionRepository } from "../../Domain/repositories/task/ITaskPermissionRepository";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { Task } from "../../Domain/models/Task";
import { Assignee } from "../../Domain/models/Assignee";
import { Comment } from "../../Domain/models/Comment";
import { TaskDto } from "../../Domain/DTOs/task/TaskDto";
import { CreateTaskDto } from "../../Domain/DTOs/task/CreateTaskDto";
import { TaskUpdateFields } from "../../Domain/types/TaskUpdateFields";
import { AssigneeDto } from "../../Domain/DTOs/task/AssigneeDto";
import { CommentDto } from "../../Domain/DTOs/task/CommentDto";
import { TaskStatus } from "../../Domain/enums/TaskStatus";

export class TaskService implements ITaskService, ITaskAssigneeService, ITaskCommentService {
    public constructor(
        private readonly taskRepo: ITaskRepository,
        private readonly assigneeRepo: ITaskAssigneeRepository,
        private readonly commentRepo: ITaskCommentRepository,
        private readonly permRepo: ITaskPermissionRepository,
        private readonly userRepo: IUserRepository,
    ) { }

    private toDto(task: Task): TaskDto {
        return new TaskDto(
            task.id, task.projectId, task.title, task.description,
            task.priority, task.status, task.estimatedHours, task.dueDate,
            task.createdBy, task.createdAt,
            task.assignees.map((a) => new AssigneeDto(a.userId, a.username, a.assignedAt, a.assignedBy)),
            task.comments.map((c) => new CommentDto(c.id, c.taskId, c.userId, c.username, c.content, c.createdAt)),
        );
    }

    private commentToDto(comment: Comment): CommentDto {
        return new CommentDto(comment.id, comment.taskId, comment.userId, comment.username, comment.content, comment.createdAt);
    }

    async createTask(dto: CreateTaskDto): Promise<TaskDto | null> {
        const task = new Task(
            0, dto.projectId, dto.title, dto.description,
            dto.priority, dto.status, dto.estimatedHours, dto.dueDate, dto.createdBy,
        );
        const created = await this.taskRepo.create(task);
        if (created.id === 0) return null;
        const full = await this.taskRepo.findById(created.id);
        if (!full) return null;
        return this.toDto(full);
    }

    async getTasksByProject(projectId: number): Promise<TaskDto[]> {
        const tasks = await this.taskRepo.findByProjectId(projectId);
        return tasks.map((t) => this.toDto(t));
    }

    async getMyTasks(userId: number): Promise<TaskDto[]> {
        const tasks = await this.taskRepo.findAssignedToUser(userId);
        return tasks.map((t) => this.toDto(t));
    }

    async getTaskById(id: number): Promise<TaskDto | null> {
        const task = await this.taskRepo.findById(id);
        if (!task) return null;
        return this.toDto(task);
    }

    async updateTask(id: number, fields: TaskUpdateFields, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(id, requesterId);
        const isCreator = await this.permRepo.isCreator(id, requesterId);
        if (!isOwner && !isCreator) return false;
        return this.taskRepo.update(id, fields);
    }

    async updateStatus(id: number, status: TaskStatus, requesterId: number): Promise<boolean> {
        const isAssigned = await this.assigneeRepo.isAssigned(id, requesterId);
        const isOwner = await this.permRepo.isOwnerOfTeam(id, requesterId);
        if (!isAssigned && !isOwner) return false;
        return this.taskRepo.updateStatus(id, status);
    }

    async deleteTask(id: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(id, requesterId);
        const isCreator = await this.permRepo.isCreator(id, requesterId);
        if (!isOwner && !isCreator) return false;
        return this.taskRepo.delete(id);
    }

    async assignUser(taskId: number, userId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(taskId, requesterId);
        if (!isOwner) return false;
        const user = await this.userRepo.findById(userId);
        if (user.id === 0) return false;
        return this.assigneeRepo.assignUser(taskId, userId, requesterId);
    }

    async unassignUser(taskId: number, userId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(taskId, requesterId);
        if (!isOwner) return false;
        return this.assigneeRepo.unassignUser(taskId, userId);
    }

    async addComment(taskId: number, userId: number, content: string): Promise<CommentDto | null> {
        const isAssigned = await this.assigneeRepo.isAssigned(taskId, userId);
        if (!isAssigned) return null;
        const comment = await this.commentRepo.addComment(taskId, userId, content);
        if (!comment) return null;
        return this.commentToDto(comment);
    }

    async deleteComment(commentId: number, taskId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(taskId, requesterId);
        const isCommentOwner = await this.commentRepo.isCommentOwner(commentId, requesterId);
        if (!isOwner && !isCommentOwner) return false;
        return this.commentRepo.deleteComment(commentId);
    }
}