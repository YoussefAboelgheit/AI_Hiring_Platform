import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useAppShell } from "../../context/useAppShell";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

export default function Topbar({ placeholder = "Search..." }) {
  const { user } = useAuth();
  const { toggleSidebar } = useAppShell();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCandidateJobs = pathname.startsWith("/candidate/jobs");
  const [query, setQuery] = useState(() => (isCandidateJobs ? searchParams.get("q") || "" : ""));

  useEffect(() => {
    if (isCandidateJobs) {
      setQuery(searchParams.get("q") || "");
    }
  }, [isCandidateJobs, searchParams]);

  const settingsPath = pathname.startsWith("/recruiter")
    ? "/recruiter/settings"
    : "/candidate/settings";

  const submitSearch = () => {
    const trimmed = query.trim();
    if (isCandidateJobs) {
      const next = new URLSearchParams(searchParams);
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      navigate({ pathname: "/candidate/jobs", search: next.toString() ? `?${next}` : "" });
      return;
    }
    navigate(trimmed ? `/candidate/jobs?q=${encodeURIComponent(trimmed)}` : "/candidate/jobs");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitSearch();
    }
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
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search"
        />
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
          <Link to={settingsPath}>
            <i className="bi bi-gear" />
          </Link>
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
