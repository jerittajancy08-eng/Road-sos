import { motion } from "framer-motion";
import { Hospital, ShieldAlert, Flame } from "lucide-react";

const icons = {
  hospital: Hospital,
  police: ShieldAlert,
  fire: Flame,
};

export default function NearbyServices({ services, onRequestHelp, activeResponder }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Nearby emergency services</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {services.map((service) => {
          const Icon = icons[service.type] || ShieldAlert;
          const selected = activeResponder?.id === service.id;
          return (
            <motion.div whileHover={{ y: -2 }} key={service.id} className={`rounded-[1.75rem] border p-4 ${selected ? "border-cyan-400/30 bg-cyan-400/10" : "border-white/10 bg-slate-900/70"}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/5 text-cyan-300">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{service.name}</p>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{service.type}</p>
                </div>
              </div>
              <button onClick={() => onRequestHelp(service)} className="mt-4 w-full rounded-3xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
                Request assistance
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
