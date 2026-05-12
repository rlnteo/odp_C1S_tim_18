import { Project } from "../../models/Project";
import { ProjectDto } from "../../DTOs/project/ProjectDto";
import { CreateProjectDto } from "../../DTOs/project/CreateProjectDto";

export interface IProjectRepository {
    create(dto: CreateProjectDto): Promise<Project>;
    findById(id: number, requesterId: number): Promise<ProjectDto | null>;
    findByTeamId(teamId: number, requesterId: number): Promise<ProjectDto[]>;
    findWatchedByUserId(userId: number): Promise<ProjectDto[]>;
    update(id: number, fields: Partial<Project>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}