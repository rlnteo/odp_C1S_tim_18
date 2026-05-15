import type { TeamDto } from "../../models/team/TeamDto";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ITeamAPIService {
    getMyTeams(): Promise<ApiResponse<TeamDto[]>>;
    getAll(): Promise<ApiResponse<TeamDto[]>>;
    getById(id: number): Promise<ApiResponse<TeamDto>>;
    create(payload: { name: string; description: string; avatarUrl: string }): Promise<ApiResponse<TeamDto>>;
    update(id: number, payload: Partial<TeamDto>): Promise<ApiResponse<void>>;
    delete(id: number): Promise<ApiResponse<void>>;
}