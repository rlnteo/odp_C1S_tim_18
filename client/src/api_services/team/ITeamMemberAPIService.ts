import type { TeamMemberDto } from "../../models/team/TeamDto";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ITeamMemberAPIService {
    getMembers(teamId: number): Promise<ApiResponse<TeamMemberDto[]>>;
    addMember(teamId: number, username: string): Promise<ApiResponse<void>>;
    updateMemberRole(teamId: number, userId: number, role: string): Promise<ApiResponse<void>>;
    removeMember(teamId: number, userId: number): Promise<ApiResponse<void>>;
    leaveTeam(teamId: number): Promise<ApiResponse<void>>;
}