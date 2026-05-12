export interface ITeamPermissionRepository {
    isMember(teamId: number, userId: number): Promise<boolean>;
    isOwner(teamId: number, userId: number): Promise<boolean>;
}