import { ProjectDto } from "../../DTOs/project/ProjectDto";
import { CreateProjectDto } from "../../DTOs/project/CreateProjectDto";
import { ProjectUpdateFieldsDto } from "../../types/ProjectUpdateFieldsDto";

export interface IProjectService {
    createProject(dto: CreateProjectDto): Promise<ProjectDto | null>;
    getProjectsByTeam(teamId: number, requesterId: number): Promise<ProjectDto[]>;
    getProjectById(id: number, requesterId: number): Promise<ProjectDto | null>;
    updateProject(id: number, fields: ProjectUpdateFieldsDto, requesterId: number): Promise<boolean>;
    deleteProject(id: number, requesterId: number): Promise<boolean>;
}