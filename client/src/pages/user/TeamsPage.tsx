import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Empty, ErrorBox, Spinner } from "../../components/ui/UI";
import { useMyTeams, useCreateTeam } from "../../hooks/team/UseTeamHook";

export default function TeamsPage() {
    const navigate = useNavigate();
    const { teams, loading, error, reload } = useMyTeams();
    const { create, loading: creating, error: createError } = useCreateTeam();

    const [showForm, setShowForm] = useState(false);
    const [name, setName]         = useState("");
    const [description, setDesc]  = useState("");

    const handleCreate = async () => {
        if (!name.trim()) return;
        const team = await create({ name, description, avatarUrl: "" });
        if (team) {
            setName(""); setDesc(""); setShowForm(false);
            reload();
        }
    };

    return (
        <div>
            <PageHeader eyebrow="Teams" title="My Teams"
                action={
                    <button onClick={() => setShowForm(v => !v)}
                        className="px-4 py-2 bg-white/8 hover:bg-white/12 border border-white/12 rounded-xl text-sm text-white/70 transition-all">
                        {showForm ? "Cancel" : "+ New Team"}
                    </button>
                }
            />

            {showForm && (
                <div className="bg-white/2 border border-white/8 rounded-2xl p-5 mb-6 flex flex-col gap-3">
                    <p className="text-xs text-white/25 font-mono uppercase tracking-widest mb-1">Create Team</p>
                    <input value={name} onChange={e => setName(e.target.value)}
                        placeholder="Team name"
                        className="bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
                    <input value={description} onChange={e => setDesc(e.target.value)}
                        placeholder="Description (optional)"
                        className="bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
                    {createError && <ErrorBox message={createError} />}
                    <button onClick={handleCreate} disabled={creating || !name.trim()}
                        className="px-4 py-2.5 bg-white/8 hover:bg-white/12 border border-white/12 rounded-xl text-sm text-white/70 disabled:opacity-40 transition-all self-start">
                        {creating ? <Spinner size={14} /> : "Create Team"}
                    </button>
                </div>
            )}

            {error && <ErrorBox message={error} />}
            {loading && <div className="py-16 flex justify-center"><Spinner /></div>}
            {!loading && teams.length === 0 && <Empty message="You're not in any teams yet" />}

            <div className="grid grid-cols-2 gap-4">
                {teams.map(team => (
                    <div key={team.id}
                        onClick={() => navigate(`/teams/${team.id}`)}
                        className="bg-white/2 border border-white/6 rounded-2xl p-5 hover:border-white/12 hover:bg-white/4 cursor-pointer transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                                <span className="text-white/50 font-medium">{team.name[0]?.toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{team.name}</p>
                                <p className="text-xs text-white/25 truncate">{team.description || "No description"}</p>
                            </div>
                        </div>
                        <p className="text-xs text-white/20 font-mono">
                            Created {new Date(team.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
