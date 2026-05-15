import { useState, useEffect, useCallback } from "react";
import { taskApi } from "../../api_services/task/TaskAPIService";
import type { TaskDto } from "../../models/task/TaskDto";

const emptyTask = (): TaskDto => ({
    id: 0, projectId: 0, title: "", description: "",
    priority: "medium", status: "todo", estimatedHours: 0,
    dueDate: "", createdBy: 0, createdAt: "",
    assignees: [], comments: [],
});

export function useTasksByProject(projectId: number) {
    const [tasks, setTasks]     = useState<TaskDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const load = useCallback(async () => {
        if (!projectId) return;
        setLoading(true); setError("");
        try {
            const res = await taskApi.getByProject(projectId);
            if (res.success) setTasks(res.data ?? []);
            else setError(res.message);
        } catch {
            setError("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { load(); }, [load]);

    return { tasks, loading, error, reload: load };
}

export function useMyTasks() {
    const [tasks, setTasks]     = useState<TaskDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const load = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const res = await taskApi.getMyTasks();
            if (res.success) setTasks(res.data ?? []);
            else setError(res.message);
        } catch {
            setError("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return { tasks, loading, error, reload: load };
}

export function useTask(id: number) {
    const [task, setTask]       = useState<TaskDto>(emptyTask());
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true); setError("");
        try {
            const res = await taskApi.getById(id);
            if (res.success && res.data) setTask(res.data);
            else setError(res.message);
        } catch {
            setError("Failed to load task");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const update = useCallback(async (payload: Partial<TaskDto>) => {
        const res = await taskApi.update(id, payload);
        if (res.success) await load();
        return res.success;
    }, [id, load]);

    const updateStatus = useCallback(async (status: string) => {
        const res = await taskApi.updateStatus(id, status);
        if (res.success) await load();
        return res.success;
    }, [id, load]);

    const remove = useCallback(async () => {
        const res = await taskApi.delete(id);
        return res.success;
    }, [id]);

    return { task, loading, error, reload: load, update, updateStatus, remove };
}

export function useCreateTask() {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const create = useCallback(async (payload: {
        projectId: number;
        title: string;
        description: string;
        priority: string;
        status: string;
        estimatedHours: number;
        dueDate?: string;
    }): Promise<TaskDto | undefined> => {
        setLoading(true); setError("");
        try {
            const res = await taskApi.create(payload);
            if (!res.success) { setError(res.message); return undefined; }
            return res.data;
        } catch {
            setError("Failed to create task");
            return undefined;
        } finally {
            setLoading(false);
        }
    }, []);

    return { create, loading, error };
}