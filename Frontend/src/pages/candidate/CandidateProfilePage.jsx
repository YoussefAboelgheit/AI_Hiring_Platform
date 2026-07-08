import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import { getCandidateProfile } from "../../services/profileService";
import CircleProgress from "../../components/common/CircleProgress";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCandidateProfile()
      .then(setProfile)
      .catch((err) => setError(err.message || "Unable to load profile."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading profile..." />;

  if (error) {
    return (
      <>
        {/* Updated Error State Back Button */}
        <BackButton fallbackTo="/candidate/applications" label="Back to My Applications" />
        <div className="hcard" style={{ padding: 24, color: "#991B1B", background: "#FEE2E2" }}>{error}</div>
      </>
    );
  }

  if (!profile) return null;

  return (
    <>
      {/* Updated Main Back Button */}
    <BackButton forceTo="/candidate/applications" label="Back to my  Applications" />      
      <div className="page-header-row">
        <div>
          <h1>Candidate Profile</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Manage your professional identity and resume details.</p>
        </div>
        
        <Link to="/candidate/profile/complete" className="btn-primary-custom" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          <i className="bi bi-pencil me-2" />
          Edit Profile
        </Link>
      </div>

      <div className="grid-profile">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="hcard" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
              <img src={profile.avatar} alt="" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--primary-bg)" }} />
              <span style={{ position: "absolute", bottom: 4, right: 4, width: 24, height: 24, background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                <i className="bi bi-check text-white" style={{ fontSize: 12 }} aria-hidden="true" />
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{profile.name}</h2>
            <div style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{profile.title}</div>
            {[
              ["bi-envelope", profile.email],
              ["bi-geo-alt", profile.location],
              ["bi-link-45deg", profile.portfolio],
            ]
              .filter(([, text]) => text)
              .map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", marginBottom: 8, textAlign: "left" }}>
                <i className={`bi ${icon}`} style={{ color: "var(--primary)" }} aria-hidden="true" />
                {text}
              </div>
            ))}
            
            <div style={{ textAlign: "left", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 8 }}>BIO</div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>{profile.bio || "No bio added yet."}</p>
              
              {profile.cv && (
                <div style={{ marginTop: 16 }}>
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
          </div>

          {profile.matchScore != null && (
            <div className="hcard" style={{ padding: 20, background: "var(--primary-bg)", border: "1px solid #DDD6FE" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <CircleProgress value={profile.matchScore} size={72} stroke={6} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{profile.matchLabel}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Based on recent applications</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 700 }}>Skill Summary</div>
              <span className="ai-badge"><i className="bi bi-stars" /> AI-Analyzed</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {profile.skills?.length ? (
                profile.skills.map((s) => (
                  <span key={s} className="skill-tag" style={s === "AI Prompting" ? { background: "#CCFBF1", color: "#0F766E" } : undefined}>{s}</span>
                ))
              ) : (
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>No skills added yet.</span>
              )}
            </div>
          </div>

          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 20 }}>Work Experience</div>
            {profile.experience?.length ? (
              profile.experience.map((exp, i) => (
                <div key={exp.title} style={{ display: "flex", gap: 16, marginBottom: i < profile.experience.length - 1 ? 24 : 0 }}>
                  <div style={{ width: 2, background: i === 0 ? "var(--primary)" : "var(--border)", borderRadius: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{exp.title}</div>
                    <div style={{ fontSize: 13, color: "var(--primary)", marginBottom: 4 }}>{exp.company} · {exp.type}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{exp.period}</div>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>{exp.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No work experience added yet.</p>
            )}
          </div>

          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 16 }}>Education</div>
            {profile.education?.length ? (
              profile.education.map((edu) => (
                <div key={edu.degree} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, background: "var(--primary-bg)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="bi bi-mortarboard" style={{ color: "var(--primary)" }} aria-hidden="true" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{edu.degree}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{edu.school}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{edu.year}</div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No education added yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}