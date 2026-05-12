import { ProjectDto } from "../../DTOs/project/ProjectDto";

export interface IProjectWatcherService {
    getWatchedProjects(userId: number): Promise<ProjectDto[]>;
    watchProject(projectId: number, userId: number): Promise<boolean>;
    unwatchProject(projectId: number, userId: number): Promise<boolean>;
}