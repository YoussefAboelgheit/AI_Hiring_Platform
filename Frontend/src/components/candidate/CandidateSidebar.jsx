import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useAppShell } from "../../context/useAppShell";
import SidebarLogo from "../common/SidebarLogo";

const navItems = [
  { to: "/candidate/dashboard", icon: "bi-grid-fill", label: "Dashboard", end: true },
  { to: "/candidate/jobs", icon: "bi-briefcase", label: "Jobs" },
  { to: "/candidate/applications", icon: "bi-file-text", label: "Applications" },
  { to: "/candidate/assessments", icon: "bi-clipboard-check", label: "Assessments" },
  { to: "/candidate/feedback", icon: "bi-chat-square-text", label: "Feedback" },
  { to: "/candidate/profile", icon: "bi-person", label: "Profile" },
  { to: "/candidate/settings", icon: "bi-gear", label: "Settings" },
];

export default function CandidateSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { sidebarOpen, closeSidebar } = useAppShell();
  const showGoPro = pathname.startsWith("/candidate/jobs");
  const showProAccount = pathname.startsWith("/candidate/profile");

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
          {navItems.map(({ to, icon, label, end }) => (
            <div className="nav-item" key={to}>
              <NavLink to={to} end={end} onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                <i className={`bi ${icon}`} aria-hidden="true" /> {label}
              </NavLink>
            </div>
          ))}
        </nav>
        {showGoPro ? (
          <div className="go-pro-box">
            <div className="go-pro-label">Upgrade for AI Matching</div>
            <button type="button" className="btn-primary-custom w-100" style={{ fontSize: 12, padding: "8px" }}>Go Pro</button>
          </div>
        ) : showProAccount ? (
          <div className="go-pro-box">
            <div className="go-pro-label">Pro Account</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Unlock AI matching</div>
            <button type="button" className="btn-primary-custom w-100" style={{ fontSize: 12, padding: "8px" }}>Upgrade</button>
          </div>
        ) : (
          <div className="credits-box">
            <div className="credits-label">AI Credits Remaining</div>
            <div className="credits-bar"><div className="credits-fill" style={{ width: "75%" }} /></div>
            <div className="credits-text">750 / 1000 scans left</div>
          </div>
        )}
        <div className="sidebar-footer">
          <button type="button" onClick={handleLogout} className="nav-link w-100 border-0 bg-transparent text-start">
            <i className="bi bi-box-arrow-left" aria-hidden="true" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}