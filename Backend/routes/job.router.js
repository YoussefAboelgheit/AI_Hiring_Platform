import { Router } from "express";

import {
  updateApplicationStatus,   //Hr
  toggleSaveJob, //candidate
  getMySavedJobs,//candidate
  applyToJob,
  analyzeJobApplicationForHr,
  analyzeTopJobCandidates,
  createJob,
  deleteJob,
  getAllJobs,
  getJobById,
  getJobApplicationsForHr,
  getJobsByCategory,
  getMyJobsWithApplications,
  getMyApplicationById,
  getMyAppliedJobs,
  getJobEnrichment,
  retryMyApplicationMatch,
  getCandidateFeedbackReport,
  updateJob,
  adminUpdateJobStatus,
  adminDeleteJob,
} from "../controllers/job.controller.js";
import {
  generateAssessment,
  getAssessment,
  updateQuestion,
  deleteQuestion,
  regenerateQuestion,
  regenerateRepository,
  startAssessment,
  submitAssessment,
  updateAssessmentSettings,
  addManualQuestion,
  saveAnswer,
} from "../controllers/assessment.controller.js";
import authMW from "../middlewares/authMW.js";
import { authorize } from "../middlewares/authorizeMW.js";
import jobOwnershipMW from "../middlewares/jobOwnershipMW.js";
import jobOwnershipByJobIdMW from "../middlewares/jobOwnershipByJobIdMW.js";
import optionalAuthMW from "../middlewares/optionalAuthMW.js";
import { uploadCV } from "../middlewares/uploadMW.js";
import {
  idParamValidator,
  jobApplicationParamsValidator,
  applicationIdParamValidator,
} from "../validations/paramValidators.js";
import {
  updateApplicationStatusValidator, //hr
  applyToJobValidator,
  categoryNameParamValidator,
  createJobValidator,
  updateJobValidator,
  updateJobStatusValidator,
} from "../validations/jobValidators.js";
import {
  jobIdParamValidator,
  questionIdParamValidator,
  generateAssessmentValidator,
  updateQuestionValidator,
  submitAnswerValidator,
  updateAssessmentSettingsValidator,
  addQuestionValidator,
  saveAnswerValidator,
} from "../validations/assessmentValidators.js";
import validateResults from "../validations/validateResults.js";
import Assessment from "../models/assessment.js";
import CandidateAssessment from "../models/candidateAssessment.js";
import JobApplication from "../models/jobApplication.js";
import Job from "../models/job.js";
import { gradeAssessment } from "../services/ai/assessment/assessment.service.js";
import { sendEmail } from "../util/sendEmail.js";


const router = Router();


// admin 
router.patch(
  "/admin/:id/status",
  authMW,
  authorize("admin"),
  idParamValidator,
  updateJobStatusValidator,
  validateResults,
  adminUpdateJobStatus
);

router.delete(
  "/admin/:id",
  authMW,
  authorize("admin"),
  idParamValidator,
  validateResults,
  adminDeleteJob
);
//////////

// HR يقبل أو يرفض candidate
router.patch(
  "/:jobId/applications/:applicationId/status",
  authMW,
  authorize("hr","admin"),
  jobApplicationParamsValidator,
  updateApplicationStatusValidator,
  validateResults,
  updateApplicationStatus
);

// ── Saved Jobs Features (Candidate) ──


router.get(
  "/saved/me",
  authMW,
  authorize("candidate"),
  getMySavedJobs
);

//  زرار الحفظ أو إلغاء الحفظ
router.post(
  "/:jobId/save",
  authMW,
  authorize("candidate"),
  toggleSaveJob
);


//hr

router.get("/", optionalAuthMW, getAllJobs);
router.get("/category/:category", optionalAuthMW, categoryNameParamValidator, validateResults, getJobsByCategory);
router.get("/applied/me", authMW, authorize("candidate"), getMyAppliedJobs);
router.get(
  "/hr/my-jobs/applications",
  authMW,
  authorize("hr"),
  getMyJobsWithApplications
);
router.get(
  "/applications/:id",
  authMW,
  authorize("candidate"),
  idParamValidator,
  validateResults,
  getMyApplicationById
);
router.post(
  "/applications/:id/retry",
  authMW,
  authorize("candidate"),
  uploadCV,
  idParamValidator,
  validateResults,
  retryMyApplicationMatch
);
router.get(
  "/applications/:applicationId/feedback",
  authMW,
  authorize("candidate"),
  applicationIdParamValidator,
  validateResults,
  getCandidateFeedbackReport
);
router.get(
  "/:jobId/applications/:applicationId/analysis",
  authMW,
  authorize("hr", "admin"),
  jobApplicationParamsValidator,
  validateResults,
  analyzeJobApplicationForHr
);
router.get(
  "/:id/applications",
  authMW,
  authorize("hr"),
  idParamValidator,
  validateResults,
  getJobApplicationsForHr
);
router.get(
  "/:id/applications/top-analysis",
  authMW,
  authorize("hr", "admin"),
  idParamValidator,
  validateResults,
  analyzeTopJobCandidates
);
router.post(
  "/:id/apply",
  authMW,
  authorize("candidate"),
  uploadCV,
  idParamValidator,
  applyToJobValidator,
  validateResults,
  applyToJob
);
router.get("/:id/enrichment", optionalAuthMW, idParamValidator, validateResults, getJobEnrichment);
router.get("/:id", optionalAuthMW, idParamValidator, validateResults, getJobById);

