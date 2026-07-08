import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecruiterProfile } from "../../services/profileService";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

function withProtocol(url) {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

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
        <BackButton forceTo="/recruiter/dashboard" label="Back to Dashboard" />
        <div className="hcard" style={{ padding: 24, color: "#991B1B", background: "#FEE2E2" }}>{error}</div>
      </>
    );
  }

  if (!profile) return null;

  const { company } = profile;
  const contactRows = [
    ["bi-envelope", profile.email],
    ["bi-geo-alt", company.location],
    ["bi-globe", company.website && withProtocol(company.website)],
  ].filter(([, value]) => Boolean(value));

  const companyDetails = [
    ["bi-briefcase", "Industry", company.industry],
    ["bi-people", "Company Size", company.size],
    ["bi-calendar-event", "Founded", company.foundedYear],
    ["bi-geo-alt", "Location", company.location],
  ].filter(([, , value]) => Boolean(value));

  return (
    <>
      <BackButton forceTo="/recruiter/dashboard" label="Back to Dashboard" />
      <div className="page-header-row">
        <div>
          <h1>Company Profile</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Manage your company identity and how candidates see you.
          </p>
        </div>

        <Link
          to="/candidate/profile/complete"
          className="btn-primary-custom"
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
        >
          <i className="bi bi-pencil me-2" />
          Edit Profile
        </Link>
      </div>

      <div className="grid-profile">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="hcard" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
              <img
                src={
                  profile.logo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    company.name || profile.name || "Company"
                  )}&background=EDE9FE&color=7C3AED&size=150`
                }
                alt=""
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "18px",
                  objectFit: "cover",
                  border: "3px solid var(--primary-bg)",
                  background: "#fff",
                }}
              />
              {profile.isVerified && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    width: 24,
                    height: 24,
                    background: "var(--primary)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #fff",
                  }}
                >
                  <i className="bi bi-check text-white" style={{ fontSize: 12 }} aria-hidden="true" />
                </span>
              )}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
              {company.name || profile.name}
            </h2>
            <div style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
              {profile.jobTitle || "Recruiter"}
            </div>

            {contactRows.map(([icon, text]) => (
              <div
                key={text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginBottom: 8,
                  textAlign: "left",
                }}
              >
                <i className={`bi ${icon}`} style={{ color: "var(--primary)" }} aria-hidden="true" />
                {text}
              </div>
            ))}

            {profile.socialLinks?.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "center",
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px solid var(--border)",
                }}
              >
                {profile.socialLinks.map((link) => (
                  <a
                    key={typeof link === "string" ? link : link.url}
                    href={withProtocol(typeof link === "string" ? link : link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--primary)", fontSize: 18 }}
                  >
                    <i className="bi bi-link-45deg" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 16 }}>Company Details</div>
            {companyDetails.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                {companyDetails.map(([icon, label, value]) => (
                  <div key={label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: "var(--primary-bg)",
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i className={`bi ${icon}`} style={{ color: "var(--primary)" }} aria-hidden="true" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                No company details added yet. Use “Edit Profile” to complete your company info.
              </p>
            )}
          </div>

          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 16 }}>About the Company</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
              {company.description || profile.bio || "No description provided yet."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
