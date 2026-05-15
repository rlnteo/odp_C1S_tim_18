import axios from "axios";
import type { IHealthAPIService, ApiResponse } from "./IHealthAPIService";
import type { HealthStatusDto, StatisticsDto } from "../../models/health/HealthDto";
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

export const healthApi: IHealthAPIService = {
    async getHealth() {
        return axios.get<ApiResponse<HealthStatusDto>>(`${BASE}health`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to load health status"));
    },
    async getStatistics() {
        return axios.get<ApiResponse<StatisticsDto>>(`${BASE}statistics`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to load statistics"));
    },
};