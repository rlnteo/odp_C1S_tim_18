import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader, Empty, ErrorBox, Spinner } from "../../components/ui/UI";
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
        if (project) {
            setProjName(""); setProjDesc(""); setProjDeadline("");
            setShowForm(false); reloadProjects();
        }
    };

    if (teamLoading) return <div className="py-16 flex justify-center"><Spinner /></div>;
    if (teamError)   return <ErrorBox message={teamError} />;

    return (
        <div>
            <PageHeader eyebrow="Team" title={team.name}
                action={
                    !isOwner && (
                        <button onClick={async () => { await leaveTeam(); navigate("/teams"); }}
                            className="px-4 py-2 border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 rounded-xl text-sm transition-all">
                            Leave Team
                        </button>
                    )
                }
            />

            {team.description && <p className="text-sm text-white/30 mb-6">{team.description}</p>}

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-white/3 border border-white/6 rounded-xl p-1 w-fit">
                {(["projects", "members"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-lg text-sm transition-all capitalize ${
                            tab === t ? "bg-white/8 text-white border border-white/12" : "text-white/30 hover:text-white/60"
                        }`}>
                        {t}
                    </button>
                ))}
            </div>

            {tab === "projects" && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-white/25 font-mono uppercase tracking-widest">Projects</p>
                        {isOwner && (
                            <button onClick={() => setShowForm(v => !v)}
                                className="text-xs text-white/30 hover:text-white/60 transition-colors">
                                {showForm ? "Cancel" : "+ New Project"}
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="bg-white/2 border border-white/8 rounded-2xl p-5 mb-4 flex flex-col gap-3">
                            <input value={projName} onChange={e => setProjName(e.target.value)}
                                placeholder="Project name"
                                className="bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
                            <input value={projDesc} onChange={e => setProjDesc(e.target.value)}
                                placeholder="Description (optional)"
                                className="bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
                            <input type="date" value={projDeadline} onChange={e => setProjDeadline(e.target.value)}
                                className="bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/20" />
                            {createError && <ErrorBox message={createError} />}
                            <button onClick={handleCreateProject} disabled={creating || !projName.trim() || !projDeadline}
                                className="px-4 py-2.5 bg-white/8 hover:bg-white/12 border border-white/12 rounded-xl text-sm text-white/70 disabled:opacity-40 transition-all self-start">
                                {creating ? <Spinner size={14} /> : "Create Project"}
                            </button>
                        </div>
                    )}

                    {projectsLoading && <div className="py-8 flex justify-center"><Spinner /></div>}
                    {!projectsLoading && projects.length === 0 && <Empty message="No projects yet" />}
                    <div className="flex flex-col gap-2">
                        {projects.map(project => (
                            <div key={project.id}
                                onClick={() => navigate(`/projects/${project.id}`)}
                                className="bg-white/2 border border-white/6 rounded-xl px-4 py-3 flex items-center justify-between hover:border-white/12 hover:bg-white/4 cursor-pointer transition-all">
                                <div>
                                    <p className="text-sm text-white/80 font-medium">{project.name}</p>
                                    <p className="text-xs text-white/25">{project.description || "No description"}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-white/20 font-mono">
                                        {new Date(project.deadline).toLocaleDateString()}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-lg border ${
                                        project.status === "active"    ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                                        project.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        project.status === "on_hold"   ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                        "bg-white/5 text-white/30 border-white/10"
                                    }`}>{project.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === "members" && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-white/25 font-mono uppercase tracking-widest">Members</p>
                    </div>

                    {isOwner && (
                        <div className="flex gap-2 mb-4">
                            <input value={newUsername} onChange={e => setNewUsername(e.target.value)}
                                placeholder="Username"
                                className="flex-1 bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
                            <button onClick={handleAddMember} disabled={!newUsername.trim()}
                                className="px-4 py-2.5 bg-white/8 hover:bg-white/12 border border-white/12 rounded-xl text-sm text-white/70 disabled:opacity-40 transition-all">
                                Add
                            </button>
                        </div>
                    )}
                    {addError && <ErrorBox message={addError} />}

                    {membersLoading && <div className="py-8 flex justify-center"><Spinner /></div>}
                    {!membersLoading && members.length === 0 && <Empty message="No members" />}
                    <div className="flex flex-col gap-2">
                        {members.map(member => (
                            <div key={member.userId}
                                className="bg-white/2 border border-white/6 rounded-xl px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-white/5 border border-white/8 flex items-center justify-center">
                                        <span className="text-xs text-white/40">{member.username[0]?.toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/70">{member.username}</p>
                                        <p className="text-xs text-white/25">{new Date(member.joinedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-lg border ${
                                        member.role === "owner"
                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            : "bg-white/5 text-white/30 border-white/10"
                                    }`}>{member.role}</span>
                                    {isOwner && member.userId !== user?.id && (
                                        <button onClick={() => removeMember(member.userId)}
                                            className="text-xs text-red-400/40 hover:text-red-400 transition-colors">
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
