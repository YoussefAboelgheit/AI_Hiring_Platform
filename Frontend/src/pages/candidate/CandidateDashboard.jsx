import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/useAuth";
import { getMyApplications, getCandidateDashboardStats } from "../../services/applicationService";
import { queryKeys } from "../../constants/queryKeys";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: stats = [],
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["candidate", "dashboard-stats"],
    queryFn: getCandidateDashboardStats,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: applications = [],
    isLoading: appsLoading,
    isError: appsError,
  } = useQuery({
    queryKey: queryKeys.applications.mine,
    queryFn: getMyApplications,
    staleTime: 60 * 1000,
  });

  // Real pending-assessments count: only applications whose job is still Open, still
  // has an assessment attached (hasAssessment, from the backend), and hasn't been
  // completed yet. A deleted job (no jobId) or a closed job (status !== "Open") is
  // automatically excluded, so the count drops on its own once a job is removed or closed.
  // Applications that already got a final decision (Rejected/Accepted) are excluded too —
  // once the recruiter has decided, there's no point asking the candidate to still take it.
  const pendingCount = applications.filter(
    (app) =>
      app.jobId &&
      app.jobStatus === "Open" &&
      app.hasAssessment &&
      !app.assessmentCompleted &&
      app.status !== "rejected" &&
      app.status !== "accepted"
  ).length;

  // Real feedback-reports count: an AI feedback report only exists once an application
  // has been rejected (that's when "View AI Feedback" becomes available to the candidate),
  // so this counts rejected applications instead of using the old static mock number.
  const feedbackCount = applications.filter((app) => app.status === "rejected").length;

  const loading = statsLoading || appsLoading;
  const recentApps = applications.slice(0, 4);
  const activeApplications = applications.filter((app) => app.status !== "rejected").length;

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
        <div className="hcard stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="stat-label">Active Applications</div>
              <div className="stat-value">{activeApplications}</div>
              <div className="stat-change" style={{ color: "var(--success)" }}>
                <i className="bi bi-arrow-up me-1" aria-hidden="true" />
                From your submitted applications
              </div>
            </div>
            <div className="stat-icon" style={{ background: "#f3f5fb" }}>
              <i className="bi bi-file-earmark-text" style={{ color: "#1d2445" }} aria-hidden="true" />
            </div>
          </div>
        </div>
        {stats.filter((s) => s.label !== "Active Applications").map((s, i) => (
          <div key={i} className="hcard stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">
                  {s.label === "Pending Assessments"
                    ? String(pendingCount).padStart(2, "0")
                    : s.label === "Feedback Reports"
                    ? String(feedbackCount).padStart(2, "0")
                    : s.value}
                </div>
                <div className="stat-change" style={{ color: s.warning ? "var(--danger)" : "var(--success)" }}>
                  <i className={`bi ${s.warning ? "bi-clock" : "bi-arrow-up"} me-1`} aria-hidden="true" />
                  {s.label === "Feedback Reports" ? "From rejected applications" : s.change}
                </div>
              </div>
              <div className="stat-icon" style={{ background: s.iconBg }}>
                <i className={`bi ${s.icon}`} style={{ color: s.iconColor }} aria-hidden="true" />
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
              type="button"
              onClick={() => navigate("/candidate/applications")}
              style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
            >
              View All
            </button>
          </div>

          {appsError ? (
            <EmptyState
              icon="bi-exclamation-circle"
              title="Could not load applications"
              description="Your recent applications could not be fetched right now."
              action={
                <button type="button" className="btn-outline-custom" onClick={() => navigate("/candidate/applications")}>
                  Open My Applications
                </button>
              }
            />
          ) : recentApps.length === 0 ? (
            <EmptyState
              icon="bi-file-earmark-text"
              title="No applications yet"
              description="Browse open roles and submit your first application."
              action={
                <button type="button" className="btn-primary-custom" onClick={() => navigate("/candidate/jobs")}>
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
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.company)}&background=F3F5FB&color=1D2445&size=40`; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{app.jobTitle}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {app.company} · Applied {app.appliedAt}
                    </div>
                    {app.jobWorkplace && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                        {app.jobWorkplace}{app.jobLocation ? ` · ${app.jobLocation}` : ""}
                      </div>
                    )}
                  </div>
                  <StatusBadge status={app.status} />
                  <i className="bi bi-chevron-right text-muted" aria-hidden="true" />
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
                <i className="bi bi-check-circle-fill" style={{ fontSize: 28, color: "#059669" }} aria-hidden="true" />
              </div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>You&apos;re all caught up!</div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                No pending skill tests or technical assessments require your attention right now.
              </p>
              <button
                type="button"
                className="btn-outline-custom"
                style={{ marginTop: 16, width: "100%" }}
                onClick={() => navigate("/candidate/applications")}
              >
                View Assessments
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <div style={{
                width: 56, height: 56, background: "#f3f5fb", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
              }}>
                <i className="bi bi-clipboard-check" style={{ fontSize: 28, color: "var(--primary)" }} aria-hidden="true" />
              </div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                {pendingCount} assessment{pendingCount !== 1 ? "s" : ""} pending
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Complete your pending assessments to stay on track.
              </p>
              <button
                type="button"
                className="btn-primary-custom"
                style={{ marginTop: 16, width: "100%" }}
                onClick={() => navigate("/candidate/applications")}
              >
                View Assessments
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}