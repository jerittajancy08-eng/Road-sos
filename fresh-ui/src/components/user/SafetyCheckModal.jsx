import { motion } from "framer-motion";
import { ShieldCheck, XCircle } from "lucide-react";

export default function SafetyCheckModal({ countdown, onSafe, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4 py-8"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/95 p-8 text-white shadow-[0_40px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Possible accident detected</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Sending emergency alert soon</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl bg-slate-900/80 px-3 py-2 text-sm text-slate-300 ring-1 ring-white/10"
          >
            Cancel
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-900/90 ring-2 ring-cyan-400/10">
            <span className="text-5xl font-semibold text-cyan-300">{countdown}</span>
          </div>
          <p className="text-center text-sm leading-6 text-slate-300">
            The app detected an impact and will send a responder alert unless you confirm you are safe.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          <button
            type="button"
            onClick={onSafe}
            className="rounded-3xl bg-emerald-500 px-5 py-4 text-sm font-semibold text-slate-950 shadow-[0_20px_50px_rgba(16,185,129,0.25)] transition hover:bg-emerald-400"
          >
            I am safe
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-3xl border border-white/10 bg-slate-900/85 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Send emergency alert now
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          Signals and responder tracking remain active while you wait.
        </div>
      </motion.div>
    </motion.div>
  );
}
