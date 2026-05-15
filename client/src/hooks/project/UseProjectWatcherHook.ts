import { useState, useEffect, useCallback } from "react";
import { projectWatcherApi } from "../../api_services/project/ProjectWatcherAPIService";
import type { ProjectDto } from "../../models/project/ProjectDto";

export function useWatchedProjects() {
    const [projects, setProjects] = useState<ProjectDto[]>([]);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");

    const load = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const res = await projectWatcherApi.getWatching();
            if (res.success) setProjects(res.data ?? []);
            else setError(res.message);
        } catch {
            setError("Failed to load watched projects");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const watch = useCallback(async (projectId: number) => {
        const res = await projectWatcherApi.watch(projectId);
        if (res.success) await load();
        return res.success;
    }, [load]);

    const unwatch = useCallback(async (projectId: number) => {
        const res = await projectWatcherApi.unwatch(projectId);
        if (res.success) await load();
        return res.success;
    }, [load]);

    return { projects, loading, error, reload: load, watch, unwatch };
}