import { useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmergencyContext } from "../hooks/EmergencyContext";
import LoadingMap from "../components/LoadingMap";
import { safePosition, isValidPosition } from "../utils/coordinateUtils";

const userIcon = L.divIcon({
  className: "bg-transparent",
  html: '<div class="relative z-10 h-4 w-4 rounded-full border-2 border-white bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.65)]"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const responderIcon = (role) =>
  L.divIcon({
    className: "bg-transparent",
    html: `<div class="h-3 w-3 rounded-full border border-white/70 shadow-lg" style="background:${role === "police" ? "#60a5fa" : role === "hospital" ? "#fb7185" : role === "fire" ? "#f97316" : "#34d399"}"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

export default function HomeScreen() {
  const { userPos, triggerGlobalEmergency, responders = [], activeEmergency, emergencyStatus, eta, activeIncident, currentUserRole, gpsError } = useEmergencyContext();
  const [sosSending, setSosSending] = useState(false);
  const navigate = useNavigate();
  const mapCenter = safePosition(userPos);
  const visibleResponders = responders.filter((responder) => isValidPosition(responder.pos));

  const handleSOS = async () => {
    if (sosSending) return;
    setSosSending(true);
    try {
      await triggerGlobalEmergency(mapCenter[0], mapCenter[1]);
      navigate(currentUserRole === "user" ? "/user/tracking" : `/${currentUserRole || "user"}/home`);
    } finally {
      setSosSending(false);
    }
  };

  const speed = activeEmergency ? 0 : 65;
  const impact = activeEmergency ? "High" : "Normal";

  return (
    <div className="relative min-h-full px-4 pt-4">
      <div className="road-card mb-3 flex items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className={`h-2 w-2 shrink-0 rounded-full ${activeEmergency ? "bg-red-500" : "bg-emerald-400"} shadow-[0_0_12px_currentColor] animate-pulse`} />
          <span className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-white">Monitoring: Active</span>
        </div>
        <div className="flex shrink-0 gap-4 text-right font-mono">
          <div className="flex flex-col"><span className="text-[9px] text-slate-500">SPEED</span> <span className={`text-[11px] ${speed === 0 ? "font-bold text-red-400" : "text-cyan-300"}`}>{speed} km/h</span></div>
          <div className="flex flex-col"><span className="text-[9px] text-slate-500">IMPACT</span> <span className={`text-[11px] ${impact !== "Normal" ? "font-bold text-red-400" : "text-white"}`}>{impact}</span></div>
        </div>
      </div>

      <div className="road-card relative mb-3 h-[305px] overflow-hidden">
        {!isValidPosition(mapCenter) ? <LoadingMap message={gpsError || "Getting your location..."} /> : <MapContainer center={mapCenter} zoom={14} zoomControl={false} className="h-full w-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
          <Marker position={mapCenter} icon={userIcon}>
            <Popup>Your Location</Popup>
          </Marker>
          <Circle center={mapCenter} radius={800} pathOptions={{ color: "#67e8f9", fillColor: "#67e8f9", fillOpacity: 0.1, weight: 1 }} />
          {visibleResponders.map((responder) => (
            <Marker key={responder.id} position={responder.pos} icon={responderIcon(responder.role)}>
              <Popup className="custom-popup">
                <div className="p-2">
                  <p className="text-xs font-bold text-white">{responder.name}</p>
                  <p className="text-[10px] capitalize text-slate-400">{responder.role}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>}
        <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center">
          <div className="h-28 w-28 rounded-full border border-cyan-300/60 bg-cyan-300/10 shadow-[0_0_28px_rgba(34,211,238,0.28)]" />
        </div>
        <div className="absolute left-4 top-4 z-[400] rounded-full border border-cyan-300/20 bg-slate-950/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200 backdrop-blur">
          Live Map
        </div>
      </div>

      <div className="road-card mb-3 px-5 py-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Status</p>
            <h1 className="mt-1 text-lg font-bold text-white">{activeEmergency ? emergencyStatus : "Monitoring your route"}</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Responder ETA</p>
            <p className="mt-1 text-sm font-bold text-cyan-300">{activeEmergency && eta ? `${Math.ceil(eta / 60)} min` : "--"}</p>
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.55)] ${activeEmergency ? "w-[72%]" : "w-[42%]"}`} />
        </div>
      </div>

      <div className="road-card px-5 py-4">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Monitoring</p>
            <h2 className="mt-1 text-base font-bold text-white">Live sensor flow active</h2>
          </div>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${activeEmergency ? "border-red-300/25 bg-red-500/10 text-red-200" : "border-emerald-300/25 bg-emerald-400/10 text-emerald-300"}`}>
            {activeEmergency ? "SOS Live" : "Protected"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Speed</p>
            <p className="mt-1 font-mono text-lg font-bold text-cyan-200">{speed} km/h</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Impact Level</p>
            <p className={`mt-1 font-mono text-lg font-bold ${impact === "Normal" ? "text-white" : "text-red-300"}`}>{impact}</p>
          </div>
        </div>

        <button
          onClick={activeEmergency ? () => navigate(currentUserRole === "user" ? "/user/tracking" : `/${currentUserRole || "user"}/home`) : handleSOS}
          disabled={sosSending}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-300/25 bg-red-600 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-[0_12px_26px_rgba(220,38,38,0.22)] transition hover:bg-red-500 disabled:opacity-70"
        >
          <ShieldAlert className="h-4 w-4" />
          {activeEmergency ? `Track ${activeIncident?.id?.slice(0, 8) || "Incident"}` : sosSending ? "Broadcasting..." : "Emergency SOS"}
        </button>
      </div>
    </div>
  );
}
