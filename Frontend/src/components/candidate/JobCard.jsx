import { useNavigate } from "react-router-dom";

export default function JobCard({ job }) {
  const navigate = useNavigate();

  return (
    <div
      className="hcard job-card"
      style={{ padding: 20, display: "flex", flexDirection: "column", gap: 0, transition: "transform 0.15s, box-shadow 0.15s" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(107,33,232,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--card-shadow)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={job.logo}
            alt={job.company}
            style={{ width: 44, height: 44, borderRadius: 10, objectFit: "contain", border: "1px solid var(--border)", padding: 4 }}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=F3F5FB&color=1D2445`;
            }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{job.company}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{job.location}</div>
          </div>
        </div>
        {job.badge && (
          <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
            {job.badge}
          </span>
        )}
      </div>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{job.title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {job.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
        {job.skills.length > 4 && (
          <span className="skill-tag">+{job.skills.length - 4}</span>
        )}
      </div>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Requirements</div>
          <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {job.experience}
          </div>
        </div>
        <button
          type="button"
          className="btn-primary-custom"
          style={{ padding: "8px 16px", fontSize: 13, flexShrink: 0 }}
          onClick={() => navigate(`/candidate/jobs/${job.id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
