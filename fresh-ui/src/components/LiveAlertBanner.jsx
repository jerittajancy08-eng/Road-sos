import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function LiveAlertBanner({ alertMessage, alertCount }) {
  const isAlert = Boolean(alertMessage);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className={`glass-card border ${isAlert ? "border-red-500/30 bg-red-500/10" : "border-cyan-500/20 bg-slate-900/60"} p-5 shadow-[0_0_60px_rgba(220,38,38,0.12)]`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-3xl ${isAlert ? "bg-red-500/15 text-red-300" : "bg-cyan-500/10 text-cyan-300"}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Realtime Alert</p>
            <h2 className="mt-2 text-xl font-black text-white">{isAlert ? "Emergency Detected" : "No active threats"}</h2>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-right">
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Active channels</p>
          <p className="mt-1 text-lg font-bold text-white">{alertCount ?? 0} live feeds</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">{alertMessage || "Systems are operating normally with full responder readiness and rapid deployment coverage."}</p>
    </motion.div>
  );
}
