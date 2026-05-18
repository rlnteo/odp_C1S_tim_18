import { useState, useEffect } from "react";
import { PageHeader, StatCard, ErrorBox, Spinner, NodeBadge, Table, TableHead, Pagination } from "../../components/ui/UI";
import { healthApi } from "../../api_services/health/HealthAPIService";
import { auditApi } from "../../api_services/audit/AuditAPIService";
import type { HealthStatusDto, StatisticsDto } from "../../models/health/HealthDto";
import type { AuditDto } from "../../models/audit/AuditDto";

const emptyHealth = (): HealthStatusDto => ({ nodes: [], slaveRrIndex: 0 });
const emptyStats  = (): StatisticsDto  => ({ totalUsers: 0, totalTeams: 0, totalProjects: 0, activeProjects: 0, totalTasks: 0, completedTasks: 0 });

export default function AdminDashboard() {
    const [health,  setHealth]  = useState<HealthStatusDto>(emptyHealth());
    const [stats,   setStats]   = useState<StatisticsDto>(emptyStats());
    const [logs,    setLogs]    = useState<AuditDto[]>([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");

    useEffect(() => {
    const load = async (p: number) => {
        setLoading(true); setError("");
        try {
            const [healthRes, statsRes, auditRes] = await Promise.all([
                healthApi.getHealth(),
                healthApi.getStatistics(),
                auditApi.getLogs(p, 15),
            ]);
            if (healthRes.success && healthRes.data) setHealth(healthRes.data);
            if (statsRes.success  && statsRes.data)  setStats(statsRes.data);
            if (auditRes.success  && auditRes.data)  { setLogs(auditRes.data.logs); setTotal(auditRes.data.total); }
            if (!healthRes.success) setError(healthRes.message);
        } catch {
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };
    load(page);
    }, [page]);

    return (
        <div>
            <PageHeader eyebrow="Admin" title="Dashboard" />

            {error && <ErrorBox message={error} />}
            {loading && <div className="py-16 flex justify-center"><Spinner /></div>}

            {!loading && (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <StatCard label="Total Users"     value={stats.totalUsers} />
                        <StatCard label="Total Teams"     value={stats.totalTeams} />
                        <StatCard label="Total Projects"  value={stats.totalProjects} />
                        <StatCard label="Active Projects" value={stats.activeProjects}  color="text-sky-500" />
                        <StatCard label="Total Tasks"     value={stats.totalTasks} />
                        <StatCard label="Completed Tasks" value={stats.completedTasks}  color="text-emerald-500" />
                    </div>

                    <div className="mb-8">
                        <p className="text-sm font-semibold text-slate-600 mb-4">Database Nodes</p>
                        <div className="flex flex-col gap-2">
                            {health.nodes.map(node => (
                                <div key={node.name} className="bg-white border border-slate-100 rounded-xl px-5 py-3.5 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <NodeBadge status={node.status} />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">{node.name}</p>
                                            <p className="text-xs text-slate-400 font-mono">{node.host}:{node.port}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-xs font-mono">
                                        <span className="text-emerald-500">✓ {node.successfulWrites}</span>
                                        <span className="text-rose-400">✗ {node.failedWrites}</span>
                                        <span className="text-slate-300">{node.lastCheck ? new Date(node.lastCheck).toLocaleTimeString() : "—"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-600 mb-4">Audit Logs</p>
                        <Table>
                            <TableHead columns={["User", "Action", "Entity", "IP", "Time"]} />
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3.5 text-slate-600 text-sm font-medium">{log.username || "—"}</td>
                                        <td className="px-5 py-3.5 text-slate-700 text-sm font-mono">{log.actionType}</td>
                                        <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">
                                            {log.entityType ? `${log.entityType} #${log.entityId}` : "—"}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">{log.ipAddress || "—"}</td>
                                        <td className="px-5 py-3.5 text-slate-300 text-xs font-mono">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Pagination page={page} total={total} pageSize={15} onChange={setPage} />
                    </div>
                </>
            )}
        </div>
    );
}
