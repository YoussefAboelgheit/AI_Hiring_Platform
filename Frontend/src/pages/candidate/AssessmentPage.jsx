import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as assessmentService from "../../services/assessmentService";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import BackButton from "../../components/common/BackButton";

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const [session, setSession] = useState(null); // candidateAssessment
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { score, total, percentage } after submit

  const [answers, setAnswers] = useState({}); // { [questionId]: selectedAnswer }
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const { data } = await assessmentService.startAssessment(jobId);
        if (cancelled) return;
        setSession(data.candidateAssessment);
        setQuestions(data.questions || []);
      } catch (err) {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status === 400) setLoadError("already_completed");
        else if (status === 403) setLoadError("not_open");
        else if (status === 404) setLoadError("not_found");
        else setLoadError("error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (jobId) load();
    return () => { cancelled = true; };
  }, [jobId]);

  const handleSelect = (questionId, optionText) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionText }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      }));
      const { data } = await assessmentService.submitCandidateAssessment(jobId, payload);
      setResult(data.result);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit assessment. Please try again.");
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

  if (result) {
    return (
      <div style={{ background: "var(--body-bg)", minHeight: "100vh" }}>
        <EmptyState
          icon="bi-check-circle"
          title="Assessment submitted successfully!"
          description="Your answers have been recorded. You can track the status of your application from My Applications."
          action={
            <button className="btn-primary-custom" onClick={() => navigate("/candidate/applications")}>
              Back to My Applications
            </button>
          }
        />
      </div>
    );
  }

  if (loadError) {
    const messages = {
      already_completed: ["Already completed", "You've already submitted this assessment."],
      not_open: ["Job not open yet", "This assessment isn't open for submissions right now."],
      not_found: ["Assessment not available", "This assessment hasn't been unlocked yet, or there are no questions in it."],
      error: ["Something went wrong", "We couldn't load this assessment. Please try again."],
    };
    const [title, description] = messages[loadError];
    return (
      <div style={{ background: "var(--body-bg)", minHeight: "100vh" }}>
        <EmptyState
          icon="bi-clipboard-check"
          title={title}
          description={description}
          action={
            <button className="btn-primary-custom" onClick={() => navigate("/candidate/dashboard")}>
              Back to Dashboard
            </button>
          }
        />
      </div>
    );
  }

  if (questions.length === 0) return null;

  const question = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div style={{ background: "var(--body-bg)", minHeight: "100vh" }}>
      <div className="assessment-topbar">
        <BackButton fallbackTo="/candidate/dashboard" label="Exit" flush className="me-3" />
        <span className="d-none d-sm-inline" style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>
          Question <strong style={{ color: "var(--text-dark)" }}>{currentIndex + 1}</strong> of {totalQuestions}
        </span>
        <div className="d-none d-md-block" style={{ width: 1, height: 20, background: "var(--border)" }} />
        <div className="flex-grow-1 d-none d-lg-flex align-items-center gap-2 mx-auto" style={{ maxWidth: 400 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{progress}% Complete</span>
          <div className="match-bar" style={{ flex: 1 }}>
            <div className="match-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "48px auto", padding: "0 16px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, lineHeight: 1.5 }}>{question.question}</h2>
        {question.topic && (
          <p style={{ color: "var(--text-muted)", marginBottom: 32, fontSize: 14 }}>Topic: {question.topic}</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {question.options.map((opt) => (
            <div
              key={opt}
              onClick={() => handleSelect(question._id, opt)}
              style={{
                border: `2px solid ${answers[question._id] === opt ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 12, padding: "18px 20px", cursor: "pointer",
                background: answers[question._id] === opt ? "var(--primary-bg)" : "#fff",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  border: `2px solid ${answers[question._id] === opt ? "var(--primary)" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                  background: answers[question._id] === opt ? "var(--primary)" : "#fff",
                }}>
                  {answers[question._id] === opt && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }}></div>}
                </div>
                <div style={{ fontWeight: 600 }}>{opt}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff",
        borderTop: "1px solid var(--border)", padding: "10px 40px 14px",
      }}>
        {!answers[question._id] && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: 12.5, color: "#92400E", marginBottom: 8,
          }}>
            <i className="bi bi-info-circle-fill"></i>
            Please select an answer to {isLastQuestion ? "submit the assessment" : "continue to the next question"}.
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="btn-outline-custom" style={{ padding: "9px 24px" }} onClick={handlePrevious} disabled={currentIndex === 0}>
            ← Previous
          </button>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{answeredCount} / {totalQuestions} answered</span>
          {isLastQuestion ? (
            <button
              className="btn-primary-custom"
              style={{ padding: "9px 28px" }}
              onClick={handleSubmit}
              disabled={!answers[question._id] || submitting || answeredCount < totalQuestions}
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </button>
          ) : (
            <button
              className="btn-primary-custom"
              style={{ padding: "9px 28px" }}
              onClick={handleNext}
              disabled={!answers[question._id]}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}