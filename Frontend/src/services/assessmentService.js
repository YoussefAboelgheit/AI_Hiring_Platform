// src/services/assessmentService.js

import apiClient from "./apiClient";

// GET /api/jobs/{jobId}/assessment
export const getAssessment = (jobId) => apiClient.get(`/jobs/${jobId}/assessment`);

// POST /api/jobs/{jobId}/assessment/generate
export const generateAssessment = (jobId, payload) =>
  apiClient.post(`/jobs/${jobId}/assessment/generate`, payload);

// PATCH /api/jobs/{jobId}/assessment (update settings)
export const updateAssessmentSettings = (jobId, payload) =>
  apiClient.patch(`/jobs/${jobId}/assessment`, payload);

// POST /api/jobs/{jobId}/assessment/regenerate
export const regenerateAssessment = (jobId) =>
  apiClient.post(`/jobs/${jobId}/assessment/regenerate`);

// POST /api/jobs/{jobId}/assessment/questions (add manual question)
export const addManualQuestion = (jobId, question) =>
  apiClient.post(`/jobs/${jobId}/assessment/questions`, question);

// PUT /api/jobs/assessment/questions/{questionId} (update question)
export const updateQuestion = (questionId, question) =>
  apiClient.put(`/jobs/assessment/questions/${questionId}`, question);

// DELETE /api/jobs/assessment/questions/{questionId}
export const deleteQuestion = (questionId) =>
  apiClient.delete(`/jobs/assessment/questions/${questionId}`);

// POST /api/jobs/assessment/questions/{questionId}/regenerate
export const regenerateQuestion = (questionId) =>
  apiClient.post(`/jobs/assessment/questions/${questionId}/regenerate`);

// ===== Candidate-facing endpoints =====

// POST /api/jobs/{jobId}/assessment/start
// Job must be Open and assessment Locked. Randomly selects questionCount questions.
// Returns questions WITHOUT correctAnswer. Resumes existing session if already started.
export const startAssessment = (jobId) =>
  apiClient.post(`/jobs/${jobId}/assessment/start`);

// POST /api/jobs/{jobId}/assessment/submit
// answers: [{ questionId, selectedAnswer }]
export const submitCandidateAssessment = (jobId, answers) =>
  apiClient.post(`/jobs/${jobId}/assessment/submit`, { answers });

// Candidate Mock Functions
import { assessmentData } from "../mock/assessments";
import { simulateDelay } from "../mock/utils";

export async function getAssessmentById(id) {
  await simulateDelay();
  void id;
  return assessmentData;
}

export async function submitAssessment(id, answers) {
  await simulateDelay(500);
  void id;
  void answers;
  return { success: true, applicationId: "a1" };
}