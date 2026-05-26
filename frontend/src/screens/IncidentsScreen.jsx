import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useEmergencyContext } from '../hooks/EmergencyContext';
import VerificationPendingCard from "../components/VerificationPendingCard";
import { INCIDENT_STATES, formatLabel, normalizeIncidentState } from "../admin/adminUtils";

const terminal = [INCIDENT_STATES.RESOLVED, INCIDENT_STATES.CLOSED, "REJECTED"];

function incidentDate(value) {
  if (value?.toDate) return value.toDate();
  if (value?.toMillis) return new Date(value.toMillis());
  const parsed = value ? new Date(value) : null;
  return parsed && parsed.toString() !== "Invalid Date" ? parsed : null;
}

export default function IncidentsScreen() {
  const { currentUserRole, userProfile, dispatchQueue, incidents, responders, acceptHelperAlert, responderApproved } = useEmergencyContext();
  const isUser = currentUserRole === "user";
  const userIncidents = incidents.filter((incident) => incident.userId === userProfile?.uid || incident.createdBy === userProfile?.uid || incident.reporterId === userProfile?.uid);
  const completedIncidents = incidents.filter((incident) => terminal.includes(normalizeIncidentState(incident.status || incident.lifecycleStage)));
  const visibleActive = isUser ? userIncidents.filter((incident) => !terminal.includes(normalizeIncidentState(incident.status || incident.lifecycleStage))) : dispatchQueue;

  if (isUser) {
    return (
      <div className="relative z-10 flex h-full flex-col px-5 pt-6 pb-28 text-white overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2">Emergency History</h1>
        <p className="mb-6 text-xs text-slate-400">Your past RoadSOS incidents and response outcomes.</p>

        <div className="space-y-3">
          {userIncidents.length > 0 ? userIncidents.map((incident) => {
            const responderRecord = incident.responders?.find((item) => item.uid === incident.assignedResponderId) || incident.responders?.[0];
            const responder = responderRecord || responders.find((item) => item.id === incident.assignedResponderId || item.id === incident.responderId);
            const created = incidentDate(incident.createdAt) || incidentDate(incident.timestamp) || incidentDate(incident.time);
            const responseSeconds = incident.assignedAt?.toMillis && incident.createdAt?.toMillis
              ? Math.max(0, Math.round((incident.assignedAt.toMillis() - incident.createdAt.toMillis()) / 1000))
              : incident.etaSeconds || incident.eta || 0;
            return (
              <div key={incident.id} className="rounded-[28px] bg-slate-950/85 px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/10 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{incident.type || incident.emergencyType || "Emergency"}</p>
                    <p className="mt-1 text-xs text-slate-400">{created ? created.toLocaleString() : "Timestamp syncing"}</p>
                  </div>
                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-slate-300">{formatLabel(normalizeIncidentState(incident.status || incident.lifecycleStage))}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-slate-500">Responder</p>
                    <p className="mt-1 font-semibold text-white">{responder?.name || responder?.fullName || "Not assigned"}</p>
                    {responder?.role && <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">{responder.role}</p>}
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-slate-500">Response time</p>
                    <p className="mt-1 font-semibold text-white">{responseSeconds ? `${Math.ceil(responseSeconds / 60)} min` : "Pending"}</p>
                  </div>
                  <div className="col-span-2 rounded-2xl bg-white/5 p-3">
                    <p className="text-slate-500">Resolved</p>
                    <p className="mt-1 font-semibold text-white">{incidentDate(incident.completedAt)?.toLocaleString() || incidentDate(incident.resolvedAt)?.toLocaleString() || "Not resolved yet"}</p>
                  </div>
                  <div className="col-span-2 rounded-2xl bg-white/5 p-3">
                    <p className="text-slate-500">Timeline</p>
                    <div className="mt-2 space-y-1">
                      {(incident.statusHistory || incident.activity || []).slice(0, 4).map((event, index) => (
                        <p key={index} className="text-[10px] text-slate-300 capitalize">{formatLabel(event.status || event.action)} by {event.actorName || "system"}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="rounded-[28px] bg-slate-950/85 px-4 py-8 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/10 backdrop-blur-xl text-center text-slate-300">
              <CheckCircle className="mx-auto mb-3 h-6 w-6 text-emerald-400" />
              <p className="text-sm font-semibold text-white">No emergency history</p>
              <p className="text-xs mt-2">Your completed or active SOS incidents will appear here.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-full flex-col px-5 pt-6 pb-28 text-white overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Incidents</h1>

      {!responderApproved && <VerificationPendingCard />}

      {responderApproved && <div className="space-y-3">
        {visibleActive.length > 0 ? visibleActive.map((incident) => (
          <div key={incident.id} className={`rounded-[28px] bg-slate-950/85 px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/10 backdrop-blur-xl border-l-4 ${incident.status === 'accepted' || incident.status === 'enroute' || incident.status === 'arrived' ? 'border-yellow-500' : incident.status === 'dispatched' || incident.status === 'detected' ? 'border-cyan-500' : 'border-slate-600'}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  {incident.status === 'accepted' || incident.status === 'enroute' || incident.status === 'arrived' ? <Clock className="h-4 w-4 text-yellow-400" /> : <AlertCircle className="h-4 w-4 text-cyan-400" />}
                  {incident.status === 'accepted' || incident.status === 'enroute' || incident.status === 'arrived' ? 'In progress' : 'Pending'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Severity {incident.severity}</p>
                <p className="text-xs text-slate-500 mt-1">{incident.responders?.length ? `${incident.responders.length} responders attached` : 'Awaiting acceptance'}</p>
              </div>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300 uppercase tracking-[0.35em]">
                {incident.status}
              </span>
            </div>
            {['helper', 'police', 'hospital', 'fire'].includes(currentUserRole) && [INCIDENT_STATES.DETECTED, INCIDENT_STATES.PENDING_RESPONSE].includes(normalizeIncidentState(incident.status || incident.lifecycleStage)) && (
              <button
                type="button"
                onClick={() => acceptHelperAlert(incident.id)}
                className="mt-4 w-full rounded-3xl bg-cyan-500 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-cyan-400 transition"
              >
                Accept alert
              </button>
            )}
          </div>
        )) : (
          <div className="rounded-[28px] bg-slate-950/85 px-4 py-8 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/10 backdrop-blur-xl text-center text-slate-300">
            <CheckCircle className="mx-auto mb-3 h-6 w-6 text-emerald-400" />
            <p className="text-sm font-semibold text-white">No active incidents</p>
            <p className="text-xs mt-2">Waiting for nearby incidents.</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Dispatch system active</p>
          </div>
        )}
      </div>}

      {responderApproved && completedIncidents.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-white uppercase tracking-[0.45em] text-slate-400">Completed</h2>
          {completedIncidents.slice(0, 5).map((record) => (
            <div key={record.id} className="rounded-[28px] bg-slate-950/90 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white">{record.emergencyType || 'Emergency'} completed</p>
                <span className="text-[10px] text-slate-400">{(incidentDate(record.resolvedAt) || incidentDate(record.completedAt) || incidentDate(record.createdAt))?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "Synced"}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Severity {record.severity}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
