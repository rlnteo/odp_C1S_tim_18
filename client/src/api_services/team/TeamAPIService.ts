import axios from "axios";
import type { ITeamAPIService, ApiResponse } from "./ITeamAPIService";
import type { TeamDto } from "../../models/team/TeamDto";
import { readItem } from "../../helpers/local_storage";

const BASE = import.meta.env.VITE_API_URL + "teams";

const authHeader = () => {
    const token = readItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
    success: false,
    message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const teamApi: ITeamAPIService = {
    async getMyTeams() {
        return axios.get<ApiResponse<TeamDto[]>>(`${BASE}/my`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to load teams"));
    },
    async getAll() {
        return axios.get<ApiResponse<TeamDto[]>>(BASE, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to load teams"));
    },
    async getById(id) {
        return axios.get<ApiResponse<TeamDto>>(`${BASE}/${id}`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to load team"));
    },
    async create(payload) {
        return axios.post<ApiResponse<TeamDto>>(BASE, payload, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to create team"));
    },
    async update(id, payload) {
        return axios.patch<ApiResponse<void>>(`${BASE}/${id}`, payload, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to update team"));
    },
    async delete(id) {
        return axios.delete<ApiResponse<void>>(`${BASE}/${id}`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to delete team"));
    },
};