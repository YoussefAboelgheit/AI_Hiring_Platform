import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import LoadingState from "../components/common/LoadingState";

export default function StandaloneLayout() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--body-bg)" }}>
      <Suspense fallback={<LoadingState message="Loading page..." />}>
        <Outlet />
      </Suspense>
    </div>
  );
}