import { motion } from "framer-motion";
import { Wifi, Database, CircleDashed, MapPin } from "lucide-react";

export default function StatusPanel({ myLocation, isSOSActive, networkAvailable, liveAlertCount }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75 }}
      className="glass-card border border-white/10 p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">System Board</p>
          <h3 className="mt-2 text-2xl font-black text-white">Live Status Panel</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] ${networkAvailable ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
          {networkAvailable ? "ONLINE" : "OFFLINE"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-950/70 p-4 border border-white/10">
          <div className="flex items-center gap-3 text-slate-300">
            <MapPin size={18} className="text-cyan-300" />
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Coordinates</p>
          </div>
          <p className="mt-3 text-sm font-semibold text-white">{myLocation[0].toFixed(5)}, {myLocation[1].toFixed(5)}</p>
        </div>
        <div className="rounded-3xl bg-slate-950/70 p-4 border border-white/10">
          <div className="flex items-center gap-3 text-slate-300">
            <Database size={18} className="text-slate-400" />
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Firebase</p>
          </div>
          <p className="mt-3 text-sm font-semibold text-white">Realtime sync active</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-slate-950/80 p-4 border border-white/10">
        <div className="flex items-center gap-3 text-slate-300">
          <Wifi size={18} className="text-green-300" />
          <span className="text-xs uppercase tracking-[0.35em] text-slate-400">Emergency monitoring</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-white">
          <span className="font-semibold">{isSOSActive ? "Active incident" : "Standby"}</span>
          <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-slate-300">{liveAlertCount} feeds</span>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-4 text-sm text-cyan-100">
        <CircleDashed size={18} className="text-cyan-300" />
        <p>Secure emergency command interface with premium monitoring grades.</p>
      </div>
    </motion.div>
  );
}
