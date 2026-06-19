import apiClient from "./apiClient";
import {
  recruiterStats,
  recruiterDashboardStats,
  recentApplicationsRecruiter,
  topAIMatches,
  applicantsList,
  candidateReviewDetail,
  topCandidates,
  monthlyGoal,
  aiInsightDashboard,
} from "../mock/recruiter";
import {
  myJobsStats,
  myJobsList,
  assessmentGenerator,
  aiRecommendation,
  emailInvitations,
} from "../mock/recruiterExtended";
import { simulateDelay } from "../mock/utils";

export async function getRecruiterDashboard() {
  await simulateDelay();
  // Future: const { data } = await apiClient.get("/recruiter/dashboard");
  void apiClient;
  return {
    stats: recruiterStats,
    statCards: recruiterDashboardStats,
    recentApplications: recentApplicationsRecruiter,
    topMatches: topAIMatches,
    monthlyGoal,
    aiInsight: aiInsightDashboard,
  };
}

export async function getApplicantsList(jobTitle) {
  await simulateDelay();
  // Future: const { data } = await apiClient.get("/recruiter/applications", { params: { jobTitle } });
  void jobTitle;
  void apiClient;
  return { applicants: applicantsList, jobTitle: "Senior Product Designer", total: 128 };
}

export async function getCandidateReview(id) {
  await simulateDelay();
  // Future: const { data } = await apiClient.get(`/recruiter/candidates/${id}`);
  void apiClient;
  const applicant = applicantsList.find((c) => c.id === id) || applicantsList[0];
  return { ...candidateReviewDetail, applicant };
}

export async function getTopCandidates() {
  await simulateDelay();
  return topCandidates;
}

export async function getJobApplicants(jobId) {
  await simulateDelay();
  // Future: const { data } = await apiClient.get(`/recruiter/jobs/${jobId}/applicants`);
  void jobId;
  void apiClient;
  return applicantsList;
}

export async function getMyJobs() {
  await simulateDelay();
  void apiClient;
  return { stats: myJobsStats, jobs: myJobsList };
}

export async function getAssessmentGenerator() {
  await simulateDelay();
  void apiClient;
  return assessmentGenerator;
}

export async function saveAssessmentGenerator(data) {
  await simulateDelay(500);
  void data;
  void apiClient;
  return { success: true };
}

export async function getAIRecommendation(candidateId) {
  await simulateDelay();
  void candidateId;
  void apiClient;
  return aiRecommendation;
}

export async function getEmailInvitations() {
  await simulateDelay();
  void apiClient;
  return emailInvitations;
}

export async function sendEmailInvitations(data) {
  await simulateDelay(500);
  void data;
  void apiClient;
  return { success: true };
}
