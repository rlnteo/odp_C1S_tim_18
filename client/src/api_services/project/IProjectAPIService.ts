import type { ProjectDto } from "../../models/project/ProjectDto";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IProjectAPIService {
    getByTeam(teamId: number): Promise<ApiResponse<ProjectDto[]>>;
    getById(id: number): Promise<ApiResponse<ProjectDto>>;
    create(payload: {
        teamId: number;
        name: string;
        description: string;
        deadline: string;
        status: string;
        priority: string;
    }): Promise<ApiResponse<ProjectDto>>;
    update(id: number, payload: Partial<ProjectDto>): Promise<ApiResponse<void>>;
    delete(id: number): Promise<ApiResponse<void>>;
}