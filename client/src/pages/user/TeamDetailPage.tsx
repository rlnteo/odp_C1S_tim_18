import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader, Empty, ErrorBox, Spinner, Card, Button, Input } from "../../components/ui/UI";
import { useTeam } from "../../hooks/team/UseTeamHook";
import { useTeamMembers } from "../../hooks/team/UseTeamMemberHook";
import { useProjectsByTeam, useCreateProject } from "../../hooks/project/UseProjectHook";
import { useAuth } from "../../hooks/auth/useAuthHook";

export default function TeamDetailPage() {
    const { id } = useParams();
    const teamId = Number(id);
    const navigate = useNavigate();
    const { user } = useAuth();

    const { team, loading: teamLoading, error: teamError } = useTeam(teamId);
    const { members, loading: membersLoading, addMember, removeMember, leaveTeam } = useTeamMembers(teamId);
    const { projects, loading: projectsLoading, reload: reloadProjects } = useProjectsByTeam(teamId);
    const { create: createProject, loading: creating, error: createError } = useCreateProject();

    const [tab, setTab]            = useState<"projects" | "members">("projects");
    const [showForm, setShowForm]  = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [addError, setAddError]  = useState("");
    const [projName, setProjName]  = useState("");
    const [projDesc, setProjDesc]  = useState("");
    const [projDeadline, setProjDeadline] = useState("");

    const isOwner = members.find(m => m.userId === user?.id)?.role === "owner";

    const handleAddMember = async () => {
        if (!newUsername.trim()) return;
        const ok = await addMember(newUsername);
        if (ok) { setNewUsername(""); setAddError(""); }
        else setAddError("Could not add member");
    };

    const handleCreateProject = async () => {
        if (!projName.trim() || !projDeadline) return;
        const project = await createProject({
            teamId, name: projName, description: projDesc,
            deadline: projDeadline, status: "planning", priority: "medium",
        });
        if (project) { setProjName(""); setProjDesc(""); setProjDeadline(""); setShowForm(false); reloadProjects(); }
    };

    if (teamLoading) return <div className="py-16 flex justify-center"><Spinner /></div>;
    if (teamError)   return <ErrorBox message={teamError} />;

    return (
        <div>
            <PageHeader eyebrow="Team" title={team.name}
                action={
                    !isOwner && (
                        <Button variant="danger" onClick={async () => { await leaveTeam(); navigate("/teams"); }}>
                            Leave Team
                        </Button>
                    )
                }
            />

            {team.description && <p className="text-sm text-slate-400 mb-6">{team.description}</p>}

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
                {(["projects", "members"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                            tab === t
                                ? "bg-white text-violet-600 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                        }`}>
                        {t}
                    </button>
                ))}
            </div>

            {tab === "projects" && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-slate-600">Projects ({projects.length})</p>
                        {isOwner && (
                            <Button size="sm" variant={showForm ? "secondary" : "primary"} onClick={() => setShowForm(v => !v)}>
                                {showForm ? "Cancel" : "+ New Project"}
                            </Button>
                        )}
                    </div>

                    {showForm && (
                        <div className="bg-white border border-violet-100 rounded-2xl p-5 mb-4 shadow-sm">
                            <div className="flex flex-col gap-3">
                                <Input value={projName} onChange={setProjName} placeholder="Project name" />
                                <Input value={projDesc} onChange={setProjDesc} placeholder="Description (optional)" />
                                <input type="date" value={projDeadline} onChange={e => setProjDeadline(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all" />
                                {createError && <ErrorBox message={createError} />}
                                <div className="flex justify-end">
                                    <Button onClick={handleCreateProject} disabled={creating || !projName.trim() || !projDeadline}>
                                        {creating ? <Spinner size={14} /> : "Create Project"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {projectsLoading && <div className="py-8 flex justify-center"><Spinner /></div>}
                    {!projectsLoading && projects.length === 0 && <Empty message="No projects yet" />}
                    <div className="grid grid-cols-2 gap-3">
                        {projects.map(project => (
                            <Card key={project.id} onClick={() => navigate(`/projects/${project.id}`)}>
                                <div className="flex items-start justify-between mb-2">
                                    <p className="text-sm font-bold text-slate-700">{project.name}</p>
                                    <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${
                                        project.status === "active"    ? "bg-sky-100 text-sky-600 border-sky-200" :
                                        project.status === "completed" ? "bg-emerald-100 text-emerald-600 border-emerald-200" :
                                        project.status === "on_hold"   ? "bg-amber-100 text-amber-600 border-amber-200" :
                                        "bg-violet-100 text-violet-600 border-violet-200"
                                    }`}>{project.status}</span>
                                </div>
                                <p className="text-xs text-slate-400 mb-3">{project.description || "No description"}</p>
                                <p className="text-xs text-slate-300 font-mono">
                                    Due {new Date(project.deadline).toLocaleDateString()}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {tab === "members" && (
                <div>
                    {isOwner && (
                        <div className="flex gap-2 mb-4">
                            <Input value={newUsername} onChange={setNewUsername} placeholder="Add member by username" />
                            <Button onClick={handleAddMember} disabled={!newUsername.trim()}>Add</Button>
                        </div>
                    )}
                    {addError && <ErrorBox message={addError} />}
                    {membersLoading && <div className="py-8 flex justify-center"><Spinner /></div>}
                    {!membersLoading && members.length === 0 && <Empty message="No members" />}
                    <div className="flex flex-col gap-2">
                        {members.map(member => (
                            <Card key={member.userId}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                                            <span className="text-sm text-violet-600 font-semibold">{member.username[0]?.toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">{member.username}</p>
                                            <p className="text-xs text-slate-400">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                                            member.role === "owner"
                                                ? "bg-violet-100 text-violet-600 border-violet-200"
                                                : "bg-slate-100 text-slate-500 border-slate-200"
                                        }`}>{member.role}</span>
                                        {isOwner && member.userId !== user?.id && (
                                            <Button size="sm" variant="danger" onClick={() => removeMember(member.userId)}>
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
