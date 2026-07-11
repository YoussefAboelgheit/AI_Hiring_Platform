import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  useAssessment,
  useGenerateAssessment,
  useUpdateAssessmentSettings,
  useRegenerateAssessment,
  useAddManualQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useRegenerateQuestion,
} from "../../hooks/useAssessment";
import { getJobById } from "../../services/jobService";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

// Candidates need a realistic minimum to actually read and answer questions —
// the backend rejects anything shorter, so we catch it here first with a clear message
// instead of letting the raw API error surface to the recruiter.
const MIN_ASSESSMENT_DURATION_MINUTES = 5;

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Turns a 403 "no longer editable" response into a clear message; otherwise falls back.
function getEditWindowMessage(err, fallback) {
  if (err?.response?.status === 403) {
    return "The 5-minute editing window has expired — this assessment is now locked and can no longer be modified.";
  }
  return fallback;
}

function EditWindowBanner({ job, timeLeftMs, isLocked }) {
  if (!job) return null;

  if (isLocked) {
    return (
      <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <i className="bi bi-lock-fill" />
        The editing window has expired — this assessment is now locked and can no longer be modified.
      </div>
    );
  }

  if (timeLeftMs === null) return null;

  return (
    <div style={{ background: "#FEF3C7", color: "#92400E", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
      <i className="bi bi-clock-history" />
      {formatCountdown(timeLeftMs)} left to edit or add questions before this assessment locks automatically.
    </div>
  );
}

function DurationBadge({ assessment, isLocked, editing, draft, setDraft, onEditStart, onSave, onCancel, saving, error }) {
  if (editing) {
    return (
      <div style={{ marginTop: 8 }}>
        <form onSubmit={onSave} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <input
            type="number" min={MIN_ASSESSMENT_DURATION_MINUTES} max="240" required autoFocus
            value={draft} onChange={(e) => setDraft(e.target.value)}
            className="form-control form-control-sm" style={{ width: 90, borderRadius: 8 }}
          />
          <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>minutes</span>
          <button type="submit" className="btn btn-sm btn-primary" disabled={saving} style={{ borderRadius: 8 }}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" className="btn btn-sm btn-light" onClick={onCancel} style={{ borderRadius: 8 }}>Cancel</button>
        </form>
        <FieldError message={error} />
      </div>
    );
  }

  return (
    <div
      style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12.5, color: "var(--text-muted)", cursor: isLocked ? "default" : "pointer" }}
      onClick={() => !isLocked && onEditStart()}
      title={isLocked ? undefined : "Click to change the duration"}
    >
      <i className="bi bi-stopwatch" />
      {assessment?.durationMinutes ? `${assessment.durationMinutes} minute time limit` : "No time limit set"}
      {!isLocked && <i className="bi bi-pencil" style={{ fontSize: 11 }} />}
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#DC2626", fontSize: 12.5, fontWeight: 600, marginTop: 8 }}>
      <i className="bi bi-exclamation-circle-fill" />
      {message}
    </div>
  );
}

const tagColors = {
  Easy: { bg: "#D1FAE5", color: "#065F46" },
  Medium: { bg: "#FEF3C7", color: "#92400E" },
  Hard: { bg: "#FEE2E2", color: "#991B1B" },
  default: { bg: "#f3f5fb", color: "#1d2445" },
};

function ChangeTypeButton({ onClick, style, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "var(--primary-bg)", color: "var(--primary)",
        border: "none", borderRadius: 20, padding: "6px 14px",
        fontSize: 12.5, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background .15s",
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = "#E4D9FC"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--primary-bg)"; }}
    >
      <i className="bi bi-arrow-left-right" style={{ fontSize: 11 }} />
      Change Assessment Type
    </button>
  );
}

