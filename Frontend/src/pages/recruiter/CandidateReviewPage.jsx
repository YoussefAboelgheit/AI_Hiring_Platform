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
      .then((resData) => {
        console.log("REAL BACKEND DATA:", resData);
        setData(resData);
      })
      .catch((err) => console.error("Error fetching candidate review:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState message="Loading candidate profile..." />;
  if (!data) return <div style={{ padding: 24 }}>No candidate data returned from backend.</div>;

  const {
    applicant = {},
    title = "",
    location = "",
    tags = [],
    cvSummary = "",
    cvUrl = "",
    skills = [],
    education = [],
    projects = [],
    certifications = [],
    aiMatchScore = 0,
    cvScore = 0,
    assessmentScore = 0,
    aiInsight = ""
  } = data;

  return (
    <>
      <BackButton fallbackTo="/recruiter/applications" label="Back to Applicants" />

      <div className="grid-aside-main" style={{ marginTop: 16 }}>
        {/* الجزء الأيسر الرئيسي للبيانات المستخرجة */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* كارت المعلومات الشخصية */}
          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <img 
                src={applicant.avatar || `https://ui-avatars.com/api/?name=${applicant.name?.[0] || 'U'}`} 
                alt="" 
                style={{ width: 72, height: 72, borderRadius: 16, objectFit: "cover", border: "1px solid var(--border)" }} 
              />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{applicant.name}</h2>
                  <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                    <i className="bi bi-patch-check-fill"></i> AI Verified
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{applicant.email}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>{title} · {location}</div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {applicant.status && <StatusBadge status={applicant.status} />}
                  {tags?.map((t, index) => (
                    <span key={index} style={{ background: "var(--body-bg)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 20, fontSize: 12 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* كارت الـ CV Summary والمهارات والتعليم */}
          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 15 }}>
              <i className="bi bi-file-earmark-text" style={{ color: "var(--primary)", fontSize: 18 }}></i>
              <div style={{ fontWeight: 700 }}>CV Summary</div>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 20 }}>
              {cvSummary || "No resume text parsed from the profile backend."}
            </p>
            
            {cvUrl && (
              <a href={cvUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginBottom: 20, color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                <i className="bi bi-box-arrow-up-right me-1"></i>View CV Document
              </a>
            )}
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--primary)", marginBottom: 10, fontSize: 13 }}>Skills</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {skills?.map((s, index) => (
                    <span key={index} className="skill-tag">{s}</span>
                  ))}
                </div>
              </div>
              
              <div>
                <div style={{ fontWeight: 700, color: "var(--primary)", marginBottom: 10, fontSize: 13 }}>Education</div>
                {education?.map((edu, index) => {
                  const degree = Array.isArray(edu) ? edu[0] : (edu.degree || edu.title);
                  const school = Array.isArray(edu) ? edu[1] : (edu.school || edu.institution);
                  return (
                    <div key={index} style={{ marginBottom: 10 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{degree}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{school}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* المشاريع المميزة والشهادات */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="hcard" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>Featured Projects</div>
              {projects?.map((proj, index) => {
                const pTitle = Array.isArray(proj) ? proj[0] : (proj.title || proj.name);
                const pDesc = Array.isArray(proj) ? proj[1] : proj.description;
                return (
                  <div key={index} style={{ background: "var(--body-bg)", borderRadius: 8, padding: "10px 12px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{pTitle}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{pDesc}</div>
                    </div>
                    <i className="bi bi-arrow-up-right text-muted" style={{ fontSize: 12 }}></i>
                  </div>
                );
              })}
            </div>

            <div className="hcard" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>Certifications</div>
              {certifications?.map((cert, index) => {
                const cTitle = Array.isArray(cert) ? cert[0] : cert.title;
                const cDesc = Array.isArray(cert) ? cert[1] : (cert.issuer || cert.date);
                return (
                  <div key={index} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center", background: "var(--body-bg)", padding: "10px 12px", borderRadius: 8 }}>
                    <div style={{ width: 36, height: 36, background: "#f3f5fb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className="bi bi-award" style={{ color: "var(--primary)" }}></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{cTitle}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{cDesc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* الجزء الأيمن (الـ Aside Panel) لـ حسابات الـ AI والـ Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--primary)", borderRadius: 14, padding: 20, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>AI Match Score</div>
              <i className="bi bi-stars" style={{ fontSize: 20 }}></i>
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, marginBottom: 4 }}>
              {Math.round(aiMatchScore)} <span style={{ fontSize: 16, opacity: 0.7 }}>/100</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.3)", borderRadius: 6, marginBottom: 10 }}>
              <div style={{ height: 6, background: "#fff", borderRadius: 6, width: `${aiMatchScore}%` }}></div>
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Based on tech stack alignment, communication style, and assessment results.</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["CV Score", cvScore, "#1d2445"], ["Assessment", assessmentScore, "#059669"]].map(([label, val, color]) => (
              <div key={label} className="hcard" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: color }}>{Math.round(val)}</div>
              </div>
            ))}
          </div>

          <div className="hcard" style={{ padding: 20 }}>
            <button
              type="button"
              onClick={() => navigate("/recruiter/ai-recommendation")}
              style={{ width: "100%", background: "var(--primary-bg)", color: "var(--primary)", border: "1.5px solid #e2e2e2", borderRadius: 10, padding: 12, fontWeight: 700, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
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
              style={{ width: "100%", background: "#fff", color: "var(--danger)", border: "1.5px solid #FEE2E2", borderRadius: 10, padding: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <i className="bi bi-x-circle"></i> Reject Application
            </button>
          </div>

          <div style={{ background: "var(--primary-bg)", border: "1px solid #e2e2e2", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <i className="bi bi-lightbulb" style={{ color: "var(--primary)" }}></i>
              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--primary)" }}>HireAI Insights</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, fontStyle: "italic", lineHeight: 1.6 }}>
              &ldquo;{aiInsight || "Candidate shows high structural compliance with core framework specifications."}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </>
  );
}