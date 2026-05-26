import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { Fragment, useState } from "react";
import L from "leaflet";
import AdminIncidentCard from "../components/admin/AdminIncidentCard";
import AdminCard from "../components/admin/AdminCard";
import { useAdminCollection } from "./useAdminCollection";
import { formatLabel, getIncidentType, getPosition, isActiveIncident, normalizeIncidentState } from "./adminUtils";

const severityColor = {
  critical: "#ef4444",
  high: "#fb7185",
  medium: "#f59e0b",
  low: "#22c55e",
};

const icon = (severity = "high") => L.divIcon({
  className: "bg-transparent",
  html: `<div class="h-4 w-4 rounded-full border-2 border-white" style="background:${severityColor[String(severity).toLowerCase()] || "#fb7185"};box-shadow:0 0 18px ${severityColor[String(severity).toLowerCase()] || "#fb7185"}"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const responderIcon = L.divIcon({
  className: "bg-transparent",
  html: `<div class="h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.75)] border-2 border-white"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function LiveIncidents() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const { items: incidents = [], loading, error } = useAdminCollection("incidents", { orderBy: "createdAt" });
  const { items: responders = [] } = useAdminCollection("responders");
  const active = (Array.isArray(incidents) ? incidents : []).filter(isActiveIncident);
  const positionedIncidents = active
    .map((incident) => ({ incident, pos: getPosition(incident) }))
    .filter((item) => item.pos);
  const positionedResponders = (Array.isArray(responders) ? responders : [])
    .filter((responder) => String(responder?.verificationStatus || "").toUpperCase() === "APPROVED")
    .map((responder) => ({ responder, pos: getPosition(responder) }))
    .filter((item) => item.pos);
  const center = positionedIncidents[0]?.pos;
  const hasActiveIncidents = active.length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Live Incidents</h1>
        <p className="mt-1 text-sm text-slate-500">Realtime incident feed, locations, assigned responders, ETA, and timestamps.</p>
      </div>
      <AdminCard title="Admin Live Map" subtitle="Active incidents and emergency hotspots">
        {hasActiveIncidents && center ? (
          <div className="h-[360px] overflow-hidden rounded-3xl border border-white/10">
            <MapContainer center={center} zoom={12} className="h-full w-full" zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              {positionedIncidents.map(({ incident, pos }) => (
                <Fragment key={incident.id}>
                  <Marker position={pos} icon={icon(incident.severity)}>
                    <Popup>
                      <div className="space-y-1 text-xs">
                        <p className="font-bold">{formatLabel(getIncidentType(incident))}</p>
                        <p>Status: {formatLabel(normalizeIncidentState(incident.status || incident.lifecycleStage))}</p>
                        <p>Severity: {incident.severity || "HIGH"}</p>
                        <p>ETA: {incident.eta || incident.etaSeconds || 0}s</p>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle center={pos} radius={String(incident.severity).toLowerCase() === "critical" ? 1000 : String(incident.severity).toLowerCase() === "high" ? 700 : 420} pathOptions={{ color: severityColor[String(incident.severity).toLowerCase()] || "#fb7185", fillColor: severityColor[String(incident.severity).toLowerCase()] || "#fb7185", fillOpacity: 0.08, weight: 1 }} />
                </Fragment>
              ))}
              {positionedResponders.map(({ responder, pos }) => (
                <Marker key={responder.uid || responder.id} position={pos} icon={responderIcon}>
                  <Popup>
                    <div className="space-y-1 text-xs">
                      <p className="font-bold">{responder.fullName || responder.name || responder.role}</p>
                      <p>Status: {responder.status || responder.availability || "available"}</p>
                      <p>Assigned: {responder.assignedIncidentId || "none"}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {positionedResponders.map(({ responder, pos }) => {
                const incident = positionedIncidents.find((item) => item.incident.id === responder.assignedIncidentId || item.incident.assignedResponderId === (responder.uid || responder.id));
                return incident ? <Polyline key={`route-${responder.uid || responder.id}`} positions={[pos, incident.pos]} pathOptions={{ color: "#22d3ee", weight: 3, opacity: 0.75, dashArray: "8 10" }} /> : null;
              })}
            </MapContainer>
          </div>
        ) : (
          <div className="flex h-[220px] items-center justify-center rounded-3xl border border-white/10 bg-slate-950/60 text-sm font-semibold text-slate-400">
            {hasActiveIncidents ? "Active incidents are awaiting live coordinates" : "No active incidents"}
          </div>
        )}
      </AdminCard>
      {loading && <p className="text-sm text-slate-500">Loading incidents...</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="grid gap-4 xl:grid-cols-2">
        {active.map((incident) => <button key={incident.id} onClick={() => setSelectedIncident(incident)} className="text-left"><AdminIncidentCard incident={incident} /></button>)}
        {!active.length && !loading && <p className="text-sm text-slate-500">No active incidents</p>}
      </div>
      {selectedIncident && (
        <div className="fixed inset-0 z-[1200] bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSelectedIncident(null)}>
          <div className="ml-auto h-full max-w-xl overflow-y-auto rounded-3xl border border-cyan-300/15 bg-slate-950 p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">Incident Detail</p>
                <h2 className="mt-2 text-2xl font-black text-white">{formatLabel(getIncidentType(selectedIncident))}</h2>
              </div>
              <button className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-bold text-white" onClick={() => setSelectedIncident(null)}>Close</button>
            </div>
            <AdminIncidentCard incident={selectedIncident} />
            <AdminCard title="Reporter Details" className="mt-4">
              <p className="text-sm text-white">{selectedIncident.reporter?.name || selectedIncident.userName || "Authenticated user"}</p>
              <p className="mt-1 text-xs text-slate-400">{selectedIncident.reporter?.phone || selectedIncident.phone || "No phone on incident"}</p>
              <p className="mt-3 text-xs text-slate-400">{selectedIncident.notes || selectedIncident.emergencyNotes || "No emergency notes recorded."}</p>
            </AdminCard>
            <AdminCard title="Timeline" className="mt-4">
              <div className="space-y-3">
                {(selectedIncident.activity || selectedIncident.statusHistory || []).map((event, index) => (
                  <div key={`${event.action || event.status}-${index}`} className="rounded-2xl bg-white/5 p-3">
                    <p className="text-xs font-bold text-white">{formatLabel(event.action || event.status || "update")}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{event.actorName || event.actor || "system"} · {event.at || event.createdAt || ""}</p>
                  </div>
                ))}
                {!(selectedIncident.activity || selectedIncident.statusHistory || []).length && <p className="text-sm text-slate-500">No timeline entries yet.</p>}
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </div>
  );
}
