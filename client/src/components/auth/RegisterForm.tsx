import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";

export function RegisterForm({ authApi }: { authApi: IAuthAPIService }) {
    const { login } = useAuth();
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [error, setError]   = useState("");
    const [loading, setLoading] = useState(false);
    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setError(""); setLoading(true);
        const res = await authApi.register(form.username, form.email, form.password, "user");
        setLoading(false);
        if (!res.success || !res.data) { setError(res.message ?? "Registration failed"); return; }
        login(res.data);
    };

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-violet-500 text-white px-4 py-2 rounded-2xl mb-6 shadow-sm">
                    <span className="font-bold text-lg">N</span>
                    <span className="font-semibold tracking-tight">NexusHub</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-700">Create account</h1>
                <p className="text-sm text-slate-400 mt-1">Register to get started</p>
            </div>

            {error && (
                <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-500 text-sm px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Username</label>
                    <input type="text" value={form.username} onChange={set("username")} required
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm placeholder-slate-300 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                        placeholder="your_username" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Email</label>
                    <input type="email" value={form.email} onChange={set("email")} required
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm placeholder-slate-300 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                        placeholder="you@example.com" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Password</label>
                    <input type="password" value={form.password} onChange={set("password")} required
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm placeholder-slate-300 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                        placeholder="Min 8 chars, 1 uppercase, 1 number" />
                </div>
                <button type="submit" disabled={loading}
                    className="mt-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-colors shadow-sm">
                    {loading ? "Creating account…" : "Create account →"}
                </button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-6">
                Already have an account?{" "}
                <a href="/login" className="text-violet-500 hover:text-violet-600 font-medium transition-colors">Sign in</a>
            </p>
        </div>
    );
}
