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
  let jobs = [];
  try {
    const { data } = await apiClient.get("/jobs/hr/my-jobs/applications");
    jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  } catch (err) {
    console.error("Error fetching HR dashboard data", err);
  }

  // الـ backend بيرجع { totalJobs, totalApplications, jobs: [ { ..., applications: [...] } ] }
  // يعني الـ applications مش على المستوى الأول، هي جوة كل job.
  // فبنعمل flatten لكل الـ applications من جميع الـ jobs، ولو app.job مجرد ID نصي
  // (مش object) بنلصق بيانات الـ job الأصلي بدالها عشان نقدر نعرض العنوان لاحقًا.
  const applications = jobs.flatMap((job) =>
    (job.applications || []).map((app) => ({
      ...app,
      job:
        app.job && typeof app.job === "object"
          ? app.job
          : { _id: job._id, title: job.title },
    }))
  );

  const activeJobsCount = jobs.filter((j) => j.status === "Open").length;

  const stats = {
    activeJobs: activeJobsCount,
    newApplications: applications.length,
    shortlisted: applications.filter((a) => a.status?.toLowerCase() === "shortlisted").length,
    assessmentsPending: applications.filter(
      (a) => a.status?.toLowerCase() === "interviewing" || a.status?.toLowerCase() === "pending"
    ).length,
  };

  const statCards = [
    { key: "activeJobs", label: "Total Active Jobs", icon: "bi-briefcase", iconBg: "#E0E7FF", iconColor: "#4F46E5", change: "Active", negative: false },
    { key: "newApplications", label: "Total Applications", icon: "bi-file-earmark-person", iconBg: "#FCE7F3", iconColor: "#DB2777", change: "All time", negative: false },
    { key: "shortlisted", label: "Shortlisted Candidates", icon: "bi-people", iconBg: "#D1FAE5", iconColor: "#059669", change: "Pipeline", negative: false },
    { key: "assessmentsPending", label: "In Review", icon: "bi-clipboard-check", iconBg: "#FEF3C7", iconColor: "#D97706", change: "Action required", negative: true },
  ];

  const recentApplications = applications
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 50)
    .map((app) => ({
      candidate: app.candidate?.name || app.candidate?.username || "Unknown Applicant",
      email: app.candidate?.email || "No email",
      profile_image: app.candidate?.profile_image || `https://ui-avatars.com/api/?name=${app.candidate?.name?.[0] || "U"}`,
      jobRole: app.job?.title || "Unknown Role",
      appliedAt: new Date(app.createdAt || Date.now()).toLocaleDateString(),
      status: app.status || "pending",
    }));

  return {
    stats,
    statCards,
    recentApplications,
    topMatches: topAIMatches, // Fallback to mock as AI matches might not be provided directly here
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

export async function getJobApplicationByIDForHR(id) {
  const { data } = await apiClient.get(`/jobs/${id}/applications`);
  return data;
}

export async function getCandidateReview(id) {
  try {
    const { data } = await apiClient.get(`/jobs/${id}/applications`);
    const app = data.application || data;
    
    return {
      applicant: {
        id: app._id,
        name: app.candidate?.name || app.candidate?.username || "Unknown",
        email: app.candidate?.email || "",
        avatar: app.candidate?.avatar || `https://ui-avatars.com/api/?name=${app.candidate?.name?.[0] || 'U'}`,
        status: app.status || "pending",
      },
      name: app.candidate?.name || "Unknown Candidate",
      title: app.candidate?.title || "Professional",
      location: app.candidate?.location || "Remote",
      tags: app.candidate?.skills?.slice(0, 3) || ["Applicant"],
      cvSummary: app.coverLetter || "No summary or cover letter provided.",
      cvUrl: app.CV || app.cvUrl || null,
      skills: app.candidate?.skills || [],
      education: Array.isArray(app.candidate?.education) ? app.candidate.education.map(e => {
        if (Array.isArray(e)) return e;
        if (typeof e === 'object') return [e.degree || e.title || "Degree", e.school || e.institution || "Institution"];
        return [String(e), "Unknown"];
      }) : [],
      projects: [],
      certifications: [],
      aiMatchScore: 85,
      cvScore: 80,
      assessmentScore: 75,
      aiInsight: "Candidate profile fetched successfully.",
    };
  } catch (err) {
    console.error("Error fetching candidate review", err);
    // Fallback if needed, though usually we'd let it throw
    const applicant = applicantsList.find((c) => c.id === id) || applicantsList[0];
    return { ...candidateReviewDetail, applicant };
  }
}

export async function getTopCandidates() {
  await simulateDelay();
  return topCandidates;
}

export async function getJobApplicants(jobId) {
  const { data } = await apiClient.get(`/jobs/${jobId}/applications`);
  const applications = data.applications || [];
  
  return applications.map((app) => ({
    id: app._id,
    name: app.candidate?.name || "Unknown",
    avatar: app.candidate?.avatar || `https://ui-avatars.com/api/?name=${app.candidate?.name?.[0] || 'U'}`,
    status: app.status,
    appliedDate: new Date(app.createdAt).toLocaleDateString(),
    matchScore: app.matchScore || 0,
  }));
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
  const { data } = await apiClient.get("/jobs/hr/my-jobs/applications");
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
    // Preserve original status value (Open, Closed, Drafted)
    const status = job.status;
    return {
      id: job._id,
      _id: job._id,
      title: job.title,
      status,
      category: job.category?.name || "Uncategorized",
      location: job.location || "Remote",
      type: job.jobType || "Full Time",
      applicants: job.applications?.length || job.applicantsCount || 0,
      aiMatches: job.aiMatchesCount || 0,
      icon: getCategoryIcon(job.category?.name),
      applicationEnd: job.applicationEnd,
      createdAt: job.createdAt,
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