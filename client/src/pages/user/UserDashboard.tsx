import { PageHeader, StatCard, Empty, ErrorBox, Spinner, StatusBadge } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { useMyTeams } from "../../hooks/team/UseTeamHook";
import { useMyTasks } from "../../hooks/task/UseTaskHook";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
    const { user } = useAuth();
    const { teams, loading: teamsLoading, error: teamsError } = useMyTeams();
    const { tasks, loading: tasksLoading, error: tasksError } = useMyTasks();
    const navigate = useNavigate();

    const todoCount      = tasks.filter(t => t.status === "todo").length;
    const inProgressCount = tasks.filter(t => t.status === "in_progress").length;
    const doneCount      = tasks.filter(t => t.status === "done").length;

    return (
        <div>
            <PageHeader eyebrow="Overview" title={`Welcome, ${user?.username}`} />

            <div className="grid grid-cols-3 gap-4 mb-8">
                <StatCard label="My Teams"       value={teams.length} />
                <StatCard label="Tasks To Do"    value={todoCount}       color="text-yellow-400" />
                <StatCard label="In Progress"    value={inProgressCount} color="text-sky-400" />
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Teams */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-white/25 font-mono uppercase tracking-widest">My Teams</p>
                        <button onClick={() => navigate("/teams")}
                            className="text-xs text-white/30 hover:text-white/60 transition-colors">
                            View all →
                        </button>
                    </div>
                    {teamsLoading && <div className="py-8 flex justify-center"><Spinner /></div>}
                    {teamsError && <ErrorBox message={teamsError} />}
                    {!teamsLoading && teams.length === 0 && <Empty message="No teams yet" />}
                    <div className="flex flex-col gap-2">
                        {teams.slice(0, 5).map(team => (
                            <div key={team.id}
                                onClick={() => navigate(`/teams/${team.id}`)}
                                className="bg-white/2 border border-white/6 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-white/12 hover:bg-white/4 cursor-pointer transition-all">
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                                    <span className="text-white/40 text-sm font-medium">{team.name[0]?.toUpperCase()}</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-white/80 font-medium truncate">{team.name}</p>
                                    <p className="text-xs text-white/25 truncate">{team.description || "No description"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* My Tasks */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-white/25 font-mono uppercase tracking-widest">My Tasks</p>
                        <span className="text-xs text-white/20 font-mono">{doneCount}/{tasks.length} done</span>
                    </div>
                    {tasksLoading && <div className="py-8 flex justify-center"><Spinner /></div>}
                    {tasksError && <ErrorBox message={tasksError} />}
                    {!tasksLoading && tasks.length === 0 && <Empty message="No tasks assigned" />}
                    <div className="flex flex-col gap-2">
                        {tasks.slice(0, 5).map(task => (
                            <div key={task.id}
                                className="bg-white/2 border border-white/6 rounded-xl px-4 py-3 flex items-center justify-between hover:border-white/12 transition-all">
                                <div className="min-w-0">
                                    <p className="text-sm text-white/80 truncate">{task.title}</p>
                                    <p className="text-xs text-white/25">{task.estimatedHours}h estimated</p>
                                </div>
                                <StatusBadge status={task.status} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
