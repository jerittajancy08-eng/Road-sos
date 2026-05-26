import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import BottomNavigation from "./BottomNavigation";
import { getRoleHomePath, normalizeRole } from "../utils/roleUtils";
import LoadingRoadSOS from "./LoadingRoadSOS";

function effectiveDashboardRole(profile) {
  if (!profile) return "user";
  return normalizeRole(profile.role || profile.requestedRole || "user");
}

export default function DashboardLayout({ navRole, allowedRoles }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <LoadingRoadSOS />;
  if (!user) return <Navigate to="/signin" replace />;

  const currentRole = effectiveDashboardRole(user);
  const layoutRole = normalizeRole(navRole || currentRole);

  if (allowedRoles?.length && !allowedRoles.includes(currentRole)) {
    const redirectTo = getRoleHomePath(currentRole);
    if (window.location.pathname === redirectTo) {
      return <Navigate to="/user/home" replace />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="phone-app-outer text-white">
      <div className="phone-app-shell">
        <div className="phone-app-content">
          <Outlet />
        </div>
        {user && <BottomNavigation role={layoutRole} />}
      </div>
    </div>
  );
}

export function UserLayout() {
  return <DashboardLayout navRole="user" allowedRoles={["user"]} />;
}

export function HelperLayout() {
  return <DashboardLayout navRole="helper" allowedRoles={["helper"]} />;
}

export function PoliceLayout() {
  return <DashboardLayout navRole="police" allowedRoles={["police"]} />;
}

export function HospitalLayout() {
  return <DashboardLayout navRole="hospital" allowedRoles={["hospital"]} />;
}

export function FireLayout() {
  return <DashboardLayout navRole="fire" allowedRoles={["fire"]} />;
}
