import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Empty, ErrorBox, Spinner, Card, Button, Input } from "../../components/ui/UI";
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
        if (team) { setName(""); setDesc(""); setShowForm(false); reload(); }
    };

    return (
        <div>
            <PageHeader eyebrow="Teams" title="My Teams"
                action={
                    <Button onClick={() => setShowForm(v => !v)} variant={showForm ? "secondary" : "primary"}>
                        {showForm ? "Cancel" : "+ New Team"}
                    </Button>
                }
            />

            {showForm && (
                <div className="bg-white border border-violet-100 rounded-2xl p-6 mb-6 shadow-sm">
                    <p className="text-sm font-semibold text-slate-600 mb-4">Create a new team</p>
                    <div className="flex flex-col gap-3">
                        <Input value={name} onChange={setName} placeholder="Team name" />
                        <Input value={description} onChange={setDesc} placeholder="Description (optional)" />
                        {createError && <ErrorBox message={createError} />}
                        <div className="flex justify-end">
                            <Button onClick={handleCreate} disabled={creating || !name.trim()}>
                                {creating ? <Spinner size={14} /> : "Create Team"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {error && <ErrorBox message={error} />}
            {loading && <div className="py-16 flex justify-center"><Spinner /></div>}
            {!loading && teams.length === 0 && <Empty message="You're not in any teams yet" />}

            <div className="grid grid-cols-2 gap-4">
                {teams.map(team => (
                    <Card key={team.id} onClick={() => navigate(`/teams/${team.id}`)}>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                                <span className="text-violet-600 font-bold text-lg">{team.name[0]?.toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-base font-bold text-slate-700 truncate">{team.name}</p>
                                <p className="text-xs text-slate-400 truncate">{team.description || "No description"}</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-300 font-mono">
                            Created {new Date(team.createdAt).toLocaleDateString()}
                        </p>
                    </Card>
                ))}
            </div>
        </div>
    );
}
