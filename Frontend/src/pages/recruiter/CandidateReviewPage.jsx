import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCandidateReview } from "../../services/recruiterService";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";
import StatusBadge from "../../components/common/StatusBadge";

export default function CandidateReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCandidateReview(id)
      .then((data) => {
        console.log("REAL BACKEND DATA:", data);
        setData(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState message="Loading candidate..." />;
  if (!data) return null;

  const { applicant, name, title, location, tags, cvSummary, cvUrl, skills, education, projects, certifications, aiMatchScore, cvScore, assessmentScore, aiInsight } = data;

  return (
    <>
      <BackButton fallbackTo="/recruiter/applications" label="Back to Applicants" />

      <div className="grid-aside-main">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <img src={applicant.avatar || `https://ui-avatars.com/api/?name=${applicant.name?.[0] || 'U'}`} alt="" style={{ width: 72, height: 72, borderRadius: 16, objectFit: "cover" }} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{applicant.name}</h2>
                  <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                    <i className="bi bi-patch-check-fill"></i> AI Verified
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{applicant.email}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>{title} · {location}</div>
                <StatusBadge status={applicant.status} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  {tags.map((t) => (
                    <span key={t} style={{ background: "var(--body-bg)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 20, fontSize: 12 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 15 }}>
              <i className="bi bi-file-earmark-text" style={{ color: "var(--primary)" }}></i>
              <div style={{ fontWeight: 700 }}>CV Summary</div>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 20 }}>{cvSummary}</p>
            {cvUrl && (
              <a href={cvUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginBottom: 20, color: "var(--primary)", fontWeight: 600 }}>View CV Document</a>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--primary)", marginBottom: 10, fontSize: 13 }}>Skills</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {skills.map((s) => (
                    <span key={s} className="skill-tag">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--primary)", marginBottom: 10, fontSize: 13 }}>Education</div>
                {education.map(([deg, school]) => (
                  <div key={deg} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{deg}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{school}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="hcard" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>Featured Projects</div>
              {projects.map(([t, d]) => (
                <div key={t} style={{ background: "var(--body-bg)", borderRadius: 8, padding: "10px 12px", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{t}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d}</div>
                  </div>
                  <i className="bi bi-arrow-up-right text-muted"></i>
                </div>
              ))}
            </div>
            <div className="hcard" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>Certifications</div>
              {certifications.map(([t, d]) => (
                <div key={t} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center", background: "var(--body-bg)", padding: "10px 12px", borderRadius: 8 }}>
                  <div style={{ width: 36, height: 36, background: "#EDE9FE", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="bi bi-award" style={{ color: "var(--primary)" }}></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{t}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--primary)", borderRadius: 14, padding: 20, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>AI Match Score</div>
              <i className="bi bi-stars" style={{ fontSize: 20 }}></i>
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, marginBottom: 4 }}>
              {aiMatchScore} <span style={{ fontSize: 16, opacity: 0.7 }}>/100</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.3)", borderRadius: 6, marginBottom: 10 }}>
              <div style={{ height: 6, background: "#fff", borderRadius: 6, width: `${aiMatchScore}%` }}></div>
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Based on tech stack alignment, communication style, and assessment results.</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["CV Score", cvScore, "#7C3AED"], ["Assessment", assessmentScore, "#059669"]].map(([label, val, color]) => (
              <div key={label} className="hcard" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color }}>{val}</div>
              </div>
            ))}
          </div>

          <div className="hcard" style={{ padding: 20 }}>
            <button
              type="button"
              onClick={() => navigate("/recruiter/ai-recommendation")}
              style={{ width: "100%", background: "var(--primary-bg)", color: "var(--primary)", border: "1.5px solid #DDD6FE", borderRadius: 10, padding: 12, fontWeight: 700, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <i className="bi bi-stars"></i> View AI Recommendation
            </button>
            <button
              type="button"
              style={{ width: "100%", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <i className="bi bi-star-fill"></i> Shortlist Candidate
            </button>
            <button
              type="button"
              style={{ width: "100%", background: "#fff", color: "var(--text-dark)", border: "1.5px solid var(--border)", borderRadius: 10, padding: 12, fontWeight: 700, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <i className="bi bi-envelope"></i> Send Message
            </button>
            <button
              type="button"
              style={{ width: "100%", background: "#fff", color: "var(--danger)", border: "1.5px solid #FEE2E2", borderRadius: 10, padding: 12, fontWeight: 200, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <i className="bi bi-x"></i> Reject Application
            </button>
          </div>

          <div style={{ background: "var(--primary-bg)", border: "1px solid #DDD6FE", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <i className="bi bi-lightbulb" style={{ color: "var(--primary)" }}></i>
              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--primary)" }}>HireAI Insights</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, fontStyle: "italic", lineHeight: 1.6 }}>&ldquo;{aiInsight}&rdquo;</p>
          </div>
        </div>
      </div>
    </>
  );
}
