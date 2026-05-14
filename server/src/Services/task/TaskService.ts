import { ITaskService } from "../../Domain/services/task/ITaskService";
import { ITaskRepository } from "../../Domain/repositories/task/ITaskRepository";
import { ITaskPermissionRepository } from "../../Domain/repositories/task/ITaskPermissionRepository";
import { Task } from "../../Domain/models/Task";
import { Assignee } from "../../Domain/models/Assignee";
import { Comment } from "../../Domain/models/Comment";
import { TaskDto } from "../../Domain/DTOs/task/TaskDto";
import { AssigneeDto } from "../../Domain/DTOs/task/AssigneeDto";
import { CommentDto } from "../../Domain/DTOs/task/CommentDto";
import { CreateTaskDto } from "../../Domain/DTOs/task/CreateTaskDto";
import { TaskUpdateFieldsDto } from "../../Domain/types/TaskUpdateFieldsDto";
import { TaskStatus } from "../../Domain/enums/TaskStatus";

export class TaskService implements ITaskService {
    public constructor(
        private readonly taskRepo: ITaskRepository,
        private readonly permRepo: ITaskPermissionRepository,
    ) { }

    private toDto(task: Task): TaskDto {
        return new TaskDto(
            task.id, task.projectId, task.title, task.description,
            task.priority, task.status, task.estimatedHours, task.dueDate,
            task.createdBy, task.createdAt,
            task.assignees.map((a: Assignee) => new AssigneeDto(a.userId, a.username, a.assignedAt, a.assignedBy)),
            task.comments.map((c: Comment) => new CommentDto(c.id, c.taskId, c.userId, c.username, c.content, c.createdAt)),
        );
    }

    async createTask(dto: CreateTaskDto): Promise<TaskDto> {
        const task = new Task(
            0, dto.projectId, dto.title, dto.description,
            dto.priority, dto.status, dto.estimatedHours, dto.dueDate, dto.createdBy,
        );
        const created = await this.taskRepo.create(task);
        if (created.id === 0) return new TaskDto();
        const full = await this.taskRepo.findById(created.id);
        if (!full) return new TaskDto();
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

    async getTaskById(id: number): Promise<TaskDto> {
        const task = await this.taskRepo.findById(id);
        if (!task) return new TaskDto();
        return this.toDto(task);
    }

    async updateTask(id: number, fields: TaskUpdateFieldsDto, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(id, requesterId);
        const isCreator = await this.permRepo.isCreator(id, requesterId);
        if (!isOwner && !isCreator) return false;
        return this.taskRepo.update(id, fields);
    }

    async updateStatus(id: number, status: TaskStatus, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(id, requesterId);
        if (!isOwner) return false;
        return this.taskRepo.updateStatus(id, status);
    }

    async deleteTask(id: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(id, requesterId);
        const isCreator = await this.permRepo.isCreator(id, requesterId);
        if (!isOwner && !isCreator) return false;
        return this.taskRepo.delete(id);
    }
}