import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/ui/Loading";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner label="正在检查登录状态" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="正在检查登录状态" />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
