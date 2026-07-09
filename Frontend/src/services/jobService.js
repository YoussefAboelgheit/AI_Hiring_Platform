import apiClient from "./apiClient";
import { getApiErrorMessage } from "./apiErrors";
import { CANDIDATE_JOBS_PAGE_SIZE } from "../constants/jobEnums";
import { getAdminAccessToken } from "./storage/adminStorage";
function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null)
  );
}
export function isJobAvailableForCandidate(job) {
  if (job.status !== "Open") return false;
  if (!job.applicationEnd) return true;
  return new Date(job.applicationEnd) >= new Date();
}
function mapFormToJobPayload(form) {
  const payload = {
    category: form.category,
    title: form.title.trim(),
    description: form.description.trim(),
    workplace: form.workplace,
    jobType: form.jobType,
    skills: form.skills,
    requirements: form.requirements?.trim() ?? "",
    location: form.location?.trim() ?? "",
  };
  if (form.applicationEnd) {
    payload.applicationEnd = form.applicationEnd;
  }
  return payload;
}
export async function getJobs(filters = {}) {
  const { data } = await apiClient.get("/jobs", { params: filters });
  return data.jobs || [];
}
export async function getCandidateJobs(params = {}) {
  try {
    const limit = Math.min(params.limit ?? CANDIDATE_JOBS_PAGE_SIZE, 50);
    const query = cleanParams({
      page: params.page ?? 1,
      limit,
      sort: params.sort ?? "-createdAt",
      status: params.status ?? "Open",
      search: params.search,
      workplace: params.workplace,
      jobType: params.jobType,
      location: params.location,
      category: params.category,
    });
    const { data } = await apiClient.get("/jobs", { params: query });
    const rawJobs = data.jobs ?? [];
    const jobs = rawJobs.filter(isJobAvailableForCandidate);
    return {
      jobs,
      page: query.page,
      limit,
      hasMore: rawJobs.length === limit,
    };
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}
export async function getJobById(id) {
  const { data } = await apiClient.get(`/jobs/${id}`);
  return data.job || null;
}

/** Toggle save/unsave for a job (candidate). Backend flips the state each call. */
export async function toggleSaveJob(jobId) {
  const { data } = await apiClient.post(`/jobs/${jobId}/save`);
  return data;
}

/** Get all jobs the current candidate has saved. */
export async function getSavedJobs() {
  const { data } = await apiClient.get(`/jobs/saved/me`);
  return Array.isArray(data?.data) ? data.data : [];
}

/**
 * A "saved job" entry from the backend can come in a few shapes:
 * - the job document itself ({ _id, title, ... })
 * - a wrapper with a populated job ({ job: { _id, title, ... } })
 * - a wrapper with just the job id ({ job: "648f..." })
 * This normalizes all of them down to a plain job id string.
 */
export function extractSavedJobId(entry) {
  if (!entry) return null;
  if (typeof entry.job === "string") return entry.job;
  if (entry.job && typeof entry.job === "object") return entry.job._id || entry.job.id || null;
  return entry._id || entry.id || null;
}

export async function createJob(form, saveAsDraft = false) {
  try {
    const payload = mapFormToJobPayload(form);
    if (saveAsDraft) {
      payload.saveAsDraft = true;
    }
    const { data } = await apiClient.post("/jobs", payload);
    return data.job ?? data;
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}
export async function updateJob(id, payload) {
  const adminToken = getAdminAccessToken();
  const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
  const { data } = await apiClient.patch(`/jobs/${id}`, payload, { headers });
  return data.job;
}
// Drafted -> Open only. Not allowed from Closed, and Open can never go back to Drafted.
export async function openJob(id) {
  return updateJob(id, { status: "Open" });
}
// Open -> Closed only. Closed is final; it can't be reopened or reverted.
export async function closeJob(id) {
  return updateJob(id, { status: "Closed" });
}
export async function deleteJob(id) {
  const adminToken = getAdminAccessToken();
  const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
  const { data } = await apiClient.delete(`/jobs/${id}`, { headers });
}
export async function getJobDescriptionBullets() {
  return [
    "Design and develop responsive, robust web applications using modern frameworks.",
    "Collaborate with product, design, and backend teams to define feature requirements.",
    "Optimize code and resources for maximum performance, scalability, and speed.",
    "Write clean, well-documented, and testable code with high quality standards."
  ];
}