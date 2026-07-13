import apiClient from "./apiClient";
import { getApiErrorMessage } from "./apiErrors";
import { getAssessment } from "./assessmentService";
import {
  recruiterStats,
  recruiterDashboardStats,
  recentApplicationsRecruiter,
  applicantsList,
  candidateReviewDetail,
} from "../mock/recruiter";
import {
  myJobsStats,
  myJobsList,
  assessmentGenerator,
  aiRecommendation,
  emailInvitations,
} from "../mock/recruiterExtended";
import { simulateDelay } from "../mock/utils";

const TOP_CANDIDATES_PER_JOB = 3;
const TOP_CANDIDATES_ALL_JOBS_LIMIT = 10;

// دالة مساعدة لتوحيد حقول الـ Scores
function mapApplicationScores(app, jobTitle) {
  const matchScore = app.matchScore ?? 0;
  return {
    ...app,
    jobTitle: jobTitle ?? app.jobTitle,
    cvScore: app.cvScore ?? matchScore,
    skillMatch: app.skillMatch ?? matchScore,
    // الـ backend بيرجّع حقل اسمه assessmentStatus ("completed" لو خلّص الامتحان).
    // ملاحظة: حاليًا في bug في الـ backend إن الحقل ده بيتحط "completed" غلط من
    // ساعة التقديم على الوظيفة (بدل ما يفضل "pending"/"not_started" لحد ما فعلاً
    // يعمل submit) — تم إبلاغهم بيه، ولحد ما يتصلح هيفضل الفرونت شايف الكانديت
    // إنه "completed" حتى لو معملش حاجة. أول ما الباك يصلّح الـ default، الفرونت
    // هنا هيشتغل صح تلقائيًا من غير أي تعديل تاني.
    assessmentCompleted: app.assessmentStatus === "completed",
    assessmentScore: app.assessmentScore ?? 0,
  };

}

function sortByMatchScore(applications) {
  return [...applications].sort((a, b) => {
    const scoreA = a.matchScore ?? a.cvScore ?? 0;
    const scoreB = b.matchScore ?? b.cvScore ?? 0;
    return scoreB - scoreA;
  });
}

export async function getRecruiterDashboard() {
  let jobs = [];
  try {
    const { data } = await apiClient.get("/jobs/hr/my-jobs/applications");
    jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  } catch (err) {
    console.error("Error fetching HR dashboard data", err);
  }

  const applications = jobs.flatMap((job) =>
    (job.applications || []).map((app) => {
      const nestedJob = app.job && typeof app.job === "object" ? app.job : null;
      return {
        ...app,
        job: {
          ...nestedJob,
          _id: nestedJob?._id || job._id,
          // The application's own nested job object doesn't always include a title
          // (sometimes it's only partially populated), so we fall back to the
          // parent job's title — which we always have here — instead of losing it.
          title: nestedJob?.title || job.title,
        },
      };
    })
  );

  const activeJobsCount = jobs.filter((j) => j.status === "Open").length;

  const stats = {
    activeJobs: activeJobsCount,
    newApplications: applications.length,
    accepted: applications.filter((a) => a.status?.toLowerCase() === "accepted").length,
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

  // Real top matches — highest-scored applicants across all of the recruiter's jobs.
  // (replaces the old hardcoded mock names/scores)
  const topMatches = applications
    .map((app) => ({
      id: app._id,
      name: app.candidate?.name || app.candidate?.username || "Unknown Applicant",
      title: app.job?.title || "Unknown Role",
      avatar: app.candidate?.profile_image || `https://ui-avatars.com/api/?name=${app.candidate?.name?.[0] || "U"}`,
      match: Math.round(app.matchScore ?? app.finalScore ?? app.cvScore ?? 0),
    }))
    .filter((m) => m.match > 0)
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);

  return {
    stats,
    statCards,
    recentApplications,
    topMatches,
  };
}

