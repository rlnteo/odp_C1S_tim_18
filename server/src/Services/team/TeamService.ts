import { ITeamService } from "../../Domain/services/team/ITeamService";
import { ITeamMemberService } from "../../Domain/services/team/ITeamMemberService";
import { ITeamRepository } from "../../Domain/repositories/team/ITeamRepository";
import { ITeamMemberRepository } from "../../Domain/repositories/team/ITeamMemberRepository";
import { ITeamPermissionRepository } from "../../Domain/repositories/team/ITeamPermissionRepository";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { Team } from "../../Domain/models/Team";
import { TeamMember } from "../../Domain/models/TeamMember";
import { TeamDto } from "../../Domain/DTOs/team/TeamDto";
import { TeamMemberDto } from "../../Domain/DTOs/team/TeamMemberDto";
import { CreateTeamDto } from "../../Domain/DTOs/team/CreateTeamDto";
import { TeamUpdateFields } from "../../Domain/types/TeamUpdateFields";
import { TeamRole } from "../../Domain/enums/TeamRole";

export class TeamService implements ITeamService, ITeamMemberService {
    public constructor(
        private readonly teamRepo: ITeamRepository,
        private readonly memberRepo: ITeamMemberRepository,
        private readonly permRepo: ITeamPermissionRepository,
        private readonly userRepo: IUserRepository,
    ) { }

    private toDto(team: Team): TeamDto {
        return new TeamDto(team.id, team.name, team.description, team.avatarUrl, team.createdBy, team.createdAt, team.role);
    }

    private memberToDto(member: TeamMember): TeamMemberDto {
        return new TeamMemberDto(member.userId, member.username, member.role, member.joinedAt);
    }

    async createTeam(dto: CreateTeamDto): Promise<TeamDto | null> {
        const team = new Team(0, dto.name, dto.description, dto.avatarUrl, dto.createdBy);
        const created = await this.teamRepo.create(team);
        if (created.id === 0) return null;
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

    async getTeamById(id: number, requesterId: number): Promise<TeamDto | null> {
        const team = await this.teamRepo.findById(id, requesterId);
        if (!team) return null;
        return this.toDto(team);
    }

    async updateTeam(id: number, fields: TeamUpdateFields, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwner(id, requesterId);
        if (!isOwner) return false;
        return this.teamRepo.update(id, fields);
    }

    async deleteTeam(id: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwner(id, requesterId);
        if (!isOwner) return false;
        return this.teamRepo.delete(id);
    }

    async getMembers(teamId: number): Promise<TeamMemberDto[]> {
        const members = await this.memberRepo.findMembers(teamId);
        return members.map((m) => this.memberToDto(m));
    }

    async addMember(teamId: number, username: string, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwner(teamId, requesterId);
        if (!isOwner) return false;

        const user = await this.userRepo.findByUsername(username);
        if (user.id === 0) return false;

        const alreadyMember = await this.permRepo.isMember(teamId, user.id);
        if (alreadyMember) return false;

        return this.memberRepo.addMember(teamId, user.id, TeamRole.MEMBER);
    }

    async updateMemberRole(teamId: number, userId: number, role: string, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwner(teamId, requesterId);
        if (!isOwner) return false;
        if (userId === requesterId) return false;
        return this.memberRepo.updateMemberRole(teamId, userId, role as TeamRole);
    }

    async removeMember(teamId: number, userId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwner(teamId, requesterId);
        if (!isOwner) return false;
        if (userId === requesterId) return false;
        return this.memberRepo.removeMember(teamId, userId);
    }

    async leaveTeam(teamId: number, userId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwner(teamId, userId);
        if (isOwner) return false;
        return this.memberRepo.removeMember(teamId, userId);
    }
}