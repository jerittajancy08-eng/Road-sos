import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { MapPin, Layers, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import LoadingMap from "./LoadingMap";
import { safePosition, isValidPosition, positionFromLatLng, validPositions } from "../utils/coordinateUtils";

const getServiceIcon = (type) => {
  const palette = {
    hospital: "#f472b6",
    police: "#22d3ee",
    fire: "#fb923c",
  };
  return L.divIcon({
    className: "bg-transparent",
    html: `<div class="w-3.5 h-3.5 rounded-full border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.12)]" style="background:${palette[type] || '#60a5fa'}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

export default function EmergencyMapPanel({ myLocation, services, activeResponder, movingResponder, routePath, onRequestHelp }) {
  const center = safePosition(myLocation);
  const movingPosition = movingResponder ? positionFromLatLng(movingResponder.lat, movingResponder.lng) : null;
  const pathCoordinates = validPositions(movingPosition ? [movingPosition, center] : routePath || []);
  const visibleServices = (services || [])
    .map((service) => ({ ...service, position: positionFromLatLng(service.lat, service.lng) }))
    .filter((service) => service.position);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75 }}
      className="glass-card relative overflow-hidden border border-white/10 shadow-[0_0_90px_rgba(0,0,0,0.28)]"
    >
      <div className="pointer-events-none absolute -right-10 top-4 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute left-5 top-5 z-10 rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300 shadow-[0_0_25px_rgba(15,23,42,0.4)]">
        <div className="flex items-center gap-2 text-cyan-300">
          <Layers size={18} />
          <span className="font-semibold text-white">Incident Grid</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">Live responder terrain and route tracking.</p>
      </div>

      <div className="absolute right-5 top-28 z-10 rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300 shadow-[0_0_25px_rgba(15,23,42,0.4)]">
        <div className="flex items-center gap-2 text-red-300">
          <AlertTriangle size={18} />
          <span className="font-semibold text-white">Active Route</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">Rescue units moving toward the incident location.</p>
      </div>

      <div className="h-[520px] w-full rounded-[2rem] overflow-hidden">
        {!isValidPosition(center) ? <LoadingMap /> : <MapContainer center={center} zoom={13} zoomControl={false} className="h-full w-full">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <Marker position={center} icon={L.divIcon({
            className: 'bg-transparent',
            html: `<div class="w-5 h-5 rounded-full border border-white/20 shadow-[0_0_20px_rgba(56,189,248,0.45)] bg-cyan-400"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}>
            <Popup className="custom-popup">Your Live Location</Popup>
          </Marker>

          {visibleServices.map((service) => (
            <Marker key={service.id} position={service.position} icon={getServiceIcon(service.type)}>
              <Popup className="custom-popup font-medium text-white">
                <div className="space-y-1">
                  <p className="font-bold text-sm">{service.name}</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-[0.25em]">{service.type}</p>
                  <button
                    onClick={() => onRequestHelp(service)}
                    className="mt-2 w-full rounded-2xl bg-cyan-500/10 px-3 py-2 text-[11px] font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
                  >
                    Request support
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {movingPosition && (
            <Marker
              position={movingPosition}
              icon={L.divIcon({
                className: 'bg-transparent',
                html: `<div class="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-red-500/20 shadow-[0_0_20px_rgba(248,113,113,0.35)]"><div class="h-3 w-3 rounded-full bg-red-300"></div></div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
              })}
            >
              <Popup className="custom-popup">Responder En Route</Popup>
            </Marker>
          )}

          {pathCoordinates.length > 1 && (
            <Polyline positions={pathCoordinates} pathOptions={{ color: "#22d3ee", weight: 5, opacity: 0.85, dashArray: "12, 12" }} />
          )}
        </MapContainer>}
      </div>

      <div className="absolute bottom-5 left-5 z-10 flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300 shadow-[0_0_25px_rgba(15,23,42,0.4)]">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-cyan-300" />
          <span className="font-semibold text-white">Geo coordinates live</span>
        </div>
        <span className="text-xs text-slate-400">Responder coverage, hazard zones, and route support are updated in realtime.</span>
      </div>
    </motion.div>
  );
}
