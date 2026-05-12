import { ITeamService } from "../../Domain/services/team/ITeamService";
import { ITeamRepository } from "../../Domain/repositories/team/ITeamRepository";
import { ITeamMemberRepository } from "../../Domain/repositories/team/ITeamMemberRepository";
import { ITeamPermissionRepository } from "../../Domain/repositories/team/ITeamPermissionRepository";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { TeamDto } from "../../Domain/DTOs/team/TeamDto";
import { TeamMemberDto } from "../../Domain/DTOs/team/TeamMemberDto";
import { CreateTeamDto } from "../../Domain/DTOs/team/CreateTeamDto";
import { TeamRole } from "../../Domain/enums/TeamRole";

export class TeamService implements ITeamService {
    public constructor(
        private readonly teamRepo: ITeamRepository,
        private readonly memberRepo: ITeamMemberRepository,
        private readonly permRepo: ITeamPermissionRepository,
        private readonly userRepo: IUserRepository,
    ) { }

    async createTeam(dto: CreateTeamDto): Promise<TeamDto | null> {
        const team = await this.teamRepo.create(dto);
        if (team.id === 0) return null;
        return new TeamDto(team.id, team.name, team.description, team.avatarUrl, team.createdBy, team.createdAt, TeamRole.OWNER);
    }

    async getMyTeams(userId: number): Promise<TeamDto[]> {
        return this.teamRepo.findByUserId(userId);
    }

    async getAllTeams(): Promise<TeamDto[]> {
        return this.teamRepo.findAll();
    }

    async getTeamById(id: number, requesterId: number): Promise<TeamDto | null> {
        return this.teamRepo.findById(id, requesterId);
    }

    async updateTeam(id: number, fields: Partial<CreateTeamDto>, requesterId: number): Promise<boolean> {
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
        return this.memberRepo.findMembers(teamId);
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