import axios from "axios";
import type { IProjectTagAPIService, ApiResponse } from "./IProjectTagAPIService";
import type { TagDto } from "../../models/project/ProjectDto";
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

export const projectTagApi: IProjectTagAPIService = {
    async getAllTags() {
        return axios.get<ApiResponse<TagDto[]>>(`${BASE}tags`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to load tags"));
    },
    async addTag(projectId, tagId) {
        return axios.post<ApiResponse<void>>(`${BASE}projects/${projectId}/tags`, { tagId }, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to add tag"));
    },
    async removeTag(projectId, tagId) {
        return axios.delete<ApiResponse<void>>(`${BASE}projects/${projectId}/tags/${tagId}`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to remove tag"));
    },
};