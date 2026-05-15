import { useState, useEffect } from "react";
import { PageHeader, StatCard, ErrorBox, Spinner, NodeBadge, Table, TableHead, Pagination } from "../../components/ui/UI";
import { healthApi } from "../../api_services/health/HealthAPIService";
import { auditApi } from "../../api_services/audit/AuditAPIService";
import type { HealthStatusDto, StatisticsDto } from "../../models/health/HealthDto";
import type { AuditDto } from "../../models/audit/AuditDto";

const emptyHealth  = (): HealthStatusDto  => ({ nodes: [], slaveRrIndex: 0 });
const emptyStats   = (): StatisticsDto    => ({ totalUsers: 0, totalTeams: 0, totalProjects: 0, activeProjects: 0, totalTasks: 0, completedTasks: 0 });

export default function AdminDashboard() {
    const [health,  setHealth]  = useState<HealthStatusDto>(emptyHealth());
    const [stats,   setStats]   = useState<StatisticsDto>(emptyStats());
    const [logs,    setLogs]    = useState<AuditDto[]>([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");

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
            if (auditRes.success  && auditRes.data)  {
                setLogs(auditRes.data.logs);
                setTotal(auditRes.data.total);
            }
            if (!healthRes.success) setError(healthRes.message);
        } catch {
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(page); }, [page]);

    return (
        <div>
            <PageHeader eyebrow="Admin" title="Dashboard" />

            {error && <ErrorBox message={error} />}
            {loading && <div className="py-16 flex justify-center"><Spinner /></div>}

            {!loading && (
                <>
                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <StatCard label="Total Users"      value={stats.totalUsers} />
                        <StatCard label="Total Teams"      value={stats.totalTeams} />
                        <StatCard label="Total Projects"   value={stats.totalProjects} />
                        <StatCard label="Active Projects"  value={stats.activeProjects}  color="text-sky-400" />
                        <StatCard label="Total Tasks"      value={stats.totalTasks} />
                        <StatCard label="Completed Tasks"  value={stats.completedTasks}  color="text-emerald-400" />
                    </div>

                    {/* DB Nodes */}
                    <div className="mb-8">
                        <p className="text-xs text-white/25 font-mono uppercase tracking-widest mb-4">Database Nodes</p>
                        <div className="flex flex-col gap-2">
                            {health.nodes.map(node => (
                                <div key={node.name}
                                    className="bg-white/2 border border-white/6 rounded-xl px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <NodeBadge status={node.status} />
                                        <div>
                                            <p className="text-sm text-white/70 font-medium">{node.name}</p>
                                            <p className="text-xs text-white/25 font-mono">{node.host}:{node.port}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-xs text-white/30 font-mono">
                                        <span>✓ {node.successfulWrites}</span>
                                        <span className="text-red-400/50">✗ {node.failedWrites}</span>
                                        <span>{node.lastCheck ? new Date(node.lastCheck).toLocaleTimeString() : "—"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Audit Logs */}
                    <div>
                        <p className="text-xs text-white/25 font-mono uppercase tracking-widest mb-4">Audit Logs</p>
                        <Table>
                            <TableHead columns={["User", "Action", "Entity", "IP", "Time"]} />
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} className="border-t border-white/4 hover:bg-white/2 transition-colors">
                                        <td className="px-5 py-3.5 text-white/60 text-sm">{log.username || "—"}</td>
                                        <td className="px-5 py-3.5 text-white/80 text-sm font-mono">{log.actionType}</td>
                                        <td className="px-5 py-3.5 text-white/40 text-xs font-mono">
                                            {log.entityType ? `${log.entityType} #${log.entityId}` : "—"}
                                        </td>
                                        <td className="px-5 py-3.5 text-white/30 text-xs font-mono">{log.ipAddress || "—"}</td>
                                        <td className="px-5 py-3.5 text-white/25 text-xs font-mono">
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