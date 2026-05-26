import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import AdminCard from "../components/admin/AdminCard";
import AdminIncidentCard from "../components/admin/AdminIncidentCard";
import AdminStatusBadge from "../components/admin/AdminStatusBadge";
import { db } from "../firebase";
import { isResponderRole, useAdminCollection } from "./useAdminCollection";

const roles = ["helper", "police", "hospital", "fire"];

function getPos(item) {
  const loc = item.liveLocation || item.location || item.victimLocation || item.lastKnownLocation || item.pos;
  if (Array.isArray(loc) && loc.length === 2) return [Number(loc[0]), Number(loc[1])];
  if (loc?.lat && loc?.lng) return [Number(loc.lat), Number(loc.lng)];
  return null;
}

function distanceScore(a, b) {
  const from = getPos(a);
  const to = getPos(b);
  if (!from || !to) return Number.POSITIVE_INFINITY;
  return Math.hypot(from[0] - to[0], from[1] - to[1]);
}

export default function DispatchCenter() {
  const { items: users } = useAdminCollection("users");
  const { items: respondersCollection } = useAdminCollection("responders");
  const { items: incidents } = useAdminCollection("incidents", { orderBy: "createdAt" });
  const approvedResponders = users
    .filter((user) => isResponderRole(user.role) && (user.verificationStatus === "approved" || user.verified === true))
    .map((user) => {
      const live = respondersCollection.find((item) => item.id === user.uid || item.uid === user.uid);
      return { ...user, ...live, uid: user.uid || live?.uid || live?.id };
    })
    .filter((user) => ["online", "available", true, undefined].includes(user.availability ?? user.status) && !user.assignedIncidentId);
  const activeIncidents = incidents.filter((incident) => !["completed", "resolved", "closed"].includes(String(incident.status || "").toLowerCase()));

  const assignResponder = async (incident, responder) => {
    const responderId = responder.uid || responder.id;
    if (!responderId || (incident.assignedResponderId && incident.assignedResponderId !== responderId)) return;
    const etaSeconds = Number.isFinite(distanceScore(responder, incident))
      ? Math.max(60, Math.round(distanceScore(responder, incident) * 90000))
      : 0;
    await setDoc(
      doc(db, "incidents", incident.id),
      {
        status: "assigned",
        responderId,
        assignedResponderId: responderId,
        assignedResponderType: responder.role,
        responders: [{ uid: responderId, role: responder.role, status: "assigned" }],
        assignedAt: serverTimestamp(),
        eta: etaSeconds,
        ETA: etaSeconds,
        etaSeconds,
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
        name: responder.fullName || responder.name || responder.email || "Responder",
        phone: responder.phone || "",
        verified: true,
        availability: "busy",
        status: "assigned",
        assignedIncidentId: incident.id,
        pos: getPos(responder) || [28.6139, 77.2090],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    await addDoc(collection(db, "activityLogs"), {
      incidentId: incident.id,
      title: "Responder assigned",
      subtitle: `${responder.fullName || responder.email || responder.role} assigned from dispatch center`,
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Dispatch Center</h1>
        <p className="mt-1 text-sm text-slate-500">Assign approved available responders to active incidents.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {activeIncidents.map((incident) => (
            <AdminIncidentCard key={incident.id} incident={incident}>
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
                            <span>{responder.fullName || responder.name || responder.email}</span>
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
                    <p className="text-sm font-bold text-white">{responder.fullName || responder.name || responder.email}</p>
                    <p className="text-xs text-slate-500">{responder.role}</p>
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
