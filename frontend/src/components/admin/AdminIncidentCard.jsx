import AdminCard from "./AdminCard";
import AdminStatusBadge from "./AdminStatusBadge";
import { formatTimestamp } from "../../admin/useAdminCollection";
import { formatLabel, getIncidentType, normalizeIncidentState } from "../../admin/adminUtils";

function formatLocation(incident) {
  const loc = incident.liveLocation || incident.location || incident.victimLocation || incident.pos;
  if (Array.isArray(loc)) return `${Number(loc[0]).toFixed(4)}, ${Number(loc[1]).toFixed(4)}`;
  if (loc?.lat && loc?.lng) return `${Number(loc.lat).toFixed(4)}, ${Number(loc.lng).toFixed(4)}`;
  return "Location pending";
}

export default function AdminIncidentCard({ incident, children }) {
  const assigned = incident.assignedResponders || incident.responders || [];
  const lifecycle = normalizeIncidentState(incident.lifecycleStage || incident.status);
  const eta = incident.etaSeconds || incident.eta || incident.ETA;
  const timeline = incident.statusHistory || incident.activity || [];

  return (
    <AdminCard className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-white">{formatLabel(getIncidentType(incident))}</h3>
          <p className="mt-1 text-xs text-slate-500">{formatTimestamp(incident.createdAt)}</p>
        </div>
        <AdminStatusBadge value={formatLabel(lifecycle)} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-slate-500 uppercase tracking-[0.22em]">Reporter</p>
          <p className="mt-1 font-semibold text-white">{incident.reporter?.name || incident.userName || incident.name || "Authenticated user"}</p>
        </div>
        <div>
          <p className="text-slate-500 uppercase tracking-[0.22em]">Severity</p>
          <AdminStatusBadge value={incident.severity || "medium"} />
        </div>
        <div>
          <p className="text-slate-500 uppercase tracking-[0.22em]">ETA</p>
          <p className="mt-1 font-mono text-white">{eta ? `${eta}s` : "Calculating"}</p>
        </div>
        <div className="col-span-2">
          <p className="text-slate-500 uppercase tracking-[0.22em]">Location</p>
          <p className="mt-1 font-mono text-white">{formatLocation(incident)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-slate-500 uppercase tracking-[0.22em]">Assigned Responders</p>
          <p className="mt-1 text-white">
            {assigned.length
              ? assigned.map((item) => typeof item === "string" ? "Responder assigned" : [item.name, item.role, item.badgeId, item.unitLabel].filter(Boolean).join(" · ")).join(", ")
              : "None assigned"}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-slate-500 uppercase tracking-[0.22em]">Emergency Notes</p>
          <p className="mt-1 text-slate-300">{incident.notes || incident.emergencyNotes || "No notes recorded"}</p>
        </div>
        <div>
          <p className="text-slate-500 uppercase tracking-[0.22em]">Lifecycle</p>
          <p className="mt-1 font-mono text-white">{formatLabel(lifecycle)}</p>
        </div>
        <div>
          <p className="text-slate-500 uppercase tracking-[0.22em]">Last Updated</p>
          <p className="mt-1 font-mono text-white">{formatTimestamp(incident.updatedAt)}</p>
        </div>
      </div>
      <div className="border-t border-white/10 pt-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Lifecycle Timeline</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["DETECTED", "PENDING_RESPONSE", "RESPONDER_ASSIGNED", "EN_ROUTE", "ACTIVE_RESCUE", "RESOLVED", "CLOSED"].map((state) => {
            const reached = timeline.some((event) => normalizeIncidentState(event.status || event.action) === state) || lifecycle === state;
            return <span key={state} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${reached ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-300/20" : "bg-white/5 text-slate-500"}`}>{formatLabel(state)}</span>;
          })}
        </div>
      </div>
      {children}
    </AdminCard>
  );
}
