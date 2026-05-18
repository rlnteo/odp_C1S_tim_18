import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../../components/auth/LoginForm";
import { authApi } from "../../api_services/auth/AuthAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";

export default function LoginPage() {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !user) return;
        navigate(user.role === "admin" ? "/admin" : "/dashboard");
    }, [isAuthenticated, user, navigate]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-blue-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-10">
                <LoginForm authApi={authApi} />
            </div>
        </main>
    );
}
