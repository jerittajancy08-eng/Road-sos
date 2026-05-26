import { AlertCircle, MapPin, Clock, CheckCircle, Navigation, Power } from "lucide-react";
import { useEmergencyContext } from '../hooks/EmergencyContext';

export default function DispatchScreen() {
  const { dispatchQueue, assignResponderToIncident, acceptIncident, rejectIncident, currentUserRole, userProfile, responders, updateIncidentStatus, completeIncident, setResponderAvailability, toast } = useEmergencyContext();
  const responderDoc = responders.find((item) => item.id === userProfile?.uid);
  const activeIncident = dispatchQueue.find((incident) => incident.assignedResponderId === userProfile?.uid) || dispatchQueue[0];
  const isAssignedToMe = activeIncident?.assignedResponderId === userProfile?.uid;
  const isResponder = ['helper', 'police', 'hospital', 'fire'].includes(currentUserRole);
  const mapLink = activeIncident?.pos ? `https://maps.google.com/?q=${activeIncident.pos[0]},${activeIncident.pos[1]}` : null;

  return (
    <div className="relative z-10 flex h-full flex-col px-5 pt-6 pb-28 text-white overflow-y-auto">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dispatch</h1>
          <p className="mt-1 text-xs text-slate-400">Incoming assignments update in realtime.</p>
        </div>
        {isResponder && (
          <select
            value={responderDoc?.availability || "online"}
            onChange={(event) => setResponderAvailability(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="busy">Busy</option>
          </select>
        )}
      </div>

      {toast && (
        <div className="mb-3 rounded-3xl border border-cyan-300/20 bg-cyan-500/10 px-4 py-3 text-xs font-semibold text-cyan-100">
          {toast.message}
        </div>
      )}

      <div className="space-y-3">
        {activeIncident ? (
          <div className="rounded-[28px] bg-slate-950/85 px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/10 backdrop-blur-xl border-l-4 border-rose-500">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                  <p className="text-sm font-semibold text-white">Active incident</p>
                </div>
                <div className="mt-3 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    <span>{activeIncident.severity === 'HIGH' ? 'High priority zone' : 'Nearby alert'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>{activeIncident.status === 'accepted' || activeIncident.status === 'in_progress' ? 'Responder active' : activeIncident.status}</span>
                  </div>
                </div>
              </div>
              {isResponder && isAssignedToMe && activeIncident.status === "assigned" ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => acceptIncident(activeIncident.id)}
                    className="rounded-2xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-400 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectIncident(activeIncident.id)}
                    className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
                  >
                    Reject
                  </button>
                </div>
              ) : ["active", "dispatched", "detected"].includes(activeIncident.status) ? (
                <button
                  onClick={() => currentUserRole === "helper" ? acceptIncident(activeIncident.id) : assignResponderToIncident(activeIncident.id)}
                  className="rounded-2xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-400 transition"
                >
                  Accept
                </button>
              ) : activeIncident.status === "in_progress" ? (
                <button
                  onClick={() => completeIncident(activeIncident.id)}
                  className="rounded-2xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-400 transition"
                >
                  Mark completed
                </button>
              ) : (
                <button
                  onClick={() => updateIncidentStatus(activeIncident.id, "in_progress")}
                  className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
                >
                  Reached location
                </button>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {mapLink && (
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-3 text-xs font-semibold text-white hover:bg-white/20"
                >
                  <Navigation className="h-4 w-4" />
                  Navigate
                </a>
              )}
              {isResponder && (
                <button
                  onClick={() => setResponderAvailability(responderDoc?.availability === "offline" ? "online" : "offline")}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 px-3 py-3 text-xs font-semibold text-white hover:bg-white/10"
                >
                  <Power className="h-4 w-4" />
                  Toggle
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] bg-slate-950/85 px-4 py-8 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/10 backdrop-blur-xl text-center text-slate-300">
                <CheckCircle className="mx-auto mb-3 h-6 w-6 text-emerald-400" />
                <p className="text-sm font-semibold text-white">No current dispatches</p>
            <p className="text-xs mt-2">The network is monitoring active incidents and will push new dispatches here.</p>
          </div>
        )}

        {dispatchQueue.slice(1).map((incident) => (
          <div key={incident.id} className="rounded-[28px] bg-slate-950/85 px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/10 backdrop-blur-xl border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Queued incident</p>
                <p className="text-xs text-slate-400 mt-1">Severity {incident.severity}</p>
              </div>
              <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs text-yellow-300">{incident.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
