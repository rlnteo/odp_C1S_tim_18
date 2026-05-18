import { useEffect, useState } from "react";
import { PageHeader, Table, TableHead, RoleBadge, Empty, ErrorBox, Spinner } from "../../components/ui/UI";
import { usersApi } from "../../api_services/users/UsersAPIService";
import type { UserDto } from "../../models/user/UserTypes";

export default function UsersPage() {
    const [users,   setUsers]   = useState<UserDto[]>([]);
    const [error,   setError]   = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        usersApi.getAll()
            .then(res => {
                if (res.success) setUsers(res.data ?? []);
                else setError(res.message);
            })
            .catch(() => setError("Failed to load users"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <PageHeader eyebrow="Admin" title="Users"
                action={
                    <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-2">
                        <span className="text-sm font-semibold text-violet-600">{users.length} total</span>
                    </div>
                }
            />

            {error && <ErrorBox message={error} />}
            {loading && <div className="py-16 flex justify-center"><Spinner /></div>}
            {!loading && users.length === 0 && !error && <Empty message="No users found" />}

            {!loading && users.length > 0 && (
                <Table>
                    <TableHead columns={["User", "Email", "Role", "Status", "ID"]} />
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                                            <span className="text-xs text-violet-600 font-semibold">{u.username[0]?.toUpperCase()}</span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{u.username}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-slate-400 text-sm">{u.email}</td>
                                <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                                <td className="px-5 py-3.5">
                                    <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                                        u.isActive
                                            ? "bg-emerald-100 text-emerald-600 border-emerald-200"
                                            : "bg-rose-100 text-rose-500 border-rose-200"
                                    }`}>
                                        {u.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-slate-300 font-mono text-xs">#{u.id}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
}
