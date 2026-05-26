import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { Activity, CheckCircle2, Navigation, ShieldAlert, UserCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEmergencyContext } from "../hooks/EmergencyContext";
import LoadingMap from "../components/LoadingMap";
import { safePosition, isValidPosition, validPositions } from "../utils/coordinateUtils";

const userIcon = L.divIcon({
  className: "bg-transparent",
  html: '<div class="h-4 w-4 rounded-full border-2 border-white bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.65)]"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const responderIcon = L.divIcon({
  className: "bg-transparent",
  html: '<div class="flex h-5 w-5 items-center justify-center rounded-md border border-cyan-200 bg-cyan-300 text-[10px] font-black text-slate-950 shadow-[0_0_14px_rgba(34,211,238,0.45)]">+</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function LiveTrackingScreen() {
  const { userPos, ambPos, eta, helpers, activeIncident, emergencyStatus } = useEmergencyContext();
  const safeEta = Number.isFinite(eta) ? eta : 0;
  const etaLabel = `${Math.floor(safeEta / 60)}:${(safeEta % 60).toString().padStart(2, "0")}`;
  const userPosition = safePosition(userPos);
  const responderPosition = safePosition(ambPos, userPosition);
  const routeLine = validPositions([responderPosition, userPosition]);

  return (
    <div className="min-h-full px-4 pt-4">
      <header className="road-card mb-3 flex items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-red-300/20 bg-red-500/10 text-red-300">
            <Activity className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">Live Response Tracking</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {activeIncident ? `Case ID: ${activeIncident.id.slice(0, 10)}` : "No active incident"}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">ETA</p>
          <p className="mt-1 font-mono text-lg font-bold leading-none text-cyan-300">{etaLabel}</p>
        </div>
      </header>

      <div className="road-card relative mb-3 h-[305px] overflow-hidden">
        {!isValidPosition(userPosition) ? <LoadingMap /> : <MapContainer center={userPosition} zoom={14} zoomControl={false} className="h-full w-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <Marker position={userPosition} icon={userIcon}>
            <Popup className="custom-popup">Incident location</Popup>
          </Marker>
          {isValidPosition(responderPosition) && <Marker position={responderPosition} icon={responderIcon}>
            <Popup className="custom-popup">Responder en route</Popup>
          </Marker>}
          {routeLine.length === 2 && <Polyline positions={routeLine} pathOptions={{ color: "#67e8f9", weight: 4, opacity: 0.75, dashArray: "8 10" }} />}
        </MapContainer>}
        <div className="absolute left-4 top-4 z-[400] rounded-full border border-cyan-300/20 bg-slate-950/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200 backdrop-blur">
          Realtime Map
        </div>
      </div>

      <section className="road-card mb-3 px-5 py-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Incident Status</p>
            <h1 className="mt-1 text-lg font-bold text-white capitalize">{activeIncident ? emergencyStatus : "Monitoring standby"}</h1>
          </div>
          <span className="rounded-full border border-red-300/25 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-red-200">
            {activeIncident ? "Active" : "Standby"}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[72%] rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.45)]" />
        </div>
      </section>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="road-card p-4">
          <Navigation className="mb-2 h-4 w-4 text-cyan-300" />
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Ambulance</p>
          <p className="mt-1 text-sm font-bold text-white">{activeIncident?.assignedResponderId ? "Dispatched" : "Awaiting"}</p>
          <p className="mt-1 font-mono text-xs text-cyan-300">{activeIncident ? safeEta > 60 ? `${Math.ceil(safeEta / 60)} mins away` : "Arriving now" : "--"}</p>
        </div>
        <div className="road-card p-4">
          <ShieldAlert className="mb-2 h-4 w-4 text-emerald-300" />
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Police</p>
          <p className="mt-1 text-sm font-bold text-white">{activeIncident ? "Notified" : "Standby"}</p>
          <p className="mt-1 font-mono text-xs text-emerald-300 capitalize">{activeIncident?.status || "--"}</p>
        </div>
      </div>

      <section className="road-card px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCircle className="h-4 w-4 text-slate-400" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Responders</h2>
          </div>
          <span className="text-[10px] font-mono text-cyan-300">Live</span>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {helpers.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center">
                <p className="text-sm font-bold text-white">No responder assigned yet</p>
                <p className="mt-2 text-xs text-slate-500">Accepted responders will appear here in realtime.</p>
              </div>
            )}
            {helpers.map((helper) => (
              <motion.div
                key={helper.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between rounded-3xl border p-3 ${
                  helper.reached ? "border-emerald-300/30 bg-emerald-400/10" : helper.accepted ? "border-cyan-300/25 bg-cyan-400/10" : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${helper.reached ? "border border-emerald-300/40 bg-emerald-400/10 text-emerald-300" : helper.accepted ? "bg-cyan-400/10 text-cyan-300" : "bg-white/10 text-slate-400"}`}>
                    {helper.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{helper.name}</p>
                    <p className={`text-[10px] ${helper.reached ? "font-bold text-emerald-300" : "text-slate-400"}`}>
                      {helper.reached ? "Arrived to assist" : helper.distance}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-right">
                  {helper.reached ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : helper.accepted && <Activity className="h-4 w-4 text-cyan-300" />}
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${helper.reached ? "text-emerald-300" : helper.accepted ? "text-cyan-300" : "text-slate-500"}`}>
                    {helper.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-[11px] leading-relaxed text-slate-400">Community responders can secure the scene before ambulance arrival.</p>
        </div>
      </section>
    </div>
  );
}
