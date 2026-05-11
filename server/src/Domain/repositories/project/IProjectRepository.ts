import { Project } from "../../models/Project";
import { ProjectDto } from "../../DTOs/project/ProjectDto";
import { CreateProjectDto } from "../../DTOs/project/CreateProjectDto";
import { TagDto } from "../../DTOs/project/TagDto";

export interface IProjectRepository {
    create(dto: CreateProjectDto): Promise<Project>;
    findById(id: number, requesterId: number): Promise<ProjectDto | null>;
    findByTeamId(teamId: number, requesterId: number): Promise<ProjectDto[]>;
    findWatchedByUserId(userId: number): Promise<ProjectDto[]>;
    update(id: number, fields: Partial<Project>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
    getAllTags(): Promise<TagDto[]>;
    getProjectTags(projectId: number): Promise<TagDto[]>;
    addTag(projectId: number, tagId: number): Promise<boolean>;
    removeTag(projectId: number, tagId: number): Promise<boolean>;
    watchProject(projectId: number, userId: number): Promise<boolean>;
    unwatchProject(projectId: number, userId: number): Promise<boolean>;
    isOwnerOfTeam(projectId: number, userId: number): Promise<boolean>;
    isMemberOfTeam(projectId: number, userId: number): Promise<boolean>;
}