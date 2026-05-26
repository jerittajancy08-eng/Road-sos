import { Fragment } from "react";
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, ZoomControl } from "react-leaflet";
import { Navigation } from "lucide-react";
import L from "leaflet";
import LoadingMap from "../components/LoadingMap";
import { useEmergencyContext } from "../hooks/EmergencyContext";
import { formatLabel, getPosition, normalizeIncidentState } from "../admin/adminUtils";
import { isValidPosition, safePosition, validPositions } from "../utils/coordinateUtils";

const markerIcon = (color, size = 16, pulse = false) =>
  L.divIcon({
    className: "bg-transparent",
    html: `<div class="${pulse ? "animate-ping" : ""} rounded-full border-2 border-white shadow-[0_0_18px_rgba(255,255,255,0.3)]" style="height:${size}px;width:${size}px;background:${color}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const roleColor = {
  police: "#60a5fa",
  hospital: "#fb7185",
  fire: "#f97316",
  helper: "#34d399",
};

const serviceColor = {
  hospital: "#fb7185",
  police: "#60a5fa",
  ambulance: "#ef4444",
  fire: "#f97316",
  mechanic: "#facc15",
  puncture: "#fde047",
  fuel: "#34d399",
  service: "#a78bfa",
};

function responderPosition(responder) {
  return getPosition(responder) || responder.pos || null;
}

export default function UserMapPage() {
  const {
    activeEmergency,
    activeIncident,
    eta,
    gpsError,
    incidents = [],
    nearbyServices = [],
    responders = [],
    userPos,
  } = useEmergencyContext();

  const center = safePosition(userPos);
  const incidentPosition = getPosition(activeIncident) || (activeIncident?.pos && isValidPosition(activeIncident.pos) ? activeIncident.pos : null);
  const activeResponders = responders.filter((responder) => isValidPosition(responderPosition(responder)));
  const assignedResponders = activeResponders.filter((responder) => {
    const responderId = responder.uid || responder.id;
    return activeIncident?.assignedResponderId === responderId || activeIncident?.responders?.some((item) => item.uid === responderId || item.id === responderId);
  });
  const routes = assignedResponders
    .map((responder) => validPositions([responderPosition(responder), incidentPosition || center]))
    .filter((route) => route.length > 1);
  const activeMarkers = incidents
    .filter((incident) => !["RESOLVED", "CLOSED"].includes(normalizeIncidentState(incident.status || incident.lifecycleStage)))
    .map((incident) => ({ incident, position: getPosition(incident) }))
    .filter((item) => item.position);

  return (
    <div className="relative h-full min-h-[calc(100vh-96px)] overflow-hidden bg-slate-950">
      {!isValidPosition(center) ? (
        <LoadingMap message={gpsError || "Getting live GPS position..."} />
      ) : (
        <MapContainer center={incidentPosition || center} zoom={14} zoomControl={false} className="absolute inset-0 z-0 h-full w-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO &copy; OpenStreetMap" />
          <ZoomControl position="topright" />

          <Marker position={center} icon={markerIcon("#22d3ee", 20)}>
            <Popup className="custom-popup">Live user location</Popup>
          </Marker>

          <Circle center={center} radius={500} pathOptions={{ color: "#22d3ee", fillColor: "#22d3ee", fillOpacity: 0.08, weight: 1 }} />

          {activeMarkers.map(({ incident, position }) => (
            <Fragment key={incident.id}>
              <Marker position={position} icon={markerIcon("#ef4444", 20, true)}>
                <Popup className="custom-popup">
                  <div className="space-y-1 p-1 text-xs">
                    <p className="font-bold text-white">{formatLabel(incident.category || incident.type || "Emergency")}</p>
                    <p className="text-slate-300">{formatLabel(normalizeIncidentState(incident.status || incident.lifecycleStage))}</p>
                  </div>
                </Popup>
              </Marker>
              <Circle center={position} radius={900} pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.08, weight: 1 }} />
            </Fragment>
          ))}

          {activeResponders.map((responder) => (
            <Marker key={responder.uid || responder.id} position={responderPosition(responder)} icon={markerIcon(roleColor[responder.role] || "#34d399")}>
              <Popup className="custom-popup">
                <div className="space-y-1 p-1 text-xs">
                  <p className="font-bold text-white">{responder.name || responder.fullName || "Responder"}</p>
                  <p className="capitalize text-slate-300">{responder.role || "unit"} · {responder.status || "available"}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {nearbyServices.map((service) => (
            <Marker key={service.id} position={service.pos || [service.lat, service.lng]} icon={markerIcon(serviceColor[service.type] || serviceColor.service, 13)}>
              <Popup className="custom-popup">
                <div className="space-y-2 p-1 text-xs">
                  <p className="font-bold text-white">{service.name}</p>
                  <p className="capitalize text-slate-300">{service.type} · {service.distanceKm ? `${service.distanceKm.toFixed(1)} km` : "nearby"}</p>
                  <div className="flex gap-2">
                    {service.phone && <a className="rounded-lg bg-emerald-600 px-2 py-1 text-white" href={`tel:${service.phone}`}>Call</a>}
                    <a className="rounded-lg bg-cyan-600 px-2 py-1 text-white" href={`https://maps.google.com/?q=${service.lat},${service.lng}`} target="_blank" rel="noreferrer">Directions</a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {routes.map((route, index) => (
            <Polyline key={index} positions={route} pathOptions={{ color: "#38bdf8", weight: 5, opacity: 0.82, dashArray: "10 12" }} />
          ))}
        </MapContainer>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] bg-gradient-to-b from-slate-950/95 via-slate-950/55 to-transparent px-4 pb-8 pt-4">
        <div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Live tracking</p>
            <h1 className="mt-1 text-xl font-black text-white">{activeEmergency ? "Responder tracking" : "Live map"}</h1>
            <p className="mt-1 text-xs text-slate-300">{activeEmergency ? "RoadSOS is updating this automatically." : "Your live location is ready."}</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-24 z-[500]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/86 p-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-200">
              <Navigation className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">
                {assignedResponders[0]?.name || assignedResponders[0]?.fullName || (activeEmergency ? "Responder updates pending" : "Live location active")}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {activeEmergency ? `ETA ${eta ? `${Math.ceil(eta / 60)} min` : "updating"} · ${formatLabel(normalizeIncidentState(activeIncident?.status || activeIncident?.lifecycleStage))}` : gpsError ? "GPS signal limited" : "Map updates automatically"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
