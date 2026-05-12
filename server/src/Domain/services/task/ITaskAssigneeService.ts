export interface ITaskAssigneeService {
    assignUser(taskId: number, userId: number, requesterId: number): Promise<boolean>;
    unassignUser(taskId: number, userId: number, requesterId: number): Promise<boolean>;
}