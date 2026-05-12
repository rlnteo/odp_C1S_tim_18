import { Project } from "../../models/Project";
import { ProjectUpdateFields } from "../../types/ProjectUpdateFields";

export interface IProjectRepository {
    create(project: Project): Promise<Project>;
    findById(id: number, requesterId: number): Promise<Project | null>;
    findByTeamId(teamId: number, requesterId: number): Promise<Project[]>;
    findWatchedByUserId(userId: number): Promise<Project[]>;
    update(id: number, fields: ProjectUpdateFields): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}