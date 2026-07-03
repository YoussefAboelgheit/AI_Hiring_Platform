import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCandidateFeedbackReport } from "../../services/feedbackService";
import CircleProgress from "../../components/common/CircleProgress";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import BackButton from "../../components/common/BackButton";

export default function AIFeedbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("applicationId") || "a4";

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
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

  const {
    jobTitle, matchScore, strengths, weaknesses, recommendations,
    aiRecommendation, sentiment, missingSkills, evaluationSummary,
  } = report;

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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Your AI Feedback Report</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Personalized analysis based on your recent <strong>{jobTitle}</strong> application.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-outline-custom" style={{ fontSize: 13 }}>
            <i className="bi bi-download me-2"></i>Export PDF
          </button>
          <button className="btn-primary-custom" style={{ fontSize: 13 }}>
            <i className="bi bi-share me-2"></i>Share Report
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, marginBottom: 20 }}>
        <div className="hcard" style={{ padding: 24 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <CircleProgress value={matchScore} size={90} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Overall Evaluation</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>AI-Generated Suitability Assessment</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#D1FAE5", padding: "8px 14px", borderRadius: 8, marginBottom: 14 }}>
                <i className="bi bi-patch-check-fill" style={{ color: "var(--success)" }}></i>
                <span style={{ fontWeight: 700, color: "var(--success)", fontSize: 13 }}>Highly Recommended</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
                {evaluationSummary}
              </p>
            </div>
          </div>
        </div>

        {sentiment && (
          <div className="hcard" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 14 }}>
              Sentiment Analysis
            </div>
            {sentiment.map(([label, val]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontWeight: 700, color: "var(--primary)" }}>{val}%</span>
                </div>
                <div className="match-bar">
                  <div className="match-bar-fill" style={{ width: `${val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="hcard" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <i className="bi bi-check-circle-fill" style={{ color: "var(--success)" }}></i>
            <span style={{ fontWeight: 700 }}>Core Strengths</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {strengths.map((s, i) => (
              <div key={i} style={{ borderLeft: "3px solid var(--success)", paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--success)", marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hcard" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ color: "var(--warning)" }}></i>
            <span style={{ fontWeight: 700 }}>Weaknesses</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {weaknesses.map((w, i) => (
              <div key={i} style={{ borderLeft: "3px solid var(--warning)", paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--warning)", marginBottom: 3 }}>{w.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {missingSkills && (
        <div className="hcard" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <i className="bi bi-x-circle-fill" style={{ color: "var(--danger)" }}></i>
            <span style={{ fontWeight: 700 }}>Missing Skills</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
            The following critical skills were not detected during your assessment or in your CV:
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {missingSkills.map((s) => (
              <span key={s} style={{ background: "#FEE2E2", color: "var(--danger)", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="hcard" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span className="ai-badge"><i className="bi bi-stars"></i>AI Suggestions</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recommendations.map((r, i) => (
            <div key={i} style={{ background: "var(--primary-bg)", borderRadius: 10, padding: "14px 16px", display: "flex", gap: 12 }}>
              <i className="bi bi-arrow-right-circle-fill" style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }}></i>
              <p style={{ fontSize: 13, color: "var(--text-dark)", margin: 0, lineHeight: 1.6 }}>{r}</p>
            </div>
          ))}
        </div>
      </div>

      {aiRecommendation && (
        <div className="hcard" style={{ padding: 24, border: "2px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span className="ai-badge"><i className="bi bi-stars"></i>AI Recommendation</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.7 }}>{aiRecommendation.text}</p>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>Confidence Score</span>
              <span style={{
                fontWeight: 700,
                color: aiRecommendation.confidence >= 70 ? "var(--success)" : aiRecommendation.confidence >= 40 ? "var(--warning)" : "var(--danger)",
              }}>
                {aiRecommendation.confidence}%
              </span>
            </div>
            <div style={{ height: 10, background: "var(--border)", borderRadius: 10 }}>
              <div style={{
                height: 10, borderRadius: 10, width: `${aiRecommendation.confidence}%`,
                background: aiRecommendation.confidence >= 70 ? "var(--success)" : aiRecommendation.confidence >= 40 ? "var(--warning)" : "var(--danger)",
                transition: "width 0.5s",
              }}></div>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button className="btn-primary-custom" style={{ fontSize: 15, padding: "12px 32px" }} onClick={() => navigate("/candidate/jobs")}>
          <i className="bi bi-rocket me-2"></i>Apply to Matched High-Growth Startups
        </button>
      </div>
    </>
  );
}