// جلب كل المتقدمين مع معالجة البيانات وتوحيدها (تحسين الأمان هنا)
export async function getApplicantsList(jobId) {
  try {
    const { data } = await apiClient.get("/jobs/hr/my-jobs/applications");
    const jobs = Array.isArray(data) ? data : data.jobs || [];

    if (jobId) {
      const job = jobs.find((j) => j._id === jobId);
      const applicants = job
        ? job.applications.map((app) => ({...mapApplicationScores(app, job.title), jobId: job._id}))
        : [];

      return {
        applicants,
        jobTitle: job?.title || "Unknown Job",
        total: applicants.length,
      };
    }

    const applicants = jobs.flatMap((job) =>
      (job.applications || []).map((app) => ({...mapApplicationScores(app, job.title), jobId: job._id}))
    );

    return {
      applicants,
      total: applicants.length,
    };
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}

export async function updateJobApplicationStatus(jobId, applicationId, status) {
  try {
    const { data } = await apiClient.patch(`/jobs/${jobId}/applications/${applicationId}/status`, { status });
    return data;
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}

export async function getTopApplicants(jobId) {
  const response = await apiClient.get(`/jobs/${jobId}/applications/top-analysis`);
  return response.data;
}

export async function getTopCandidates(jobId) {
  try {
    if (jobId) {
      const { data } = await apiClient.get(`/jobs/${jobId}/applications/top-analysis`);
      const applicants = (data.applications || []).map((app) =>
        mapApplicationScores(app, data.job?.title)
      );
      return {
        applicants,
        total: applicants.length,
        jobTitle: data.job?.title,
      };
    }

    const { data } = await apiClient.get("/jobs/hr/my-jobs/applications");
    const jobs = Array.isArray(data) ? data : data.jobs || [];

    const applicants = sortByMatchScore(
      jobs.flatMap((job) =>
        sortByMatchScore(job.applications || [])
          .slice(0, TOP_CANDIDATES_PER_JOB)
          .map((app) => ({...mapApplicationScores(app, job.title), jobId: job._id}))
      )
    ).slice(0, TOP_CANDIDATES_ALL_JOBS_LIMIT);

    return { applicants, total: applicants.length };
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}

export function formatTopCandidatesRanking(applicants) {
  const sorted = sortByMatchScore(applicants);

  const toEntry = (app, rank) => {
    const matchScore = app.matchScore ?? app.cvScore ?? 0;
    const finalScore = Math.round(((app.cvScore ?? matchScore) + (app.skillMatch ?? matchScore) + (app.assessmentScore ?? 0)) / 3 * 10) / 10;

    return {
      rank,
      name: app.candidate?.name || "Unknown",
      title: app.jobTitle || app.candidate?.role || "Applicant",
      avatar: app.candidate?.profile_image || `https://ui-avatars.com/api/?name=${app.candidate?.name?.[0] || "U"}`,
      finalScore,
      score: finalScore,
      match: Math.round(matchScore),
      confidence: `High (${Math.round(matchScore)}%)`,
      technical: app.cvScore ?? matchScore,
      cultural: app.assessmentScore ?? Math.round(matchScore * 0.9),
    };
  };

  return {
    podium: sorted.slice(0, 3).map((app, index) => toEntry(app, index + 1)),
    rest: sorted.slice(3, TOP_CANDIDATES_ALL_JOBS_LIMIT).map((app, index) => toEntry(app, index + 4)),
  };
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
    const applicant = applicantsList.find((c) => c.id === id) || applicantsList[0];
    return { ...candidateReviewDetail, applicant };
  }
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

// Mirrors the eligibility rules used in ApplicantsListPage (eligibleApplications +
// sortedApplications): a candidate only counts as a "visible" applicant if they
// uploaded a CV, aren't rejected, and — for jobs that actually require an
// assessment — have completed it. Keeping this in sync means the applicant count
// shown under each job card on My Jobs matches what the recruiter actually sees
// when they open View Applicants for that job.
function isVisibleApplication(app, requiresAssessment) {
  if (!app.CV) return false;
  if (requiresAssessment && app.assessmentStatus !== "completed") return false;
  if ((app.status || "Pending").toLowerCase() === "rejected") return false;
  return true;
}

export async function getMyJobs(recruiterId) {
  const { data } = await apiClient.get("/jobs/hr/my-jobs/applications");
  const jobs = data.jobs || [];

  const activeJobsCount = jobs.filter((j) => j.status === "Open").length;
  const draftJobsCount = jobs.filter((j) => j.status === "Drafted").length;

  const stats = [
    { label: "Active Roles", value: activeJobsCount.toString(), change: "Live listings", icon: "bi-lightning-charge", iconBg: "#f3f5fb", iconColor: "#1d2445" },
    { label: "Drafted Roles", value: draftJobsCount.toString(), change: "Saved as drafts", icon: "bi-file-earmark-text", iconBg: "#F3F4F6", iconColor: "#4B5563" },
    { label: "Total Positions", value: jobs.length.toString(), change: "All time posts", icon: "bi-briefcase", iconBg: "#E0F2FE", iconColor: "#0284C7" },
  ];

  // Find out, per job, whether it actually requires an assessment (type AI/MANUAL,
  // not the default "NONE") — same check ApplicantsListPage does via getAssessment.
  const requiresAssessmentFlags = await Promise.all(
    jobs.map((job) =>
      getAssessment(job._id)
        .then(({ data: res }) => Boolean(res?.assessment?.type && res.assessment.type !== "NONE"))
        .catch(() => false)
    )
  );

  const uiJobs = jobs.map((job, idx) => {
    const status = job.status;
    const requiresAssessment = requiresAssessmentFlags[idx];
    const applications = job.applications || [];
    const visibleApplicantsCount = applications.filter((app) => isVisibleApplication(app, requiresAssessment)).length;

    return {
      id: job._id,
      _id: job._id,
      title: job.title,
      status,
      category: job.category?.name || "Uncategorized",
      location: job.location || "Remote",
      type: job.jobType || "Full Time",
      applicants: visibleApplicantsCount,
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