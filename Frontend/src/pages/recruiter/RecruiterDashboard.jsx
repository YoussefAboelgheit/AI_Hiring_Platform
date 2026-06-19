import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getRecruiterDashboard } from "../../services/recruiterService";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingState from "../../components/common/LoadingState";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecruiterDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (!data) return null;

  const { stats, statCards, recentApplications, topMatches, monthlyGoal, aiInsight } = data;
  const goalCirc = 2 * Math.PI * 32;
  const goalOffset = goalCirc * (1 - monthlyGoal.percent / 100);

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1>Recruiter Dashboard</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Welcome back, {user?.name?.split(" ")[0]}. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <button type="button" className="btn-primary-custom" onClick={() => navigate("/recruiter/jobs/new")}>
          <i className="bi bi-plus me-2"></i>Post New Job
        </button>
      </div>

      <div className="grid-stats-4 mb-4">
        {statCards.map((s) => {
          const raw = stats[s.key];
          const value = s.key === "newApplications" ? raw.toLocaleString() : raw;
          return (
            <div key={s.key} className="hcard stat-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <div className="stat-icon" style={{ background: s.iconBg, width: 36, height: 36, fontSize: 16 }}>
                      <i className={`bi ${s.icon}`} style={{ color: s.iconColor }}></i>
                    </div>
                    <span style={{ fontSize: 12, color: s.negative ? "var(--danger)" : "var(--success)", fontWeight: 700 }}>
                      {s.change}
                    </span>
                  </div>
                  <div className="stat-value" style={{ fontSize: 28 }}>{value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div className="hcard" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div className="section-title" style={{ margin: 0, marginBottom: 2 }}>Recent Applications</div>
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
          <table className="htable">
            <thead>
              <tr><th>Candidate</th><th>Job Role</th><th>Applied</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recentApplications.map((app) => (
                <tr key={app.id} style={{ cursor: "pointer" }} onClick={() => navigate("/recruiter/applications")}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img src={app.avatar} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{app.candidate}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{app.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{app.jobRole}</td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{app.appliedAt}</td>
                  <td><StatusBadge status={app.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="hcard" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="section-title" style={{ margin: 0, fontSize: 15 }}>Top AI Matches</span>
              <i className="bi bi-stars" style={{ color: "var(--primary)" }}></i>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Recommended based on skillset & experience</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topMatches.map((m, i) => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--body-bg)", borderRadius: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800 }}>
                    {i + 1}
                  </div>
                  <img src={m.avatar} alt="" style={{ width: 36, height: 36, borderRadius: "50%" }} />
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
            <div style={{ background: "var(--primary-bg)", borderRadius: 10, padding: "12px 14px", marginTop: 16 }}>
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

          <div className="hcard" style={{ padding: 20 }}>
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
                  <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>On Track</span>
                  <span style={{ background: "var(--body-bg)", color: "var(--text-muted)", fontSize: 11, padding: "3px 8px", borderRadius: 20 }}>
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
