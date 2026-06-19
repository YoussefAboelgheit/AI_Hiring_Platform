import apiClient from "./apiClient";
import { jobs as mockJobs, jobDescriptionBullets } from "../mock/jobs";
import { simulateDelay } from "../mock/utils";

function resolveJobStatus({ status, applicationDeadline }) {
  if (status === "draft" || !applicationDeadline) return status;
  const deadline = new Date(`${applicationDeadline}T23:59:59`);
  if (deadline < new Date()) return "closed";
  return status;
}

function filterJobs(list, filters = {}) {
  const { location = "", roleType = "", expLevel = "" } = filters;
  return list.filter(
    (j) =>
      (!location || j.location.toLowerCase().includes(location.toLowerCase())) &&
      (!roleType || j.type === roleType) &&
      (!expLevel || j.experience === expLevel)
  );
}

export async function getJobs(filters = {}) {
  await simulateDelay();
  // Future: const { data } = await apiClient.get("/jobs", { params: filters });
  void apiClient;
  return filterJobs(mockJobs, filters);
}

export async function getJobById(id) {
  await simulateDelay();
  // Future: const { data } = await apiClient.get(`/jobs/${id}`);
  void apiClient;
  return mockJobs.find((j) => j.id === id) || null;
}

export async function createJob(payload) {
  await simulateDelay();
  const status = resolveJobStatus(payload);
  const job = {
    id: `j${Date.now()}`,
    ...payload,
    status,
    company: "HireAI",
    posted: "Just now",
  };
  mockJobs.unshift(job);
  // Future: const { data } = await apiClient.post("/jobs", job);
  void apiClient;
  return { success: true, id: job.id, status };
}

export async function getJobDescriptionBullets() {
  await simulateDelay(100);
  return jobDescriptionBullets;
}
