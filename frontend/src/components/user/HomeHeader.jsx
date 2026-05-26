import { Bell, ShieldCheck, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function HomeHeader({ role, statusLabel, onRoleChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/90 px-4 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-900/90 ring-1 ring-white/10">
            <UserCircle className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">RoadSOS</p>
            <h1 className="text-base font-semibold text-white">Protection active</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-2 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]" />
          {statusLabel}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
        <span>Live protection is enabled</span>
        <Bell className="h-4 w-4 text-slate-400" />
        {onRoleChange ? (
          <select
            value={role}
            onChange={(event) => onRoleChange(event.target.value)}
            className="rounded-full bg-slate-900/90 px-3 py-2 text-white outline-none ring-1 ring-white/10"
          >
            <option value="user">User</option>
            <option value="police">Police</option>
            <option value="hospital">Hospital</option>
            <option value="helper">Helper</option>
          </select>
        ) : null}
      </div>
    </motion.div>
  );
}
