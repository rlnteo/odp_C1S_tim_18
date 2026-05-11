import { TaskDto } from "../../DTOs/task/TaskDto";
import { CreateTaskDto } from "../../DTOs/task/CreateTaskDto";
import { CommentDto } from "../../DTOs/task/CommentDto";
import { TaskStatus } from "../../enums/TaskStatus";

export interface ITaskService {
    createTask(dto: CreateTaskDto): Promise<TaskDto | null>;
    getTasksByProject(projectId: number): Promise<TaskDto[]>;
    getMyTasks(userId: number): Promise<TaskDto[]>;
    getTaskById(id: number): Promise<TaskDto | null>;
    updateTask(id: number, fields: Partial<CreateTaskDto>, requesterId: number): Promise<boolean>;
    updateStatus(id: number, status: TaskStatus, requesterId: number): Promise<boolean>;
    deleteTask(id: number, requesterId: number): Promise<boolean>;
    assignUser(taskId: number, userId: number, requesterId: number): Promise<boolean>;
    unassignUser(taskId: number, userId: number, requesterId: number): Promise<boolean>;
    addComment(taskId: number, userId: number, content: string): Promise<CommentDto | null>;
    deleteComment(commentId: number, taskId: number, requesterId: number): Promise<boolean>;
}