import apiClient from "./apiClient";
import { getApiErrorMessage } from "./apiErrors";
import { jobs as mockJobs, jobDescriptionBullets } from "../mock/jobs";
import { simulateDelay } from "../mock/utils";

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

export async function createJob(form) {
  try {
    const payload = mapFormToJobPayload(form);
    const { data } = await apiClient.post("/jobs", payload);
    return data;
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}

export async function getJobDescriptionBullets() {
  await simulateDelay(100);
  return jobDescriptionBullets;
}
