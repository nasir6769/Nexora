import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { ROUTES } from "./routeConfig";

function RoleRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  const userRole = String(user?.role || "").toLowerCase();

  const roles = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];

  const hasAccess = roles.some(
    (role) => String(role).toLowerCase() === userRole
  );

  if (!hasAccess) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}

export default RoleRoute;