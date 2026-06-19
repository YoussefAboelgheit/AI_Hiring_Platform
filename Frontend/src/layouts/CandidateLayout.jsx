import { Outlet } from "react-router-dom";
import CandidateSidebar from "../components/candidate/CandidateSidebar";
import Topbar from "../components/common/Topbar";
import Footer from "../components/common/Footer";
import { AppShellProvider } from "../context/AppShellProvider";

export default function CandidateLayout() {
  return (
    <AppShellProvider>
      <div className="app-shell">
        <CandidateSidebar />
        <div className="main-layout">
          <Topbar placeholder="Search for opportunities..." />
          <main className="page-content">
            <Outlet />
          </main>
          <Footer variant="app" />
        </div>
      </div>
    </AppShellProvider>
  );
}
