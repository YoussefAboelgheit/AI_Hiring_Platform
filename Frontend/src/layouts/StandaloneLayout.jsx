import { Outlet } from "react-router-dom";

export default function StandaloneLayout() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--body-bg)" }}>
      <Outlet />
    </div>
  );
}
