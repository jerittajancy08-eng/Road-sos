import AdminCard from "./AdminCard";
import AdminStatusBadge from "./AdminStatusBadge";
import { formatTimestamp } from "../../admin/useAdminCollection";

function formatLocation(incident) {
  const loc = incident.liveLocation || incident.location || incident.victimLocation || incident.pos;
  if (Array.isArray(loc)) return `${Number(loc[0]).toFixed(4)}, ${Number(loc[1]).toFixed(4)}`;
  if (loc?.lat && loc?.lng) return `${Number(loc.lat).toFixed(4)}, ${Number(loc.lng).toFixed(4)}`;
  return "Location pending";
}

export default function AdminIncidentCard({ incident, children }) {
  const assigned = incident.assignedResponders || incident.responders || [];

  return (
    <AdminCard className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-white">{incident.type || incident.emergencyType || "Emergency Incident"}</h3>
          <p className="mt-1 text-xs text-slate-500">{formatTimestamp(incident.createdAt)}</p>
        </div>
        <AdminStatusBadge value={incident.status || "active"} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-slate-500 uppercase tracking-[0.22em]">Severity</p>
          <AdminStatusBadge value={incident.severity || "medium"} />
        </div>
        <div>
          <p className="text-slate-500 uppercase tracking-[0.22em]">ETA</p>
          <p className="mt-1 font-mono text-white">{incident.eta || incident.etaSeconds || 0}s</p>
        </div>
        <div className="col-span-2">
          <p className="text-slate-500 uppercase tracking-[0.22em]">Location</p>
          <p className="mt-1 font-mono text-white">{formatLocation(incident)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-slate-500 uppercase tracking-[0.22em]">Assigned Responders</p>
          <p className="mt-1 text-white">{assigned.length ? assigned.map((item) => item.uid || item).join(", ") : "None assigned"}</p>
        </div>
      </div>
      {children}
    </AdminCard>
  );
}
