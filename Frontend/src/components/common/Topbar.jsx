import { useAuth } from "../../context/useAuth";
import { useAppShell } from "../../context/useAppShell";

export default function Topbar({ placeholder = "Search..." }) {
  const { user } = useAuth();
  const { toggleSidebar } = useAppShell();

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
      <div className="search-box d-none d-md-flex">
        <i className="bi bi-search text-muted" aria-hidden="true" />
        <input type="search" placeholder={placeholder} aria-label="Search" />
      </div>
      <div className="topbar-actions">
        <button type="button" className="topbar-icon-btn d-none d-sm-flex" aria-label="AI assistant">
          <i className="bi bi-robot" />
        </button>
        <button type="button" className="topbar-icon-btn d-none d-sm-flex" style={{ position: "relative" }} aria-label="Notifications">
          <i className="bi bi-bell" />
          <span className="topbar-notification-dot" />
        </button>
        <button type="button" className="topbar-icon-btn d-none d-md-flex" aria-label="Settings">
          <i className="bi bi-gear" />
        </button>
        <div className="user-chip">
          <img src={user?.avatar} alt={user?.name || "User"} />
          <div className="d-none d-sm-block">
            <div className="name">{user?.name || "User"}</div>
            <div className="role">{user?.title || "Member"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
