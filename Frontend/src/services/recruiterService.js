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

function getCategoryIcon(categoryName = "") {
  const name = categoryName.toLowerCase();
  if (name.includes("engineer") || name.includes("tech") || name.includes("code") || name.includes("software") || name.includes("data")) {
    return "bi-code-slash";
  }
  if (name.includes("design") || name.includes("ui") || name.includes("ux") || name.includes("creative")) {
    return "bi-pencil";
  }
  if (name.includes("market") || name.includes("sale") || name.includes("pr") || name.includes("advert")) {
    return "bi-megaphone";
  }
  if (name.includes("finance") || name.includes("account") || name.includes("bank") || name.includes("tax")) {
    return "bi-cash-coin";
  }
  return "bi-briefcase";
}

export async function getMyJobs(recruiterId) {
  const { data } = await apiClient.get("/jobs", { params: { recruiter: recruiterId } });
  const jobs = data.jobs || [];

  const activeJobsCount = jobs.filter((j) => j.status === "Open").length;
  const draftJobsCount = jobs.filter((j) => j.status === "Drafted").length;

  const stats = [
    { label: "Active Roles", value: activeJobsCount.toString(), change: "Live listings", icon: "bi-lightning-charge", iconBg: "#EDE9FE", iconColor: "#7C3AED" },
    { label: "Drafted Roles", value: draftJobsCount.toString(), change: "Saved as drafts", icon: "bi-file-earmark-text", iconBg: "#F3F4F6", iconColor: "#4B5563" },
    { label: "Total Positions", value: jobs.length.toString(), change: "All time posts", icon: "bi-briefcase", iconBg: "#E0F2FE", iconColor: "#0284C7" },
    { label: "Pending Interviews", value: "3", change: "Scheduled this week", icon: "bi-calendar-check", iconBg: "#F5F0FF", iconColor: "#7C3AED", highlight: true },
  ];

  const uiJobs = jobs.map((job) => {
    let status = "draft";
    if (job.status === "Open") status = "active";
    else if (job.status === "Closed") status = "closed";

    return {
      id: job._id,
      _id: job._id,
      title: job.title,
      status,
      category: job.category?.name || "Uncategorized",
      location: job.location || "Remote",
      type: job.jobType || "Full Time",
      applicants: 12,
      aiMatches: 4,
      icon: getCategoryIcon(job.category?.name),
    };
  });

  return { stats, jobs: uiJobs };
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
