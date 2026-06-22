import { useAuth } from "../../context/useAuth";
import { useAppShell } from "../../context/useAppShell";

export default function Topbar({ placeholder = "Search..." }) {
  const { user } = useAuth();
  const { toggleSidebar } = useAppShell();

  const userImage = user?.profile_image || user?.avatar;

  const getInitials = (name) => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

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
          {userImage ? (
            <img 
              src={userImage} 
              alt={user?.name || "User"} 
              style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div 
              className="user-avatar-initials"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#6366f1",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase"
              }}
            >
              {getInitials(user?.name)}
            </div>
          )}
          
          <div className="d-none d-sm-block">
            <div className="name">{user?.name || "User"}</div>
            <div className="role">{user?.title || "Candidate"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}