import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "../../components/auth/RegisterForm";
import { authApi } from "../../api_services/auth/AuthAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";

export default function RegisterPage() {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !user) return;
        navigate(user.role === "admin" ? "/admin" : "/dashboard");
    }, [isAuthenticated, user, navigate]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-blue-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-10">
                <RegisterForm authApi={authApi} />
            </div>
        </main>
    );
}
