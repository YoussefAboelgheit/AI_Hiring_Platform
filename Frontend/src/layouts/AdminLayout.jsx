import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import Topbar from "../components/common/Topbar";
import Footer from "../components/common/Footer";
import { AppShellProvider } from "../context/AppShellProvider";

function getSearchPlaceholder(pathname) {
  if (pathname.startsWith("/admin/categories")) return "Search categories...";
  return "Search system metrics or items...";
}

export default function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <AppShellProvider>
      <div className="app-shell">
        <AdminSidebar />
        <div className="main-layout">
          <Topbar placeholder={getSearchPlaceholder(pathname)} />
          <main className="page-content">
            <Outlet />
          </main>
          <Footer variant="app" />
        </div>
      </div>
    </AppShellProvider>
  );
}
