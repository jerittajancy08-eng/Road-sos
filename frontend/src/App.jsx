import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";
import SignInScreen from "./screens/SignInScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import LiveTrackingScreen from "./screens/LiveTrackingScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ProtectionScreen from "./screens/ProtectionScreen";
import ActivityScreen from "./screens/ActivityScreen";
import IncidentsScreen from "./screens/IncidentsScreen";
import ResponderMapScreen from "./screens/ResponderMapScreen";
import UserHomePage from "./pages/UserHomePage";
import UserMapPage from "./pages/UserMapPage";
import UserIncidentsPage from "./pages/UserIncidentsPage";
import UserProfilePage from "./pages/UserProfilePage";
import HelperDashboard from "./components/HelperDashboard";
import HospitalDashboard from "./components/HospitalDashboard";
import PoliceDashboard from "./components/PoliceDashboard";
import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboardScreen from "./admin/AdminDashboard";
import ResponderApprovals from "./admin/ResponderApprovals";
import LiveIncidents from "./admin/LiveIncidents";
import DispatchCenter from "./admin/DispatchCenter";
import UsersManagement from "./admin/UsersManagement";
import Analytics from "./admin/Analytics";
import SystemStatus from "./admin/SystemStatus";
import LoadingRoadSOS from "./components/LoadingRoadSOS";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { FireLayout, HelperLayout, HospitalLayout, PoliceLayout, UserLayout } from "./components/DashboardLayout";
import { normalizeRole } from "./utils/roleUtils";
import { loginAdmin } from "./services/authService";
import "./index.css";

function rolePath(role) {
  switch (normalizeRole(role)) {
    case "helper":
      return "/helper/home";
    case "police":
      return "/police/home";
    case "hospital":
      return "/hospital/home";
    case "fire":
      return "/fire/home";
    case "admin":
      return "/admin";
    default:
      return "/user/home";
  }
}

function effectiveDashboardRole(profile) {
  if (!profile) return "user";
  return normalizeRole(profile.role || profile.requestedRole || "user");
}

function PrivateRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <LoadingRoadSOS />;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <LoadingRoadSOS />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if ((user?.role || "user") !== "admin") return <Navigate to={rolePath(effectiveDashboardRole(user))} replace />;
  return children;
}

function AdminLoginRoute() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  if (authLoading) return <LoadingRoadSOS />;
  if (user && (user.role === "admin" || user.isAdmin === true)) return <Navigate to="/admin" replace />;
  return <AdminLogin onAdminSignIn={async (credentials) => {
    await loginAdmin(credentials);
    navigate("/admin", { replace: true });
  }} />;
}

