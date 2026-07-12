import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useAppShell } from "../../context/useAppShell";
import SidebarLogo from "../common/SidebarLogo";

const navItems = [
  { to: "/admin/dashboard", icon: "bi-grid-fill", label: "Dashboard", end: true },
  { to: "/admin/categories", icon: "bi-tags", label: "Categories", categorySection: true },
  { to: "/admin/jobs", icon: "bi-briefcase", label: "Manage Jobs", adminJobsSection: true },
  { to: "/admin/users", icon: "bi-people", label: "Users", usersSection: true },
  { to: "/admin/settings", icon: "bi-gear", label: "Settings" },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { sidebarOpen, closeSidebar } = useAppShell();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (item) => {
    if (item.categorySection) return pathname.startsWith("/admin/categories");
    if (item.usersSection) return pathname.startsWith("/admin/users");
    if (item.adminJobsSection) return pathname.startsWith("/admin/jobs");
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
        <nav className="sidebar-nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <div className="nav-item" key={item.label}>
              <NavLink
                to={item.to}
                onClick={closeSidebar}
                className={() => `nav-link ${isActive(item) ? "active" : ""}`}
              >
                <i className={`bi ${item.icon}`} aria-hidden="true" /> {item.label}
              </NavLink>
            </div>
          ))}
        </nav>
        
        <div className="credits-box">
          <div className="credits-label">System Admin Panel</div>
          <div className="credits-bar">
            <div className="credits-fill" style={{ width: "100%", background: "#10B981" }} />
          </div>
          <div className="credits-text">All systems operational</div>
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            onClick={handleLogout}
            className="nav-link w-100 border-0 bg-transparent text-start"
          >
            <i className="bi bi-box-arrow-left" aria-hidden="true" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
