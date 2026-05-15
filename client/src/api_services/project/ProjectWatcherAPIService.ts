import axios from "axios";
import type { IProjectWatcherAPIService, ApiResponse } from "./IProjectWatcherAPIService";
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

export const projectWatcherApi: IProjectWatcherAPIService = {
    async getWatching() {
        return axios.get<ApiResponse<ProjectDto[]>>(`${BASE}projects/watching`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to load watched projects"));
    },
    async watch(projectId) {
        return axios.post<ApiResponse<void>>(`${BASE}projects/${projectId}/watch`, {}, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to watch project"));
    },
    async unwatch(projectId) {
        return axios.delete<ApiResponse<void>>(`${BASE}projects/${projectId}/watch`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to unwatch project"));
    },
};