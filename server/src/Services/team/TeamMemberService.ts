import { ITeamMemberService } from "../../Domain/services/team/ITeamMemberService";
import { ITeamMemberRepository } from "../../Domain/repositories/team/ITeamMemberRepository";
import { ITeamPermissionRepository } from "../../Domain/repositories/team/ITeamPermissionRepository";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { TeamMember } from "../../Domain/models/TeamMember";
import { TeamMemberDto } from "../../Domain/DTOs/team/TeamMemberDto";
import { TeamRole } from "../../Domain/enums/TeamRole";

export class TeamMemberService implements ITeamMemberService {
    public constructor(
        private readonly memberRepo: ITeamMemberRepository,
        private readonly permRepo: ITeamPermissionRepository,
        private readonly userRepo: IUserRepository,
    ) { }

    private toDto(member: TeamMember): TeamMemberDto {
        return new TeamMemberDto(member.userId, member.username, member.role, member.joinedAt);
    }

    async getMembers(teamId: number): Promise<TeamMemberDto[]> {
        const members = await this.memberRepo.findMembers(teamId);
        return members.map((m) => this.toDto(m));
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