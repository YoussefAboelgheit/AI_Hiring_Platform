import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import LoadingState from "../components/common/LoadingState";
import { getHomeForRole } from "./rolePaths";

export default function GuestRoute() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <LoadingState message="Checking session..." />;
  }

  if (user) {
    return <Navigate to={getHomeForRole(user.role)} replace />;
  }

  return <Outlet />;
}
