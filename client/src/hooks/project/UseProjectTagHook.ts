import { useState, useEffect, useCallback } from "react";
import { projectTagApi } from "../../api_services/project/ProjectTagAPIService";
import type { TagDto } from "../../models/project/ProjectDto";

export function useProjectTags() {
    const [tags, setTags]       = useState<TagDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const load = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const res = await projectTagApi.getAllTags();
            if (res.success) setTags(res.data ?? []);
            else setError(res.message);
        } catch {
            setError("Failed to load tags");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const addTag = useCallback(async (projectId: number, tagId: number) => {
        const res = await projectTagApi.addTag(projectId, tagId);
        return res.success;
    }, []);

    const removeTag = useCallback(async (projectId: number, tagId: number) => {
        const res = await projectTagApi.removeTag(projectId, tagId);
        return res.success;
    }, []);

    return { tags, loading, error, reload: load, addTag, removeTag };
}