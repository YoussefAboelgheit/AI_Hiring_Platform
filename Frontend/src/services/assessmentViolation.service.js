import apiClient from "./apiClient";

export const reportViolation = (jobId, type) =>
  apiClient.post(`/jobs/${jobId}/assessment/violations`, { type });

export const getJobViolations = (jobId) =>
  apiClient.get(`/jobs/${jobId}/assessment/violations`);
