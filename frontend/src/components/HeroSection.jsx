import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";

export default function HeroSection({ isSOSActive, networkStatus, activeAlert }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-[0_0_120px_rgba(0,0,0,0.60)] p-6 md:p-10">
      <div className="pointer-events-none absolute -left-10 -top-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-10 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.8fr_1fr] items-center">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-200"
          >
            <Sparkles size={14} />
            Command Center Live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl font-black tracking-tight text-white sm:text-5xl"
          >
            RoadSOS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base"
          >
            Modern emergency monitoring for fast response, smart coordination, and real-time rescue tracking.
          </motion.p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-card border-cyan-300/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Realtime Security</p>
              <p className="mt-2 text-sm font-semibold text-white">{isSOSActive ? "Emergency mode enabled" : "Monitoring normal operations"}</p>
            </div>
            <div className="glass-card border-rose-300/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Network status</p>
              <p className="mt-2 text-sm font-semibold text-white">{networkStatus ? "Online" : "Offline"}</p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card border border-white/10 p-6 shadow-[0_0_50px_rgba(255,255,255,0.06)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Protection Status</p>
              <p className="mt-2 text-lg font-bold text-white">{isSOSActive ? "Active response" : "Secure monitoring"}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/5 border border-white/10 text-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
              <ShieldCheck size={24} />
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-slate-950/80 p-4 text-sm leading-6 text-slate-300 border border-white/10">
            <span className="block text-slate-300">{activeAlert || "High-fidelity sensors remain active across the entire control perimeter."}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
