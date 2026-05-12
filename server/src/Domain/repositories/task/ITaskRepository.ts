import { Task } from "../../models/Task";
import { TaskDto } from "../../DTOs/task/TaskDto";
import { CreateTaskDto } from "../../DTOs/task/CreateTaskDto";
import { TaskStatus } from "../../enums/TaskStatus";

export interface ITaskRepository {
    create(dto: CreateTaskDto): Promise<Task>;
    findById(id: number): Promise<TaskDto | null>;
    findByProjectId(projectId: number): Promise<TaskDto[]>;
    findAssignedToUser(userId: number): Promise<TaskDto[]>;
    update(id: number, fields: Partial<Task>): Promise<boolean>;
    updateStatus(id: number, status: TaskStatus): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}