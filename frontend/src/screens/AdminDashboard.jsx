import { useState } from "react";
import { Activity, CheckCircle, Clock, ShieldAlert } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import SeverityBadge from "../components/SeverityBadge";
import { useEmergencyContext } from "../hooks/EmergencyContext";

export default function AdminDashboard() {
  const [filter, setFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState(null);
  const { incidents } = useEmergencyContext();

  const filteredIncidents = incidents.filter((incident) => filter === "ALL" || String(incident.severity).toUpperCase() === filter);

  return (
    <div className="p-4 pt-6 h-full flex flex-col">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-white">Help Center</h1>
          <p className="text-xs text-slate-400">Live emergency history</p>
        </div>
        <div className="road-card flex items-center gap-2 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_currentColor]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Live</span>
        </div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {["ALL", "HIGH", "MEDIUM", "LOW"].map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${filter === item ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200" : "border-white/10 bg-white/[0.04] text-slate-500"}`}>
            {item} Impact
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-10">
        <AnimatePresence>
          {filteredIncidents.length === 0 ? (
            <div className="road-card px-4 py-8 text-center">
              <p className="text-sm font-bold text-white">No incidents</p>
              <p className="mt-2 text-xs text-slate-500">Realtime SOS events will appear here.</p>
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <motion.div key={incident.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="road-card cursor-pointer overflow-hidden p-4" onClick={() => setExpandedId(expandedId === incident.id ? null : incident.id)}>
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] font-bold text-white">{incident.id.slice(0, 8)}</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400"><Clock size={10} /> {new Date(incident.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <SeverityBadge severity={String(incident.severity).toUpperCase()} />
                </div>

                <h3 className="mb-3 text-sm font-semibold leading-tight text-white">{incident.type || "Emergency"} / {incident.reporter?.name || "RoadSOS User"}</h3>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-2">
                  <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${incident.status === "completed" || incident.status === "resolved" ? "text-emerald-300" : "text-red-300"}`}>
                    {incident.status === "completed" || incident.status === "resolved" ? <CheckCircle size={12} /> : <Activity size={12} />}
                    {incident.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">Show Timeline</span>
                </div>

                <AnimatePresence>
                  {expandedId === incident.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 border-t border-white/10 pt-4">
                      <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Response Timeline</p>
                      <div className="ml-3 space-y-4 border-l-2 border-white/10 pb-2">
                        {(incident.activity || []).map((event, index) => (
                          <div key={`${event.action}-${index}`} className="relative pl-6">
                            <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-cyan-300" />
                            <p className="font-mono text-[11px] text-slate-400">{new Date(event.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                            <p className="text-sm font-bold capitalize text-white">{event.action} by {event.actorName || "system"}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-start gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
                        <ShieldAlert size={14} className="mt-0.5 shrink-0 text-yellow-400" />
                        <p className="text-[10px] leading-relaxed text-slate-300">Help updates are shared across user and helper screens.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
