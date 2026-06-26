import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getJobById, isJobAvailableForCandidate } from "../../services/jobService";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import BackButton from "../../components/common/BackButton";

/** Normalize raw backend job into a flat UI shape */
function normalizeJob(raw) {
  if (!raw) return null;
  return {
    id: raw._id,
    title: raw.title || "Untitled",
    company: raw.recruiter?.name || raw.recruiter?.username || "HireAI Recruiter",
    logo: raw.recruiter?.profile_image || raw.recruiter?.company_logo || "",
    location: raw.location || "Remote",
    type: raw.jobType || "",
    workplace: raw.workplace || "",
    experience: raw.requirements || "Experience details not specified",
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    description: raw.description || "",
    categoryName: raw.category?.name || "",
    applicationEnd: raw.applicationEnd || null,
    status: raw.status || "",
    posted: raw.createdAt ? new Date(raw.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
  };
}

const DESCRIPTION_BULLETS = [
  "Design and develop responsive, robust web applications using modern frameworks.",
  "Collaborate with product, design, and backend teams to define feature requirements.",
  "Optimize code and resources for maximum performance, scalability, and speed.",
  "Write clean, well-documented, and testable code with high quality standards.",
];

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const isDeadlinePast = job.applicationEnd && new Date(job.applicationEnd) < new Date();
  const isAvailable = isJobAvailableForCandidate({
    status: job.status,
    applicationEnd: job.applicationEnd,
  });

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
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=EDE9FE&color=7C3AED`; }}
              />
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{job.title}</h1>
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{job.company}</div>
              </div>
              {job.status === "Open" && (
                <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
                  Hiring
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              {job.location && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", background: "var(--body-bg)", padding: "5px 12px", borderRadius: 8 }}>
                  <i className="bi bi-geo-alt"></i> {job.location}
                </span>
              )}
              {job.type && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", background: "var(--body-bg)", padding: "5px 12px", borderRadius: 8 }}>
                  <i className="bi bi-briefcase"></i> {job.type}
                </span>
              )}
              {job.workplace && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", background: "var(--body-bg)", padding: "5px 12px", borderRadius: 8 }}>
                  <i className="bi bi-building"></i> {job.workplace}
                </span>
              )}
              {job.categoryName && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--primary)", background: "var(--primary-bg)", padding: "5px 12px", borderRadius: 8, fontWeight: 600 }}>
                  <i className="bi bi-tag"></i> {job.categoryName}
                </span>
              )}
              {job.applicationEnd && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: isDeadlinePast ? "var(--danger)" : "var(--text-muted)", background: "var(--body-bg)", padding: "5px 12px", borderRadius: 8 }}>
                  <i className={`bi ${isDeadlinePast ? "bi-calendar-x" : "bi-calendar-event"}`}></i>
                  {isDeadlinePast ? "Applications closed" : `Apply by ${new Date(job.applicationEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
                </span>
              )}
            </div>
            {job.skills.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Required Skills</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {job.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              </div>
            )}
          </div>

          <div className="hcard" style={{ padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>About this role</div>
            {job.description ? (
              <p style={{ color: "var(--text-muted)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{job.description}</p>
            ) : (
              <>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                  We&apos;re looking for a passionate {job.title} to join our growing team at {job.company}.
                  You&apos;ll work closely with cross-functional teams to deliver exceptional user experiences that drive business impact at scale.
                </p>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                  You&apos;ll be responsible for leading design initiatives, collaborating with engineers,
                  and advocating for user-centered design practices across the organization.
                </p>
              </>
            )}
            {job.experience && job.experience !== "Experience details not specified" && (
              <>
                <div style={{ fontWeight: 700, fontSize: 15, margin: "20px 0 12px" }}>Requirements</div>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{job.experience}</p>
              </>
            )}
            <div style={{ fontWeight: 700, fontSize: 15, margin: "20px 0 12px" }}>What you&apos;ll do</div>
            {DESCRIPTION_BULLETS.map((item, i) => (
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
              disabled={!isAvailable}
              onClick={() => navigate(`/candidate/jobs/${job.id}/apply`)}
            >
              {!isAvailable ? "Applications Closed" : "Apply Now"}
            </button>
            <button className="btn-outline-custom" style={{ width: "100%" }}>Save Job</button>
          </div>
          <div className="hcard" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Job Overview</div>
            {[
              ["Posted", job.posted],
              ["Location", job.location],
              ["Job Type", job.type],
              ["Workplace", job.workplace],
              ["Category", job.categoryName],
              ["Deadline", job.applicationEnd ? new Date(job.applicationEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null],
            ]
              .filter(([, v]) => !!v)
              .map(([k, v]) => (
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
