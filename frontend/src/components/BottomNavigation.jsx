import { Home, Map, ActivitySquare, User, AlertCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoleBasePath, getRoleHomePath, isResponderRole, normalizeRole } from "../utils/roleUtils";

export default function BottomNavigation({ role = "user", dispatchEnabled = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const safeRole = normalizeRole(role);
  const basePath = getRoleBasePath(safeRole);
  const isResponder = isResponderRole(safeRole);

  const userTabs = [
    { id: "home", icon: Home, label: "Home", path: "/user/home" },
    { id: "map", icon: Map, label: "Map", path: "/user/map" },
    { id: "incidents", icon: ActivitySquare, label: "Incidents", path: "/user/incidents" },
    { id: "profile", icon: User, label: "Profile", path: "/user/profile" },
  ];

  const responderTabs = [
    { id: "home", icon: Home, label: "Home", path: getRoleHomePath(safeRole) },
    ...(dispatchEnabled ? [{ id: "dispatch", icon: AlertCircle, label: "Dispatch", path: `${basePath}/dispatch` }] : []),
    { id: "map", icon: Map, label: "Map", path: `${basePath}/map` },
    { id: "incidents", icon: ActivitySquare, label: "Incidents", path: `${basePath}/incidents` },
    { id: "profile", icon: User, label: "Profile", path: `${basePath}/profile` },
  ];

  const tabs = isResponder ? responderTabs : userTabs;

  return (
    <div className="absolute inset-x-4 bottom-4 z-[900] rounded-[28px] border border-cyan-300/15 bg-[#071625]/92 px-3 py-2.5 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="grid grid-cols-4 items-center gap-1 data-[dispatch=true]:grid-cols-5" data-dispatch={isResponder && dispatchEnabled}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            location.pathname === tab.path ||
            (tab.id === "dispatch" && location.pathname === tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex min-w-0 w-full flex-col items-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-semibold transition ${
                isActive ? "bg-cyan-400/12 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.22)]" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="tracking-[0.02em]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
