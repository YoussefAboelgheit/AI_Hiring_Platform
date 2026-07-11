import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCandidateFeedbackReport } from "../../services/feedbackService";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import BackButton from "../../components/common/BackButton";

export default function AIFeedbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!applicationId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getCandidateFeedbackReport(applicationId);
        if (!cancelled) setReport(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [applicationId]);

  if (loading) return <LoadingState message="Loading feedback report..." />;

  if (!report) {
    return (
      <EmptyState
        icon="bi-chat-square-text"
        title="Feedback not available"
        description="No AI feedback report is available for this application yet."
        action={
          <button className="btn-primary-custom" onClick={() => navigate("/candidate/applications")}>
            Back to Applications
          </button>
        }
      />
    );
  }

  const { strengths, weaknesses, summary, howToImprove, basedOnAssessment, generatedAt } = report;

  const generatedAtLabel = generatedAt
    ? new Date(generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <>
      <BackButton forceTo="/candidate/applications" label="Back to Applications" />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, fontSize: 13, flexWrap: "wrap" }}>
        <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => navigate("/candidate/applications")}>
          Applications
        </span>
        <i className="bi bi-chevron-right text-muted"></i>
        <span className="ai-badge"><i className="bi bi-stars"></i>AI Report</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Your AI Feedback Report</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Personalized analysis of your application.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: basedOnAssessment ? "var(--primary-bg)" : "#F3F5FB",
              color: basedOnAssessment ? "var(--primary)" : "var(--text-muted)",
              padding: "6px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 600,
            }}
          >
            <i className={`bi ${basedOnAssessment ? "bi-clipboard-check" : "bi-file-earmark-person"}`}></i>
            {basedOnAssessment ? "Based on CV & Assessment" : "Based on CV only"}
          </span>
          {generatedAtLabel && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Generated {generatedAtLabel}</span>
          )}
        </div>
      </div>

      {summary && (
        <div className="hcard" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span className="ai-badge"><i className="bi bi-stars"></i>Summary</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.7, margin: 0 }}>{summary}</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="hcard" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <i className="bi bi-check-circle-fill" style={{ color: "var(--success)" }}></i>
            <span style={{ fontWeight: 700 }}>Strengths</span>
          </div>
          {strengths?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {strengths.map((s, i) => (
                <div key={i} style={{ borderLeft: "3px solid var(--success)", paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}>
                  <div style={{ fontSize: 13, color: "var(--text-dark)", lineHeight: 1.6 }}>{s}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No strengths listed.</p>
          )}
        </div>

        <div className="hcard" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ color: "var(--warning)" }}></i>
            <span style={{ fontWeight: 700 }}>Weaknesses</span>
          </div>
          {weaknesses?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {weaknesses.map((w, i) => (
                <div key={i} style={{ borderLeft: "3px solid var(--warning)", paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}>
                  <div style={{ fontSize: 13, color: "var(--text-dark)", lineHeight: 1.6 }}>{w}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No weaknesses listed.</p>
          )}
        </div>
      </div>

      {howToImprove && (
        <div className="hcard" style={{ padding: 24, border: "2px solid var(--primary)", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span className="ai-badge"><i className="bi bi-lightbulb"></i>How to Improve</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.7, margin: 0 }}>{howToImprove}</p>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button className="btn-primary-custom" style={{ fontSize: 15, padding: "12px 32px" }} onClick={() => navigate("/candidate/jobs")}>
          <i className="bi bi-rocket me-2"></i>Browse More Jobs
        </button>
      </div>
    </>
  );
}