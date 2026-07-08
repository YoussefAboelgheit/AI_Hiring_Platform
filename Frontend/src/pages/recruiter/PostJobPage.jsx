import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createJob } from "../../services/jobService";
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

function defaultDeadline() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

const initialValues = {
  category: "",
  title: "",
  description: "",
  workplace: "Remote",
  jobType: "Full Time",
  location: "",
  skills: [],
  requirements: "",
  applicationEnd: defaultDeadline(),
};

function FieldError({ name }) {
  return (
    <ErrorMessage name={name}>
      {(msg) => <p style={errorStyle}>{msg}</p>}
    </ErrorMessage>
  );
}

export default function PostJobPage() {
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState("");

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesFetchError,
  } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });

  const createJobMutation = useMutation({
    mutationFn: ({ values, saveAsDraft }) => createJob(values, saveAsDraft),
    onSuccess: (job, { saveAsDraft }) => {
      if (saveAsDraft) {
        toast.success("Job saved as draft. Publish it whenever you're ready.");
        navigate("/recruiter/jobs");
      } else {
        toast.success("Job posted! It will go live automatically in 5 minutes — edit it now if you need to.");
        navigate(`/recruiter/jobs/${job._id}/assessment`);
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to publish job. Please try again.");
    },
  });

  if (categoriesLoading) return <LoadingState message="Loading categories..." />;

  if (categoriesError) {
    return (
      <>
        <BackButton fallbackTo="/recruiter/jobs" label="Back to Jobs" />
        <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px 16px", borderRadius: 10, fontSize: 14 }}>
          {categoriesFetchError?.message || "Failed to load categories."}
        </div>
      </>
    );
  }

  if (createJobMutation.isPending) return <LoadingState message="Publishing job..." />;

  return (
    <>
      <BackButton fallbackTo="/recruiter/jobs" label="Back to Jobs" />
      <div className="page-header-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Post New Job</h1>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>Define parameters and requirements for your next vacancy.</p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={postJobSchema}
        onSubmit={(values) => createJobMutation.mutate({ values, saveAsDraft: false })}
      >
        {({ values, setFieldValue, validateForm, setTouched }) => {
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
            setFieldValue(
              "skills",
              values.skills.filter((s) => s !== skill)
            );
          };

          const submitJob = async (saveAsDraft) => {
            const errors = await validateForm(values);
            if (Object.keys(errors).length) {
              setTouched(
                Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
              );
              toast.error("Please fill in all required fields.");
              return;
            }
            createJobMutation.mutate({ values, saveAsDraft });
          };

          return (
            <Form>
              {createJobMutation.isError && (
                <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
                  {createJobMutation.error?.message || "Failed to publish job. Please try again."}
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
                  <Field id="application-end" name="applicationEnd" type="date" min={todayMinDate()} style={inputStyle} />
                  <FieldError name="applicationEnd" />
                </div>

                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 20, textAlign: "right" }}>
                  "Post Job" goes live automatically in 5 minutes (editable until then). "Save as Draft" keeps it hidden until you publish it yourself.
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                  <button type="button" className="btn-outline-custom" onClick={() => submitJob(true)}>
                    Save as Draft
                  </button>
                  <button type="button" className="btn-primary-custom" onClick={() => submitJob(false)}>
                    <i className="bi bi-send me-2" aria-hidden="true" />Post Job
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