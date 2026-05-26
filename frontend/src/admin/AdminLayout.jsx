import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ActivitySquare, BarChart3, ClipboardCheck, Gauge, LayoutDashboard, Menu, RadioTower, ShieldAlert, Users, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Responder Approvals", path: "/admin/approvals", icon: ClipboardCheck },
  { label: "Live Incidents", path: "/admin/incidents", icon: RadioTower },
  { label: "Dispatch Center", path: "/admin/dispatch", icon: ShieldAlert },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "System Status", path: "/admin/system", icon: Gauge },
];

function AdminSidebar({ onNavigate }) {
  return (
    <aside className="h-full w-72 shrink-0 border-r border-white/10 bg-slate-950/95 p-5">
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.45em] text-cyan-400">RoadSOS</p>
        <h1 className="mt-2 text-xl font-black text-white">Admin Command</h1>
      </div>
      <nav className="space-y-2">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive ? "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/30" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function AdminTopbar({ onLogout, onMenu }) {
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
      <button onClick={onLogout} className="rounded-2xl bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20">
        Logout
      </button>
    </header>
  );
}

export default function AdminLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="phone-app-outer text-white">
      <div className="phone-app-shell">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.15),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),transparent_26%)]" />
      <div className="relative z-10 flex min-h-screen">
        <div className="hidden">
          <AdminSidebar />
        </div>
        {sidebarOpen && (
          <div className="fixed inset-0 z-[1000] lg:hidden">
            <button className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} aria-label="Close admin navigation" />
            <div className="relative h-full w-72">
              <button className="absolute right-3 top-3 z-10 rounded-xl bg-white/10 p-2 text-white" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
              <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar onLogout={onLogout} onMenu={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
      </div>
    </div>
  );
}
