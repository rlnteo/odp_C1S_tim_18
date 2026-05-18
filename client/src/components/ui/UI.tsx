import { type ReactNode } from "react";

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin inline-block" style={{ color: "#a78bfa" }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 60" />
    </svg>
  );
}

export function Empty({ message = "No data" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
        <span className="text-violet-300 text-lg">◦</span>
      </div>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="border border-rose-200 bg-rose-50 text-rose-500 text-sm px-4 py-3 rounded-xl">
      {message}
    </div>
  );
}

export function SuccessBox({ message }: { message: string }) {
  return (
    <div className="border border-emerald-200 bg-emerald-50 text-emerald-600 text-sm px-4 py-3 rounded-xl">
      {message}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    todo:        "bg-slate-100 text-slate-500 border-slate-200",
    in_progress: "bg-blue-100 text-blue-600 border-blue-200",
    done:        "bg-emerald-100 text-emerald-600 border-emerald-200",
    planning:    "bg-violet-100 text-violet-600 border-violet-200",
    active:      "bg-sky-100 text-sky-600 border-sky-200",
    completed:   "bg-emerald-100 text-emerald-600 border-emerald-200",
    on_hold:     "bg-amber-100 text-amber-600 border-amber-200",
    cancelled:   "bg-rose-100 text-rose-500 border-rose-200",
    pending:     "bg-amber-100 text-amber-600 border-amber-200",
  };
  const dotStyles: Record<string, string> = {
    todo:        "bg-slate-400",
    in_progress: "bg-blue-500 animate-pulse",
    done:        "bg-emerald-500",
    planning:    "bg-violet-500",
    active:      "bg-sky-500 animate-pulse",
    completed:   "bg-emerald-500",
    on_hold:     "bg-amber-500",
    cancelled:   "bg-rose-400",
    pending:     "bg-amber-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${styles[status] ?? "bg-slate-100 text-slate-400 border-slate-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status] ?? "bg-slate-300"}`} />
      {status.replace("_", " ")}
    </span>
  );
}

export function NodeBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    healthy:  "bg-emerald-100 text-emerald-600 border-emerald-200",
    degraded: "bg-amber-100 text-amber-600 border-amber-200",
    offline:  "bg-rose-100 text-rose-500 border-rose-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${styles[status] ?? "bg-slate-100 text-slate-400 border-slate-200"}`}>
      {status}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
      role === "admin"
        ? "bg-violet-100 text-violet-600 border-violet-200"
        : "bg-slate-100 text-slate-500 border-slate-200"
    }`}>{role}</span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    low:      "bg-slate-100 text-slate-500 border-slate-200",
    medium:   "bg-blue-100 text-blue-600 border-blue-200",
    high:     "bg-orange-100 text-orange-600 border-orange-200",
    critical: "bg-rose-100 text-rose-600 border-rose-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${styles[priority] ?? "bg-slate-100 text-slate-400 border-slate-200"}`}>
      {priority}
    </span>
  );
}

export function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-3 mt-5 text-xs text-slate-400">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}
        className="px-3 py-1.5 border border-slate-200 rounded-lg hover:border-violet-300 hover:text-violet-500 disabled:opacity-30 transition-colors bg-white">←</button>
      <span className="font-mono text-slate-500">{page} / {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}
        className="px-3 py-1.5 border border-slate-200 rounded-lg hover:border-violet-300 hover:text-violet-500 disabled:opacity-30 transition-colors bg-white">→</button>
      <span className="text-slate-300">{total} total</span>
    </div>
  );
}

export function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-2 hover:shadow-sm hover:border-violet-100 transition-all">
      <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">{label}</p>
      <p className={`text-2xl font-semibold tracking-tight ${color ?? "text-slate-700"}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr className="border-b border-slate-100 bg-slate-50">
        {columns.map((c) => (
          <th key={c} className="text-left px-5 py-3.5 text-xs text-slate-400 font-mono uppercase tracking-wider">{c}</th>
        ))}
      </tr>
    </thead>
  );
}

export function PageHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <p className="text-xs text-violet-400 font-mono uppercase tracking-widest mb-1">{eyebrow}</p>
        <h1 className="text-2xl font-bold text-slate-700 tracking-tight">{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Card({ children, onClick, className = "" }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md hover:border-violet-100 transition-all ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({ children, onClick, disabled, variant = "primary", size = "md" }: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
}) {
  const variants = {
    primary:   "bg-violet-500 hover:bg-violet-600 text-white border-violet-500",
    secondary: "bg-white hover:bg-slate-50 text-slate-600 border-slate-200",
    danger:    "bg-white hover:bg-rose-50 text-rose-500 border-rose-200",
    ghost:     "bg-transparent hover:bg-slate-50 text-slate-500 border-transparent",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`border rounded-xl font-medium transition-all disabled:opacity-40 ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </button>
  );
}

export function Input({ value, onChange, placeholder, type = "text" }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
    />
  );
}
