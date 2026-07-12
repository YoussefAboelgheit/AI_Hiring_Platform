import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useAppShell } from "../../context/useAppShell";
import SidebarLogo from "../common/SidebarLogo";

const navItems = [
  { to: "/candidate/dashboard", icon: "bi-grid-fill", label: "Dashboard", end: true },
  { to: "/candidate/jobs", icon: "bi-briefcase", label: "Jobs" },
  { to: "/candidate/jobs/saved", icon: "bi-bookmark-heart", label: "Saved Jobs" },
  { to: "/candidate/applications", icon: "bi-file-text", label: "Applications" },
  { to: "/candidate/profile", icon: "bi-person", label: "Profile" },
  { to: "/candidate/chat", icon: "bi-chat-dots", label: "AI Chat" },
  { to: "/candidate/settings", icon: "bi-gear", label: "Settings" },
];

// A couple of nav items intentionally point at the same route (e.g. Applications / Assessments).
// Without this, React Router highlights every link that matches the current path, so both light up
// together. Instead, only the one the user actually clicked stays highlighted for that route.
const SIDEBAR_ACTIVE_LABEL_KEY = "candidateSidebarActiveLabel";

export default function CandidateSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { sidebarOpen, closeSidebar } = useAppShell();
  const [activeLabel, setActiveLabel] = useState(() => sessionStorage.getItem(SIDEBAR_ACTIVE_LABEL_KEY) || "Applications");

  const pathCounts = navItems.reduce((acc, item) => {
    acc[item.to] = (acc[item.to] || 0) + 1;
    return acc;
  }, {});

  const handleNavClick = (label) => {
    sessionStorage.setItem(SIDEBAR_ACTIVE_LABEL_KEY, label);
    setActiveLabel(label);
    closeSidebar();
  };

  // تعديل الدالة هنا لتنظيف الـ History تماماً عند الخروج للـ Login
  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <SidebarLogo />
        <nav className="sidebar-nav" aria-label="Candidate navigation">
          {navItems.map(({ to, icon, label, end }) => {
            const isSharedRoute = pathCounts[to] > 1;
            return (
              <div className="nav-item" key={label}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={() => handleNavClick(label)}
                  className={({ isActive }) => {
                    const active = isSharedRoute ? isActive && activeLabel === label : isActive;
                    return `nav-link ${active ? "active" : ""}`;
                  }}
                >
                  <i className={`bi ${icon}`} aria-hidden="true" /> {label}
                </NavLink>
              </div>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button type="button" onClick={handleLogout} className="nav-link w-100 border-0 bg-transparent text-start">
            <i className="bi bi-box-arrow-left" aria-hidden="true" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}