import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Fragment } from "react";
import L from "leaflet";
import AdminIncidentCard from "../components/admin/AdminIncidentCard";
import AdminCard from "../components/admin/AdminCard";
import { useAdminCollection } from "./useAdminCollection";
import { CHENNAI_COORDINATES } from "../utils/coordinateUtils";

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

function getPos(incident) {
  if (!incident) return null;
  const loc = incident.liveLocation || incident.location || incident.victimLocation || incident.pos;
  if (Array.isArray(loc) && loc.length === 2 && Number.isFinite(Number(loc[0])) && Number.isFinite(Number(loc[1]))) {
    return [Number(loc[0]), Number(loc[1])];
  }
  if (loc && typeof loc === "object") {
    const lat = loc.lat ?? loc.latitude;
    const lng = loc.lng ?? loc.longitude;
    if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
      return [Number(lat), Number(lng)];
    }
  }
  return null;
}

export default function LiveIncidents() {
  const { items: incidents = [], loading, error } = useAdminCollection("incidents", { orderBy: "createdAt" });
  const { items: responders = [] } = useAdminCollection("responders");
  const active = (Array.isArray(incidents) ? incidents : []).filter((incident) => !["completed", "resolved", "closed"].includes(String(incident?.status || "").toLowerCase()));
  const positionedIncidents = active
    .map((incident) => ({ incident, pos: getPos(incident) }))
    .filter((item) => item.pos);
  const positionedResponders = (Array.isArray(responders) ? responders : [])
    .filter((responder) => responder?.verified === true || responder?.verificationStatus === "approved")
    .map((responder) => ({ responder, pos: getPos(responder) }))
    .filter((item) => item.pos);
  const center = positionedIncidents[0]?.pos || CHENNAI_COORDINATES;
  const hasActiveIncidents = active.length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Live Incidents</h1>
        <p className="mt-1 text-sm text-slate-500">Realtime incident feed, locations, assigned responders, ETA, and timestamps.</p>
      </div>
      <AdminCard title="Admin Live Map" subtitle="Active incidents and emergency hotspots">
        {hasActiveIncidents ? (
          <div className="h-[360px] overflow-hidden rounded-3xl border border-white/10">
            <MapContainer center={center} zoom={12} className="h-full w-full" zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              {positionedIncidents.map(({ incident, pos }) => (
                <Fragment key={incident.id}>
                  <Marker position={pos} icon={icon(incident.severity)}>
                    <Popup>
                      <div className="space-y-1 text-xs">
                        <p className="font-bold">{incident.type || incident.emergencyType || "Emergency"}</p>
                        <p>Status: {incident.status || "active"}</p>
                        <p>Severity: {incident.severity || "HIGH"}</p>
                        <p>ETA: {incident.eta || incident.etaSeconds || 0}s</p>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle center={pos} radius={500} pathOptions={{ color: "#fb7185", fillColor: "#fb7185", fillOpacity: 0.08, weight: 1 }} />
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
            </MapContainer>
          </div>
        ) : (
          <div className="flex h-[220px] items-center justify-center rounded-3xl border border-white/10 bg-slate-950/60 text-sm font-semibold text-slate-400">
            No active incidents
          </div>
        )}
      </AdminCard>
      {loading && <p className="text-sm text-slate-500">Loading incidents...</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="grid gap-4 xl:grid-cols-2">
        {active.map((incident) => <AdminIncidentCard key={incident.id} incident={incident} />)}
        {!active.length && !loading && <p className="text-sm text-slate-500">No active incidents</p>}
      </div>
    </div>
  );
}
