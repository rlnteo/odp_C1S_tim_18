import { useState, useCallback } from "react";
import { taskCommentApi } from "../../api_services/task/TaskCommentAPIService";
import type { CommentDto } from "../../models/task/TaskDto";

const emptyComment = (): CommentDto => ({
    id: 0, userId: 0, username: "", content: "", createdAt: "",
});

export function useTaskComments(taskId: number, onSuccess?: () => void) {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const addComment = useCallback(async (content: string): Promise<CommentDto> => {
        setLoading(true); setError("");
        try {
            const res = await taskCommentApi.addComment(taskId, content);
            if (!res.success) { setError(res.message); return emptyComment(); }
            if (onSuccess) onSuccess();
            return res.data ?? emptyComment();
        } catch {
            setError("Failed to add comment");
            return emptyComment();
        } finally {
            setLoading(false);
        }
    }, [taskId, onSuccess]);

    const deleteComment = useCallback(async (commentId: number) => {
        const res = await taskCommentApi.deleteComment(taskId, commentId);
        if (res.success && onSuccess) onSuccess();
        return res.success;
    }, [taskId, onSuccess]);

    return { loading, error, addComment, deleteComment };
}