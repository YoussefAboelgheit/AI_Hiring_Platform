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

  // Confirmation modal shown when the candidate tries to leave without doing a required assessment
  const [pendingNav, setPendingNav] = useState(null); // holds a () => void to run if they confirm

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

  // Whether this job actually has an assessment attached — comes straight from the
  // backend now (no separate /assessment lookup needed).
  const hasAssessment = Boolean(data?.hasAssessment);

  // Any navigation away from this page goes through here while the assessment is still pending
  const guardedNavigate = (navFn) => {
    if (hasAssessment) {
      setPendingNav(() => navFn);
    } else {
      navFn();
    }
  };

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
          <button
            type="button"
            className="back-button rounded-pill px-3 py-2 shadow-sm"
            onClick={() => guardedNavigate(() => navigate("/candidate/jobs"))}
          >
            <i className="bi bi-arrow-left back-button__icon" aria-hidden="true" />
            <span>Back to Jobs</span>
          </button>
        </div>
        <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto 32px" }}>
          <div style={{ width: 160, height: 160, borderRadius: "50%", background: "linear-gradient(135deg, #f3f5fb, #DBEAFE)", margin: "20px auto 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="bi bi-person-workspace" style={{ fontSize: 64, color: "var(--primary)" }} aria-hidden="true" />
          </div>
          <span style={{ position: "absolute", top: 30, right: 20, width: 32, height: 32, background: "var(--success)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <i className="bi bi-check-lg" aria-hidden="true" />
          </span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, maxWidth: 480 }}>Application Submitted Successfully!</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.7, maxWidth: 520, marginBottom: 20 }}>{data.message}</p>

        <span style={{ background: "var(--primary-bg)", color: "var(--primary)", padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 32, display: "inline-block" }}>
          • {data.statusLabel}
        </span>

        {data.jobId && hasAssessment && (
          <button
            type="button"
            className="btn-primary-custom"
            style={{ padding: "12px 28px", marginBottom: 16, width: "100%", maxWidth: 320 }}
            onClick={() => navigate(`/candidate/jobs/${data.jobId}/assessment`)}
          >
            <i className="bi bi-clipboard-check me-2" aria-hidden="true" />
            Start Assessment
          </button>
        )}

        {hasAssessment && (
          <p style={{ color: "#92400E", fontSize: 12.5, marginBottom: 16, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <i className="bi bi-info-circle-fill" aria-hidden="true" />
            This job requires an assessment — the company won't see your application until it's completed. You can complete it within 3 days.
          </p>
        )}

        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            className="btn-outline-custom"
            style={{ padding: "12px 28px" }}
            onClick={() => guardedNavigate(() => navigate(`/candidate/applications/${applicationId}`))}
          >
            Track Application
          </button>
          <button
            type="button"
            className="btn-outline-custom"
            style={{ padding: "12px 28px" }}
            onClick={() => guardedNavigate(() => navigate("/candidate/jobs"))}
          >
            Back to Jobs
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)", justifyContent: "center" }}>
          <i className="bi bi-info-circle" aria-hidden="true" />
          {data.eta}
        </div>
      </div>

      {/* ===== Leave-without-assessment confirmation modal ===== */}
      {pendingNav && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 440 }}>
            <div className="modal-content" style={{ borderRadius: 16, border: "none" }}>
              <div className="modal-body" style={{ padding: 28, textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <i className="bi bi-exclamation-triangle" style={{ color: "#D97706", fontSize: 20 }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Leave without completing the assessment?</div>
                <p style={{ color: "var(--text-muted)", fontSize: 13.5, margin: 0 }}>
                  This job requires an assessment. You can complete it within 3 days, otherwise the company won't be able to see your application.
                </p>
              </div>
              <div className="modal-footer" style={{ border: "none", padding: "0 24px 24px", justifyContent: "center" }}>
                <button type="button" className="btn btn-light" onClick={() => setPendingNav(null)}>
                  Stay &amp; Take Assessment
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => {
                    const fn = pendingNav;
                    setPendingNav(null);
                    fn();
                  }}
                >
                  Leave Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}