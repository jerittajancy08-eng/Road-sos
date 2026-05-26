import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useEmergencyContext } from "../hooks/EmergencyContext";

export default function ResponderBottomSheet({ open, onClose }) {
  const { ambPos, eta, helpers, responders, incidents, activeEmergency, addActivity } = useEmergencyContext();
  const [expanded, setExpanded] = useState(false);
  const activeResponder = responders?.find((r) => r.assignedIncidentId) || responders?.[0] || null;
  const activeIncident = incidents?.find((incident) => incident.responderId === activeResponder?.id) || null;

  useEffect(() => {
    if (activeEmergency) setExpanded(true);
  }, [activeEmergency]);

  if (!open) return null;

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: -360, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -40) setExpanded(true);
        if (info.offset.y > 40) setExpanded(false);
      }}
      initial={{ y: 220 }}
      animate={{ y: expanded ? 0 : 160 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="absolute inset-x-0 bottom-0 z-40 px-5 pb-6 touch-none"
    >
      <div className="mx-auto max-w-full rounded-t-[28px] bg-slate-950/95 px-5 py-4 shadow-[0_-20px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-3xl bg-slate-900/85 flex items-center justify-center ring-1 ring-white/10">
              <ShieldCheck className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Live status</p>
              <p className="text-base font-semibold text-white">{activeResponder?.type || 'Responder network'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Units nearby</p>
            <p className="text-sm font-semibold text-white">{responders?.length ?? 0}</p>
          </div>
        </div>

        <div className="mt-4 rounded-[28px] bg-slate-900/90 p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Current dispatch</p>
              <p className="mt-2 text-sm font-semibold text-white">{activeIncident ? 'Active response' : 'Awaiting assignment'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">ETA</p>
              <p className="text-sm font-semibold text-white">{activeIncident ? `${Math.max(0, Math.ceil(eta / 60))} min` : '—'}</p>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-900 overflow-hidden">
            <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${activeIncident ? Math.min(100, Math.max(12, 100 - Math.round((eta / 240) * 100))) : 0}%` }} />
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900/85 p-4 border border-white/10">
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Responder</p>
                <p className="mt-2 text-base font-semibold text-white">{activeResponder?.id || 'No unit'}</p>
                <p className="text-xs text-slate-500 mt-2">Status: {activeResponder?.status || 'available'}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/85 p-4 border border-white/10">
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Incident feed</p>
                <p className="mt-2 text-sm font-semibold text-white">{activeIncident ? activeIncident.severity : 'No active alerts'}</p>
                <p className="text-xs text-slate-500 mt-2">{activeIncident ? activeIncident.status : 'waiting for dispatch'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-3">Helpers alerted</p>
              <div className="flex flex-wrap gap-2">
                {(helpers || []).slice(0, 4).map((h) => (
                  <div key={h.id} className="rounded-full bg-slate-900/70 px-3 py-2 text-[11px] text-slate-200">{h.initials} • {h.distance}</div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  addActivity({ type: 'navigation', title: 'Responder route confirmed', subtitle: 'Navigation overlay activated', severity: 'LOW' });
                  setExpanded(false);
                }}
                className="rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white"
              >
                Navigate
              </button>
              <button
                type="button"
                onClick={() => addActivity({ type: 'update', title: 'Responder status updated', subtitle: 'Field report recorded', severity: 'LOW' })}
                className="rounded-3xl bg-white/5 px-4 py-3 text-sm font-semibold text-white"
              >
                Report update
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <button onClick={() => setExpanded((s) => !s)} className="rounded-2xl bg-slate-900/80 px-3 py-2 text-sm text-white">{expanded ? 'Collapse' : 'Expand'}</button>
          <button onClick={onClose} className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-white">Close</button>
        </div>
      </div>
    </motion.div>
  );
}
