import { motion } from "framer-motion";
import { Users, Clock3, CheckCircle2 } from "lucide-react";

export default function ActiveResponderCard({ activeResponder, eta, movingResponder }) {
  const isActive = Boolean(activeResponder);
  const isArrived = activeResponder?.arrived || movingResponder?.arrived;
  const minutes = Math.floor(eta / 60);
  const seconds = (eta % 60).toString().padStart(2, "0");

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">Responder status</p>
          <p className="mt-2 text-xl font-semibold text-slate-100">{isActive ? activeResponder.name : "Waiting for assignment"}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-3xl ${isArrived ? "bg-emerald-500/15 text-emerald-300" : "bg-cyan-500/15 text-cyan-300"}`}>
          {isArrived ? <CheckCircle2 size={20} /> : <Users size={20} />}
        </div>
      </div>
      <div className="mt-5 space-y-4 text-sm text-slate-300">
        <div className="flex items-center justify-between rounded-3xl bg-slate-900/70 p-4">
          <span className="font-medium">Responder type</span>
          <span className="text-slate-100">{activeResponder?.type || "Pending"}</span>
        </div>
        <div className="flex items-center justify-between rounded-3xl bg-slate-900/70 p-4">
          <span className="font-medium flex items-center gap-2"><Clock3 size={16} /> ETA</span>
          <span className="text-slate-100">{isActive ? `${minutes}:${seconds}` : "—"}</span>
        </div>
        <div className="flex items-center gap-3 rounded-3xl bg-slate-900/70 p-4 text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
          <span>{isArrived ? "Responder has arrived" : isActive ? "Responder on the way" : "Assignment pending"}</span>
        </div>
      </div>
    </motion.section>
  );
}
