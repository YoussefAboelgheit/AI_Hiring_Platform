import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getJobById, isJobAvailableForCandidate } from "../../services/jobService";
import { applyToJob, validateCvFile } from "../../services/applicationService";
import { getCandidateProfile } from "../../services/profileService";
import { useAuth } from "../../context/useAuth";
import { queryKeys } from "../../constants/queryKeys";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import BackButton from "../../components/common/BackButton";
import toast from "react-hot-toast";

function normalizeJob(raw) {
  if (!raw) return null;
  return {
    id: raw._id,
    title: raw.title || "Untitled",
    company: raw.recruiter?.name || raw.recruiter?.username || "HireAI Recruiter",
    location: raw.location || "Remote",
    status: raw.status,
    applicationEnd: raw.applicationEnd,
    isAvailable: isJobAvailableForCandidate(raw),
  };
}

export default function ApplyJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [savedCvUrl, setSavedCvUrl] = useState(user?.cv || null);
  const [useSavedCV, setUseSavedCV] = useState(Boolean(user?.cv));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [rawJob, profile] = await Promise.all([
          getJobById(id),
          getCandidateProfile().catch(() => null),
        ]);

        if (cancelled) return;

        const normalizedJob = normalizeJob(rawJob);
        setJob(normalizedJob);

        const profileCv = profile?.cv || user?.cv || null;
        setSavedCvUrl(profileCv);
        if (profileCv) setUseSavedCV(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, user?.cv]);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const validationError = validateCvFile(selectedFile);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setFile(selectedFile);
    setUseSavedCV(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const canSubmit = useSavedCV ? Boolean(savedCvUrl) : Boolean(file);

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error(
        savedCvUrl
          ? "Upload a CV or choose your saved profile CV to proceed."
          : "Upload a CV or add one to your profile before applying."
      );
      return;
    }

    if (!job?.isAvailable) {
      toast.error("This job is no longer accepting applications.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await applyToJob(job.id, useSavedCV ? {} : { cvFile: file });
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications.mine });
      const applicationId = result?.application?._id;

      if (!applicationId) {
        toast.success(result?.message || "Application submitted successfully!");
        navigate("/candidate/applications");
        return;
      }

      navigate(`/candidate/application-submitted?applicationId=${applicationId}`);
    } catch (error) {
      toast.error(error.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading application form..." />;

  if (!job) {
    return (
      <EmptyState
        icon="bi-briefcase"
        title="Job not found"
        description="This job listing may have been removed or is no longer available."
        action={
          <button type="button" className="btn-primary-custom" onClick={() => navigate("/candidate/jobs")}>
            Back to Jobs
          </button>
        }
      />
    );
  }

  if (!job.isAvailable) {
    return (
      <EmptyState
        icon="bi-calendar-x"
        title="Applications closed"
        description="This job is no longer open for applications."
        action={
          <button type="button" className="btn-primary-custom" onClick={() => navigate(`/candidate/jobs/${id}`)}>
            Back to Job
          </button>
        }
      />
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <BackButton fallbackTo={`/candidate/jobs/${id}`} label="Back to Job" />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 24, fontSize: 13, color: "var(--text-muted)" }}>
        <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => navigate("/candidate/jobs")}>Jobs</span>
        <i className="bi bi-chevron-right" aria-hidden="true" />
        <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => navigate(`/candidate/jobs/${id}`)}>{job.title}</span>
        <i className="bi bi-chevron-right" aria-hidden="true" />
        <span>Apply</span>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Apply to {job.title}</h1>
      <div style={{ color: "var(--text-muted)", marginBottom: 28 }}>{job.company} · {job.location}</div>

      <div className="hcard" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Your CV</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: savedCvUrl ? "pointer" : "not-allowed", fontWeight: 600, color: savedCvUrl ? "var(--primary)" : "var(--text-muted)" }}>
            <input
              type="checkbox"
              checked={useSavedCV}
              disabled={!savedCvUrl}
              onChange={(e) => {
                setUseSavedCV(e.target.checked);
                if (e.target.checked) setFile(null);
              }}
              style={{ width: 16, height: 16, cursor: savedCvUrl ? "pointer" : "not-allowed" }}
            />
            Use my saved profile CV
          </label>
        </div>

        {savedCvUrl ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
            A CV is saved on your profile. You can apply with it or upload a different PDF for this application.
          </p>
        ) : (
          <div style={{ background: "#FEF3C7", color: "#92400E", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 20 }}>
            No CV found on your profile. Upload a PDF below or{" "}
            <button
              type="button"
              className="btn btn-link p-0 align-baseline"
              style={{ color: "#92400E", fontWeight: 700 }}
              onClick={() => navigate("/candidate/profile/complete")}
            >
              add one to your profile
            </button>
            .
          </div>
        )}

        {useSavedCV && savedCvUrl ? (
          <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "20px", background: "var(--body-bg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <i className="bi bi-file-earmark-pdf-fill" style={{ fontSize: 32, color: "#EF4444" }} aria-hidden="true" />
              <div>
                <div style={{ fontWeight: 700 }}>Saved profile CV</div>
                <a href={savedCvUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                  Preview CV
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("cv-input")?.click()}
            style={{
              border: `2px dashed ${dragging ? "var(--primary)" : "var(--border)"}`,
              borderRadius: 14,
              padding: "48px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: dragging ? "var(--primary-bg)" : "var(--body-bg)",
              transition: "all 0.2s",
            }}
          >
            {file ? (
              <>
                <i className="bi bi-file-earmark-pdf-fill" style={{ fontSize: 40, color: "#EF4444", display: "block", marginBottom: 10 }} aria-hidden="true" />
                <div style={{ fontWeight: 700 }}>{file.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{(file.size / 1024).toFixed(1)} KB</div>
              </>
            ) : (
              <>
                <i className="bi bi-cloud-arrow-up" style={{ fontSize: 40, color: "var(--primary)", display: "block", marginBottom: 10 }} aria-hidden="true" />
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Drag & drop your CV here</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  or <span style={{ color: "var(--primary)", fontWeight: 600 }}>browse files</span> · PDF only · Max 5MB
                </div>
              </>
            )}
            <input
              id="cv-input"
              type="file"
              accept="application/pdf,.pdf"
              style={{ display: "none" }}
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" className="btn-outline-custom" style={{ flex: 1 }} onClick={() => navigate(`/candidate/jobs/${id}`)}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-primary-custom"
          style={{ flex: 2 }}
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Submitting...
            </>
          ) : (
            <>
              <i className="bi bi-send me-2" aria-hidden="true" />
              Submit Application
            </>
          )}
        </button>
      </div>
    </div>
  );
}
