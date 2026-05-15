import axios from "axios";
import type { ITaskCommentAPIService, ApiResponse } from "./ITaskCommentAPIService";
import type { CommentDto } from "../../models/task/TaskDto";
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

export const taskCommentApi: ITaskCommentAPIService = {
    async addComment(taskId, content) {
        return axios.post<ApiResponse<CommentDto>>(`${BASE}tasks/${taskId}/comments`, { content }, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to add comment"));
    },
    async deleteComment(taskId, commentId) {
        return axios.delete<ApiResponse<void>>(`${BASE}tasks/${taskId}/comments/${commentId}`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to delete comment"));
    },
};