import apiClient from "./apiClient";

export async function getJobs(filters = {}) {
  const { data } = await apiClient.get("/jobs", { params: filters });
  return data.jobs || [];
}

export async function getJobById(id) {
  const { data } = await apiClient.get(`/jobs/${id}`);
  return data.job || null;
}

export async function createJob(payload) {
  const { data } = await apiClient.post("/jobs", payload);
  return data.job;
}

export async function updateJob(id, payload) {
  const { data } = await apiClient.patch(`/jobs/${id}`, payload);
  return data.job;
}

export async function deleteJob(id) {
  const { data } = await apiClient.delete(`/jobs/${id}`);
  return data;
}

export async function getJobDescriptionBullets() {
  return [
    "Design and develop responsive, robust web applications using modern frameworks.",
    "Collaborate with product, design, and backend teams to define feature requirements.",
    "Optimize code and resources for maximum performance, scalability, and speed.",
    "Write clean, well-documented, and testable code with high quality standards."
  ];
}

