import { Fragment, useState } from "react";
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { ActivitySquare, HeartPulse, Map, Phone, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmergencyContext } from "../hooks/EmergencyContext";
import { formatLabel, getPosition, normalizeIncidentState } from "../admin/adminUtils";
import { isValidPosition, safePosition, validPositions } from "../utils/coordinateUtils";

const markerIcon = (color, size = 14) =>
  L.divIcon({
    className: "bg-transparent",
    html: `<div class="rounded-full border-2 border-white shadow-[0_0_16px_rgba(255,255,255,0.22)]" style="height:${size}px;width:${size}px;background:${color}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

function StatusTile({ label, value, tone = "cyan" }) {
  const tones = {
    cyan: "text-cyan-200 bg-cyan-400/10 ring-cyan-300/15",
    red: "text-red-200 bg-red-500/10 ring-red-300/15",
    green: "text-emerald-200 bg-emerald-400/10 ring-emerald-300/15",
  };
  return (
    <div className={`rounded-2xl p-3 ring-1 ${tones[tone] || tones.cyan}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function MiniLiveMap({ activeIncident, assignedResponder, userPos, onExpand }) {
  const center = safePosition(getPosition(activeIncident) || userPos);
  const userMarker = safePosition(userPos);
  const incidentMarker = getPosition(activeIncident);
  const responderMarker = assignedResponder ? getPosition(assignedResponder) : null;
  const route = validPositions([responderMarker, incidentMarker || userMarker]);

  return (
    <button onClick={onExpand} className="relative h-48 w-full overflow-hidden rounded-3xl border border-cyan-300/15 bg-slate-950 text-left">
      <MapContainer center={center} zoom={14} zoomControl={false} dragging scrollWheelZoom={false} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO &copy; OpenStreetMap" />
        {isValidPosition(userMarker) && (
          <Marker position={userMarker} icon={markerIcon("#22d3ee", 16)}>
            <Popup>Your live GPS</Popup>
          </Marker>
        )}
        {incidentMarker && (
          <Fragment>
            <Marker position={incidentMarker} icon={markerIcon("#ef4444", 18)}>
              <Popup>Active emergency</Popup>
            </Marker>
            <Circle center={incidentMarker} radius={650} pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.08, weight: 1 }} />
          </Fragment>
        )}
        {responderMarker && (
          <Marker position={responderMarker} icon={markerIcon("#34d399", 16)}>
            <Popup>{assignedResponder.name || assignedResponder.fullName || "Assigned responder"}</Popup>
          </Marker>
        )}
        {route.length > 1 && <Polyline positions={route} pathOptions={{ color: "#38bdf8", weight: 4, opacity: 0.8, dashArray: "8 10" }} />}
      </MapContainer>
      <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex items-center justify-between">
        <span className="rounded-full bg-slate-950/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-200 backdrop-blur">Live tracking</span>
        <span className="rounded-full bg-slate-950/80 px-3 py-1 text-[10px] font-black text-white backdrop-blur">Expand</span>
      </div>
    </button>
  );
}

