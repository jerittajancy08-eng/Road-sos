import AdminCard from "../components/admin/AdminCard";
import AdminStatCard from "../components/admin/AdminStatCard";
import AdminStatusBadge from "../components/admin/AdminStatusBadge";
import { isResponderRole, useAdminCollection } from "./useAdminCollection";

export default function SystemStatus() {
  const { items: users, error: userError } = useAdminCollection("users");
  const { items: incidents, error: incidentError } = useAdminCollection("incidents", { orderBy: "createdAt" });
  const activeResponders = users.filter((user) => isResponderRole(user.role) && user.verificationStatus === "approved" && user.availability !== false);
  const liveIncidents = incidents.filter((incident) => !["completed", "resolved", "closed"].includes(String(incident.status || "").toLowerCase()));
  const firebaseOk = !userError && !incidentError;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">System Status</h1>
        <p className="mt-1 text-sm text-slate-500">Health checks for Firebase, protection, dispatch, and responder systems.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Firebase Connectivity" value={firebaseOk ? "Online" : "Error"} tone={firebaseOk ? "green" : "red"} />
        <AdminStatCard label="Active Responders Online" value={activeResponders.length} tone="green" />
        <AdminStatCard label="Live Incident Count" value={liveIncidents.length} tone={liveIncidents.length ? "red" : "cyan"} />
        <AdminStatCard label="Dispatch Engine" value="Ready" />
      </div>
      <AdminCard title="Subsystems">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
            <span className="text-sm font-semibold text-white">Protection System</span>
            <AdminStatusBadge value="active" />
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
            <span className="text-sm font-semibold text-white">Dispatch Engine</span>
            <AdminStatusBadge value="active" />
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
            <span className="text-sm font-semibold text-white">Incident Listener</span>
            <AdminStatusBadge value={incidentError ? "rejected" : "active"} />
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
            <span className="text-sm font-semibold text-white">Approval Listener</span>
            <AdminStatusBadge value={userError ? "rejected" : "active"} />
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
