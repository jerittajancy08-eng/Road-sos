import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { AnimatePresence, motion } from "framer-motion";
import L from "leaflet";
import { useEmergencyContext } from "../hooks/EmergencyContext";
import VerificationPendingCard from "./VerificationPendingCard";
import { dispatchTitles } from "../utils/roleUtils";
import LoadingMap from "./LoadingMap";
import { safePosition, isValidPosition } from "../utils/coordinateUtils";
import { INCIDENT_STATES, distanceScore, estimateEtaSeconds, formatLabel, normalizeIncidentState } from "../admin/adminUtils";

const accidentIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function HelperDashboard() {
  const { dispatchQueue, acceptIncident, rejectIncident, markEnRoute, markArrived, completeIncident, currentUserRole, responderApproved, isOnline, gpsError, userPos, userProfile } = useEmergencyContext();
  const requests = dispatchQueue;
  const mapRequests = requests.filter((req) => isValidPosition(req?.pos));
  const mapCenter = safePosition(mapRequests[0]?.pos);

  const calculateDistance = (req) => {
    const km = distanceScore({ pos: userPos }, req);
    return Number.isFinite(km) ? `${km.toFixed(1)} km` : "--";
  };

  const getRequestStatus = (req) => normalizeIncidentState(req.status || req.lifecycleStage);
  const isRequestAssignedToMe = (req) => req.assignedResponderId === userProfile.uid;
  const isRequestAssignedElsewhere = (req) => req.assignedResponderId && req.assignedResponderId !== userProfile.uid;

  return (
    <div className="min-h-full px-4 pt-4">
      <header className="road-card mb-3 flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Dispatch</p>
          <h1 className="mt-1 text-lg font-bold text-white">{dispatchTitles[currentUserRole] || "Helper Dispatch"}</h1>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <span className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${responderApproved ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-300" : "border-yellow-300/20 bg-yellow-400/10 text-yellow-300"}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
            {responderApproved ? "Live" : "Verification Pending"}
          </span>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-300">
            {gpsError ? "Offline" : "GPS Active"}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
            {isOnline ? "Connected" : "Offline"}
          </span>
        </div>
      </header>

      {!responderApproved && <VerificationPendingCard />}

      {responderApproved && (
        <>

      <div className="road-card relative mb-3 h-[235px] overflow-hidden">
        {!isValidPosition(mapCenter) ? <LoadingMap message={gpsError || "Getting your location..."} /> : <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {mapRequests.map((req) => (
            <Marker key={req.id} position={req.pos} icon={accidentIcon}>
              <Popup className="custom-popup">
                <div className="p-2 min-w-[120px]">
                  <p className="mb-1 text-[10px] font-black uppercase text-red-500">Incident</p>
                  <p className="mb-3 text-xs font-bold">Severity: {req.severity}</p>
                  <button onClick={() => acceptIncident(req.id)} className="w-full rounded-lg bg-red-600 py-2 text-[10px] font-black uppercase tracking-widest text-white">Respond</button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>}
        <div className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-300 backdrop-blur-xl">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          Live requests
        </div>
      </div>

      <section className="road-card px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Active requests</h2>
          <span className="rounded-full border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-black text-red-300">{requests.length} Open</span>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {requests.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center">
                <p className="text-sm font-bold text-white">No active requests</p>
                <p className="mt-2 text-xs text-slate-500">Waiting for nearby incidents.</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Dispatch system active</p>
              </motion.div>
            ) : (
              requests.map((req) => (
                <motion.div key={req.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} layout className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Request #{req.id.slice(0, 6)}</p>
                      <p className="text-sm font-black tracking-tight text-white">{req.type || "Emergency detected"}</p>
                      <p className="mt-1 text-[10px] text-slate-400">From {req.reporter?.name || "RoadSOS user"}</p>
                    </div>
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black uppercase text-white">{req.severity}</span>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold"><span className="uppercase text-slate-500">Distance</span><span className="text-white">{calculateDistance(req)}</span></div>
                    <div className="flex justify-between text-[10px] font-bold"><span className="uppercase text-slate-500">ETA</span><span className="text-white">{estimateEtaSeconds({ pos: userPos }, req) ? `${Math.ceil(estimateEtaSeconds({ pos: userPos }, req) / 60)} min` : "Updating"}</span></div>
                    <div className="flex justify-between text-[10px] font-bold"><span className="uppercase text-slate-500">Status</span><span className="font-black uppercase text-cyan-300">{formatLabel(normalizeIncidentState(req.status))}</span></div>
                    {req.assignedResponderId && req.assignedResponderId !== userProfile.uid && <p className="text-[10px] text-slate-500">Assigned to another responder</p>}
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    <button
                      disabled={isRequestAssignedElsewhere(req) || ![INCIDENT_STATES.DETECTED, INCIDENT_STATES.REJECTED].includes(getRequestStatus(req))}
                      onClick={() => acceptIncident(req.id)}
                      className="rounded-2xl bg-cyan-600 py-3 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-40"
                    >
                      Accept
                    </button>
                    <button
                      disabled={isRequestAssignedElsewhere(req)}
                      onClick={() => rejectIncident(req.id)}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] py-3 text-[10px] font-black uppercase tracking-widest text-slate-300 disabled:opacity-40"
                    >
                      Reject
                    </button>
                    <button
                      disabled={!isRequestAssignedToMe(req) || getRequestStatus(req) !== INCIDENT_STATES.ACCEPTED}
                      onClick={() => markEnRoute(req.id)}
                      className="rounded-2xl bg-blue-600 py-3 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-40"
                    >
                      Route
                    </button>
                    <button
                      disabled={!isRequestAssignedToMe(req) || getRequestStatus(req) !== INCIDENT_STATES.EN_ROUTE}
                      onClick={() => markArrived(req.id)}
                      className="rounded-2xl bg-amber-600 py-3 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-40"
                    >
                      Arrived
                    </button>
                    <button
                      disabled={!isRequestAssignedToMe(req) || getRequestStatus(req) !== INCIDENT_STATES.ARRIVED}
                      onClick={() => completeIncident(req.id)}
                      className="rounded-2xl bg-emerald-600 py-3 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-40"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>
      </>
      )}
    </div>
  );
}