export default function UserHomePage() {
  const navigate = useNavigate();
  const [sosSending, setSosSending] = useState(false);
  const {
    activeEmergency,
    activeIncident,
    emergencyStatus,
    emergencyLiteMode,
    eta,
    gpsError,
    isOnline,
    nearbyServices = [],
    protectionEnabled,
    responders = [],
    toggleProtection,
    triggerGlobalEmergency,
    userPos,
    userProfile,
  } = useEmergencyContext();

  const position = safePosition(userPos);
  const assignedResponder = responders.find((responder) => {
    const responderId = responder.uid || responder.id;
    return activeIncident?.assignedResponderId === responderId || activeIncident?.responders?.some((item) => item.uid === responderId || item.id === responderId);
  });
  const lifecycle = normalizeIncidentState(activeIncident?.status || activeIncident?.lifecycleStage);
  const nearestCare = nearbyServices.find((service) => ["hospital", "ambulance", "police", "fire"].includes(service.type)) || nearbyServices[0];

  const handleSOS = async () => {
    if (sosSending) return;
    setSosSending(true);
    try {
      await triggerGlobalEmergency(position[0], position[1]);
    } finally {
      setSosSending(false);
    }
  };

  return (
    <div className="min-h-full px-4 pt-4">
      <section className="road-card px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">RoadSOS</p>
            <h1 className="mt-1 text-xl font-black text-white">{activeEmergency ? "Help is being coordinated" : "Emergency overview"}</h1>
            <p className="mt-1 text-xs text-slate-400">{userProfile?.name || "RoadSOS User"}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${isOnline ? "bg-emerald-400/10 text-emerald-300" : "bg-red-500/10 text-red-200"}`}>
            {isOnline ? "Live" : "Offline"}
          </span>
        </div>

        <button
          onClick={activeEmergency ? undefined : handleSOS}
          disabled={sosSending}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_12px_28px_rgba(220,38,38,0.24)] transition disabled:opacity-70 ${activeEmergency ? "bg-red-500/20 text-red-100 ring-1 ring-red-300/20" : "bg-red-600 hover:bg-red-500"}`}
        >
          <ShieldAlert className="h-4 w-4" />
          {activeEmergency ? "SOS active" : sosSending ? "Broadcasting..." : "Emergency SOS"}
        </button>
      </section>

      {emergencyLiteMode && (
        <section className="road-card mt-3 border-amber-300/20 bg-amber-400/10 px-4 py-3">
          <p className="text-xs font-bold text-amber-200">Low-network emergency mode is ready.</p>
          <p className="mt-1 text-[11px] text-slate-300">RoadSOS will queue SOS requests, use cached GPS, and open SMS fallback for saved contacts.</p>
        </section>
      )}

      {activeEmergency && (
        <section className="road-card mt-3 border-red-400/20 bg-red-950/15 px-4 py-4">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-200">RoadSOS is handling this</p>
            <h2 className="mt-1 text-lg font-black text-white">{assignedResponder ? "Responder assigned" : "Finding the nearest responder"}</h2>
            <p className="mt-1 text-xs text-slate-300">
              {assignedResponder
                ? `${assignedResponder.name || assignedResponder.fullName || "Responder"} is connected. ${eta ? `ETA about ${Math.ceil(eta / 60)} min.` : "ETA is updating."}`
                : "Stay where you are if it is safe. Your live location is being shared."}
            </p>
          </div>

          <MiniLiveMap activeIncident={activeIncident} assignedResponder={assignedResponder} userPos={userPos} onExpand={() => navigate("/user/map")} />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/[0.05] p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">ETA</p>
              <p className="mt-1 text-lg font-black text-white">{eta ? `${Math.ceil(eta / 60)} min` : "Updating"}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.05] p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Status</p>
              <p className="mt-1 text-sm font-black text-white">{formatLabel(lifecycle)}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white/[0.04] px-4 py-3">
            <p className="text-sm font-bold text-white">You do not need to manage anything.</p>
            <p className="mt-1 text-xs text-slate-400">
              {gpsError ? "GPS signal is limited. RoadSOS will keep retrying location updates." : "Your live location is active and responders will receive updates automatically."}
            </p>
          </div>
          {nearestCare && (
            <div className="mt-3 rounded-2xl bg-white/[0.04] px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Nearest support</p>
              <p className="mt-1 text-sm font-bold text-white">{nearestCare.name}</p>
              <p className="mt-0.5 text-xs capitalize text-slate-400">{nearestCare.type} {nearestCare.distanceKm ? `· ${nearestCare.distanceKm.toFixed(1)} km` : ""}</p>
            </div>
          )}
        </section>
      )}

      {!activeEmergency && (
        <>
          <section className="mt-3 grid grid-cols-2 gap-3">
            <StatusTile label="Protection" value={protectionEnabled ? "Active" : "Paused"} tone={protectionEnabled ? "green" : "red"} />
            <StatusTile label="Incident" value="Clear" tone="green" />
            <StatusTile label="Responder ETA" value="Standby" />
            <StatusTile label="Nearby Units" value={responders.length} />
          </section>

          <section className="road-card mt-3 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Protection</p>
                <h2 className="mt-1 text-base font-black text-white">{protectionEnabled ? "Ready if you need help" : "Protection paused"}</h2>
                <p className="mt-1 text-xs text-slate-400">{gpsError || "Location and incident sync are ready."}</p>
              </div>
              <button onClick={toggleProtection} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-cyan-200">
                {protectionEnabled ? "Pause" : "Enable"}
              </button>
            </div>
          </section>

          <section className="mt-3 grid grid-cols-2 gap-3">
            <button onClick={() => navigate("/user/map")} className="road-card flex items-center gap-3 px-4 py-4 text-left">
              <Map className="h-5 w-5 text-cyan-300" />
              <span className="text-sm font-bold text-white">Live map</span>
            </button>
            <button onClick={() => navigate("/user/incidents")} className="road-card flex items-center gap-3 px-4 py-4 text-left">
              <ActivitySquare className="h-5 w-5 text-red-300" />
              <span className="text-sm font-bold text-white">Incidents</span>
            </button>
          </section>

          <section className="mb-4 mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="road-card px-4 py-4">
                <Phone className="h-4 w-4 text-emerald-300" />
                <p className="mt-2 text-xs font-black text-white">Emergency contacts</p>
                <p className="mt-1 text-[10px] text-slate-500">{userProfile?.emergencyContacts?.length || 0} saved</p>
              </div>
            </div>
            <div className="road-card px-4 py-4">
              <HeartPulse className="h-4 w-4 text-red-300" />
              <p className="mt-2 text-xs font-black text-white">Safety insights</p>
              <p className="mt-1 text-[10px] text-slate-500">Monitoring enabled</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
