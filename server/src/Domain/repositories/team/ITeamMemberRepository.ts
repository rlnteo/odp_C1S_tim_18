import { TeamMemberDto } from "../../DTOs/team/TeamMemberDto";
import { TeamRole } from "../../enums/TeamRole";

export interface ITeamMemberRepository {
    findMembers(teamId: number): Promise<TeamMemberDto[]>;
    addMember(teamId: number, userId: number, role: TeamRole): Promise<boolean>;
    updateMemberRole(teamId: number, userId: number, role: TeamRole): Promise<boolean>;
    removeMember(teamId: number, userId: number): Promise<boolean>;
}