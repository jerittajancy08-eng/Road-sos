import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import AdminCard from "../components/admin/AdminCard";
import AdminIncidentCard from "../components/admin/AdminIncidentCard";
import AdminStatusBadge from "../components/admin/AdminStatusBadge";
import { db } from "../firebase";
import { isResponderRole, useAdminCollection } from "./useAdminCollection";
import {
  INCIDENT_STATES,
  RESPONDER_STATES,
  distanceScore,
  estimateEtaSeconds,
  getLicense,
  getResponderDisplayName,
  getResponderUnitLabel,
  isActiveIncident,
  isDispatchReadyResponder,
  normalizeIncidentCategory,
} from "./adminUtils";

const roles = ["helper", "police", "hospital", "fire"];

export default function DispatchCenter() {
  const { items: users } = useAdminCollection("users");
  const { items: respondersCollection } = useAdminCollection("responders");
  const { items: incidents } = useAdminCollection("incidents", { orderBy: "createdAt" });
  const approvedResponders = users
    .filter((user) => isResponderRole(user.role))
    .map((user) => {
      const live = respondersCollection.find((item) => item.id === user.uid || item.uid === user.uid || item.uid === user.id);
      return { ...user, ...live, uid: user.uid || user.id || live?.uid || live?.id };
    })
    .filter(isDispatchReadyResponder);
  const activeIncidents = incidents.filter(isActiveIncident);

  const assignResponder = async (incident, responder) => {
    const responderId = responder.uid || responder.id;
    if (!responderId || (incident.assignedResponderId && incident.assignedResponderId !== responderId)) return;
    const etaSeconds = estimateEtaSeconds(responder, incident);
    const responderName = getResponderDisplayName(responder);
    await setDoc(
      doc(db, "incidents", incident.id),
      {
        category: normalizeIncidentCategory(incident.category || incident.type || incident.emergencyType),
        status: INCIDENT_STATES.RESPONDER_ASSIGNED,
        lifecycleStage: INCIDENT_STATES.RESPONDER_ASSIGNED,
        responderId,
        assignedResponderId: responderId,
        assignedResponderType: responder.role,
        responders: [{
          uid: responderId,
          role: responder.role,
          name: responderName,
          badgeId: getLicense(responder),
          unitLabel: getResponderUnitLabel(responder),
          status: INCIDENT_STATES.RESPONDER_ASSIGNED,
        }],
        assignedAt: serverTimestamp(),
        eta: etaSeconds,
        ETA: etaSeconds,
        etaSeconds,
        routeHistory: responder.pos && incident.location ? [{ from: responder.pos, to: incident.location, etaSeconds, at: new Date().toISOString() }] : [],
        statusHistory: [...(incident.statusHistory || []), { status: INCIDENT_STATES.RESPONDER_ASSIGNED, actorName: responderName, at: new Date().toISOString() }],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    await setDoc(
      doc(db, "responders", responderId),
      {
        uid: responderId,
        role: responder.role,
        type: responder.role,
        name: responderName,
        badgeId: getLicense(responder),
        unitLabel: getResponderUnitLabel(responder),
        phone: responder.phone || "",
        verificationStatus: "APPROVED",
        availability: RESPONDER_STATES.BUSY,
        status: RESPONDER_STATES.BUSY,
        missionState: RESPONDER_STATES.RESPONDING,
        online: true,
        available: false,
        activeMissionCount: Number(responder.activeMissionCount || 0) + 1,
        assignedIncidentId: incident.id,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    await addDoc(collection(db, "activityLogs"), {
      incidentId: incident.id,
      title: "Responder assigned",
      subtitle: `${responderName} (${responder.role}, ${getResponderUnitLabel(responder)}) assigned from dispatch center`,
      type: "dispatch",
      severity: "high",
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "notifications"), {
      incidentId: incident.id,
      audience: "responder",
      responderId,
      title: "New emergency assignment",
      body: "Review and accept or reject this incident.",
      severity: "HIGH",
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  const patchIncident = (incident, patch) => setDoc(doc(db, "incidents", incident.id), { ...patch, updatedAt: serverTimestamp() }, { merge: true });

  const removeResponder = async (incident) => {
    const responderId = incident.assignedResponderId || incident.responderId;
    if (!responderId) return;
    await patchIncident(incident, {
      status: INCIDENT_STATES.PENDING_RESPONSE,
      lifecycleStage: INCIDENT_STATES.PENDING_RESPONSE,
      assignedResponderId: "",
      responderId: "",
      responders: [],
    });
    await setDoc(doc(db, "responders", responderId), { availability: RESPONDER_STATES.AVAILABLE, status: RESPONDER_STATES.ONLINE, missionState: RESPONDER_STATES.AVAILABLE, available: true, assignedIncidentId: "", updatedAt: serverTimestamp() }, { merge: true });
  };

  const closeIncident = (incident) => patchIncident(incident, { status: INCIDENT_STATES.CLOSED, lifecycleStage: INCIDENT_STATES.CLOSED, closedAt: serverTimestamp() });
  const escalateIncident = (incident) => patchIncident(incident, { severity: "critical", priority: "critical" });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Dispatch Center</h1>
        <p className="mt-1 text-sm text-slate-500">Assign approved available responders to active incidents.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <AdminCard><p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Dispatch Queue</p><p className="mt-2 text-3xl font-black text-white">{activeIncidents.filter((item) => !item.assignedResponderId).length}</p></AdminCard>
            <AdminCard><p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Active Missions</p><p className="mt-2 text-3xl font-black text-white">{activeIncidents.filter((item) => item.assignedResponderId).length}</p></AdminCard>
            <AdminCard><p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Dispatch Ready</p><p className="mt-2 text-3xl font-black text-white">{approvedResponders.length}</p></AdminCard>
          </div>
          {activeIncidents.map((incident) => (
            <AdminIncidentCard key={incident.id} incident={incident}>
              <div className="mb-4 flex flex-wrap gap-2">
                <button onClick={() => escalateIncident(incident)} className="rounded-2xl bg-red-500/15 px-3 py-2 text-xs font-bold text-red-300 ring-1 ring-red-400/30">Escalate</button>
                <button onClick={() => removeResponder(incident)} disabled={!incident.assignedResponderId} className="rounded-2xl bg-yellow-500/15 px-3 py-2 text-xs font-bold text-yellow-300 ring-1 ring-yellow-400/30 disabled:opacity-40">Remove Responder</button>
                <button onClick={() => closeIncident(incident)} className="rounded-2xl bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30">Close Incident</button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {roles.map((role) => {
                  const candidates = approvedResponders
                    .filter((user) => user.role === role)
                    .sort((a, b) => distanceScore(a, incident) - distanceScore(b, incident));
                  return (
                    <div key={role} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">{role}</p>
                      <div className="space-y-2">
                        {candidates.slice(0, 4).map((responder) => (
                          <button
                            key={responder.uid || responder.id}
                            onClick={() => assignResponder(incident, responder)}
                            disabled={Boolean(incident.assignedResponderId)}
                            className="flex w-full items-center justify-between rounded-xl bg-slate-950/80 px-3 py-2 text-left text-xs text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span>
                              {getResponderDisplayName(responder)}
                              <span className="block text-[10px] text-slate-500">{getResponderUnitLabel(responder)} · {getLicense(responder)}</span>
                            </span>
                            <span className="text-cyan-300">{incident.assignedResponderId === (responder.uid || responder.id) ? "Assigned" : "Assign"}</span>
                          </button>
                        ))}
                        {!candidates.length && <p className="text-xs text-slate-500">No approved available responders.</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AdminIncidentCard>
          ))}
          {!activeIncidents.length && <p className="text-sm text-slate-500">No active incidents available for dispatch.</p>}
        </div>
        <AdminCard title="Approved Responders" subtitle="Filtered by role, approval, and availability">
          <div className="space-y-3">
            {approvedResponders.map((responder) => (
              <div key={responder.uid || responder.id} className="rounded-2xl bg-white/5 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{getResponderDisplayName(responder)}</p>
                    <p className="text-xs text-slate-500">{responder.role} · {getResponderUnitLabel(responder)} · {getLicense(responder)}</p>
                  </div>
                  <AdminStatusBadge value={responder.verificationStatus} />
                </div>
              </div>
            ))}
            {!approvedResponders.length && <p className="text-sm text-slate-500">No dispatch-ready responders.</p>}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
