import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCandidateAIAnalysis } from "../../services/feedbackService";
import CircleProgress from "../../components/common/CircleProgress";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";
import { getErrorMessage } from "../../utils/errorMessages";

export default function RecruiterFeedbackPage() {
  const { jobId, applicationId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId || !applicationId) {
      setError("This report needs to be opened from a candidate's row in the Applicants List.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    getCandidateAIAnalysis(jobId, applicationId)
      .then((res) => setData(res))
      .catch((err) => {
        setError(getErrorMessage(err, "Couldn't load the AI report for this candidate."));
      })
      .finally(() => setLoading(false));
  }, [jobId, applicationId]);

  if (loading) return <LoadingState message="Loading AI report..." />;

  if (error || !data) {
    return (
      <>
        <BackButton fallbackTo="/recruiter/applications" label="Back to Applicants" />
        <div className="hcard" style={{ padding: 40, textAlign: "center", marginTop: 20 }}>
          <i className="bi bi-robot" style={{ fontSize: 40, color: "var(--text-muted)" }} aria-hidden="true" />
          <h2 style={{ marginTop: 16, fontSize: 18, fontWeight: 700 }}>AI report not available</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: 420, margin: "8px auto 20px" }}>
            {error || "This candidate's AI analysis hasn't been generated yet."}
          </p>
          <button type="button" className="btn-primary-custom" onClick={() => navigate("/recruiter/applications")}>
            Go to Applicants List
          </button>
        </div>
      </>
    );
  }

  const { job, application } = data;
  const candidateName = application?.candidate?.name || "Candidate";
  const jobTitle = job?.title || "";
  const matchScore = typeof application?.matchScore === "number" ? Math.round(application.matchScore) : null;
  const assessmentScore = typeof application?.assessmentScore === "number" ? Math.round(application.assessmentScore) : null;
  const evaluation = application?.aiEvaluation || {};
  const strengths = evaluation.strengths || [];
  const weaknesses = evaluation.weaknesses || [];
  const summary = evaluation.summary || "";
  const recommendation = evaluation.recommendation || "";
  const generatedAt = evaluation.generatedAt;

  return (
    <>
      <BackButton fallbackTo="/recruiter/applications" label="Back to Applicants" />

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, fontSize: 13, flexWrap: "wrap" }}>
        <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => navigate("/recruiter/applications")}>
          Applications
        </span>
        <i className="bi bi-chevron-right text-muted" aria-hidden="true"></i>
        <span style={{ color: "var(--text-muted)" }}>{candidateName}</span>
        <i className="bi bi-chevron-right text-muted" aria-hidden="true"></i>
        <span style={{ color: "var(--text-muted)" }}>AI Report</span>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>AI Report: {candidateName}</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="ai-badge"><i className="bi bi-stars" aria-hidden="true"></i>AI-Generated Analysis</span>
          {jobTitle && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{jobTitle}</span>}
          {generatedAt && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Generated {new Date(generatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: matchScore !== null ? "1fr 260px" : "1fr", gap: 20, marginBottom: 20 }}>
        <div className="hcard" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <i className="bi bi-file-earmark-text" style={{ color: "var(--primary)" }} aria-hidden="true"></i>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Summary</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8, margin: 0 }}>
            {summary || "No summary was generated for this candidate yet."}
          </p>
        </div>

        {matchScore !== null && (
          <div className="hcard" style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 16 }}>
              Match Score
            </div>
            <CircleProgress value={matchScore} size={110} />
            {assessmentScore !== null && (
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
                Assessment score: {assessmentScore}/100
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {[
          { title: "Strengths", icon: "bi-check-circle-fill", color: "var(--success, #059669)", items: strengths },
          { title: "Weaknesses", icon: "bi-exclamation-triangle-fill", color: "var(--warning, #D97706)", items: weaknesses },
        ].map(({ title, icon, color, items }) => (
          <div key={title} className="hcard" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <i className={`bi ${icon}`} style={{ color }} aria-hidden="true"></i>
              <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 12, letterSpacing: 1 }}>{title}</span>
            </div>
            {items.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Nothing noted here.</p>
            ) : (
              items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: i === items.length - 1 ? 0 : 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 6 }}></div>
                  <div style={{ fontSize: 14, lineHeight: 1.5 }}>{item}</div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {recommendation && (
        <div className="hcard" style={{ padding: 24, marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span className="ai-badge"><i className="bi bi-stars" aria-hidden="true"></i>Recommendation</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.8, margin: 0 }}>{recommendation}</p>
        </div>
      )}
    </>
  );
}