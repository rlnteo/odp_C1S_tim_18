import { IProjectWatcherService } from "../../Domain/services/project/IProjectWatcherService";
import { IProjectWatcherRepository } from "../../Domain/repositories/project/IProjectWatcherRepository";
import { IProjectPermissionRepository } from "../../Domain/repositories/project/IProjectPermissionRepository";
import { IProjectRepository } from "../../Domain/repositories/project/IProjectRepository";
import { Project } from "../../Domain/models/Project";
import { Tag } from "../../Domain/models/Tag";
import { ProjectDto } from "../../Domain/DTOs/project/ProjectDto";
import { TagDto } from "../../Domain/DTOs/project/TagDto";

export class ProjectWatcherService implements IProjectWatcherService {
    public constructor(
        private readonly projectRepo: IProjectRepository,
        private readonly watcherRepo: IProjectWatcherRepository,
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

    async getWatchedProjects(userId: number): Promise<ProjectDto[]> {
        const projects = await this.projectRepo.findWatchedByUserId(userId);
        return projects.map((p) => this.toDto(p));
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