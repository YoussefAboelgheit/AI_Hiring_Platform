import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../../services/jobService";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

const STEPS = ["Role Information", "Requirements", "Settings"];

const inputStyle = { width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" };
const labelStyle = { fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" };

function defaultDeadline() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

function todayMinDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDeadline(isoDate) {
  if (!isoDate) return null;
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function isDeadlinePast(isoDate) {
  if (!isoDate) return false;
  return new Date(`${isoDate}T23:59:59`) < new Date();
}

export default function PostJobPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    experienceLevel: "Senior",
    employmentType: "Full-time",
    salaryMin: "",
    salaryMax: "",
    education: "",
    yearsExperience: "",
    autoMatch: true,
    publicListing: true,
    status: "active",
    applicationDeadline: defaultDeadline(),
  });
  const [skills, setSkills] = useState(["TypeScript", "React", "Node.js"]);
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addSkill = (value) => {
    const trimmed = (value || skillInput).trim().replace(/,$/, "");
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleSkillKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const optimizationScore = Math.min(
    95,
    40 +
      (form.title ? 15 : 0) +
      (form.description.length > 50 ? 20 : form.description.length > 0 ? 10 : 0) +
      (skills.length >= 3 ? 15 : skills.length * 5) +
      (form.location ? 10 : 0)
  );

  const handleSubmit = async (status = form.status) => {
    setSubmitting(true);
    try {
      await createJob({ ...form, skills, status });
      navigate("/recruiter/jobs");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) return <LoadingState message="Publishing job..." />;

  return (
    <>
      <BackButton fallbackTo="/recruiter/jobs" label="Back to Jobs" />
      <div className="page-header-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Job Details</h1>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>Define the parameters for your next top hire.</p>
        </div>
        <span className="ai-badge"><i className="bi bi-stars" aria-hidden="true" /> AI-Assisted Mode Active</span>
      </div>

      <div className="form-stepper">
        {STEPS.map((label, i) => (
          <div key={label} className="form-step" style={{ flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <button
              type="button"
              className={`form-step-circle ${i <= step ? "active" : ""}`}
              onClick={() => setStep(i)}
              aria-label={`Step ${i + 1}: ${label}`}
            >
              {i + 1}
            </button>
            <span className={`form-step-label ${i <= step ? "active" : ""}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`form-step-line ${i < step ? "active" : ""}`} />}
          </div>
        ))}
      </div>

      <div className="hcard" style={{ padding: 28, marginBottom: 20 }}>
        {step === 0 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Job Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Fullstack Engineer" style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }} className="grid-stats-3">
              <div>
                <label style={labelStyle}>Experience Level</label>
                <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} style={inputStyle}>
                  {["Entry Level", "Mid Level", "Senior", "Lead", "Executive"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Employment Type</label>
                <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} style={inputStyle}>
                  {["Full-time", "Part-time", "Contract", "Internship"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-geo-alt text-muted" aria-hidden="true" />
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Remote, New York, London" />
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Job Description</label>
                <button type="button" className="btn btn-link p-0" style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>
                  <i className="bi bi-stars me-1" aria-hidden="true" />AI Autocomplete
                </button>
              </div>
              <div style={{ border: "1.5px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ display: "flex", gap: 4, padding: "8px 12px", borderBottom: "1px solid var(--border)", background: "var(--body-bg)" }}>
                  {["bi-type-bold", "bi-type-italic", "bi-list-ul", "bi-list-ol", "bi-link-45deg", "bi-image"].map((icon) => (
                    <button key={icon} type="button" className="btn btn-sm btn-light" style={{ padding: "2px 8px" }}><i className={`bi ${icon}`} aria-hidden="true" /></button>
                  ))}
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={6}
                  placeholder="Describe the role, responsibilities, and team culture..."
                  style={{ width: "100%", border: "none", padding: "12px 14px", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Required Skills</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, minHeight: 44 }}>
                {skills.map((s) => (
                  <span key={s} style={{ background: "var(--primary-bg)", color: "var(--primary)", padding: "4px 10px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    {s}
                    <i className="bi bi-x" style={{ cursor: "pointer" }} onClick={() => setSkills(skills.filter((sk) => sk !== s))} aria-hidden="true" />
                  </span>
                ))}
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKey}
                  onBlur={() => addSkill()}
                  placeholder="Add skill..."
                  style={{ border: "none", outline: "none", flex: 1, minWidth: 100, fontSize: 13 }}
                />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Press Enter or use commas to separate tags.</div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid-2-col mb-3">
              <div>
                <label style={labelStyle}>Salary Range (Min)</label>
                <input value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} placeholder="e.g. $140,000" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Salary Range (Max)</label>
                <input value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} placeholder="e.g. $180,000" style={inputStyle} />
              </div>
            </div>
            <div className="grid-2-col mb-3">
              <div>
                <label style={labelStyle}>Minimum Education</label>
                <select value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} style={inputStyle}>
                  <option value="">Select level</option>
                  <option>Bachelor&apos;s Degree</option>
                  <option>Master&apos;s Degree</option>
                  <option>PhD</option>
                  <option>Bootcamp / Self-taught</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Years of Experience</label>
                <select value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })} style={inputStyle}>
                  <option value="">Select range</option>
                  <option>0–2 years</option>
                  <option>3–5 years</option>
                  <option>5–8 years</option>
                  <option>8+ years</option>
                </select>
              </div>
            </div>
            <div className="hcard" style={{ padding: 16, background: "var(--body-bg)", border: "1px dashed var(--border)" }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Required Skills Summary</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Publishing Status</label>
              <div style={{ display: "flex", gap: 10 }}>
                {["active", "draft"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, status: s })}
                    style={{
                      flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13, textTransform: "capitalize",
                      border: `1.5px solid ${form.status === s ? "var(--primary)" : "var(--border)"}`,
                      background: form.status === s ? "var(--primary-bg)" : "#fff",
                      color: form.status === s ? "var(--primary)" : "var(--text-muted)",
                    }}
                  >
                    {s === "active" ? "Publish Immediately" : "Save as Draft"}
                  </button>
                ))}
              </div>
            </div>
            {[
              { key: "autoMatch", label: "Enable AI Auto-Matching", desc: "Start matching candidates as soon as the job is published." },
              { key: "publicListing", label: "Public Job Listing", desc: "Make this job visible on the HireAI candidate portal." },
            ].map(({ key, label, desc }) => (
              <label key={key} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} style={{ marginTop: 3 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{desc}</div>
                </div>
              </label>
            ))}
            <div style={{ marginTop: 8, paddingTop: 20 }}>
              <label style={labelStyle} htmlFor="application-deadline">Application Deadline</label>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, marginTop: 0 }}>
                Last date candidates can apply. The job will automatically close after this date.
              </p>
              <div className="auth-input-wrap" style={{ maxWidth: 280 }}>
                <i className="bi bi-calendar-event text-muted" aria-hidden="true" />
                <input
                  id="application-deadline"
                  type="date"
                  value={form.applicationDeadline}
                  min={todayMinDate()}
                  onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                />
              </div>
              {isDeadlinePast(form.applicationDeadline) && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 12, color: "var(--danger)" }}>
                  <i className="bi bi-exclamation-circle" aria-hidden="true" />
                  This date is in the past — the job will be saved as closed.
                </div>
              )}
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
          <button type="button" className="btn-teal-custom" onClick={() => navigate("/recruiter/assessment-generator")}>
            <i className="bi bi-clipboard-check me-2" aria-hidden="true" />Generate Assessment
          </button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            {step > 0 && (
              <button type="button" className="btn-outline-custom" onClick={() => setStep(step - 1)}>Back</button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" className="btn-primary-custom" onClick={() => setStep(step + 1)}>Continue</button>
            ) : (
              <>
                <button type="button" className="btn-outline-custom" onClick={() => handleSubmit("draft")}>Save Draft</button>
                <button type="button" className="btn-primary-custom" onClick={() => handleSubmit("active")}>
                  <i className="bi bi-send me-2" aria-hidden="true" />Publish Job
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2-col">
        <div className="hcard" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: "var(--text-muted)", marginBottom: 12 }}>LIVE PREVIEW</div>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{form.title || "Senior Fullstack Engineer"}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span className="badge-new">New</span>
            {form.applicationDeadline && isDeadlinePast(form.applicationDeadline) && (
              <span style={{ background: "#FEE2E2", color: "#991B1B", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>Closed</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-muted)", marginBottom: 12, flexWrap: "wrap" }}>
            <span><i className="bi bi-building me-1" aria-hidden="true" />HireAI</span>
            <span><i className="bi bi-geo-alt me-1" aria-hidden="true" />{form.location || "Remote"}</span>
            {form.applicationDeadline && (
              <span style={{ color: isDeadlinePast(form.applicationDeadline) ? "var(--danger)" : "var(--text-muted)" }}>
                <i className={`bi ${isDeadlinePast(form.applicationDeadline) ? "bi-calendar-x" : "bi-calendar-event"} me-1`} aria-hidden="true" />
                {isDeadlinePast(form.applicationDeadline)
                  ? `Applications closed · ${formatDeadline(form.applicationDeadline)}`
                  : `Apply by ${formatDeadline(form.applicationDeadline)}`}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="skill-tag">{form.employmentType}</span>
            {(form.salaryMin || form.salaryMax) && (
              <span className="skill-tag">{form.salaryMin && form.salaryMax ? `${form.salaryMin} - ${form.salaryMax}` : form.salaryMin || form.salaryMax}</span>
            )}
          </div>
        </div>

        <div className="hcard ai-optimization-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>AI OPTIMIZATION</div>
          <p style={{ fontSize: 14, color: "#fff", marginBottom: 16, lineHeight: 1.6 }}>
            Your job description is {optimizationScore}% optimized for target candidates.
          </p>
          <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.25)", marginBottom: 12 }}>
            <div style={{ height: 6, borderRadius: 6, background: "#fff", width: `${optimizationScore}%`, transition: "width 0.3s" }} />
          </div>
          <button type="button" className="btn btn-link p-0" style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>
            View suggestions →
          </button>
        </div>
      </div>
    </>
  );
}
