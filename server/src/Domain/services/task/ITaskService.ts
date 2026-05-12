import { TaskDto } from "../../DTOs/task/TaskDto";
import { CreateTaskDto } from "../../DTOs/task/CreateTaskDto";
import { TaskUpdateFields } from "../../types/TaskUpdateFields";
import { TaskStatus } from "../../enums/TaskStatus";

export interface ITaskService {
    createTask(dto: CreateTaskDto): Promise<TaskDto | null>;
    getTasksByProject(projectId: number): Promise<TaskDto[]>;
    getMyTasks(userId: number): Promise<TaskDto[]>;
    getTaskById(id: number): Promise<TaskDto | null>;
    updateTask(id: number, fields: TaskUpdateFields, requesterId: number): Promise<boolean>;
    updateStatus(id: number, status: TaskStatus, requesterId: number): Promise<boolean>;
    deleteTask(id: number, requesterId: number): Promise<boolean>;
}