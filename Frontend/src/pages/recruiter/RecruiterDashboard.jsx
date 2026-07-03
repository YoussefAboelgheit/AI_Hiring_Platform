import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getRecruiterDashboard } from "../../services/recruiterService";
import StatusBadge from "../../components/common/StatusBadge";
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
  const shortlistedCount = dashboardData?.stats?.shortlisted ?? 0;
  const inReviewCount = dashboardData?.stats?.assessmentsPending ?? 0;

  // جلب البيانات الأخرى مع وضع Fallbacks لحماية الصفحة من الـ Crash
  const recentApplications = dashboardData?.recentApplications ?? [];
  const topMatches = dashboardData?.topMatches ?? [];
  const monthlyGoal = dashboardData?.monthlyGoal ?? { percent: 0, filled: 0, target: 0, avgDays: 0 };
  const aiInsight = dashboardData?.aiInsight ?? "No insights available at the moment.";

  const goalCirc = 2 * Math.PI * 32;
  const goalOffset = goalCirc * (1 - monthlyGoal.percent / 100);

  // إعداد الكروت الثابتة وربطها بالمتغيرات الفوقية مع ستايل الباستيل والـ border-0
  const statCardsConfig = [
    {
      key: "activeJobs",
      label: "Active Jobs",
      value: activeJobsCount,
      change: "+12%",
      icon: "bi-briefcase",
      bg: "#EFF6FF",
      iconBg: "#DBEAFE",
      iconColor: "#1E40AF"
    },
    {
      key: "newApplications",
      label: "New Applications",
      value: totalAppsCount,
      change: "+24%",
      icon: "bi-file-earmark-person",
      bg: "#F0FDF4",
      iconBg: "#DCFCE7",
      iconColor: "#166534"
    },
    {
      key: "shortlisted",
      label: "Shortlisted",
      value: shortlistedCount,
      change: "+8%",
      icon: "bi-bookmark-check",
      bg: "#FDF2F8",
      iconBg: "#FCE7F3",
      iconColor: "#9D174D"
    },
    {
      key: "assessmentsPending",
      label: "In Review",
      value: inReviewCount,
      change: "-3%",
      negative: true,
      icon: "bi-hourglass-split",
      bg: "#FFFBEB",
      iconBg: "#FEF3C7",
      iconColor: "#92400E"
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

      {/* Stats Grid - Pastel & Borderless */}
      <div className="grid-stats-4 mb-4">
        {statCardsConfig.map((card) => (
          <div 
            key={card.key} 
            className="hcard stat-card border-0 shadow-sm p-4" 
            style={{ backgroundColor: card.bg, borderRadius: "16px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="w-100">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div 
                    className="stat-icon d-flex align-items-center justify-content-center" 
                    style={{ background: card.iconBg, width: 40, height: 40, fontSize: 18, borderRadius: "12px" }}
                  >
                    <i className={`bi ${card.icon}`} style={{ color: card.iconColor }}></i>
                  </div>
                  <span style={{ fontSize: 12, color: card.negative ? "var(--danger)" : "var(--success)", fontWeight: 700 }}>
                    {card.change}
                  </span>
                </div>
                <div className="stat-value fw-bold" style={{ fontSize: 32, color: "#1F2937", marginBottom: 4 }}>
                  {card.value}
                </div>
                <div className="stat-label text-secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                  {card.label}
                </div>
              </div>
            </div>
          </div>
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
                  <tr key={app.id || app._id} style={{ cursor: "pointer" }} onClick={() => navigate("/recruiter/applications")}>
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
                      <span className="badge p-2 rounded border-0" style={{ backgroundColor: '#F3E8FF', color: '#6B21A8', fontWeight: 600 }}>
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
          
          {/* Top AI Matches */}
          <div className="hcard border-0 shadow-sm" style={{ padding: 20, borderRadius: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="section-title fw-bold" style={{ margin: 0, fontSize: 15 }}>Top AI Matches</span>
              <i className="bi bi-stars" style={{ color: "var(--primary)" }}></i>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Recommended based on skillset & experience</div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topMatches.map((m, i) => (
                <div key={m.id || m._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--body-bg)", borderRadius: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800 }}>
                    {i + 1}
                  </div>
                  <img src={m.avatar || "https://via.placeholder.com/36"} alt="" style={{ width: 36, height: 36, borderRadius: "50%" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--primary)" }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.title}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: "var(--primary)" }}>{m.match}%</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>MATCH SCORE</div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insights Section */}
            <div className="border-0" style={{ background: "var(--primary-bg)", borderRadius: 10, padding: "12px 14px", marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <i className="bi bi-lightbulb" style={{ color: "var(--primary)", fontSize: 14 }}></i>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>AI Insights</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>{aiInsight}</p>
            </div>
            <button type="button" className="btn-outline-custom" style={{ width: "100%", marginTop: 14, fontSize: 13 }} onClick={() => navigate("/recruiter/top-candidates")}>
              Open Talent Pool
            </button>
          </div>

          {/* Monthly Goal Progress */}
          <div className="hcard border-0 shadow-sm" style={{ padding: 20, borderRadius: "16px" }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Monthly Goal</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative", width: 80, height: 80 }}>
                <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="var(--primary)" strokeWidth="8" strokeDasharray={goalCirc} strokeDashoffset={goalOffset} strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "var(--primary)" }}>
                  {monthlyGoal.percent}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, marginBottom: 6 }}>
                  You have filled <strong>{monthlyGoal.filled} out of {monthlyGoal.target}</strong> targeted roles this month.
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <span className="border-0" style={{ background: "#D1FAE5", color: "#065F46", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>On Track</span>
                  <span className="border-0" style={{ background: "var(--body-bg)", color: "var(--text-muted)", fontSize: 11, padding: "3px 8px", borderRadius: 20 }}>
                    Avg {monthlyGoal.avgDays} Days
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}