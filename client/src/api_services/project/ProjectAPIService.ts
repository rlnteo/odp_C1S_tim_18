import axios from "axios";
import type { IProjectAPIService, ApiResponse } from "./IProjectAPIService";
import type { ProjectDto } from "../../models/project/ProjectDto";
import { readItem } from "../../helpers/local_storage";

const BASE = import.meta.env.VITE_API_URL;

const authHeader = () => {
    const token = readItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
    success: false,
    message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const projectApi: IProjectAPIService = {
    async getByTeam(teamId) {
        return axios.get<ApiResponse<ProjectDto[]>>(`${BASE}teams/${teamId}/projects`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to load projects"));
    },
    async getById(id) {
        return axios.get<ApiResponse<ProjectDto>>(`${BASE}projects/${id}`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to load project"));
    },
    async create(payload) {
        return axios.post<ApiResponse<ProjectDto>>(`${BASE}teams/${payload.teamId}/projects`, payload, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to create project"));
    },
    async update(id, payload) {
        return axios.patch<ApiResponse<void>>(`${BASE}projects/${id}`, payload, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to update project"));
    },
    async delete(id) {
        return axios.delete<ApiResponse<void>>(`${BASE}projects/${id}`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to delete project"));
    },
};