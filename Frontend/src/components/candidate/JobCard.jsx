import { useNavigate } from "react-router-dom";

const WORKPLACE_BADGE_CLASS = {
  Remote: "job-card-workplace-badge--remote",
  Onsite: "job-card-workplace-badge--onsite",
  Hybrid: "job-card-workplace-badge--hybrid",
};

export default function JobCard({ job, isSaved = false, onToggleSave }) {
  const navigate = useNavigate();

  const workplaceLabel = job.workplace === "Onsite" ? "On-site" : job.workplace;

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    onToggleSave?.(job.id);
  };

  return (
    <div
      className="hcard job-card"
      style={{ display: "flex", flexDirection: "column", transition: "transform 0.15s, box-shadow 0.15s" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,118,110,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--card-shadow)";
      }}
    >
      <div className="job-card-top">
        <img
          src={job.logo}
          alt={job.company}
          className="job-card-logo"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=F3F5FB&color=1D2445`;
          }}
        />
        <div className="job-card-badges">
          {workplaceLabel && (
            <span className={`job-card-workplace-badge ${WORKPLACE_BADGE_CLASS[job.workplace] || ""}`}>
              {workplaceLabel}
            </span>
          )}
          <button
            type="button"
            className={`job-card-bookmark ${isSaved ? "job-card-bookmark--active" : ""}`}
            aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
            aria-pressed={isSaved}
            onClick={handleBookmarkClick}
          >
            <i className={`bi ${isSaved ? "bi-bookmark-fill" : "bi-bookmark"}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="job-card-title">{job.title}</div>
      <div className="job-card-company">{job.company}</div>

      <div className="job-card-meta">
        <span><i className="bi bi-geo-alt" aria-hidden="true" /> {job.location}</span>
        {job.type && <span><i className="bi bi-briefcase" aria-hidden="true" /> {job.type}</span>}
      </div>

      <div className="job-card-tags">
        {job.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
        {job.skills.length > 4 && (
          <span className="skill-tag">+{job.skills.length - 4}</span>
        )}
      </div>

      <div className="job-card-footer">
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Requirements</div>
          <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {job.experience}
          </div>
        </div>
        <div className="job-card-cta-row" style={{ marginTop: 0 }}>
          <button
            type="button"
            className="btn-primary-custom"
            style={{ padding: "8px 16px", fontSize: 13, flexShrink: 0 }}
            onClick={() => navigate(`/candidate/jobs/${job.id}`)}
          >
            View Details
          </button>
          <button
            type="button"
            className="job-card-arrow-btn"
            aria-label="View job details"
            onClick={() => navigate(`/candidate/jobs/${job.id}`)}
          >
            <i className="bi bi-chevron-right" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}