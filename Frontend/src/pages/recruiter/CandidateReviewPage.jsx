import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getUserProfileById } from "../../services/profileService";
import { formatEducation, formatSkill, formatSocialLink } from "../../utils/profileFormat";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";
import CircleProgress from "../../components/common/CircleProgress";

export default function CandidateReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  // jobId / applicationId / scores بيوصلوا من صفحة الـ Applicants List عن طريق الـ state
  const { jobId, applicationId, matchScore = 0 } = location.state || {};

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUserProfileById(id)
      .then(setProfile)
      .catch((err) => setError(err.message || "Unable to load candidate profile."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState message="Loading candidate profile..." />;

  if (error) {
    return (
      <>
        <BackButton fallbackTo="/recruiter/applications" label="Back to Applicants" />
        <div className="hcard" style={{ padding: 24, color: "#991B1B", background: "#FEE2E2" }}>{error}</div>
      </>
    );
  }

  if (!profile) return null;

  const skills = profile.skills.map(formatSkill).filter(Boolean);
  const education = profile.education.map(formatEducation).filter((e) => e.degree || e.school);
  const socialLinks = profile.socialLinks.map(formatSocialLink).filter(Boolean);
  const aboutText = profile.about || profile.bio;

  const contactRows = [
    ["bi-envelope", profile.email],
    ["bi-telephone", profile.phone],
    ["bi-geo-alt", profile.location],
    ["bi-link-45deg", profile.portfolio],
  ].filter(([, text]) => Boolean(text));

  const aiMatchScore = Math.round(matchScore || 0);
  const canViewAiReport = Boolean(jobId && applicationId);

  return (
    <>
      <BackButton fallbackTo="/recruiter/applications" label="Back to Applicants" />

      <div className="grid-profile" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="hcard" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
              <img src={profile.avatar} alt="" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--primary-bg)" }} />
              {profile.isVerified && (
                <span style={{ position: "absolute", bottom: 4, right: 4, width: 24, height: 24, background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                  <i className="bi bi-check text-white" style={{ fontSize: 12 }} aria-hidden="true" />
                </span>
              )}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{profile.name || "Unnamed Candidate"}</h2>
            {profile.title && <div style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{profile.title}</div>}

            {contactRows.map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", marginBottom: 8, textAlign: "left" }}>
                <i className={`bi ${icon}`} style={{ color: "var(--primary)" }} aria-hidden="true" />
                {text}
              </div>
            ))}

            {profile.cv && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <a
                  href={profile.cv}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary w-100"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}
                >
                  <i className="bi bi-file-earmark-pdf" />
                  View Attached CV
                </a>
              </div>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div className="hcard" style={{ padding: 24 }}>
              <div style={{ fontWeight: 700, marginBottom: 16 }}>Social Links</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {socialLinks.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--primary)", textDecoration: "none", textTransform: "capitalize" }}>
                    <i className={`bi ${link.icon}`} aria-hidden="true" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="hcard" style={{ padding: 20 }}>
            <button
              type="button"
              disabled={!canViewAiReport}
              onClick={() => canViewAiReport && navigate(`/recruiter/feedback/${jobId}/${applicationId}`)}
              style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: canViewAiReport ? "pointer" : "not-allowed", opacity: canViewAiReport ? 1 : 0.6, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <i className="bi bi-stars"></i> View AI Report
            </button>
          </div>

          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>About</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
              {aboutText || "No bio added yet."}
            </p>
          </div>

          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 700 }}>Skills</div>
            </div>
            {skills.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {skills.map((s) => (
                  <span key={s} className="skill-tag">{s}</span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No skills added yet.</p>
            )}
          </div>

          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 16 }}>Education</div>
            {education.length > 0 ? (
              education.map((edu, i) => (
                <div key={`${edu.degree}-${i}`} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < education.length - 1 ? 16 : 0 }}>
                  <div style={{ width: 40, height: 40, background: "var(--primary-bg)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="bi bi-mortarboard" style={{ color: "var(--primary)" }} aria-hidden="true" />
                  </div>
                  <div>
                    {edu.degree && <div style={{ fontWeight: 700, fontSize: 14 }}>{edu.degree}</div>}
                    {edu.school && <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{edu.school}</div>}
                    {edu.period && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{edu.period}</div>}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No education details added yet.</p>
            )}
          </div>

          {/* دايرة الـ Match Score - خاص بمعاينة الـ HR بس، مش موجود في بروفايل الكانديديت الشخصي */}
          <div className="hcard" style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 16 }}>
              Match Score
            </div>
            <CircleProgress value={aiMatchScore} size={110} />
          </div>
        </div>
      </div>
    </>
  );
}