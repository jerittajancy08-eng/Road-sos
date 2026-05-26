import { MapContainer, Marker, Polyline, Popup, TileLayer, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { useEmergencyContext } from "../hooks/EmergencyContext";

const makeIcon = (label, color) =>
  L.divIcon({
    className: "bg-transparent",
    html: `<div class="flex items-center gap-2 text-[11px] font-bold text-white whitespace-nowrap"><span class="h-3.5 w-3.5 rounded-full border border-white/70" style="background:${color}; box-shadow:0 0 14px ${color};"></span><span>${label}</span></div>`,
    iconSize: [120, 24],
    iconAnchor: [60, 12],
  });

const userIcon = makeIcon("Incident", "#fb7185");
const responderIcon = (status) => makeIcon(status === "available" ? "Available" : "Responder", status === "available" ? "#22c55e" : "#38bdf8");

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14, { animate: true });
  }, [center, map]);
  return null;
}

export default function ResponderMapScreen() {
  const { userPos, dispatchQueue, responders, eta, activeEmergency, activeRoute, activeIncident } = useEmergencyContext();
  const center = activeIncident?.pos || userPos || [28.6139, 77.2090];

  return (
    <div className="relative z-10 h-full text-white">
      <MapContainer center={center} zoom={14} zoomControl={false} className="h-full w-full">
        <RecenterMap center={center} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {activeIncident?.pos && (
          <>
            <Marker position={activeIncident.pos} icon={userIcon}>
              <Popup>Active incident</Popup>
            </Marker>
            <Circle
              center={activeIncident.pos}
              radius={650}
              pathOptions={{ color: "#fb7185", fillColor: "#fb7185", fillOpacity: 0.08, weight: 1 }}
            />
          </>
        )}

        {responders.map((responder) => (
          <Marker key={responder.id} position={responder.pos} icon={responderIcon(responder.status)}>
            <Popup>
              <div>
                <p className="text-xs font-bold">{responder.type || responder.role}</p>
                <p className="text-[10px] capitalize">{responder.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {activeRoute && (
          <Polyline positions={activeRoute} pathOptions={{ color: "#38bdf8", weight: 4, dashArray: "6 6" }} />
        )}
      </MapContainer>

      <div className="absolute inset-x-0 top-0 z-[500] px-5 pt-6 pb-4 bg-gradient-to-b from-slate-950/80 to-transparent">
        <h1 className="text-2xl font-bold">Live map</h1>
        <p className="mt-2 text-xs text-slate-400">
          {activeEmergency ? "Tracking assigned units and incident route" : "Awaiting incident dispatch"}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[500] px-5 pb-28 pt-4">
        <div className="rounded-[28px] bg-slate-950/85 px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Current dispatch</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {activeIncident ? `${activeIncident.severity} incident` : "No active incident"}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.35em] ${activeEmergency ? "bg-cyan-500/10 text-cyan-300" : "bg-white/5 text-slate-300"}`}>
              {activeEmergency ? activeIncident?.status : "Standby"}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-slate-900/90 p-4 border border-white/10">
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Queue</p>
              <p className="mt-2 text-base font-semibold text-white">{dispatchQueue.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/90 p-4 border border-white/10">
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">ETA</p>
              <p className="mt-2 text-base font-semibold text-white">{activeEmergency ? `${Math.max(0, Math.ceil(eta / 60))} min` : "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
