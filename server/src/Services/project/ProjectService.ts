import { IProjectService } from "../../Domain/services/project/IProjectService";
import { IProjectTagService } from "../../Domain/services/project/IProjectTagService";
import { IProjectWatcherService } from "../../Domain/services/project/IProjectWatcherService";
import { IProjectRepository } from "../../Domain/repositories/project/IProjectRepository";
import { IProjectTagRepository } from "../../Domain/repositories/project/IProjectTagRepository";
import { IProjectWatcherRepository } from "../../Domain/repositories/project/IProjectWatcherRepository";
import { IProjectPermissionRepository } from "../../Domain/repositories/project/IProjectPermissionRepository";
import { Project } from "../../Domain/models/Project";
import { Tag } from "../../Domain/models/Tag";
import { ProjectDto } from "../../Domain/DTOs/project/ProjectDto";
import { CreateProjectDto } from "../../Domain/DTOs/project/CreateProjectDto";
import { ProjectUpdateFields } from "../../Domain/types/ProjectUpdateFields";
import { TagDto } from "../../Domain/DTOs/project/TagDto";

export class ProjectService implements IProjectService, IProjectTagService, IProjectWatcherService {
    public constructor(
        private readonly projectRepo: IProjectRepository,
        private readonly tagRepo: IProjectTagRepository,
        private readonly watcherRepo: IProjectWatcherRepository,
        private readonly permRepo: IProjectPermissionRepository,
    ) { }

    private toDto(project: Project): ProjectDto {
        return new ProjectDto(
            project.id, project.teamId, project.name, project.description,
            project.deadline, project.status, project.priority, project.createdBy,
            project.createdAt,
            project.tags.map((t) => new TagDto(t.id, t.name)),
            project.isWatching,
        );
    }

    private tagToDto(tag: Tag): TagDto {
        return new TagDto(tag.id, tag.name);
    }

    async createProject(dto: CreateProjectDto): Promise<ProjectDto | null> {
        const project = new Project(
            0, dto.teamId, dto.name, dto.description,
            dto.deadline, dto.status, dto.priority, dto.createdBy,
        );
        const created = await this.projectRepo.create(project);
        if (created.id === 0) return null;
        const full = await this.projectRepo.findById(created.id, dto.createdBy);
        if (!full) return null;
        return this.toDto(full);
    }

    async getProjectsByTeam(teamId: number, requesterId: number): Promise<ProjectDto[]> {
        const projects = await this.projectRepo.findByTeamId(teamId, requesterId);
        return projects.map((p) => this.toDto(p));
    }

    async getWatchedProjects(userId: number): Promise<ProjectDto[]> {
        const projects = await this.projectRepo.findWatchedByUserId(userId);
        return projects.map((p) => this.toDto(p));
    }

    async getProjectById(id: number, requesterId: number): Promise<ProjectDto | null> {
        const project = await this.projectRepo.findById(id, requesterId);
        if (!project) return null;
        return this.toDto(project);
    }

    async updateProject(id: number, fields: ProjectUpdateFields, requesterId: number): Promise<boolean> {
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
        const tags = await this.tagRepo.getAllTags();
        return tags.map((t) => this.tagToDto(t));
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