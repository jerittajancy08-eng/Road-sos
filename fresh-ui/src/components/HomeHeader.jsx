import { motion } from "framer-motion";

export default function HomeHeader({ isSOSActive, alertMessage }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[2rem] border border-white/10 bg-slate-950/70 px-6 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">RoadSOS</p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Automatic emergency protection</h1>
        </div>
        <div className="rounded-3xl bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-100 ring-1 ring-white/10">
          {isSOSActive ? "Responders are on the way" : "Detection active"}
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
        Your device monitors impact and triggers help automatically. The map shows nearby services and responder movement for fast assistance.
      </p>
      {alertMessage && (
        <div className="mt-6 rounded-[1.75rem] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100 shadow-[0_10px_30px_rgba(220,38,38,0.12)]">
          <p className="font-semibold">{alertMessage}</p>
        </div>
      )}
    </motion.section>
  );
}
