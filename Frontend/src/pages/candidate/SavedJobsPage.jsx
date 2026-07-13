import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSavedJobs, toggleSaveJob, getJobById, extractSavedJobId } from "../../services/jobService";
import { mapJobForCard } from "../../utils/jobMappers";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";

function SavedJobCard({ job, onUnsave, removing }) {
  const navigate = useNavigate();

  return (
    <div
      className="hcard"
      style={{
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        opacity: removing ? 0.4 : 1,
        transform: removing ? "scale(0.98)" : "scale(1)",
        transition: "opacity 0.25s ease, transform 0.25s ease, box-shadow 0.15s, translate 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(107,33,232,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--card-shadow)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <img
          src={job.logo}
          alt={job.company}
          style={{ width: 48, height: 48, borderRadius: 12, objectFit: "contain", border: "1px solid var(--border)", padding: 5 }}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=EDE9FE&color=7C3AED`;
          }}
        />
        <button
          type="button"
          title="Remove from saved"
          onClick={() => onUnsave(job.id)}
          disabled={removing}
          style={{
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            borderRadius: "50%",
            background: "var(--primary-bg)",
            color: "var(--primary)",
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.color = "#991B1B"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--primary-bg)"; e.currentTarget.style.color = "var(--primary)"; }}
        >
          <i className="bi bi-bookmark-fill" aria-hidden="true" style={{ fontSize: 14 }} />
        </button>
      </div>

      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{job.title}</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
        {job.company} · {job.location}
      </div>

      {job.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {job.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="skill-tag">{skill}</span>
          ))}
          {job.skills.length > 3 && <span className="skill-tag">+{job.skills.length - 3}</span>}
        </div>
      )}

      <button
        type="button"
        style={{
          width: "100%",
          marginTop: "auto",
          padding: "9px 16px",
          fontSize: 13,
          fontWeight: 600,
          borderRadius: 10,
          border: "none",
          background: "var(--accent-teal-dark)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#0C5D57"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-teal-dark)"; }}
        onClick={() => navigate(`/candidate/jobs/${job.id}`)}
      >
        View Details <i className="bi bi-arrow-right" aria-hidden="true" />
      </button>
    </div>
  );
}

export default function SavedJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSavedJobs()
      .then(async (raw) => {
        if (cancelled) return;
        const ids = raw.map(extractSavedJobId).filter(Boolean);
        // /jobs/saved/me doesn't always return the job's full recruiter info (logo/name),
        // so we fetch each job's full record — same source the detail page uses — to keep them consistent.
        const results = await Promise.all(
          ids.map((jobId) => getJobById(jobId).catch(() => null))
        );
        if (cancelled) return;
        const mapped = results.filter(Boolean).map(mapJobForCard);
        setJobs(mapped);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleUnsave = async (jobId) => {
    setRemovingId(jobId);
    try {
      await toggleSaveJob(jobId);
      setTimeout(() => {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
        setRemovingId(null);
      }, 220);
    } catch {
      setRemovingId(null);
    }
  };

  if (loading) return <LoadingState message="Loading your saved jobs..." />;

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Saved Jobs</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
          Jobs you've bookmarked to revisit later.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="hcard" style={{ padding: 0 }}>
          <EmptyState
            icon="bi-bookmark-heart"
            title="No saved jobs yet"
            description="When you find a role you like, tap the bookmark icon on its page and it'll show up here."
            action={
              <button type="button" className="btn-primary-custom" onClick={() => navigate("/candidate/jobs")}>
                Browse Jobs
              </button>
            }
          />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {jobs.map((job) => (
            <SavedJobCard key={job.id} job={job} onUnsave={handleUnsave} removing={removingId === job.id} />
          ))}
        </div>
      )}
    </>
  );
}