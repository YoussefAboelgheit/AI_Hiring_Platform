import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import LoadingState from "../components/common/LoadingState";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <Suspense fallback={<LoadingState message="Loading page..." />}>
        <Outlet />
      </Suspense>
    </div>
  );
}