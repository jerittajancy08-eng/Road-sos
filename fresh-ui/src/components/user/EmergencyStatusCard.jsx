import { Activity, Clock3, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

const phaseConfig = {
  safe: {
    title: "Protection active",
    description: "Impact sensors are online and the app is watching your route.",
    icon: Activity,
    color: "text-cyan-300",
    accent: "bg-cyan-500/10",
  },
  countdown: {
    title: "Possible accident detected",
    description: "If you do not confirm soon, emergency responders will be alerted.",
    icon: ShieldAlert,
    color: "text-rose-300",
    accent: "bg-rose-500/10",
  },
  dispatched: {
    title: "Responder assigned",
    description: "Help is on the way. Follow the live route on the map.",
    icon: Clock3,
    color: "text-sky-300",
    accent: "bg-sky-500/10",
  },
  arrived: {
    title: "Assistance has arrived",
    description: "Your assigned responder is on site and helping you now.",
    icon: CheckCircle2,
    color: "text-emerald-300",
    accent: "bg-emerald-500/10",
  },
};

export default function EmergencyStatusCard({ phase, etaLabel, responderName, emergencyContact, onSafe }) {
  const config = phaseConfig[phase] || phaseConfig.safe;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-[2rem] border border-white/10 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.35)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-3xl ${config.accent}`}>
            <Icon className={`h-7 w-7 ${config.color}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">{config.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">{config.description}</p>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-slate-300 sm:text-right">
          {responderName && <p><span className="text-slate-100 font-semibold">Responder</span>: {responderName}</p>}
          {etaLabel && <p><span className="text-slate-100 font-semibold">ETA</span>: {etaLabel}</p>}
          {emergencyContact && <p><span className="text-slate-100 font-semibold">Emergency</span>: {emergencyContact}</p>}
        </div>
      </div>

      {phase !== "safe" && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSafe}
            className="rounded-3xl bg-slate-900/90 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            I am safe
          </button>
          <span className="text-xs text-slate-500">Tap only when you are safe. Otherwise let responders continue.</span>
        </div>
      )}
    </motion.div>
  );
}
