import { useEffect, useRef } from "react";
import AdminStatCard from "../components/admin/AdminStatCard";
import AdminCard from "../components/admin/AdminCard";
import AdminIncidentCard from "../components/admin/AdminIncidentCard";
import { isResponderRole, useAdminCollection } from "./useAdminCollection";

export default function AdminDashboard() {
  const { items: users } = useAdminCollection("users");
  const { items: incidents } = useAdminCollection("incidents", { orderBy: "createdAt" });
  const responders = users.filter((user) => isResponderRole(user.role));
  const pending = responders.filter((user) => user.verificationStatus === "pending");
  const activeIncidents = incidents.filter((incident) => !["completed", "resolved", "closed"].includes(String(incident.status || "").toLowerCase()));
  const previousActiveCount = useRef(activeIncidents.length);

  useEffect(() => {
    if (activeIncidents.length > previousActiveCount.current) {
      try {
        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.frequency.value = 880;
        gain.gain.setValueAtTime(0.04, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.35);
        oscillator.start();
        oscillator.stop(audio.currentTime + 0.35);
      } catch {}
    }
    previousActiveCount.current = activeIncidents.length;
  }, [activeIncidents.length]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Central command overview across civilians, responders, and live incidents.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total Users" value={users.length} />
        <AdminStatCard label="Responders" value={responders.length} tone="green" />
        <AdminStatCard label="Pending Approval" value={pending.length} tone="yellow" />
        <AdminStatCard label="Active Emergencies" value={activeIncidents.length} tone="red" />
      </div>
      {activeIncidents.length > 0 && (
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 emergency-pulse">
          Active emergency indicator: {activeIncidents.length} live incident{activeIncidents.length === 1 ? "" : "s"} require monitoring.
        </div>
      )}
      <div className="grid gap-5 xl:grid-cols-2">
        <AdminCard title="Responder Approval Queue" subtitle="Pending verification cases">
          <div className="space-y-3">
            {pending.slice(0, 5).map((user) => (
              <div key={user.uid || user.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold text-white">{user.fullName || user.name || user.email}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
                <span className="text-xs font-bold text-yellow-300">pending</span>
              </div>
            ))}
            {!pending.length && <p className="text-sm text-slate-500">No pending responders.</p>}
          </div>
        </AdminCard>
        <AdminCard title="Live Incidents" subtitle="Most recent emergency activity">
          <div className="space-y-3">
            {activeIncidents.slice(0, 3).map((incident) => <AdminIncidentCard key={incident.id} incident={incident} />)}
            {!activeIncidents.length && <p className="text-sm text-slate-500">No active incidents.</p>}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
