import { useState, useEffect, useCallback } from "react";
import { teamApi } from "../../api_services/team/TeamAPIService";
import type { TeamDto } from "../../models/team/TeamDto";

export function useMyTeams() {
    const [teams, setTeams]     = useState<TeamDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const load = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const res = await teamApi.getMyTeams();
            if (res.success) setTeams(res.data ?? []);
            else setError(res.message);
        } catch {
            setError("Failed to load teams");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return { teams, loading, error, reload: load };
}

export function useTeam(id: number) {
    const [team, setTeam]       = useState<TeamDto>({ id: 0, name: "", description: "", avatarUrl: "", createdBy: 0, createdAt: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true); setError("");
        try {
            const res = await teamApi.getById(id);
            if (res.success && res.data) setTeam(res.data);
            else setError(res.message);
        } catch {
            setError("Failed to load team");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const update = useCallback(async (payload: Partial<TeamDto>) => {
        const res = await teamApi.update(id, payload);
        if (res.success) await load();
        return res.success;
    }, [id, load]);

    const remove = useCallback(async () => {
        const res = await teamApi.delete(id);
        return res.success;
    }, [id]);

    return { team, loading, error, reload: load, update, remove };
}

export function useCreateTeam() {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const create = useCallback(async (payload: { name: string; description: string; avatarUrl: string }): Promise<TeamDto | undefined> => {
        setLoading(true); setError("");
        try {
            const res = await teamApi.create(payload);
            if (!res.success) { setError(res.message); return undefined; }
            return res.data;
        } catch {
            setError("Failed to create team");
            return undefined;
        } finally {
            setLoading(false);
        }
    }, []);

    return { create, loading, error };
}