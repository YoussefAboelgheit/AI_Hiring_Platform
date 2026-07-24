import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import CandidateSidebar from "../components/candidate/CandidateSidebar";
import Topbar from "../components/common/Topbar";
import Footer from "../components/common/Footer";
import LoadingState from "../components/common/LoadingState";
import { AppShellProvider } from "../context/AppShellProvider";

export default function CandidateLayout() {
  return (
    <AppShellProvider>
      <div className="app-shell">
        <CandidateSidebar />
        <div className="main-layout">
          <Topbar />
          <main className="page-content">
            <Suspense fallback={<LoadingState message="Loading page..." />}>
              <Outlet />
            </Suspense>
          </main>
          <Footer variant="app" />
        </div>
      </div>
    </AppShellProvider>
  );
}