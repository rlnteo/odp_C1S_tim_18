import { Task } from "../../models/Task";
import { TaskUpdateFieldsDto } from "../../types/TaskUpdateFieldsDto";
import { TaskStatus } from "../../enums/TaskStatus";

export interface ITaskRepository {
    create(task: Task): Promise<Task>;
    findById(id: number): Promise<Task>;
    findByProjectId(projectId: number): Promise<Task[]>;
    findAssignedToUser(userId: number): Promise<Task[]>;
    update(id: number, fields: TaskUpdateFieldsDto): Promise<boolean>;
    updateStatus(id: number, status: TaskStatus): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}