import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useAppShell } from "../../context/useAppShell";
import SidebarLogo from "../common/SidebarLogo";

const navItems = [
  { to: "/candidate/dashboard", icon: "bi-grid-fill", label: "Dashboard", end: true },
  { to: "/candidate/jobs", icon: "bi-briefcase", label: "Jobs" },
  { to: "/candidate/profile", icon: "bi-person", label: "Profile" },
  { to: "/candidate/settings", icon: "bi-gear", label: "Settings" },
];

export default function CandidateSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { sidebarOpen, closeSidebar } = useAppShell();

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
        <div className="sidebar-footer">
          <button type="button" onClick={handleLogout} className="nav-link w-100 border-0 bg-transparent text-start">
            <i className="bi bi-box-arrow-left" aria-hidden="true" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}