import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getRecruiterDashboard } from "../../services/recruiterService";
import StatusBadge from "../../components/common/StatusBadge";
import StatCard from "../../components/common/StatCard";
import LoadingState from "../../components/common/LoadingState";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecruiterDashboard()
      .then((res) => {
        setDashboardData(res);
      })
      .catch((err) => console.error("Error fetching dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (!dashboardData) return null;

  // قراءة البيانات من شكل الـ object اللي بترجعه recruiterService.getRecruiterDashboard()
  // الشكل الفعلي: { stats: { activeJobs, newApplications, shortlisted, assessmentsPending }, ... }
  const activeJobsCount = dashboardData?.stats?.activeJobs ?? 0;
  const totalAppsCount = dashboardData?.stats?.newApplications ?? 0;
  const acceptedCount = dashboardData?.stats?.accepted ?? 0;
  const inReviewCount = dashboardData?.stats?.assessmentsPending ?? 0;

  // جلب البيانات الأخرى مع وضع Fallbacks لحماية الصفحة من الـ Crash
  const RECENT_APPLICATIONS_LIMIT = 6;
  const recentApplications = (dashboardData?.recentApplications ?? []).slice(0, RECENT_APPLICATIONS_LIMIT);
  const topMatches = dashboardData?.topMatches ?? [];

  // إعداد الكروت الثابتة وربطها بالمتغيرات الفوقية - نفس تدرجات الكحلي/التركواز بتاعة البراند
  const statCardsConfig = [
    {
      key: "activeJobs",
      label: "Active Jobs",
      value: activeJobsCount,
      change: "+12%",
      icon: "bi-briefcase",
      tint: "navy",
    },
    {
      key: "newApplications",
      label: "New Applications",
      value: totalAppsCount,
      change: "+24%",
      icon: "bi-file-earmark-person",
      tint: "teal",
    },
    {
      key: "accepted",
      label: "Accepted",
      value: acceptedCount,
      change: "+8%",
      icon: "bi-check-circle",
      tint: "tealDark",
    },
    {
      key: "assessmentsPending",
      label: "In Review",
      value: inReviewCount,
      change: "-3%",
      negative: true,
      icon: "bi-hourglass-split",
      tint: "navyLight",
    }
  ];

  return (
    <>
      {/* Header Section */}
      <div className="page-header-row mb-4">
        <div>
          <h1 className="h3 mb-1 fw-bold">Recruiter Dashboard</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Welcome back, {user?.name?.split(" ")[0]}. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <button type="button" className="btn-primary-custom" onClick={() => navigate("/recruiter/jobs/new")}>
          <i className="bi bi-plus me-2"></i>Post New Job
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid-stats-4 mb-4">
        {statCardsConfig.map((card) => (
          <StatCard key={card.key} {...card} />
        ))}
      </div>

      {/* Main Content Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        
        {/* Recent Applications Section */}
        <div className="hcard border-0 shadow-sm" style={{ padding: 24, borderRadius: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div className="section-title fw-bold h5" style={{ margin: 0, marginBottom: 2 }}>Recent Applications</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Tracking the latest 50 applicants</div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/recruiter/applications")}
              style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
            >
              View All
            </button>
          </div>
          
          {recentApplications.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-0" style={{ fontSize: 14 }}>No recent applications found.</p>
            </div>
          ) : (
            <table className="htable table align-middle">
              <thead>
                <tr><th>Candidate</th><th>Job Role</th><th>Applied</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr
                    key={app.id || app._id}
                    style={{ cursor: "pointer", transition: "background 0.12s ease" }}
                    onClick={() => navigate("/recruiter/applications")}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-bg)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <img src={app.profile_image || "https://via.placeholder.com/36"} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{app.candidate}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{app.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      <span className="badge p-2 rounded border-0" style={{ backgroundColor: 'var(--accent-teal-bg)', color: 'var(--accent-teal-dark)', fontWeight: 600 }}>
                        {app.jobRole}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{app.appliedAt}</td>
                    <td><StatusBadge status={app.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Recommended Candidates */}
          <div className="hcard border-0 shadow-sm d-flex flex-column" style={{ padding: 20, borderRadius: "16px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="section-title fw-bold" style={{ margin: 0, fontSize: 15 }}>Recommended Candidates</span>
              <i className="bi bi-people" style={{ color: "var(--primary)" }}></i>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Based on skillset & experience</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {topMatches.length === 0 && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
                  No applicants yet.
                </div>
              )}
              {topMatches.map((m, i) => (
                <div key={m.id || m._id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 14px", background: "var(--body-bg)", borderRadius: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800, flexShrink: 0, marginTop: 2 }}>
                    {i + 1}
                  </div>
                  <img src={m.avatar || "https://via.placeholder.com/36"} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--primary)", overflowWrap: "break-word", wordBreak: "break-word", lineHeight: 1.35 }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{m.title}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginInlineStart: 8 }}>
                    <div style={{ fontWeight: 800, color: "var(--primary)", whiteSpace: "nowrap" }}>{m.match}%</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>MATCH SCORE</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}