function App() {
  const { user, authLoading, login, register, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    const profile = await login(credentials);
    if (profile) {
      navigate(rolePath(effectiveDashboardRole(profile)), { replace: true });
    }
  };

  const handleRegister = async (formData) => {
    const profile = await register(formData);
    if (profile) {
      navigate(rolePath(effectiveDashboardRole(profile)), { replace: true });
    }
  };

  return (
    <AppErrorBoundary>
    <Routes>
      <Route
        path="/"
        element={
          authLoading ? (
            <LoadingRoadSOS />
          ) : user ? (
            <Navigate to={rolePath(effectiveDashboardRole(user))} replace />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />

      <Route
        path="/signin"
        element={
          authLoading ? (
            <LoadingRoadSOS />
          ) : user ? (
            <Navigate to={rolePath(effectiveDashboardRole(user))} replace />
          ) : (
            <SignInScreen onSignIn={handleLogin} onRegisterSwitch={() => navigate("/register")} />
          )
        }
      />

      <Route
        path="/register"
        element={
          authLoading ? (
            <LoadingRoadSOS />
          ) : user ? (
            <Navigate to={rolePath(effectiveDashboardRole(user))} replace />
          ) : (
            <RegisterScreen onRegister={handleRegister} onBackToSignIn={() => navigate("/signin")} />
          )
        }
      />

      <Route element={<PrivateRoute><UserLayout /></PrivateRoute>}>
        <Route path="/user/home" element={<UserHomePage />} />
        <Route path="/user/map" element={<UserMapPage />} />
        <Route path="/user/incidents" element={<UserIncidentsPage />} />
        <Route path="/user/protection" element={<ProtectionScreen />} />
        <Route path="/user/activity" element={<ActivityScreen />} />
        <Route path="/user/profile" element={<UserProfilePage />} />
        <Route path="/user/tracking" element={<LiveTrackingScreen />} />
        <Route path="/home" element={<Navigate to="/user/home" replace />} />
        <Route path="/profile" element={<Navigate to="/user/profile" replace />} />
        <Route path="/activity" element={<Navigate to="/user/activity" replace />} />
        <Route path="/tracking" element={<Navigate to="/user/tracking" replace />} />
        <Route path="/protection" element={<Navigate to="/user/protection" replace />} />
      </Route>

      <Route element={<PrivateRoute><HelperLayout /></PrivateRoute>}>
        <Route path="/helper/home" element={<HomeScreen />} />
        <Route path="/helper/dispatch" element={<HelperDashboard />} />
        <Route path="/helper/map" element={<ResponderMapScreen />} />
        <Route path="/helper/incidents" element={<IncidentsScreen />} />
        <Route path="/helper/profile" element={<ProfileScreen />} />
        <Route path="/helper" element={<Navigate to="/helper/home" replace />} />
      </Route>

      <Route element={<PrivateRoute><PoliceLayout /></PrivateRoute>}>
        <Route path="/police/home" element={<HomeScreen />} />
        <Route path="/police/dispatch" element={<PoliceDashboard />} />
        <Route path="/police/map" element={<ResponderMapScreen />} />
        <Route path="/police/incidents" element={<IncidentsScreen />} />
        <Route path="/police/profile" element={<ProfileScreen />} />
        <Route path="/police" element={<Navigate to="/police/home" replace />} />
      </Route>

      <Route element={<PrivateRoute><HospitalLayout /></PrivateRoute>}>
        <Route path="/hospital/home" element={<HomeScreen />} />
        <Route path="/hospital/dispatch" element={<HospitalDashboard />} />
        <Route path="/hospital/map" element={<ResponderMapScreen />} />
        <Route path="/hospital/incidents" element={<IncidentsScreen />} />
        <Route path="/hospital/profile" element={<ProfileScreen />} />
        <Route path="/hospital" element={<Navigate to="/hospital/home" replace />} />
      </Route>

      <Route element={<PrivateRoute><FireLayout /></PrivateRoute>}>
        <Route path="/fire/home" element={<HomeScreen />} />
        <Route path="/fire/dispatch" element={<HelperDashboard />} />
        <Route path="/fire/map" element={<ResponderMapScreen />} />
        <Route path="/fire/incidents" element={<IncidentsScreen />} />
        <Route path="/fire/profile" element={<ProfileScreen />} />
        <Route path="/fire" element={<Navigate to="/fire/home" replace />} />
      </Route>

      <Route
        path="/map"
        element={
          <PrivateRoute>
            <Navigate
              to={effectiveDashboardRole(user) === "user" ? "/user/map" : `/${effectiveDashboardRole(user)}/map`}
              replace
            />
          </PrivateRoute>
        }
      />
      <Route
        path="/incidents"
        element={<PrivateRoute><Navigate to={effectiveDashboardRole(user) === "user" ? "/user/incidents" : `/${effectiveDashboardRole(user)}/incidents`} replace /></PrivateRoute>}
      />

      <Route
        path="/admin/login"
        element={<AdminLoginRoute />}
      />

      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminLayout onLogout={logout} />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardScreen />} />
        <Route path="approvals" element={<ResponderApprovals />} />
        <Route path="incidents" element={<LiveIncidents />} />
        <Route path="dispatch" element={<DispatchCenter />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="system" element={<SystemStatus />} />
      </Route>

      <Route path="*" element={authLoading ? <LoadingRoadSOS /> : user ? <Navigate to={rolePath(effectiveDashboardRole(user))} replace /> : <Navigate to="/signin" replace />} />
    </Routes>
    </AppErrorBoundary>
  );
}

export default App;
