import axios from "axios";
import type { ITaskAPIService, ApiResponse } from "./ITaskAPIService";
import type { TaskDto } from "../../models/task/TaskDto";
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

export const taskApi: ITaskAPIService = {
    async getByProject(projectId) {
        return axios.get<ApiResponse<TaskDto[]>>(`${BASE}projects/${projectId}/tasks`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to load tasks"));
    },
    async getMyTasks() {
        return axios.get<ApiResponse<TaskDto[]>>(`${BASE}tasks/my`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to load tasks"));
    },
    async getById(id) {
        return axios.get<ApiResponse<TaskDto>>(`${BASE}tasks/${id}`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to load task"));
    },
    async create(payload) {
        return axios.post<ApiResponse<TaskDto>>(`${BASE}projects/${payload.projectId}/tasks`, payload, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to create task"));
    },
    async update(id, payload) {
        return axios.patch<ApiResponse<void>>(`${BASE}tasks/${id}`, payload, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to update task"));
    },
    async updateStatus(id, status) {
        return axios.patch<ApiResponse<void>>(`${BASE}tasks/${id}/status`, { status }, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to update status"));
    },
    async delete(id) {
        return axios.delete<ApiResponse<void>>(`${BASE}tasks/${id}`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to delete task"));
    },
};