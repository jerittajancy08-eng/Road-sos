import AdminCard from "../components/admin/AdminCard";
import AdminStatCard from "../components/admin/AdminStatCard";
import AdminStatusBadge from "../components/admin/AdminStatusBadge";
import { auth } from "../firebase";
import { isResponderRole, useAdminCollection } from "./useAdminCollection";
import { isActiveIncident, isDispatchReadyResponder } from "./adminUtils";

export default function SystemStatus() {
  const { items: users, loading: usersLoading, error: userError } = useAdminCollection("users");
  const { items: responders, loading: respondersLoading, error: responderError } = useAdminCollection("responders");
  const { items: incidents, loading: incidentsLoading, error: incidentError } = useAdminCollection("incidents", { orderBy: "createdAt" });
  const activeResponders = users
    .filter((user) => isResponderRole(user.role))
    .map((user) => ({ ...user, ...(responders.find((item) => item.uid === user.uid || item.id === user.uid || item.uid === user.id) || {}) }))
    .filter(isDispatchReadyResponder);
  const liveIncidents = incidents.filter(isActiveIncident);
  const firebaseOk = !userError && !incidentError && !responderError;
  const listenersReady = !usersLoading && !incidentsLoading && !respondersLoading && firebaseOk;
  const gpsOk = liveIncidents.length === 0 || liveIncidents.some((incident) => incident.liveLocation || incident.location || incident.pos || incident.victimLocation);
  const notificationOk = liveIncidents.length === 0 || liveIncidents.some((incident) => incident.notificationsSent || incident.responders?.length || incident.assignedResponderId);
  const connection = typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : firebaseOk ? "online" : "degraded";
  const authState = auth.currentUser ? "active" : "pending";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">System Status</h1>
        <p className="mt-1 text-sm text-slate-500">Health checks for Firebase, protection, dispatch, and responder systems.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Firebase Connectivity" value={connection} tone={firebaseOk ? "green" : "red"} />
        <AdminStatCard label="Active Responders Online" value={activeResponders.length} tone="green" />
        <AdminStatCard label="Live Incident Count" value={liveIncidents.length} tone={liveIncidents.length ? "red" : "cyan"} />
        <AdminStatCard label="Listener State" value={listenersReady ? "Synced" : "Degraded"} tone={listenersReady ? "green" : "red"} />
      </div>
      <AdminCard title="Subsystems">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Firebase connection state", connection],
            ["Auth state", authState],
            ["Listener status", listenersReady ? "active" : "degraded"],
            ["Server health", firebaseOk ? "active" : "degraded"],
            ["GPS tracking status", gpsOk ? "active" : "pending"],
            ["Notification system state", notificationOk ? "active" : "pending"],
            ["Map service", gpsOk ? "active" : "pending"],
            ["Websocket state", connection === "online" ? "active" : connection],
            ["Incident listener", incidentError ? "rejected" : "active"],
            ["Approval listener", userError ? "rejected" : "active"],
            ["Dispatch engine", activeResponders.length ? "active" : "pending"],
            ["Emergency network uptime", firebaseOk ? "online" : "offline"],
          ].map(([label, status]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
              <span className="text-sm font-semibold text-white">{label}</span>
              <AdminStatusBadge value={status} />
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
