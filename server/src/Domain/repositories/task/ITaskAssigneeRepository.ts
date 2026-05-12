import { Assignee } from "../../models/Assignee";

export interface ITaskAssigneeRepository {
    getAssignees(taskId: number): Promise<Assignee[]>;
    assignUser(taskId: number, userId: number, assignedBy: number): Promise<boolean>;
    unassignUser(taskId: number, userId: number): Promise<boolean>;
    isAssigned(taskId: number, userId: number): Promise<boolean>;
}