import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getJobById, updateJob, openJob } from "../../services/jobService";
import { getCategories } from "../../services/categoryService";
import { queryKeys } from "../../constants/queryKeys";
import { WORKPLACES, JOB_TYPES } from "../../constants/jobEnums";
import { postJobSchema } from "../../schemas/postJobSchema";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";
import toast from "react-hot-toast";

const inputStyle = { width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" };
const labelStyle = { fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" };
const errorStyle = { color: "#991B1B", fontSize: 12, marginTop: 4, marginBottom: 8 };

function todayMinDate() {
  return new Date().toISOString().slice(0, 10);
}

function FieldError({ name }) {
  return (
    <ErrorMessage name={name}>
      {(msg) => <p style={errorStyle}>{msg}</p>}
    </ErrorMessage>
  );
}

// Same 5-minute editing window shown on the Assessment page - a Drafted job can only
// be edited within 5 minutes of creation, so we surface the same countdown here.
function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function EditWindowBanner({ timeLeftMs, isLocked }) {
  if (isLocked) {
    return (
      <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <i className="bi bi-lock-fill" aria-hidden="true" />
        The editing window has expired - this job can no longer be modified.
      </div>
    );
  }

  if (timeLeftMs === null) return null;

  return (
    <div style={{ background: "#FEF3C7", color: "#92400E", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
      <i className="bi bi-clock-history" aria-hidden="true" />
      {formatCountdown(timeLeftMs)} left to edit this job before it locks automatically.
    </div>
  );
}

export default function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState("");

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: job,
    isLoading: jobLoading,
    isError: jobError,
    error: jobFetchError,
  } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJobById(id),
    enabled: !!id,
  });

  const updateJobMutation = useMutation({
    mutationFn: (payload) => updateJob(id, payload),
    onSuccess: () => {
      toast.success("Job updated successfully!");
      navigate("/recruiter/jobs");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update job. Please try again.");
    },
  });

  const publishJobMutation = useMutation({
    mutationFn: () => openJob(id),
    onSuccess: () => {
      toast.success("Job is now live!");
      navigate("/recruiter/jobs");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to publish job. Please try again.");
    },
  });

  // Countdown timer - job is only editable within 5 minutes of creation (same rule as
  // the Assessment page).
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

  // Only Drafted jobs are subject to the 5-minute window; already-published jobs stay
  // editable as before (no timer, no lock).
  const isLocked = job?.status === "Drafted" && timeLeftMs !== null && timeLeftMs <= 0;

  if (categoriesLoading || jobLoading) return <LoadingState message="Loading job details..." />;

  if (jobError) {
    return (
      <>
        <BackButton fallbackTo="/recruiter/jobs" label="Back to Jobs" />
        <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px 16px", borderRadius: 10, fontSize: 14 }}>
          {jobFetchError?.message || "Failed to load job details."}
        </div>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <BackButton fallbackTo="/recruiter/jobs" label="Back to Jobs" />
        <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px 16px", borderRadius: 10, fontSize: 14 }}>
          Job not found.
        </div>
      </>
    );
  }

  if (updateJobMutation.isPending) return <LoadingState message="Saving changes..." />;
  if (publishJobMutation.isPending) return <LoadingState message="Publishing job..." />;

  const editInitialValues = {
    category: job.category?._id || job.category || "",
    title: job.title || "",
    description: job.description || "",
    workplace: job.workplace || "Remote",
    jobType: job.jobType || "Full Time",
    location: job.location || "",
    skills: job.skills || [],
    requirements: job.requirements || "",
    applicationEnd: job.applicationEnd ? job.applicationEnd.slice(0, 10) : "",
  };

  return (
    <>
      <BackButton fallbackTo="/recruiter/jobs" label="Back to Jobs" />
      <div className="page-header-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Edit Job</h1>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>Update the details of your job posting.</p>
        </div>
      </div>

      <EditWindowBanner timeLeftMs={timeLeftMs} isLocked={isLocked} />

      <Formik
        initialValues={editInitialValues}
        validationSchema={postJobSchema}
        enableReinitialize
        onSubmit={(values) => {
          const payload = {
            category: values.category,
            title: values.title.trim(),
            description: values.description.trim(),
            workplace: values.workplace,
            jobType: values.jobType,
            skills: values.skills,
            requirements: values.requirements?.trim() ?? "",
            location: values.location?.trim() ?? "",
          };
          if (values.applicationEnd) {
            payload.applicationEnd = values.applicationEnd;
          }
          updateJobMutation.mutate(payload);
        }}
      >
        {({ values, setFieldValue }) => {
          const addSkill = (value) => {
            const trimmed = (value || skillInput).trim().replace(/,$/, "");
            if (trimmed && !values.skills.includes(trimmed)) {
              setFieldValue("skills", [...values.skills, trimmed]);
              setSkillInput("");
            }
          };

          const handleSkillKey = (e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addSkill();
            }
          };

          const removeSkill = (skill) => {
            setFieldValue("skills", values.skills.filter((s) => s !== skill));
          };

          return (
            <Form>
              {updateJobMutation.isError && (
                <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
                  {updateJobMutation.error?.message || "Failed to update job. Please try again."}
                </div>
              )}

              <div className="hcard" style={{ padding: 28, marginBottom: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle} htmlFor="category">Category</label>
                  <Field as="select" id="category" name="category" style={inputStyle}>
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </Field>
                  <FieldError name="category" />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle} htmlFor="title">Job Title</label>
                  <Field id="title" name="title" placeholder="e.g. Frontend Developer" style={inputStyle} />
                  <FieldError name="title" />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle} htmlFor="description">Description</label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows={5}
                    placeholder="Describe the role and responsibilities..."
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                  <FieldError name="description" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }} className="grid-stats-3">
                  <div>
                    <label style={labelStyle} htmlFor="workplace">Workplace</label>
                    <Field as="select" id="workplace" name="workplace" style={inputStyle}>
                      {WORKPLACES.map((o) => <option key={o} value={o}>{o}</option>)}
                    </Field>
                    <FieldError name="workplace" />
                  </div>
                  <div>
                    <label style={labelStyle} htmlFor="jobType">Job Type</label>
                    <Field as="select" id="jobType" name="jobType" style={inputStyle}>
                      {JOB_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
                    </Field>
                    <FieldError name="jobType" />
                  </div>
                  <div>
                    <label style={labelStyle} htmlFor="location">Location</label>
                    <Field id="location" name="location" placeholder="e.g. Cairo, Egypt" style={inputStyle} />
                    <FieldError name="location" />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Skills</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, minHeight: 44 }}>
                    {values.skills.map((s) => (
                      <span key={s} style={{ background: "var(--primary-bg)", color: "var(--primary)", padding: "4px 10px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                        {s}
                        <i className="bi bi-x" style={{ cursor: "pointer" }} onClick={() => removeSkill(s)} aria-hidden="true" />
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
                  <FieldError name="skills" />
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Press Enter or use commas to separate tags.</div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle} htmlFor="requirements">Requirements</label>
                  <Field
                    as="textarea"
                    id="requirements"
                    name="requirements"
                    rows={3}
                    placeholder="e.g. 2+ years of frontend experience."
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                  <FieldError name="requirements" />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle} htmlFor="application-end">Application End</label>
                  <Field id="application-end" name="applicationEnd" type="date" min={todayMinDate()} style={{ ...inputStyle, width: "auto", maxWidth: 220 }} />
                  <FieldError name="applicationEnd" />
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                  {job.status === "Drafted" && (
                    <button
                      type="button"
                      className="btn-outline-custom"
                      disabled={isLocked}
                      onClick={() => {
                        const deadline = values.applicationEnd ? new Date(`${values.applicationEnd}T23:59:59`) : null;
                        if (deadline && deadline < new Date()) {
                          toast.error("Can't publish this job — its application deadline has already passed. Please update the deadline first.");
                          return;
                        }
                        publishJobMutation.mutate();
                      }}
                    >
                      <i className="bi bi-send me-2" aria-hidden="true" />Publish Now
                    </button>
                  )}
                  <button type="submit" className="btn-primary-custom" disabled={isLocked}>
                    <i className="bi bi-check-lg me-2" aria-hidden="true" />Save Changes
                  </button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </>
  );
}