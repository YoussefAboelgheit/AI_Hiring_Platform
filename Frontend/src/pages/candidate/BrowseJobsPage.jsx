import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../../services/jobService";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";

export default function BrowseJobsPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [roleType, setRoleType] = useState("");
  const [expLevel, setExpLevel] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({});
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await getJobs(appliedFilters);
        if (!cancelled) setJobs(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({ location, roleType, expLevel });
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Explore Opportunities</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Discover your next career milestone with AI-powered job matching tailored to your unique skill set.
          </p>
        </div>
      </div>

      <div className="hcard" style={{ padding: "16px 20px", marginBottom: 24, display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", borderRadius: 10, padding: "9px 14px", flex: 1 }}>
          <i className="bi bi-geo-alt text-muted"></i>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            style={{ border: "none", outline: "none", fontSize: 14, width: "100%" }}
          />
        </div>
        <select
          value={roleType}
          onChange={(e) => setRoleType(e.target.value)}
          style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "9px 14px", fontSize: 14, flex: 1, outline: "none" }}
        >
          <option value="">Role Type</option>
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Remote</option>
          <option>Contract</option>
        </select>
        <select
          value={expLevel}
          onChange={(e) => setExpLevel(e.target.value)}
          style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "9px 14px", fontSize: 14, flex: 1, outline: "none" }}
        >
          <option value="">Experience Level</option>
          <option>3-5 Years</option>
          <option>5+ Years</option>
          <option>8+ Years</option>
        </select>
        <button className="btn-primary-custom" onClick={handleApplyFilters}>Apply Filters</button>
      </div>

      {loading ? (
        <LoadingState message="Loading jobs..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="bi-search"
          title="No jobs match your filters"
          description="Try adjusting your location, role type, or experience level to see more results."
          action={
            <button
              className="btn-outline-custom"
              onClick={() => {
                setLocation("");
                setRoleType("");
                setExpLevel("");
                setAppliedFilters({});
              }}
            >
              Clear Filters
            </button>
          }
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {jobs.map((job) => (
            <div
              key={job.id}
              className="hcard"
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
                <img
                  src={job.logo}
                  alt={job.company}
                  style={{ width: 44, height: 44, borderRadius: 10, objectFit: "contain", border: "1px solid var(--border)", padding: 4 }}
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${job.company}&background=EDE9FE&color=7C3AED`; }}
                />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  {job.match && (
                    <span className="match-pill"><i className="bi bi-stars"></i>{job.match}% Match</span>
                  )}
                  {job.badge && (
                    <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                      {job.badge}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{job.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                {job.company} · {job.location}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {job.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{job.salary ? "Salary Range" : "Experience"}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{job.salary || job.experience}</div>
                </div>
                <button
                  className="btn-primary-custom"
                  style={{ padding: "8px 16px", fontSize: 13 }}
                  onClick={() => navigate(`/candidate/jobs/${job.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
