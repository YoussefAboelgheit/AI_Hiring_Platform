import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import LoadingState from "../components/common/LoadingState";

export default function PublicLayout() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<LoadingState message="Loading page..." />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer variant="landing" />
    </div>
  );
}