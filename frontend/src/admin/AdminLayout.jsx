import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ActivitySquare, BarChart3, ClipboardCheck, Gauge, LayoutDashboard, LogOut, Menu, RadioTower, ShieldAlert, Users, X } from "lucide-react";
import { isActiveIncident, isDispatchReadyResponder } from "./adminUtils";
import { isResponderRole, useAdminCollection } from "./useAdminCollection";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Responder Approvals", path: "/admin/approvals", icon: ClipboardCheck },
  { label: "Live Incidents", path: "/admin/incidents", icon: RadioTower },
  { label: "Dispatch Center", path: "/admin/dispatch", icon: ShieldAlert },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "System Status", path: "/admin/system", icon: Gauge },
];

function AdminSidebar({ onNavigate, onLogout }) {
  const [now, setNow] = useState(new Date());
  const { items: users, error: usersError } = useAdminCollection("users");
  const { items: responders, error: respondersError } = useAdminCollection("responders");
  const { items: incidents, error: incidentsError } = useAdminCollection("incidents", { orderBy: "createdAt" });
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const onlineResponders = users
    .filter((user) => isResponderRole(user.role))
    .map((user) => ({ ...user, ...(responders.find((item) => item.uid === user.uid || item.id === user.uid || item.uid === user.id) || {}) }))
    .filter(isDispatchReadyResponder).length;
  const activeIncidents = incidents.filter(isActiveIncident).length;
  const connected = !usersError && !respondersError && !incidentsError;

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col justify-between border-r border-cyan-300/10 bg-[#04111f]/95 p-5 shadow-[18px_0_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="min-h-0">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-red-300/20 bg-red-500/10 shadow-[0_0_28px_rgba(239,68,68,0.18)]">
            <ShieldAlert className="h-5 w-5 text-red-300" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.42em] text-cyan-300">RoadSOS</p>
            <h1 className="mt-1 text-lg font-black text-white">Command Center</h1>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
          <p className="text-xs font-bold text-white">Admin Operations</p>
          <p className="mt-1 font-mono text-xs text-cyan-200">{now.toLocaleTimeString()}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <span>Responders <b className="text-white">{onlineResponders}</b></span>
            <span>Incidents <b className="text-white">{activeIncidents}</b></span>
          </div>
          <p className={`mt-3 text-[10px] font-black uppercase tracking-[0.22em] ${connected ? "text-emerald-300" : "text-red-300"}`}>{connected ? "Realtime Connected" : "Realtime Degraded"}</p>
        </div>
      </div>
      <nav className="space-y-2">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200 ${
                isActive ? "bg-cyan-500/12 text-cyan-200 ring-1 ring-cyan-300/30 shadow-[0_0_24px_rgba(34,211,238,0.14)]" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      </div>
      <button onClick={onLogout} className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-red-200 transition hover:bg-red-500/20">
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </aside>
  );
}

function AdminTopbar({ onMenu }) {
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-5 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="rounded-xl bg-white/10 p-2 text-white lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <ActivitySquare className="h-5 w-5 text-cyan-300" />
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-slate-500">Centralized Emergency Control</p>
          <p className="text-sm font-semibold text-white">Realtime Firebase command center</p>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#020814] text-white">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(34,211,238,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.035)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.16),transparent_24%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.16),transparent_26%),linear-gradient(180deg,#061427_0%,#020814_64%)]" />
      <div className="relative z-10 flex min-h-screen">
        <div className="hidden lg:block">
          <AdminSidebar onLogout={onLogout} />
        </div>
        {sidebarOpen && (
          <div className="fixed inset-0 z-[1000] lg:hidden">
            <button className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} aria-label="Close admin navigation" />
            <div className="relative h-full w-72">
              <button className="absolute right-3 top-3 z-10 rounded-xl bg-white/10 p-2 text-white" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
              <AdminSidebar onNavigate={() => setSidebarOpen(false)} onLogout={onLogout} />
            </div>
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar onMenu={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
