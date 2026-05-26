import { useState } from "react";
import { Lock, Mail, ShieldAlert } from "lucide-react";

export default function AdminLogin({ onAdminSignIn, initialError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await onAdminSignIn({ email, password });
    } catch (err) {
      setError(err.message || "Admin login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.15),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),transparent_26%)]" />
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 ring-1 ring-cyan-400/30">
            <ShieldAlert className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">RoadSOS</p>
            <h1 className="text-xl font-black">Admin Access</h1>
          </div>
        </div>
        {error && <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">{error}</div>}
        <label className="mb-3 block">
          <span className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-slate-500">Email</span>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-3xl bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-cyan-400/30" />
          </div>
        </label>
        <label className="mb-6 block">
          <span className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-slate-500">Password</span>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-3xl bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-cyan-400/30" />
          </div>
        </label>
        <button disabled={isLoading} className="w-full rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-50">
          {isLoading ? "Checking admin..." : "Enter Help Center"}
        </button>
      </form>
    </div>
  );
}
