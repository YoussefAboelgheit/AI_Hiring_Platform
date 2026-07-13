import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecruiterProfile } from "../../services/profileService";
import { formatSocialLink } from "../../utils/profileFormat";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

export default function RecruiterProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRecruiterProfile()
      .then(setProfile)
      .catch((err) => setError(err.message || "Unable to load profile."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading profile..." />;

  if (error) {
    return (
      <>
        <BackButton fallbackTo="/recruiter/dashboard" label="Back to Dashboard" />
        <div className="hcard" style={{ padding: 24, color: "#991B1B", background: "#FEE2E2" }}>{error}</div>
      </>
    );
  }

  if (!profile) return null;

  const logo = profile.companyLogo || profile.avatar;
  const socialLinks = profile.socialLinks.map(formatSocialLink).filter(Boolean);

  const companyRows = [
    ["bi-briefcase", profile.industry],
    ["bi-geo-alt", profile.companyLocation || profile.location],
    ["bi-people", profile.companySize && `${profile.companySize} employees`],
    ["bi-calendar-event", profile.foundedYear && `Founded ${profile.foundedYear}`],
  ].filter(([, text]) => Boolean(text));

  return (
    <>
      <BackButton forceTo="/recruiter/dashboard" label="Back to Dashboard" />
      <div className="page-header-row">
        <div>
          <h1>Company Profile</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Manage how your company appears to candidates.</p>
        </div>

        <Link to="/recruiter/profile/edit" className="btn-primary-custom" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          <i className="bi bi-pencil me-2" />
          Edit Profile
        </Link>
      </div>

      <div className="grid-profile">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="hcard" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
              <img src={logo} alt="" style={{ width: 100, height: 100, borderRadius: 16, objectFit: "cover", border: "3px solid var(--primary-bg)", background: "#fff" }} />
              {profile.isVerified && (
                <span style={{ position: "absolute", bottom: 4, right: 4, width: 24, height: 24, background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                  <i className="bi bi-check text-white" style={{ fontSize: 12 }} aria-hidden="true" />
                </span>
              )}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{profile.companyName || "Your Company"}</h2>
            {profile.industry && <div style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{profile.industry}</div>}

            {companyRows.map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", marginBottom: 8, textAlign: "left" }}>
                <i className={`bi ${icon}`} style={{ color: "var(--primary)" }} aria-hidden="true" />
                {text}
              </div>
            ))}

            {profile.companyWebsite && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <a
                  href={/^https?:\/\//i.test(profile.companyWebsite) ? profile.companyWebsite : `https://${profile.companyWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary w-100"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}
                >
                  <i className="bi bi-globe" />
                  Visit Website
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
          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>About the Company</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
              {profile.companyDescription || "No company description yet. Click \u201cEdit Profile\u201d to introduce your company to candidates."}
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
