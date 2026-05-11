import { Team } from "../../models/Team";
import { TeamDto } from "../../DTOs/team/TeamDto";
import { TeamMemberDto } from "../../DTOs/team/TeamMemberDto";
import { CreateTeamDto } from "../../DTOs/team/CreateTeamDto";
import { TeamRole } from "../../enums/TeamRole";

export interface ITeamRepository {
    create(dto: CreateTeamDto): Promise<Team>;
    findById(id: number, requesterId: number): Promise<TeamDto | null>;
    findAll(): Promise<TeamDto[]>;
    findByUserId(userId: number): Promise<TeamDto[]>;
    update(id: number, fields: Partial<Team>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
    findMembers(teamId: number): Promise<TeamMemberDto[]>;
    addMember(teamId: number, userId: number, role: TeamRole): Promise<boolean>;
    updateMemberRole(teamId: number, userId: number, role: TeamRole): Promise<boolean>;
    removeMember(teamId: number, userId: number): Promise<boolean>;
    isMember(teamId: number, userId: number): Promise<boolean>;
    isOwner(teamId: number, userId: number): Promise<boolean>;
}