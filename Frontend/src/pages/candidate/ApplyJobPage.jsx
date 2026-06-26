import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getJobById } from "../../services/jobService";
import { applyToJob } from "../../services/applicationService";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import BackButton from "../../components/common/BackButton";

/** Map raw backend job to a minimal UI shape */
function normalizeJob(raw) {
  if (!raw) return null;
  return {
    id: raw._id,
    title: raw.title || "Untitled",
    company: raw.recruiter?.name || raw.recruiter?.username || "HireAI Recruiter",
    location: raw.location || "Remote",
  };
}

export default function ApplyJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const raw = await getJobById(id);
        if (!cancelled) setJob(normalizeJob(raw));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") setFile(f);
  };

  const handleSubmit = async () => {
    if (!file || !job) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("cv", file);
      if (coverLetter) formData.append("coverLetter", coverLetter);
      const result = await applyToJob(job.id, formData);
      navigate(`/candidate/application-submitted?applicationId=${result.applicationId}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading application form..." />;

  if (!job) {
    return (
      <EmptyState
        icon="bi-briefcase"
        title="Job not found"
        description="This job listing may have been removed or is no longer available."
        action={
          <button className="btn-primary-custom" onClick={() => navigate("/candidate/jobs")}>
            Back to Jobs
          </button>
        }
      />
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <BackButton fallbackTo={`/candidate/jobs/${id}`} label="Back to Job" />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 24, fontSize: 13, color: "var(--text-muted)" }}>
        <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => navigate("/candidate/jobs")}>Jobs</span>
        <i className="bi bi-chevron-right"></i>
        <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => navigate(`/candidate/jobs/${id}`)}>{job.title}</span>
        <i className="bi bi-chevron-right"></i>
        <span>Apply</span>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Apply to {job.title}</h1>
      <div style={{ color: "var(--text-muted)", marginBottom: 28 }}>{job.company} · {job.location}</div>

      <div className="hcard" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Upload Your CV</div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
          Upload your resume and our AI will analyze it against the job requirements instantly.
        </p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("cv-input").click()}
          style={{
            border: `2px dashed ${dragging ? "var(--primary)" : "var(--border)"}`,
            borderRadius: 14, padding: "48px 20px", textAlign: "center", cursor: "pointer",
            background: dragging ? "var(--primary-bg)" : "var(--body-bg)", transition: "all 0.2s",
          }}
        >
          {file ? (
            <>
              <i className="bi bi-file-earmark-pdf-fill" style={{ fontSize: 40, color: "#EF4444", display: "block", marginBottom: 10 }}></i>
              <div style={{ fontWeight: 700 }}>{file.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{(file.size / 1024).toFixed(1)} KB</div>
            </>
          ) : (
            <>
              <i className="bi bi-cloud-arrow-up" style={{ fontSize: 40, color: "var(--primary)", display: "block", marginBottom: 10 }}></i>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Drag & drop your CV here</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                or <span style={{ color: "var(--primary)", fontWeight: 600 }}>browse files</span> · PDF only · Max 5MB
              </div>
            </>
          )}
          <input
            id="cv-input"
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
      </div>

      <div className="hcard" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Cover Letter (Optional)</div>
        <textarea
          rows={5}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Tell the recruiter why you're a great fit for this role..."
          style={{
            width: "100%", border: "1.5px solid var(--border)", borderRadius: 10,
            padding: "12px 14px", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn-outline-custom" style={{ flex: 1 }} onClick={() => navigate(`/candidate/jobs/${id}`)}>
          Cancel
        </button>
        <button
          className="btn-primary-custom"
          style={{ flex: 2 }}
          onClick={handleSubmit}
          disabled={!file || submitting}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Submitting...
            </>
          ) : (
            <>
              <i className="bi bi-send me-2"></i>Submit Application
            </>
          )}
        </button>
      </div>
    </div>
  );
}
