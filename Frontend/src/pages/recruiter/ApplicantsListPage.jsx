import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../services/apiClient";
import CircleProgress from "../../components/common/CircleProgress";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

export default function ApplicantsListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobId = location.state?.jobId;
  const [jobs, setJobs] = useState([]); 
  const [loading, setLoading] = useState(true);

  const currentJobTitle = useMemo(() => {
    if (!jobId || !jobs.length) return "";
    const job = jobs.find((j) => j._id === jobId);
    return job ? job.title : "";
  }, [jobs, jobId]);

  const displayedApplications = useMemo(() => {
    if (!jobs.length) return [];
    if (jobId) {
      const job = jobs.find((j) => j._id === jobId);
      return job ? job.applications.map((app) => ({ ...app, jobTitle: job.title })) : [];
    }
    return jobs.flatMap((job) => job.applications.map((app) => ({ ...app, jobTitle: job.title })));
  }, [jobs, jobId]);

  const sortedApplications = useMemo(() => {
    return [...displayedApplications].sort((a, b) => {
      const scoreA = a.matchScore ?? 0;
      const scoreB = b.matchScore ?? 0;
      return scoreB - scoreA;
    });
  }, [displayedApplications]);

  useEffect(() => {
    apiClient
      .get("/jobs/hr/my-jobs/applications")
      .then((res) => {
        console.log("FETCHED JOBS DATA:", res.data);
        const jobsData = Array.isArray(res.data) ? res.data : res.data.jobs || [];
        setJobs(jobsData);
      })
      .catch((err) => console.error("Error fetching jobs with applications", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading applicants..." />;
  if (!sortedApplications.length) return <div style={{ padding: 20 }}>No applicants found.</div>;

  return (
    <>
      <BackButton fallbackTo="/recruiter/applications" label="Back to Applications" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
            {jobId && currentJobTitle ? `${currentJobTitle} - Applicants List` : "Applicants List"}
          </h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Ranked by AI match score</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }} onClick={() => navigate("/recruiter/email-invitations")}>
            <i className="bi bi-envelope me-2"></i>Send Invitations
          </button>
          <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }}>
            <i className="bi bi-funnel me-2"></i>Filter
          </button>
          <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }}>
            <i className="bi bi-sort-down me-2"></i>Sort by Match
          </button>
          <button type="button" className="btn-primary-custom" style={{ fontSize: 13 }}>
            <i className="bi bi-download me-2"></i>Export List
          </button>
        </div>
      </div>

      {sortedApplications.map((app, idx) => {
        const cvRelevanceScore = Math.round(app.matchScore ?? 0);
        const assessmentScore = Math.round(app.assessmentScore ?? 0);
        // التحقق من الـ id المتاح لتمريره بشكل صحيح
        const candidateId = app._id || app.id;

        return (
          <div key={candidateId || idx} className="hcard" style={{ padding: 20, marginBottom: 24, border: 0, background: "var(--card-bg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: idx === 0 ? "var(--primary)" : "var(--body-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: idx === 0 ? "#fff" : "var(--text-muted)" }}>
                {idx + 1}
              </div>

              <img
                src={app.candidate?.profile_image || `https://ui-avatars.com/api/?name=${app.candidate?.name?.[0] || "U"}`}
                alt=""
                style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{app.candidate?.name || "Unknown"}</div>
                {!jobId && (
                  <span style={{ display: "inline-flex", alignItems: "center", marginTop: 4, padding: "2px 8px", background: "#F3E8FF", color: "#6B21A8", borderRadius: "9999px", fontSize: 12, fontWeight: 600 }}>
                    🔍 Applied for: {app.jobTitle}
                  </span>
                )}
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{app.candidate?.email || ""}</div>
              </div>

              <CircleProgress
                value={cvRelevanceScore}
                size={72}
                stroke={6}
              />

              <div style={{ display: "flex", flex: 1, gap: 20 }}>
                {[["CV Relevance", cvRelevanceScore], ["Assessment", assessmentScore]].map(([label, val]) => (
                  <div key={label} style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "var(--text-muted)" }}>{label}</span>
                      <span style={{ fontWeight: 700 }}>{val}/100</span>
                    </div>
                    <div className="match-bar">
                      <div className="match-bar-fill" style={{ width: `${val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button 
                  type="button" 
                  className="btn-primary-custom" 
                  style={{ fontSize: 13, padding: "8px 16px" }} 
                  onClick={() => navigate(`/recruiter/candidates/${candidateId}`)}
                >
                  View Candidate →
                </button>
                <button type="button" className="btn-outline-custom" style={{ fontSize: 13, padding: "7px 16px" }}>
                  Add Note
                </button>
              </div>

            </div>
          </div>
        );
      })}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, padding: "16px 0" }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Pagination controls</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["‹", "1", "2", "3", "...", "›"].map((p, i) => (
            <button key={i} type="button" style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", background: p === "1" ? "var(--primary)" : "#fff", color: p === "1" ? "#fff" : "var(--text-muted)", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}