export default function AssessmentGeneratorPage() {
  const { jobId } = useParams();
  const { data, isLoading, error } = useAssessment(jobId);
  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJobById(jobId),
    enabled: !!jobId,
  });

  const generateMut = useGenerateAssessment();
  const updateSettingsMut = useUpdateAssessmentSettings();
  const regenerateAssMut = useRegenerateAssessment();
  const addQuestionMut = useAddManualQuestion();
  const updateQuestionMut = useUpdateQuestion();
  const deleteQuestionMut = useDeleteQuestion();
  const regenerateQuestionMut = useRegenerateQuestion();

  // The user's in-flight choice on the "pick a type" screen, before the backend confirms it.
  // Lets us show the AI config form (or a brief loading state for Manual/None) without
  // waiting for a refetch, and lets the user pick a *different* type than whatever the
  // backend currently has (e.g. switching from AI back to the choice screen).
  const [pendingChoice, setPendingChoice] = useState(null); // 'AI' | 'MANUAL_SETUP' | 'MANUAL' | null

  // True while the recruiter is deliberately re-picking the assessment type via
  // "Change Assessment Type", even though an assessment already exists on the backend
  // (e.g. they cleared out all their Manual questions and now want to switch to AI).
  // Without this, `mode` below would just fall back to whatever `assessment.type` already is.
  const [overridingType, setOverridingType] = useState(false);

  const [generateConfig, setGenerateConfig] = useState({
    questionCount: 10,
    difficulty: "Medium",
    topics: "",
    durationMinutes: 30,
  });

  // Duration asked for on the Manual setup screen (before the assessment record is created)
  const [manualDuration, setManualDuration] = useState(30);

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Custom delete-confirmation modal — replaces window.confirm(), which renders as an
  // ugly native "localhost says" browser dialog instead of matching the app's UI.
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(false);

  // Inline "edit duration" control for an already-created assessment (AI or Manual)
  const [editingDuration, setEditingDuration] = useState(false);
  const [durationDraft, setDurationDraft] = useState(30);

  // Inline validation/error messages shown under each of the three duration-related
  // forms, instead of letting a raw backend error surface as a native browser alert.
  const [generateError, setGenerateError] = useState(null);
  const [manualSetupError, setManualSetupError] = useState(null);
  const [durationEditError, setDurationEditError] = useState(null);

  // Same idea for the remaining actions on this page — no more native alert() popups.
  const [chooseError, setChooseError] = useState(null);
  const [listActionError, setListActionError] = useState(null); // regenerate-all / regenerate-one / delete
  const [questionModalError, setQuestionModalError] = useState(null);

  // Countdown timer — job is only editable within 5 minutes of creation
  const [timeLeftMs, setTimeLeftMs] = useState(null);

  useEffect(() => {
    if (!job?.editableUntil) {
      setTimeLeftMs(null);
      return undefined;
    }
    const deadline = new Date(job.editableUntil).getTime();
    const tick = () => setTimeLeftMs(Math.max(0, deadline - Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [job?.editableUntil]);

  const isLocked = job ? job.status !== "Drafted" || (timeLeftMs !== null && timeLeftMs <= 0) : false;

  const notFound = error?.response?.status === 404;
  const assessment = data?.assessment;
  const questions = data?.questions || [];

  // ---- Determine which screen to show ----
  // 'choose'        — the mandatory first screen: No Assessment / AI / Manual
  // 'ai-config'     — AI chosen but no questions generated yet: show the config form
  // 'ai'            — AI assessment with questions: show the question list + AI-only actions
  // 'manual-setup'  — Manual chosen but not (re)created yet: ask for the assessment duration first
  // 'manual'        — Manual assessment: show the question list + Add/Edit/Delete only
  // 'disabled'      — "No Assessment" was chosen: nothing to manage
  const inSetupFlow = notFound || overridingType;
  let mode;
  if (inSetupFlow) {
    mode = pendingChoice === "AI" ? "ai-config" : pendingChoice === "MANUAL_SETUP" ? "manual-setup" : pendingChoice === "MANUAL" ? "manual" : "choose";
  } else if (assessment?.type === "NONE") {
    mode = "disabled";
  } else if (assessment?.type === "AI") {
    mode = questions.length > 0 ? "ai" : "ai-config";
  } else if (assessment?.type === "MANUAL") {
    mode = "manual";
  } else {
    mode = "choose";
  }

  const handleChooseType = async (type) => {
    if (type === "AI") {
      setGenerateError(null);
      setPendingChoice("AI"); // just reveal the config form locally, no API call yet
      return;
    }
    if (type === "MANUAL") {
      // Always ask for the assessment duration first, whether this is the very first
      // assessment for this job or the recruiter is switching over from AI/None.
      setManualSetupError(null);
      setPendingChoice("MANUAL_SETUP");
      return;
    }
    if (type === "NONE") {
      setChooseError(null);
      try {
        await updateSettingsMut.mutateAsync({
          jobId,
          payload: {
            type: "NONE",
            questionCount: 1,
            difficulty: "Medium",
            topics: "",
            durationMinutes: assessment?.durationMinutes || MIN_ASSESSMENT_DURATION_MINUTES,
          },
        });
        setOverridingType(false);
        setPendingChoice(null);
      } catch (err) {
        setChooseError(getEditWindowMessage(err, err.response?.data?.message || "Failed to disable the assessment. Please try again."));
      }
      return;
    }
  };

  const handleChangeType = () => {
    setGenerateError(null);
    setManualSetupError(null);
    setChooseError(null);
    setOverridingType(true);
    setPendingChoice(null);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    const duration = Number(generateConfig.durationMinutes);
    if (!duration || duration < MIN_ASSESSMENT_DURATION_MINUTES) {
      setGenerateError(`Assessment duration can't be less than ${MIN_ASSESSMENT_DURATION_MINUTES} minutes.`);
      return;
    }
    setGenerateError(null);
    try {
      const payload = {
        questionCount: Number(generateConfig.questionCount),
        difficulty: generateConfig.difficulty,
        topics: generateConfig.topics,
        durationMinutes: duration,
      };
      await generateMut.mutateAsync({ jobId, payload });
      setPendingChoice(null);
      setOverridingType(false);
    } catch (err) {
      setGenerateError(getEditWindowMessage(err, err.response?.data?.message || "Failed to generate the assessment. Please try again."));
    }
  };

  // Confirms the duration on the Manual setup screen, then bootstraps/overwrites the
  // MANUAL assessment record so Add/Edit/Delete have something to attach to.
  const handleConfirmManualSetup = async (e) => {
    e.preventDefault();
    const duration = Number(manualDuration);
    if (!duration || duration < MIN_ASSESSMENT_DURATION_MINUTES) {
      setManualSetupError(`Assessment duration can't be less than ${MIN_ASSESSMENT_DURATION_MINUTES} minutes.`);
      return;
    }
    setManualSetupError(null);
    try {
      await updateSettingsMut.mutateAsync({
        jobId,
        payload: {
          type: "MANUAL",
          questionCount: 1,
          difficulty: "Medium",
          topics: "",
          durationMinutes: duration,
        },
      });
      setPendingChoice("MANUAL");
      setOverridingType(false);
    } catch (err) {
      setManualSetupError(getEditWindowMessage(err, err.response?.data?.message || "Failed to start a manual assessment. Please try again."));
    }
  };

  const handleSaveDuration = async (e) => {
    e.preventDefault();
    const duration = Number(durationDraft);
    if (!duration || duration < MIN_ASSESSMENT_DURATION_MINUTES) {
      setDurationEditError(`Assessment duration can't be less than ${MIN_ASSESSMENT_DURATION_MINUTES} minutes.`);
      return;
    }
    setDurationEditError(null);
    try {
      await updateSettingsMut.mutateAsync({
        jobId,
        payload: { durationMinutes: duration },
      });
      setEditingDuration(false);
    } catch (err) {
      setDurationEditError(getEditWindowMessage(err, err.response?.data?.message || "Failed to update duration. Please try again."));
    }
  };

  const handleRegenerateAssessment = async () => {
    setListActionError(null);
    try {
      await regenerateAssMut.mutateAsync({ jobId });
    } catch (err) {
      setListActionError(getEditWindowMessage(err, err.response?.data?.message || "Failed to regenerate the assessment. Please try again."));
    }
  };

  const handleRegenerateQuestion = async (questionId) => {
    setListActionError(null);
    try {
      await regenerateQuestionMut.mutateAsync({ questionId, jobId });
    } catch (err) {
      setListActionError(getEditWindowMessage(err, err.response?.data?.message || "Failed to regenerate this question. Please try again."));
    }
  };

  const openAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionModalError(null);
    setQuestionModalOpen(true);
  };

  const openEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionModalError(null);
    setQuestionModalOpen(true);
  };

  const handleDeleteQuestion = (qId) => {
    setListActionError(null);
    setDeleteConfirmId(qId);
  };

  const handleConfirmDelete = async () => {
    setDeletingQuestion(true);
    try {
      await deleteQuestionMut.mutateAsync({ questionId: deleteConfirmId, jobId });
      setDeleteConfirmId(null);
    } catch (err) {
      setListActionError(getEditWindowMessage(err, err.response?.data?.message || "Failed to delete this question. Please try again."));
      setDeleteConfirmId(null);
    } finally {
      setDeletingQuestion(false);
    }
  };

  const handleQuestionSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const options = [
      formData.get("option1"),
      formData.get("option2"),
      formData.get("option3"),
      formData.get("option4"),
    ].map((opt) => (opt || "").trim());
    const correctAnswer = (formData.get("correctAnswer") || "").trim();
    const question = (formData.get("question") || "").trim();

    // Catch the common mistakes client-side, with a plain-language message,
    // instead of letting an incomplete/mismatched form hit the API and bounce back
    // as a raw "Failed to save" error.
    if (!question || options.some((opt) => !opt)) {
      setQuestionModalError("Please fill in the question and all four options before saving.");
      return;
    }
    if (!correctAnswer || !options.includes(correctAnswer)) {
      setQuestionModalError("The correct answer must exactly match one of the four options above.");
      return;
    }

    const qData = {
      question,
      options,
      correctAnswer,
      explanation: formData.get("explanation"),
      topic: formData.get("topic"),
      difficulty: formData.get("difficulty"),
    };

    setQuestionModalError(null);
    try {
      if (editingQuestion) {
        await updateQuestionMut.mutateAsync({ questionId: editingQuestion._id, question: qData, jobId });
      } else {
        await addQuestionMut.mutateAsync({ jobId, question: qData });
      }
      setQuestionModalOpen(false);
    } catch (err) {
      setQuestionModalError(getEditWindowMessage(err, err.response?.data?.message || "Please make sure every field is filled in correctly, then try again."));
    }
  };

  if (isLoading) return <LoadingState message="Loading assessment..." />;

  return (
    <>
      <BackButton fallbackTo={`/recruiter/job/${jobId}`} label="Back to Job" />
      <EditWindowBanner job={job} timeLeftMs={timeLeftMs} isLocked={isLocked} />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Assessment</h1>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>Configure how candidates for this job will be assessed.</p>
      </div>

      {/* ===== STEP 1 — mandatory type choice ===== */}
      {mode === "choose" && (
        <div style={{ maxWidth: 900 }}>
          <FieldError message={chooseError} />
          <div className="row g-4" style={{ marginTop: chooseError ? 4 : 0 }}>
            {[
              { type: "NONE", icon: "bi-slash-circle", title: "No Assessment", desc: "Don't require candidates to take any assessment for this job." },
              { type: "AI", icon: "bi-stars", title: "AI Assessment", desc: "Let AI generate multiple-choice questions based on your topics and difficulty." },
              { type: "MANUAL", icon: "bi-pencil-square", title: "Manual Assessment", desc: "Write your own questions from scratch, one at a time." },
            ].map((opt) => (
              <div className="col-md-4" key={opt.type}>
                <button
                  type="button"
                  className="hcard w-100 text-start"
                  style={{ padding: 24, border: "2px solid var(--border)", background: "#fff", cursor: "pointer", height: "100%" }}
                  onClick={() => handleChooseType(opt.type)}
                  disabled={updateSettingsMut.isPending || isLocked}
                >
                  <i className={`bi ${opt.icon}`} style={{ fontSize: 28, color: "var(--primary)", marginBottom: 12, display: "block" }} />
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{opt.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{opt.desc}</div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== "No Assessment" confirmation ===== */}
      {mode === "disabled" && (
        <div className="hcard" style={{ padding: 32, maxWidth: 600, textAlign: "center" }}>
          <i className="bi bi-slash-circle" style={{ fontSize: 36, color: "var(--text-muted)", marginBottom: 16, display: "block" }} />
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Assessment disabled</div>
          <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>Candidates applying to this job won't be asked to take an assessment.</p>
          <button type="button" className="btn-outline-custom" onClick={handleChangeType} disabled={isLocked}>
            Change Assessment Type
          </button>
        </div>
      )}

      {/* ===== AI config form (before questions exist) ===== */}
      {mode === "ai-config" && (
        <div className="hcard" style={{ padding: 32, maxWidth: 700 }}>
          <ChangeTypeButton onClick={handleChangeType} style={{ marginBottom: 20 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--primary-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="bi bi-stars" style={{ color: "var(--primary)", fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Configure Assessment</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Specify the parameters for the AI generation</div>
            </div>
          </div>

          <form onSubmit={handleGenerate}>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ fontSize: 13 }}>Question Count</label>
                <input type="number" min="1" max="100" className="form-control" style={{ borderRadius: 10 }}
                  value={generateConfig.questionCount}
                  onChange={(e) => setGenerateConfig({ ...generateConfig, questionCount: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ fontSize: 13 }}>Difficulty</label>
                <select className="form-select" style={{ borderRadius: 10 }} value={generateConfig.difficulty}
                  onChange={(e) => setGenerateConfig({ ...generateConfig, difficulty: e.target.value })}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ fontSize: 13 }}>Duration (minutes) <span style={{ color: "#DC2626" }}>*</span></label>
                <input type="number" min={MIN_ASSESSMENT_DURATION_MINUTES} max="240" required className="form-control" style={{ borderRadius: 10 }}
                  value={generateConfig.durationMinutes}
                  onChange={(e) => setGenerateConfig({ ...generateConfig, durationMinutes: e.target.value })} />
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>How long candidates get to complete the assessment once they start it.</div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ fontSize: 13 }}>Topics (comma separated)</label>
                <input type="text" className="form-control" style={{ borderRadius: 10 }}
                  value={generateConfig.topics}
                  onChange={(e) => setGenerateConfig({ ...generateConfig, topics: e.target.value })} placeholder="React, JavaScript" />
              </div>
            </div>

            <FieldError message={generateError} />

            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn-primary-custom" disabled={generateMut.isPending || isLocked} style={{ minWidth: 200 }}>
                {generateMut.isPending ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Generating...</> : <><i className="bi bi-magic me-2"></i>Generate Questions</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== Manual setup — ask for duration before creating the record ===== */}
      {mode === "manual-setup" && (
        <div className="hcard" style={{ padding: 32, maxWidth: 700 }}>
          <ChangeTypeButton onClick={handleChangeType} style={{ marginBottom: 20 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f3f5fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="bi bi-pencil-square" style={{ color: "#1d2445", fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Set Up Manual Assessment</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Before you start adding questions, set the time candidates will have to complete it.</div>
            </div>
          </div>

          <form onSubmit={handleConfirmManualSetup}>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ fontSize: 13 }}>Duration (minutes) <span style={{ color: "#DC2626" }}>*</span></label>
                <input type="number" min={MIN_ASSESSMENT_DURATION_MINUTES} max="240" required className="form-control" style={{ borderRadius: 10 }}
                  value={manualDuration}
                  onChange={(e) => setManualDuration(e.target.value)} />
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>How long candidates get to complete the assessment once they start it.</div>
              </div>
            </div>

            <FieldError message={manualSetupError} />

            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn-primary-custom" disabled={updateSettingsMut.isPending} style={{ minWidth: 200 }}>
                {updateSettingsMut.isPending ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating...</> : <><i className="bi bi-arrow-right me-2"></i>Continue</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== AI question list ===== */}
      {mode === "ai" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <span className="ai-badge mb-2 d-inline-flex"><i className="bi bi-stars" /> AI-Powered Assessment</span>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>Review and refine the questions generated for this position.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ChangeTypeButton onClick={handleChangeType} disabled={isLocked} style={{ marginTop: 8 }} />
                <DurationBadge
                  assessment={assessment} isLocked={isLocked}
                  editing={editingDuration}
                  draft={durationDraft} setDraft={setDurationDraft}
                  onEditStart={() => { setDurationDraft(assessment?.durationMinutes || 30); setDurationEditError(null); setEditingDuration(true); }}
                  onSave={handleSaveDuration}
                  onCancel={() => { setEditingDuration(false); setDurationEditError(null); }}
                  saving={updateSettingsMut.isPending}
                  error={durationEditError}
                />
              </div>
            </div>
            <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }} onClick={handleRegenerateAssessment} disabled={regenerateAssMut.isPending || isLocked}>
              <i className="bi bi-arrow-clockwise me-2" />{regenerateAssMut.isPending ? "Regenerating..." : "Regenerate All Questions"}
            </button>
          </div>

          <FieldError message={listActionError} />

          <QuestionList
            questions={questions}
            allowRegenerate
            onEdit={openEditQuestion}
            onDelete={handleDeleteQuestion}
            onRegenerate={handleRegenerateQuestion}
            regeneratingId={regenerateQuestionMut.isPending ? regenerateQuestionMut.variables?.questionId : null}
            isLocked={isLocked}
          />
        </>
      )}

      {/* ===== Manual question list ===== */}
      {mode === "manual" && (
        <>
          <div style={{ marginBottom: 20 }}>
            <span className="ai-badge mb-2 d-inline-flex" style={{ background: "#f3f5fb", color: "#1d2445" }}>
              <i className="bi bi-pencil-square" /> Manual Assessment
            </span>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>Write and manage your own questions for this position.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <ChangeTypeButton onClick={handleChangeType} disabled={isLocked} style={{ marginTop: 8 }} />
              <DurationBadge
                assessment={assessment} isLocked={isLocked}
                editing={editingDuration}
                draft={durationDraft} setDraft={setDurationDraft}
                onEditStart={() => { setDurationDraft(assessment?.durationMinutes || 30); setDurationEditError(null); setEditingDuration(true); }}
                onSave={handleSaveDuration}
                onCancel={() => { setEditingDuration(false); setDurationEditError(null); }}
                saving={updateSettingsMut.isPending}
                  error={durationEditError}
              />
            </div>
          </div>

          <FieldError message={listActionError} />

          <QuestionList
            questions={questions}
            allowRegenerate={false}
            onEdit={openEditQuestion}
            onDelete={handleDeleteQuestion}
            isLocked={isLocked}
          />

          <button type="button" className="btn-outline-custom w-100 mt-3" style={{ borderStyle: "dashed", maxWidth: 900 }} onClick={openAddQuestion} disabled={isLocked}>
            <i className="bi bi-plus me-2" />Add Question
          </button>
        </>
      )}

      {/* ===== Add / Edit question modal — shared by AI & Manual ===== */}
      {questionModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 560 }}>
            <div className="modal-content" style={{ borderRadius: 16, border: "none" }}>
              <div className="modal-header" style={{ border: "none", padding: "24px 24px 0" }}>
                <h5 style={{ fontWeight: 800 }}>{editingQuestion ? "Edit Question" : "Add Question"}</h5>
                <button type="button" className="btn-close" onClick={() => setQuestionModalOpen(false)}></button>
              </div>
              <div className="modal-body" style={{ padding: 24 }}>
                <form id="questionForm" onSubmit={handleQuestionSave}>
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ fontSize: 13 }}>Question</label>
                    <textarea name="question" className="form-control" rows="2" required defaultValue={editingQuestion?.question || ""} style={{ fontSize: 14, borderRadius: 10 }}></textarea>
                  </div>
                  {[1, 2, 3, 4].map((n) => (
                    <div className="mb-2" key={n}>
                      <label className="form-label fw-bold" style={{ fontSize: 13 }}>Option {n}</label>
                      <input name={`option${n}`} type="text" className="form-control" required defaultValue={editingQuestion?.options?.[n - 1] || ""} style={{ fontSize: 14, borderRadius: 10 }} />
                    </div>
                  ))}
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ fontSize: 13 }}>Correct Answer (must match one option exactly)</label>
                    <input name="correctAnswer" type="text" className="form-control" required defaultValue={editingQuestion?.correctAnswer || ""} style={{ fontSize: 14, borderRadius: 10 }} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ fontSize: 13 }}>Explanation</label>
                    <textarea name="explanation" className="form-control" rows="2" defaultValue={editingQuestion?.explanation || ""} style={{ fontSize: 14, borderRadius: 10 }}></textarea>
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label fw-bold" style={{ fontSize: 13 }}>Topic</label>
                      <input name="topic" type="text" className="form-control" defaultValue={editingQuestion?.topic || ""} style={{ fontSize: 14, borderRadius: 10 }} />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label fw-bold" style={{ fontSize: 13 }}>Difficulty</label>
                      <select name="difficulty" className="form-select" defaultValue={editingQuestion?.difficulty || "Medium"} style={{ fontSize: 14, borderRadius: 10 }}>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>
                </form>
                <FieldError message={questionModalError} />
              </div>
              <div className="modal-footer" style={{ border: "none", padding: "0 24px 24px" }}>
                <button type="button" className="btn-outline-custom" onClick={() => setQuestionModalOpen(false)}>Cancel</button>
                <button type="submit" form="questionForm" className="btn-primary-custom" disabled={addQuestionMut.isPending || updateQuestionMut.isPending}>
                  {(addQuestionMut.isPending || updateQuestionMut.isPending) ? "Saving..." : "Save Question"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete confirmation modal — replaces window.confirm() ===== */}
      {deleteConfirmId && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
            <div className="modal-content" style={{ borderRadius: 16, border: "none" }}>
              <div className="modal-body" style={{ padding: 28, textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <i className="bi bi-trash" style={{ color: "#DC2626", fontSize: 20 }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Delete this question?</div>
                <p style={{ color: "var(--text-muted)", fontSize: 13.5, margin: 0 }}>This can't be undone.</p>
              </div>
              <div className="modal-footer" style={{ border: "none", padding: "0 24px 24px", justifyContent: "center" }}>
                <button type="button" className="btn-outline-custom" onClick={() => setDeleteConfirmId(null)} disabled={deletingQuestion}>
                  Cancel
                </button>
                <button type="button" className="btn-primary-custom" style={{ background: "#DC2626", borderColor: "#DC2626" }} onClick={handleConfirmDelete} disabled={deletingQuestion}>
                  {deletingQuestion ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function QuestionList({ questions, allowRegenerate, onEdit, onDelete, onRegenerate, regeneratingId, isLocked }) {
  if (questions.length === 0) {
    return (
      <div className="hcard" style={{ padding: 32, textAlign: "center", maxWidth: 900, color: "var(--text-muted)" }}>
        No questions yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 900 }}>
      {questions.map((q, i) => (
        <div key={q._id} className="hcard" style={{ padding: 20, position: "relative" }}>
          <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 6 }}>
            {allowRegenerate && (
              <button onClick={() => onRegenerate(q._id)} className="btn btn-sm btn-light" title="Regenerate via AI" disabled={isLocked || regeneratingId === q._id}>
                <i className={`bi ${regeneratingId === q._id ? "bi-hourglass-split" : "bi-arrow-clockwise"}`}></i>
              </button>
            )}
            <button onClick={() => onEdit(q)} className="btn btn-sm btn-light" title="Edit" disabled={isLocked}><i className="bi bi-pencil"></i></button>
            <button onClick={() => onDelete(q._id)} className="btn btn-sm btn-light" title="Delete" disabled={isLocked}><i className="bi bi-trash text-danger"></i></button>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 8 }}>Question {String(i + 1).padStart(2, "0")}</div>
          <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.6, marginBottom: 10, paddingRight: allowRegenerate ? 120 : 80 }}>{q.question}</p>
          {q.options?.length > 0 && (
            <ul style={{ fontSize: 13, marginBottom: 10, paddingInlineStart: 18 }}>
              {q.options.map((opt) => (
                <li key={opt} style={{ color: opt === q.correctAnswer ? "#065F46" : "var(--text-muted)", fontWeight: opt === q.correctAnswer ? 700 : 400 }}>
                  {opt}{opt === q.correctAnswer && " ✓"}
                </li>
              ))}
            </ul>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            {q.topic && (
              <span style={{ background: "#F3F4F6", color: "#374151", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{q.topic}</span>
            )}
            <span style={{ background: (tagColors[q.difficulty] || tagColors.default).bg, color: (tagColors[q.difficulty] || tagColors.default).color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
              {q.difficulty}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}