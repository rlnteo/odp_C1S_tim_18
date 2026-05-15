import type { ProjectDto } from "../../models/project/ProjectDto";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IProjectWatcherAPIService {
    getWatching(): Promise<ApiResponse<ProjectDto[]>>;
    watch(projectId: number): Promise<ApiResponse<void>>;
    unwatch(projectId: number): Promise<ApiResponse<void>>;
}