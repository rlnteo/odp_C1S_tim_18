import { TaskDto } from "../../DTOs/task/TaskDto";
import { CreateTaskDto } from "../../DTOs/task/CreateTaskDto";
import { TaskUpdateFieldsDto } from "../../types/TaskUpdateFieldsDto";
import { TaskStatus } from "../../enums/TaskStatus";

export interface ITaskService {
    createTask(dto: CreateTaskDto): Promise<TaskDto | null>;
    getTasksByProject(projectId: number): Promise<TaskDto[]>;
    getMyTasks(userId: number): Promise<TaskDto[]>;
    getTaskById(id: number): Promise<TaskDto | null>;
    updateTask(id: number, fields: TaskUpdateFieldsDto, requesterId: number): Promise<boolean>;
    updateStatus(id: number, status: TaskStatus, requesterId: number): Promise<boolean>;
    deleteTask(id: number, requesterId: number): Promise<boolean>;
}