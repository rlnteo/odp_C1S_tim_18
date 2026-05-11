import { IProjectService } from "../../Domain/services/project/IProjectService";
import { IProjectRepository } from "../../Domain/repositories/project/IProjectRepository";
import { ProjectDto } from "../../Domain/DTOs/project/ProjectDto";
import { CreateProjectDto } from "../../Domain/DTOs/project/CreateProjectDto";
import { TagDto } from "../../Domain/DTOs/project/TagDto";

export class ProjectService implements IProjectService {
    public constructor(
        private readonly projectRepo: IProjectRepository,
    ) { }

    async createProject(dto: CreateProjectDto): Promise<ProjectDto | null> {
        const project = await this.projectRepo.create(dto);
        if (project.id === 0) return null;
        return this.projectRepo.findById(project.id, dto.createdBy);
    }

    async getProjectsByTeam(teamId: number, requesterId: number): Promise<ProjectDto[]> {
        return this.projectRepo.findByTeamId(teamId, requesterId);
    }

    async getWatchedProjects(userId: number): Promise<ProjectDto[]> {
        return this.projectRepo.findWatchedByUserId(userId);
    }

    async getProjectById(id: number, requesterId: number): Promise<ProjectDto | null> {
        return this.projectRepo.findById(id, requesterId);
    }

    async updateProject(id: number, fields: Partial<CreateProjectDto>, requesterId: number): Promise<boolean> {
        const isOwner = await this.projectRepo.isOwnerOfTeam(id, requesterId);
        if (!isOwner) return false;
        return this.projectRepo.update(id, fields);
    }

    async deleteProject(id: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.projectRepo.isOwnerOfTeam(id, requesterId);
        if (!isOwner) return false;
        return this.projectRepo.delete(id);
    }

    async getAllTags(): Promise<TagDto[]> {
        return this.projectRepo.getAllTags();
    }

    async addTag(projectId: number, tagId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.projectRepo.isOwnerOfTeam(projectId, requesterId);
        if (!isOwner) return false;
        return this.projectRepo.addTag(projectId, tagId);
    }

    async removeTag(projectId: number, tagId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.projectRepo.isOwnerOfTeam(projectId, requesterId);
        if (!isOwner) return false;
        return this.projectRepo.removeTag(projectId, tagId);
    }

    async watchProject(projectId: number, userId: number): Promise<boolean> {
        const isMember = await this.projectRepo.isMemberOfTeam(projectId, userId);
        if (!isMember) return false;
        return this.projectRepo.watchProject(projectId, userId);
    }

    async unwatchProject(projectId: number, userId: number): Promise<boolean> {
        return this.projectRepo.unwatchProject(projectId, userId);
    }
}