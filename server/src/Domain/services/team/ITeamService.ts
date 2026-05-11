import { TeamDto } from "../../DTOs/team/TeamDto";
import { TeamMemberDto } from "../../DTOs/team/TeamMemberDto";
import { CreateTeamDto } from "../../DTOs/team/CreateTeamDto";

export interface ITeamService {
    createTeam(dto: CreateTeamDto): Promise<TeamDto | null>;
    getMyTeams(userId: number): Promise<TeamDto[]>;
    getAllTeams(): Promise<TeamDto[]>;
    getTeamById(id: number, requesterId: number): Promise<TeamDto | null>;
    updateTeam(id: number, fields: Partial<CreateTeamDto>, requesterId: number): Promise<boolean>;
    deleteTeam(id: number, requesterId: number): Promise<boolean>;
    getMembers(teamId: number): Promise<TeamMemberDto[]>;
    addMember(teamId: number, username: string, requesterId: number): Promise<boolean>;
    updateMemberRole(teamId: number, userId: number, role: string, requesterId: number): Promise<boolean>;
    removeMember(teamId: number, userId: number, requesterId: number): Promise<boolean>;
    leaveTeam(teamId: number, userId: number): Promise<boolean>;
}