import { Outlet, useLocation } from "react-router-dom";
import RecruiterSidebar from "../components/recruiter/RecruiterSidebar";
import Topbar from "../components/common/Topbar";
import Footer from "../components/common/Footer";
import { AppShellProvider } from "../context/AppShellProvider";

function getSearchPlaceholder(pathname) {
  if (pathname.startsWith("/recruiter/jobs/new")) return "Search across jobs...";
  if (pathname.startsWith("/recruiter/jobs")) return "Search your jobs...";
  return "Search candidates, jobs, or reports...";
}

export default function RecruiterLayout() {
  const { pathname } = useLocation();

  return (
    <AppShellProvider>
      <div className="app-shell">
        <RecruiterSidebar />
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
