import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getCandidateDashboardStats, getMyApplications } from "../../services/applicationService";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [statsData, appsData] = await Promise.all([
          getCandidateDashboardStats(),
          getMyApplications(),
        ]);
        if (!cancelled) {
          setStats(statsData);
          setApplications(appsData);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const pendingAssessments = stats.find((s) => s.label === "Pending Assessments");
  const pendingCount = pendingAssessments ? parseInt(pendingAssessments.value, 10) || 0 : 0;
  const recentApps = applications.slice(0, 4);

  if (loading) return <LoadingState message="Loading dashboard..." />;

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1>Welcome, {user?.name?.split(" ")[0]} 👋</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Here&apos;s an overview of your recruitment journey today.
          </p>
        </div>
      </div>

      <div className="grid-stats-3 mb-4">
        {stats.map((s, i) => (
          <div key={i} className="hcard stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-change" style={{ color: s.warning ? "var(--danger)" : "var(--success)" }}>
                  <i className={`bi ${s.warning ? "bi-clock" : "bi-arrow-up"} me-1`}></i>
                  {s.change}
                </div>
              </div>
              <div className="stat-icon" style={{ background: s.iconBg }}>
                <i className={`bi ${s.icon}`} style={{ color: s.iconColor }}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-aside-main">
        <div className="hcard" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div className="section-title" style={{ margin: 0 }}>Recent Applications</div>
            <button
              onClick={() => navigate("/candidate/applications")}
              style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
            >
              View All
            </button>
          </div>

          {recentApps.length === 0 ? (
            <EmptyState
              icon="bi-file-earmark-text"
              title="No applications yet"
              description="Browse open roles and submit your first application."
              action={
                <button className="btn-primary-custom" onClick={() => navigate("/candidate/jobs")}>
                  Browse Jobs
                </button>
              }
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => navigate(`/candidate/applications/${app.id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                    background: "var(--body-bg)", borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-bg)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--body-bg)"; }}
                >
                  <img
                    src={app.logo}
                    alt={app.company}
                    style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", border: "1px solid var(--border)" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{app.jobTitle}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {app.company} · Applied {app.appliedAt}
                    </div>
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="match-pill">
                        <i className="bi bi-stars"></i>{app.matchScore}% Match Score
                      </span>
                      <div style={{ flex: 1, maxWidth: 80 }}>
                        <div className="match-bar">
                          <div className="match-bar-fill" style={{ width: `${app.matchScore}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                  <i className="bi bi-chevron-right text-muted"></i>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hcard" style={{ padding: 24 }}>
          <div className="section-title">Assessments</div>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>To-Do List</span>
              <span style={{
                background: "var(--primary)", color: "#fff", fontSize: 11, fontWeight: 700,
                width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {pendingCount}
              </span>
            </div>
          </div>

          {pendingCount === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <div style={{
                width: 56, height: 56, background: "#D1FAE5", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
              }}>
                <i className="bi bi-check-circle-fill" style={{ fontSize: 28, color: "#059669" }}></i>
              </div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>You&apos;re all caught up!</div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                No pending skill tests or technical assessments require your attention right now.
              </p>
              <button
                className="btn-outline-custom"
                style={{ marginTop: 16, width: "100%" }}
                onClick={() => navigate("/candidate/assessments")}
              >
                Browse Open Tests
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <div style={{
                width: 56, height: 56, background: "#EDE9FE", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
              }}>
                <i className="bi bi-clipboard-check" style={{ fontSize: 28, color: "var(--primary)" }}></i>
              </div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                {pendingCount} assessment{pendingCount !== 1 ? "s" : ""} pending
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Complete your pending assessments to stay on track.
              </p>
              <button
                className="btn-primary-custom"
                style={{ marginTop: 16, width: "100%" }}
                onClick={() => navigate("/candidate/assessments")}
              >
                Start Assessment
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
