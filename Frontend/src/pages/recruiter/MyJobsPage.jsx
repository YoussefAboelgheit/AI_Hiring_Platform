import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyJobs } from "../../services/recruiterService";
import { deleteJob } from "../../services/jobService";
import { useAuth } from "../../context/useAuth";
import LoadingState from "../../components/common/LoadingState";
import toast from "react-hot-toast";

const statusStyles = {
  active: { label: "ACTIVE", bg: "#D1FAE5", color: "#065F46" },
  draft: { label: "DRAFT", bg: "#F3F4F6", color: "#374151" },
  closed: { label: "CLOSED", bg: "#FEE2E2", color: "#991B1B" },
};

export default function MyJobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) return;
    setDeleting(jobId);
    try {
      await deleteJob(jobId);
      setData((prev) => ({
        ...prev,
        jobs: prev.jobs.filter((j) => j._id !== jobId),
      }));
      toast.success("Job deleted successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete job.");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    if (user?._id) {
      getMyJobs(user._id)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <LoadingState message="Loading jobs..." />;
  if (!data) return null;

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1>My Jobs</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Manage your open positions and track applicant flow with HireAI.</p>
        </div>
        <button type="button" className="btn-primary-custom" onClick={() => navigate("/recruiter/jobs/new")}>
          <i className="bi bi-plus me-2" />Create Job
        </button>
      </div>

      <div className="grid-stats-4 mb-4">
        {data.stats.map((s) => (
          <div key={s.label} className="hcard stat-card" style={s.highlight ? { background: "var(--primary-bg)", border: "1px solid #DDD6FE" } : undefined}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: 28 }}>{s.value}</div>
                <div className="stat-change" style={{ color: "var(--text-muted)" }}>{s.change}</div>
              </div>
              <div className="stat-icon" style={{ background: s.iconBg }}>
                <i className={`bi ${s.icon}`} style={{ color: s.iconColor }} aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.jobs.map((job) => {
          const st = statusStyles[job.status];
          return (
            <div key={job.id} className="hcard job-list-card">
              <div style={{ width: 48, height: 48, background: "var(--body-bg)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={`bi ${job.icon}`} style={{ fontSize: 22, color: "var(--text-muted)" }} aria-hidden="true" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>{job.title}</span>
                  <span style={{ background: st.bg, color: st.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{st.label}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{job.category} · {job.location} · {job.type}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <span className="skill-tag">{job.applicants} Applicants</span>
                  {job.aiMatches > 0 && (
                    <span style={{ background: "var(--primary-bg)", color: "var(--primary)", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                      <i className="bi bi-stars me-1" aria-hidden="true" />{job.aiMatches} Top AI Matches
                    </span>
                  )}
                  {job.hired && (
                    <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                      <i className="bi bi-check-circle me-1" aria-hidden="true" />Hired: {job.hired}
                    </span>
                  )}
                </div>
              </div>
              <div className="job-list-actions">
                {job.status === "draft" ? (
                  <>
                    <button type="button" className="btn-primary-custom" style={{ fontSize: 13 }} onClick={() => navigate("/recruiter/jobs/new")}>Publish Now</button>
                    <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }} onClick={() => navigate(`/recruiter/jobs/edit/${job._id}`)}>Resume Editing</button>
                    <button type="button" className="btn-outline-custom" style={{ fontSize: 13, color: "#991B1B" }} onClick={() => handleDelete(job._id, job.title)} disabled={deleting === job._id}>{deleting === job._id ? "Deleting..." : "Delete"}</button>
                  </>
                ) : job.status === "closed" ? (
                  <>
                    <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }}>View Archive</button>
                    <button type="button" className="btn-outline-custom" style={{ fontSize: 13, color: "#991B1B" }} onClick={() => handleDelete(job._id, job.title)} disabled={deleting === job._id}>{deleting === job._id ? "Deleting..." : "Delete"}</button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn-primary-custom" style={{ fontSize: 13 }} onClick={() => navigate("/recruiter/applications")}>View Details</button>
                    <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }} onClick={() => navigate(`/recruiter/jobs/edit/${job._id}`)}>Edit Posting</button>
                    <button type="button" className="btn-outline-custom" style={{ fontSize: 13, color: "#991B1B" }} onClick={() => handleDelete(job._id, job.title)} disabled={deleting === job._id}>{deleting === job._id ? "Deleting..." : "Delete"}</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
