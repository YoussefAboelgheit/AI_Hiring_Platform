import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import LoadingState from "../../components/common/LoadingState";
import StatusBadge from "../../components/common/StatusBadge";
import CircleProgress from "../../components/common/CircleProgress";
import BackButton from "../../components/common/BackButton";

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    apiClient
      .get(`/jobs/${jobId}/applications`)
      .then((res) => {
        console.log("JOB DETAILS DATA:", res.data);
        const jobData = res.data.job || {};
        const apps = res.data.applications || [];
        setJob({ ...jobData, applications: apps });
      })
      .catch((err) => console.error("Error fetching job details", err))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <LoadingState message="Loading job details..." />;
  if (!job) return <div style={{ padding: 20 }}>Job not found.</div>;

  return (
    <>
      <BackButton fallbackTo="/recruiter/applications" label="Back to Applications" />
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>{job.title}</h1>
        <p style={{ color: "var(--text-muted)" }}>{job.category?.name} • {job.location} • {job.type}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {job.applications && job.applications.length ? (
          job.applications.map((c, i) => (
            <div key={c._id} className="hcard" style={{ padding: 20, display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: i === 0 ? "var(--primary)" : "var(--body-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: i === 0 ? "#fff" : "var(--text-muted)", flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <img src={c.candidate?.avatar || `https://ui-avatars.com/api/?name=${c.candidate?.name?.[0] || 'U'}`} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>{c.candidate?.name || "Unknown"}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.candidate?.email || ""}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <StatusBadge status={c.status || "pending"} />
                  </div>
                </div>
              </div>
              <CircleProgress
                value={Math.round(((c.cvScore ?? 0) + (c.skillMatch ?? 0) + (c.assessmentScore ?? 0)) / 3)}
                size={72}
                stroke={6}
              />
              <div style={{ display: "flex", flex: 1, gap: 20 }}>
                {[["CV Relevance", c.cvScore ?? 0], ["Assessment", c.assessmentScore ?? 0]].map(([label, val]) => (
                  <div key={label} style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "var(--text-muted)" }}>{label}</span>
                      <span style={{ fontWeight: 700 }}>{val}/100</span>
                    </div>
                    <div className="match-bar"><div className="match-bar-fill" style={{ width: `${val}%` }}></div></div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button type="button" className="btn-primary-custom" style={{ fontSize: 13, padding: "8px 16px" }} onClick={() => navigate(`/recruiter/candidates/${c._id}`)}>
                  View Candidate →
                </button>
                <button type="button" className="btn-outline-custom" style={{ fontSize: 13, padding: "7px 16px" }}>
                  Add Note
                </button>
              </div>
            </div>
          ))
        ) : (
          <div>No applications for this job.</div>
        )}
      </div>
    </>
  );
}
