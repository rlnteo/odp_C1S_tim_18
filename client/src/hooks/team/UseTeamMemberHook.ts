import { useState, useEffect, useCallback } from "react";
import { teamMemberApi } from "../../api_services/team/TeamMemberAPIService";
import type { TeamMemberDto } from "../../models/team/TeamDto";

export function useTeamMembers(teamId: number) {
    const [members, setMembers] = useState<TeamMemberDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const load = useCallback(async () => {
        if (!teamId) return;
        setLoading(true); setError("");
        try {
            const res = await teamMemberApi.getMembers(teamId);
            if (res.success) setMembers(res.data ?? []);
            else setError(res.message);
        } catch {
            setError("Failed to load members");
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => { load(); }, [load]);

    const addMember = useCallback(async (username: string) => {
        const res = await teamMemberApi.addMember(teamId, username);
        if (res.success) await load();
        return res.success;
    }, [teamId, load]);

    const updateRole = useCallback(async (userId: number, role: string) => {
        const res = await teamMemberApi.updateMemberRole(teamId, userId, role);
        if (res.success) await load();
        return res.success;
    }, [teamId, load]);

    const removeMember = useCallback(async (userId: number) => {
        const res = await teamMemberApi.removeMember(teamId, userId);
        if (res.success) await load();
        return res.success;
    }, [teamId, load]);

    const leaveTeam = useCallback(async () => {
        const res = await teamMemberApi.leaveTeam(teamId);
        return res.success;
    }, [teamId]);

    return { members, loading, error, reload: load, addMember, updateRole, removeMember, leaveTeam };
}