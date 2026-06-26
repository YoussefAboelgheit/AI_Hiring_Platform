import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../../services/jobService";
import { getCategories } from "../../services/categoryService";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";
import toast from "react-hot-toast";

const inputStyle = { width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" };
const labelStyle = { fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" };

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
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    workplace: "Onsite",
    jobType: "Full Time",
    location: "",
    requirements: "",
    status: "Drafted",
    applicationEnd: "",
  });

  const [skills, setSkills] = useState(["React", "JavaScript", "CSS"]);
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => console.error("Error loading categories:", err))
      .finally(() => setLoadingCategories(false));
  }, []);

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

  const validateForm = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Job title is required";
    if (!form.description.trim()) errs.description = "Job description is required";
    if (!form.workplace) errs.workplace = "Workplace is required";
    if (!form.jobType) errs.jobType = "Job type is required";
    if (skills.length === 0) errs.skills = "At least one skill tag is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (statusOverride) => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        workplace: form.workplace,
        jobType: form.jobType,
        category: form.category || null,
        location: form.location.trim(),
        requirements: form.requirements.trim(),
        skills: skills,
        status: statusOverride || form.status,
        applicationEnd: form.applicationEnd || null,
      };
      await createJob(payload);
      toast.success("Job posted successfully!");
      navigate("/recruiter/jobs");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to post job");
    } finally {
      setSubmitting(false);
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

  if (submitting || loadingCategories) return <LoadingState message="Publishing job..." />;

  const selectedCategoryName = categories.find((c) => c._id === form.category)?.name || "";

  return (
    <>
      <BackButton fallbackTo="/recruiter/jobs" label="Back to Jobs" />
      <div className="page-header-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Post New Job</h1>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>Define parameters and requirements for your next vacancy.</p>
        </div>
        <span className="ai-badge"><i className="bi bi-stars" aria-hidden="true" /> AI-Assisted Mode Active</span>
      </div>

      <div className="hcard" style={{ padding: 28, marginBottom: 20 }}>
        {/* Row 1: Title & Category */}
        <div className="grid-2-col mb-3">
          <div>
            <label style={labelStyle}>Job Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Senior Fullstack Engineer"
              style={{ ...inputStyle, borderColor: errors.title ? "var(--danger)" : "var(--border)" }}
            />
            {errors.title && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{errors.title}</div>}
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={inputStyle}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Workplace, Job Type & Location */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }} className="grid-stats-3">
          <div>
            <label style={labelStyle}>Workplace *</label>
            <select value={form.workplace} onChange={(e) => setForm({ ...form, workplace: e.target.value })} style={inputStyle}>
              <option value="Onsite">Onsite</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Job Type *</label>
            <select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} style={inputStyle}>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Intern">Intern</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <div className="auth-input-wrap">
              <i className="bi bi-geo-alt text-muted" aria-hidden="true" />
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Cairo, Egypt, Remote" />
            </div>
          </div>
        </div>

        {/* Row 3: Application End Date & Status */}
        <div className="grid-2-col mb-3">
          <div>
            <label style={labelStyle}>Application Deadline</label>
            <div className="auth-input-wrap">
              <i className="bi bi-calendar-event text-muted" aria-hidden="true" />
              <input
                type="date"
                value={form.applicationEnd}
                min={todayMinDate()}
                onChange={(e) => setForm({ ...form, applicationEnd: e.target.value })}
              />
            </div>
            {isDeadlinePast(form.applicationEnd) && (
              <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>This deadline is in the past!</div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Publishing Status *</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
              <option value="Open">Open (Publish Immediately)</option>
              <option value="Drafted">Drafted (Save as Draft)</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Row 4: Description */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Job Description *</label>
          <div style={{ border: `1.5px solid ${errors.description ? "var(--danger)" : "var(--border)"}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 4, padding: "8px 12px", borderBottom: "1px solid var(--border)", background: "var(--body-bg)" }}>
              {["bi-type-bold", "bi-type-italic", "bi-list-ul", "bi-list-ol", "bi-link-45deg", "bi-image"].map((icon) => (
                <button key={icon} type="button" className="btn btn-sm btn-light" style={{ padding: "2px 8px" }}><i className={`bi ${icon}`} aria-hidden="true" /></button>
              ))}
            </div>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              placeholder="Describe the role, responsibilities, and team culture..."
              style={{ width: "100%", border: "none", padding: "12px 14px", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
          {errors.description && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{errors.description}</div>}
        </div>

        {/* Row 5: Requirements */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Requirements / Qualifications</label>
          <textarea
            value={form.requirements}
            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            rows={3}
            placeholder="e.g. 2+ years of experience in React development, BS in Computer Science..."
            style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "12px 14px", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        {/* Row 6: Required Skills Tag Input */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Required Skills Tag List *</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "10px 12px", border: `1.5px solid ${errors.skills ? "var(--danger)" : "var(--border)"}`, borderRadius: 10, minHeight: 44 }}>
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
              placeholder="Add skill tag..."
              style={{ border: "none", outline: "none", flex: 1, minWidth: 100, fontSize: 13 }}
            />
          </div>
          {errors.skills && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{errors.skills}</div>}
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Press Enter or comma to insert a tag.</div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <button type="button" className="btn-outline-custom" onClick={() => navigate("/recruiter/jobs")}>Cancel</button>
          <button type="button" className="btn-outline-custom" onClick={() => handleSubmit("Drafted")}>Save as Draft</button>
          <button type="button" className="btn-primary-custom" onClick={() => handleSubmit("Open")}>
            <i className="bi bi-send me-2" aria-hidden="true" />Publish Position
          </button>
        </div>
      </div>

      <div className="grid-2-col">
        {/* Live Preview */}
        <div className="hcard" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: "var(--text-muted)", marginBottom: 12 }}>LIVE PREVIEW</div>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{form.title || "Untitled Job Listing"}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span className="badge-new">New</span>
            {form.applicationEnd && isDeadlinePast(form.applicationEnd) && (
              <span style={{ background: "#FEE2E2", color: "#991B1B", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>Closed</span>
            )}
            <span style={{ background: "var(--primary-bg)", color: "var(--primary)", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>{form.workplace}</span>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-muted)", marginBottom: 12, flexWrap: "wrap" }}>
            <span><i className="bi bi-building me-1" aria-hidden="true" />HireAI Recruiter</span>
            <span><i className="bi bi-geo-alt me-1" aria-hidden="true" />{form.location || "Remote"}</span>
            {form.applicationEnd && (
              <span style={{ color: isDeadlinePast(form.applicationEnd) ? "var(--danger)" : "var(--text-muted)" }}>
                <i className={`bi ${isDeadlinePast(form.applicationEnd) ? "bi-calendar-x" : "bi-calendar-event"} me-1`} aria-hidden="true" />
                {isDeadlinePast(form.applicationEnd)
                  ? `Applications closed · ${formatDeadline(form.applicationEnd)}`
                  : `Apply by ${formatDeadline(form.applicationEnd)}`}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="skill-tag">{form.jobType}</span>
            {selectedCategoryName && <span className="skill-tag">{selectedCategoryName}</span>}
          </div>
        </div>

        {/* AI optimization score */}
        <div className="hcard ai-optimization-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>AI OPTIMIZATION</div>
          <p style={{ fontSize: 14, color: "#fff", marginBottom: 16, lineHeight: 1.6 }}>
            Your job posting is {optimizationScore}% optimized for search visibility and candidate matching.
          </p>
          <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.25)", marginBottom: 12 }}>
            <div style={{ height: 6, borderRadius: 6, background: "#fff", width: `${optimizationScore}%`, transition: "width 0.3s" }} />
          </div>
          <button type="button" className="btn btn-link p-0" style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>
            View optimization suggestions →
          </button>
        </div>
      </div>
    </>
  );
}
