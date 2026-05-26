import { motion } from "framer-motion";
import { Activity, ShieldCheck } from "lucide-react";

export default function LiveStatusCard({ phase, etaLabel, activeResponder }) {
  const title = activeResponder
    ? "Responder en route"
    : phase === "countdown"
    ? "Monitoring is active"
    : phase === "safe"
    ? "Protection active"
    : "Live response active";

  const subtitle = activeResponder
    ? `Incoming support from ${activeResponder.name}`
    : phase === "countdown"
    ? "Verifying your route and local conditions"
    : "Tracking location and nearby assistance";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/85 p-4 shadow-[0_30px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-300/15">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Live status</p>
            <p className="text-sm font-semibold text-white">{title}</p>
          </div>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200 ring-1 ring-white/10">
          {etaLabel || "Live"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{subtitle}</p>
    </motion.div>
  );
}
