import { type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";

const userNav = [
    { to: "/dashboard", label: "Dashboard", icon: "⊡" },
    { to: "/teams",     label: "Teams",      icon: "⊕" },
];
const adminNav = [
    { to: "/admin",       label: "Dashboard", icon: "⊡" },
    { to: "/admin/users", label: "Users",     icon: "⊕" },
];

export function Layout({ children }: { children: ReactNode }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const nav = user?.role === "admin" ? adminNav : userNav;

    return (
        <div className="flex min-h-screen bg-slate-50">
            <aside className="w-60 shrink-0 border-r border-slate-100 flex flex-col bg-white shadow-sm">
                {/* Logo */}
                <div className="px-5 h-16 flex items-center border-b border-slate-100 gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm font-bold">N</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-700 tracking-tight">NexusHub</p>
                        <p className="text-[10px] text-violet-400 uppercase tracking-widest">{user?.role}</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
                    {nav.map((item) => (
                        <NavLink key={item.to} to={item.to} end
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                                    isActive
                                        ? "bg-violet-50 text-violet-600 font-medium border border-violet-100"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent"
                                }`
                            }
                        >
                            <span className="text-base leading-none">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="border-t border-slate-100 px-4 py-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                            <span className="text-xs text-violet-600 font-semibold">{user?.username?.[0]?.toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-600 truncate">{user?.username}</p>
                            <p className="text-[10px] text-slate-400">{user?.role}</p>
                        </div>
                    </div>
                    <button onClick={() => { logout(); navigate("/login"); }}
                        className="text-xs text-slate-400 hover:text-rose-400 transition-colors w-full text-left">
                        Sign out →
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">
                <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
            </main>
        </div>
    );
}
