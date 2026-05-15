import { useState, useEffect, useCallback } from "react";
import { projectApi } from "../../api_services/project/ProjectAPIService";
import type { ProjectDto } from "../../models/project/ProjectDto";

const emptyProject = (): ProjectDto => ({
    id: 0, teamId: 0, name: "", description: "",
    deadline: "", status: "planning", priority: "medium",
    createdBy: 0, createdAt: "", tags: [],
});

export function useProjectsByTeam(teamId: number) {
    const [projects, setProjects] = useState<ProjectDto[]>([]);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");

    const load = useCallback(async () => {
        if (!teamId) return;
        setLoading(true); setError("");
        try {
            const res = await projectApi.getByTeam(teamId);
            if (res.success) setProjects(res.data ?? []);
            else setError(res.message);
        } catch {
            setError("Failed to load projects");
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => { load(); }, [load]);

    return { projects, loading, error, reload: load };
}

export function useProject(id: number) {
    const [project, setProject] = useState<ProjectDto>(emptyProject());
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true); setError("");
        try {
            const res = await projectApi.getById(id);
            if (res.success && res.data) setProject(res.data);
            else setError(res.message);
        } catch {
            setError("Failed to load project");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const update = useCallback(async (payload: Partial<ProjectDto>) => {
        const res = await projectApi.update(id, payload);
        if (res.success) await load();
        return res.success;
    }, [id, load]);

    const remove = useCallback(async () => {
        const res = await projectApi.delete(id);
        return res.success;
    }, [id]);

    return { project, loading, error, reload: load, update, remove };
}

export function useCreateProject() {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const create = useCallback(async (payload: {
        teamId: number;
        name: string;
        description: string;
        deadline: string;
        status: string;
        priority: string;
    }): Promise<ProjectDto | undefined> => {
        setLoading(true); setError("");
        try {
            const res = await projectApi.create(payload);
            if (!res.success) { setError(res.message); return undefined; }
            return res.data;
        } catch {
            setError("Failed to create project");
            return undefined;
        } finally {
            setLoading(false);
        }
    }, []);

    return { create, loading, error };
}