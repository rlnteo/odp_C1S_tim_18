import { Project } from "../../models/Project";
import { ProjectUpdateFieldsDto } from "../../types/ProjectUpdateFieldsDto";

export interface IProjectRepository {
    create(project: Project): Promise<Project>;
    findById(id: number, requesterId: number): Promise<Project | null>;
    findByTeamId(teamId: number, requesterId: number): Promise<Project[]>;
    findWatchedByUserId(userId: number): Promise<Project[]>;
    update(id: number, fields: ProjectUpdateFieldsDto): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}