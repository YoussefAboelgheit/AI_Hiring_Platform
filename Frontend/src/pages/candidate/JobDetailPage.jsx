import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getJobById, getJobDescriptionBullets } from "../../services/jobService";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import BackButton from "../../components/common/BackButton";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [bullets, setBullets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [jobData, bulletsData] = await Promise.all([
          getJobById(id),
          getJobDescriptionBullets(),
        ]);
        if (!cancelled) {
          setJob(jobData);
          setBullets(bulletsData);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <LoadingState message="Loading job details..." />;

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
    <>
      <BackButton fallbackTo="/candidate/jobs" label="Back to Jobs" />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20, fontSize: 13, color: "var(--text-muted)", flexWrap: "wrap" }}>
        <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => navigate("/candidate/jobs")}>Jobs</span>
        <i className="bi bi-chevron-right"></i>
        <span>{job.title}</span>
      </div>

      <div className="grid-aside-main">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="hcard" style={{ padding: 28 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
              <img
                src={job.logo}
                alt={job.company}
                style={{ width: 60, height: 60, borderRadius: 14, objectFit: "contain", border: "1px solid var(--border)", padding: 6 }}
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${job.company}&background=EDE9FE&color=7C3AED`; }}
              />
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{job.title}</h1>
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{job.company}</div>
              </div>
              {job.match && (
                <span className="match-pill" style={{ fontSize: 14, padding: "6px 12px" }}>
                  <i className="bi bi-stars"></i>{job.match}% Match
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", background: "var(--body-bg)", padding: "5px 12px", borderRadius: 8 }}>
                <i className="bi bi-geo-alt"></i> {job.location}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", background: "var(--body-bg)", padding: "5px 12px", borderRadius: 8 }}>
                <i className="bi bi-briefcase"></i> {job.type}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", background: "var(--body-bg)", padding: "5px 12px", borderRadius: 8 }}>
                <i className="bi bi-bar-chart"></i> {job.experience}
              </span>
              {job.salary && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--primary)", background: "var(--primary-bg)", padding: "5px 12px", borderRadius: 8, fontWeight: 600 }}>
                  <i className="bi bi-currency-dollar"></i> {job.salary}
                </span>
              )}
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Required Skills</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {job.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
              </div>
            </div>
          </div>

          <div className="hcard" style={{ padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>About this role</div>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
              We&apos;re looking for a passionate {job.title} to join our growing team at {job.company}.
              You&apos;ll work closely with cross-functional teams to deliver exceptional user experiences that drive business impact at scale.
            </p>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
              You&apos;ll be responsible for leading design initiatives, collaborating with engineers,
              and advocating for user-centered design practices across the organization.
            </p>
            <div style={{ fontWeight: 700, fontSize: 15, margin: "20px 0 12px" }}>What you&apos;ll do</div>
            {bullets.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 14, color: "var(--text-muted)" }}>
                <i className="bi bi-check-circle-fill" style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }}></i>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="hcard" style={{ padding: 20 }}>
            <button
              className="btn-primary-custom"
              style={{ width: "100%", marginBottom: 10 }}
              onClick={() => navigate(`/candidate/jobs/${job.id}/apply`)}
            >
              Apply Now
            </button>
            <button className="btn-outline-custom" style={{ width: "100%" }}>Save Job</button>
          </div>
          <div className="hcard" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Job Overview</div>
            {[["Posted", job.posted], ["Location", job.location], ["Job Type", job.type], ["Experience", job.experience]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
