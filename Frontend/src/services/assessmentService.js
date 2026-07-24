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

export const updateQuestion = (questionId, question) =>
  apiClient.put(`/jobs/assessment/questions/${questionId}`, question);

export const deleteQuestion = (questionId) =>
  apiClient.delete(`/jobs/assessment/questions/${questionId}`);

export const regenerateQuestion = (questionId) =>
  apiClient.post(`/jobs/assessment/questions/${questionId}/regenerate`);

export const startAssessment = (jobId) =>
  apiClient.post(`/jobs/${jobId}/assessment/start`);

// POST /api/jobs/{jobId}/assessment/answers
// Save a single answer to the database (called by debounced auto-save)
export const saveAnswer = (jobId, questionId, selectedAnswer) =>
  apiClient.post(`/jobs/${jobId}/assessment/answers`, { questionId, selectedAnswer });

// POST /api/jobs/{jobId}/assessment/submit
// No body needed — backend reads saved answers from DB
export const submitCandidateAssessment = (jobId) =>
  apiClient.post(`/jobs/${jobId}/assessment/submit`);