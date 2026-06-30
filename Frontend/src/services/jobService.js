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
    status: form.status || "Drafted",
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

export async function createJob(form) {
  try {
    const payload = mapFormToJobPayload(form);
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
