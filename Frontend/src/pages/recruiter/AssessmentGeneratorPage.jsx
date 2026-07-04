import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useAssessment,
  useGenerateAssessment,
  useUpdateAssessmentSettings,
  useRegenerateAssessment,
  useAddManualQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useRegenerateQuestion
} from "../../hooks/useAssessment";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

const tagColors = {
  Easy: { bg: "#D1FAE5", color: "#065F46" },
  Medium: { bg: "#FEF3C7", color: "#92400E" },
  Hard: { bg: "#FEE2E2", color: "#991B1B" },
  default: { bg: "#EDE9FE", color: "#6D28D9" }
};

export default function AssessmentGeneratorPage() {
  const { jobId } = useParams();
  const { data, isLoading, error } = useAssessment(jobId);
  const generateMut = useGenerateAssessment();
  const updateSettingsMut = useUpdateAssessmentSettings();
  const regenerateAssMut = useRegenerateAssessment();
  const addQuestionMut = useAddManualQuestion();
  const updateQuestionMut = useUpdateQuestion();
  const deleteQuestionMut = useDeleteQuestion();
  const regenerateQuestionMut = useRegenerateQuestion();

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Settings form state — mirrors PATCH /assessment schema (type, questionCount, difficulty, topics)
  const [settingsForm, setSettingsForm] = useState(null); // populated once `data` loads

  // Generate form state
  const [generateConfig, setGenerateConfig] = useState({
    questionCount: 10,
    difficulty: "Medium",
    topics: "React, JavaScript",
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      // API only accepts questionCount, difficulty, topics — no "type" field
      const payload = {
        questionCount: Number(generateConfig.questionCount),
        difficulty: generateConfig.difficulty,
        topics: generateConfig.topics,
      };
      console.log("Sending generate payload:", payload);
      await generateMut.mutateAsync({ jobId, payload });
    } catch (err) {
      console.error("Generate error response:", err.response?.data?.errors || err.response?.data || err);
      alert("Failed to generate: " + JSON.stringify(err.response?.data?.errors || err.response?.data?.message || err.message));
    }
  };

  const handleSaveSettings = async () => {
    await updateSettingsMut.mutateAsync({ jobId, payload: settingsForm });
    alert("Settings updated!");
  };

  const openAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionModalOpen(true);
  };

  const openEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionModalOpen(true);
  };

  const handleDeleteQuestion = async (qId) => {
    if (window.confirm("Delete this question?")) {
      await deleteQuestionMut.mutateAsync({ questionId: qId, jobId });
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
    ];
    const qData = {
      question: formData.get("question"),
      options,
      correctAnswer: formData.get("correctAnswer"),
      explanation: formData.get("explanation"),
      topic: formData.get("topic"),
      difficulty: formData.get("difficulty"),
    };
    
    if (editingQuestion) {
      await updateQuestionMut.mutateAsync({ questionId: editingQuestion._id, question: qData, jobId });
    } else {
      await addQuestionMut.mutateAsync({ jobId, question: qData });
    }
    setQuestionModalOpen(false);
  };

  useEffect(() => {
    if (data?.assessment && !settingsForm) {
      setSettingsForm({
        type: data.assessment.type || "AI",
        questionCount: data.assessment.questionCount || 5,
        difficulty: data.assessment.difficulty || "Medium",
        topics: data.assessment.topics || "",
      });
    }
  }, [data, settingsForm]);

  if (!jobId) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
        <BackButton fallbackTo={`/recruiter/jobs`} label="Back to Jobs" />
        <div className="hcard text-center" style={{ padding: 40, marginTop: 20 }}>
          <i className="bi bi-briefcase text-primary mb-3" style={{ fontSize: 48 }} />
          <h3>Select a Job</h3>
          <p className="text-muted mb-4">You need to select a job to manage its assessment.</p>
          <Link to="/recruiter/jobs" className="btn-primary-custom" style={{ textDecoration: 'none' }}>
            Go to My Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) return <LoadingState message="Loading assessment..." />;

  // Empty state: Assessment not found or error
  if (error || !data) {
    return (
      <>
        <BackButton fallbackTo={`/recruiter/job/${jobId}`} label="Back to Job" />
        <div className="page-header-row mb-4">
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>Assessment Generator</h1>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>Generate an AI-powered assessment to evaluate candidates for this position.</p>
          </div>
        </div>
        
        <div className="hcard" style={{ padding: 32, maxWidth: 800 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, background: "var(--primary-bg)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="bi bi-robot" style={{ color: "var(--primary)", fontSize: 24 }}></i>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Configure Assessment</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Specify the parameters for the AI generation</p>
            </div>
          </div>
          
          <form onSubmit={handleGenerate}>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ fontSize: 13 }}>Questions Count</label>
                <input type="number" className="form-control" style={{ borderRadius: 10 }} value={generateConfig.questionCount} onChange={e => setGenerateConfig({...generateConfig, questionCount: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ fontSize: 13 }}>Difficulty</label>
                <select className="form-select" style={{ borderRadius: 10 }} value={generateConfig.difficulty} onChange={e => setGenerateConfig({...generateConfig, difficulty: e.target.value})}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ fontSize: 13 }}>Topics (comma separated)</label>
                <input type="text" className="form-control" style={{ borderRadius: 10 }} value={generateConfig.topics} onChange={e => setGenerateConfig({...generateConfig, topics: e.target.value})} placeholder="e.g. React, JavaScript, Node.js" />
              </div>
            </div>
            
            <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn-primary-custom" disabled={generateMut.isPending} style={{ minWidth: 200 }}>
                {generateMut.isPending ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Generating...</> : <><i className="bi bi-magic me-2"></i>Generate Assessment</>}
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  // Pre-fill settings if they exist and are not set in state yet
  // We can just rely on data.duration and data.passingScore initially if needed

  return (
    <>
      <BackButton fallbackTo={`/recruiter/job/${jobId}`} label="Back to Job" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <span className="ai-badge mb-2 d-inline-flex"><i className="bi bi-stars" /> AI-Powered Generation</span>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Assessment Generator</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Review and refine the questions generated for this position.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }} onClick={() => regenerateAssMut.mutateAsync({ jobId })} disabled={regenerateAssMut.isPending}>
            <i className="bi bi-arrow-clockwise me-2" />{regenerateAssMut.isPending ? "Regenerating..." : "Regenerate Assessment"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700 }}>Questions</div>
            <span style={{ background: "var(--primary-bg)", color: "var(--primary)", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
              {data.questions?.length || 0} Questions
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.questions?.map((q, i) => (
              <div key={q._id || i} className="hcard" style={{ padding: 20, position: "relative" }}>
                <div style={{ position: "absolute", top: 15, right: 15, display: "flex", gap: 8 }}>
                  <button onClick={() => regenerateQuestionMut.mutateAsync({ questionId: q._id, jobId })} className="btn btn-sm btn-light" title="Regenerate"><i className="bi bi-arrow-clockwise"></i></button>
                  <button onClick={() => openEditQuestion(q)} className="btn btn-sm btn-light" title="Edit"><i className="bi bi-pencil"></i></button>
                  <button onClick={() => handleDeleteQuestion(q._id)} className="btn btn-sm btn-light text-danger" title="Delete"><i className="bi bi-trash"></i></button>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 8 }}>Question {String(i + 1).padStart(2, "0")}</div>
                <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.6, marginBottom: 10, paddingRight: 80 }}>{q.question}</p>
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
                    <span style={{ background: "#F3F4F6", color: "#374151", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                      {q.topic}
                    </span>
                  )}
                  <span style={{ background: (tagColors[q.difficulty] || tagColors.default).bg, color: (tagColors[q.difficulty] || tagColors.default).color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                    {q.difficulty}
                  </span>
                </div>
              </div>
            ))}
            <button type="button" onClick={openAddQuestion} className="btn-outline-custom w-100" style={{ borderStyle: "dashed" }}>
              <i className="bi bi-plus me-2" />Add Custom Question
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="hcard" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <i className="bi bi-gear" style={{ color: "var(--primary)" }} aria-hidden="true" />
              <span style={{ fontWeight: 700 }}>Assessment Settings</span>
            </div>
            {settingsForm && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Type</label>
                  <select className="form-select" value={settingsForm.type} onChange={e => setSettingsForm({ ...settingsForm, type: e.target.value })} style={{ borderRadius: 10, fontSize: 14 }}>
                    <option value="AI">AI</option>
                    <option value="MANUAL">Manual</option>
                    <option value="NONE">None</option>
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Difficulty</label>
                  <select className="form-select" value={settingsForm.difficulty} onChange={e => setSettingsForm({ ...settingsForm, difficulty: e.target.value })} style={{ borderRadius: 10, fontSize: 14 }}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Question Count</label>
                  <input type="number" className="form-control" value={settingsForm.questionCount} onChange={e => setSettingsForm({ ...settingsForm, questionCount: Number(e.target.value) })} style={{ borderRadius: 10, fontSize: 14 }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Topics</label>
                  <input type="text" className="form-control" value={settingsForm.topics} onChange={e => setSettingsForm({ ...settingsForm, topics: e.target.value })} style={{ borderRadius: 10, fontSize: 14 }} />
                </div>
                <button onClick={handleSaveSettings} disabled={updateSettingsMut.isPending} className="btn-primary-custom w-100 mt-2" style={{ fontSize: 13 }}>
                  {updateSettingsMut.isPending ? "Saving..." : "Save Settings"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {questionModalOpen && (
        <>
          <div className="modal-backdrop show"></div>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: 16, border: "none" }}>
                <div className="modal-header" style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <h5 className="modal-title fw-bold">{editingQuestion ? "Edit Question" : "Add Question"}</h5>
                  <button type="button" className="btn-close" onClick={() => setQuestionModalOpen(false)}></button>
                </div>
                <div className="modal-body">
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
                </div>
                <div className="modal-footer" style={{ borderTop: "none" }}>
                  <button type="button" className="btn-outline-custom" onClick={() => setQuestionModalOpen(false)}>Cancel</button>
                  <button type="submit" form="questionForm" className="btn-primary-custom" disabled={updateQuestionMut.isPending || addQuestionMut.isPending}>
                    Save Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}