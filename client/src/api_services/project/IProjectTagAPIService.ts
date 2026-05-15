import type { TagDto } from "../../models/project/ProjectDto";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IProjectTagAPIService {
    getAllTags(): Promise<ApiResponse<TagDto[]>>;
    addTag(projectId: number, tagId: number): Promise<ApiResponse<void>>;
    removeTag(projectId: number, tagId: number): Promise<ApiResponse<void>>;
}