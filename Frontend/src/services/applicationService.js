import apiClient from "./apiClient";
import {
  myApplications,
  candidateDashboardStats,
  applicationDetailExtras,
} from "../mock/applications";
import { applicationSubmitted } from "../mock/recruiterExtended";
import { simulateDelay } from "../mock/utils";

export async function getMyApplications() {
  await simulateDelay();
  // Future: const { data } = await apiClient.get("/applications/my");
  void apiClient;
  return myApplications;
}

export async function getApplicationById(id) {
  await simulateDelay();
  // Future: const { data } = await apiClient.get(`/applications/${id}`);
  void apiClient;
  const app = myApplications.find((a) => a.id === id);
  if (!app) return null;
  return { ...app, ...applicationDetailExtras };
}

export async function applyToJob(jobId, formData) {
  const { data } = await apiClient.post(`/jobs/${jobId}/apply`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getCandidateDashboardStats() {
  await simulateDelay();
  return candidateDashboardStats;
}

export async function updateApplicationStatus(appId, status) {
  await simulateDelay();
  // Future: const { data } = await apiClient.patch(`/applications/${appId}/status`, { status });
  void appId;
  void status;
  void apiClient;
  return { success: true };
}

export async function getApplicationSubmitted(applicationId) {
  await simulateDelay();
  void applicationId;
  void apiClient;
  return applicationSubmitted;
}