router.post("/", authMW, authorize("hr"), createJobValidator, validateResults, createJob);
router.patch(
  "/:id",
  authMW,
  authorize("hr"),
  idParamValidator,
  updateJobValidator,
  validateResults,
  jobOwnershipMW,
  updateJob
);
router.delete(
  "/:id",
  authMW,
  authorize("hr", "admin"),
  idParamValidator,
  validateResults,
  jobOwnershipMW,
  deleteJob
);

// ── Assessment Management (HR) ──

router.post(
  "/:jobId/assessment/generate",
  authMW,
  authorize("hr"),
  jobIdParamValidator,
  generateAssessmentValidator,
  validateResults,
  jobOwnershipByJobIdMW,
  generateAssessment,
);

router.get(
  "/:jobId/assessment",
  authMW,
  authorize("hr", "admin", "candidate"),
  jobIdParamValidator,
  validateResults,
  getAssessment,
);

router.post(
  "/:jobId/assessment/regenerate",
  authMW,
  authorize("hr"),
  jobIdParamValidator,
  validateResults,
  jobOwnershipByJobIdMW,
  regenerateRepository,
);

// ── Question Management (HR) ──

router.put(
  "/assessment/questions/:questionId",
  authMW,
  authorize("hr"),
  questionIdParamValidator,
  updateQuestionValidator,
  validateResults,
  updateQuestion,
);

router.delete(
  "/assessment/questions/:questionId",
  authMW,
  authorize("hr"),
  questionIdParamValidator,
  validateResults,
  deleteQuestion,
);

router.post(
  "/assessment/questions/:questionId/regenerate",
  authMW,
  authorize("hr"),
  questionIdParamValidator,
  validateResults,
  regenerateQuestion,
);

// ── Candidate Assessment Flow ──

router.post(
  "/:jobId/assessment/start",
  authMW,
  authorize("candidate"),
  jobIdParamValidator,
  validateResults,
  startAssessment,
);

router.post(
  "/:jobId/assessment/answers",
  authMW,
  authorize("candidate"),
  jobIdParamValidator,
  saveAnswerValidator,
  validateResults,
  saveAnswer,
);

router.post(
  "/:jobId/assessment/submit",
  authMW,
  authorize("candidate"),
  jobIdParamValidator,
  validateResults,
  submitAssessment,
);

// ── Assessment Settings & Manual Questions (HR) ──

router.patch(
  "/:jobId/assessment",
  authMW,
  authorize("hr"),
  jobIdParamValidator,
  updateAssessmentSettingsValidator,
  validateResults,
  jobOwnershipByJobIdMW,
  updateAssessmentSettings,
);

router.post(
  "/:jobId/assessment/questions",
  authMW,
  authorize("hr"),
  jobIdParamValidator,
  addQuestionValidator,
  validateResults,
  jobOwnershipByJobIdMW,
  addManualQuestion,
);

// ── Background Worker: auto-reject applications past the 3-day assessment deadline ──

const autoRejectExpiredAssessmentApplications = async () => {
  try {
    const expiredApps = await JobApplication.find({
      status: "Pending",
      assessmentStatus: { $in: ["not_started", "pending"] },
      assessmentDeadline: { $lte: new Date() },
    }).populate({
      path: "candidate",
      select: "name email",
    }).populate({
      path: "job",
      select: "title",
    });

    for (const app of expiredApps) {
      app.status = "Rejected";
      await app.save();

      try {
        await sendEmail({
          to: app.candidate.email,
          subject: `Update on your application for "${app.job.title}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Dear ${app.candidate.name},</h2>
              <p>Thank you for your interest in the <strong>${app.job.title}</strong> position.</p>
              <p>Unfortunately, your application has been automatically rejected because 
                 the required assessment was not completed within the 3-day period.</p>
              <p>We encourage you to apply for future positions that match your profile.</p>
              <br/>
              <p>We wish you all the best in your job search.</p>
              <p><strong>AI Hiring Platform Team</strong></p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send assessment expiry email:", emailErr.message);
      }
    }
  } catch (err) {
    console.error("Assessment auto-reject worker failed:", err?.message || err);
  }
};

setInterval(autoRejectExpiredAssessmentApplications, 60 * 1000);

// ── Background Worker: lock assessments when jobs expire ──

const lockExpiredAssessments = async () => {
  try {
    const assessments = await Assessment.find({ status: "Drafted" }).populate({
      path: "job",
      select: "status editableUntil",
    });

    const toLock = assessments.filter(
      (a) => a.job && (a.job.status !== "Drafted" || (a.job.editableUntil && new Date() > a.job.editableUntil)),
    );

    if (toLock.length > 0) {
      await Assessment.updateMany(
        { _id: { $in: toLock.map((a) => a._id) } },
        { status: "Locked" },
      );
    }
  } catch (err) {
    console.error("Assessment lock worker failed:", err?.message || err);
  }
};

setInterval(lockExpiredAssessments, 60 * 1000);

// ── Background Worker: auto-submit expired candidate assessments ──

const expirePendingAssessments = async () => {
  try {
    const expiredCandidates = await CandidateAssessment.find({
      status: "pending",
      expiresAt: { $lte: new Date() },
    }).populate({ path: "assessment", select: "job" });

    for (const ca of expiredCandidates) {
      const { score, total } = await gradeAssessment(ca);
      const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

      ca.score = score;
      ca.submittedAt = new Date();
      ca.status = "completed";
      ca.completionReason = "expired";
      await ca.save();

      await JobApplication.updateOne(
        { candidate: ca.candidate, job: ca.job },
        { assessmentScore: percentage, assessmentStatus: "completed" },
      );
    }
  } catch (err) {
    console.error("Assessment expiry worker failed:", err?.message || err);
  }
};

setInterval(expirePendingAssessments, 30 * 1000);

export default router;
