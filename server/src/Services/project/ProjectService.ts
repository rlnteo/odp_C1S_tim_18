import { IProjectService } from "../../Domain/services/project/IProjectService";
import { IProjectRepository } from "../../Domain/repositories/project/IProjectRepository";
import { IProjectPermissionRepository } from "../../Domain/repositories/project/IProjectPermissionRepository";
import { Project } from "../../Domain/models/Project";
import { Tag } from "../../Domain/models/Tag";
import { ProjectDto } from "../../Domain/DTOs/project/ProjectDto";
import { TagDto } from "../../Domain/DTOs/project/TagDto";
import { CreateProjectDto } from "../../Domain/DTOs/project/CreateProjectDto";
import { ProjectUpdateFieldsDto } from "../../Domain/types/ProjectUpdateFieldsDto";

export class ProjectService implements IProjectService {
    public constructor(
        private readonly projectRepo: IProjectRepository,
        private readonly permRepo: IProjectPermissionRepository,
    ) { }

    private toDto(project: Project): ProjectDto {
        return new ProjectDto(
            project.id, project.teamId, project.name, project.description,
            project.deadline, project.status, project.priority, project.createdBy,
            project.createdAt,
            project.tags.map((t: Tag) => new TagDto(t.id, t.name)),
            project.isWatching,
        );
    }

    async createProject(dto: CreateProjectDto): Promise<ProjectDto> {
        const project = new Project(
            0, dto.teamId, dto.name, dto.description,
            dto.deadline, dto.status, dto.priority, dto.createdBy,
        );
        const created = await this.projectRepo.create(project);
        if (created.id === 0) return new ProjectDto();
        const full = await this.projectRepo.findById(created.id, dto.createdBy);
        if (!full) return new ProjectDto();
        return this.toDto(full);
    }

    async getProjectsByTeam(teamId: number, requesterId: number): Promise<ProjectDto[]> {
        const projects = await this.projectRepo.findByTeamId(teamId, requesterId);
        return projects.map((p) => this.toDto(p));
    }

    async getProjectById(id: number, requesterId: number): Promise<ProjectDto> {
        const project = await this.projectRepo.findById(id, requesterId);
        if (!project) return new ProjectDto();
        return this.toDto(project);
    }

    async updateProject(id: number, fields: ProjectUpdateFieldsDto, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(id, requesterId);
        if (!isOwner) return false;
        return this.projectRepo.update(id, fields);
    }

    async deleteProject(id: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(id, requesterId);
        if (!isOwner) return false;
        return this.projectRepo.delete(id);
    }
}