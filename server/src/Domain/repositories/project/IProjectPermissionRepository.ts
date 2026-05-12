export interface IProjectPermissionRepository {
    isOwnerOfTeam(projectId: number, userId: number): Promise<boolean>;
    isMemberOfTeam(projectId: number, userId: number): Promise<boolean>;
}