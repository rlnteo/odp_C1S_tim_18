import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader, Empty, ErrorBox, Spinner, StatusBadge, PriorityBadge, Button, Input } from "../../components/ui/UI";
import { useProject } from "../../hooks/project/UseProjectHook";
import { useTasksByProject, useCreateTask, useTask } from "../../hooks/task/UseTaskHook";
import { useTaskComments } from "../../hooks/task/UseTaskCommentHook";
import { useTaskAssignee } from "../../hooks/task/UseTaskAssigneeHook";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { TaskDto } from "../../models/task/TaskDto";

export default function ProjectDetailPage() {
    const { id } = useParams();
    const projectId = Number(id);
    const { user } = useAuth();
    const navigate = useNavigate();

    const { project, loading: projLoading, error: projError, remove: removeProject } = useProject(projectId);
    const { tasks, loading: tasksLoading, reload: reloadTasks } = useTasksByProject(projectId);
    const { create: createTask, loading: creating, error: createError } = useCreateTask();

    const [selectedTask, setSelectedTask] = useState<TaskDto | undefined>(undefined);
    const [showForm, setShowForm]         = useState(false);
    const [comment, setComment]           = useState("");
    const [title, setTitle]               = useState("");
    const [desc, setDesc]                 = useState("");
    const [hours, setHours]               = useState("1");
    const [priority, setPriority]         = useState("medium");
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { addComment, deleteComment } = useTaskComments(selectedTask?.id ?? 0, reloadTasks);
    const { assignUser } = useTaskAssignee(selectedTask?.id ?? 0, reloadTasks);
    const { remove: removeTask } = useTask(selectedTask?.id ?? 0);

    const handleCreateTask = async () => {
        if (!title.trim()) return;
        const task = await createTask({
            projectId, title, description: desc,
            priority, status: "todo",
            estimatedHours: Number(hours),
        });
        if (task) { setTitle(""); setDesc(""); setHours("1"); setShowForm(false); reloadTasks(); }
    };

    const handleAddComment = async () => {
        if (!comment.trim() || !selectedTask) return;
        await addComment(comment);
        setComment("");
    };

    const handleDeleteProject = async () => {
        const ok = await removeProject();
        if (ok) navigate("/teams");
    };

    const handleDeleteTask = async () => {
        const ok = await removeTask();
        if (ok) { setSelectedTask(undefined); reloadTasks(); }
    };

    if (projLoading) return <div className="py-16 flex justify-center"><Spinner /></div>;
    if (projError)   return <ErrorBox message={projError} />;

    return (
        <div>
            <PageHeader eyebrow="Project" title={project.name}
                action={
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                            project.status === "active"    ? "bg-sky-100 text-sky-600 border-sky-200" :
                            project.status === "completed" ? "bg-emerald-100 text-emerald-600 border-emerald-200" :
                            project.status === "on_hold"   ? "bg-amber-100 text-amber-600 border-amber-200" :
                            "bg-violet-100 text-violet-600 border-violet-200"
                        }`}>{project.status}</span>
                        <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2.5 py-1 rounded-lg">
                            Due {new Date(project.deadline).toLocaleDateString()}
                        </span>
                        {!confirmDelete ? (
                            <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
                                Delete Project
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Are you sure?</span>
                                <Button size="sm" variant="danger" onClick={handleDeleteProject}>Yes, delete</Button>
                                <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                            </div>
                        )}
                    </div>
                }
            />

            {project.description && <p className="text-sm text-slate-400 mb-6">{project.description}</p>}

            <div className="grid grid-cols-3 gap-6">
                {/* Task list */}
                <div className="col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-slate-600">Tasks ({tasks.length})</p>
                        <Button size="sm" variant={showForm ? "secondary" : "primary"} onClick={() => setShowForm(v => !v)}>
                            {showForm ? "Cancel" : "+ New Task"}
                        </Button>
                    </div>

                    {showForm && (
                        <div className="bg-white border border-violet-100 rounded-2xl p-5 mb-4 shadow-sm">
                            <div className="flex flex-col gap-3">
                                <Input value={title} onChange={setTitle} placeholder="Task title" />
                                <Input value={desc} onChange={setDesc} placeholder="Description (optional)" />
                                <div className="flex gap-2">
                                    <input type="number" value={hours} onChange={e => setHours(e.target.value)} min="1"
                                        placeholder="Hours"
                                        className="w-24 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50" />
                                    <select value={priority} onChange={e => setPriority(e.target.value)}
                                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                {createError && <ErrorBox message={createError} />}
                                <div className="flex justify-end">
                                    <Button onClick={handleCreateTask} disabled={creating || !title.trim()}>
                                        {creating ? <Spinner size={14} /> : "Create Task"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {tasksLoading && <div className="py-8 flex justify-center"><Spinner /></div>}
                    {!tasksLoading && tasks.length === 0 && <Empty message="No tasks yet" />}
                    <div className="flex flex-col gap-2">
                        {tasks.map(task => (
                            <div key={task.id}
                                onClick={() => setSelectedTask(selectedTask?.id === task.id ? undefined : task)}
                                className={`bg-white border rounded-2xl px-5 py-4 cursor-pointer transition-all ${
                                    selectedTask?.id === task.id
                                        ? "border-violet-200 shadow-sm ring-1 ring-violet-100"
                                        : "border-slate-100 hover:border-violet-100 hover:shadow-sm"
                                }`}>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-700">{task.title}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400 font-mono">{task.estimatedHours}h</span>
                                        <PriorityBadge priority={task.priority} />
                                        <StatusBadge status={task.status} />
                                    </div>
                                </div>
                                {task.assignees.length > 0 && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        👤 {task.assignees.map(a => a.username).join(", ")}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Task detail panel */}
                <div>
                    {selectedTask ? (
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm sticky top-0">
                            <div className="flex items-start justify-between mb-1">
                                <p className="text-base font-bold text-slate-700">{selectedTask.title}</p>
                                <button onClick={handleDeleteTask}
                                    className="text-xs text-rose-400 hover:text-rose-500 transition-colors ml-2 shrink-0">
                                    Delete
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mb-4">{selectedTask.description || "No description"}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <StatusBadge status={selectedTask.status} />
                                <PriorityBadge priority={selectedTask.priority} />
                            </div>

                            <button onClick={() => assignUser(user?.id ?? 0)}
                                className="text-xs text-violet-500 hover:text-violet-600 font-medium transition-colors mb-5 block">
                                + Assign myself
                            </button>

                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Comments</p>
                            <div className="flex flex-col gap-2 mb-3 max-h-48 overflow-y-auto">
                                {selectedTask.comments.length === 0 && (
                                    <p className="text-xs text-slate-300">No comments yet</p>
                                )}
                                {selectedTask.comments.map(c => (
                                    <div key={c.id} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold text-slate-600">{c.username}</span>
                                            {c.userId === user?.id && (
                                                <button onClick={() => deleteComment(c.id)}
                                                    className="text-xs text-rose-400 hover:text-rose-500 transition-colors">×</button>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500">{c.content}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input value={comment} onChange={setComment} placeholder="Write a comment..." />
                                <Button size="sm" onClick={handleAddComment} disabled={!comment.trim()}>Send</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center min-h-40 text-center">
                            <p className="text-2xl mb-2">👆</p>
                            <p className="text-xs text-slate-400">Select a task to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
