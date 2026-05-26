import { motion } from "framer-motion";
import { Hospital, ShieldAlert, Flame } from "lucide-react";

const serviceMeta = {
  hospital: { label: "Hospital", accent: "from-fuchsia-500 to-pink-500", icon: Hospital },
  police: { label: "Police", accent: "from-cyan-500 to-blue-500", icon: ShieldAlert },
  fire: { label: "Fire Rescue", accent: "from-orange-500 to-amber-500", icon: Flame },
};

export default function ServiceGrid({ services, activeResponder, onRequestHelp }) {
  return (
    <div className="glass-card border border-white/10 p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Service Network</p>
          <h3 className="mt-2 text-xl font-black text-white">Responder Units</h3>
        </div>
        <span className="rounded-full bg-slate-950/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-300">{services.length} units</span>
      </div>

      <div className="space-y-4">
        {services.map((service) => {
          const meta = serviceMeta[service.type] || serviceMeta.hospital;
          const Icon = meta.icon;
          const isActive = activeResponder?.id === service.id;
          return (
            <motion.div
              key={service.id}
              whileHover={{ y: -3 }}
              className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-4 shadow-[0_15px_40px_rgba(15,23,42,0.25)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${meta.accent} text-white shadow-[0_0_25px_rgba(255,255,255,0.08)]`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{service.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">{meta.label}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-950/70 text-slate-300"}`}>
                  {isActive ? "Assigned" : "Ready"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="text-sm text-slate-300">Available · {service.type === "fire" ? "Rapid" : "On duty"}</div>
                <button
                  onClick={() => onRequestHelp(service)}
                  className="rounded-3xl bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-white transition hover:bg-white/15"
                >
                  Request
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
