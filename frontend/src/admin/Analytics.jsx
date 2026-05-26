import AdminStatCard from "../components/admin/AdminStatCard";
import AdminCard from "../components/admin/AdminCard";
import { isResponderRole, useAdminCollection } from "./useAdminCollection";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { INCIDENT_STATES, isActiveIncident, normalizeIncidentState } from "./adminUtils";

function asDate(value) {
  if (typeof value?.toDate === "function") return value.toDate();
  const date = new Date(value);
  return date.toString() === "Invalid Date" ? null : date;
}

function isToday(value) {
  const date = asDate(value);
  return date ? date.toDateString() === new Date().toDateString() : false;
}

function countBy(items, getter) {
  return items.reduce((acc, item) => {
    const key = getter(item) || "Awaiting Geocode";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

const chartColors = ["#22d3ee", "#ef4444", "#f59e0b", "#22c55e", "#a78bfa", "#fb7185"];

function Bars({ rows }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows}>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
          <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
          <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
          <Tooltip contentStyle={{ background: "#020814", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "#fff" }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {rows.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {!rows.length && <p className="text-sm text-slate-500">No records available.</p>}
    </div>
  );
}

function TrendChart({ rows }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows}>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
          <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
          <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
          <Tooltip contentStyle={{ background: "#020814", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "#fff" }} />
          <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: "#ef4444" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Breakdown({ rows }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="label" innerRadius={62} outerRadius={100} paddingAngle={3}>
            {rows.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "#020814", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "#fff" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Analytics() {
  const { items: users } = useAdminCollection("users");
  const { items: incidents } = useAdminCollection("incidents", { orderBy: "createdAt" });
  const responders = users.filter((user) => isResponderRole(user.role));
  const approved = responders.filter((user) => user.verificationStatus === "approved" || user.verified === true);
  const active = incidents.filter(isActiveIncident);
  const completed = incidents.filter((incident) => [INCIDENT_STATES.RESOLVED, INCIDENT_STATES.CLOSED].includes(normalizeIncidentState(incident.status || incident.lifecycleStage)));
  const today = incidents.filter((incident) => isToday(incident.createdAt));
  const responseValues = incidents.map((incident) => Number(incident.responseTimeSeconds || incident.etaSeconds || incident.eta || 0)).filter((value) => value > 0);
  const avgEta = responseValues.length ? Math.round(responseValues.reduce((sum, value) => sum + value, 0) / responseValues.length) : 0;

  const categoryRows = Object.entries(countBy(incidents, (incident) => incident.type || incident.emergencyType || incident.category)).map(([label, value]) => ({ label, value }));
  const statusRows = Object.entries(countBy(incidents, (incident) => incident.status || "active")).map(([label, value]) => ({ label, value }));
  const roleRows = Object.entries(countBy(responders, (responder) => responder.role)).map(([label, value]) => ({ label, value }));
  const zoneRows = Object.entries(countBy(incidents, (incident) => incident.city || incident.zone || incident.locationName || incident.address)).map(([label, value]) => ({ label, value })).slice(0, 8);

  const dailyRows = Array.from({ length: 7 }, (_, offset) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - offset));
    return {
      label: day.toLocaleDateString(undefined, { weekday: "short" }),
      value: incidents.filter((incident) => {
        const date = asDate(incident.createdAt);
        return date && date.toDateString() === day.toDateString();
      }).length,
    };
  });

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300">Realtime Intelligence</p>
        <h1 className="mt-2 text-3xl font-black text-white">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Incident trends, response timing, zones, categories, and responder performance from Firestore.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Incidents Today" value={today.length} />
        <AdminStatCard label="Active Incidents" value={active.length} tone={active.length ? "red" : "green"} />
        <AdminStatCard label="Resolved Incidents" value={completed.length} tone="green" />
        <AdminStatCard label="Average Response" value={avgEta ? `${avgEta}s` : "N/A"} />
        <AdminStatCard label="Approved Responders" value={approved.length} tone="green" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <AdminCard title="Incident Trends" subtitle="Last seven days"><TrendChart rows={dailyRows} /></AdminCard>
        <AdminCard title="Emergency Category Breakdown"><Breakdown rows={categoryRows} /></AdminCard>
        <AdminCard title="Active Zones"><Bars rows={zoneRows} /></AdminCard>
        <AdminCard title="Incident Status Mix"><Bars rows={statusRows} /></AdminCard>
        <AdminCard title="Responder Performance" subtitle="Registered verified role capacity"><Bars rows={roleRows} /></AdminCard>
      </div>
    </div>
  );
}
