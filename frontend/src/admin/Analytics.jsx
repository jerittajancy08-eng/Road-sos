import AdminStatCard from "../components/admin/AdminStatCard";
import AdminCard from "../components/admin/AdminCard";
import { isResponderRole, useAdminCollection } from "./useAdminCollection";

function isToday(value) {
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (date.toString() === "Invalid Date") return false;
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

export default function Analytics() {
  const { items: users } = useAdminCollection("users");
  const { items: incidents } = useAdminCollection("incidents", { orderBy: "createdAt" });
  const responders = users.filter((user) => isResponderRole(user.role));
  const approved = responders.filter((user) => user.verificationStatus === "approved");
  const pending = responders.filter((user) => user.verificationStatus === "pending");
  const active = incidents.filter((incident) => !["completed", "resolved", "closed"].includes(String(incident.status || "").toLowerCase()));
  const today = incidents.filter((incident) => isToday(incident.createdAt));
  const avgEta = incidents.length
    ? Math.round(incidents.reduce((sum, incident) => sum + Number(incident.eta || incident.etaSeconds || 0), 0) / incidents.length)
    : 0;

  const bars = [
    { label: "Users", value: users.length },
    { label: "Responders", value: responders.length },
    { label: "Approved", value: approved.length },
    { label: "Pending", value: pending.length },
    { label: "Active", value: active.length },
  ];
  const max = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Operational totals and response indicators.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total Users" value={users.length} />
        <AdminStatCard label="Total Responders" value={responders.length} tone="green" />
        <AdminStatCard label="Pending Responders" value={pending.length} tone="yellow" />
        <AdminStatCard label="Active Emergencies" value={active.length} tone="red" />
        <AdminStatCard label="Approved Responders" value={approved.length} tone="green" />
        <AdminStatCard label="Incidents Today" value={today.length} />
        <AdminStatCard label="Average Response Time" value={`${avgEta}s`} />
      </div>
      <AdminCard title="Operational Distribution" subtitle="Live Firestore-derived counters">
        <div className="space-y-4">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="mb-2 flex justify-between text-xs">
                <span className="font-bold text-slate-300">{bar.label}</span>
                <span className="font-mono text-white">{bar.value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-900">
                <div className="h-full rounded-full bg-cyan-400" style={{ width: `${(bar.value / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
