import { TeamMemberDto } from "../../DTOs/team/TeamMemberDto";

export interface ITeamMemberService {
    getMembers(teamId: number): Promise<TeamMemberDto[]>;
    addMember(teamId: number, username: string, requesterId: number): Promise<boolean>;
    updateMemberRole(teamId: number, userId: number, role: string, requesterId: number): Promise<boolean>;
    removeMember(teamId: number, userId: number, requesterId: number): Promise<boolean>;
    leaveTeam(teamId: number, userId: number): Promise<boolean>;
}