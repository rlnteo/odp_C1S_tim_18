import axios from "axios";
import type { IAuditAPIService, ApiResponse } from "./IAuditAPIServices";
import type { PaginatedAuditDto } from "../../models/audit/AuditDto";
import { readItem } from "../../helpers/local_storage";

const BASE = import.meta.env.VITE_API_URL + "audit";

const authHeader = () => {
    const token = readItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
    success: false,
    message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const auditApi: IAuditAPIService = {
    async getLogs(page = 1, limit = 20) {
        return axios.get<ApiResponse<PaginatedAuditDto>>(`${BASE}?page=${page}&limit=${limit}`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to load audit logs"));
    },
};