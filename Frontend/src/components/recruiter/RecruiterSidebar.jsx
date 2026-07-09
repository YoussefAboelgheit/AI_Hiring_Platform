import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useAppShell } from "../../context/useAppShell";
import SidebarLogo from "../common/SidebarLogo";


const navItems = [
  { to: "/recruiter/dashboard", icon: "bi-grid-fill", label: "Dashboard", end: true },
  { to: "/recruiter/jobs", icon: "bi-briefcase", label: "Jobs", jobsSection: true },
  { to: "/recruiter/profile", icon: "bi-person", label: "Profile" },
];


export default function RecruiterSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { sidebarOpen, closeSidebar } = useAppShell();

const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  const isActive = (item) => {
    if (item.profileItem) return false;
    if (item.jobsSection) return pathname.startsWith("/recruiter/jobs");
    if (item.end) return pathname === item.to;
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
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
        <nav className="sidebar-nav" aria-label="Recruiter navigation">
          {navItems.map((item) => (
            <div className="nav-item" key={item.label}>
              <NavLink to={item.to} onClick={closeSidebar} className={() => `nav-link ${isActive(item) ? "active" : ""}`}>
              <i className={`bi ${item.icon}`} aria-hidden="true" /> {item.label}
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