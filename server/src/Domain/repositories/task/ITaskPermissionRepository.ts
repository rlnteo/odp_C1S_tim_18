export interface ITaskPermissionRepository {
    isOwnerOfTeam(taskId: number, userId: number): Promise<boolean>;
    isCreator(taskId: number, userId: number): Promise<boolean>;
}