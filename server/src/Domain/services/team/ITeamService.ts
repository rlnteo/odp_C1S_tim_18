import { TeamDto } from "../../DTOs/team/TeamDto";
import { CreateTeamDto } from "../../DTOs/team/CreateTeamDto";
import { TeamUpdateFields } from "../../types/TeamUpdateFields";

export interface ITeamService {
    createTeam(dto: CreateTeamDto): Promise<TeamDto | null>;
    getMyTeams(userId: number): Promise<TeamDto[]>;
    getAllTeams(): Promise<TeamDto[]>;
    getTeamById(id: number, requesterId: number): Promise<TeamDto | null>;
    updateTeam(id: number, fields: TeamUpdateFields, requesterId: number): Promise<boolean>;
    deleteTeam(id: number, requesterId: number): Promise<boolean>;
}