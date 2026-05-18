import { PageHeader, StatCard, Empty, ErrorBox, Spinner, StatusBadge, Card } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { useMyTeams } from "../../hooks/team/UseTeamHook";
import { useMyTasks } from "../../hooks/task/UseTaskHook";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
    const { user } = useAuth();
    const { teams, loading: teamsLoading, error: teamsError } = useMyTeams();
    const { tasks, loading: tasksLoading, error: tasksError } = useMyTasks();
    const navigate = useNavigate();

    const todoCount       = tasks.filter(t => t.status === "todo").length;
    const inProgressCount = tasks.filter(t => t.status === "in_progress").length;
    const doneCount       = tasks.filter(t => t.status === "done").length;

    return (
        <div>
            <PageHeader eyebrow="Overview" title={`Welcome back, ${user?.username} 👋`} />

            <div className="grid grid-cols-4 gap-4 mb-8">
                <StatCard label="My Teams"    value={teams.length} />
                <StatCard label="To Do"       value={todoCount}        color="text-amber-500" />
                <StatCard label="In Progress" value={inProgressCount}  color="text-blue-500" />
                <StatCard label="Done"        value={doneCount}        color="text-emerald-500" />
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Teams */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-slate-600">My Teams</p>
                        <button onClick={() => navigate("/teams")}
                            className="text-xs text-violet-500 hover:text-violet-600 font-medium transition-colors">
                            View all →
                        </button>
                    </div>
                    {teamsLoading && <div className="py-8 flex justify-center"><Spinner /></div>}
                    {teamsError && <ErrorBox message={teamsError} />}
                    {!teamsLoading && teams.length === 0 && <Empty message="No teams yet" />}
                    <div className="flex flex-col gap-2">
                        {teams.slice(0, 5).map(team => (
                            <Card key={team.id} onClick={() => navigate(`/teams/${team.id}`)}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                                        <span className="text-violet-600 font-bold text-sm">{team.name[0]?.toUpperCase()}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 truncate">{team.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{team.description || "No description"}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Tasks */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-slate-600">My Tasks</p>
                        <span className="text-xs text-slate-400 font-mono">{doneCount}/{tasks.length} done</span>
                    </div>
                    {tasksLoading && <div className="py-8 flex justify-center"><Spinner /></div>}
                    {tasksError && <ErrorBox message={tasksError} />}
                    {!tasksLoading && tasks.length === 0 && <Empty message="No tasks assigned" />}
                    <div className="flex flex-col gap-2">
                        {tasks.slice(0, 5).map(task => (
                            <Card key={task.id}>
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
                                        <p className="text-xs text-slate-400">{task.estimatedHours}h estimated</p>
                                    </div>
                                    <StatusBadge status={task.status} />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
