import { Mail, Lock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { validateLogin } from "../services/authService";

export default function SignInScreen({ onSignIn, onRegisterSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateLogin({ email, password });
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await onSignIn({ email, password });
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center">
      <div className="relative w-[390px] h-[844px] rounded-[40px] overflow-hidden bg-[#061120] border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-[#061120]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.15),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),transparent_26%)]" />

        <div className="relative z-10 flex h-full flex-col justify-between px-6 py-10 text-white">
          <div>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-400">Sign in to access your protection</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Email or phone</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-3xl bg-slate-900/80 pl-11 pr-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none transition focus:ring-cyan-400/30"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-3xl bg-slate-900/80 pl-11 pr-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none transition focus:ring-cyan-400/30"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 w-full rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(14,165,233,0.2)] transition hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-400">New to RoadSOS?</span>
            <button
              onClick={onRegisterSwitch}
              className="font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
