import { Home, Map, ActivitySquare, User, Zap, AlertCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const roleHomePath = {
  user: "/dashboard/user",
  helper: "/dashboard/helper",
  police: "/dashboard/police",
  hospital: "/dashboard/hospital",
  fire: "/dashboard/fire",
};

export default function BottomNavigation({ role = "user" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const userTabs = [
    { id: "home", icon: Home, label: "Home", path: "/dashboard/user" },
    { id: "protection", icon: Zap, label: "Protection", path: "/protection" },
    { id: "history", icon: ActivitySquare, label: "History", path: "/incidents" },
    { id: "activity", icon: ActivitySquare, label: "Activity", path: "/activity" },
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
  ];

  const responderTabs = [
    { id: "dispatch", icon: AlertCircle, label: "Dispatch", path: roleHomePath[role] || "/dashboard/helper" },
    { id: "map", icon: Map, label: "Map", path: "/map" },
    { id: "incidents", icon: ActivitySquare, label: "Incidents", path: "/incidents" },
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
  ];

  const tabs = role === "user" ? userTabs : responderTabs;

  return (
    <div className="absolute inset-x-0 bottom-0 z-[900] border-t border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-around gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            location.pathname === tab.path ||
            (tab.id === "dispatch" && location.pathname.startsWith("/dashboard/"));
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex min-w-0 flex-col items-center gap-1.5 rounded-2xl px-2 py-2 text-[11px] transition sm:px-3 sm:text-xs ${
                isActive ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="tracking-[0.02em]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
