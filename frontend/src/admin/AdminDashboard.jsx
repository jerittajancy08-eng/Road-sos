import { useEffect, useMemo, useRef } from "react";
import { Activity, MapPin, RadioTower, ShieldAlert } from "lucide-react";
import AdminStatCard from "../components/admin/AdminStatCard";
import AdminCard from "../components/admin/AdminCard";
import AdminIncidentCard from "../components/admin/AdminIncidentCard";
import AdminStatusBadge from "../components/admin/AdminStatusBadge";
import { formatTimestamp, isResponderRole, useAdminCollection } from "./useAdminCollection";
import { formatLabel, getIncidentType, isActiveIncident } from "./adminUtils";

function getIncidentDate(incident) {
  const value = incident.createdAt || incident.updatedAt;
  if (typeof value?.toDate === "function") return value.toDate();
  const date = new Date(value);
  return date.toString() === "Invalid Date" ? null : date;
}

function averageResponse(incidents) {
  const values = incidents
    .map((incident) => Number(incident.responseTimeSeconds || incident.etaSeconds || incident.eta || 0))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!values.length) return "N/A";
  return `${Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)}s`;
}

export default function AdminDashboard() {
  const { items: users, loading: usersLoading, error: usersError } = useAdminCollection("users");
  const { items: incidents, loading: incidentsLoading, error: incidentsError } = useAdminCollection("incidents", { orderBy: "createdAt" });
  const { items: activityLogs } = useAdminCollection("activityLogs", { orderBy: "createdAt" });
  const responders = users.filter((user) => isResponderRole(user.role));
  const onlineResponders = responders.filter((user) => user.availability !== false && !["offline", "suspended"].includes(String(user.availability || user.status || "").toLowerCase()));
  const pending = responders.filter((user) => String(user.verificationStatus || "").toUpperCase() === "PENDING");
  const activeIncidents = incidents.filter(isActiveIncident);
  const critical = activeIncidents.filter((incident) => ["critical", "high"].includes(String(incident.severity || "").toLowerCase()));
  const previousActiveCount = useRef(activeIncidents.length);

  const categoryBreakdown = useMemo(() => {
    const counts = activeIncidents.reduce((acc, incident) => {
      const key = getIncidentType(incident);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [activeIncidents]);

  const recentActivity = activityLogs.length
    ? activityLogs.slice(0, 8)
    : incidents.slice(0, 8).map((incident) => ({
      id: incident.id,
      title: incident.type || incident.emergencyType || "Emergency incident",
      subtitle: incident.status || "active",
      createdAt: incident.createdAt,
      severity: incident.severity,
    }));

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300">Realtime Emergency Operations</p>
          <h1 className="mt-2 text-3xl font-black text-white">Command Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">Live Firebase command view for emergencies, responders, approvals, dispatch state, and system readiness.</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-200">
          {usersError || incidentsError ? "Realtime listener degraded" : "All realtime listeners online"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        <AdminStatCard label="Active Emergencies" value={activeIncidents.length} tone={activeIncidents.length ? "red" : "cyan"} detail={incidentsLoading ? "Syncing incidents" : "Live incident queue"} />
        <AdminStatCard label="Online Responders" value={onlineResponders.length} tone="green" detail={`${responders.length} registered responders`} />
        <AdminStatCard label="Pending Approvals" value={pending.length} tone={pending.length ? "yellow" : "green"} detail={usersLoading ? "Syncing accounts" : "Verification queue"} />
        <AdminStatCard label="Critical Alerts" value={critical.length} tone={critical.length ? "red" : "green"} detail="High severity active cases" />
        <AdminStatCard label="Avg Response Time" value={averageResponse(incidents)} detail="From incident records" />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[1.2fr_0.8fr]">
        <AdminCard title="Emergency Heatmap" subtitle="Current active zones by incident category">
          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            <div className="relative min-h-[300px] overflow-hidden rounded-3xl border border-cyan-300/10 bg-[#061426]">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />
              {activeIncidents.slice(0, 14).map((incident, index) => {
                const date = getIncidentDate(incident);
                const left = 12 + ((index * 29) % 76);
                const top = 15 + ((index * 41) % 68);
                return (
                  <div key={incident.id} className="absolute" style={{ left: `${left}%`, top: `${top}%` }}>
                    <span className="absolute -inset-4 rounded-full bg-red-500/10 emergency-pulse" />
                    <span className="relative flex h-4 w-4 rounded-full border-2 border-white bg-red-500 shadow-[0_0_24px_rgba(239,68,68,0.8)]" title={`${incident.type || "Emergency"} ${date ? date.toLocaleTimeString() : ""}`} />
                  </div>
                );
              })}
              {!activeIncidents.length && <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-slate-500">No active emergency zones</div>}
            </div>
            <div className="space-y-3">
              {categoryBreakdown.map(([label, count]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-white/5 p-3">
                  <span className="text-sm font-semibold text-white">{formatLabel(label)}</span>
                  <AdminStatusBadge value={count} />
                </div>
              ))}
              {!categoryBreakdown.length && <p className="text-sm text-slate-500">No categories active.</p>}
            </div>
          </div>
        </AdminCard>

        <AdminCard title="System Health" subtitle="Operational readiness cards">
          <div className="grid gap-3">
            {[
              ["Firebase Realtime", usersError || incidentsError ? "degraded" : "active", RadioTower],
              ["Dispatch Engine", "active", ShieldAlert],
              ["GPS Tracking", activeIncidents.some((item) => item.location || item.liveLocation || item.pos) ? "active" : "pending", MapPin],
              ["Activity Feed", recentActivity.length ? "active" : "pending", Activity],
            ].map(([label, status, Icon]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span className="flex items-center gap-3 text-sm font-semibold text-white"><Icon className="h-4 w-4 text-cyan-300" /> {label}</span>
                <AdminStatusBadge value={status} />
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[0.95fr_1.05fr]">
        <AdminCard title="Recent Activity Feed" subtitle="Live operations history">
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{item.title || "Operational update"}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.subtitle || item.type || "Realtime event"}</p>
                  </div>
                  <span className="text-[10px] text-slate-500">{formatTimestamp(item.createdAt)}</span>
                </div>
              </div>
            ))}
            {!recentActivity.length && <p className="text-sm text-slate-500">No activity records yet.</p>}
          </div>
        </AdminCard>

        <AdminCard title="Active Emergency Feed" subtitle="Latest live incidents requiring command attention">
          <div className="grid gap-4 xl:grid-cols-2">
            {activeIncidents.slice(0, 4).map((incident) => <AdminIncidentCard key={incident.id} incident={incident} />)}
            {!activeIncidents.length && <p className="text-sm text-slate-500">No active incidents.</p>}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
