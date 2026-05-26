import { motion } from "framer-motion";
import { Activity, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";

export default function ResponderTrackerCard({ activeResponder, eta, isSOSActive }) {
  const isArrived = activeResponder?.arrived;
  const minutes = Math.floor(eta / 60);
  const seconds = (eta % 60).toString().padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75 }}
      className="glass-card border border-white/10 p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Responder Status</p>
          <h3 className="mt-2 text-2xl font-black text-white">{activeResponder ? activeResponder.name : "Awaiting allocation"}</h3>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-950/70 text-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
          <ShieldAlert size={24} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-950/80 p-4">
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Responder type</p>
          <p className="mt-2 text-base font-semibold text-white">{activeResponder?.type || "Not assigned"}</p>
        </div>
        <div className="rounded-3xl bg-slate-950/80 p-4">
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">ETA</p>
          <p className="mt-2 text-base font-semibold text-white">{isSOSActive ? `${minutes}:${seconds}` : "N/A"}</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-slate-950/70 p-4 border border-white/10">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Activity className="text-cyan-300" size={18} />
          <span>{isArrived ? "Responder has arrived" : activeResponder ? "Responding now" : "No active responder"}</span>
        </div>
      </div>
    </motion.div>
  );
}
