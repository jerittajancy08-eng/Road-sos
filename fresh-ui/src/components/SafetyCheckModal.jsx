import { motion } from "framer-motion";

export default function SafetyCheckModal({ countdown, onCancel, onConfirm }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[5000] flex items-center justify-center bg-slate-950/95 p-6 backdrop-blur-xl">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="mb-6 flex items-center justify-between rounded-3xl bg-red-500/10 px-4 py-3 text-sm text-red-100">
          <span className="font-semibold">Accident detected</span>
          <span>{countdown}s</span>
        </div>
        <h2 className="text-3xl font-semibold text-white">Safety check</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">If you are safe, tap the button below. Otherwise the app will continue assisting automatically.</p>
        <div className="mt-8 flex flex-col gap-4">
          <button onClick={onCancel} className="rounded-3xl bg-slate-900/80 px-4 py-4 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-slate-900">I am safe</button>
          <button onClick={onConfirm} className="rounded-3xl bg-red-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-red-400">Continue assistance</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
