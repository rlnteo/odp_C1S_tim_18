import axios from "axios";
import type { ITeamMemberAPIService, ApiResponse } from "./ITeamMemberAPIService";
import type { TeamMemberDto } from "../../models/team/TeamDto";
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

export const teamMemberApi: ITeamMemberAPIService = {
    async getMembers(teamId) {
        return axios.get<ApiResponse<TeamMemberDto[]>>(`${BASE}/${teamId}/members`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to load members"));
    },
    async addMember(teamId, username) {
        return axios.post<ApiResponse<void>>(`${BASE}/${teamId}/members`, { username }, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to add member"));
    },
    async updateMemberRole(teamId, userId, role) {
        return axios.patch<ApiResponse<void>>(`${BASE}/${teamId}/members/${userId}`, { role }, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to update role"));
    },
    async removeMember(teamId, userId) {
        return axios.delete<ApiResponse<void>>(`${BASE}/${teamId}/members/${userId}`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to remove member"));
    },
    async leaveTeam(teamId) {
        return axios.delete<ApiResponse<void>>(`${BASE}/${teamId}/leave`, { headers: authHeader() })
            .then(r => r.data).catch(e => err(e, "Failed to leave team"));
    },
};