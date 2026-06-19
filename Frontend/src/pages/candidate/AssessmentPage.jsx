import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAssessmentById, submitAssessment } from "../../services/assessmentService";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import BackButton from "../../components/common/BackButton";

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get("id") || "as1";

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await getAssessmentById(assessmentId);
        if (!cancelled) setAssessment(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [assessmentId]);

  const handleSubmit = async () => {
    if (!assessment) return;
    setSubmitting(true);
    try {
      const result = await submitAssessment(assessment.id, { selectedOption: selected });
      navigate(`/candidate/applications/${result.applicationId}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "var(--body-bg)", minHeight: "100vh" }}>
        <LoadingState message="Loading assessment..." />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div style={{ background: "var(--body-bg)", minHeight: "100vh" }}>
        <EmptyState
          icon="bi-clipboard-check"
          title="Assessment not found"
          description="This assessment may have expired or is no longer available."
          action={
            <button className="btn-primary-custom" onClick={() => navigate("/candidate/dashboard")}>
              Back to Dashboard
            </button>
          }
        />
      </div>
    );
  }

  const { question, totalQuestions, currentQuestion, timeLeft, progress } = assessment;

  return (
    <div style={{ background: "var(--body-bg)", minHeight: "100vh" }}>
      <div className="assessment-topbar">
        <BackButton fallbackTo="/candidate/dashboard" label="Exit" flush className="me-3" />
        <span className="d-none d-sm-inline" style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>
          Question <strong style={{ color: "var(--text-dark)" }}>{currentQuestion}</strong> of {totalQuestions}
        </span>
        <div className="d-none d-md-block" style={{ width: 1, height: 20, background: "var(--border)" }} />
        <span className="d-none d-md-flex" style={{ alignItems: "center", gap: 6, color: "var(--primary)", fontWeight: 700, fontSize: 14 }}>
          <i className="bi bi-clock"></i> {timeLeft} remaining
        </span>
        <div className="flex-grow-1 d-none d-lg-flex align-items-center gap-2 mx-auto" style={{ maxWidth: 400 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{progress}% Complete</span>
          <div className="match-bar" style={{ flex: 1 }}>
            <div className="match-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "48px auto", padding: "0 16px" }}>
        <div className="ai-badge" style={{ marginBottom: 20 }}>
          <i className="bi bi-stars"></i> AI-Adaptive Assessment
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, lineHeight: 1.5 }}>{question.text}</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 32, fontSize: 14 }}>
          Select the most accurate description based on standard reliability engineering principles.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {question.options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              style={{
                border: `2px solid ${selected === opt.id ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 12, padding: "18px 20px", cursor: "pointer",
                background: selected === opt.id ? "var(--primary-bg)" : "#fff",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  border: `2px solid ${selected === opt.id ? "var(--primary)" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                  background: selected === opt.id ? "var(--primary)" : "#fff",
                }}>
                  {selected === opt.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }}></div>}
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{opt.text}</div>
                  {opt.desc && <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{opt.desc}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", alignItems: "center", color: "var(--text-muted)", fontSize: 12, marginBottom: 32 }}>
          <i className="bi bi-check-circle me-2"></i> Changes are saved automatically
        </div>
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff",
        borderTop: "1px solid var(--border)", padding: "14px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <button className="btn-outline-custom" style={{ padding: "9px 24px" }} disabled>
          ← Previous
        </button>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Changes are saved automatically</span>
        <button
          className="btn-primary-custom"
          style={{ padding: "9px 28px" }}
          onClick={handleSubmit}
          disabled={!selected || submitting}
        >
          {submitting ? "Submitting..." : "Next →"}
        </button>
      </div>
    </div>
  );
}
