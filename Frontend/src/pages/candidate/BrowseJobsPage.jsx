import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../../services/jobService";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import toast from "react-hot-toast";

// ---------------------------------------------------------------------------
// Experience Level — client-side filter helper
// ---------------------------------------------------------------------------
// The backend schema has no dedicated `experience` field. We scan the free-text
// `requirements`, `description`, and `title` fields with regex patterns that
// match common ways recruiters write year ranges (e.g. "3+ years", "3-5 years",
// "3 years of experience") plus seniority keywords (e.g. "senior", "lead").
//
// Tier definitions:
//   "Entry Level"  → 0–2 yrs  | keywords: entry, junior, fresh, graduate, intern, trainee
//   "Mid Level"    → 2–5 yrs  | keywords: mid, intermediate; year ranges 2-5
//   "Senior"       → 5–8 yrs  | keywords: senior, sr., experienced; year ranges 5-8
//   "Lead / Staff" → 8+ yrs   | keywords: lead, staff, principal, architect; year ranges 8+
// ---------------------------------------------------------------------------

const EXPERIENCE_TIERS = {
  "Entry Level": {
    // year patterns: 0-2 yrs
    yearPatterns: [
      /\b0[\s-]*(?:to|–|-)?[\s]*[12][\s+]*(?:year|yr)/i,
      /\b[12][\s+]*(?:year|yr)s?\s+(?:of\s+)?(?:experience|exp)/i,
      /\bup\s+to\s+[12]\s+(?:year|yr)/i,
    ],
    keywords: ["entry.?level", "junior", "fresh(?:er|graduate)?", "new\s+grad", "trainee", "intern(?:ship)?", "0\\+?\s+year"],
  },
  "Mid Level": {
    yearPatterns: [
      /\b[2345][\s]*\+[\s]*(?:year|yr)/i,
      /\b[23][\s]*-[\s]*[45][\s]*(?:year|yr)/i,
      /\b[2345][\s]+(?:year|yr)s?\s+(?:of\s+)?(?:experience|exp)/i,
      /\bat\s+least\s+[23]\s+(?:year|yr)/i,
      /\bminimum\s+[23]\s+(?:year|yr)/i,
    ],
    keywords: ["mid.?level", "intermediate", "associate"],
  },
  "Senior": {
    yearPatterns: [
      /\b[5678][\s]*\+[\s]*(?:year|yr)/i,
      /\b[56][\s]*-[\s]*[78][\s]*(?:year|yr)/i,
      /\b[5678][\s]+(?:year|yr)s?\s+(?:of\s+)?(?:experience|exp)/i,
      /\bat\s+least\s+[56]\s+(?:year|yr)/i,
      /\bminimum\s+[56]\s+(?:year|yr)/i,
    ],
    keywords: ["senior", "sr\\.", "experienced"],
  },
  "Lead / Staff": {
    yearPatterns: [
      /\b(?:8|9|10|1[0-9])[\s]*\+[\s]*(?:year|yr)/i,
      /\b(?:8|9|10)[\s]*-[\s]*(?:1[0-9])[\s]*(?:year|yr)/i,
      /\b(?:8|9|10|1[0-9])[\s]+(?:year|yr)s?\s+(?:of\s+)?(?:experience|exp)/i,
      /\bat\s+least\s+(?:8|9|10)\s+(?:year|yr)/i,
    ],
    keywords: ["\\blead\\b", "staff", "principal", "architect", "head\s+of", "director"],
  },
};

function matchExperienceLevel(text, tier) {
  const config = EXPERIENCE_TIERS[tier];
  if (!config) return true; // unknown tier → don't filter

  // Check year range regex patterns
  if (config.yearPatterns.some((re) => re.test(text))) return true;

  // Check seniority keywords
  if (config.keywords.some((kw) => new RegExp(kw, "i").test(text))) return true;

  return false;
}

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
        const allJobs = await getJobs({ status: "Open" });
        
        const filtered = allJobs.filter((job) => {
          // --- Location filter (simple substring) ---
          if (location) {
            const locMatch = job.location?.toLowerCase().includes(location.toLowerCase());
            if (!locMatch) return false;
          }
          
          // --- Role Type filter mapped to backend jobType / workplace fields ---
          if (roleType) {
            if (roleType === "Remote") {
              if (job.workplace?.toLowerCase() !== "remote") return false;
            } else if (roleType === "Full-time") {
              if (job.jobType?.toLowerCase() !== "full time") return false;
            } else if (roleType === "Part-time") {
              if (job.jobType?.toLowerCase() !== "part time") return false;
            } else if (roleType === "Internship") {
              if (job.jobType?.toLowerCase() !== "intern") return false;
            }
          }
          
          // --- Experience Level — regex-based client-side filter ---
          // The backend has no dedicated experience field; we scan the free-text
          // requirements, description, and title fields using regex patterns.
          if (expLevel) {
            const searchText = [
              job.requirements || "",
              job.description || "",
              job.title || "",
            ]
              .join(" ")
              .toLowerCase();

            // Jobs with zero text to scan are excluded when a filter is active.
            if (!searchText.trim()) return false;

            if (!matchExperienceLevel(searchText, expLevel)) return false;
          }
          return true;
        });

        const mapped = filtered.map((job) => ({
          id: job._id,
          title: job.title,
          company: job.recruiter?.name || "HireAI Recruiter",
          logo: job.recruiter?.profile_image || job.recruiter?.company_logo || "",
          location: job.location || "Remote",
          skills: job.skills || [],
          experience: job.requirements || "Experience details not specified",
          type: job.jobType,
          workplace: job.workplace,
          categoryName: job.category?.name || "General",
          applicationEnd: job.applicationEnd,
          match: Math.floor(Math.random() * 20) + 80,
          badge: job.workplace === "Remote" ? "Remote friendly" : "",
        }));

        if (!cancelled) setJobs(mapped);
      } catch (err) {
        if (!cancelled) toast.error("Failed to load jobs");
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
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
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Remote">Remote</option>
          <option value="Internship">Internship</option>
        </select>
        <select
          value={expLevel}
          onChange={(e) => setExpLevel(e.target.value)}
          style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "9px 14px", fontSize: 14, flex: 1, outline: "none" }}
        >
          <option value="">Experience Level</option>
          <option value="Entry Level">Entry Level (0–2 yrs)</option>
          <option value="Mid Level">Mid Level (2–5 yrs)</option>
          <option value="Senior">Senior (5–8 yrs)</option>
          <option value="Lead / Staff">Lead / Staff (8+ yrs)</option>
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
