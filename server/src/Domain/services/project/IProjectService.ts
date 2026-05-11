import { ProjectDto } from "../../DTOs/project/ProjectDto";
import { CreateProjectDto } from "../../DTOs/project/CreateProjectDto";
import { TagDto } from "../../DTOs/project/TagDto";

export interface IProjectService {
    createProject(dto: CreateProjectDto): Promise<ProjectDto | null>;
    getProjectsByTeam(teamId: number, requesterId: number): Promise<ProjectDto[]>;
    getWatchedProjects(userId: number): Promise<ProjectDto[]>;
    getProjectById(id: number, requesterId: number): Promise<ProjectDto | null>;
    updateProject(id: number, fields: Partial<CreateProjectDto>, requesterId: number): Promise<boolean>;
    deleteProject(id: number, requesterId: number): Promise<boolean>;
    getAllTags(): Promise<TagDto[]>;
    addTag(projectId: number, tagId: number, requesterId: number): Promise<boolean>;
    removeTag(projectId: number, tagId: number, requesterId: number): Promise<boolean>;
    watchProject(projectId: number, userId: number): Promise<boolean>;
    unwatchProject(projectId: number, userId: number): Promise<boolean>;
}