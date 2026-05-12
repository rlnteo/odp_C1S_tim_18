import { AssigneeDto } from "../../DTOs/task/AssigneeDto";

export interface ITaskAssigneeRepository {
    getAssignees(taskId: number): Promise<AssigneeDto[]>;
    assignUser(taskId: number, userId: number, assignedBy: number): Promise<boolean>;
    unassignUser(taskId: number, userId: number): Promise<boolean>;
    isAssigned(taskId: number, userId: number): Promise<boolean>;
}