import { IProjectService } from "../../Domain/services/project/IProjectService";
import { IProjectRepository } from "../../Domain/repositories/project/IProjectRepository";
import { IProjectTagRepository } from "../../Domain/repositories/project/IProjectTagRepository";
import { IProjectWatcherRepository } from "../../Domain/repositories/project/IProjectWatcherRepository";
import { IProjectPermissionRepository } from "../../Domain/repositories/project/IProjectPermissionRepository";
import { ProjectDto } from "../../Domain/DTOs/project/ProjectDto";
import { CreateProjectDto } from "../../Domain/DTOs/project/CreateProjectDto";
import { TagDto } from "../../Domain/DTOs/project/TagDto";

export class ProjectService implements IProjectService {
    public constructor(
        private readonly projectRepo: IProjectRepository,
        private readonly tagRepo: IProjectTagRepository,
        private readonly watcherRepo: IProjectWatcherRepository,
        private readonly permRepo: IProjectPermissionRepository,
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
        const isOwner = await this.permRepo.isOwnerOfTeam(id, requesterId);
        if (!isOwner) return false;
        return this.projectRepo.update(id, fields);
    }

    async deleteProject(id: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(id, requesterId);
        if (!isOwner) return false;
        return this.projectRepo.delete(id);
    }

    async getAllTags(): Promise<TagDto[]> {
        return this.tagRepo.getAllTags();
    }

    async addTag(projectId: number, tagId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(projectId, requesterId);
        if (!isOwner) return false;
        return this.tagRepo.addTag(projectId, tagId);
    }

    async removeTag(projectId: number, tagId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(projectId, requesterId);
        if (!isOwner) return false;
        return this.tagRepo.removeTag(projectId, tagId);
    }

    async watchProject(projectId: number, userId: number): Promise<boolean> {
        const isMember = await this.permRepo.isMemberOfTeam(projectId, userId);
        if (!isMember) return false;
        return this.watcherRepo.watchProject(projectId, userId);
    }

    async unwatchProject(projectId: number, userId: number): Promise<boolean> {
        return this.watcherRepo.unwatchProject(projectId, userId);
    }
}