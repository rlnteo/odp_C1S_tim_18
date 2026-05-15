import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader, Empty, ErrorBox, Spinner, StatusBadge } from "../../components/ui/UI";
import { useProject } from "../../hooks/project/UseProjectHook";
import { useTasksByProject, useCreateTask } from "../../hooks/task/UseTaskHook";
import { useTaskComments } from "../../hooks/task/UseTaskCommentHook";
import { useTaskAssignee } from "../../hooks/task/UseTaskAssigneeHook";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { TaskDto } from "../../models/task/TaskDto";

export default function ProjectDetailPage() {
    const { id } = useParams();
    const projectId = Number(id);
    const { user } = useAuth();

    const { project, loading: projLoading, error: projError } = useProject(projectId);
    const { tasks, loading: tasksLoading, reload: reloadTasks } = useTasksByProject(projectId);
    const { create: createTask, loading: creating, error: createError } = useCreateTask();

    const [selectedTask, setSelectedTask] = useState<TaskDto | undefined>(undefined);
    const [showForm, setShowForm]         = useState(false);
    const [comment, setComment]           = useState("");

    const [title, setTitle]               = useState("");
    const [desc, setDesc]                 = useState("");
    const [hours, setHours]               = useState("1");
    const [priority, setPriority]         = useState("medium");

    const { addComment, deleteComment } = useTaskComments(
        selectedTask?.id ?? 0,
        reloadTasks,
    );
    const { assignUser } = useTaskAssignee(selectedTask?.id ?? 0, reloadTasks);

    const handleCreateTask = async () => {
        if (!title.trim()) return;
        const task = await createTask({
            projectId, title, description: desc,
            priority, status: "todo",
            estimatedHours: Number(hours),
        });
        if (task) {
            setTitle(""); setDesc(""); setHours("1");
            setShowForm(false); reloadTasks();
        }
    };

    const handleAddComment = async () => {
        if (!comment.trim() || !selectedTask) return;
        await addComment(comment);
        setComment("");
    };

    if (projLoading) return <div className="py-16 flex justify-center"><Spinner /></div>;
    if (projError)   return <ErrorBox message={projError} />;

    return (
        <div>
            <PageHeader eyebrow="Project" title={project.name}
                action={
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-lg border ${
                            project.status === "active"    ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                            project.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            project.status === "on_hold"   ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                            "bg-white/5 text-white/30 border-white/10"
                        }`}>{project.status}</span>
                        <span className="text-xs text-white/20 font-mono">
                            Due {new Date(project.deadline).toLocaleDateString()}
                        </span>
                    </div>
                }
            />

            {project.description && <p className="text-sm text-white/30 mb-6">{project.description}</p>}

            <div className="grid grid-cols-3 gap-6">
                {/* Task list */}
                <div className="col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-white/25 font-mono uppercase tracking-widest">Tasks</p>
                        <button onClick={() => setShowForm(v => !v)}
                            className="text-xs text-white/30 hover:text-white/60 transition-colors">
                            {showForm ? "Cancel" : "+ New Task"}
                        </button>
                    </div>

                    {showForm && (
                        <div className="bg-white/2 border border-white/8 rounded-2xl p-4 mb-4 flex flex-col gap-3">
                            <input value={title} onChange={e => setTitle(e.target.value)}
                                placeholder="Task title"
                                className="bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
                            <input value={desc} onChange={e => setDesc(e.target.value)}
                                placeholder="Description (optional)"
                                className="bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
                            <div className="flex gap-2">
                                <input type="number" value={hours} onChange={e => setHours(e.target.value)}
                                    min="1" placeholder="Hours"
                                    className="w-24 bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/20" />
                                <select value={priority} onChange={e => setPriority(e.target.value)}
                                    className="bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/20">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            {createError && <ErrorBox message={createError} />}
                            <button onClick={handleCreateTask} disabled={creating || !title.trim()}
                                className="px-4 py-2.5 bg-white/8 hover:bg-white/12 border border-white/12 rounded-xl text-sm text-white/70 disabled:opacity-40 transition-all self-start">
                                {creating ? <Spinner size={14} /> : "Create Task"}
                            </button>
                        </div>
                    )}

                    {tasksLoading && <div className="py-8 flex justify-center"><Spinner /></div>}
                    {!tasksLoading && tasks.length === 0 && <Empty message="No tasks yet" />}
                    <div className="flex flex-col gap-2">
                        {tasks.map(task => (
                            <div key={task.id}
                                onClick={() => setSelectedTask(selectedTask?.id === task.id ? undefined : task)}
                                className={`bg-white/2 border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                                    selectedTask?.id === task.id
                                        ? "border-white/20 bg-white/4"
                                        : "border-white/6 hover:border-white/12 hover:bg-white/3"
                                }`}>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-white/80">{task.title}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-white/20">{task.estimatedHours}h</span>
                                        <StatusBadge status={task.status} />
                                    </div>
                                </div>
                                {task.assignees.length > 0 && (
                                    <p className="text-xs text-white/25 mt-1">
                                        Assigned: {task.assignees.map(a => a.username).join(", ")}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Task detail panel */}
                <div>
                    {selectedTask ? (
                        <div className="bg-white/2 border border-white/6 rounded-2xl p-4 sticky top-0">
                            <p className="text-sm font-medium text-white/80 mb-1">{selectedTask.title}</p>
                            <p className="text-xs text-white/30 mb-4">{selectedTask.description || "No description"}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <StatusBadge status={selectedTask.status} />
                                <span className="text-xs px-2 py-1 rounded-lg border bg-white/5 text-white/30 border-white/10">
                                    {selectedTask.priority}
                                </span>
                            </div>

                            {/* Assign self */}
                            <button onClick={() => assignUser(user?.id ?? 0)}
                                className="text-xs text-white/30 hover:text-white/60 transition-colors mb-4 block">
                                + Assign myself
                            </button>

                            {/* Comments */}
                            <p className="text-xs text-white/25 font-mono uppercase tracking-widest mb-2">Comments</p>
                            <div className="flex flex-col gap-2 mb-3 max-h-48 overflow-y-auto">
                                {selectedTask.comments.length === 0 && (
                                    <p className="text-xs text-white/20">No comments yet</p>
                                )}
                                {selectedTask.comments.map(c => (
                                    <div key={c.id} className="bg-white/3 rounded-lg px-3 py-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-white/40 font-medium">{c.username}</span>
                                            {c.userId === user?.id && (
                                                <button onClick={() => deleteComment(c.id)}
                                                    className="text-xs text-red-400/30 hover:text-red-400 transition-colors">×</button>
                                            )}
                                        </div>
                                        <p className="text-xs text-white/60">{c.content}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input value={comment} onChange={e => setComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="flex-1 bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20" />
                                <button onClick={handleAddComment} disabled={!comment.trim()}
                                    className="px-3 py-2 bg-white/8 hover:bg-white/12 border border-white/12 rounded-lg text-xs text-white/60 disabled:opacity-40 transition-all">
                                    Send
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/2 border border-white/6 rounded-2xl p-4 flex items-center justify-center min-h-32">
                            <p className="text-xs text-white/20">Select a task to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
