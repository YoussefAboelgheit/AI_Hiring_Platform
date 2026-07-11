import apiClient from "./apiClient";
import { getApiErrorMessage } from "./apiErrors";
import {
  myApplications,
  candidateDashboardStats,
  applicationDetailExtras,
} from "../mock/applications";
import { applicationSubmitted } from "../mock/recruiterExtended";
import { simulateDelay } from "../mock/utils";
import { mapApplicationForDetail, mapApplicationForList } from "../utils/applicationMappers";

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;

export function validateCvFile(file) {
  if (!file) return "Please select a CV file.";
  if (file.type !== "application/pdf") return "CV must be a PDF file.";
  if (file.size > MAX_CV_SIZE_BYTES) return "CV must be 5MB or smaller.";
  return null;
}

/**
 * Apply to a job as a candidate.
 * @param {string} jobId
 * @param {{ cvFile?: File }} options - omit cvFile to use the profile CV
 */
export async function applyToJob(jobId, { cvFile } = {}) {
  try {
    if (cvFile) {
      const validationError = validateCvFile(cvFile);
      if (validationError) throw new Error(validationError);

      const formData = new FormData();
      formData.append("CV", cvFile);

      const { data } = await apiClient.post(`/jobs/${jobId}/apply`, formData);
      return data;
    }

    const { data } = await apiClient.post(`/jobs/${jobId}/apply`);
    return data;
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}

/**
 * Fetch the logged-in candidate's job applications.
 * GET /api/jobs/applied/me
 */
export async function getMyApplications() {
  try {
    const { data } = await apiClient.get("/jobs/applied/me");
    return (data.applications ?? []).map(mapApplicationForList);
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}

export async function getApplicationById(id) {
  try {
    const { data } = await apiClient.get(`/jobs/applications/${id}`);
    if (!data.application) return null;
    return mapApplicationForDetail(data.application);
  } catch (error) {
    if (error?.response?.status === 404) return null;
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}

export async function getCandidateDashboardStats() {
  await simulateDelay();
  return candidateDashboardStats;
}

export async function updateApplicationStatus(appId, status) {
  await simulateDelay();
  void appId;
  void status;
  void apiClient;
  return { success: true };
}

export async function getApplicationSubmitted(applicationId) {
  try {
    const application = await getApplicationById(applicationId);
    if (!application) {
      return {
        referenceId: applicationId,
        message: "Your application has been received. You can track its status from My Applications.",
        statusLabel: "Pending review",
        eta: "Recruiters typically respond within 5–7 business days.",
      };
    }

    return {
      referenceId: application.id.slice(-8).toUpperCase(),
      jobId: application.jobId,
      hasAssessment: application.hasAssessment,
      message: `Your application for ${application.jobTitle} at ${application.company} has been submitted successfully.`,
      statusLabel: application.statusLabel,
      eta: "Recruiters typically respond within 5–7 business days.",
    };
  } catch {
    await simulateDelay();
    return applicationSubmitted;
  }
}

// Kept for any legacy imports that still expect mock extras during detail rendering.
export function getApplicationDetailExtras() {
  return applicationDetailExtras;
}

// Legacy mock export retained for tests or gradual migration.
export function getMockApplications() {
  return myApplications;
}