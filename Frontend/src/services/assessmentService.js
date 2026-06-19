import apiClient from "./apiClient";
import { assessmentData } from "../mock/assessments";
import { simulateDelay } from "../mock/utils";

export async function getAssessmentById(id) {
  await simulateDelay();
  // Future: const { data } = await apiClient.get(`/assessments/${id}`);
  void id;
  void apiClient;
  return assessmentData;
}

export async function submitAssessment(id, answers) {
  await simulateDelay(500);
  // Future: const { data } = await apiClient.post(`/assessments/${id}/submit`, { answers });
  void id;
  void answers;
  void apiClient;
  return { success: true, applicationId: "a1" };
}
