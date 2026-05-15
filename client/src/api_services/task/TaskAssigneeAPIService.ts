import axios from "axios";
import type { ITaskAssigneeAPIService, ApiResponse } from "./ITaskAssigneeAPIService";
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

export const taskAssigneeApi: ITaskAssigneeAPIService = {
    async assignUser(taskId, userId) {
        return axios.post<ApiResponse<void>>(`${BASE}tasks/${taskId}/assignees`, { userId }, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to assign user"));
    },
    async unassignUser(taskId, userId) {
        return axios.delete<ApiResponse<void>>(`${BASE}tasks/${taskId}/assignees/${userId}`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to unassign user"));
    },
};