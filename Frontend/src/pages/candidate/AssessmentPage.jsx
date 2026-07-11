import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as assessmentService from "../../services/assessmentService";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";

function formatTimer(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const [session, setSession] = useState(null); // candidateAssessment
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { score, total, percentage } after submit

  const [submitError, setSubmitError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const [answers, setAnswers] = useState({}); // { [questionId]: selectedAnswer }
  const [currentIndex, setCurrentIndex] = useState(0);

  // Tracks the in-flight /assessment/answers call so submit (and reload/expiry)
  // can wait for the last-picked answer to finish saving.
  const pendingSaveRef = useRef(Promise.resolve());

  // Timer — comes back from /assessment/start as { startedAt, expiresAt, durationMinutes }.
  // Using the server's expiresAt (not a local countdown started from durationMinutes) means
  // the remaining time stays correct even if the candidate refreshes or resumes the session.
  const [timer, setTimer] = useState(null);
  const [timeLeftMs, setTimeLeftMs] = useState(null);
  const autoSubmittedRef = useRef(false);

  // React.StrictMode (dev only) intentionally mounts effects twice to catch
  // impure effects. Without this guard, that fires POST /assessment/start
  // twice almost simultaneously, which can race the "create session" logic on
  // the very first visit to a job's assessment and surface a false
  // "Something went wrong" — even though one of the two calls actually
  // succeeded and created the session (which is why reloading afterwards
  // always works: the second call just resumes the already-created session).
  const startedForJobRef = useRef(null);
  // Holds the jobId of the currently in-flight/most-recent load() call, used
  // to detect (at resolve time) whether that call is still the relevant one.
  const activeJobIdRef = useRef(null);

  useEffect(() => {
    // Guard against stale updates using the jobId this specific call was made
    // for (checked against the *current* jobId at resolve time), instead of a
    // boolean flag captured in the effect's closure. A closure-captured
    // "cancelled" flag gets flipped to true by StrictMode's dev-only
    // mount → cleanup → mount cycle before the request even resolves, which
    // silently dropped the successful response and left the page stuck on
    // "Loading..." forever (only a manual page refresh — a fresh component
    // instance — would work, since it landed on the already-created session).
    async function load(forJobId) {
      setLoading(true);
      setLoadError(null);
      try {
        const { data } = await assessmentService.startAssessment(forJobId);
        if (activeJobIdRef.current !== forJobId) return; // jobId changed since this call started

        const loadedQuestions = data.questions || [];
        const savedAnswers = data.savedAnswers || {};

        setSession(data.candidateAssessment);
        setQuestions(loadedQuestions);
        setAnswers(savedAnswers);
        setTimer(data.timer || null);

        // Resume where the candidate left off: jump to the first question that
        // doesn't have a saved answer yet, instead of always restarting at Q1.
        const firstUnanswered = loadedQuestions.findIndex(
          (q) => !savedAnswers[q._id]
        );
        setCurrentIndex(firstUnanswered === -1 ? Math.max(0, loadedQuestions.length - 1) : firstUnanswered);
      } catch (err) {
        if (activeJobIdRef.current !== forJobId) return;
        // This call didn't actually reach the server — let the effect run
        // again (e.g. the jobId changing back).
        startedForJobRef.current = null;
        const status = err?.response?.status;
        if (status === 400) setLoadError("already_completed");
        else if (status === 403) setLoadError("not_open");
        else if (status === 404) setLoadError("not_found");
        else setLoadError("error");
      } finally {
        if (activeJobIdRef.current === forJobId) setLoading(false);
      }
    }

    if (jobId && startedForJobRef.current !== jobId) {
      startedForJobRef.current = jobId;
      activeJobIdRef.current = jobId;
      load(jobId);
    }
  }, [jobId]);

  const submitAnswers = async (isAutoSubmit = false) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Make sure the last answer the candidate picked has actually finished
      // saving server-side before we ask the server to grade the assessment.
      try {
        await pendingSaveRef.current;
      } catch {
        // Already surfaced via setSaveError below; still attempt to submit
        // with whatever was successfully saved so far.
      }
      const { data } = await assessmentService.submitCandidateAssessment(jobId);
      setResult(data.result || { timedOut: isAutoSubmit });
    } catch (err) {
      if (isAutoSubmit) {
        // Time's up — don't let the candidate keep answering, even if submission failed.
        setResult({ timedOut: true, submitFailed: true });
      } else {
        setSubmitError(err?.response?.data?.message || "We couldn't submit your assessment. Please check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Countdown tick + auto-submit when time runs out.
  useEffect(() => {
    if (!timer?.expiresAt) {
      setTimeLeftMs(null);
      return undefined;
    }
    const deadline = new Date(timer.expiresAt).getTime();

    const tick = () => {
      const remaining = deadline - Date.now();
      setTimeLeftMs(Math.max(0, remaining));
      if (remaining <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        submitAnswers(true);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer?.expiresAt]);

  const handleSelect = (questionId, optionText) => {
    // Update the UI immediately so the selection feels instant.
    setAnswers((prev) => ({ ...prev, [questionId]: optionText }));
    setSaveError(null);

    // Persist this answer to the backend right away — NOT after a debounce delay.
    // A delayed/debounced save can be lost if the candidate reloads or navigates
    // away before the timer fires, which is exactly what was causing answers to
    // silently disappear after a quick reload.
    const savePromise = assessmentService
      .saveAnswer(jobId, questionId, optionText)
      .catch((err) => {
        setSaveError("We couldn't save your last answer. Please check your connection.");
        throw err;
      });
    pendingSaveRef.current = savePromise;
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleSubmit = () => submitAnswers(false);

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
          icon={result.timedOut ? "bi-alarm" : "bi-check-circle"}
          title={result.timedOut ? "Time's up!" : "Assessment submitted successfully!"}
          description={
            result.timedOut
              ? "Your time ran out, so we submitted your answers automatically. You can track the status of your application from My Applications."
              : "Your answers have been recorded. You can track the status of your application from My Applications."
          }
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
        {timeLeftMs !== null && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: timeLeftMs <= 60000 ? "#FEE2E2" : "#FEF3C7",
              color: timeLeftMs <= 60000 ? "#991B1B" : "#92400E",
              padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700,
              marginInlineStart: "auto",
            }}
          >
            <i className="bi bi-stopwatch-fill" />
            {formatTimer(timeLeftMs)}
          </div>
        )}
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
        {submitError && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: 12.5, color: "#991B1B", marginBottom: 8, fontWeight: 600,
          }}>
            <i className="bi bi-exclamation-circle-fill"></i>
            {submitError}
          </div>
        )}
        {saveError && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: 12.5, color: "#991B1B", marginBottom: 8, fontWeight: 600,
          }}>
            <i className="bi bi-exclamation-circle-fill"></i>
            {saveError}
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