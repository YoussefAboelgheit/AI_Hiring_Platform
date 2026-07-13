import { useAuth } from "../../context/useAuth";
import { useAppShell } from "../../context/useAppShell";
import { Link, useLocation } from "react-router-dom";

export default function Topbar() {
  const { user } = useAuth();
  const { toggleSidebar } = useAppShell();
  const { pathname } = useLocation();

  const isCandidate = pathname.startsWith("/candidate");
  const isAdmin = pathname.startsWith("/admin");

  const settingsPath = isAdmin
    ? "/admin/settings"
    : isCandidate
      ? "/candidate/settings"
      : "/recruiter/settings";

  const profilePath = isAdmin
    ? "/admin/profile"
    : isCandidate
      ? "/candidate/profile"
      : "/recruiter/profile";

  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar-icon-btn d-lg-none sidebar-toggle-btn"
        onClick={toggleSidebar}
        aria-label="Open navigation menu"
      >
        <i className="bi bi-list" />
      </button>

      <div style={{ flex: 1 }} />

      <div className="topbar-actions">
        <Link
          to={settingsPath}
          className="topbar-icon-btn d-none d-md-flex"
          aria-label="Settings"
        >
          <i className="bi bi-gear" />
        </Link>

        <Link to={profilePath} className="user-chip">
          <img src={user?.avatar} alt={user?.name || "User"} />

          <div className="d-none d-sm-block">
            <div className="name">{user?.name || "User"}</div>

            <div className="role">
              {user?.role === "recruiter" ? "Company" : user?.role === "candidate" ? "Candidate" : "Admin"}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}