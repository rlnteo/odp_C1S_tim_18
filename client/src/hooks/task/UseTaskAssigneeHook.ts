import { useCallback } from "react";
import { taskAssigneeApi } from "../../api_services/task/TaskAssigneeAPIService";

export function useTaskAssignee(taskId: number, onSuccess?: () => void) {
    const assignUser = useCallback(async (userId: number) => {
        const res = await taskAssigneeApi.assignUser(taskId, userId);
        if (res.success && onSuccess) onSuccess();
        return res.success;
    }, [taskId, onSuccess]);

    const unassignUser = useCallback(async (userId: number) => {
        const res = await taskAssigneeApi.unassignUser(taskId, userId);
        if (res.success && onSuccess) onSuccess();
        return res.success;
    }, [taskId, onSuccess]);

    return { assignUser, unassignUser };
}