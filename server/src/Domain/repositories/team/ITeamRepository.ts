import { Team } from "../../models/Team";
import { TeamDto } from "../../DTOs/team/TeamDto";
import { CreateTeamDto } from "../../DTOs/team/CreateTeamDto";

export interface ITeamRepository {
    create(dto: CreateTeamDto): Promise<Team>;
    findById(id: number, requesterId: number): Promise<TeamDto | null>;
    findAll(): Promise<TeamDto[]>;
    findByUserId(userId: number): Promise<TeamDto[]>;
    update(id: number, fields: Partial<Team>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}