import apiClient from "./apiClient";
import { feedbackReport, recruiterFeedbackReport } from "../mock/feedback";
import { simulateDelay } from "../mock/utils";

export async function getCandidateFeedbackReport(applicationId) {
  await simulateDelay();
  // Future: const { data } = await apiClient.get(`/feedback/${applicationId}`);
  void applicationId;
  void apiClient;
  return feedbackReport;
}

export async function getRecruiterFeedbackReport(candidateId) {
  await simulateDelay();
  // Future: const { data } = await apiClient.get(`/feedback/recruiter/${candidateId}`);
  void candidateId;
  void apiClient;
  return recruiterFeedbackReport;
}

// Real AI analysis for one candidate's application, straight from the backend.
// GET /jobs/:jobId/applications/:applicationId/analysis
export async function getCandidateAIAnalysis(jobId, applicationId) {
  const { data } = await apiClient.get(`/jobs/${jobId}/applications/${applicationId}/analysis`);
  return data;
}