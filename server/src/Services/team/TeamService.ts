import { ITeamService } from "../../Domain/services/team/ITeamService";
import { ITeamRepository } from "../../Domain/repositories/team/ITeamRepository";
import { ITeamPermissionRepository } from "../../Domain/repositories/team/ITeamPermissionRepository";
import { Team } from "../../Domain/models/Team";
import { TeamDto } from "../../Domain/DTOs/team/TeamDto";
import { CreateTeamDto } from "../../Domain/DTOs/team/CreateTeamDto";
import { TeamUpdateFieldsDto } from "../../Domain/types/TeamUpdateFieldsDto";
import { TeamRole } from "../../Domain/enums/TeamRole";

export class TeamService implements ITeamService {
    public constructor(
        private readonly teamRepo: ITeamRepository,
        private readonly permRepo: ITeamPermissionRepository,
    ) { }

    private toDto(team: Team): TeamDto {
        return new TeamDto(team.id, team.name, team.description, team.avatarUrl, team.createdBy, team.createdAt, team.role);
    }

    async createTeam(dto: CreateTeamDto): Promise<TeamDto> {
        const team = new Team(0, dto.name, dto.description, dto.avatarUrl, dto.createdBy);
        const created = await this.teamRepo.create(team);
        if (created.id === 0) return new TeamDto();
        return new TeamDto(created.id, created.name, created.description, created.avatarUrl, created.createdBy, created.createdAt, TeamRole.OWNER);
    }

    async getMyTeams(userId: number): Promise<TeamDto[]> {
        const teams = await this.teamRepo.findByUserId(userId);
        return teams.map((t) => this.toDto(t));
    }

    async getAllTeams(): Promise<TeamDto[]> {
        const teams = await this.teamRepo.findAll();
        return teams.map((t) => this.toDto(t));
    }

    async getTeamById(id: number, requesterId: number): Promise<TeamDto> {
        const team = await this.teamRepo.findById(id, requesterId);
        if (!team) return new TeamDto();
        return this.toDto(team);
    }

    async updateTeam(id: number, fields: TeamUpdateFieldsDto, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwner(id, requesterId);
        if (!isOwner) return false;
        return this.teamRepo.update(id, fields);
    }

    async deleteTeam(id: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwner(id, requesterId);
        if (!isOwner) return false;
        return this.teamRepo.delete(id);
    }
}