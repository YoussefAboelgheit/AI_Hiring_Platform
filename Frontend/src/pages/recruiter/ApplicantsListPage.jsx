import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getApplicantsList, getTopCandidates, updateJobApplicationStatus } from "../../services/recruiterService";
import toast from "react-hot-toast";
import CircleProgress from "../../components/common/CircleProgress";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

function normalizeApplicantsData(data, jobId) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.jobs)) return data.jobs;
  if (Array.isArray(data?.applicants)) {
    return [{ _id: jobId ?? "all", title: data.jobTitle ?? "All Jobs", applications: data.applicants }];
  }
  return [];
}

export default function ApplicantsListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobId = location.state?.jobId;
  const [showTopCandidates, setShowTopCandidates] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});

  const handleStatusUpdate = async (jobId, applicationId, newStatus) => {
    if (!jobId || !applicationId) return;
    setUpdatingStatus((prev) => ({ ...prev, [applicationId]: newStatus }));
    try {
      await updateJobApplicationStatus(jobId, applicationId, newStatus);
      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job._id === jobId || job._id === "all") {
            return {
              ...job,
              applications: job.applications.map((app) =>
                app._id === applicationId || app.id === applicationId
                  ? { ...app, status: newStatus }
                  : app
              ),
            };
          }
          return job;
        })
      );
      toast.success(`Candidate application ${newStatus.toLowerCase()} successfully!`);
    } catch (err) {
      toast.error(err.message || "Failed to update candidate application status.");
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [applicationId]: null }));
    }
  };

  const loadApplicants = useCallback(
    async (topOnly) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      try {
        const data = topOnly ? await getTopCandidates(jobId) : await getApplicantsList(jobId);
        setJobs(normalizeApplicantsData(data, jobId));
      } catch (err) {
        setIsError(true);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [jobId]
  );

  useEffect(() => {
    loadApplicants(showTopCandidates);
  }, [loadApplicants, showTopCandidates]);

  const handleToggleTopCandidates = () => {
    setShowTopCandidates((prev) => !prev);
  };

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
      const scoreA = ((a.cvScore ?? 0) + (a.skillMatch ?? 0) + (a.assessmentScore ?? 0)) / 3;
      const scoreB = ((b.cvScore ?? 0) + (b.skillMatch ?? 0) + (b.assessmentScore ?? 0)) / 3;
      return scoreB - scoreA;
    });
  }, [displayedApplications]);

  // دمج شروط التحميل والأخطاء المنظمة (الموجودة في الـ Incoming Change)
  if (isLoading) return <LoadingState message="Loading applicants..." />;
  if (isError) return <div style={{ padding: 20 }}>Failed to load applicants: {error?.message || "Unknown error"}</div>;
  if (!sortedApplications.length) return <div style={{ padding: 20 }}>No applicants found.</div>;

  return (
    <>
      <BackButton fallbackTo="/recruiter/applications" label="Back to Applications" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
            {jobId && currentJobTitle ? `${currentJobTitle} - Applicants List` : "Applicants List"}
          </h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Review and filter candidates applying for this position.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {jobId && (
            <button className="btn-primary-custom" onClick={() => navigate(`/recruiter/jobs/${jobId}/assessment`)}>
              <i className="bi bi-clipboard-check me-2" />
              Manage Assessment
            </button>
          )}
          <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }} onClick={() => navigate("/recruiter/email-invitations")}>
            <i className="bi bi-envelope me-2"></i>Send Invitations
          </button>
          <button
            type="button"
            className={showTopCandidates ? "btn-primary-custom" : "btn-outline-custom"}
            style={{ fontSize: 13 }}
            onClick={handleToggleTopCandidates}
            disabled={isLoading}
          >
            <i className="bi bi-funnel me-2"></i>
            {showTopCandidates ? "Show All Applicants" : "Top Candidates"}
          </button>
        </div>
      </div>

      {/* عرض الكروت مع دمج المتغيرات والأزرار من النسختين */}
      {sortedApplications.map((app, idx) => {
        const cvRelevanceScore = Math.round(app.cvScore ?? app.matchScore ?? 0);
        const assessmentScore = Math.round(app.assessmentScore ?? 0);
        const totalAverageScore = Math.round(((app.cvScore ?? 0) + (app.skillMatch ?? 0) + (app.assessmentScore ?? 0)) / 3);
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
                  <span style={{ display: "inline-flex", alignItems: "center", marginTop: 4, padding: "2px 8px", background: "#F3E8FF", color: "#6B21A8", borderRadius: "9999px", fontSize: 12, fontWeight: 600, marginRight: 8 }}>
                    🔍 Applied for: {app.jobTitle}
                  </span>
                )}
                <span style={{
                    display: "inline-flex", alignItems: "center", marginTop: 4, padding: "2px 8px",
                    borderRadius: "9999px", fontSize: 12, fontWeight: 600,
                    background: (app.status || "Pending").toLowerCase() === "accepted" ? "#D1FAE5" :
                                (app.status || "Pending").toLowerCase() === "rejected" ? "#FEE2E2" : "#FEF3C7",
                    color: (app.status || "Pending").toLowerCase() === "accepted" ? "#059669" :
                           (app.status || "Pending").toLowerCase() === "rejected" ? "#DC2626" : "#D97706"
                }}>
                  {app.status || "Pending"}
                </span>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{app.candidate?.email || ""}</div>
              </div>

              {/* استخدام الـ Total Score لـ الدائرة التقدمية */}
              <CircleProgress
                value={totalAverageScore}
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

              {/* الاحتفاظ بأزرار التحكم من النسخة الثانية */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button type="button" className="btn-primary-custom" style={{ fontSize: 13, padding: "8px 16px" }} onClick={() => navigate(`/recruiter/candidates/${candidateId}`)}>
                  View Candidate →
                </button>
                {(app.status || "Pending").toLowerCase() === "pending" && (
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      type="button"
                      className="btn-primary-custom"
                      style={{ fontSize: 13, padding: "7px 8px", flex: 1, backgroundColor: "#10b981", borderColor: "#10b981" }}
                      onClick={() => handleStatusUpdate(app.jobId || jobId, candidateId, "Accepted")}
                      disabled={!!updatingStatus[candidateId]}
                    >
                      {updatingStatus[candidateId] === "Accepted" ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : "Accept"}
                    </button>
                    <button
                      type="button"
                      className="btn-outline-custom"
                      style={{ fontSize: 13, padding: "7px 8px", flex: 1, color: "#ef4444", borderColor: "#ef4444" }}
                      onClick={() => handleStatusUpdate(app.jobId || jobId, candidateId, "Rejected")}
                      disabled={!!updatingStatus[candidateId]}
                    >
                      {updatingStatus[candidateId] === "Rejected" ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : "Reject"}
                    </button>
                  </div>
                )}
                {(app.status || "Pending").toLowerCase() !== "pending" && (
                  <button type="button" className="btn-outline-custom" style={{ fontSize: 13, padding: "7px 16px" }}>
                    Add Note
                  </button>
                )}
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