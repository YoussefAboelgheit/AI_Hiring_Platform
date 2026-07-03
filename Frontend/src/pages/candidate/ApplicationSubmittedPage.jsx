import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getApplicationSubmitted } from "../../services/applicationService";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";
import EmptyState from "../../components/common/EmptyState";

export default function ApplicationSubmittedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!applicationId) {
      setError("Missing application reference.");
      setLoading(false);
      return;
    }

    getApplicationSubmitted(applicationId)
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load application details."))
      .finally(() => setLoading(false));
  }, [applicationId]);

  if (loading) return <LoadingState message="Loading..." />;

  if (error || !data) {
    return (
      <EmptyState
        icon="bi-exclamation-circle"
        title="Unable to load confirmation"
        description={error || "Application details could not be loaded."}
        action={
          <button type="button" className="btn-primary-custom" onClick={() => navigate("/candidate/applications")}>
            Go to My Applications
          </button>
        }
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", textAlign: "center" }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div style={{ textAlign: "left" }}>
          <BackButton fallbackTo="/candidate/jobs" label="Back to Jobs" />
        </div>
        <div style={{ background: "#1A1A2E", color: "#fff", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} />
          Reference #{data.referenceId}
        </div>

        <div style={{ position: "relative", width: 200, height: 200, marginBottom: 32 }}>
          <div style={{ width: 160, height: 160, borderRadius: "50%", background: "linear-gradient(135deg, #EDE9FE, #DBEAFE)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="bi bi-person-workspace" style={{ fontSize: 64, color: "var(--primary)" }} aria-hidden="true" />
          </div>
          <span style={{ position: "absolute", top: 10, right: 20, width: 32, height: 32, background: "var(--success)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <i className="bi bi-check-lg" aria-hidden="true" />
          </span>
          <span style={{ position: "absolute", bottom: 20, left: 0, fontSize: 20, color: "var(--primary)" }}>✦</span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, maxWidth: 480 }}>Application Submitted Successfully!</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.7, maxWidth: 520, marginBottom: 20 }}>{data.message}</p>

        <span style={{ background: "var(--primary-bg)", color: "var(--primary)", padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 32, display: "inline-block" }}>
          • {data.statusLabel}
        </span>

        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
          <button type="button" className="btn-primary-custom" style={{ padding: "12px 28px" }} onClick={() => navigate(`/candidate/applications/${applicationId}`)}>
            Track Application
          </button>
          <button type="button" className="btn-outline-custom" style={{ padding: "12px 28px" }} onClick={() => navigate("/candidate/jobs")}>
            Back to Jobs
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)", justifyContent: "center" }}>
          <i className="bi bi-info-circle" aria-hidden="true" />
          {data.eta}
        </div>
      </div>
    </div>
  );
}
